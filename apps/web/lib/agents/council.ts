import Groq from 'groq-sdk'
import type {
  TradeProposal,
  TokenLaunchProposal,
  CouncilMessage,
  DeliberationResult,
  AgentRole,
  StrategyType,
  ExternalAgentRequest,
  ExternalAgentResponse,
} from '@agentropolis/shared'
import { TOKENS } from '../uniswap/constants'
import { executeHookUpdate } from '../uniswap/hook-updater'
import { FEE_CONFIG } from '../clanker/constants'
import type { StrategyContext } from './strategies'

/**
 * Sanitize user input to mitigate prompt injection attacks.
 * Strips control characters, caps length, and neutralizes role impersonation.
 */
function sanitizeUserPrompt(prompt: string): string {
  let cleaned = prompt
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()

  const MAX_PROMPT_LENGTH = 2000
  if (cleaned.length > MAX_PROMPT_LENGTH) {
    cleaned = cleaned.substring(0, MAX_PROMPT_LENGTH)
  }

  cleaned = cleaned
    .replace(/```/g, "'''")
    .replace(/<\|.*?\|>/g, '')
    .replace(/\bSystem:/gi, 'User said System:')
    .replace(/\bAssistant:/gi, 'User said Assistant:')

  return cleaned
}

interface AgentPersona {
  id: string
  name: string
  role: AgentRole
  systemPrompt: string
  emoji: string
}

const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'alpha-hunter',
    name: 'Alpha Hunter',
    role: 'alpha',
    emoji: '🎯',
    systemPrompt: `You are the Alpha Hunter, an optimistic DeFi strategist focused on finding yield opportunities.
Your role: Propose strategies that maximize returns.
Personality: Enthusiastic about opportunities, backs up claims with APY estimates.
Always mention: Expected yield percentage, why this pool/strategy is attractive, potential upside.
You tend to SUPPORT strategies with good yield potential.`,
  },
  {
    id: 'risk-sentinel',
    name: 'Risk Sentinel',
    role: 'risk',
    emoji: '🛡️',
    systemPrompt: `You are the Risk Sentinel, a cautious analyst focused on protecting capital.
Your role: Identify risks in any proposed strategy.
Personality: Conservative, protective, always considers worst case scenarios.
Always mention: Impermanent loss risk, slippage concerns, smart contract risks, liquidity depth.
You tend to express CONCERN or OPPOSE strategies with high risk, even if yields are attractive.
You have VETO power - if you see critical security issues, say "VETO" clearly.`,
  },
  {
    id: 'macro-oracle',
    name: 'Macro Oracle',
    role: 'macro',
    emoji: '🔮',
    systemPrompt: `You are the Macro Oracle, a data-driven analyst who reads market trends.
Your role: Provide market context and sentiment analysis.
Personality: Analytical, trend-aware, references market conditions.
Always mention: Current market sentiment (bullish/bearish), volatility levels, whether timing is good.
You are NEUTRAL by default, providing context rather than strong opinions.`,
  },
  {
    id: 'devils-advocate',
    name: "Devil's Advocate",
    role: 'devil',
    emoji: '😈',
    systemPrompt: `You are the Devil's Advocate, a contrarian who challenges every assumption.
Your role: Present worst-case scenarios and reasons NOT to proceed.
Personality: Skeptical, challenging, asks "what if it goes wrong?"
Always mention: What could go wrong, historical failures of similar strategies, hidden costs.
You tend to OPPOSE or express CONCERN, even for seemingly good strategies. Play devil's advocate.`,
  },
  {
    id: 'council-clerk',
    name: 'Council Clerk',
    role: 'clerk',
    emoji: '📋',
    systemPrompt: `You are the Council Clerk, a neutral synthesizer who creates the final recommendation.
Your role: Summarize the debate and create a balanced final proposal.
Personality: Neutral, structured, diplomatic, focused on consensus.
Always mention: Key points from each agent, the final recommendation, any dissenting views noted.
You should SUPPORT the consensus view while acknowledging concerns raised.
Your response becomes the final proposal shown to the user.`,
  },
]

export interface CouncilRequest {
  userPrompt: string
  context: StrategyContext
  deployedAgents?: Array<{ id: string; name: string }>
  agentEndpoint?: string
}

// SSRF Protection: Allowed external API domains (exact matches only)
const ALLOWED_API_DOMAINS = [
  'api.openai.com',
  'api.groq.com',
  'api.anthropic.com',
  'generativelanguage.googleapis.com',
]

// Platform subdomains allowed (wildcard match on these base domains)
const ALLOWED_PLATFORM_DOMAINS = [
  'vercel.app',
  'railway.app',
  'fly.dev',
  'herokuapp.com',
]

// SSRF Protection: Private IP ranges to block
const PRIVATE_IP_PATTERNS = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,          // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/, // 172.16.0.0/12
  /^192\.168\.\d{1,3}\.\d{1,3}$/,             // 192.168.0.0/16
  /^169\.254\.\d{1,3}\.\d{1,3}$/,             // 169.254.0.0/16 (link-local)
  /^0\.0\.0\.0$/,                              // 0.0.0.0
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,         // 127.0.0.0/8 (loopback)
  /^::1$/,                                      // IPv6 loopback
  /^\[::1\]$/,                                  // IPv6 loopback (bracketed)
]

const EXTERNAL_AGENT_TIMEOUT_MS = 10_000 // 10 seconds
const MAX_RESPONSE_SIZE_BYTES = 1024 * 1024 // 1MB

