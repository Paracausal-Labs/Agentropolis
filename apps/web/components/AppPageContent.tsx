'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PhaserGame from '@/components/game/PhaserGame'
import { ConnectButton } from '@/components/ConnectButton'
import { UserIdentity } from '@/components/UserIdentity'
import { AgentSettingsButton } from '@/components/AgentSettings'
import { SessionStatus } from '@/components/SessionProvider'
import { SwapHandler } from '@/components/SwapHandler'
import { GuestMode } from '@/components/GuestMode'

function AppPageContentInner() {
  const searchParams = useSearchParams()
  const isGuest = searchParams.get('guest') === 'true'

  return (
    <div className="relative w-full h-screen bg-gray-950">
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-white">Agentropolis</h1>
        <div className="flex items-center gap-4">
          <SessionStatus />
          <UserIdentity />
          <AgentSettingsButton />
          <ConnectButton />
        </div>
      </header>
      <PhaserGame />
      <SwapHandler />
      {isGuest && <GuestMode />}
    </div>
  )
}

export function AppPageContent() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-gray-950" />}>
      <AppPageContentInner />
    </Suspense>
  )
}
