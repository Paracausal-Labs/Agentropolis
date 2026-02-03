'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { usePublicClient, useWalletClient } from 'wagmi'
import { 
  createChannelManager, 
  ChannelManager, 
  ChannelState, 
  ChannelStatus,
} from '@/lib/yellow/channel'
import { YELLOW_DEFAULTS, formatYtestUsd } from '@/lib/yellow/constants'

export type SessionStatus = 'disconnected' | 'connecting' | 'active' | 'settling' | 'settled' | 'error'

export interface SessionState {
  status: SessionStatus
  balance: string
  sessionId?: string
  channelId?: string
  depositTxHash?: string
  error?: string
  isDeposited: boolean
}

interface SessionContextValue {
  state: SessionState
  deposit: (amount?: bigint) => Promise<string | null>
  startSession: () => Promise<void>
  endSession: () => Promise<void>
  chargeAction: (type: string, amount: string) => Promise<void>
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

function createSessionState(channelState: ChannelState, actionBalance: bigint): SessionState {
  return {
    status: mapChannelStatusToSession(channelState.status),
    balance: formatYtestUsd(actionBalance),
    sessionId: channelState.channelId ? `session-${channelState.channelId}` : undefined,
    channelId: channelState.channelId,
    depositTxHash: channelState.txHash,
    error: channelState.error,
    isDeposited: channelState.depositAmount > BigInt(0),
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

  useEffect(() => {
    const mgr = createChannelManager(
      publicClient as Parameters<typeof createChannelManager>[0],
      walletClient as Parameters<typeof createChannelManager>[1]
    )
    setManager(mgr)
    setChannelState(mgr.state)
    setActionBalance(mgr.state.balance)
  }, [publicClient, walletClient])

  const state = createSessionState(channelState, actionBalance)

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

  const endSession = useCallback(async () => {
    if (!manager) return
    
    try {
      await manager.closeChannel()
      setChannelState(manager.state)
      
      console.log('[Session] Ended')
    } catch (err) {
      setChannelState(manager.state)
      throw err
    }
  }, [manager])

  const chargeAction = useCallback(async (type: string, amount: string) => {
    if (channelState.status !== 'active') {
      throw new Error('Session not active')
    }

    const chargeAmount = BigInt(Math.floor(parseFloat(amount) * 1e6))
    
    if (chargeAmount > actionBalance) {
      throw new Error('Insufficient balance')
    }

    const newBalance = actionBalance - chargeAmount
    setActionBalance(newBalance)

    console.log(`[Session] ${type}: -${amount}, balance: ${formatYtestUsd(newBalance)}`)
  }, [channelState.status, actionBalance])

  return (
    <SessionContext.Provider value={{ 
      state, 
      deposit,
      startSession, 
      endSession, 
      chargeAction,
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
  const { state, deposit, startSession, endSession, isLoading } = useSession()
  
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
  
  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2">
      <div className={`w-3 h-3 rounded-full ${statusColors[state.status]}`} />
      <div className="text-sm">
        <div className="text-white font-medium capitalize">
          {state.status === 'connecting' ? 'Starting...' : state.status}
        </div>
        {state.status === 'active' && (
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
          onClick={endSession}
          disabled={isLoading}
          className="ml-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500 disabled:opacity-50"
        >
          End Session
        </button>
      )}
    </div>
  )
}
