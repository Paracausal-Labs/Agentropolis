import 'server-only'

import { createPublicClient, http, parseAbiItem } from 'viem'
import { baseSepolia } from 'viem/chains'
import type { AgentProfile } from '@agentropolis/shared'
import { lookup } from 'dns/promises'
import { isIP } from 'net'

const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC_URL || 'https://base-sepolia-rpc.publicnode.com'

const IDENTITY_REGISTRY_ADDRESS = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const
const REPUTATION_REGISTRY_ADDRESS = '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const

const IDENTITY_REGISTRY_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'agentId', type: 'uint256' }],
    name: 'getAgentWallet',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'metadataKey', type: 'string' },
    ],
    name: 'getMetadata',
    outputs: [{ name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const REGISTERED_EVENT = parseAbiItem(
  'event Registered(uint256 indexed agentId, string agentURI, address indexed owner)'
)

const REPUTATION_REGISTRY_ABI = [
  {
    inputs: [{ name: 'agentId', type: 'uint256' }],
    name: 'getSummary',
    outputs: [
      { name: 'totalFeedback', type: 'uint256' },
      { name: 'averageValue', type: 'int128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export interface ERC8004Config {
  mockMode?: boolean
  rpcUrl?: string
}

export const ERC8004_CHAIN_ID = 84532
export const ERC8004_REGISTRY_ADDRESS = IDENTITY_REGISTRY_ADDRESS

function ipfsToGateway(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '')
    return `https://ipfs.io/ipfs/${hash}`
  }
  return uri
}

function isPrivateOrReservedIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const parts = ip.split('.').map((p) => Number(p))
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return true
    const [a, b] = parts
    if (a === 0) return true
    if (a === 10) return true
    if (a === 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true
    if (a >= 224) return true
    return false
  }
  if (isIP(ip) === 6) {
    const lower = ip.toLowerCase()
    if (lower === '::' || lower === '::1') return true
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true
    if (lower.startsWith('2001:db8:')) return true
    return false
  }
  return true
}

async function hostnameResolvesPublic(hostname: string): Promise<boolean> {
  if (isIP(hostname)) return !isPrivateOrReservedIp(hostname)
  try {
    const results = await lookup(hostname, { all: true, verbatim: true })
    if (!results || results.length === 0) return false
    return results.every((r) => !isPrivateOrReservedIp(r.address))
  } catch {
    return false
  }
}

function parseDataJsonUri(uri: string): Record<string, unknown> | null {
  if (!uri.startsWith('data:application/json')) return null
  const comma = uri.indexOf(',')
  if (comma === -1) return null

  const meta = uri.slice(0, comma)
  const data = uri.slice(comma + 1)

  try {
    const json = meta.includes(';base64')
      ? Buffer.from(data, 'base64').toString('utf8')
      : decodeURIComponent(data)
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

async function fetchMetadata(uri: string): Promise<Record<string, unknown>> {
  try {
    const dataUri = parseDataJsonUri(uri)
    if (dataUri) return dataUri

    const url = ipfsToGateway(uri)
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:') {
      throw new Error('Only https:// metadata URIs are allowed')
    }
    if (parsed.username || parsed.password) {
      throw new Error('Credentialed metadata URIs are not allowed')
    }

    const ok = await hostnameResolvesPublic(parsed.hostname.toLowerCase())
    if (!ok) throw new Error('Metadata URI resolves to a private/reserved IP')

    const response = await fetch(url, { signal: AbortSignal.timeout(5000), redirect: 'error' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.warn(`Failed to fetch metadata from ${uri}:`, error)
    return {}
  }
}

async function queryReputation(
  rpcUrl: string,
  agentId: number
): Promise<number | undefined> {
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    })
    
    const result = await client.readContract({
      address: REPUTATION_REGISTRY_ADDRESS,
      abi: REPUTATION_REGISTRY_ABI,
      functionName: 'getSummary',
      args: [BigInt(agentId)],
    })

    const [totalFeedback, averageValue] = result as [bigint, bigint]

    if (totalFeedback === 0n) return undefined

    const normalizedScore = Math.min(100, Math.max(0, Number(averageValue) + 50))
    return normalizedScore
  } catch {
    return undefined
  }
}

async function mapLimit<T, U>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<U>
): Promise<U[]> {
  const results: U[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (true) {
      const i = nextIndex++
      if (i >= items.length) return
      results[i] = await fn(items[i], i)
    }
  }

  const workers = Array.from({ length: Math.max(1, limit) }, () => worker())
  await Promise.all(workers)
  return results
}

async function discoverRegisteredAgentIds(
  rpcUrl: string
): Promise<{ agentIds: number[]; agentUriById: Map<number, string> }> {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  })

  const blockNumber = await client.getBlockNumber()
  const fromBlockFallback = blockNumber > 250_000n ? blockNumber - 250_000n : 0n

  let logs:
    | {
        args: {
          agentId: bigint
          agentURI: string
          owner: `0x${string}`
        }
      }[]
    | undefined

  try {
    logs = (await client.getLogs({
      address: IDENTITY_REGISTRY_ADDRESS,
      event: REGISTERED_EVENT,
      fromBlock: 0n,
      toBlock: 'latest',
    })) as typeof logs
  } catch (error) {
    console.warn(
      '[ERC-8004] getLogs full-range failed; retrying recent range:',
      error
    )
    logs = (await client.getLogs({
      address: IDENTITY_REGISTRY_ADDRESS,
      event: REGISTERED_EVENT,
      fromBlock: fromBlockFallback,
      toBlock: 'latest',
    })) as typeof logs
  }

  const agentUriById = new Map<number, string>()
  if (!logs) return { agentIds: [], agentUriById }
  for (const log of logs) {
    const id = Number(log.args.agentId)
    if (!Number.isFinite(id) || id < 0) continue
    agentUriById.set(id, log.args.agentURI)
  }

  const agentIds = [...agentUriById.keys()].sort((a, b) => a - b)
  return { agentIds, agentUriById }
}

