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
  endSession: () => Promise<SettlementResult>
  chargeAction: (type: string, amount: string) => Promise<void>
  chargeAgentDeploy: () => Promise<TransferResult>
  executeTransfer: (destination: string, amount: bigint) => Promise<TransferResult>
  withdraw: (amount?: bigint) => Promise<WithdrawalResult>
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
    disconnected: 'bg-gray-600',
    connecting: 'bg-[#FCEE0A] animate-pulse',
    active: 'bg-[#00FF88]',
    settling: 'bg-[#FCEE0A] animate-pulse',
    settled: 'bg-[#00F0FF]',
    error: 'bg-[#FF3366]',
  }

  const statusText: Record<string, string> = {
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    active: 'Active',
    settling: 'Settling...',
    settled: 'Settled',
    error: 'Error',
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
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${statusColors[state.status]}`} />
      <span className="text-xs text-gray-400 uppercase tracking-wider">
        {statusText[state.status]}
      </span>

      {(state.status === 'active' || state.status === 'settled') && (
        <span className="text-xs text-[#00FF88] font-mono">{state.balance}</span>
      )}

      {state.status === 'disconnected' && !state.isDeposited && (
        <button
          onClick={handleDeposit}
          disabled={isLoading}
          className="px-2 py-1 bg-[#FCEE0A] text-black text-[10px] font-bold uppercase tracking-wider hover:bg-[#FF00FF] hover:text-white transition-all disabled:opacity-50"
        >
          Deposit
        </button>
      )}

      {state.status === 'disconnected' && state.isDeposited && (
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="px-2 py-1 bg-[#FCEE0A] text-black text-[10px] font-bold uppercase tracking-wider hover:bg-[#FF00FF] hover:text-white transition-all disabled:opacity-50"
        >
          Start
        </button>
      )}

      {state.status === 'active' && (
        <button
          onClick={handleEnd}
          disabled={isLoading}
          className="px-2 py-1 bg-gray-700 text-gray-300 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-600 transition-all disabled:opacity-50"
        >
          End
        </button>
      )}

      {state.status === 'settled' && parseFloat(state.balance) > 0 && (
        <button
          onClick={handleWithdraw}
          disabled={isLoading}
          className="px-2 py-1 bg-[#00FF88] text-black text-[10px] font-bold uppercase tracking-wider hover:bg-[#00F0FF] transition-all disabled:opacity-50"
        >
          Withdraw
        </button>
      )}
    </div>
  )
}
