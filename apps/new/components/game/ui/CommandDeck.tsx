"use client"

import { AGENTS, AGENT_MAP, DEPLOY_COST, MAX_AGENTS, QUICK_COMMANDS } from "@/lib/game/data"
import { useGameStore } from "@/lib/game/store"
import { useShallow } from "zustand/react/shallow"

export function CommandDeck() {
  const {
    view,
    deployedAgents,
    balance,
    selectedAgentId,
    draftPrompt,
    deliberating,
    isExecutingTrade,
    setDraftPrompt,
    deployAgent,
    startDeliberation,
    setView,
  } = useGameStore(
    useShallow((state) => ({
      view: state.view,
      deployedAgents: state.deployedAgents,
      balance: state.balance,
      selectedAgentId: state.selectedAgentId,
      draftPrompt: state.draftPrompt,
      deliberating: state.deliberating,
      isExecutingTrade: state.isExecutingTrade,
      setDraftPrompt: state.setDraftPrompt,
      deployAgent: state.deployAgent,
      startDeliberation: state.startDeliberation,
      setView: state.setView,
    })),
  )

  return (
    <aside className="panel command-deck">
      <h2>Command Deck</h2>
      <p className="panel-sub">Deploy operators, tune strategy, and trigger the council.</p>

      <div className="agent-stack">
        {AGENTS.map((agent) => {
          const isDeployed = deployedAgents.includes(agent.id)
          const disabled = isDeployed || deployedAgents.length >= MAX_AGENTS || balance < DEPLOY_COST

          return (
            <article key={agent.id} className="agent-card" style={{ borderColor: `${agent.glowColor}66` }}>
              <div className="agent-head">
                <span className="dot" style={{ background: agent.glowColor }} />
                <div>
                  <h3>{agent.name}</h3>
                  <p>{agent.title}</p>
                </div>
              </div>

              <button className="btn btn-small" disabled={disabled} onClick={() => deployAgent(agent.id)}>
                {isDeployed ? "Deployed" : `Deploy (${DEPLOY_COST} YTEST)`}
              </button>
            </article>
          )
        })}
      </div>

      <div className="panel-divider" />

      <div className="quick-row">
        {QUICK_COMMANDS.map((prompt) => (
          <button key={prompt} className="chip" onClick={() => setDraftPrompt(prompt)}>
            {prompt.slice(0, 28)}...
          </button>
        ))}
      </div>

      <label htmlFor="strategy" className="field-label">
        Strategy Request
      </label>
      <textarea
        id="strategy"
        className="text-area"
        value={draftPrompt}
        onChange={(event) => setDraftPrompt(event.target.value)}
        placeholder="Describe the trade mission for the council..."
      />

      <div className="action-row">
        <button className="btn btn-primary" onClick={() => startDeliberation()} disabled={deliberating || isExecutingTrade}>
          {deliberating ? "Deliberating..." : "Run Council"}
        </button>
        <button className="btn btn-secondary" onClick={() => setView(view === "city" ? "council" : "city")}>
          {view === "city" ? "Enter Council" : "Back To City"}
        </button>
      </div>

      <p className="tiny-note">
        Selected lead agent: {selectedAgentId ? AGENT_MAP[selectedAgentId].name : "None"}
      </p>
    </aside>
  )
}
