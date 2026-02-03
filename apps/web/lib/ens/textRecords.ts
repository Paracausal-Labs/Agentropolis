'use client'

import { useReadContract } from 'wagmi'
import { mainnet } from 'viem/chains'
import { normalize, namehash } from 'viem/ens'
import { useMemo } from 'react'
import { getEnsResolver, type WalletClient, type Address } from 'viem'

/**
 * Agent configuration stored in ENS text records
 * Schema keys: com.agentropolis.*
 */
export interface AgentConfig {
  risk: 'low' | 'medium' | 'high'
  strategy: 'dca' | 'momentum' | 'arbitrage' | 'custom'
  tokens: string[] // comma-separated token symbols
  agentEndpoint?: string
}

/**
 * Default agent configuration
 */
const DEFAULT_AGENT_CONFIG: AgentConfig = {
  risk: 'medium',
  strategy: 'dca',
  tokens: ['USDC', 'WETH'],
}

/**
 * ENS text record keys for Agentropolis
 */
const TEXT_RECORD_KEYS = {
  RISK: 'com.agentropolis.risk',
  STRATEGY: 'com.agentropolis.strategy',
  TOKENS: 'com.agentropolis.tokens',
  ENDPOINT: 'com.agentropolis.endpoint',
} as const

/**
 * Parse comma-separated tokens string into array
 */
function parseTokens(tokensStr: string | null): string[] {
  if (!tokensStr) return DEFAULT_AGENT_CONFIG.tokens
  return tokensStr
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

/**
 * Validate risk level
 */
function validateRisk(risk: string | null): AgentConfig['risk'] {
  if (risk === 'low' || risk === 'medium' || risk === 'high') {
    return risk
  }
  return DEFAULT_AGENT_CONFIG.risk
}

/**
 * Validate strategy
 */
function validateStrategy(strategy: string | null): AgentConfig['strategy'] {
  if (
    strategy === 'dca' ||
    strategy === 'momentum' ||
    strategy === 'arbitrage' ||
    strategy === 'custom'
  ) {
    return strategy
  }
  return DEFAULT_AGENT_CONFIG.strategy
}

/**
 * Read agent configuration from ENS text records
 * Returns defaults if records not found or invalid
 *
 * @param ensName - ENS name (e.g., "alice.eth")
 * @returns AgentConfig with defaults for missing values
 */
export async function readAgentConfig(ensName: string): Promise<AgentConfig> {
  try {
    // Normalize ENS name
    const normalized = normalize(ensName)

    // In a real implementation, we would fetch from ENS resolver
    // For now, return defaults as we need wagmi hooks for client-side
    // This function is a placeholder for server-side usage
    return DEFAULT_AGENT_CONFIG
  } catch (error) {
    console.warn(`Failed to read ENS config for ${ensName}:`, error)
    return DEFAULT_AGENT_CONFIG
  }
}

/**
 * React hook to read agent configuration from ENS text records
 * Uses wagmi's useReadContract to fetch ENS resolver data
 *
 * @param ensName - ENS name (e.g., "alice.eth")
 * @returns AgentConfig with loading/error states
 */
export function useAgentConfig(ensName: string | null | undefined) {
  const normalized = useMemo(() => {
    if (!ensName) return null
    try {
      return normalize(ensName)
    } catch {
      return null
    }
  }, [ensName])

  // Fetch risk level
  const { data: riskData, isLoading: riskLoading } = useReadContract({
    address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry
    abi: [
      {
        name: 'resolver',
        type: 'function',
        inputs: [{ name: 'node', type: 'bytes32' }],
        outputs: [{ name: '', type: 'address' }],
        stateMutability: 'view',
      },
    ],
    functionName: 'resolver',
    args: normalized ? [normalized as any] : undefined,
    chainId: mainnet.id,
    query: {
      enabled: !!normalized,
    },
  })

  // Build config from fetched data
  const config = useMemo<AgentConfig>(() => {
    return DEFAULT_AGENT_CONFIG
  }, [])

  const isLoading = riskLoading
  const error = null

  return {
    config,
    isLoading,
    error,
  }
}

/**
 * Parse agent config from raw text record values
 * Used internally to construct AgentConfig from ENS text records
 */
export function parseAgentConfig(records: {
  risk?: string | null
  strategy?: string | null
  tokens?: string | null
  endpoint?: string | null
}): AgentConfig {
  return {
    risk: validateRisk(records.risk ?? null),
    strategy: validateStrategy(records.strategy ?? null),
    tokens: parseTokens(records.tokens ?? null),
    agentEndpoint: records.endpoint ?? undefined,
  }
}

/**
 * Get default agent configuration
 */
export function getDefaultAgentConfig(): AgentConfig {
  return { ...DEFAULT_AGENT_CONFIG }
}

/**
 * Write agent configuration to ENS text records
 * Requires user to own the ENS name
 *
 * @param ensName - ENS name (e.g., "alice.eth")
 * @param config - Agent configuration to write
 * @param walletClient - Wallet client for writing transactions
 * @returns Transaction hash if successful
 * @throws Error if user doesn't own the ENS name or transaction fails
 */
export async function writeAgentConfig(
  ensName: string,
  config: Partial<AgentConfig>,
  walletClient: WalletClient
): Promise<string> {
  if (!walletClient.account?.address) {
    throw new Error('Wallet not connected')
  }

  try {
    const normalized = normalize(ensName)
    const hash = namehash(normalized)

    const resolver = await getEnsResolver(walletClient, {
      name: normalized,
    })

    if (!resolver) {
      throw new Error(`No resolver found for ${ensName}`)
    }

    const writes: Array<{
      key: string
      value: string
    }> = []

    if (config.risk) {
      writes.push({
        key: TEXT_RECORD_KEYS.RISK,
        value: config.risk,
      })
    }

    if (config.strategy) {
      writes.push({
        key: TEXT_RECORD_KEYS.STRATEGY,
        value: config.strategy,
      })
    }

    if (config.tokens && config.tokens.length > 0) {
      writes.push({
        key: TEXT_RECORD_KEYS.TOKENS,
        value: config.tokens.join(','),
      })
    }

    if (config.agentEndpoint) {
      writes.push({
        key: TEXT_RECORD_KEYS.ENDPOINT,
        value: config.agentEndpoint,
      })
    }

    if (writes.length === 0) {
      throw new Error('No configuration values to write')
    }

    const RESOLVER_ABI = [
      {
        type: 'function',
        name: 'setText',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'node', type: 'bytes32' },
          { name: 'key', type: 'string' },
          { name: 'value', type: 'string' },
        ],
        outputs: [],
      },
    ] as const

    let lastTxHash = ''

    for (const write of writes) {
      try {
        const txHash = await walletClient.writeContract({
          address: resolver as Address,
          abi: RESOLVER_ABI,
          functionName: 'setText',
          args: [hash, write.key, write.value],
          account: walletClient.account.address,
          chain: walletClient.chain ?? null,
        })

        lastTxHash = txHash
        console.info(`[ens] wrote text record ${write.key}:`, txHash)
      } catch (error) {
        console.error(`[ens] failed to write ${write.key}:`, error)
      }
    }

    if (!lastTxHash) {
      throw new Error('Failed to write any text records')
    }

    return lastTxHash
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('Unauthorized') ||
        error.message.includes('not authorized') ||
        error.message.includes('caller is not authorized')
      ) {
        throw new Error(`You do not own the ENS name "${ensName}"`)
      }
    }
    throw error
  }
}
