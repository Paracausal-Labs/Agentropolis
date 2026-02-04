import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import type { AgentProfile } from '@agentropolis/shared'

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'

const IDENTITY_REGISTRY_ADDRESS = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const
const REPUTATION_REGISTRY_ADDRESS = '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const

const IDENTITY_REGISTRY_ABI = [
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'getMetadataURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAgents',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

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

    let totalAgents = 3n
    try {
      totalAgents = (await client.readContract({
        address: IDENTITY_REGISTRY_ADDRESS,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'totalAgents',
      })) as bigint
      console.log(`[ERC-8004] Found ${totalAgents} agents in registry`)
    } catch {
      console.warn('[ERC-8004] Could not query totalAgents, using default limit of 3')
    }

    const agents: AgentProfile[] = []
    const limit = Math.min(Number(totalAgents), 10)

    for (let i = 0; i < limit; i++) {
      try {
        const metadataUri = (await client.readContract({
          address: IDENTITY_REGISTRY_ADDRESS,
          abi: IDENTITY_REGISTRY_ABI,
          functionName: 'getMetadataURI',
          args: [BigInt(i)],
        })) as string

        if (!metadataUri) continue

        const metadata = await fetchMetadata(metadataUri)
        const reputation = await queryReputation(rpcUrl, i)

        const agent: AgentProfile = {
          agentId: i,
          name: (metadata.name as string) || `Agent ${i}`,
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
      } catch (error) {
        console.warn(`[ERC-8004] Failed to query agent ${i}:`, error)
        continue
      }
    }

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
