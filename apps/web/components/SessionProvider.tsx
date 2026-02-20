'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { 
  createChannelManager, 
  ChannelManager, 
  ChannelState, 
  ChannelStatus,
  TransferResult,
  SettlementResult,
  WithdrawalResult,
} from '@/lib/yellow/channel'
import { YELLOW_DEFAULTS, formatYtestUsd } from '@/lib/yellow/constants'

export interface ChargeEntry {
  type: string
  amount: string
  timestamp: number
}

export type SessionStatus = 'disconnected' | 'connecting' | 'active' | 'settling' | 'settled' | 'error'

export interface SessionState {
  status: SessionStatus
  balance: string
  sessionId?: string
  channelId?: string
  depositTxHash?: string
  error?: string
  isDeposited: boolean
  chargeHistory: ChargeEntry[]
}

interface SessionContextValue {
  state: SessionState
  deposit: (amount?: bigint) => Promise<string | null>
  startSession: () => Promise<void>
  endSession: () => Promise<SettlementResult>
  chargeAction: (type: string, amount: string) => Promise<void>
  chargeAgentDeploy: () => Promise<TransferResult>
  executeTransfer: (destination: string, amount: bigint) => Promise<TransferResult>
  withdraw: (amount?: bigint) => Promise<WithdrawalResult>
  chargeHistory: ChargeEntry[]
  isLoading: boolean
}

const SessionContext = createContext<SessionContextValue | null>(null)

function mapChannelStatusToSession(channelStatus: ChannelStatus): SessionStatus {
  const mapping: Record<ChannelStatus, SessionStatus> = {
    disconnected: 'disconnected',
    approving: 'connecting',
    depositing: 'connecting',
    connecting: 'connecting',
    creating: 'connecting',
    active: 'active',
    closing: 'settling',
    settled: 'settled',
    error: 'error',
  }
  return mapping[channelStatus]
}

