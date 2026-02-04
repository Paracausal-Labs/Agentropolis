/**
 * Demo x402 Agent Endpoint Server
 *
 * This server demonstrates the x402 payment flow for external agent endpoints.
 * It requires a small USDC payment ($0.01) before returning a mock trade proposal.
 *
 * For demo purposes, it can run in two modes:
 * 1. x402 mode (requires real payment): Uses x402 middleware
 * 2. Mock mode (no payment required): Returns proposals directly for testing
 *
 * Usage:
 *   bun run scripts/demo-x402-server.ts           # x402 mode on port 4021
 *   MOCK_MODE=true bun run scripts/demo-x402-server.ts  # Mock mode (no payment)
 *
 * Test with:
 *   curl http://localhost:4021/propose -X POST \
 *     -H "Content-Type: application/json" \
 *     -d '{"prompt":"swap 0.1 ETH to USDC","context":{"balance":"1 ETH"},"requestId":"test-1"}'
 */

import express from 'express'
import cors from 'cors'
import type { ExternalAgentRequest, ExternalAgentResponse, TradeProposal } from '@agentropolis/shared'

const PORT = process.env.PORT || 4021
const MOCK_MODE = process.env.MOCK_MODE === 'true'

const PAY_TO_ADDRESS = process.env.PAY_TO_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f1F1F1'

const app = express()
app.use(cors())
app.use(express.json())

function generateMockProposal(request: ExternalAgentRequest): TradeProposal {
  const prompt = request.prompt.toLowerCase()
  const now = Date.now()

  let tokenIn = 'WETH'
  let tokenOut = 'USDC'
  let action: 'swap' | 'rebalance' | 'dca' = 'swap'
  let strategyType: 'swap' | 'dca' | 'lp_full_range' | 'lp_concentrated' = 'swap'

  if (prompt.includes('usdc') && prompt.includes('eth')) {
    if (prompt.includes('usdc to') || prompt.includes('usdc for')) {
      tokenIn = 'USDC'
      tokenOut = 'WETH'
    }
  }

  if (prompt.includes('dca') || prompt.includes('dollar cost')) {
    action = 'dca'
    strategyType = 'dca'
  } else if (prompt.includes('lp') || prompt.includes('liquidity')) {
    action = 'rebalance'
    strategyType = prompt.includes('concentrated') ? 'lp_concentrated' : 'lp_full_range'
  }

  const amountMatch = prompt.match(/(\d+\.?\d*)\s*(eth|usdc|weth)/i)
  const amountIn = amountMatch ? amountMatch[1] : '0.1'

  const ETH_PRICE_USD = 3300
  const ethPrice = ETH_PRICE_USD
  const expectedAmountOut =
    tokenIn === 'WETH'
      ? String((parseFloat(amountIn) * ethPrice).toFixed(2))
      : String((parseFloat(amountIn) / ethPrice).toFixed(6))

  return {
    id: `external-${now}-${Math.random().toString(36).slice(2, 6)}`,
    agentId: 'x402-demo-agent',
    agentName: 'x402 Demo Agent',
    pair: {
      tokenIn: {
        symbol: tokenIn,
        address:
          tokenIn === 'WETH'
            ? '0x4200000000000000000000000000000000000006'
            : '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      },
      tokenOut: {
        symbol: tokenOut,
        address:
          tokenOut === 'USDC'
            ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
            : '0x4200000000000000000000000000000000000006',
      },
    },
    action,
    strategyType,
    amountIn,
    expectedAmountOut,
    maxSlippage: 50, // 0.5%
    deadline: now + 3600000, // 1 hour
    reasoning: `External agent analysis: Based on your ${request.context?.riskLevel || 'medium'} risk tolerance and balance of ${request.context?.balance || 'unknown'}, I recommend a ${strategyType} strategy. This ${tokenIn} to ${tokenOut} ${action} aligns with current market conditions.`,
    confidence: 78,
    riskLevel: (request.context?.riskLevel as 'low' | 'medium' | 'high') || 'medium',
    deliberation: {
      messages: [
        {
          agentId: 'x402-demo-agent',
          agentName: 'x402 Demo Agent',
          agentRole: 'clerk' as const,
          opinion: 'SUPPORT' as const,
          reasoning: 'External agent endorses this trade based on market analysis.',
          confidence: 78,
          timestamp: now,
        },
      ],
      consensus: 'unanimous' as const,
      voteTally: { support: 1, oppose: 0, abstain: 0 },
      rounds: 1,
    },
  }
}

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: MOCK_MODE ? 'mock' : 'x402',
    timestamp: new Date().toISOString(),
  })
})

