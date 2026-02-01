import PhaserGame from '@/components/game/PhaserGame'
import { ConnectButton } from '@/components/ConnectButton'
import { UserIdentity } from '@/components/UserIdentity'
import { SessionProvider, SessionStatus } from '@/components/SessionProvider'
import { SwapHandler } from '@/components/SwapHandler'

export default function AppPage() {
  return (
    <SessionProvider>
      <div className="relative w-full h-screen bg-gray-950">
        <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white">Agentropolis</h1>
          <div className="flex items-center gap-4">
            <SessionStatus />
            <UserIdentity />
            <ConnectButton />
          </div>
        </header>
        <PhaserGame />
        <SwapHandler />
      </div>
    </SessionProvider>
  )
}
