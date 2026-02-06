'use client'

import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { config } from '@/lib/wagmi'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    {children}
                    <Toaster position="bottom-right" theme="dark" />
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
