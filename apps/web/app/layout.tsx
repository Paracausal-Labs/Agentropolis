import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/components/WalletProvider'
import { ErrorToastProvider } from '@/components/ErrorToast'

export const metadata: Metadata = {
  title: 'Agentropolis',
  description: 'Build a city of agents, approve their plans, execute trades on-chain.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <ErrorToastProvider>
            {children}
          </ErrorToastProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
