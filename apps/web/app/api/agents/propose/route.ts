import { NextRequest, NextResponse } from 'next/server'
import { generateProposal, type ProposalRequest } from '@/lib/agents/orchestrator'
import { getClientIp, getValidatedUserAddress } from '@/lib/security/request'

const RATE_LIMIT_WINDOW_MS = 60_000
const GUEST_RATE_LIMIT_MAX = 10
const AUTH_RATE_LIMIT_MAX = 50

const rateLimits = new Map<string, { count: number; resetAt: number }>()
// Async lock to prevent race conditions on concurrent requests
// TODO: Replace with Redis or Vercel KV for production (in-memory doesn't work across serverless instances)
const rateLimitLocks = new Map<string, Promise<void>>()

async function checkRateLimit(key: string, maxRequests: number): Promise<{ allowed: boolean; remaining: number }> {
  // Wait for any existing lock on this key
  const existingLock = rateLimitLocks.get(key)
  if (existingLock) {
    await existingLock
  }

  // Create a new lock
  let releaseLock: () => void
  const lock = new Promise<void>((resolve) => {
    releaseLock = resolve
  })
  rateLimitLocks.set(key, lock)

  try {
    const now = Date.now()
    const entry = rateLimits.get(key)

    if (!entry || now >= entry.resetAt) {
      rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
      return { allowed: true, remaining: maxRequests - 1 }
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0 }
    }

    entry.count++
    return { allowed: true, remaining: maxRequests - entry.count }
  } finally {
    releaseLock!()
    rateLimitLocks.delete(key)
  }
}

function cleanupExpiredLimits() {
  const now = Date.now()
  for (const [key, entry] of rateLimits.entries()) {
    if (now >= entry.resetAt) {
      rateLimits.delete(key)
    }
  }
}

export async function POST(request: NextRequest) {
  cleanupExpiredLimits()

  const guestSession = request.headers.get('X-Guest-Session')

  if (guestSession) {
    const { allowed, remaining } = await checkRateLimit(`guest:${guestSession}`, GUEST_RATE_LIMIT_MAX)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Guest mode is limited to 10 requests per minute' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(GUEST_RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'Retry-After': '60',
          },
        }
      )
    }

    const response = await handleProposal(request)
    response.headers.set('X-RateLimit-Limit', String(GUEST_RATE_LIMIT_MAX))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }

  // Rate limit authenticated users too (higher limit)
  const ip = getClientIp(request)
  const userAddress = getValidatedUserAddress(request.headers)
  const key = userAddress ? `auth:${userAddress}:${ip}` : `anon:${ip}`
  const { allowed } = await checkRateLimit(key, AUTH_RATE_LIMIT_MAX)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
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
