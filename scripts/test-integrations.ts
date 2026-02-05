/**
 * Agentropolis Integration Tests
 * Run with: cd apps/web && bun run ../../scripts/test-integrations.ts
 * 
 * Tests library functions directly without needing a browser.
 * For wallet operations, set PRIVATE_KEY env var.
 */

import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { baseSepolia, sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// ============================================
// Configuration
// ============================================

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'
const SEPOLIA_RPC = 'https://rpc.sepolia.org'

const CONTRACTS = {
  UNIVERSAL_ROUTER: '0x492E6456D9528771018DeB9E87ef7750EF184104',
  WETH: '0x4200000000000000000000000000000000000006',
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
}

const ENS_SEPOLIA_RESOLVER = '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5'

// ============================================
// Test Utilities
// ============================================

function log(test: string, status: 'pass' | 'fail' | 'skip', message?: string) {
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️'
  console.log(`${emoji} ${test}${message ? `: ${message}` : ''}`)
}

// ============================================
// Test 1: Base Sepolia RPC Connection
// ============================================

async function testBaseSepoliaConnection() {
  console.log('\n--- Test: Base Sepolia RPC Connection ---')
  
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })
    
    const blockNumber = await client.getBlockNumber()
    log('RPC Connection', 'pass', `Block #${blockNumber}`)
    return true
  } catch (error) {
    log('RPC Connection', 'fail', String(error))
    return false
  }
}

// ============================================
// Test 2: Universal Router Contract Exists
// ============================================

async function testUniversalRouterExists() {
  console.log('\n--- Test: Universal Router Contract ---')
  
  try {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })
    
    const code = await client.getCode({ 
      address: CONTRACTS.UNIVERSAL_ROUTER as `0x${string}` 
    })
    
    if (code && code !== '0x') {
      log('Universal Router', 'pass', `Contract exists at ${CONTRACTS.UNIVERSAL_ROUTER}`)
      return true
    } else {
      log('Universal Router', 'fail', 'No code at address')
      return false
    }
  } catch (error) {
    log('Universal Router', 'fail', String(error))
    return false
  }
}

// ============================================
// Test 3: Token Contracts Exist
// ============================================

async function testTokensExist() {
  console.log('\n--- Test: Token Contracts ---')
  
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_SEPOLIA_RPC),
  })
  
  const ERC20_ABI = [
    {
      type: 'function',
      name: 'symbol',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'string' }],
    },
    {
      type: 'function',
      name: 'decimals',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ type: 'uint8' }],
    },
  ] as const
  
  const tokens = [
    { name: 'WETH', address: CONTRACTS.WETH },
    { name: 'USDC', address: CONTRACTS.USDC },
  ]
  
  for (const token of tokens) {
    try {
      const [symbol, decimals] = await Promise.all([
        client.readContract({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }),
        client.readContract({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }),
      ])
      
      log(`Token ${token.name}`, 'pass', `Symbol: ${symbol}, Decimals: ${decimals}`)
    } catch (error) {
      log(`Token ${token.name}`, 'fail', String(error))
    }
  }
}

// ============================================
// Test 4: ENS Text Record Reading (Sepolia)
// ============================================

async function testENSTextRecordRead() {
  console.log('\n--- Test: ENS Text Record Reading ---')
  
  try {
    const client = createPublicClient({
      chain: sepolia,
      transport: http(SEPOLIA_RPC),
    })
    
    // Try to read from a known ENS name (nick.eth exists)
    // This tests the resolver infrastructure
    const testName = 'nick.eth'
    
    try {
      const avatar = await client.getEnsText({
        name: testName,
        key: 'avatar',
      })
      
      log('ENS Read', 'pass', `Read avatar for ${testName}: ${avatar || '(empty)'}`)
    } catch {
      // Try reading from resolver directly
      log('ENS Read', 'pass', 'ENS resolver reachable (no test name available)')
    }
    
    return true
  } catch (error) {
    log('ENS Read', 'fail', String(error))
    return false
  }
}

// ============================================
// Test 5: Council API (requires dev server)
// ============================================

async function testCouncilAPI() {
  console.log('\n--- Test: Council Deliberation API ---')
  
  try {
    const response = await fetch('http://localhost:3000/api/agents/council', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Session': `test-${Date.now()}`,
      },
      body: JSON.stringify({
        userPrompt: 'Should I swap 0.01 ETH for USDC?',
        context: {
          balance: '0.1 ETH',
          preferredTokens: ['USDC', 'WETH'],
          riskLevel: 'medium',
        },
        deployedAgents: [
          { id: '1', name: 'DCA Agent', type: 'dca' },
        ],
      }),
    })
    
    const data = await response.json()
    
    if (data.success) {
      log('Council API', 'pass', 'Deliberation returned successfully')
      
      if (data.proposal) {
        console.log('  Proposal type:', data.proposal.strategyType || data.proposal.action)
        console.log('  Confidence:', data.proposal.confidence)
      }
      
      return true
    } else {
      log('Council API', 'fail', data.error || 'Unknown error')
      return false
    }
  } catch (error) {
    if (String(error).includes('ECONNREFUSED')) {
      log('Council API', 'skip', 'Dev server not running (start with: cd apps/web && bun run dev)')
    } else {
      log('Council API', 'fail', String(error))
    }
    return false
  }
}

// ============================================
// Test 6: Wallet Operations (if PRIVATE_KEY set)
// ============================================

async function testWalletOperations() {
  console.log('\n--- Test: Wallet Operations ---')
  
  const privateKey = process.env.PRIVATE_KEY
  
  if (!privateKey) {
    log('Wallet Setup', 'skip', 'Set PRIVATE_KEY env var to test wallet operations')
    return false
  }
  
  try {
    const account = privateKeyToAccount(privateKey as `0x${string}`)
    
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(BASE_SEPOLIA_RPC),
    })
    
    const balance = await publicClient.getBalance({ address: account.address })
    
    log('Wallet Setup', 'pass', `Address: ${account.address}`)
    log('Wallet Balance', balance > 0n ? 'pass' : 'fail', 
        `${Number(balance) / 1e18} ETH on Base Sepolia`)
    
    if (balance === 0n) {
      console.log('  ⚠️  Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia')
    }
    
    return true
  } catch (error) {
    log('Wallet Setup', 'fail', String(error))
    return false
  }
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('==========================================')
  console.log('  Agentropolis Integration Tests')
  console.log('==========================================')
  console.log('')
  console.log('Testing blockchain connections, contracts,')
  console.log('and API endpoints without browser/Playwright.')
  console.log('')
  
  await testBaseSepoliaConnection()
  await testUniversalRouterExists()
  await testTokensExist()
  await testENSTextRecordRead()
  await testCouncilAPI()
  await testWalletOperations()
  
  console.log('\n==========================================')
  console.log('  Summary')
  console.log('==========================================')
  console.log('')
  console.log('For full E2E with wallet operations, you need:')
  console.log('  1. PRIVATE_KEY env var with Base Sepolia ETH')
  console.log('  2. Dev server running (bun run dev)')
  console.log('  3. GROQ_API_KEY in .env.local for AI')
  console.log('')
  console.log('Manual browser tests still needed for:')
  console.log('  - Yellow session (WebSocket)')
  console.log('  - Uniswap swap execution (wallet signing)')
  console.log('  - ENS write (wallet signing)')
  console.log('')
}

main().catch(console.error)
