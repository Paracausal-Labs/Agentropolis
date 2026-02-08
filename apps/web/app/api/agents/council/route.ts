import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { normalize } from 'viem/ens'
import {
  runCouncilDeliberation,
  runTokenLaunchDeliberation,
  isTokenLaunchPrompt,
  extractHookParameters,
  updateHookParameters,
  validateExternalEndpoint,
  type CouncilRequest,
} from '@/lib/agents/council'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5

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

  const userAddress = request.headers.get('X-User-Address') || 'anon'
  const { allowed } = checkGuestRateLimit(`auth:${userAddress}`)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
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

    const userPrompt = String(body.userPrompt)
    const councilRequest: CouncilRequest = {
      userPrompt,
      context: {
        balance: body.context?.balance || '0.1 ETH',
        preferredTokens: body.context?.preferredTokens || ['USDC', 'WETH'],
        riskLevel: body.context?.riskLevel || 'medium',
      },
      deployedAgents: body.deployedAgents,
      agentEndpoint: body.agentEndpoint,
    }

    const walletAddress = body.walletAddress || '0x0000000000000000000000000000000000000000'

    if (body.walletAddress) {
      try {
        const ensClient = createPublicClient({ chain: sepolia, transport: http() })
        const ensName = await ensClient.getEnsName({ address: body.walletAddress as `0x${string}` })
        if (ensName) {
          const [endpoint, ensRisk, ensTokens] = await Promise.all([
            !councilRequest.agentEndpoint
              ? ensClient.getEnsText({ name: normalize(ensName), key: 'com.agentropolis.endpoint' }).catch(() => null)
              : Promise.resolve(null),
            ensClient.getEnsText({ name: normalize(ensName), key: 'com.agentropolis.risk' }).catch(() => null),
            ensClient.getEnsText({ name: normalize(ensName), key: 'com.agentropolis.tokens' }).catch(() => null),
          ])

          if (endpoint) {
            const validation = validateExternalEndpoint(endpoint)
            if (validation.valid) {
              console.log(`[API] Resolved ENS endpoint for ${ensName}: ${endpoint}`)
              councilRequest.agentEndpoint = endpoint
            } else {
              console.warn(`[API] ENS endpoint blocked for ${ensName}: ${validation.error}`)
            }
          }

          if (ensRisk && ['low', 'medium', 'high'].includes(ensRisk)) {
            console.log(`[API] ENS risk preference for ${ensName}: ${ensRisk}`)
            councilRequest.context.riskLevel = ensRisk as 'low' | 'medium' | 'high'
          }

          if (ensTokens) {
            const tokens = ensTokens.split(',').map(t => t.trim()).filter(Boolean)
            if (tokens.length > 0) {
              console.log(`[API] ENS token preferences for ${ensName}: ${tokens.join(', ')}`)
              councilRequest.context.preferredTokens = tokens
            }
          }
        }
      } catch (err) {
        console.warn('[API] ENS lookup failed:', err)
      }
    }

    if (councilRequest.agentEndpoint) {
      console.log('[API] External agent endpoint configured:', councilRequest.agentEndpoint)
    }
    
    const result = isTokenLaunchPrompt(userPrompt)
      ? await runTokenLaunchDeliberation(councilRequest, walletAddress)
      : await runCouncilDeliberation(councilRequest)

    // Fire-and-forget: push council decisions to V4 hooks on-chain
    const riskLevel = (councilRequest.context.riskLevel ?? 'medium') as 'low' | 'medium' | 'high'
    const hookParams = extractHookParameters(result.deliberation, riskLevel)
    updateHookParameters(hookParams).catch(err => console.error('[Council->Hooks] Hook update failed:', err))

    return NextResponse.json({
      success: true,
      deliberation: result.deliberation,
      proposal: result.proposal,
      hookParameters: hookParams,
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
