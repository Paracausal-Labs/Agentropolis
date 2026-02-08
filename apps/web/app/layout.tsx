import { Rajdhani } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
})

import { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#0a0a1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'AGENTROPOLIS | Cyberpunk City Builder',
    template: '%s | AGENTROPOLIS'
  },
  description: 'Deploy AI agents, join the Council, and execute on-chain strategies in a neon-lit cyberpunk city.',
  keywords: ['DeFi', 'GameFi', 'AI Agents', 'Cyberpunk', 'Base', 'Uniswap', 'Yellow Network'],
  authors: [{ name: 'Agentropolis Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://agentropolis.xyz',
    title: 'AGENTROPOLIS',
    description: 'Cyberpunk DeFi City Builder powered by AI Agents',
    siteName: 'Agentropolis',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AGENTROPOLIS',
    description: 'Cyberpunk DeFi City Builder powered by AI Agents',
    creator: '@agentropolis',
  },
  icons: {
    icon: '/icon.png', // Next.js auto-generated
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rajdhani.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
