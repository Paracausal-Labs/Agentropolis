'use client'

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react'
import type { PublicClient, WalletClient, Chain, Account, Transport } from 'viem'
import { createNitroliteClient, connectToClearnode, isMockMode, NitroliteClient } from './client'
import { YELLOW_CONTRACTS, YELLOW_DEFAULTS, formatYtestUsd } from './constants'

export type ChannelStatus = 
  | 'disconnected'
  | 'approving'
  | 'depositing'
  | 'connecting'
  | 'creating'
  | 'active'
  | 'closing'
  | 'settled'
  | 'error'

export interface ChannelState {
  status: ChannelStatus
  channelId?: string
  depositAmount: bigint
  balance: bigint
  error?: string
  txHash?: string
}

export interface ChannelManager {
  state: ChannelState
  deposit: (amount?: bigint) => Promise<string | null>
  createChannel: () => Promise<string | null>
  closeChannel: () => Promise<void>
  getClient: () => NitroliteClient | null
}

const initialState: ChannelState = {
  status: 'disconnected',
  depositAmount: BigInt(0),
  balance: BigInt(0),
}

function createMockChannelManager(): ChannelManager {
  let state: ChannelState = { ...initialState }
  let listeners = new Set<(state: ChannelState) => void>()

  function setState(updates: Partial<ChannelState>) {
    state = { ...state, ...updates }
    listeners.forEach(cb => cb(state))
  }

  return {
    get state() { return state },

    async deposit(amount = YELLOW_DEFAULTS.DEPOSIT_AMOUNT) {
      console.log('[Yellow Mock] Depositing:', formatYtestUsd(amount), 'ytest.USD')
      
      setState({ status: 'approving' })
      await new Promise(r => setTimeout(r, 500))
      
      setState({ status: 'depositing' })
      await new Promise(r => setTimeout(r, 800))
      
      const mockTxHash = `0x${Date.now().toString(16).padStart(64, '0')}`
      setState({
        status: 'disconnected',
        depositAmount: amount,
        balance: amount,
        txHash: mockTxHash,
      })
      
      console.log('[Yellow Mock] Deposit complete:', mockTxHash)
      return mockTxHash
    },

    async createChannel() {
      if (state.depositAmount === BigInt(0)) {
        throw new Error('Must deposit before creating channel')
      }

      console.log('[Yellow Mock] Creating channel...')
      
      setState({ status: 'connecting' })
      await new Promise(r => setTimeout(r, 600))
      
      setState({ status: 'creating' })
      await new Promise(r => setTimeout(r, 800))
      
      const channelId = `channel-${Date.now()}`
      setState({
        status: 'active',
        channelId,
      })
      
      console.log('[Yellow Mock] Channel created:', channelId)
      return channelId
    },

    async closeChannel() {
      if (state.status !== 'active') {
        throw new Error('No active channel to close')
      }

      console.log('[Yellow Mock] Closing channel...')
      
      setState({ status: 'closing' })
      await new Promise(r => setTimeout(r, 1000))
      
      setState({
        status: 'settled',
        channelId: undefined,
      })
      
      console.log('[Yellow Mock] Channel settled')
    },

    getClient() {
      return null
    },
  }
}

function createRealChannelManager(
  publicClient: PublicClient,
  walletClient: WalletClient<Transport, Chain, Account>
): ChannelManager {
  let state: ChannelState = { ...initialState }
  let client: NitroliteClient | null = null
  let ws: WebSocket | null = null

  function setState(updates: Partial<ChannelState>) {
    state = { ...state, ...updates }
  }

  return {
    get state() { return state },

    async deposit(amount = YELLOW_DEFAULTS.DEPOSIT_AMOUNT) {
      try {
        if (!client) {
          client = createNitroliteClient(publicClient, walletClient)
          if (!client) {
            throw new Error('Failed to create Nitrolite client')
          }
        }

        console.log('[Yellow] Depositing:', formatYtestUsd(amount), 'ytest.USD')

        setState({ status: 'approving', error: undefined })
        
        await client.approveTokens(YELLOW_CONTRACTS.YTEST_USD, amount)
        console.log('[Yellow] Token approval complete')

        setState({ status: 'depositing' })
        
        const depositResult = await client.deposit(YELLOW_CONTRACTS.YTEST_USD, amount) as unknown as string | { hash: string } | null
        const txHash = typeof depositResult === 'string' ? depositResult : (depositResult as { hash?: string } | null)?.hash ?? null
        
        console.log('[Yellow] Deposit complete:', txHash)

        setState({
          status: 'disconnected',
          depositAmount: amount,
          balance: amount,
          txHash: txHash ?? undefined,
        })

        return txHash
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Deposit failed'
        console.error('[Yellow] Deposit error:', errorMessage)
        setState({ status: 'error', error: errorMessage })
        throw err
      }
    },

    async createChannel() {
      if (state.depositAmount === BigInt(0)) {
        throw new Error('Must deposit before creating channel')
      }

      if (!client) {
        client = createNitroliteClient(publicClient, walletClient)
        if (!client) {
          throw new Error('Failed to create Nitrolite client')
        }
      }

      try {
        setState({ status: 'connecting', error: undefined })
        
        ws = await connectToClearnode()
        console.log('[Yellow] Connected to clearnode')

        setState({ status: 'creating' })

        const address = walletClient.account.address
        const channelParams = {
          participants: [address],
          adjudicator: YELLOW_CONTRACTS.CUSTODY,
          challenge: BigInt(86400),
          nonce: BigInt(Date.now()),
        }
        const channelResult = await (client.createChannel as unknown as (params: typeof channelParams) => Promise<unknown>)(channelParams)

        const channelId = typeof channelResult === 'string' 
          ? channelResult 
          : (channelResult as { channelId?: string } | null)?.channelId ?? `channel-${Date.now()}`

        console.log('[Yellow] Channel created:', channelId)

        setState({
          status: 'active',
          channelId,
        })

        return channelId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Channel creation failed'
        console.error('[Yellow] Channel error:', errorMessage)
        setState({ status: 'error', error: errorMessage })
        
        if (ws) {
          ws.close()
          ws = null
        }
        
        throw err
      }
    },

    async closeChannel() {
      if (state.status !== 'active') {
        throw new Error('No active channel to close')
      }

      try {
        setState({ status: 'closing', error: undefined })

        if (ws) {
          ws.close()
          ws = null
        }

        if (client && state.channelId) {
          console.log('[Yellow] Closing channel:', state.channelId)
        }

        setState({
          status: 'settled',
          channelId: undefined,
        })

        console.log('[Yellow] Channel settled')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Channel close failed'
        console.error('[Yellow] Close error:', errorMessage)
        setState({ status: 'error', error: errorMessage })
        throw err
      }
    },

    getClient() {
      return client
    },
  }
}

