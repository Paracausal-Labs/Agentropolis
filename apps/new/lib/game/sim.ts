import { AGENT_MAP, LEVEL_THRESHOLDS, TOKENS } from "@/lib/game/data"
import type {
  AgentProfile,
  ConsensusState,
  Intent,
  Opinion,
  Proposal,
  RiskBand,
} from "@/lib/game/types"

const uid = () => Math.random().toString(36).slice(2, 10)

const random = (min: number, max: number) => min + Math.random() * (max - min)

export const parseIntent = (rawPrompt: string): Intent => {
  const prompt = rawPrompt.trim().toLowerCase()

  let action: Intent["action"] = "swap"
  if (prompt.includes("stake") || prompt.includes("vault")) action = "stake"
  if (prompt.includes("lp") || prompt.includes("liquidity") || prompt.includes("pool")) action = "lp"
  if (prompt.includes("launch") || prompt.includes("token")) action = "launch"

  const amountMatch = prompt.match(/\d+(\.\d+)?/)
  const amount = amountMatch ? Number(amountMatch[0]) : random(8, 40)

  const discovered = TOKENS.filter((token) => prompt.includes(token.toLowerCase()))
  const inputToken = discovered[0] ?? "YTEST"
  const outputToken = discovered[1] ?? (action === "stake" ? "YTEST" : action === "launch" ? "AGT" : "USDC")

  let appetite: Intent["appetite"] = "balanced"
  if (prompt.match(/low|safe|cautious|conservative/)) appetite = "calm"
  if (prompt.match(/max|degen|aggressive|ape|all in/)) appetite = "degen"

  return {
    raw: rawPrompt,
    action,
    amount,
    inputToken,
    outputToken,
    appetite,
  }
}

const scoreOpinion = (agent: AgentProfile, intent: Intent): number => {
  let score = random(-0.55, 0.55)

  if (intent.appetite === "degen") score += agent.bias === "yield" ? 0.35 : -0.2
  if (intent.appetite === "calm") score += agent.bias === "safety" ? 0.45 : -0.1

  if (intent.action === "swap") score += agent.bias === "yield" || agent.bias === "builder" ? 0.2 : 0
  if (intent.action === "stake") score += agent.bias === "safety" ? 0.3 : 0
  if (intent.action === "lp") score += agent.bias === "macro" || agent.bias === "builder" ? 0.25 : 0
  if (intent.action === "launch") score += agent.bias === "yield" ? 0.25 : -0.15

  if (agent.bias === "skeptic") score -= 0.22
  if (agent.bias === "synth") score += 0.05

  return score
}

export const buildOpinion = (agent: AgentProfile, intent: Intent): Opinion => {
  const score = scoreOpinion(agent, intent)
  const confidence = Math.max(45, Math.min(96, Math.round(agent.confidenceBase + random(-11, 14))))

  let stance: Opinion["stance"] = "concern"
  if (score > 0.28) stance = "support"
  if (score < -0.22) stance = "oppose"

  const reasons: Record<Opinion["stance"], string[]> = {
    support: [
      `${agent.name}: edge is valid and timing is favorable.`,
      `${agent.name}: execution quality should be strong at this size.`,
      `${agent.name}: this aligns with current market structure.`,
    ],
    concern: [
      `${agent.name}: acceptable if we reduce slippage and size.`,
      `${agent.name}: opportunity exists but risk controls are mandatory.`,
      `${agent.name}: mixed signals, keep sizing disciplined.`,
    ],
    oppose: [
      `${agent.name}: downside tail risk is too high right now.`,
      `${agent.name}: assumptions fail under volatility expansion.`,
      `${agent.name}: reject unless conditions materially improve.`,
    ],
  }

  return {
    id: uid(),
    agentId: agent.id,
    stance,
    confidence,
    reason: reasons[stance][Math.floor(Math.random() * reasons[stance].length)],
  }
}

const inferRisk = (intent: Intent, opinions: Opinion[]): RiskBand => {
  const oppose = opinions.filter((opinion) => opinion.stance === "oppose").length
  const concern = opinions.filter((opinion) => opinion.stance === "concern").length

  if (intent.appetite === "degen" || oppose >= 2) return "high"
  if (intent.appetite === "balanced" || concern >= 2) return "medium"
  return "low"
}

const inferConsensus = (opinions: Opinion[]): ConsensusState => {
  const support = opinions.filter((opinion) => opinion.stance === "support").length
  const oppose = opinions.filter((opinion) => opinion.stance === "oppose").length
  const sentinel = opinions.find((opinion) => opinion.agentId === "riskSentinel")

  if (sentinel && sentinel.stance === "oppose" && sentinel.confidence >= 82) return "vetoed"
  if (support === opinions.length) return "unanimous"
  if (support >= 3) return "majority"
  if (oppose >= 2) return "contested"
  return "majority"
}

export const buildProposal = (intent: Intent, opinions: Opinion[]): Proposal => {
  const support = opinions.filter((opinion) => opinion.stance === "support").length
  const concern = opinions.filter((opinion) => opinion.stance === "concern").length
  const oppose = opinions.filter((opinion) => opinion.stance === "oppose").length

  const expectedPnlPct = Number(random(-2.2, 8.7).toFixed(2))
  const expectedOutput = Number((intent.amount * (1 + expectedPnlPct / 100)).toFixed(2))

  const consensus = inferConsensus(opinions)
  const risk = inferRisk(intent, opinions)

  const summary =
    consensus === "vetoed"
      ? "Risk Sentinel issued a hard veto. Proposal is available for override but high caution is advised."
      : `${support} support, ${concern} concern, ${oppose} oppose. Council recommends guarded execution.`

  return {
    id: uid(),
    action: intent.action,
    inputToken: intent.inputToken,
    outputToken: intent.outputToken,
    inputAmount: Number(intent.amount.toFixed(2)),
    expectedOutput,
    expectedPnlPct,
    risk,
    consensus,
    summary,
    votes: { support, concern, oppose },
  }
}

export const getAgentReply = (agent: AgentProfile, userMessage: string): string => {
  const msg = userMessage.toLowerCase()

  if (msg.includes("risk") || msg.includes("safe")) {
    return `${agent.name}: keep drawdown bounded, then optimize. ${agent.quickReplies[1]}`
  }
  if (msg.includes("profit") || msg.includes("yield") || msg.includes("alpha")) {
    return `${agent.name}: returns are available if timing stays tight. ${agent.quickReplies[0]}`
  }
  if (msg.includes("why") || msg.includes("explain")) {
    return `${agent.name}: ${agent.oneLiner} ${agent.quickReplies[2]}`
  }

  return `${agent.name}: ${agent.quickReplies[Math.floor(Math.random() * agent.quickReplies.length)]}`
}

export const resolveTrade = (proposal: Proposal) => {
  let successChance = 0.63

  if (proposal.risk === "low") successChance += 0.2
  if (proposal.risk === "high") successChance -= 0.22
  if (proposal.consensus === "unanimous") successChance += 0.1
  if (proposal.consensus === "vetoed") successChance -= 0.28

  const didWin = Math.random() < successChance

  const pnlPct = didWin
    ? random(0.4, proposal.risk === "high" ? 16 : 9)
    : -random(0.7, proposal.risk === "high" ? 12 : 6)

  const pnl = Number(((proposal.inputAmount * pnlPct) / 100).toFixed(2))

  return {
    didWin,
    pnl,
  }
}

export const computeLevel = (xp: number) => {
  let level = 1
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
  }
  return level
}
