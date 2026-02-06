"use client"

import { useEffect } from "react"

import { GameViewport } from "@/components/game/canvas/GameViewport"
import { CommandDeck } from "@/components/game/ui/CommandDeck"
import { IntelPanel } from "@/components/game/ui/IntelPanel"
import { TopBar } from "@/components/game/ui/TopBar"
import { useGameStore } from "@/lib/game/store"

export function GameShell() {
  const tickAmbient = useGameStore((state) => state.tickAmbient)

  useEffect(() => {
    const timer = window.setInterval(() => {
      tickAmbient()
    }, 1500)

    return () => window.clearInterval(timer)
  }, [tickAmbient])

  return (
    <main className="game-root">
      <div className="holo-grid" />
      <div className="scanline" />

      <TopBar />

      <section className="game-layout">
        <CommandDeck />

        <div className="viewport-shell panel">
          <GameViewport />
        </div>

        <IntelPanel />
      </section>
    </main>
  )
}
