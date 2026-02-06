"use client"

import { useGameStore } from "@/lib/game/store"
import { useShallow } from "zustand/react/shallow"

export function TopBar() {
  const { balance, xp, level, marketPulse, view, setView, deployedAgents } = useGameStore(
    useShallow((state) => ({
      balance: state.balance,
      xp: state.xp,
      level: state.level,
      marketPulse: state.marketPulse,
      view: state.view,
      setView: state.setView,
      deployedAgents: state.deployedAgents,
    })),
  )

  return (
    <header className="topbar panel">
      <div className="brand-wrap">
        <h1>AGENTROPOLIS REBOOT</h1>
        <p>Neon city simulation | No backend mode | Full council logic</p>
      </div>

      <div className="metric-row">
        <div className="metric-chip">
          <span>Balance</span>
          <strong>{balance.toFixed(2)} YTEST</strong>
        </div>
        <div className="metric-chip">
          <span>XP / Level</span>
          <strong>
            {xp} / LVL {level}
          </strong>
        </div>
        <div className="metric-chip">
          <span>Pulse</span>
          <strong>{Math.round(marketPulse * 100)}%</strong>
        </div>
        <div className="metric-chip">
          <span>Agents</span>
          <strong>{deployedAgents.length} deployed</strong>
        </div>
      </div>

      <div className="segment">
        <button className={`seg-btn ${view === "city" ? "active" : ""}`} onClick={() => setView("city")}>
          City
        </button>
        <button className={`seg-btn ${view === "council" ? "active" : ""}`} onClick={() => setView("council")}>
          Council
        </button>
      </div>
    </header>
  )
}
