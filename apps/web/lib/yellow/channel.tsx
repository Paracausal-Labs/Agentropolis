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

export interface TransferResult {
  success: boolean
  newBalance: bigint
  txId?: string
  error?: string
}

export interface SettlementResult {
  success: boolean
  txHash?: string
  finalBalance: bigint
  error?: string
}

export interface WithdrawalResult {
  success: boolean
  txHash?: string
  amount: bigint
  error?: string
}

export interface ChannelManager {
  state: ChannelState
  deposit: (amount?: bigint) => Promise<string | null>
  createChannel: () => Promise<string | null>
  executeOffChainTransfer: (destination: string, amount: bigint) => Promise<TransferResult>
  closeChannel: () => Promise<SettlementResult>
  withdrawFromYellow: (amount?: bigint) => Promise<WithdrawalResult>
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
  let transferLog: Array<{ destination: string; amount: bigint; timestamp: number }> = []

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

    async executeOffChainTransfer(destination: string, amount: bigint): Promise<TransferResult> {
      if (state.status !== 'active') {
        return { success: false, newBalance: state.balance, error: 'Channel not active' }
      }

      if (amount <= BigInt(0)) {
        return { success: false, newBalance: state.balance, error: 'Amount must be positive' }
      }

      if (amount > state.balance) {
        return { success: false, newBalance: state.balance, error: 'Insufficient balance' }
      }

      console.log(`[Yellow Mock] Off-chain transfer: ${formatYtestUsd(amount)} ytest.USD to ${destination}`)
      
      // Simulate slight delay for off-chain signing
      await new Promise(r => setTimeout(r, 100))
      
      const newBalance = state.balance - amount
      const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`
      
      transferLog.push({ destination, amount, timestamp: Date.now() })
      
      setState({ balance: newBalance })
      
      console.log(`[Yellow Mock] Transfer complete: txId=${txId}, newBalance=${formatYtestUsd(newBalance)}`)
      
      return { success: true, newBalance, txId }
    },

    async closeChannel(): Promise<SettlementResult> {
      if (state.status !== 'active') {
        return { success: false, finalBalance: state.balance, error: 'No active channel to close' }
      }

      console.log('[Yellow Mock] Closing channel and settling...')
      console.log('[Yellow Mock] Transfer log:', transferLog.length, 'transactions')
      
      setState({ status: 'closing' })
      
      // Step 1: Off-chain close handshake
      await new Promise(r => setTimeout(r, 500))
      console.log('[Yellow Mock] Close handshake complete')
      
      // Step 2: On-chain settlement
      await new Promise(r => setTimeout(r, 800))
      
      const finalBalance = state.balance
      const settlementTxHash = `0x${Date.now().toString(16).padStart(64, 'a')}`
      
      setState({
        status: 'settled',
        channelId: undefined,
      })
      
      console.log(`[Yellow Mock] Settlement complete: txHash=${settlementTxHash}, finalBalance=${formatYtestUsd(finalBalance)}`)
      
      // Clear transfer log after settlement
      transferLog = []
      
      return { success: true, txHash: settlementTxHash, finalBalance }
    },

    async withdrawFromYellow(amount?: bigint): Promise<WithdrawalResult> {
      const withdrawAmount = amount ?? state.balance
      
      if (state.status === 'active') {
        return { success: false, amount: BigInt(0), error: 'Must close channel before withdrawing' }
      }

      if (withdrawAmount <= BigInt(0)) {
        return { success: false, amount: BigInt(0), error: 'No balance to withdraw' }
      }

      if (withdrawAmount > state.balance) {
        return { success: false, amount: BigInt(0), error: 'Insufficient custody balance' }
      }

      console.log(`[Yellow Mock] Withdrawing ${formatYtestUsd(withdrawAmount)} from custody...`)
      
      await new Promise(r => setTimeout(r, 800))
      
      const txHash = `0x${Date.now().toString(16).padStart(64, 'b')}`
      const newBalance = state.balance - withdrawAmount
      
      setState({ balance: newBalance, depositAmount: newBalance })
      
      console.log(`[Yellow Mock] Withdrawal complete: txHash=${txHash}`)
      
      return { success: true, txHash, amount: withdrawAmount }
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

  function ensureClient(): NitroliteClient {
    if (!client) {
      client = createNitroliteClient(publicClient, walletClient)
      if (!client) {
        throw new Error('Failed to create Nitrolite client')
      }
    }
    return client
  }

  return {
    get state() { return state },

    async deposit(amount = YELLOW_DEFAULTS.DEPOSIT_AMOUNT) {
      try {
        const nitrolite = ensureClient()

        console.log('[Yellow] Depositing:', formatYtestUsd(amount), 'ytest.USD')

        setState({ status: 'approving', error: undefined })
        
        await nitrolite.approveTokens(YELLOW_CONTRACTS.YTEST_USD, amount)
        console.log('[Yellow] Token approval complete')

        setState({ status: 'depositing' })
        
        const depositResult = await nitrolite.deposit(YELLOW_CONTRACTS.YTEST_USD, amount) as unknown as string | { hash: string } | null
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

      const nitrolite = ensureClient()

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
        const channelResult = await (nitrolite.createChannel as unknown as (params: typeof channelParams) => Promise<unknown>)(channelParams)

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

    async executeOffChainTransfer(destination: string, amount: bigint): Promise<TransferResult> {
      if (state.status !== 'active') {
        return { success: false, newBalance: state.balance, error: 'Channel not active' }
      }

      if (amount <= BigInt(0)) {
        return { success: false, newBalance: state.balance, error: 'Amount must be positive' }
      }

      if (amount > state.balance) {
        return { success: false, newBalance: state.balance, error: 'Insufficient balance' }
      }

      try {
        const nitrolite = ensureClient()
        
        console.log(`[Yellow] Off-chain transfer: ${formatYtestUsd(amount)} ytest.USD to ${destination}`)

        const transferResult = await (nitrolite as unknown as { 
          transfer?: (params: { to: string; amount: bigint; token: string }) => Promise<{ txId?: string }> 
        }).transfer?.({
          to: destination,
          amount,
          token: YELLOW_CONTRACTS.YTEST_USD,
        })

        const txId = transferResult?.txId ?? `tx-${Date.now()}`
        const newBalance = state.balance - amount
        
        setState({ balance: newBalance })
        
        console.log(`[Yellow] Transfer complete: txId=${txId}, newBalance=${formatYtestUsd(newBalance)}`)
        
        return { success: true, newBalance, txId }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Transfer failed'
        console.error('[Yellow] Transfer error:', errorMessage)
        return { success: false, newBalance: state.balance, error: errorMessage }
      }
    },

    async closeChannel(): Promise<SettlementResult> {
      if (state.status !== 'active') {
        return { success: false, finalBalance: state.balance, error: 'No active channel to close' }
      }

      try {
        const nitrolite = ensureClient()
        
        setState({ status: 'closing', error: undefined })

        console.log('[Yellow] Initiating close handshake for channel:', state.channelId)

        if (ws) {
          ws.close()
          ws = null
        }

        let settlementTxHash: string | undefined

        if (state.channelId) {
          const closeResult = await (nitrolite.closeChannel as unknown as (channelId: string) => Promise<{ txHash?: string } | string | null>)?.(state.channelId)
          
          if (typeof closeResult === 'string') {
            settlementTxHash = closeResult
          } else if (closeResult && typeof closeResult === 'object') {
            settlementTxHash = closeResult.txHash
          }
        }

        const finalBalance = state.balance
        
        setState({
          status: 'settled',
          channelId: undefined,
        })

        console.log(`[Yellow] Settlement complete: txHash=${settlementTxHash}, finalBalance=${formatYtestUsd(finalBalance)}`)

        return { success: true, txHash: settlementTxHash, finalBalance }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Channel close failed'
        console.error('[Yellow] Close error:', errorMessage)
        setState({ status: 'error', error: errorMessage })
        return { success: false, finalBalance: state.balance, error: errorMessage }
      }
    },

    async withdrawFromYellow(amount?: bigint): Promise<WithdrawalResult> {
      const withdrawAmount = amount ?? state.balance
      
      if (state.status === 'active') {
        return { success: false, amount: BigInt(0), error: 'Must close channel before withdrawing' }
      }

      if (withdrawAmount <= BigInt(0)) {
        return { success: false, amount: BigInt(0), error: 'No balance to withdraw' }
      }

      if (withdrawAmount > state.balance) {
        return { success: false, amount: BigInt(0), error: 'Insufficient custody balance' }
      }

      try {
        const nitrolite = ensureClient()
        
        console.log(`[Yellow] Withdrawing ${formatYtestUsd(withdrawAmount)} from custody...`)

        const withdrawResult = await (nitrolite.withdrawal as unknown as (token: string, amount: bigint) => Promise<{ hash?: string } | string | null>)?.(
          YELLOW_CONTRACTS.YTEST_USD,
          withdrawAmount
        )

        let txHash: string | undefined
        if (typeof withdrawResult === 'string') {
          txHash = withdrawResult
        } else if (withdrawResult && typeof withdrawResult === 'object') {
          txHash = withdrawResult.hash
        }

        const newBalance = state.balance - withdrawAmount
        setState({ balance: newBalance, depositAmount: newBalance })

        console.log(`[Yellow] Withdrawal complete: txHash=${txHash}`)

        return { success: true, txHash, amount: withdrawAmount }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed'
        console.error('[Yellow] Withdrawal error:', errorMessage)
        return { success: false, amount: BigInt(0), error: errorMessage }
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
  executeOffChainTransfer: (destination: string, amount: bigint) => Promise<TransferResult>
  closeChannel: () => Promise<SettlementResult>
  withdrawFromYellow: (amount?: bigint) => Promise<WithdrawalResult>
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

  const executeOffChainTransfer = useCallback(async (destination: string, amount: bigint): Promise<TransferResult> => {
    if (!manager) return { success: false, newBalance: BigInt(0), error: 'No manager' }
    const result = await manager.executeOffChainTransfer(destination, amount)
    setState(manager.state)
    return result
  }, [manager])

  const closeChannel = useCallback(async (): Promise<SettlementResult> => {
    if (!manager) return { success: false, finalBalance: BigInt(0), error: 'No manager' }
    const result = await manager.closeChannel()
    setState(manager.state)
    return result
  }, [manager])

  const withdrawFromYellow = useCallback(async (amount?: bigint): Promise<WithdrawalResult> => {
    if (!manager) return { success: false, amount: BigInt(0), error: 'No manager' }
    const result = await manager.withdrawFromYellow(amount)
    setState(manager.state)
    return result
  }, [manager])

  return (
    <YellowChannelContext.Provider 
      value={{ 
        state, 
        deposit, 
        createChannel: handleCreateChannel, 
        executeOffChainTransfer,
        closeChannel,
        withdrawFromYellow,
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
