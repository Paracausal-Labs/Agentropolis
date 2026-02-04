import { NextRequest, NextResponse } from 'next/server'
import type { TokenLaunchProposal, TokenLaunchResult, DeliberationResult } from '@agentropolis/shared'
import { FEE_CONFIG } from '@/lib/clanker/constants'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 3

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

interface TokenLaunchRequestBody {
  id?: string
  agentId?: string
  agentName?: string
  tokenName: string
  tokenSymbol: string
  tokenDescription: string
  tokenImage?: string
  pairedToken?: string
  rewardRecipient: string
  rewardBps?: number
  vaultPercentage?: number
  lockupDays?: number
  reasoning?: string
  confidence?: number
  riskLevel?: 'low' | 'medium' | 'high'
  deliberation?: DeliberationResult
}

function validateProposal(body: unknown): body is TokenLaunchRequestBody {
  if (!body || typeof body !== 'object') return false
  const b = body as Record<string, unknown>
  return (
    typeof b.tokenName === 'string' &&
    typeof b.tokenSymbol === 'string' &&
    typeof b.tokenDescription === 'string' &&
    typeof b.rewardRecipient === 'string'
  )
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
          message: 'Guest mode is limited to 3 token launches per minute',
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

    const response = await handleLaunch(request)
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS))
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    return response
  }

  return handleLaunch(request)
}

async function handleLaunch(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    if (!validateProposal(body)) {
      return NextResponse.json(
        { error: 'Bad request', message: 'tokenName, tokenSymbol, tokenDescription, and rewardRecipient are required' },
        { status: 400 }
      )
    }

    const proposal: TokenLaunchProposal = {
      id: body.id || `launch-${Date.now()}`,
      agentId: body.agentId || 'council',
      agentName: body.agentName || 'Council',
      action: 'token_launch',
      strategyType: 'token_launch',
      tokenName: body.tokenName,
      tokenSymbol: body.tokenSymbol.toUpperCase(),
      tokenDescription: body.tokenDescription,
      tokenImage: body.tokenImage,
      pairedToken: body.pairedToken || 'WETH',
      rewardRecipient: body.rewardRecipient,
      rewardBps: body.rewardBps ?? FEE_CONFIG.AGENT_BPS,
      vaultPercentage: body.vaultPercentage,
      lockupDays: body.lockupDays,
      reasoning: body.reasoning || 'Token launch proposed by council',
      confidence: body.confidence ?? 75,
      riskLevel: body.riskLevel || 'medium',
      deliberation: body.deliberation,
    }

    const isMockMode = process.env.NEXT_PUBLIC_CLANKER_MOCK === 'true'
    
    if (isMockMode) {
      console.log('[API] Mock mode - simulating token launch for:', proposal.tokenName)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const chars = '0123456789abcdef'
      let tokenAddress = '0x'
      let txHash = '0x'
      for (let i = 0; i < 40; i++) tokenAddress += chars[Math.floor(Math.random() * chars.length)]
      for (let i = 0; i < 64; i++) txHash += chars[Math.floor(Math.random() * chars.length)]
      
      const result: TokenLaunchResult = {
        success: true,
        txHash,
        tokenAddress,
        clankerUrl: `https://clanker.world/clanker/${tokenAddress}`,
      }
      
      return NextResponse.json({ success: true, result, proposal })
    }

    return NextResponse.json({
      success: false,
      error: 'Real token launch requires wallet signature - use client-side launchToken()',
      proposal,
    }, { status: 400 })

  } catch (error) {
    console.error('[API] Token launch error:', error)

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Bad request', message: 'Invalid JSON body' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process token launch' },
      { status: 500 }
    )
  }
}
