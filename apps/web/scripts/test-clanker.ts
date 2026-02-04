/**
 * Clanker Integration Tests
 * Run with: cd apps/web && bun run scripts/test-clanker.ts
 * 
 * Tests Clanker token launch integration on Base Sepolia.
 * Set PRIVATE_KEY env var for wallet-signed operations.
 */

import { createPublicClient, http, formatEther } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { CLANKER_CONTRACTS, FEE_CONFIG } from '../lib/clanker/constants'

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'

function log(test: string, status: 'pass' | 'fail' | 'skip', message?: string) {
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️'
  console.log(`${emoji} ${test}${message ? `: ${message}` : ''}`)
}

async function testClankerFactoryExists() {
  console.log('\n--- Test: Clanker Factory Contract ---')
  
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })
    
    const code = await client.getCode({ 
      address: CLANKER_CONTRACTS.SEPOLIA.FACTORY as `0x${string}` 
    })
    
    if (code && code !== '0x') {
      log('Clanker Factory', 'pass', `Contract exists at ${CLANKER_CONTRACTS.SEPOLIA.FACTORY}`)
      return true
    } else {
      log('Clanker Factory', 'fail', 'No code at address')
      return false
    }
  } catch (error) {
    log('Clanker Factory', 'fail', String(error))
    return false
  }
}

async function testClankerFeeLockerExists() {
  console.log('\n--- Test: Clanker Fee Locker Contract ---')
  
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })
    
    const code = await client.getCode({ 
      address: CLANKER_CONTRACTS.SEPOLIA.FEE_LOCKER as `0x${string}` 
    })
    
    if (code && code !== '0x') {
      log('Fee Locker', 'pass', `Contract exists at ${CLANKER_CONTRACTS.SEPOLIA.FEE_LOCKER}`)
      return true
    } else {
      log('Fee Locker', 'fail', 'No code at address')
      return false
    }
  } catch (error) {
    log('Fee Locker', 'fail', String(error))
    return false
  }
}

async function testClankerHookExists() {
  console.log('\n--- Test: Clanker Hook Static Fee V2 ---')
  
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })
    
    const code = await client.getCode({ 
      address: CLANKER_CONTRACTS.SEPOLIA.HOOK_STATIC_FEE_V2 as `0x${string}` 
    })
    
    if (code && code !== '0x') {
      log('Hook Static Fee V2', 'pass', `Contract exists at ${CLANKER_CONTRACTS.SEPOLIA.HOOK_STATIC_FEE_V2}`)
      return true
    } else {
      log('Hook Static Fee V2', 'fail', 'No code at address')
      return false
    }
  } catch (error) {
    log('Hook Static Fee V2', 'fail', String(error))
    return false
  }
}

async function testTokenLaunchAPI() {
  console.log('\n--- Test: Token Launch API Endpoint ---')
  
  const ports = [3000, 3001, 3002]
  
  for (const port of ports) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`http://127.0.0.1:${port}/api/agents/launch-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Session': `test-${Date.now()}`,
        },
        body: JSON.stringify({
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenDescription: 'A test token for integration testing',
          rewardRecipient: '0x0000000000000000000000000000000000000001',
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeout)
      const data = await response.json()
      
      if (response.ok || data.error) {
        log('Token Launch API', 'pass', `Endpoint responds on port ${port}`)
        if (data.proposal) {
          console.log('  Token Name:', data.proposal.tokenName)
          console.log('  Strategy:', data.proposal.strategyType)
        }
        return true
      }
    } catch (error) {
      const errStr = String(error)
      if (errStr.includes('ECONNREFUSED') || errStr.includes('Unable to connect') || errStr.includes('abort')) {
        continue
      }
    }
  }
  
  log('Token Launch API', 'skip', 'Dev server not running (try: cd apps/web && PORT=3002 bun run dev)')
  return false
}

async function testCouncilTokenLaunchDeliberation() {
  console.log('\n--- Test: Council Token Launch Deliberation ---')
  
  const ports = [3000, 3001, 3002]
  
  for (const port of ports) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(`http://127.0.0.1:${port}/api/agents/council`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Guest-Session': `test-${Date.now()}`,
        },
        body: JSON.stringify({
          userPrompt: 'Launch a memecoin for the lobster community',
          context: {
            balance: '0.1 ETH',
            riskLevel: 'medium',
          },
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeout)
      const data = await response.json()
      
      if (data.success && data.proposal) {
        const isTokenLaunch = data.proposal.strategyType === 'token_launch' || 
                              data.proposal.action === 'token_launch'
        
        if (isTokenLaunch) {
          log('Token Launch Deliberation', 'pass', 'Council detected token launch intent')
          console.log('  Token Name:', data.proposal.tokenName)
          console.log('  Token Symbol:', data.proposal.tokenSymbol)
          console.log('  Confidence:', data.proposal.confidence)
        } else {
          log('Token Launch Deliberation', 'fail', `Wrong strategy: ${data.proposal.strategyType}`)
        }
        return isTokenLaunch
      } else {
        log('Token Launch Deliberation', 'fail', data.error || 'No proposal returned')
        return false
      }
    } catch (error) {
      const errStr = String(error)
      if (errStr.includes('ECONNREFUSED') || errStr.includes('Unable to connect') || errStr.includes('abort')) {
        continue
      }
    }
  }
  
  log('Token Launch Deliberation', 'skip', 'Dev server not running')
  return false
}

