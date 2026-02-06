import { create } from "zustand"

import { AGENTS, AGENT_MAP, DEPLOY_COST, MAX_AGENTS } from "@/lib/game/data"
import {
  buildOpinion,
  buildProposal,
  computeLevel,
  getAgentReply,
  parseIntent,
  resolveTrade,
} from "@/lib/game/sim"
import type { AgentId, ChatMessage, GameStore, Notice, TradeRecord } from "@/lib/game/types"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const uid = () => Math.random().toString(36).slice(2, 10)

const makeNotice = (kind: Notice["kind"], message: string): Notice => ({
  id: uid(),
  kind,
  message,
  createdAt: Date.now(),
})

const emptyChats = AGENTS.reduce((acc, agent) => {
  acc[agent.id] = [] as ChatMessage[]
  return acc
}, {} as Record<AgentId, ChatMessage[]>)

export const useGameStore = create<GameStore>((set, get) => ({
  view: "city",
  balance: 120,
  xp: 0,
  level: 1,
  marketPulse: 0.52,
  deployedAgents: ["alphaHunter", "riskSentinel", "councilClerk"],
  selectedAgentId: null,
  draftPrompt: "Swap 12 YTEST to USDC with low risk and controlled slippage.",
  opinions: [],
  speakerIndex: -1,
  deliberating: false,
  isExecutingTrade: false,
  proposal: null,
  notices: [makeNotice("info", "City boot sequence complete. Deploy more agents and open council.")],
  tradeHistory: [],
  chatByAgent: emptyChats,

  setView: (view) => set({ view }),

  setDraftPrompt: (prompt) => set({ draftPrompt: prompt }),

  selectAgent: (agentId) => set({ selectedAgentId: agentId }),

  deployAgent: (agentId) => {
    const state = get()
    if (state.deployedAgents.includes(agentId)) {
      set((current) => ({ notices: [makeNotice("warn", "Agent already deployed."), ...current.notices].slice(0, 12) }))
      return
    }
    if (state.deployedAgents.length >= MAX_AGENTS) {
      set((current) => ({ notices: [makeNotice("error", "Deployment limit reached."), ...current.notices].slice(0, 12) }))
      return
    }
    if (state.balance < DEPLOY_COST) {
      set((current) => ({ notices: [makeNotice("error", "Insufficient balance for deployment."), ...current.notices].slice(0, 12) }))
      return
    }

    set((current) => ({
      balance: Number((current.balance - DEPLOY_COST).toFixed(2)),
      deployedAgents: [...current.deployedAgents, agentId],
      xp: current.xp + 24,
      level: computeLevel(current.xp + 24),
      notices: [makeNotice("success", `${AGENT_MAP[agentId].name} deployed to city grid.`), ...current.notices].slice(0, 12),
    }))
  },

  startDeliberation: async () => {
    const state = get()
    if (state.deliberating || state.isExecutingTrade) return
    if (!state.draftPrompt.trim()) {
      set((current) => ({ notices: [makeNotice("warn", "Enter a strategy request first."), ...current.notices].slice(0, 12) }))
      return
    }
    if (state.deployedAgents.length === 0) {
      set((current) => ({ notices: [makeNotice("error", "No deployed agents available."), ...current.notices].slice(0, 12) }))
      return
    }

    const intent = parseIntent(state.draftPrompt)

    set((current) => ({
      view: "council",
      deliberating: true,
      opinions: [],
      speakerIndex: -1,
      proposal: null,
      notices: [makeNotice("info", "Council convened. Deliberation started."), ...current.notices].slice(0, 12),
    }))

    const activeAgents = AGENTS.filter((agent) => state.deployedAgents.includes(agent.id))

    for (let i = 0; i < activeAgents.length; i += 1) {
      const agent = activeAgents[i]
      await sleep(620)
      const opinion = buildOpinion(agent, intent)
      set((current) => ({
        speakerIndex: i,
        opinions: [...current.opinions, opinion],
        notices: [makeNotice("info", `${agent.name} -> ${opinion.stance.toUpperCase()}`), ...current.notices].slice(0, 12),
      }))
    }

    await sleep(420)

    const proposal = buildProposal(intent, get().opinions)
    set((current) => ({
      deliberating: false,
      speakerIndex: -1,
      proposal,
      xp: current.xp + 32,
      level: computeLevel(current.xp + 32),
      notices: [makeNotice("success", `Proposal ready (${proposal.consensus}).`), ...current.notices].slice(0, 12),
    }))
  },

  sendAgentMessage: async (agentId, content) => {
    const agent = AGENT_MAP[agentId]
    const userMsg: ChatMessage = {
      id: uid(),
      sender: "user",
      agentId,
      content,
      timestamp: Date.now(),
    }

    set((current) => ({
      selectedAgentId: agentId,
      chatByAgent: {
        ...current.chatByAgent,
        [agentId]: [...current.chatByAgent[agentId], userMsg].slice(-20),
      },
    }))

    await sleep(420)

    const reply: ChatMessage = {
      id: uid(),
      sender: "agent",
      agentId,
      content: getAgentReply(agent, content),
      timestamp: Date.now(),
    }

    set((current) => ({
      chatByAgent: {
        ...current.chatByAgent,
        [agentId]: [...current.chatByAgent[agentId], reply].slice(-20),
      },
    }))
  },

  approveProposal: async () => {
    const state = get()
    if (!state.proposal || state.isExecutingTrade) return

    set((current) => ({
      isExecutingTrade: true,
      notices: [makeNotice("info", "Trade pipeline executing..."), ...current.notices].slice(0, 12),
    }))

    await sleep(1200)

    const result = resolveTrade(state.proposal)
    const xpDelta = result.didWin ? 88 : 41

    set((current) => {
      const nextBalance = Number((current.balance + result.pnl).toFixed(2))

      const record: TradeRecord = {
        id: uid(),
        proposalId: state.proposal!.id,
        action: state.proposal!.action,
        outcome: result.didWin ? "win" : "loss",
        pnl: result.pnl,
        xpDelta,
        balanceAfter: nextBalance,
        executedAt: Date.now(),
      }

      return {
        balance: nextBalance,
        xp: current.xp + xpDelta,
        level: computeLevel(current.xp + xpDelta),
        proposal: null,
        isExecutingTrade: false,
        tradeHistory: [record, ...current.tradeHistory].slice(0, 10),
        notices: [
          makeNotice(result.didWin ? "success" : "warn", result.didWin ? `Trade won +${result.pnl}` : `Trade lost ${result.pnl}`),
          ...current.notices,
        ].slice(0, 12),
      }
    })
  },

  rejectProposal: () => {
    set((current) => ({
      proposal: null,
      xp: current.xp + 10,
      level: computeLevel(current.xp + 10),
      notices: [makeNotice("warn", "Proposal rejected. Council dismissed."), ...current.notices].slice(0, 12),
    }))
  },

  tickAmbient: () => {
    set((current) => {
      const passive = current.deployedAgents.length * 0.04
      const nextPulse = Math.max(0, Math.min(1, current.marketPulse + (Math.random() - 0.5) * 0.11))

      return {
        marketPulse: Number(nextPulse.toFixed(3)),
        balance: Number((current.balance + passive).toFixed(2)),
      }
    })
  },
}))
