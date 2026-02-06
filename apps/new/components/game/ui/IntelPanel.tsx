"use client"

import { FormEvent, useMemo, useState } from "react"

import { AGENT_MAP } from "@/lib/game/data"
import { useGameStore } from "@/lib/game/store"
import { useShallow } from "zustand/react/shallow"

export function IntelPanel() {
  const [chatInput, setChatInput] = useState("")

  const {
    deployedAgents,
    selectedAgentId,
    selectAgent,
    chatByAgent,
    sendAgentMessage,
    proposal,
    approveProposal,
    rejectProposal,
    isExecutingTrade,
    notices,
    tradeHistory,
  } = useGameStore(
    useShallow((state) => ({
      deployedAgents: state.deployedAgents,
      selectedAgentId: state.selectedAgentId,
      selectAgent: state.selectAgent,
      chatByAgent: state.chatByAgent,
      sendAgentMessage: state.sendAgentMessage,
      proposal: state.proposal,
      approveProposal: state.approveProposal,
      rejectProposal: state.rejectProposal,
      isExecutingTrade: state.isExecutingTrade,
      notices: state.notices,
      tradeHistory: state.tradeHistory,
    })),
  )

  const activeChatAgent = selectedAgentId ?? deployedAgents[0] ?? null

  const currentChat = useMemo(() => {
    if (!activeChatAgent) return []
    return chatByAgent[activeChatAgent]
  }, [activeChatAgent, chatByAgent])

  const handleSend = async (event: FormEvent) => {
    event.preventDefault()
    if (!activeChatAgent || !chatInput.trim()) return

    const payload = chatInput
    setChatInput("")
    await sendAgentMessage(activeChatAgent, payload)
  }

  return (
    <aside className="panel intel-panel">
      <h2>Intel Stream</h2>
      <p className="panel-sub">Per-agent chat, proposal review, and execution ledger.</p>

      <div className="agent-pills">
        {deployedAgents.map((id) => (
          <button
            key={id}
            className={`chip ${activeChatAgent === id ? "chip-active" : ""}`}
            onClick={() => selectAgent(id)}
            style={{ borderColor: `${AGENT_MAP[id].glowColor}88` }}
          >
            {AGENT_MAP[id].name}
          </button>
        ))}
      </div>

      <div className="chat-shell">
        <div className="chat-log">
          {currentChat.length === 0 ? (
            <p className="muted">Open a conversation with an agent and ask for strategy details.</p>
          ) : (
            currentChat.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.sender === "user" ? "user" : "agent"}`}>
                <strong>{msg.sender === "user" ? "YOU" : AGENT_MAP[msg.agentId].name}</strong>
                <p>{msg.content}</p>
              </div>
            ))
          )}
        </div>

        <form className="chat-form" onSubmit={handleSend}>
          <input
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Ask this agent for rationale..."
          />
          <button className="btn btn-small" type="submit" disabled={!activeChatAgent}>
            Send
          </button>
        </form>
      </div>

      {proposal ? (
        <article className="proposal-card">
          <h3>Live Proposal</h3>
          <p>{proposal.summary}</p>
          <div className="proposal-grid">
            <span>Action: {proposal.action.toUpperCase()}</span>
            <span>
              {proposal.inputAmount} {proposal.inputToken} {"->"} {proposal.expectedOutput} {proposal.outputToken}
            </span>
            <span>Risk: {proposal.risk.toUpperCase()}</span>
            <span>Consensus: {proposal.consensus.toUpperCase()}</span>
          </div>
          <div className="proposal-grid">
            <span>Support: {proposal.votes.support}</span>
            <span>Concern: {proposal.votes.concern}</span>
            <span>Oppose: {proposal.votes.oppose}</span>
            <span>Projected PnL: {proposal.expectedPnlPct}%</span>
          </div>
          <div className="action-row">
            <button className="btn btn-primary" onClick={() => approveProposal()} disabled={isExecutingTrade}>
              {isExecutingTrade ? "Executing..." : "Approve Trade"}
            </button>
            <button className="btn btn-danger" onClick={() => rejectProposal()} disabled={isExecutingTrade}>
              Reject
            </button>
          </div>
        </article>
      ) : null}

      <section className="stream-section">
        <h3>Recent Signals</h3>
        <div className="notice-list">
          {notices.slice(0, 6).map((notice) => (
            <div key={notice.id} className={`notice ${notice.kind}`}>
              <span>{notice.kind.toUpperCase()}</span>
              <p>{notice.message}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stream-section">
        <h3>Trade Ledger</h3>
        <div className="ledger-list">
          {tradeHistory.length === 0 ? (
            <p className="muted">No executed trades yet.</p>
          ) : (
            tradeHistory.map((trade) => (
              <div key={trade.id} className="ledger-item">
                <strong>{trade.action.toUpperCase()}</strong>
                <span>{trade.outcome === "win" ? `+${trade.pnl}` : `${trade.pnl}`} YTEST</span>
                <span>XP +{trade.xpDelta}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  )
}
