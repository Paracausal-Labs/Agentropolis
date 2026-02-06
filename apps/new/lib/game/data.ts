import type { AgentProfile, AgentId } from "@/lib/game/types"

export const DEPLOY_COST = 2.5
export const MAX_AGENTS = 6

export const LEVEL_THRESHOLDS = [0, 200, 600, 1400, 2800, 5000, 8200, 12400, 18000, 25000]

export const TOKENS = ["YTEST", "USDC", "ETH", "WBTC", "UNI", "AERO"] as const

export const QUICK_COMMANDS = [
  "Swap 12 YTEST to USDC with low risk.",
  "Stake 35 USDC in the safest vault.",
  "Open an LP between ETH and USDC.",
  "Launch a meme token for momentum trading.",
]

export const AGENTS: AgentProfile[] = [
  {
    id: "alphaHunter",
    name: "ALPHA-7",
    title: "Yield Optimization Unit",
    bias: "yield",
    modelColor: "#f8cf2f",
    glowColor: "#ffe98a",
    confidenceBase: 67,
    oneLiner: "Profit surfaces when others hesitate.",
    quickReplies: [
      "Momentum is up. Push a larger position.",
      "We can clip yield without overextending.",
      "If we wait, this edge is gone.",
    ],
  },
  {
    id: "riskSentinel",
    name: "SENTINEL-X",
    title: "Risk Guardian",
    bias: "safety",
    modelColor: "#ff833b",
    glowColor: "#ffbe8f",
    confidenceBase: 76,
    oneLiner: "Downside defines survival.",
    quickReplies: [
      "Position size is too aggressive.",
      "Set tighter constraints before execution.",
      "Approved only if exposure is reduced.",
    ],
  },
  {
    id: "macroOracle",
    name: "ORACLE-PSI",
    title: "Macro Pattern Seer",
    bias: "macro",
    modelColor: "#8f6fff",
    glowColor: "#c1afff",
    confidenceBase: 63,
    oneLiner: "Price action rhymes with regime shifts.",
    quickReplies: [
      "Flows suggest continuation for now.",
      "Risk-on conditions are improving.",
      "Cross-asset signal is mixed. Keep optionality.",
    ],
  },
  {
    id: "devilsAdvocate",
    name: "ADVOCATE-OMEGA",
    title: "Counterargument Engine",
    bias: "skeptic",
    modelColor: "#ff3b6f",
    glowColor: "#ff8aa8",
    confidenceBase: 71,
    oneLiner: "Every plan breaks somewhere. Find it first.",
    quickReplies: [
      "What if liquidity vanishes mid-trade?",
      "This thesis has weak assumptions.",
      "I can support if we cap slippage.",
    ],
  },
  {
    id: "councilClerk",
    name: "CLERK-01",
    title: "Consensus Synthesizer",
    bias: "synth",
    modelColor: "#3cdff2",
    glowColor: "#8ff2ff",
    confidenceBase: 58,
    oneLiner: "I translate conflict into a decision.",
    quickReplies: [
      "Consensus leans cautious but executable.",
      "I can package this into a proposal now.",
      "We need one more supporting signal.",
    ],
  },
  {
    id: "fluxArchitect",
    name: "ARCHITECT-9",
    title: "Execution Systems Designer",
    bias: "builder",
    modelColor: "#43f86f",
    glowColor: "#91ffad",
    confidenceBase: 61,
    oneLiner: "Make the system robust, then scale it.",
    quickReplies: [
      "Route can be optimized through split fills.",
      "I can lower execution drag by batching.",
      "Architecture is good; proceed with guardrails.",
    ],
  },
]

export const AGENT_MAP: Record<AgentId, AgentProfile> = AGENTS.reduce((acc, agent) => {
  acc[agent.id] = agent
  return acc
}, {} as Record<AgentId, AgentProfile>)

export const CITY_WAYPOINTS: [number, number, number][] = [
  [-9, 0.6, -6],
  [-3, 0.6, -6],
  [3, 0.6, -6],
  [9, 0.6, -2],
  [8, 0.6, 4],
  [2, 0.6, 8],
  [-5, 0.6, 7],
  [-9, 0.6, 2],
]
