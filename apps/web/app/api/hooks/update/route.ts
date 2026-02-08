import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { executeHookUpdate, validateHookParams, type HookUpdateParams } from '@/lib/uniswap/hook-updater'
import { getClientIp } from '@/lib/security/request'

const hookRateLimits = new Map<string, { count: number; resetAt: number }>()
const HOOK_RATE_LIMIT_WINDOW_MS = 60_000
const HOOK_RATE_LIMIT_MAX = 5

function checkHookRateLimit(caller: string): boolean {
  const key = `hook:${caller}`
  const now = Date.now()
  const entry = hookRateLimits.get(key)

  if (!entry || now >= entry.resetAt) {
    hookRateLimits.set(key, { count: 1, resetAt: now + HOOK_RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= HOOK_RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('x-hook-auth')
    const secret = process.env.HOOK_AUTH_SECRET
    if (process.env.NODE_ENV === 'production' && secret === 'agentropolis-hooks-secret') {
      console.error('[Hooks] Refusing to run with weak default HOOK_AUTH_SECRET in production')
      return NextResponse.json(
        { success: false, error: 'Server misconfigured' },
        { status: 500 }
      )
    }
    if (!authHeader || !secret || authHeader.length !== secret.length || !timingSafeEqual(Buffer.from(authHeader), Buffer.from(secret))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const ip = getClientIp({ headers: request.headers })
    if (!checkHookRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body: HookUpdateParams = await request.json()

    const validation = validateHookParams(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const result = await executeHookUpdate(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[Hooks] Update failed:', err)
    return NextResponse.json(
      { success: false, error: 'Hook update failed' },
      { status: 500 }
    )
  }
}
