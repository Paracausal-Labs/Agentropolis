import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, readJsonWithLimit } from '@/lib/security/request'
import { checkRateLimit, cleanupExpiredRateLimits } from '@/lib/security/rateLimit'

function getStore(): Map<string, Record<string, unknown>> {
  if (typeof globalThis !== 'undefined' && !(globalThis as Record<string, unknown>).__agentMetadata) {
    ;(globalThis as Record<string, unknown>).__agentMetadata = new Map<string, Record<string, unknown>>()
  }
  return (globalThis as Record<string, unknown>).__agentMetadata as Map<string, Record<string, unknown>>
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.AGENT_METADATA_ALLOW_POST !== 'true') {
      return NextResponse.json(
        { error: 'Metadata writes are disabled' },
        { status: 403 }
      )
    }

    cleanupExpiredRateLimits()
    const ip = getClientIp(request)
    const rl = checkRateLimit(`metadata:${ip}`, { windowMs: 60_000, max: 30 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const parsed = await readJsonWithLimit<{ tokenId?: unknown; metadata?: unknown }>(request, 8_000)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status })
    }

    const { tokenId, metadata } = parsed.value

    const tokenIdStr = typeof tokenId === 'number' ? String(tokenId) : typeof tokenId === 'string' ? tokenId : ''
    if (!/^\d{1,30}$/.test(tokenIdStr)) {
      return NextResponse.json({ error: 'Invalid tokenId' }, { status: 400 })
    }

    if (!metadata || typeof metadata !== 'object') {
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    const m = metadata as Record<string, unknown>
    const name = typeof m.name === 'string' ? m.name.slice(0, 64) : ''
    if (!name) {
      return NextResponse.json({ error: 'Missing metadata.name' }, { status: 400 })
    }

    // Keep only a small allowlist to limit abuse.
    const safeMetadata: Record<string, unknown> = {
      name,
      description: typeof m.description === 'string' ? m.description.slice(0, 512) : undefined,
      image: typeof m.image === 'string' ? m.image.slice(0, 2048) : undefined,
      strategy: typeof m.strategy === 'string' ? m.strategy.slice(0, 32) : undefined,
      riskTolerance: typeof m.riskTolerance === 'string' ? m.riskTolerance.slice(0, 32) : undefined,
      serviceEndpoint: typeof m.serviceEndpoint === 'string' ? m.serviceEndpoint.slice(0, 512) : undefined,
      endpoint: typeof m.endpoint === 'string' ? m.endpoint.slice(0, 512) : undefined,
      services: Array.isArray(m.services) ? m.services.slice(0, 10) : undefined,
    }

    const store = getStore()
    store.set(tokenIdStr, safeMetadata)

    return NextResponse.json({ success: true, tokenId: tokenIdStr })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenId = searchParams.get('tokenId')

  if (!tokenId || !/^\d{1,30}$/.test(tokenId)) {
    return NextResponse.json({ error: 'Missing tokenId query param' }, { status: 400 })
  }

  const store = getStore()
  const metadata = store.get(tokenId)

  if (!metadata) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(metadata)
}
