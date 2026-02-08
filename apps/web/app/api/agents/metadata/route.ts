import { NextRequest, NextResponse } from 'next/server'

function getStore(): Map<string, Record<string, unknown>> {
  if (typeof globalThis !== 'undefined' && !(globalThis as Record<string, unknown>).__agentMetadata) {
    ;(globalThis as Record<string, unknown>).__agentMetadata = new Map<string, Record<string, unknown>>()
  }
  return (globalThis as Record<string, unknown>).__agentMetadata as Map<string, Record<string, unknown>>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tokenId, metadata } = body

    if (!tokenId || !metadata || !metadata.name) {
      return NextResponse.json({ error: 'Missing tokenId or metadata.name' }, { status: 400 })
    }

    const store = getStore()
    store.set(String(tokenId), metadata)

    return NextResponse.json({ success: true, tokenId })
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

  if (!tokenId) {
    return NextResponse.json({ error: 'Missing tokenId query param' }, { status: 400 })
  }

  const store = getStore()
  const metadata = store.get(tokenId)

  if (!metadata) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(metadata)
}
