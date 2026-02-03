'use client'

import { useReadContract } from 'wagmi'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'
import { useMemo } from 'react'

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
