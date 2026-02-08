import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import type { AgentProfile } from '@agentropolis/shared'

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

async function fetchMetadata(uri: string): Promise<Record<string, unknown>> {
  try {
    const url = ipfsToGateway(uri)
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
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