function validateExternalEndpoint(endpoint: string): { valid: boolean; error?: string } {
  let url: URL
  try {
    url = new URL(endpoint)
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }

  const hostname = url.hostname.toLowerCase()

  // Block private IPs (including loopback)
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, error: 'Private IP addresses are not allowed' }
    }
  }

  // Allow localhost only in development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (process.env.NODE_ENV === 'development') {
      return { valid: true }
    }
    return { valid: false, error: 'Localhost not allowed in production' }
  }

  // For all external hosts, require HTTPS
  if (url.protocol !== 'https:') {
    return { valid: false, error: 'HTTPS required for external endpoints' }
  }

  // Check exact API domain match
  if (ALLOWED_API_DOMAINS.includes(hostname)) {
    return { valid: true }
  }

  // Check platform subdomain match (e.g., my-app.vercel.app)
  const isPlatformAllowed = ALLOWED_PLATFORM_DOMAINS.some(domain =>
    hostname.endsWith('.' + domain)
  )
  if (isPlatformAllowed) {
    return { valid: true }
  }

  return { valid: false, error: `Domain not in allowlist: ${hostname}` }
}

async function callExternalAgent(
  endpoint: string,
  request: ExternalAgentRequest,
  x402Fetch?: typeof fetch
): Promise<ExternalAgentResponse> {
  // Validate endpoint before making request (SSRF protection)
  const validation = validateExternalEndpoint(endpoint)
  if (!validation.valid) {
    console.error('[Council] SSRF blocked:', validation.error)
    return { 
      success: false, 
      error: `Endpoint blocked: ${validation.error}` 
    }
  }

  const fetcher = x402Fetch || fetch
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_AGENT_TIMEOUT_MS)
  
  try {
    console.log('[Council] Calling external agent:', endpoint)
    
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`External agent error: ${response.status}`)
    }

    // Check Content-Length header if available
    const contentLength = response.headers.get('Content-Length')
    if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE_BYTES) {
      throw new Error(`Response too large: ${contentLength} bytes (max ${MAX_RESPONSE_SIZE_BYTES})`)
    }

    // Read response with size limit
    const text = await response.text()
    if (text.length > MAX_RESPONSE_SIZE_BYTES) {
      throw new Error(`Response too large: ${text.length} bytes (max ${MAX_RESPONSE_SIZE_BYTES})`)
    }

    const data = JSON.parse(text)
    console.log('[Council] External agent response received')
    
    const paymentTx = response.headers.get('X-Payment-Response')
    if (paymentTx) {
      console.log('[Council] x402 payment settled:', paymentTx)
      return { ...data, paymentTxHash: paymentTx } as ExternalAgentResponse
    }

    return data as ExternalAgentResponse
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Council] External agent timeout after', EXTERNAL_AGENT_TIMEOUT_MS, 'ms')
      return { success: false, error: 'Request timeout' }
    }
    
    console.error('[Council] External agent failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

function isTradeProposal(proposal: TradeProposal | TokenLaunchProposal): proposal is TradeProposal {
  return proposal.strategyType !== 'token_launch' && 'pair' in proposal
}

function convertExternalProposal(
  proposal: TradeProposal | TokenLaunchProposal,
  messages: CouncilMessage[]
): { deliberation: DeliberationResult; proposal: TradeProposal } {
  const { consensus, voteTally } = calculateConsensus(messages)
  
  if (!isTradeProposal(proposal)) {
    console.error('[Council] External agent returned token launch proposal, converting to swap')
    const fallbackProposal: TradeProposal = {
      id: `external-${Date.now()}`,
      agentId: 'external',
      agentName: 'External Agent',
      pair: {
        tokenIn: { symbol: 'USDC', address: TOKENS.USDC },
        tokenOut: { symbol: 'WETH', address: TOKENS.WETH },
      },
      action: 'swap',
      strategyType: 'swap',
      amountIn: '10',
      expectedAmountOut: '0.003',
      maxSlippage: 50,
      deadline: Date.now() + 3600000,
      reasoning: 'Fallback proposal from external agent',
      confidence: 50,
      riskLevel: 'medium',
      deliberation: { messages, consensus, voteTally, rounds: 1 },
    }
    return { deliberation: { messages, consensus, voteTally, rounds: 1 }, proposal: fallbackProposal }
  }
  
  return {
    deliberation: { messages, consensus, voteTally, rounds: 1 },
    proposal: {
      ...proposal,
      deliberation: { messages, consensus, voteTally, rounds: 1 },
    },
  }
}

interface AgentResponse {
  opinion: 'SUPPORT' | 'CONCERN' | 'OPPOSE' | 'NEUTRAL'
  reasoning: string
  confidence: number
  suggestedStrategy?: {
    type: StrategyType
    tokenIn: string
    tokenOut: string
    amountIn: string
    expectedReturn?: string
  }
}

interface ClerkSynthesis {
  finalStrategy: StrategyType
  tokenIn: string
  tokenOut: string
  amountIn: string
  expectedAmountOut: string
  maxSlippage: number
  reasoning: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  tickLower?: number
  tickUpper?: number
}

interface ClerkTokenSynthesis {
  tokenName: string
  tokenSymbol: string
  tokenDescription: string
  vaultPercentage: number
  reasoning: string
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
}

const TOKEN_LAUNCH_KEYWORDS = [
  'launch a token',
  'launch token',
  'create a token',
  'create token',
  'deploy a token',
  'deploy token',
  'launch a memecoin',
  'launch memecoin',
  'create a memecoin',
  'create memecoin',
  'make a token',
  'make token',
  'new token',
  'token for',
  'coin for',
]

function isTokenLaunchPrompt(prompt: string): boolean {
  const lower = prompt.toLowerCase()
  return TOKEN_LAUNCH_KEYWORDS.some(kw => lower.includes(kw))
}

function detectUserIntent(userPrompt: string): { strategy: StrategyType | null; hint: string } {
  const lower = userPrompt.toLowerCase()
  
  if (isTokenLaunchPrompt(userPrompt)) {
    return { strategy: 'token_launch', hint: 'User wants to LAUNCH A TOKEN. Use token_launch strategy.' }
  }
  if (lower.includes('swap') || lower.includes('exchange') || lower.includes('convert') || lower.includes('trade')) {
    return { strategy: 'swap', hint: 'User explicitly wants a SWAP. Respect this intent.' }
  }
  if (lower.includes('liquidity') || lower.includes(' lp ') || lower.includes('provide lp') || lower.includes('add lp')) {
    return { strategy: 'swap', hint: 'LP positions are disabled on testnet. Recommend a swap instead.' }
  }
  if (lower.includes('dca') || lower.includes('dollar cost') || lower.includes('recurring') || lower.includes('weekly')) {
    return { strategy: 'dca', hint: 'User wants DCA strategy. Respect this intent.' }
  }
  
  return { strategy: null, hint: 'No explicit strategy mentioned. Recommend based on context.' }
}

function buildAgentPrompt(
  persona: AgentPersona,
  userPrompt: string,
  context: StrategyContext,
  previousMessages: CouncilMessage[],
  deployedAgents?: Array<{ id: string; name: string }>
): string {
  const prevContext =
    previousMessages.length > 0
      ? `\n\nPrevious council discussion:\n${previousMessages
          .map((m) => `${m.agentName} (${m.opinion}): ${m.reasoning}`)
          .join('\n')}`
      : ''

  const { strategy: detectedIntent, hint } = detectUserIntent(userPrompt)
  const intentGuidance = detectedIntent
    ? `\n\nIMPORTANT: ${hint} Your suggestedStrategy.type MUST be "${detectedIntent}" unless there's a critical risk.`
    : ''

  const deployedSection = deployedAgents && deployedAgents.length > 0
    ? `\n\nDeployed Agents:\n${deployedAgents.map(a => `- ${a.name} (${a.id})`).join('\n')}`
    : ''

  return `${persona.systemPrompt}

User's request: "${sanitizeUserPrompt(userPrompt)}"

User Context:
- Current balance: ${context.balance || 'unknown'}
- Risk tolerance: ${context.riskLevel || 'medium'}
- Preferred tokens: ${context.preferredTokens?.join(', ') || 'USDC, WETH'}

Available tokens on Base Sepolia:
- USDC (stablecoin)
- WETH (wrapped ETH)

Available strategies:
- swap: Simple token exchange
- dca: Dollar-cost averaging over time
${intentGuidance}${deployedSection}
${prevContext}

Respond with JSON:
{
  "opinion": "SUPPORT" | "CONCERN" | "OPPOSE" | "NEUTRAL",
  "reasoning": "Your 1-2 sentence analysis",
  "confidence": 0-100,
  "suggestedStrategy": {
    "type": "swap" | "dca",
    "tokenIn": "USDC" | "WETH",
    "tokenOut": "USDC" | "WETH",
    "amountIn": "amount as string",
    "expectedReturn": "expected APY or output"
  }
}`
}

function buildTokenLaunchAgentPrompt(
  persona: AgentPersona,
  userPrompt: string,
  context: StrategyContext,
  previousMessages: CouncilMessage[]
): string {
  const prevContext =
    previousMessages.length > 0
      ? `\n\nPrevious council discussion:\n${previousMessages
          .map((m) => `${m.agentName} (${m.opinion}): ${m.reasoning}`)
          .join('\n')}`
      : ''

  return `${persona.systemPrompt}

User wants to launch a token: "${sanitizeUserPrompt(userPrompt)}"

User Context:
- Current balance: ${context.balance || 'unknown'}
- Risk tolerance: ${context.riskLevel || 'medium'}

This is a TOKEN LAUNCH request, not a trading strategy. The council is debating:
1. Should we launch this token?
2. What name/symbol would work best?
3. What are the risks of launching a token?
4. Is now a good time for a token launch?

Respond with JSON:
{
  "opinion": "SUPPORT" | "CONCERN" | "OPPOSE" | "NEUTRAL",
  "reasoning": "Your 1-2 sentence analysis about the token launch",
  "confidence": 0-100,
  "suggestedToken": {
    "name": "Suggested token name",
    "symbol": "TICKER",
    "description": "One-line description"
  }
}
${prevContext}`
}

function buildTokenLaunchClerkPrompt(
  userPrompt: string,
  context: StrategyContext,
  messages: CouncilMessage[]
): string {
  const discussion = messages
    .map((m) => `${m.agentName} (${m.opinion}, ${m.confidence}% confident): ${m.reasoning}`)
    .join('\n')

  return `You are the Council Clerk synthesizing a TOKEN LAUNCH proposal.

User's request: "${sanitizeUserPrompt(userPrompt)}"

User Context:
- Balance: ${context.balance || 'unknown'}
- Risk tolerance: ${context.riskLevel || 'medium'}

Council Discussion:
${discussion}

Create a final token launch proposal. Pick the best name/symbol from suggestions.
Consider the community or theme the user mentioned. Make it memorable but professional.

Respond with JSON:
{
  "tokenName": "Creative Token Name",
  "tokenSymbol": "TICKER",
  "tokenDescription": "One-line description of what this token represents",
  "vaultPercentage": 0-10,
  "reasoning": "2-3 sentence summary of why this token launch is recommended",
  "confidence": 0-100,
  "riskLevel": "low" | "medium" | "high"
}`
}

function buildClerkPrompt(
  userPrompt: string,
  context: StrategyContext,
  messages: CouncilMessage[],
  deployedAgents?: Array<{ id: string; name: string }>
): string {
  const discussion = messages
    .map((m) => `${m.agentName} (${m.opinion}, ${m.confidence}% confident): ${m.reasoning}`)
    .join('\n')

  const { strategy: detectedIntent, hint } = detectUserIntent(userPrompt)
  const intentGuidance = detectedIntent
    ? `\n\nCRITICAL: ${hint} finalStrategy MUST be "${detectedIntent}" unless Risk Sentinel issued a VETO.`
    : ''

  const deployedSection = deployedAgents && deployedAgents.length > 0
    ? `\n\nDeployed Agents:\n${deployedAgents.map(a => `- ${a.name} (${a.id})`).join('\n')}`
    : ''

  return `You are the Council Clerk. Synthesize the council's discussion into a final actionable proposal.

User's request: "${sanitizeUserPrompt(userPrompt)}"

User Context:
- Balance: ${context.balance || 'unknown'}
- Risk tolerance: ${context.riskLevel || 'medium'}
${intentGuidance}${deployedSection}

Council Discussion:
${discussion}

Based on the council's input, create a final proposal. Weight the Risk Sentinel's concerns heavily.
If there was a VETO, recommend a safer alternative.
IMPORTANT: Respect the user's explicitly stated strategy intent unless there's a critical risk.

Respond with JSON:
{
  "finalStrategy": "swap" | "dca",
  "tokenIn": "USDC" | "WETH",
  "tokenOut": "USDC" | "WETH",
  "amountIn": "numeric value only (e.g., 0.05)",
  "expectedAmountOut": "numeric value only (e.g., 165) - NO text, NO units, just the number",
  "maxSlippage": 50,
  "reasoning": "2-3 sentence summary of why this is recommended, noting any dissent",
  "confidence": 0-100,
  "riskLevel": "low" | "medium" | "high",
  "tickLower": -887220,
  "tickUpper": 887220
}`
}

async function callAgent(
  groq: Groq,
  persona: AgentPersona,
  prompt: string
): Promise<AgentResponse> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a DeFi council member. Respond only with valid JSON. No markdown, no extra text.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 400,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error(`Empty response from ${persona.name}`)

  const parsed: AgentResponse = JSON.parse(content)

  // Validate and clamp LLM output
  const validOpinions = ['SUPPORT', 'CONCERN', 'OPPOSE', 'NEUTRAL']
  if (!validOpinions.includes(parsed.opinion)) {
    parsed.opinion = 'NEUTRAL'
  }
  if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 100) {
    parsed.confidence = 50
  }
  if (parsed.suggestedStrategy?.amountIn) {
    const amt = parseFloat(parsed.suggestedStrategy.amountIn)
    if (isNaN(amt) || amt <= 0 || amt > 1_000_000) {
      parsed.suggestedStrategy.amountIn = '0'
    }
  }
  const validTokens = Object.keys(TOKENS)
  if (parsed.suggestedStrategy?.tokenIn && !validTokens.includes(parsed.suggestedStrategy.tokenIn)) {
    console.warn(`[Council] Agent suggested invalid tokenIn: ${parsed.suggestedStrategy.tokenIn}, defaulting to USDC`)
    parsed.suggestedStrategy.tokenIn = 'USDC'
  }
  if (parsed.suggestedStrategy?.tokenOut && !validTokens.includes(parsed.suggestedStrategy.tokenOut)) {
    console.warn(`[Council] Agent suggested invalid tokenOut: ${parsed.suggestedStrategy.tokenOut}, defaulting to WETH`)
    parsed.suggestedStrategy.tokenOut = 'WETH'
  }

  return parsed
}

