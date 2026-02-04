import { NextRequest, NextResponse } from 'next/server'
import { runCouncilDeliberation, type CouncilRequest } from '@/lib/agents/council'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5 // Lower limit for council (more expensive)

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
        {
          error: 'Rate limit exceeded',
          message: 'Guest mode is limited to 5 council deliberations per minute',
        },
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

    const response = await handleDeliberation(request)
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }

  return handleDeliberation(request)
}

async function handleDeliberation(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    if (!body.userPrompt) {
      return NextResponse.json(
        { error: 'Bad request', message: 'userPrompt is required' },
        { status: 400 }
      )
    }

    const councilRequest: CouncilRequest = {
      userPrompt: String(body.userPrompt),
      context: {
        balance: body.context?.balance || '0.1 ETH',
        preferredTokens: body.context?.preferredTokens || ['USDC', 'WETH'],
        riskLevel: body.context?.riskLevel || 'medium',
      },
      deployedAgents: body.deployedAgents,
    }

    const result = await runCouncilDeliberation(councilRequest)

    return NextResponse.json({
      success: true,
      deliberation: result.deliberation,
      proposal: result.proposal,
    })
  } catch (error) {
    console.error('[API] Council deliberation error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Bad request', message: 'Invalid JSON body' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to run council deliberation' },
      { status: 500 }
    )
  }
}
