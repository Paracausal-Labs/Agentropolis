/**
 * Prerequisite Validation Script for x402 + ERC-8004 Integration
 * Run with: cd apps/web && bun run scripts/validate-prerequisites.ts
 * 
 * Checks:
 * 1. ERC-8004 Identity Registry exists on Base Sepolia
 * 2. ERC-8004 Reputation Registry exists on Base Sepolia
 * 3. x402 Facilitator is reachable
 * 4. Optional: Query agent count from registry
 */

import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'

// ERC-8004 Registry addresses on Base Sepolia (testnet)
const ERC8004_IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e' as const
const ERC8004_REPUTATION_REGISTRY = '0x8004B663056A597Dffe9eCcC1965A193B7388713' as const

// x402 Facilitator (testnet)
const X402_FACILITATOR_URL = 'https://facilitator.x402.org/'

// Minimal ABI for registry queries
const IDENTITY_REGISTRY_ABI = [
  {
    inputs: [],
    name: 'totalAgents',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'uint256' }],
    name: 'getMetadataURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

function log(test: string, status: 'pass' | 'fail' | 'warn' | 'info', message?: string) {
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : status === 'warn' ? '⚠️' : 'ℹ️'
  console.log(`${emoji} ${test}${message ? `: ${message}` : ''}`)
}

async function checkIdentityRegistry() {
  console.log('\n========== ERC-8004 Identity Registry ==========')
  
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })

    // Check contract exists
    const code = await client.getCode({ address: ERC8004_IDENTITY_REGISTRY })
    
    if (!code || code === '0x') {
      log('Identity Registry', 'fail', `No contract at ${ERC8004_IDENTITY_REGISTRY}`)
      return false
    }
    
    log('Identity Registry', 'pass', `Contract exists at ${ERC8004_IDENTITY_REGISTRY}`)

    // Try to query totalAgents
    try {
      const totalAgents = await client.readContract({
        address: ERC8004_IDENTITY_REGISTRY,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: 'totalAgents',
      })
      
      log('Total Agents', 'info', `${totalAgents.toString()} agents registered`)

      // If agents exist, try to fetch first agent's metadata
      if (totalAgents > 0n) {
        try {
          const metadataUri = await client.readContract({
            address: ERC8004_IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            functionName: 'getMetadataURI',
            args: [0n],
          })
          
          if (metadataUri) {
            log('Agent 0 Metadata', 'info', `URI: ${metadataUri.substring(0, 60)}...`)
          }
        } catch (err) {
          log('Agent 0 Metadata', 'warn', 'Could not fetch metadata')
        }
      } else {
        log('Registry Status', 'warn', 'Registry is empty - will use mock agents')
      }
    } catch (err) {
      log('Total Agents Query', 'warn', 'Could not query totalAgents (may not be implemented)')
    }

    return true
  } catch (error) {
    log('Identity Registry', 'fail', String(error))
    return false
  }
}

async function checkReputationRegistry() {
  console.log('\n========== ERC-8004 Reputation Registry ==========')
  
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })

    // Check contract exists
    const code = await client.getCode({ address: ERC8004_REPUTATION_REGISTRY })
    
    if (!code || code === '0x') {
      log('Reputation Registry', 'warn', `No contract at ${ERC8004_REPUTATION_REGISTRY}`)
      return false
    }
    
    log('Reputation Registry', 'pass', `Contract exists at ${ERC8004_REPUTATION_REGISTRY}`)
    return true
  } catch (error) {
    log('Reputation Registry', 'fail', String(error))
    return false
  }
}

async function checkX402Facilitator() {
  console.log('\n========== x402 Facilitator ==========')
  
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(X402_FACILITATOR_URL, {
      method: 'GET',
      signal: controller.signal,
    })
    
    clearTimeout(timeout)

    if (response.ok || response.status === 404 || response.status === 405) {
      // 404/405 is fine - it means the server is running but doesn't have a GET endpoint
      log('x402 Facilitator', 'pass', `Reachable at ${X402_FACILITATOR_URL} (status: ${response.status})`)
      return true
    } else {
      log('x402 Facilitator', 'warn', `Unexpected status: ${response.status}`)
      return true // Still consider it available
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      log('x402 Facilitator', 'fail', 'Request timeout')
    } else {
      log('x402 Facilitator', 'fail', String(error))
    }
    return false
  }
}

async function main() {
  console.log('==========================================')
  console.log('  x402 + ERC-8004 Prerequisites Check')
  console.log('==========================================')
  console.log(`Chain: Base Sepolia (84532)`)
  console.log(`RPC: ${BASE_SEPOLIA_RPC}`)

  const results = {
    identityRegistry: await checkIdentityRegistry(),
    reputationRegistry: await checkReputationRegistry(),
    x402Facilitator: await checkX402Facilitator(),
  }

  console.log('\n========== Summary ==========')
  
  const allPassed = Object.values(results).every(r => r)
  const criticalPassed = results.identityRegistry // Only identity registry is critical
  
  if (allPassed) {
    log('All Prerequisites', 'pass', 'Ready to proceed!')
    process.exit(0)
  } else if (criticalPassed) {
    log('Critical Prerequisites', 'pass', 'Identity registry available')
    log('Optional Prerequisites', 'warn', 'Some optional checks failed - will use fallbacks')
    process.exit(0)
  } else {
    log('Prerequisites', 'fail', 'Critical checks failed')
    console.log('\nNote: If ERC-8004 registry is empty or unavailable, the app will use mock agents.')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Validation failed:', err)
  process.exit(1)
})
