import { NextRequest, NextResponse } from 'next/server'
import type { ExternalAgentRequest, ExternalAgentResponse, TradeProposal } from '@agentropolis/shared'

/**
 * BYOA (Bring Your Own Agent) Demo Endpoint
 * 
 * This route demonstrates the ExternalAgentRequest → ExternalAgentResponse protocol
 * that any external agent can implement. When a user sets their agent endpoint to
 * this URL (e.g. http://localhost:3000/api/agents/external-demo), the council will
 * call this endpoint during deliberation and include the external agent's proposal.
 * 
 * Protocol:
 *   POST /api/agents/external-demo
 *   Body: ExternalAgentRequest { prompt, context, requestId }
 *   Response: ExternalAgentResponse { success, proposal, processingTime }
 */

const WETH = '0x4200000000000000000000000000000000000006'
const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = (await request.json()) as ExternalAgentRequest
    const { prompt, context, requestId } = body

    if (!prompt || !requestId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: prompt, requestId' } satisfies ExternalAgentResponse,
        { status: 400 }
      )
    }

    console.log(`[ExternalDemo] Received request ${requestId}: "${prompt}"`)
    console.log(`[ExternalDemo] Context:`, context)

    const promptLower = prompt.toLowerCase()
    const wantsETH = promptLower.includes('eth') || promptLower.includes('weth')
    const wantsUSDC = promptLower.includes('usdc') || promptLower.includes('stable') || promptLower.includes('usd')
    const wantsSell = promptLower.includes('sell') || promptLower.includes('exit')

    let tokenIn: { symbol: string; address: string }
    let tokenOut: { symbol: string; address: string }
    let amountIn: string
    let reasoning: string

    if (wantsUSDC || wantsSell) {
      tokenIn = { symbol: 'WETH', address: WETH }
      tokenOut = { symbol: 'USDC', address: USDC }
      amountIn = '0.005'
      reasoning = `External Demo Agent analyzed: "${prompt}". Recommending WETH→USDC swap to de-risk position. Risk context: ${context.riskLevel ?? 'medium'}.`
    } else if (wantsETH) {
      tokenIn = { symbol: 'USDC', address: USDC }
      tokenOut = { symbol: 'WETH', address: WETH }
      amountIn = '5.0'
      reasoning = `External Demo Agent analyzed: "${prompt}". Recommending USDC→WETH swap to accumulate ETH exposure. Risk context: ${context.riskLevel ?? 'medium'}.`
    } else {
      tokenIn = { symbol: 'WETH', address: WETH }
      tokenOut = { symbol: 'USDC', address: USDC }
      amountIn = '0.005'
      reasoning = `External Demo Agent analyzed: "${prompt}". Defaulting to small WETH→USDC swap as a conservative starting point. Risk context: ${context.riskLevel ?? 'medium'}.`
    }

    const riskLevel = context.riskLevel ?? 'medium'
    const confidence = riskLevel === 'low' ? 85 : riskLevel === 'medium' ? 72 : 60

    const proposal: TradeProposal = {
      id: `external-demo-${requestId}`,
      agentId: 'external-demo',
      agentName: 'BYOA Demo Agent',
      pair: { tokenIn, tokenOut },
      action: 'swap',
      strategyType: 'swap',
      amountIn,
      expectedAmountOut: '0',
      maxSlippage: 0.5,
      deadline: Math.floor(Date.now() / 1000) + 300,
      reasoning,
      confidence,
      riskLevel,
    }

    const processingTime = Date.now() - startTime

    console.log(`[ExternalDemo] Responding with ${tokenIn.symbol}→${tokenOut.symbol} proposal (${processingTime}ms)`)

    const response: ExternalAgentResponse = {
      success: true,
      proposal,
      processingTime,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[ExternalDemo] Error:', error)

    const response: ExternalAgentResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime,
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'BYOA Demo Agent',
    version: '1.0.0',
    description: 'Agentropolis external agent demo implementing the ExternalAgentRequest/Response protocol',
    protocol: {
      method: 'POST',
      requestSchema: 'ExternalAgentRequest { prompt: string, context: { balance?, riskLevel?, preferredTokens? }, requestId: string }',
      responseSchema: 'ExternalAgentResponse { success: boolean, proposal?: TradeProposal, error?: string, processingTime?: number }',
    },
  })
}
