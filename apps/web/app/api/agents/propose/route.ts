import { NextRequest, NextResponse } from 'next/server'
import { generateProposal, type ProposalRequest } from '@/lib/agents/orchestrator'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 10

const guestRateLimits = new Map<string, { count: number; resetAt: number }>()

function checkGuestRateLimit(sessionId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = guestRateLimits.get(sessionId)

  if (!entry || now >= entry.resetAt) {
    guestRateLimits.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count }
}

function cleanupExpiredLimits() {
  const now = Date.now()
  for (const [key, entry] of guestRateLimits.entries()) {
    if (now >= entry.resetAt) {
      guestRateLimits.delete(key)
    }
  }
}

export async function POST(request: NextRequest) {
  const guestSession = request.headers.get('X-Guest-Session')

  if (guestSession) {
    cleanupExpiredLimits()
    const { allowed, remaining } = checkGuestRateLimit(guestSession)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Guest mode is limited to 10 requests per minute' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      )
    }

    const response = await handleProposal(request)
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }

  return handleProposal(request)
}

async function handleProposal(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    if (!body.agentId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'agentId is required' },
        { status: 400 }
      )
    }

    const proposalRequest: ProposalRequest = {
      agentId: String(body.agentId),
      agentProfile: body.agentProfile,
      context: {
        balance: body.context?.balance,
        preferredTokens: body.context?.preferredTokens,
        riskLevel: body.context?.riskLevel,
      },
    }

    const proposal = await generateProposal(proposalRequest)

    return NextResponse.json(proposal)
  } catch (error) {
    console.error('[API] Error generating proposal:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to generate proposal' },
      { status: 500 }
    )
  }
}
