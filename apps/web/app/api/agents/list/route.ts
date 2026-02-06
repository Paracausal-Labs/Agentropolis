import { NextRequest, NextResponse } from 'next/server'
import { getAgents } from '@/lib/erc8004'
import type { AgentProfile } from '@agentropolis/shared'

export const dynamic = 'force-dynamic'

interface CacheEntry {
  data: AgentProfile[]
  timestamp: number
}

let agentCache: CacheEntry | null = null
const CACHE_TTL_MS = 5 * 60 * 1000

function isCacheValid(entry: CacheEntry | null, mockMode: boolean): boolean {
  if (!entry || mockMode) return false
  return Date.now() - entry.timestamp < CACHE_TTL_MS
}

function getCachedAgents(limit: number, mockMode: boolean): NextResponse | null {
  if (!isCacheValid(agentCache, mockMode)) return null
  console.log('[API] Returning cached agents')
  const agents = agentCache!.data.slice(0, limit)
  return NextResponse.json(agents, {
    headers: {
      'X-Cache': 'HIT',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

async function getFreshAgents(limit: number, mockMode: boolean): Promise<NextResponse> {
  console.log('[API] Fetching fresh agents from ERC-8004')
  let agents = await getAgents({ mockMode })
  
  if (agents.length === 0 && !mockMode) {
    console.log('[API] Registry returned empty, falling back to mocks')
    const { getMockAgents } = await import('@/lib/erc8004')
    agents = getMockAgents()
  }
  
  agentCache = { data: agents, timestamp: Date.now() }
  const result = agents.slice(0, limit)
  return NextResponse.json(result, {
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

async function getFallbackAgents(limit: number): Promise<NextResponse> {
  const { getMockAgents } = await import('@/lib/erc8004')
  const mockAgents = getMockAgents()
  const result = mockAgents.slice(0, limit)
  return NextResponse.json(result, {
    status: 200,
    headers: {
      'X-Cache': 'FALLBACK',
      'Cache-Control': 'public, max-age=60',
    },
  })
}

/**
 * GET /api/agents/list
 * 
 * Returns a list of agent profiles from ERC-8004 registry with 5-minute caching.
 * 
 * Query parameters:
 * - limit: number (default 10, max 50) - max agents to return
 * - mock: boolean (default false) - force mock agents
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const parsedLimit = parseInt(searchParams.get('limit') || '10', 10)
    const limit = Math.min(Number.isNaN(parsedLimit) ? 10 : parsedLimit, 50)
    const mockParam = searchParams.get('mock')
    const mockMode =
      mockParam !== null ? mockParam === 'true' : process.env.ERC8004_MOCK === 'true'

    const cachedResponse = getCachedAgents(limit, mockMode)
    if (cachedResponse) return cachedResponse

    return await getFreshAgents(limit, mockMode)
  } catch (error) {
    console.error('[API] Error fetching agents:', error)
    try {
      const parsedLimit = parseInt(new URL(request.url).searchParams.get('limit') || '10')
      const limit = Math.min(Number.isNaN(parsedLimit) ? 10 : parsedLimit, 50)
      return await getFallbackAgents(limit)
    } catch (fallbackError) {
      console.error('[API] Fallback to mock agents failed:', fallbackError)
      return NextResponse.json(
        { error: 'Failed to fetch agents' },
        { status: 500 }
      )
    }
  }
}