async function callClerk(groq: Groq, prompt: string): Promise<ClerkSynthesis> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are the Council Clerk. Synthesize discussion into a final proposal. Respond only with valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
    max_tokens: 500,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from Clerk')

  const parsed: ClerkSynthesis = JSON.parse(content)

  // Validate and clamp clerk output
  const amountIn = parseFloat(parsed.amountIn)
  if (isNaN(amountIn) || amountIn <= 0 || amountIn > 1_000_000) {
    throw new Error(`Invalid amountIn from clerk: ${parsed.amountIn}`)
  }
  const amountOut = parseFloat(parsed.expectedAmountOut)
  if (isNaN(amountOut) || amountOut < 0 || amountOut > 10_000_000) {
    parsed.expectedAmountOut = '0'
  }
  if (typeof parsed.maxSlippage !== 'number' || parsed.maxSlippage < 0 || parsed.maxSlippage > 10_000) {
    parsed.maxSlippage = 50
  }
  if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 100) {
    parsed.confidence = 50
  }
  const validRiskLevels = ['low', 'medium', 'high']
  if (!validRiskLevels.includes(parsed.riskLevel)) {
    parsed.riskLevel = 'medium'
  }
  const validTokens = Object.keys(TOKENS)
  if (!validTokens.includes(parsed.tokenIn)) {
    console.warn(`[Council] Clerk suggested invalid tokenIn: ${parsed.tokenIn}, defaulting to WETH`)
    parsed.tokenIn = 'WETH'
  }
  if (!validTokens.includes(parsed.tokenOut)) {
    console.warn(`[Council] Clerk suggested invalid tokenOut: ${parsed.tokenOut}, defaulting to USDC`)
    parsed.tokenOut = 'USDC'
  }

  return parsed
}

