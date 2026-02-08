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
                    <Toaster
                        position="bottom-right"
                        theme="dark"
                        toastOptions={{
                            style: {
                                background: '#050510',
                                border: '1px solid rgba(252, 238, 10, 0.4)',
                                color: '#ffffff',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.05em',
                            },
                            classNames: {
                                success: '!border-[#00FF88]/50',
                                error: '!border-[#FF3366]/50',
                                info: '!border-[#00F0FF]/50',
                            },
                        }}
                        offset={48}
                    />
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
