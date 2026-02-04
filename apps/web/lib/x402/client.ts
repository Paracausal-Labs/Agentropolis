'use client'

import { useState, useEffect } from 'react'
import { useWalletClient } from 'wagmi'
import type { WalletClient } from 'viem'

const BASE_SEPOLIA_NETWORK = 'eip155:84532'

export interface X402PaymentResult {
  paid: boolean
  txHash?: string
  error?: string
}

export async function createX402Fetch(walletClient: WalletClient): Promise<typeof fetch> {
  try {
    const { wrapFetchWithPayment, x402Client } = await import('@x402/fetch')
    const { registerExactEvmScheme } = await import('@x402/evm/exact/client')

    if (!walletClient.account) {
      throw new Error('Wallet not connected')
    }

    const client = new x402Client()

    const signer = {
      address: walletClient.account.address,
      signTypedData: async (message: {
        domain: Record<string, unknown>
        types: Record<string, unknown>
        primaryType: string
        message: Record<string, unknown>
      }) => {
        return walletClient.signTypedData({
          account: walletClient.account!,
          domain: message.domain as Parameters<typeof walletClient.signTypedData>[0]['domain'],
          types: message.types as Parameters<typeof walletClient.signTypedData>[0]['types'],
          primaryType: message.primaryType,
          message: message.message,
        })
      },
    }

    registerExactEvmScheme(client, { signer })

    return wrapFetchWithPayment(fetch, client)
  } catch (error) {
    console.error('[x402] Failed to create payment-enabled fetch:', error)
    return fetch
  }
}

export function useX402Fetch(): {
  x402Fetch: typeof fetch | null
  isReady: boolean
  error: string | null
} {
  const { data: walletClient } = useWalletClient()
  const [x402Fetch, setX402Fetch] = useState<typeof fetch | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!walletClient?.account) {
      setX402Fetch(null)
      setIsReady(false)
      setError(null)
      return
    }

    createX402Fetch(walletClient)
      .then((f) => {
        setX402Fetch(() => f)
        setIsReady(true)
        setError(null)
      })
      .catch((e) => {
        setError(e.message)
        setX402Fetch(() => fetch)
        setIsReady(true)
      })
  }, [walletClient])

  return { x402Fetch, isReady, error }
}

export async function callWithX402Payment(
  endpoint: string,
  body: unknown,
  walletClient: WalletClient
): Promise<{ response: Response; paymentTxHash?: string }> {
  const x402Fetch = await createX402Fetch(walletClient)

  const response = await x402Fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const paymentTxHash = response.headers.get('X-Payment-Response') || undefined

  if (paymentTxHash) {
    console.log('[x402] Payment settled:', paymentTxHash)
  }

  return { response, paymentTxHash }
}

export { BASE_SEPOLIA_NETWORK }
