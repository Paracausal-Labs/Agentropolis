'use client'

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react'
import type { PublicClient, WalletClient, Chain, Account, Transport, Address, Hex } from 'viem'
import {
  createAppSessionMessage,
  createSubmitAppStateMessage,
  createCloseAppSessionMessage,
  generateRequestId,
  RPCMethod,
  RPCProtocolVersion,
  RPCAppStateIntent,
} from '@erc7824/nitrolite'
import type { MessageSigner } from '@erc7824/nitrolite'
import {
  createNitroliteClient,
  connectAndAuth,
  isMockMode,
  NitroliteClient,
  WebSocketRouter,
} from './client'
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
  executeOffChainTransfer: (operationType: string, amount: bigint) => Promise<TransferResult>
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
  let transferLog: Array<{ operationType: string; amount: bigint; timestamp: number }> = []

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

    async executeOffChainTransfer(operationType: string, amount: bigint): Promise<TransferResult> {
      if (state.status !== 'active') {
        return { success: false, newBalance: state.balance, error: 'Channel not active' }
      }

      if (amount <= BigInt(0)) {
        return { success: false, newBalance: state.balance, error: 'Amount must be positive' }
      }

      if (amount > state.balance) {
        return { success: false, newBalance: state.balance, error: 'Insufficient balance' }
      }

      console.log(`[Yellow Mock] Off-chain state update (${operationType}): ${formatYtestUsd(amount)} ytest.USD`)

      await new Promise(r => setTimeout(r, 100))

      const newBalance = state.balance - amount
      const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`

      transferLog.push({ operationType, amount, timestamp: Date.now() })

      setState({ balance: newBalance })

      console.log(`[Yellow Mock] State update complete: txId=${txId}, newBalance=${formatYtestUsd(newBalance)}`)

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
  let clientPromise: Promise<NitroliteClient | null> | null = null
  let router: WebSocketRouter | null = null
  let messageSigner: MessageSigner | null = null
  let brokerAddress: Address | null = null
  let appSessionId: Hex | null = null
  let stateVersion = 0

  function setState(updates: Partial<ChannelState>) {
    state = { ...state, ...updates }
  }

  async function ensureClient(): Promise<NitroliteClient> {
    if (client) return client

    if (!clientPromise) {
      clientPromise = createNitroliteClient(publicClient, walletClient)
    }

    client = await clientPromise
    if (!client) {
      throw new Error('Failed to create Nitrolite client')
    }
    return client
  }

  async function ensureAuthConnection(): Promise<{ router: WebSocketRouter; signer: MessageSigner; broker: Address }> {
    if (router?.isOpen && messageSigner && brokerAddress) {
      return { router, signer: messageSigner, broker: brokerAddress }
    }

    const connection = await connectAndAuth(walletClient)
    router = connection.router
    messageSigner = connection.messageSigner
    brokerAddress = connection.brokerAddress
    return { router, signer: messageSigner, broker: brokerAddress }
  }

  return {
    get state() { return state },

    async deposit(amount = YELLOW_DEFAULTS.DEPOSIT_AMOUNT) {
      try {
        const nitrolite = await ensureClient()

        console.log('[Yellow] Depositing:', formatYtestUsd(amount), 'ytest.USD')

        setState({ status: 'approving', error: undefined })

        const allowance = await nitrolite.getTokenAllowance(YELLOW_CONTRACTS.YTEST_USD)
        if (allowance < amount) {
          await nitrolite.approveTokens(YELLOW_CONTRACTS.YTEST_USD, amount)
          console.log('[Yellow] Token approval complete')
        }

        setState({ status: 'depositing' })

        const txHash = await nitrolite.deposit(YELLOW_CONTRACTS.YTEST_USD, amount)
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

      try {
        setState({ status: 'connecting', error: undefined })

        const { router: r, signer, broker } = await ensureAuthConnection()
        console.log('[Yellow] Authenticated with clearnode')

        setState({ status: 'creating' })

        const userAddress = walletClient.account.address
        const reqId = generateRequestId()

        const appSessionMsg = await createAppSessionMessage(
          signer,
          {
            definition: {
              application: 'agentropolis/v1',
              protocol: RPCProtocolVersion.NitroRPC_0_4,
              participants: [userAddress as Hex, broker as Hex],
              weights: [1, 1],
              quorum: 2,
              challenge: 0,
              nonce: Date.now(),
            },
            allocations: [{
              asset: YELLOW_CONTRACTS.YTEST_USD,
              amount: state.depositAmount.toString(),
              participant: userAddress,
            }],
          },
          reqId,
        )

        console.log('[Yellow] Sending create_app_session...')
        const response = await r.send(appSessionMsg, reqId)

        if (response.method === RPCMethod.Error) {
          const errParams = response as unknown as { params?: { error?: string } }
          throw new Error(errParams.params?.error ?? 'App session creation failed')
        }

        if (response.method !== RPCMethod.CreateAppSession) {
          throw new Error(`Expected create_app_session response, got ${response.method}`)
        }

        const sessionParams = response as unknown as { params: { appSessionId: Hex; version: number } }
        appSessionId = sessionParams.params.appSessionId
        stateVersion = sessionParams.params.version

        console.log('[Yellow] App session created:', appSessionId)

        setState({
          status: 'active',
          channelId: appSessionId,
        })

        return appSessionId
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'App session creation failed'
        console.error('[Yellow] App session error:', errorMessage)
        setState({ status: 'error', error: errorMessage })

        if (router) {
          router.dispose()
          router = null
        }

        throw err
      }
    },

    async executeOffChainTransfer(operationType: string, amount: bigint): Promise<TransferResult> {
      if (state.status !== 'active') {
        return { success: false, newBalance: state.balance, error: 'Channel not active' }
      }

      if (amount <= BigInt(0)) {
        return { success: false, newBalance: state.balance, error: 'Amount must be positive' }
      }

      if (amount > state.balance) {
        return { success: false, newBalance: state.balance, error: 'Insufficient balance' }
      }

      if (!appSessionId || !router?.isOpen || !messageSigner) {
        return { success: false, newBalance: state.balance, error: 'No active app session' }
      }

      try {
        const userAddress = walletClient.account.address
        const newBalance = state.balance - amount
        stateVersion += 1

        console.log(`[Yellow] Submitting state update (${operationType}): ${formatYtestUsd(amount)} ytest.USD`)

        const reqId = generateRequestId()
        const submitMsg = await createSubmitAppStateMessage<typeof RPCProtocolVersion.NitroRPC_0_4>(
          messageSigner,
          {
            app_session_id: appSessionId,
            intent: RPCAppStateIntent.Operate,
            version: stateVersion,
            allocations: [{
              asset: YELLOW_CONTRACTS.YTEST_USD,
              amount: newBalance.toString(),
              participant: userAddress,
            }],
            session_data: operationType,
          },
          reqId,
        )

        const response = await router.send(submitMsg, reqId)

        if (response.method === RPCMethod.Error) {
          const errParams = response as unknown as { params?: { error?: string } }
          return { success: false, newBalance: state.balance, error: errParams.params?.error ?? 'State update failed' }
        }

        if (response.method !== RPCMethod.SubmitAppState) {
          return { success: false, newBalance: state.balance, error: `Unexpected response: ${response.method}` }
        }

        const stateResponse = response as unknown as { params: { version: number } }
        stateVersion = stateResponse.params.version

        setState({ balance: newBalance })

        const txId = `${appSessionId}-v${stateVersion}`
        console.log(`[Yellow] State update complete: txId=${txId}, newBalance=${formatYtestUsd(newBalance)}`)

        return { success: true, newBalance, txId }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'State update failed'
        console.error('[Yellow] State update error:', errorMessage)
        return { success: false, newBalance: state.balance, error: errorMessage }
      }
    },

    async closeChannel(): Promise<SettlementResult> {
      if (state.status !== 'active') {
        return { success: false, finalBalance: state.balance, error: 'No active channel to close' }
      }

      try {
        setState({ status: 'closing', error: undefined })

        console.log('[Yellow] Closing app session:', appSessionId)

        let settlementTxHash: string | undefined

        if (appSessionId && router?.isOpen && messageSigner) {
          const userAddress = walletClient.account.address
          const reqId = generateRequestId()

          const closeMsg = await createCloseAppSessionMessage(
            messageSigner,
            {
              app_session_id: appSessionId,
              allocations: [{
                asset: YELLOW_CONTRACTS.YTEST_USD,
                amount: state.balance.toString(),
                participant: userAddress,
              }],
            },
            reqId,
          )

          console.log('[Yellow] Sending close_app_session...')
          const response = await router.send(closeMsg, reqId, 10_000)

          if (response.method === RPCMethod.CloseAppSession) {
            const closeParams = response as unknown as { params: { appSessionId: Hex } }
            settlementTxHash = closeParams.params.appSessionId
            console.log('[Yellow] Close confirmed:', settlementTxHash)
          } else if (response.method === RPCMethod.Error) {
            const errParams = response as unknown as { params?: { error?: string } }
            console.warn('[Yellow] Close error from server:', errParams.params?.error)
          }
        }

        if (router) {
          router.dispose()
          router = null
        }

        const finalBalance = state.balance
        appSessionId = null
        stateVersion = 0

        setState({
          status: 'settled',
          channelId: undefined,
        })

        console.log(`[Yellow] Settlement complete: ref=${settlementTxHash}, finalBalance=${formatYtestUsd(finalBalance)}`)

        return { success: true, txHash: settlementTxHash, finalBalance }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Channel close failed'
        console.error('[Yellow] Close error:', errorMessage)

        if (router) {
          router.dispose()
          router = null
        }

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
        const nitrolite = await ensureClient()

        console.log(`[Yellow] Withdrawing ${formatYtestUsd(withdrawAmount)} from custody...`)

        const txHash = await nitrolite.withdrawal(YELLOW_CONTRACTS.YTEST_USD, withdrawAmount)

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

  const client = await createNitroliteClient(publicClient, walletClient)
  if (!client) {
    throw new Error('Failed to create Nitrolite client')
  }

  const allowance = await client.getTokenAllowance(YELLOW_CONTRACTS.YTEST_USD)
  if (allowance < amount) {
    await client.approveTokens(YELLOW_CONTRACTS.YTEST_USD, amount)
  }
  
  const txHash = await client.deposit(YELLOW_CONTRACTS.YTEST_USD, amount)
  return txHash
}

/** @deprecated Use createChannelManager().createChannel() instead. */
export async function createYellowChannel(
  _publicClient: PublicClient,
  _walletClient: WalletClient<Transport, Chain, Account>,
  _depositAmount: bigint
): Promise<string | null> {
  if (isMockMode()) {
    console.log('[Yellow Mock] createChannel')
    await new Promise(r => setTimeout(r, 1000))
    return `channel-${Date.now()}`
  }

  console.warn('[Yellow] createYellowChannel is deprecated — use ChannelManager.createChannel()')
  return null
}

interface YellowChannelContextValue {
  state: ChannelState
  deposit: (amount?: bigint) => Promise<string | null>
  createChannel: () => Promise<string | null>
  executeOffChainTransfer: (operationType: string, amount: bigint) => Promise<TransferResult>
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

  const executeOffChainTransfer = useCallback(async (operationType: string, amount: bigint): Promise<TransferResult> => {
    if (!manager) return { success: false, newBalance: BigInt(0), error: 'No manager' }
    const result = await manager.executeOffChainTransfer(operationType, amount)
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