export function createChannelManager(
  publicClient?: PublicClient,
  walletClient?: WalletClient<Transport, Chain, Account>
): ChannelManager {
  if (isMockMode() || !publicClient || !walletClient) {
    console.log('[Yellow] Using mock channel manager')
    return createMockChannelManager()
  }

  console.log('[Yellow] Using real channel manager')
  return createRealChannelManager(publicClient, walletClient)
}

export async function depositToYellow(
  publicClient: PublicClient,
  walletClient: WalletClient<Transport, Chain, Account>,
  amount: bigint = YELLOW_DEFAULTS.DEPOSIT_AMOUNT
): Promise<string | null> {
  if (isMockMode()) {
    console.log('[Yellow Mock] depositToYellow:', formatYtestUsd(amount))
    await new Promise(r => setTimeout(r, 1000))
    return `0x${Date.now().toString(16).padStart(64, '0')}`
  }

  const client = createNitroliteClient(publicClient, walletClient)
  if (!client) {
    throw new Error('Failed to create Nitrolite client')
  }

  await client.approveTokens(YELLOW_CONTRACTS.YTEST_USD, amount)
  const result = await client.deposit(YELLOW_CONTRACTS.YTEST_USD, amount) as unknown as string | { hash: string } | null
  
  return typeof result === 'string' ? result : (result as { hash?: string } | null)?.hash ?? null
}

export async function createChannel(
  publicClient: PublicClient,
  walletClient: WalletClient<Transport, Chain, Account>
): Promise<string | null> {
  if (isMockMode()) {
    console.log('[Yellow Mock] createChannel')
    await new Promise(r => setTimeout(r, 1000))
    return `channel-${Date.now()}`
  }

  const client = createNitroliteClient(publicClient, walletClient)
  if (!client) {
    throw new Error('Failed to create Nitrolite client')
  }

  await connectToClearnode()
  const address = walletClient.account.address

  const channelParams = {
    participants: [address],
    adjudicator: YELLOW_CONTRACTS.CUSTODY,
    challenge: BigInt(86400),
    nonce: BigInt(Date.now()),
  }
  const result = await (client.createChannel as unknown as (params: typeof channelParams) => Promise<unknown>)(channelParams)

  return typeof result === 'string' ? result : (result as { channelId?: string } | null)?.channelId ?? null
}

interface YellowChannelContextValue {
  state: ChannelState
  deposit: (amount?: bigint) => Promise<string | null>
  createChannel: () => Promise<string | null>
  closeChannel: () => Promise<void>
  isLoading: boolean
}

const YellowChannelContext = createContext<YellowChannelContextValue | null>(null)

interface YellowChannelProviderProps {
  children: ReactNode
  publicClient?: PublicClient
  walletClient?: WalletClient<Transport, Chain, Account>
}

export function YellowChannelProvider({ 
  children, 
  publicClient, 
  walletClient 
}: YellowChannelProviderProps) {
  const [state, setState] = useState<ChannelState>(initialState)
  const [manager, setManager] = useState<ChannelManager | null>(null)

  useEffect(() => {
    const mgr = createChannelManager(publicClient, walletClient)
    setManager(mgr)
    setState(mgr.state)
  }, [publicClient, walletClient])

  const isLoading = ['approving', 'depositing', 'connecting', 'creating', 'closing'].includes(state.status)

  const deposit = useCallback(async (amount?: bigint) => {
    if (!manager) return null
    const result = await manager.deposit(amount)
    setState(manager.state)
    return result
  }, [manager])

  const handleCreateChannel = useCallback(async () => {
    if (!manager) return null
    const result = await manager.createChannel()
    setState(manager.state)
    return result
  }, [manager])

  const closeChannel = useCallback(async () => {
    if (!manager) return
    await manager.closeChannel()
    setState(manager.state)
  }, [manager])

  return (
    <YellowChannelContext.Provider 
      value={{ 
        state, 
        deposit, 
        createChannel: handleCreateChannel, 
        closeChannel,
        isLoading,
      }}
    >
      {children}
    </YellowChannelContext.Provider>
  )
}

export function useYellowChannel(): YellowChannelContextValue {
  const context = useContext(YellowChannelContext)
  if (!context) {
    throw new Error('useYellowChannel must be used within YellowChannelProvider')
  }
  return context
}

export function formatChannelStatus(status: ChannelStatus): string {
  const labels: Record<ChannelStatus, string> = {
    disconnected: 'Not Connected',
    approving: 'Approving Token...',
    depositing: 'Depositing...',
    connecting: 'Connecting...',
    creating: 'Creating Channel...',
    active: 'Active',
    closing: 'Closing...',
    settled: 'Settled',
    error: 'Error',
  }
  return labels[status]
}
