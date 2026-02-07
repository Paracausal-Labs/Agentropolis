import Groq from 'groq-sdk'
import type { TradeProposal, AgentProfile } from '@agentropolis/shared'
import { TOKENS } from '../uniswap/constants'
import type { StrategyContext } from './strategies'

export interface ProposalRequest {
  agentId: string
  agentProfile?: AgentProfile
  context: StrategyContext
}

const FALLBACK_PROPOSAL: Omit<TradeProposal, 'id' | 'agentId'> = {
  agentName: 'Fallback Agent',
  pair: {
    tokenIn: { symbol: 'USDC', address: TOKENS.USDC },
    tokenOut: { symbol: 'WETH', address: TOKENS.WETH },
  },
  action: 'swap',
  amountIn: '100',
  expectedAmountOut: '0.03',
  maxSlippage: 50,
  deadline: Date.now() + 3600000,
  reasoning: 'This is a fallback proposal for testing purposes.',
  confidence: 75,
  riskLevel: 'medium',
}



function buildPrompt(request: ProposalRequest): string {
  const { agentProfile, context } = request
  const { balance = 'unknown', preferredTokens = ['USDC', 'WETH'], riskLevel = 'medium' } = context

  const agentDescription = agentProfile
    ? `You are ${agentProfile.name}, a ${agentProfile.strategy} trading agent with ${agentProfile.riskTolerance} risk tolerance. ${agentProfile.description}`
    : 'You are a DeFi trading agent specializing in token swaps on Uniswap v4.'

  return `${agentDescription}

Your task is to generate a single trade proposal based on the user's current situation.

User Context:
- Current balance: ${balance}
- Preferred tokens: ${preferredTokens.join(', ')}
- Risk tolerance: ${riskLevel}

Available tokens on Base Sepolia:
- USDC (address: ${TOKENS.USDC})
- WETH (address: ${TOKENS.WETH})

Generate a realistic trade proposal. Consider:
1. The user's balance and risk tolerance
2. A reasonable swap amount (not the entire balance)
3. Realistic expected output based on current approximate rates (1 ETH ~ 3300 USDC)
4. Appropriate slippage tolerance (10-100 basis points for normal conditions)
5. Clear reasoning explaining why this trade makes sense

Respond with a JSON object containing:
- action: "swap", "rebalance", or "dca"
- tokenIn: "USDC" or "WETH"
- tokenOut: "USDC" or "WETH" (different from tokenIn)
- amountIn: amount as string (e.g., "100" for 100 USDC or "0.05" for 0.05 WETH)
- expectedAmountOut: expected output amount as string
- maxSlippage: slippage in basis points (e.g., 50 for 0.5%)
- reasoning: 1-2 sentence explanation
- confidence: 0-100 score
- riskLevel: "low", "medium", or "high"`
}

interface GroqProposalResponse {
  action: 'swap' | 'rebalance' | 'dca'
  tokenIn: 'USDC' | 'WETH'
  tokenOut: 'USDC' | 'WETH'
  amountIn: string
  expectedAmountOut: string
  maxSlippage: number
  reasoning: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
}

export async function generateProposal(request: ProposalRequest): Promise<TradeProposal> {
  const isMockMode = process.env.GROQ_MOCK === 'true'

  if (isMockMode) {
    console.log('[Orchestrator] Mock mode enabled, returning fallback proposal')
    return {
      ...FALLBACK_PROPOSAL,
      id: `fallback-${Date.now()}`,
      agentId: request.agentId,
      deadline: Date.now() + 3600000,
    }
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.warn('[Orchestrator] GROQ_API_KEY not set, returning fallback proposal')
    return {
      ...FALLBACK_PROPOSAL,
      id: `fallback-${Date.now()}`,
      agentId: request.agentId,
      deadline: Date.now() + 3600000,
    }
  }

  try {
    const groq = new Groq({ apiKey })

    const prompt = buildPrompt(request)

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a DeFi trading agent. Always respond with valid JSON matching the requested schema. Never include markdown code blocks or extra text.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from Groq')
    }

    const parsed: GroqProposalResponse = JSON.parse(content)

    if (!parsed.action || !parsed.tokenIn || !parsed.tokenOut || !parsed.amountIn) {
      throw new Error('Invalid proposal structure from LLM')
    }

    // Validate action
    const validActions = ['swap', 'rebalance', 'dca'] as const
    if (!validActions.includes(parsed.action)) {
      parsed.action = 'swap'
    }

    // Validate amountIn
    const amountInNum = parseFloat(parsed.amountIn)
    if (isNaN(amountInNum) || amountInNum <= 0 || amountInNum > 1_000_000) {
      throw new Error(`Invalid amountIn from LLM: ${parsed.amountIn}`)
    }

    // Validate expectedAmountOut
    if (parsed.expectedAmountOut) {
      const expectedNum = parseFloat(parsed.expectedAmountOut)
      if (isNaN(expectedNum) || expectedNum < 0 || expectedNum > 10_000_000) {
        parsed.expectedAmountOut = '0'
      }
    }

    // Validate maxSlippage (0-10000 bps)
    if (typeof parsed.maxSlippage !== 'number' || parsed.maxSlippage < 0 || parsed.maxSlippage > 10_000) {
      parsed.maxSlippage = 50
    }

    // Validate confidence (0-100)
    if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 100) {
      parsed.confidence = 50
    }

    // Validate riskLevel
    const validRiskLevels = ['low', 'medium', 'high'] as const
    if (!validRiskLevels.includes(parsed.riskLevel)) {
      parsed.riskLevel = 'medium'
    }

    const tokenAddresses: Record<string, string> = {
      USDC: TOKENS.USDC,
      WETH: TOKENS.WETH,
    }

    const proposal: TradeProposal = {
      id: `proposal-${Date.now()}-${crypto.randomUUID().split('-')[0]}`,
      agentId: request.agentId,
      agentName: request.agentProfile?.name || 'AI Trading Agent',
      pair: {
        tokenIn: {
          symbol: parsed.tokenIn,
          address: tokenAddresses[parsed.tokenIn] || TOKENS.USDC,
        },
        tokenOut: {
          symbol: parsed.tokenOut,
          address: tokenAddresses[parsed.tokenOut] || TOKENS.WETH,
        },
      },
      action: parsed.action,
      amountIn: parsed.amountIn,
      expectedAmountOut: parsed.expectedAmountOut,
      maxSlippage: parsed.maxSlippage,
      deadline: Date.now() + 3600000,
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      riskLevel: parsed.riskLevel,
    }

    console.log('[Orchestrator] Generated proposal:', proposal.id)
    return proposal
  } catch (error) {
    console.error('[Orchestrator] Failed to generate proposal:', error)

    return {
      ...FALLBACK_PROPOSAL,
      id: `fallback-${Date.now()}`,
      agentId: request.agentId,
      deadline: Date.now() + 3600000,
    }
  }
}

export { FALLBACK_PROPOSAL }
