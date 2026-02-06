import type { Metadata } from "next"
import { Orbitron, Space_Grotesk } from "next/font/google"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: "Agentropolis Reboot",
  description: "Three.js native game simulation with autonomous trading council.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${spaceGrotesk.variable}`}>{children}</body>
    </html>
  )
}
