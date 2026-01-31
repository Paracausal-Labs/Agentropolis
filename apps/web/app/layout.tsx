import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
