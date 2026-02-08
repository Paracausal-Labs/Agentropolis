import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { normalize } from 'viem/ens'
import { isAddress } from 'viem'
import {
  runCouncilDeliberation,
  runTokenLaunchDeliberation,
  isTokenLaunchPrompt,
  extractHookParameters,
  updateHookParameters,
  validateExternalEndpoint,
  type CouncilRequest,
} from '@/lib/agents/council'
import { getClientIp, getValidatedUserAddress, readJsonWithLimit } from '@/lib/security/request'
import { checkRateLimit, cleanupExpiredRateLimits } from '@/lib/security/rateLimit'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5

export async function POST(request: NextRequest) {
  cleanupExpiredRateLimits()

  const guestSession = request.headers.get('X-Guest-Session')

  if (guestSession) {
    const rl = checkRateLimit(`guest:${guestSession}`, { windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX_REQUESTS })

    if (!rl.allowed) {
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
            'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

    const response = await handleDeliberation(request)
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
    response.headers.set('X-RateLimit-Remaining', String(rl.remaining))
    return response
  }

  const ip = getClientIp(request)
  const userAddress = getValidatedUserAddress(request.headers)
  const key = userAddress ? `auth:${userAddress}:${ip}` : `anon:${ip}`
  const rl = checkRateLimit(key, { windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX_REQUESTS })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    )
  }

  const response = await handleDeliberation(request)
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
  response.headers.set('X-RateLimit-Remaining', String(rl.remaining))
  return response
}

async function handleDeliberation(request: NextRequest): Promise<NextResponse> {
  try {
    const parsed = await readJsonWithLimit<Record<string, unknown>>(request, 25_000)
    if (!parsed.ok) {
      return NextResponse.json({ error: 'Bad request', message: parsed.error }, { status: parsed.status })
    }
    const body = parsed.value

    if (typeof body.userPrompt !== 'string' || !body.userPrompt.trim()) {
      return NextResponse.json(
        { error: 'Bad request', message: 'userPrompt is required' },
        { status: 400 }
      )
    }

    const userPrompt = body.userPrompt.slice(0, 2000)

    const contextRaw = body.context
    const contextObj =
      contextRaw && typeof contextRaw === 'object' ? (contextRaw as Record<string, unknown>) : {}

    const preferredTokensRaw = contextObj.preferredTokens
    const preferredTokens = Array.isArray(preferredTokensRaw)
      ? preferredTokensRaw.filter((t): t is string => typeof t === 'string').slice(0, 20)
      : ['USDC', 'WETH']

    const deployedAgentsRaw = body.deployedAgents
    const deployedAgents = Array.isArray(deployedAgentsRaw)
      ? deployedAgentsRaw
          .slice(0, 25)
          .map((a) => {
            const obj = a && typeof a === 'object' ? (a as Record<string, unknown>) : null
            return {
              id: String(obj?.id ?? '').slice(0, 64),
              name: String(obj?.name ?? '').slice(0, 64),
            }
          })
          .filter((a) => a.id && a.name)
      : undefined

    const councilRequest: CouncilRequest = {
      userPrompt,
      context: {
        balance: typeof contextObj.balance === 'string' ? contextObj.balance : '0.1 ETH',
        preferredTokens,
        riskLevel:
          typeof contextObj.riskLevel === 'string' && ['low', 'medium', 'high'].includes(contextObj.riskLevel)
            ? (contextObj.riskLevel as 'low' | 'medium' | 'high')
            : 'medium',
      },
      deployedAgents,
      agentEndpoint: typeof body.agentEndpoint === 'string' ? body.agentEndpoint.slice(0, 500) : undefined,
    }

    const walletAddressRaw = body.walletAddress
    const walletAddress =
      typeof walletAddressRaw === 'string' && isAddress(walletAddressRaw)
        ? (walletAddressRaw as `0x${string}`)
        : null

    if (walletAddress) {
      try {
        const ensClient = createPublicClient({ chain: sepolia, transport: http() })
        const ensName = await ensClient.getEnsName({ address: walletAddress })
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
      ? await runTokenLaunchDeliberation(councilRequest, walletAddress ?? '0x0000000000000000000000000000000000000000')
      : await runCouncilDeliberation(councilRequest)

    // Push council decisions to V4 hooks on-chain.
    const riskLevel = (councilRequest.context.riskLevel ?? 'medium') as 'low' | 'medium' | 'high'
    const hookParams = extractHookParameters(result.deliberation, riskLevel)
    const hookUpdate = await updateHookParameters(hookParams)

    return NextResponse.json({
      success: true,
      deliberation: result.deliberation,
      proposal: result.proposal,
      hookParameters: hookParams,
      hookUpdate,
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
