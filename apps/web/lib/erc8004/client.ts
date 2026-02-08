import 'server-only'

import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import type { AgentProfile } from '@agentropolis/shared'
import { lookup } from 'dns/promises'
import { isIP } from 'net'

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'

const IDENTITY_REGISTRY_ADDRESS = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const
const REPUTATION_REGISTRY_ADDRESS = '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const

const IDENTITY_REGISTRY_ABI = [
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
] as const

const REGISTER_ABI = [
  {
    inputs: [{ name: 'metadataURI', type: 'string' }],
    name: 'register',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

const OUR_AGENT_TOKEN_IDS = [298, 299, 300] as const

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

export async function queryERC8004Registry(
  config: ERC8004Config = {}
): Promise<AgentProfile[]> {
  const { mockMode = false, rpcUrl = BASE_SEPOLIA_RPC } = config

  if (mockMode) {
    console.log('[ERC-8004] Running in mock mode')
    return []
  }

  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl),
    })

    console.log('[ERC-8004] Querying Base Sepolia registry at', IDENTITY_REGISTRY_ADDRESS)

    const agents: AgentProfile[] = []
    const userIds = getUserAgentTokenIds()
    const allTokenIds = [...OUR_AGENT_TOKEN_IDS, ...userIds.filter(id => !OUR_AGENT_TOKEN_IDS.includes(id as 298 | 299 | 300))]

    for (const tokenId of allTokenIds) {
      try {
        const metadataUri = (await client.readContract({
          address: IDENTITY_REGISTRY_ADDRESS,
          abi: IDENTITY_REGISTRY_ABI,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        })) as string

        if (!metadataUri) continue

        const metadata = await fetchMetadata(metadataUri)
        const reputation = await queryReputation(rpcUrl, tokenId)

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
        }

        agents.push(agent)
        console.log(`[ERC-8004] Loaded agent #${tokenId}: ${agent.name}`)
      } catch (error) {
        console.warn(`[ERC-8004] Failed to query agent ${tokenId}:`, error)
        continue
      }
    }

    console.log(`[ERC-8004] Loaded ${agents.length} agents from on-chain registry`)
    return agents
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

export {
  IDENTITY_REGISTRY_ADDRESS,
  REGISTER_ABI,
}

export function addUserAgentTokenId(tokenId: number) {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem('agentropolis_user_agent_ids')
  const ids: number[] = stored ? JSON.parse(stored) : []
  if (!ids.includes(tokenId)) {
    ids.push(tokenId)
    localStorage.setItem('agentropolis_user_agent_ids', JSON.stringify(ids))
  }
}

export function getUserAgentTokenIds(): number[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('agentropolis_user_agent_ids')
  return stored ? JSON.parse(stored) : []
}
