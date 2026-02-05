import { SessionProvider } from '@/components/SessionProvider'
import { AppPageContent } from '@/components/AppPageContent'
import { GameProvider } from '@/contexts/GameContext'

export default function AppPage() {
  return (
    <SessionProvider>
      <GameProvider>
        <AppPageContent />
      </GameProvider>
    </SessionProvider>
  )
}
