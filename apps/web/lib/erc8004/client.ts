import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { AgentProfile } from '@agentropolis/shared'

// ERC-8004 Identity Registry address on Ethereum mainnet
const REGISTRY_ADDRESS = '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432' as const

// Minimal ERC-8004 registry ABI for querying agent metadata
const REGISTRY_ABI = [
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

export interface ERC8004Config {
  mockMode?: boolean
  rpcUrl?: string
}

/**
 * Convert IPFS URI to gateway URL
 * e.g., ipfs://QmXxxx -> https://ipfs.io/ipfs/QmXxxx
 */
function ipfsToGateway(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '')
    return `https://ipfs.io/ipfs/${hash}`
  }
  return uri
}

/**
 * Fetch and parse metadata from URI (IPFS or HTTP)
 */
async function fetchMetadata(uri: string): Promise<Record<string, any>> {
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

/**
 * Query ERC-8004 registry for agent profiles
 */
export async function queryERC8004Registry(
  config: ERC8004Config = {}
): Promise<AgentProfile[]> {
  const { mockMode = false, rpcUrl } = config

  if (mockMode) {
    console.log('[ERC-8004] Running in mock mode')
    return []
  }

  try {
    const client = createPublicClient({
      chain: mainnet,
      transport: http(rpcUrl),
    })

    console.log('[ERC-8004] Querying registry at', REGISTRY_ADDRESS)

    // Try to get total agents count
    let totalAgents = 3n // Default to querying first 3
    try {
      totalAgents = (await client.readContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: 'totalAgents',
      })) as bigint
      console.log(`[ERC-8004] Found ${totalAgents} agents in registry`)
    } catch (error) {
      console.warn('[ERC-8004] Could not query totalAgents, using default limit of 3')
    }

    const agents: AgentProfile[] = []
    const limit = Math.min(Number(totalAgents), 10) // Query up to 10 agents

    for (let i = 0; i < limit; i++) {
      try {
        const metadataUri = (await client.readContract({
          address: REGISTRY_ADDRESS,
          abi: REGISTRY_ABI,
          functionName: 'getMetadataURI',
          args: [BigInt(i)],
        })) as string

        if (!metadataUri) continue

        const metadata = await fetchMetadata(metadataUri)

        // Map metadata to AgentProfile
        const agent: AgentProfile = {
          agentId: i,
          name: metadata.name || `Agent ${i}`,
          description: metadata.description || 'No description',
          image: metadata.image || 'https://via.placeholder.com/200',
          strategy: metadata.strategy || 'momentum',
          riskTolerance: metadata.riskTolerance || 'moderate',
          services: metadata.services || [],
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

/**
 * Get agents with fallback to mocks
 */
export async function getAgents(
  config: ERC8004Config = {}
): Promise<AgentProfile[]> {
  const { mockMode = process.env.ERC8004_MOCK === 'true' } = config

  if (mockMode) {
    const { getMockAgents } = await import('./mocks')
    return getMockAgents()
  }

  try {
    return await queryERC8004Registry(config)
  } catch (error) {
    console.warn('[ERC-8004] Falling back to mock agents due to query failure')
    const { getMockAgents } = await import('./mocks')
    return getMockAgents()
  }
}
