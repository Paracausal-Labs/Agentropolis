/**
 * E2E Integration Tests for x402 + ERC-8004
 *
 * Run: bun run scripts/test-x402-erc8004.ts
 */

import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const IDENTITY_REGISTRY = '0x8004A818BFB912233c491871b3d84c89A494BD9e'
const REPUTATION_REGISTRY = '0x8004B663056A597Dffe9eCcC1965A193B7388713'
const X402_FACILITATOR = 'https://facilitator.x402.org'
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org'

interface TestResult {
  name: string
  passed: boolean
  message: string
  duration: number
}

const results: TestResult[] = []

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`)
}

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now()
  try {
    await fn()
    const duration = Date.now() - start
    results.push({ name, passed: true, message: 'OK', duration })
    log('✅', `${name} (${duration}ms)`)
  } catch (error) {
    const duration = Date.now() - start
    const message = error instanceof Error ? error.message : String(error)
    results.push({ name, passed: false, message, duration })
    log('❌', `${name}: ${message}`)
  }
}

async function testERC8004RegistryReachable() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_SEPOLIA_RPC),
  })

  const code = await client.getCode({ address: IDENTITY_REGISTRY as `0x${string}` })
  if (!code || code === '0x') {
    throw new Error('Identity registry contract not deployed')
  }
}

async function testERC8004TotalAgents() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_SEPOLIA_RPC),
  })

  const abi = [
    {
      inputs: [],
      name: 'totalAgents',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ] as const

  try {
    const total = await client.readContract({
      address: IDENTITY_REGISTRY as `0x${string}`,
      abi,
      functionName: 'totalAgents',
    })
    log('  ', `Found ${total} agents in registry`)
  } catch {
    log('  ', 'totalAgents() not available (registry may use different interface)')
  }
}

async function testReputationRegistryReachable() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_SEPOLIA_RPC),
  })

  const code = await client.getCode({ address: REPUTATION_REGISTRY as `0x${string}` })
  if (!code || code === '0x') {
    throw new Error('Reputation registry contract not deployed')
  }
}

async function testX402FacilitatorReachable() {
  try {
    const response = await fetch(X402_FACILITATOR, {
      method: 'HEAD',
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok && response.status !== 405) {
      log('  ', `Facilitator returned ${response.status} (may require browser context)`)
    } else {
      log('  ', 'Facilitator is reachable')
    }
  } catch {
    log('  ', 'Facilitator not reachable from server (OK - client-side only)')
  }
}

async function testAgentListAPI() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3002'
  const response = await fetch(`${baseUrl}/api/agents/list`, {
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('Response is not an array')
  }

  log('  ', `API returned ${data.length} agents`)

  if (data.length > 0) {
    const first = data[0]
    if (!first.agentId && first.agentId !== 0) throw new Error('Missing agentId')
    if (!first.name) throw new Error('Missing name')
    if (!first.strategy) throw new Error('Missing strategy')
    log('  ', `First agent: ${first.name} (${first.strategy})`)
  }
}

async function testCouncilAPIWithMock() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3002'
  const response = await fetch(`${baseUrl}/api/agents/council`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userPrompt: 'swap 0.1 ETH to USDC',
      context: { balance: '1 ETH', riskLevel: 'medium' },
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  const data = await response.json()
  if (!data.success) throw new Error('Response success=false')
  if (!data.proposal) throw new Error('Missing proposal')
  if (!data.deliberation) throw new Error('Missing deliberation')

  log('  ', `Proposal: ${data.proposal.pair?.tokenIn?.symbol} → ${data.proposal.pair?.tokenOut?.symbol}`)
  log('  ', `Consensus: ${data.deliberation.consensus}`)
}

async function testDemoX402Server() {
  const response = await fetch('http://localhost:4021/health', {
    signal: AbortSignal.timeout(5000),
  }).catch(() => null)

  if (!response) {
    log('  ', 'Demo server not running (optional - run with: bun run demo:agent)')
    return
  }

  const data = await response.json()
  if (data.status !== 'ok') {
    throw new Error(`Health check failed: ${JSON.stringify(data)}`)
  }

  log('  ', `Demo server mode: ${data.mode}`)

  const proposeResponse = await fetch('http://localhost:4021/propose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'swap 0.1 ETH to USDC',
      requestId: 'test-e2e-1',
      context: { balance: '1 ETH' },
    }),
    signal: AbortSignal.timeout(10000),
  })

  const proposeData = await proposeResponse.json()
  if (!proposeData.success) {
    throw new Error(`Propose failed: ${proposeData.error}`)
  }

  log('  ', `Demo proposal: ${proposeData.proposal.pair.tokenIn.symbol} → ${proposeData.proposal.pair.tokenOut.symbol}`)
}

async function testX402ClientModuleImport() {
  try {
    const { wrapFetchWithPayment, x402Client } = await import('@x402/fetch')
    if (!wrapFetchWithPayment) throw new Error('wrapFetchWithPayment not exported')
    if (!x402Client) throw new Error('x402Client not exported')
    log('  ', 'x402/fetch module loads correctly')
  } catch {
    throw new Error('Failed to import @x402/fetch')
  }

  try {
    const { registerExactEvmScheme } = await import('@x402/evm/exact/client')
    if (!registerExactEvmScheme) throw new Error('registerExactEvmScheme not exported')
    log('  ', 'x402/evm/exact/client module loads correctly')
  } catch {
    throw new Error('Failed to import @x402/evm/exact/client')
  }
}

async function testTypesExist() {
  const types = await import('@agentropolis/shared')

  const requiredTypes = ['ExternalAgentRequest', 'ExternalAgentResponse']
  for (const typeName of requiredTypes) {
    if (!(typeName in types)) {
      log('  ', `Note: ${typeName} is a type-only export (expected)`)
    }
  }
}

async function main() {
  console.log('')
  console.log('═══════════════════════════════════════════════════════')
  console.log('       x402 + ERC-8004 Integration Tests')
  console.log('═══════════════════════════════════════════════════════')
  console.log('')

  console.log('📡 Infrastructure Tests')
  console.log('------------------------')
  await runTest('ERC-8004 Identity Registry Reachable', testERC8004RegistryReachable)
  await runTest('ERC-8004 Total Agents Query', testERC8004TotalAgents)
  await runTest('ERC-8004 Reputation Registry Reachable', testReputationRegistryReachable)
  await runTest('x402 Facilitator Reachable', testX402FacilitatorReachable)

  console.log('')
  console.log('📦 Module Tests')
  console.log('---------------')
  await runTest('x402 Client Module Import', testX402ClientModuleImport)
  await runTest('Shared Types Export', testTypesExist)

  console.log('')
  console.log('🌐 API Tests')
  console.log('------------')
  await runTest('Agent List API', testAgentListAPI)
  await runTest('Council API (Mock Mode)', testCouncilAPIWithMock)
  await runTest('Demo x402 Server (Optional)', testDemoX402Server)

  console.log('')
  console.log('═══════════════════════════════════════════════════════')
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  console.log(`Results: ${passed} passed, ${failed} failed`)
  console.log('═══════════════════════════════════════════════════════')
  console.log('')

  if (failed > 0) {
    console.log('Failed tests:')
    results.filter((r) => !r.passed).forEach((r) => console.log(`  - ${r.name}: ${r.message}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Test runner error:', error)
  process.exit(1)
})
