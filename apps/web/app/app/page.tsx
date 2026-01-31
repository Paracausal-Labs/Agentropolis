import PhaserGame from '@/components/game/PhaserGame'
import { ConnectButton } from '@/components/ConnectButton'

export default function AppPage() {
  return (
    <div className="relative w-full h-screen bg-gray-950">
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-white">Agentropolis</h1>
        <ConnectButton />
      </header>
      <PhaserGame />
    </div>
  )
}
