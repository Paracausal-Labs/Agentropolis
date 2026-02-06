export type GameView = "city" | "council"

export type AgentId =
  | "alphaHunter"
  | "riskSentinel"
  | "macroOracle"
  | "devilsAdvocate"
  | "councilClerk"
  | "fluxArchitect"

export type AgentBias = "yield" | "safety" | "macro" | "skeptic" | "synth" | "builder"

export type OpinionStance = "support" | "concern" | "oppose"

export type ConsensusState = "unanimous" | "majority" | "contested" | "vetoed"

export type RiskBand = "low" | "medium" | "high"

export interface AgentProfile {
  id: AgentId
  name: string
  title: string
  bias: AgentBias
  modelColor: string
  glowColor: string
  confidenceBase: number
  oneLiner: string
  quickReplies: string[]
}

export interface Opinion {
  id: string
  agentId: AgentId
  stance: OpinionStance
  confidence: number
  reason: string
}

export interface Intent {
  raw: string
  action: "swap" | "stake" | "lp" | "launch"
  amount: number
  inputToken: string
  outputToken: string
  appetite: "calm" | "balanced" | "degen"
}

export interface Proposal {
  id: string
  action: Intent["action"]
  inputToken: string
  outputToken: string
  inputAmount: number
  expectedOutput: number
  expectedPnlPct: number
  risk: RiskBand
  consensus: ConsensusState
  summary: string
  votes: {
    support: number
    concern: number
    oppose: number
  }
}

export interface ChatMessage {
  id: string
  sender: "user" | "agent"
  agentId: AgentId
  content: string
  timestamp: number
}

export interface TradeRecord {
  id: string
  proposalId: string
  action: Proposal["action"]
  outcome: "win" | "loss"
  pnl: number
  xpDelta: number
  balanceAfter: number
  executedAt: number
}

export interface Notice {
  id: string
  kind: "info" | "success" | "warn" | "error"
  message: string
  createdAt: number
}

export interface GameStore {
  view: GameView
  balance: number
  xp: number
  level: number
  marketPulse: number
  deployedAgents: AgentId[]
  selectedAgentId: AgentId | null
  draftPrompt: string
  opinions: Opinion[]
  speakerIndex: number
  deliberating: boolean
  isExecutingTrade: boolean
  proposal: Proposal | null
  notices: Notice[]
  tradeHistory: TradeRecord[]
  chatByAgent: Record<AgentId, ChatMessage[]>

  setView: (view: GameView) => void
  setDraftPrompt: (prompt: string) => void
  selectAgent: (agentId: AgentId | null) => void
  deployAgent: (agentId: AgentId) => void
  startDeliberation: () => Promise<void>
  sendAgentMessage: (agentId: AgentId, content: string) => Promise<void>
  approveProposal: () => Promise<void>
  rejectProposal: () => void
  tickAmbient: () => void
}