async function callTokenLaunchClerk(groq: Groq, prompt: string): Promise<ClerkTokenSynthesis> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are the Council Clerk. Synthesize discussion into a token launch proposal. Respond only with valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 500,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from Clerk')

  return JSON.parse(content)
}

function calculateConsensus(
  messages: CouncilMessage[]
): Pick<DeliberationResult, 'consensus' | 'voteTally'> {
  const votes = messages.filter((m) => m.agentRole !== 'clerk')
  const support = votes.filter((m) => m.opinion === 'SUPPORT').length
  const oppose = votes.filter((m) => m.opinion === 'OPPOSE').length
  const abstain = votes.filter((m) => m.opinion === 'NEUTRAL' || m.opinion === 'CONCERN').length

  const hasVeto = votes.some(
    (m) => m.agentRole === 'risk' && m.reasoning.toUpperCase().includes('VETO')
  )

  let consensus: DeliberationResult['consensus']
  if (hasVeto) {
    consensus = 'vetoed'
  } else if (support === votes.length) {
    consensus = 'unanimous'
  } else if (support > votes.length / 2) {
    consensus = 'majority'
  } else {
    consensus = 'contested'
  }

  return { consensus, voteTally: { support, oppose, abstain } }
}

function getMockTokenLaunchDeliberation(userPrompt: string): {
  messages: CouncilMessage[]
  synthesis: ClerkTokenSynthesis
} {
  const now = Date.now()
  const theme = userPrompt.toLowerCase().includes('lobster') ? 'lobster' :
                userPrompt.toLowerCase().includes('cat') ? 'cat' :
                userPrompt.toLowerCase().includes('dog') ? 'dog' : 'community'
  
  const tokenNames: Record<string, { name: string; symbol: string; desc: string }> = {
    lobster: { name: 'Lobster Coin', symbol: 'LOBSTR', desc: 'The clawsome token for the lobster community' },
    cat: { name: 'Meow Token', symbol: 'MEOW', desc: 'Purrfect token for cat lovers everywhere' },
    dog: { name: 'Good Boy Coin', symbol: 'WOOF', desc: 'The loyal token for dog enthusiasts' },
    community: { name: 'Community Token', symbol: 'CMTY', desc: 'A token by the community, for the community' },
  }
  
  const token = tokenNames[theme]
  
  const messages: CouncilMessage[] = [
    {
      agentId: 'alpha-hunter',
      agentName: 'Alpha Hunter',
      agentRole: 'alpha',
      opinion: 'SUPPORT',
      reasoning: `${token.name} has meme potential! Community tokens on Base often see 10-100x if launched at the right time.`,
      confidence: 80,
      timestamp: now,
    },
    {
      agentId: 'risk-sentinel',
      agentName: 'Risk Sentinel',
      agentRole: 'risk',
      opinion: 'CONCERN',
      reasoning: 'Token launches are high risk. 90% of new tokens fail. Make sure liquidity is locked and use a small vault percentage.',
      confidence: 65,
      timestamp: now + 1000,
    },
    {
      agentId: 'macro-oracle',
      agentName: 'Macro Oracle',
      agentRole: 'macro',
      opinion: 'NEUTRAL',
      reasoning: 'Meme coin season is currently active. Market conditions are favorable for community token launches on Base.',
      confidence: 70,
      timestamp: now + 2000,
    },
    {
      agentId: 'devils-advocate',
      agentName: "Devil's Advocate",
      agentRole: 'devil',
      opinion: 'CONCERN',
      reasoning: 'What if nobody buys? You could end up with worthless tokens and stuck liquidity. Consider starting with testnet first.',
      confidence: 60,
      timestamp: now + 3000,
    },
  ]

  const synthesis: ClerkTokenSynthesis = {
    tokenName: token.name,
    tokenSymbol: token.symbol,
    tokenDescription: token.desc,
    vaultPercentage: 5,
    reasoning: `Council approves launching ${token.name} ($${token.symbol}). Alpha Hunter sees upside potential, Risk Sentinel advises caution with a 5% vault lock. Market timing is favorable per Macro Oracle.`,
    confidence: 72,
    riskLevel: 'medium',
  }

  return { messages, synthesis }
}