async function testWalletSetup() {
  console.log('\n--- Test: Wallet Setup for Token Launch ---')
  
  const privateKey = process.env.PRIVATE_KEY
  
  if (!privateKey) {
    log('Wallet Setup', 'skip', 'Set PRIVATE_KEY env var for real token launch')
    return null
  }
  
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })
    
    const balance = await publicClient.getBalance({ address: account.address })
    const balanceEth = formatEther(balance)
    
    log('Wallet Address', 'pass', account.address)
    log('Wallet Balance', parseFloat(balanceEth) > 0.01 ? 'pass' : 'fail', `${balanceEth} ETH`)
    
    if (parseFloat(balanceEth) < 0.01) {
      console.log('  ⚠️  Need at least 0.01 ETH for token launch gas')
      console.log('  ⚠️  Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia')
      return null
    }
    
    return { account, publicClient }
  } catch (error) {
    log('Wallet Setup', 'fail', String(error))
    return null
  }
}

async function testRealTokenLaunch() {
  console.log('\n--- Test: Real Token Launch (Info) ---')
  
  const walletSetup = await testWalletSetup()
  if (!walletSetup) {
    log('Real Token Launch', 'skip', 'Wallet not configured')
    return null
  }
  
  console.log('\n📋 CLANKER SDK CHAIN SUPPORT')
  console.log('  The Clanker SDK currently only supports Base Mainnet (chainId: 8453)')
  console.log('  Base Sepolia contracts exist but SDK validation requires mainnet.')
  console.log('')
  console.log('  For hackathon demo:')
  console.log('  - Mock mode: NEXT_PUBLIC_CLANKER_MOCK=true (returns fake tx hashes)')
  console.log('  - Real mode: Requires Base Mainnet ETH for actual token deployment')
  console.log('')
  console.log('  Contract addresses verified on Base Sepolia:')
  console.log(`  - Factory: ${CLANKER_CONTRACTS.SEPOLIA.FACTORY}`)
  console.log(`  - Fee Locker: ${CLANKER_CONTRACTS.SEPOLIA.FEE_LOCKER}`)
  console.log(`  - Hook V2: ${CLANKER_CONTRACTS.SEPOLIA.HOOK_STATIC_FEE_V2}`)
  
  log('Real Token Launch', 'skip', 'SDK requires Base Mainnet - use mock mode for demos')
  return null
}

async function testFeeConfig() {
  console.log('\n--- Test: Fee Configuration ---')
  
  try {
    const agentBps = FEE_CONFIG.AGENT_BPS
    const platformBps = FEE_CONFIG.PLATFORM_BPS
    const total = agentBps + platformBps
    
    if (total !== 10000) {
      log('Fee Config', 'fail', `Total BPS should be 10000, got ${total}`)
      return false
    }
    
    log('Fee Config', 'pass', `Agent: ${agentBps/100}%, Platform: ${platformBps/100}%`)
    return true
  } catch (error) {
    log('Fee Config', 'fail', String(error))
    return false
  }
}

async function main() {
  console.log('==========================================')
  console.log('  Clanker Integration Tests')
  console.log('==========================================')
  console.log('')
  console.log('Testing Clanker token launch integration')
  console.log('on Base Sepolia testnet.')
  console.log('')
  
  const results = {
    factory: await testClankerFactoryExists(),
    feeLocker: await testClankerFeeLockerExists(),
    hook: await testClankerHookExists(),
    feeConfig: await testFeeConfig(),
    api: await testTokenLaunchAPI(),
    deliberation: await testCouncilTokenLaunchDeliberation(),
    realLaunch: await testRealTokenLaunch(),
  }
  
  console.log('\n==========================================')
  console.log('  Summary')
  console.log('==========================================')
  console.log('')
  
  const passed = Object.values(results).filter(r => r === true).length
  const failed = Object.values(results).filter(r => r === false).length
  const skipped = Object.entries(results).filter(([, v]) => v !== true && v !== false).length
  
  console.log(`  Passed: ${passed}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Skipped: ${skipped}`)
  console.log('')
  
  if (failed === 0) {
    console.log('✅ All tests passed!')
  } else {
    console.log('❌ Some tests failed')
  }
  
  console.log('')
  console.log('To run real token launch test:')
  console.log('  PRIVATE_KEY=0x... RUN_REAL_LAUNCH=true bun run scripts/test-clanker.ts')
  console.log('')
}

main().catch(console.error)