app.post('/propose', async (req, res) => {
  const startTime = Date.now()

  try {
    const request = req.body as ExternalAgentRequest

    if (!request.prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt',
      } satisfies ExternalAgentResponse)
    }

    if (!request.requestId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: requestId',
      } satisfies ExternalAgentResponse)
    }

    console.log(`[x402-demo] Received request: ${request.requestId}`)
    console.log(`[x402-demo] Prompt: ${request.prompt.slice(0, 100)}...`)

    const proposal = generateMockProposal(request)
    const processingTime = Date.now() - startTime

    console.log(
      `[x402-demo] Generated proposal: ${proposal.pair.tokenIn.symbol} -> ${proposal.pair.tokenOut.symbol}`
    )

    return res.json({
      success: true,
      proposal,
      processingTime,
    } satisfies ExternalAgentResponse)
  } catch (error) {
    console.error('[x402-demo] Error:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      processingTime: Date.now() - startTime,
    } satisfies ExternalAgentResponse)
  }
})

app.get('/info', (_req, res) => {
  res.json({
    name: 'x402 Demo Agent',
    version: '1.0.0',
    description: 'A demo external agent endpoint that demonstrates x402 micropayments',
    capabilities: ['swap', 'dca', 'lp'],
    pricing: {
      scheme: 'exact',
      network: 'eip155:84532',
      price: '$0.01',
      currency: 'USDC',
    },
    contact: {
      github: 'https://github.com/agentropolis',
    },
  })
})

async function setupX402Middleware() {
  if (MOCK_MODE) {
    console.log('[x402-demo] Running in MOCK mode - no payment required')
    return
  }

  try {
    const { paymentMiddleware } = await import('@x402/express')
    const { x402ResourceServer, HTTPFacilitatorClient } = await import('@x402/core/server')
    const { registerExactEvmScheme } = await import('@x402/evm/exact/server')

    const facilitatorClient = new HTTPFacilitatorClient({
      url: 'https://facilitator.x402.org',
    })

    const server = new x402ResourceServer(facilitatorClient)
    registerExactEvmScheme(server)

    app.use(
      paymentMiddleware(
        {
          'POST /propose': {
            accepts: [
              {
                scheme: 'exact',
                price: '$0.01', // $0.01 USDC per proposal
                network: 'eip155:84532', // Base Sepolia
                payTo: PAY_TO_ADDRESS,
              },
            ],
            description: 'Get a trade proposal from the x402 Demo Agent',
            mimeType: 'application/json',
          },
        },
        server
      )
    )

    console.log('[x402-demo] x402 payment middleware enabled')
    console.log(`[x402-demo] Payment address: ${PAY_TO_ADDRESS}`)
    console.log('[x402-demo] Price: $0.01 USDC per proposal')
  } catch (error) {
    console.error('[x402-demo] Failed to setup x402 middleware:', error)
    console.log('[x402-demo] Falling back to mock mode')
  }
}

async function main() {
  await setupX402Middleware()

  app.listen(PORT, () => {
    console.log('')
    console.log('═══════════════════════════════════════════════════════')
    console.log('          x402 Demo Agent Endpoint Server')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`  Status:    Running`)
    console.log(`  Mode:      ${MOCK_MODE ? 'MOCK (no payment)' : 'x402 (payment required)'}`)
    console.log(`  Port:      ${PORT}`)
    console.log(`  Endpoints:`)
    console.log(`    GET  /health  - Health check`)
    console.log(`    GET  /info    - Agent info`)
    console.log(`    POST /propose - Get trade proposal`)
    console.log('')
    console.log(`  Test with:`)
    console.log(`    curl http://localhost:${PORT}/propose -X POST \\`)
    console.log(`      -H "Content-Type: application/json" \\`)
    console.log(`      -d '{"prompt":"swap 0.1 ETH to USDC","requestId":"test-1"}'`)
    console.log('═══════════════════════════════════════════════════════')
    console.log('')
  })
}

main().catch(console.error)