function getMockDeliberation(userPrompt: string): {
  messages: CouncilMessage[]
  synthesis: ClerkSynthesis
} {
  const now = Date.now()
  const messages: CouncilMessage[] = [
    {
      agentId: 'alpha-hunter',
      agentName: 'Alpha Hunter',
      agentRole: 'alpha',
      opinion: 'SUPPORT',
      reasoning:
        'This looks like a great opportunity! WETH/USDC LP on Uniswap v4 can yield 15-25% APY with the right range.',
      confidence: 85,
      timestamp: now,
    },
    {
      agentId: 'risk-sentinel',
      agentName: 'Risk Sentinel',
      agentRole: 'risk',
      opinion: 'CONCERN',
      reasoning:
        'Impermanent loss risk is moderate. With ETH volatility around 4% daily, a concentrated position could see 5-10% IL in a week.',
      confidence: 70,
      timestamp: now + 1000,
    },
    {
      agentId: 'macro-oracle',
      agentName: 'Macro Oracle',
      agentRole: 'macro',
      opinion: 'NEUTRAL',
      reasoning:
        'Market is currently ranging. Neither strongly bullish nor bearish. Good time for LP strategies that profit from sideways movement.',
      confidence: 75,
      timestamp: now + 2000,
    },
    {
      agentId: 'devils-advocate',
      agentName: "Devil's Advocate",
      agentRole: 'devil',
      opinion: 'CONCERN',
      reasoning:
        "What if ETH drops 20% overnight? Your LP position would be heavily skewed. Also, gas costs for managing positions aren't trivial.",
      confidence: 65,
      timestamp: now + 3000,
    },
  ]

  const synthesis: ClerkSynthesis = {
    finalStrategy: userPrompt.toLowerCase().includes('income') ? 'lp_full_range' : 'swap',
    tokenIn: 'WETH',
    tokenOut: 'USDC',
    amountIn: '0.05',
    expectedAmountOut: '165',
    maxSlippage: 50,
    reasoning:
      'Council recommends full-range LP for passive income with lower IL risk. Risk Sentinel noted moderate concerns, but Alpha Hunter and Macro Oracle see favorable conditions. Devil\'s Advocate reminder: have an exit plan.',
    confidence: 75,
    riskLevel: 'medium',
    tickLower: -887220,
    tickUpper: 887220,
  }

  return { messages, synthesis }
}