/**
 * Fallback discovery: scan token IDs by trying ownerOf().
 * Used when getLogs returns 0 results (e.g. some RPC providers don't index custom events).
 * Scans backwards from a high-water mark to find valid tokens.
 */
async function discoverAgentIdsByScan(
  rpcUrl: string
): Promise<number[]> {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  })

  // Binary-search for the highest minted token ID
  // Start with a reasonable upper bound and scan backwards
  let high = 500
  let low = 0

  // First find an upper bound that doesn't exist
  while (true) {
    try {
      await client.readContract({
        address: IDENTITY_REGISTRY_ADDRESS,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'ownerOf',
        args: [BigInt(high)],
      })
      high *= 2 // token exists, double the bound
      if (high > 10000) break // safety cap
    } catch {
      break // token doesn't exist, this is our upper bound
    }
  }

  // Binary search for the last valid token ID
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2)
    try {
      await client.readContract({
        address: IDENTITY_REGISTRY_ADDRESS,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'ownerOf',
        args: [BigInt(mid)],
      })
      low = mid
    } catch {
      high = mid - 1
    }
  }

  const lastId = low
  if (lastId <= 0) return []

  // Return the last N agent IDs (most recent registrations are most interesting)
  const MAX_AGENTS = 50
  const startId = Math.max(0, lastId - MAX_AGENTS + 1)
  const ids: number[] = []
  for (let i = startId; i <= lastId; i++) {
    ids.push(i)
  }

  console.log(`[ERC-8004] Scan fallback: found tokens ${startId}..${lastId}`)
  return ids
}

