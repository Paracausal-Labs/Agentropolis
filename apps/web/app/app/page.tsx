import { SessionProvider } from '@/components/SessionProvider'
import { AppPageContent } from '@/components/AppPageContent'

export default function AppPage() {
  return (
    <SessionProvider>
      <AppPageContent />
    </SessionProvider>
  )
}