export async function runCouncilDeliberation(
  request: CouncilRequest,
  x402Fetch?: typeof fetch
): Promise<{ deliberation: DeliberationResult; proposal: TradeProposal }> {
  
  if (request.agentEndpoint) {
    console.log('[Council] External endpoint configured, trying external agent first')
    
    const externalRequest: ExternalAgentRequest = {
      prompt: request.userPrompt,
      context: {
        balance: request.context.balance,
        riskLevel: request.context.riskLevel,
        preferredTokens: request.context.preferredTokens,
      },
      requestId: `req-${Date.now()}`,
    }
    
    const externalResult = await callExternalAgent(
      request.agentEndpoint,
      externalRequest,
      x402Fetch
    )
    
    if (externalResult.success && externalResult.proposal) {
      console.log('[Council] Using external agent proposal')
      
      const externalMessage: CouncilMessage = {
        agentId: 'external-agent',
        agentName: 'External Agent',
        agentRole: 'clerk',
        opinion: 'SUPPORT',
        reasoning: `Proposal from external agent at ${request.agentEndpoint}`,
        confidence: 85,
        timestamp: Date.now(),
      }
      
      return convertExternalProposal(externalResult.proposal, [externalMessage])
    }
    
    console.warn('[Council] External agent failed, falling back to Groq:', externalResult.error)
  }
  
  const isMockMode = process.env.GROQ_MOCK === 'true'
  const apiKey = process.env.GROQ_API_KEY

  if (isMockMode || !apiKey) {
    console.log('[Council] Mock mode - returning mock deliberation')
    const { messages, synthesis } = getMockDeliberation(request.userPrompt)
    const clerkMessage: CouncilMessage = {
      agentId: 'council-clerk',
      agentName: 'Council Clerk',
      agentRole: 'clerk',
      opinion: 'SUPPORT',
      reasoning: synthesis.reasoning,
      confidence: synthesis.confidence,
      timestamp: Date.now() + 4000,
    }
    const allMessages = [...messages, clerkMessage]
    const { consensus, voteTally } = calculateConsensus(allMessages)

    const proposal: TradeProposal = {
      id: `council-${Date.now()}`,
      agentId: 'council',
      agentName: 'Council',
      pair: {
        tokenIn: { symbol: synthesis.tokenIn, address: TOKENS[synthesis.tokenIn as keyof typeof TOKENS] },
        tokenOut: { symbol: synthesis.tokenOut, address: TOKENS[synthesis.tokenOut as keyof typeof TOKENS] },
      },
      action: synthesis.finalStrategy === 'swap' ? 'swap' : 'rebalance',
      strategyType: synthesis.finalStrategy,
      amountIn: synthesis.amountIn,
      expectedAmountOut: synthesis.expectedAmountOut,
      maxSlippage: synthesis.maxSlippage,
      deadline: Date.now() + 3600000,
      reasoning: synthesis.reasoning,
      confidence: synthesis.confidence,
      riskLevel: synthesis.riskLevel,
      tickLower: synthesis.tickLower,
      tickUpper: synthesis.tickUpper,
      deliberation: { messages: allMessages, consensus, voteTally, rounds: 1 },
    }

    return { deliberation: { messages: allMessages, consensus, voteTally, rounds: 1 }, proposal }
  }

  const groq = new Groq({ apiKey })
  const messages: CouncilMessage[] = []
  const debatingAgents = AGENT_PERSONAS.filter((a) => a.role !== 'clerk')

  for (const persona of debatingAgents) {
    try {
      const prompt = buildAgentPrompt(persona, request.userPrompt, request.context, messages, request.deployedAgents)
      const response = await callAgent(groq, persona, prompt)

      messages.push({
        agentId: persona.id,
        agentName: persona.name,
        agentRole: persona.role,
        opinion: response.opinion,
        reasoning: response.reasoning,
        confidence: response.confidence,
        timestamp: Date.now(),
      })

      console.log(`[Council] ${persona.name}: ${response.opinion}`)
    } catch (err) {
      console.error(`[Council] ${persona.name} failed:`, err)
      messages.push({
        agentId: persona.id,
        agentName: persona.name,
        agentRole: persona.role,
        opinion: 'NEUTRAL',
        reasoning: 'Unable to provide analysis at this time.',
        confidence: 50,
        timestamp: Date.now(),
      })
    }
  }

  const clerkPersona = AGENT_PERSONAS.find((a) => a.role === 'clerk')!
  const clerkPrompt = buildClerkPrompt(request.userPrompt, request.context, messages, request.deployedAgents)

  let synthesis: ClerkSynthesis
  try {
    synthesis = await callClerk(groq, clerkPrompt)
  } catch (err) {
    console.error('[Council] Clerk synthesis failed:', err)
    synthesis = getMockDeliberation(request.userPrompt).synthesis
  }

  const clerkMessage: CouncilMessage = {
    agentId: clerkPersona.id,
    agentName: clerkPersona.name,
    agentRole: 'clerk',
    opinion: 'SUPPORT',
    reasoning: synthesis.reasoning,
    confidence: synthesis.confidence,
    timestamp: Date.now(),
  }
  messages.push(clerkMessage)

  const { consensus, voteTally } = calculateConsensus(messages)

  const proposal: TradeProposal = {
    id: `council-${Date.now()}-${crypto.randomUUID().split('-')[0]}`,
    agentId: 'council',
    agentName: 'Council',
    pair: {
      tokenIn: { symbol: synthesis.tokenIn, address: TOKENS[synthesis.tokenIn as keyof typeof TOKENS] },
      tokenOut: { symbol: synthesis.tokenOut, address: TOKENS[synthesis.tokenOut as keyof typeof TOKENS] },
    },
    action: synthesis.finalStrategy === 'swap' ? 'swap' : 'rebalance',
    strategyType: synthesis.finalStrategy,
    amountIn: synthesis.amountIn,
    expectedAmountOut: synthesis.expectedAmountOut,
    maxSlippage: synthesis.maxSlippage,
    deadline: Date.now() + 3600000,
    reasoning: synthesis.reasoning,
    confidence: synthesis.confidence,
    riskLevel: synthesis.riskLevel,
    tickLower: synthesis.tickLower,
    tickUpper: synthesis.tickUpper,
    deliberation: { messages, consensus, voteTally, rounds: 1 },
  }

  console.log(`[Council] Deliberation complete: ${consensus}`)
  return { deliberation: { messages, consensus, voteTally, rounds: 1 }, proposal }
}