function createSessionState(channelState: ChannelState, actionBalance: bigint, chargeHistory: ChargeEntry[]): SessionState {
  return {
    status: mapChannelStatusToSession(channelState.status),
    balance: formatYtestUsd(actionBalance),
    sessionId: channelState.channelId ? `session-${channelState.channelId}` : undefined,
    channelId: channelState.channelId,
    depositTxHash: channelState.txHash,
    error: channelState.error,
    isDeposited: channelState.depositAmount > BigInt(0),
    chargeHistory,
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [manager, setManager] = useState<ChannelManager | null>(null)
  const [channelState, setChannelState] = useState<ChannelState>({
    status: 'disconnected',
    depositAmount: BigInt(0),
    balance: BigInt(0),
  })
  const [actionBalance, setActionBalance] = useState<bigint>(BigInt(0))
  const [chargeHistory, setChargeHistory] = useState<ChargeEntry[]>([])

  useEffect(() => {
    const mgr = createChannelManager(
      publicClient as Parameters<typeof createChannelManager>[0],
      walletClient as Parameters<typeof createChannelManager>[1]
    )
    setManager(mgr)
    setChannelState(mgr.state)
    setActionBalance(mgr.state.balance)
  }, [publicClient, walletClient])

  const state = createSessionState(channelState, actionBalance, chargeHistory)

  const isLoading = ['approving', 'depositing', 'connecting', 'creating', 'closing'].includes(channelState.status)

  const deposit = useCallback(async (amount: bigint = YELLOW_DEFAULTS.DEPOSIT_AMOUNT) => {
    if (!manager) return null
    
    try {
      const txHash = await manager.deposit(amount)
      setChannelState(manager.state)
      setActionBalance(manager.state.balance)
      return txHash
    } catch (err) {
      setChannelState(manager.state)
      throw err
    }
  }, [manager])

  const startSession = useCallback(async () => {
    if (!manager) return
    
    try {
      if (channelState.depositAmount === BigInt(0)) {
        await manager.deposit()
        setChannelState(manager.state)
        setActionBalance(manager.state.balance)
      }
      
      await manager.createChannel()
      setChannelState(manager.state)
      
      console.log('[Session] Started:', manager.state.channelId)
    } catch (err) {
      setChannelState(manager.state)
      throw err
    }
  }, [manager, channelState.depositAmount])

  const endSession = useCallback(async (): Promise<SettlementResult> => {
    if (!manager) {
      return { success: false, finalBalance: BigInt(0), error: 'No manager' }
    }
    
    try {
      const result = await manager.closeChannel()
      setChannelState(manager.state)
      
      console.log('[Session] Ended, settlement:', result)
      return result
    } catch (err) {
      setChannelState(manager.state)
      const errorMessage = err instanceof Error ? err.message : 'Settlement failed'
      return { success: false, finalBalance: actionBalance, error: errorMessage }
    }
  }, [manager, actionBalance])

  const chargeAction = useCallback(async (type: string, amount: string) => {
    if (!manager) {
      throw new Error('No manager')
    }

    if (channelState.status !== 'active') {
      throw new Error('Session not active')
    }

    const chargeAmount = BigInt(Math.floor(parseFloat(amount) * 1e6))
    
    if (chargeAmount > actionBalance) {
      throw new Error('Insufficient balance')
    }

    console.log(`[Session] Charging ${type}: ${amount} ytest.USD`)
    
    const result = await manager.executeOffChainTransfer(type, chargeAmount)
    
    if (!result.success) {
      throw new Error(result.error || 'Transfer failed')
    }

    setActionBalance(result.newBalance)
    setChannelState(manager.state)
    setChargeHistory(prev => [...prev, { type, amount, timestamp: Date.now() }])

    console.log(`[Session] ${type} charged: -${amount}, balance: ${formatYtestUsd(result.newBalance)}`)
  }, [manager, channelState.status, actionBalance])

  const chargeAgentDeploy = useCallback(async (): Promise<TransferResult> => {
    if (!manager) {
      return { success: false, newBalance: BigInt(0), error: 'No manager' }
    }

    if (channelState.status !== 'active') {
      return { success: false, newBalance: actionBalance, error: 'Session not active' }
    }

    const deployCost = YELLOW_DEFAULTS.AGENT_DEPLOY_COST
    
    if (deployCost > actionBalance) {
      return { success: false, newBalance: actionBalance, error: 'Insufficient balance for agent deploy' }
    }

    console.log(`[Session] Charging agent deploy: ${formatYtestUsd(deployCost)} ytest.USD`)
    
    const result = await manager.executeOffChainTransfer('agent-deploy', deployCost)
    
    if (result.success) {
      setActionBalance(result.newBalance)
      setChannelState(manager.state)
      setChargeHistory(prev => [...prev, { type: 'agent-deploy', amount: formatYtestUsd(deployCost), timestamp: Date.now() }])
    }
    
    return result
  }, [manager, channelState.status, actionBalance])

  const executeTransfer = useCallback(async (destination: string, amount: bigint): Promise<TransferResult> => {
    if (!manager) {
      return { success: false, newBalance: BigInt(0), error: 'No manager' }
    }

    const result = await manager.executeOffChainTransfer(destination, amount)
    
    if (result.success) {
      setActionBalance(result.newBalance)
      setChannelState(manager.state)
    }
    
    return result
  }, [manager])

  const withdraw = useCallback(async (amount?: bigint): Promise<WithdrawalResult> => {
    if (!manager) {
      return { success: false, amount: BigInt(0), error: 'No manager' }
    }

    const result = await manager.withdrawFromYellow(amount)
    setChannelState(manager.state)
    setActionBalance(manager.state.balance)
    
    return result
  }, [manager])

  return (
    <SessionContext.Provider value={{ 
      state, 
      deposit,
      startSession, 
      endSession, 
      chargeAction,
      chargeAgentDeploy,
      executeTransfer,
      withdraw,
      chargeHistory,
      isLoading,
    }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}

export function SessionStatus() {
  const { state, deposit, startSession, endSession, withdraw, isLoading } = useSession()
  
  const statusColors: Record<string, string> = {
    disconnected: 'bg-gray-500',
    connecting: 'bg-yellow-500 animate-pulse',
    active: 'bg-green-500',
    settling: 'bg-yellow-500 animate-pulse',
    settled: 'bg-blue-500',
    error: 'bg-red-500',
  }

  const handleStart = async () => {
    try {
      await startSession()
    } catch (err) {
      console.error('[Session] Start failed:', err)
    }
  }

  const handleDeposit = async () => {
    try {
      await deposit()
    } catch (err) {
      console.error('[Session] Deposit failed:', err)
    }
  }

  const handleEnd = async () => {
    try {
      const result = await endSession()
      console.log('[Session] Settlement result:', result)
    } catch (err) {
      console.error('[Session] End failed:', err)
    }
  }

  const handleWithdraw = async () => {
    try {
      const result = await withdraw()
      console.log('[Session] Withdrawal result:', result)
    } catch (err) {
      console.error('[Session] Withdraw failed:', err)
    }
  }
  
  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2">
      <div className={`w-3 h-3 rounded-full ${statusColors[state.status]}`} />
      <div className="text-sm">
        <div className="text-white font-medium capitalize">
          {state.status === 'connecting' ? 'Starting...' : 
           state.status === 'settling' ? 'Settling...' : state.status}
        </div>
        {(state.status === 'active' || state.status === 'settled') && (
          <div className="text-gray-400 text-xs">Balance: {state.balance} yUSD</div>
        )}
        {state.error && (
          <div className="text-red-400 text-xs">{state.error}</div>
        )}
      </div>
      
      {state.status === 'disconnected' && !state.isDeposited && (
        <button
          onClick={handleDeposit}
          disabled={isLoading}
          className="ml-2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-400 disabled:opacity-50"
        >
          Deposit
        </button>
      )}
      
      {state.status === 'disconnected' && state.isDeposited && (
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="ml-2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded hover:bg-yellow-400 disabled:opacity-50"
        >
          Start Session
        </button>
      )}
      
      {state.status === 'active' && (
        <button
          onClick={handleEnd}
          disabled={isLoading}
          className="ml-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
        >
          End Session
        </button>
      )}

      {state.status === 'settled' && parseFloat(state.balance) > 0 && (
        <button
          onClick={handleWithdraw}
          disabled={isLoading}
          className="ml-2 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-500 disabled:opacity-50"
        >
          Withdraw
        </button>
      )}
    </div>
  )
}