export async function queryERC8004Registry(
  config: ERC8004Config = {}
): Promise<AgentProfile[]> {
  const { mockMode = false, rpcUrl = BASE_SEPOLIA_RPC } = config

  if (mockMode) {
    console.log('[ERC-8004] Running in mock mode')
    return []
  }

  try {
    console.log('[ERC-8004] Querying Base Sepolia registry at', IDENTITY_REGISTRY_ADDRESS)

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    })

    let agentIds: number[]
    let agentUriById = new Map<number, string>()

    // Try event-based discovery first
    try {
      const eventResult = await discoverRegisteredAgentIds(rpcUrl)
      agentIds = eventResult.agentIds
      agentUriById = eventResult.agentUriById
    } catch {
      console.warn('[ERC-8004] Event discovery failed, using scan fallback')
      agentIds = []
    }

    // Fallback: scan by ownerOf if events returned nothing
    if (agentIds.length === 0) {
      console.log('[ERC-8004] No events found, falling back to ownerOf scan')
      agentIds = await discoverAgentIdsByScan(rpcUrl)
    }

    if (agentIds.length === 0) {
      console.log('[ERC-8004] No agents discovered')
      return []
    }

    const agents = await mapLimit(agentIds, 6, async (tokenId) => {
      try {
        let metadataUri: string | undefined

        try {
          metadataUri = (await publicClient.readContract({
            address: IDENTITY_REGISTRY_ADDRESS,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          })) as string
        } catch {
          metadataUri = agentUriById.get(tokenId)
        }

        if (!metadataUri) return null

        const [metadata, reputation, agentWallet] = await Promise.all([
          fetchMetadata(metadataUri),
          queryReputation(rpcUrl, tokenId),
          publicClient
            .readContract({
              address: IDENTITY_REGISTRY_ADDRESS,
              abi: IDENTITY_REGISTRY_ABI,
              functionName: 'getAgentWallet',
              args: [BigInt(tokenId)],
            })
            .then((a) => a as string)
            .catch(() => undefined),
        ])

        const agent: AgentProfile = {
          agentId: tokenId,
          name: (metadata.name as string) || `Agent ${tokenId}`,
          description: (metadata.description as string) || 'No description',
          image: (metadata.image as string) || 'https://via.placeholder.com/200',
          strategy: (metadata.strategy as AgentProfile['strategy']) || 'momentum',
          riskTolerance: (metadata.riskTolerance as AgentProfile['riskTolerance']) || 'moderate',
          services: (metadata.services as AgentProfile['services']) || [],
          reputation,
          registrySource: 'erc8004',
          serviceEndpoint: (metadata.serviceEndpoint as string) || (metadata.endpoint as string),
          agentWallet: agentWallet,
        }

        console.log(`[ERC-8004] Loaded agent #${tokenId}: ${agent.name}`)
        return agent
      } catch (error) {
        console.warn(`[ERC-8004] Failed to query agent ${tokenId}:`, error)
        return null
      }
    })

    const filtered = agents.filter((a): a is AgentProfile => a !== null)
    console.log(`[ERC-8004] Loaded ${filtered.length} agents from on-chain registry`)
    return filtered
  } catch (error) {
    console.error('[ERC-8004] Registry query failed:', error)
    throw error
  }
}

export async function getAgents(
  config: ERC8004Config = {}
): Promise<AgentProfile[]> {
  const { mockMode = process.env.ERC8004_MOCK === 'true' } = config

  if (mockMode) {
    const { getMockAgents } = await import('./mocks')
    return getMockAgents()
  }

  try {
    const agents = await queryERC8004Registry(config)
    if (agents.length === 0) {
      console.log('[ERC-8004] Registry empty, using mock agents')
      const { getMockAgents } = await import('./mocks')
      return getMockAgents()
    }
    return agents
  } catch {
    console.warn('[ERC-8004] Falling back to mock agents due to query failure')
    const { getMockAgents } = await import('./mocks')
    return getMockAgents()
  }
}

export function get8004ScanUrl(agentId: number): string {
  return `https://www.8004scan.io/agent/${ERC8004_CHAIN_ID}/${IDENTITY_REGISTRY_ADDRESS}/${agentId}`
}

export { IDENTITY_REGISTRY_ADDRESS }