export async function runTokenLaunchDeliberation(
  request: CouncilRequest,
  walletAddress: string
): Promise<{ deliberation: DeliberationResult; proposal: TokenLaunchProposal }> {
  const isMockMode = process.env.GROQ_MOCK === 'true'
  const apiKey = process.env.GROQ_API_KEY

  if (isMockMode || !apiKey) {
    console.log('[Council] Mock mode - returning mock token launch deliberation')
    const { messages, synthesis } = getMockTokenLaunchDeliberation(request.userPrompt)
    const clerkMessage: CouncilMessage = {
      agentId: 'council-clerk',
      agentName: 'Council Clerk',
      agentRole: 'clerk',
      opinion: 'SUPPORT',
      reasoning: synthesis.reasoning,
      confidence: synthesis.confidence,
      timestamp: Date.now() + 4000,
    }
    const allMessages = [...messages, clerkMessage]
    const { consensus, voteTally } = calculateConsensus(allMessages)

    const proposal: TokenLaunchProposal = {
      id: `launch-${Date.now()}`,
      agentId: 'council',
      agentName: 'Council',
      action: 'token_launch',
      strategyType: 'token_launch',
      tokenName: synthesis.tokenName,
      tokenSymbol: synthesis.tokenSymbol,
      tokenDescription: synthesis.tokenDescription,
      pairedToken: 'WETH',
      rewardRecipient: walletAddress,
      rewardBps: FEE_CONFIG.AGENT_BPS,
      vaultPercentage: synthesis.vaultPercentage,
      lockupDays: 7,
      reasoning: synthesis.reasoning,
      confidence: synthesis.confidence,
      riskLevel: synthesis.riskLevel,
      deliberation: { messages: allMessages, consensus, voteTally, rounds: 1 },
    }

    return { deliberation: { messages: allMessages, consensus, voteTally, rounds: 1 }, proposal }
  }

  const groq = new Groq({ apiKey })
  const messages: CouncilMessage[] = []
  const debatingAgents = AGENT_PERSONAS.filter((a) => a.role !== 'clerk')

  for (const persona of debatingAgents) {
    try {
      const prompt = buildTokenLaunchAgentPrompt(persona, request.userPrompt, request.context, messages)
      const response = await callAgent(groq, persona, prompt)

      messages.push({
        agentId: persona.id,
        agentName: persona.name,
        agentRole: persona.role,
        opinion: response.opinion,
        reasoning: response.reasoning,
        confidence: response.confidence,
        timestamp: Date.now(),
      })

      console.log(`[Council] ${persona.name} (token launch): ${response.opinion}`)
    } catch (err) {
      console.error(`[Council] ${persona.name} failed:`, err)
      messages.push({
        agentId: persona.id,
        agentName: persona.name,
        agentRole: persona.role,
        opinion: 'NEUTRAL',
        reasoning: 'Unable to provide analysis at this time.',
        confidence: 50,
        timestamp: Date.now(),
      })
    }
  }

  const clerkPersona = AGENT_PERSONAS.find((a) => a.role === 'clerk')!
  const clerkPrompt = buildTokenLaunchClerkPrompt(request.userPrompt, request.context, messages)

  let synthesis: ClerkTokenSynthesis
  try {
    synthesis = await callTokenLaunchClerk(groq, clerkPrompt)
  } catch (err) {
    console.error('[Council] Clerk token synthesis failed:', err)
    synthesis = getMockTokenLaunchDeliberation(request.userPrompt).synthesis
  }

  const clerkMessage: CouncilMessage = {
    agentId: clerkPersona.id,
    agentName: clerkPersona.name,
    agentRole: 'clerk',
    opinion: 'SUPPORT',
    reasoning: synthesis.reasoning,
    confidence: synthesis.confidence,
    timestamp: Date.now(),
  }
  messages.push(clerkMessage)

  const { consensus, voteTally } = calculateConsensus(messages)

  const proposal: TokenLaunchProposal = {
    id: `launch-${Date.now()}-${crypto.randomUUID().split('-')[0]}`,
    agentId: 'council',
    agentName: 'Council',
    action: 'token_launch',
    strategyType: 'token_launch',
    tokenName: synthesis.tokenName,
    tokenSymbol: synthesis.tokenSymbol,
    tokenDescription: synthesis.tokenDescription,
    pairedToken: 'WETH',
    rewardRecipient: walletAddress,
    rewardBps: FEE_CONFIG.AGENT_BPS,
    vaultPercentage: synthesis.vaultPercentage,
    lockupDays: 7,
    reasoning: synthesis.reasoning,
    confidence: synthesis.confidence,
    riskLevel: synthesis.riskLevel,
    deliberation: { messages, consensus, voteTally, rounds: 1 },
  }

  console.log(`[Council] Token launch deliberation complete: ${consensus}`)
  return { deliberation: { messages, consensus, voteTally, rounds: 1 }, proposal }
}

