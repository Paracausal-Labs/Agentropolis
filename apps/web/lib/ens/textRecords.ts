'use client'

import { useQuery } from '@tanstack/react-query'
import { sepolia } from 'viem/chains'
import { normalize, namehash } from 'viem/ens'
import { createPublicClient, http } from 'viem'
import { useMemo } from 'react'
import type { WalletClient, Address } from 'viem'

const SEPOLIA_PUBLIC_RESOLVER = '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5' as Address

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

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

export async function readAgentConfig(ensName: string): Promise<AgentConfig> {
  try {
    const normalized = normalize(ensName)
    
    const [risk, strategy, tokens, endpoint] = await Promise.all([
      sepoliaClient.getEnsText({ name: normalized, key: TEXT_RECORD_KEYS.RISK }).catch(() => null),
      sepoliaClient.getEnsText({ name: normalized, key: TEXT_RECORD_KEYS.STRATEGY }).catch(() => null),
      sepoliaClient.getEnsText({ name: normalized, key: TEXT_RECORD_KEYS.TOKENS }).catch(() => null),
      sepoliaClient.getEnsText({ name: normalized, key: TEXT_RECORD_KEYS.ENDPOINT }).catch(() => null),
    ])

    return parseAgentConfig({ risk, strategy, tokens, endpoint })
  } catch (error) {
    console.warn(`[ens] Failed to read config for ${ensName}:`, error)
    return DEFAULT_AGENT_CONFIG
  }
}

export function useAgentConfig(ensName: string | null | undefined) {
  const normalized = useMemo(() => {
    if (!ensName) return null
    try {
      return normalize(ensName)
    } catch {
      return null
    }
  }, [ensName])

  const { data: config, isLoading, error } = useQuery({
    queryKey: ['ens-agent-config', normalized],
    queryFn: async () => {
      if (!normalized) return DEFAULT_AGENT_CONFIG
      return readAgentConfig(normalized)
    },
    enabled: !!normalized,
    staleTime: 60 * 1000,
  })

  return {
    config: config ?? DEFAULT_AGENT_CONFIG,
    isLoading,
    error: error ?? null,
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

    const resolver = SEPOLIA_PUBLIC_RESOLVER

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
      // Validate URL before writing to ENS
      try {
        const endpointUrl = new URL(config.agentEndpoint)
        if (endpointUrl.protocol !== 'http:' && endpointUrl.protocol !== 'https:') {
          throw new Error('Only HTTP/HTTPS protocols allowed for agentEndpoint')
        }
        if (config.agentEndpoint.length > 200) {
          throw new Error('Agent endpoint URL too long (max 200 characters)')
        }
      } catch (urlError) {
        if (urlError instanceof TypeError) {
          throw new Error('Invalid agent endpoint URL format')
        }
        throw urlError
      }

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
        throw new Error(`Ens does not belons to you "${ensName}"`)
      }
    }
    throw error
  }
}
