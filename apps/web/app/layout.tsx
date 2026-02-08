import { Rajdhani } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
})

export const metadata = {
  title: 'AGENTROPOLIS | 2026',
  description: 'Cyberpunk DeFi City Builder',
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