// ─── V4 Hook Integration ───

export interface HookParameters {
  feeBps: number
  maxSwapSize: string
  sentimentScore: number
  sentimentReason: string
}

/**
 * Extract hook parameters from a council deliberation result.
 * Maps council consensus → on-chain hook parameters:
 *   - Fee: higher when risk is high, lower when council is bullish
 *   - MaxSwapSize: tighter when risk is elevated
 *   - Sentiment: derived from consensus and confidence
 */
export function extractHookParameters(
  deliberation: DeliberationResult,
  riskLevel: 'low' | 'medium' | 'high'
): HookParameters {
  const { consensus, voteTally } = deliberation

  // Fee: scale based on risk + consensus
  let feeBps = 3000 // default 0.3%
  if (riskLevel === 'high' || consensus === 'vetoed') {
    feeBps = 10000 // 1% — discourage swaps in risky conditions
  } else if (riskLevel === 'low' && consensus === 'unanimous') {
    feeBps = 500 // 0.05% — encourage swaps when council is confident
  } else if (consensus === 'contested') {
    feeBps = 5000 // 0.5% — moderate caution
  }

  // MaxSwapSize: tighter guardrails when risk is elevated
  let maxSwapSize: string
  if (riskLevel === 'high' || consensus === 'vetoed') {
    maxSwapSize = '1000000000000000000' // 1 ETH
  } else if (riskLevel === 'medium') {
    maxSwapSize = '10000000000000000000' // 10 ETH
  } else {
    maxSwapSize = '100000000000000000000' // 100 ETH
  }

  // Sentiment: -100 to +100 derived from vote tally
  const total = voteTally.support + voteTally.oppose + voteTally.abstain
  const sentimentScore = total > 0
    ? Math.round(((voteTally.support - voteTally.oppose) / total) * 100)
    : 0

  // Build reason from consensus
  const sentimentReason = `Council ${consensus}: ${voteTally.support}S/${voteTally.oppose}O/${voteTally.abstain}A, risk=${riskLevel}`

  return { feeBps, maxSwapSize, sentimentScore, sentimentReason }
}

/**
 * Push hook parameters to chain directly (no HTTP roundtrip).
 * Called after council deliberation completes.
 */
export async function updateHookParameters(params: HookParameters): Promise<void> {
  try {
    const result = await executeHookUpdate({
      feeBps: params.feeBps,
      maxSwapSize: params.maxSwapSize,
      sentimentScore: params.sentimentScore,
      sentimentReason: params.sentimentReason,
    })

    if (!result.success) {
      console.error('[Council→Hooks] Update failed:', result.error)
      return
    }

    console.log('[Council→Hooks] Parameters updated on-chain:', result)
  } catch (err) {
    console.error('[Council→Hooks] Failed to update hook parameters:', err)
  }
}

export { AGENT_PERSONAS, isTokenLaunchPrompt, validateExternalEndpoint }
