'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { createSessionManager, SessionState, SessionManager } from '@/lib/yellow/session'

interface SessionContextValue {
  state: SessionState
  startSession: () => Promise<void>
  endSession: () => Promise<void>
  chargeAction: (type: string, amount: string) => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

let globalManager: SessionManager | null = null

function getManager(): SessionManager {
  if (!globalManager) {
    globalManager = createSessionManager()
  }
  return globalManager
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(() => getManager().getState())
  
  useEffect(() => {
    const manager = getManager()
    return manager.subscribe(setState)
  }, [])
  
  const startSession = useCallback(async () => {
    await getManager().createSession()
  }, [])
  
  const endSession = useCallback(async () => {
    await getManager().settleSession()
  }, [])
  
  const chargeAction = useCallback(async (type: string, amount: string) => {
    await getManager().executeOffChainAction({ type, amount })
  }, [])
  
  return (
    <SessionContext.Provider value={{ state, startSession, endSession, chargeAction }}>
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
  const { state, startSession, endSession } = useSession()
  
  const statusColors: Record<string, string> = {
    disconnected: 'bg-gray-500',
    connecting: 'bg-yellow-500',
    active: 'bg-green-500',
    settling: 'bg-yellow-500',
    settled: 'bg-blue-500',
    error: 'bg-red-500',
  }
  
  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2">
      <div className={`w-3 h-3 rounded-full ${statusColors[state.status]}`} />
      <div className="text-sm">
        <div className="text-white font-medium capitalize">{state.status}</div>
        {state.status === 'active' && (
          <div className="text-gray-400 text-xs">Balance: {state.balance}</div>
        )}
      </div>
      {state.status === 'disconnected' && (
        <button
          onClick={startSession}
          className="ml-2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded hover:bg-yellow-400"
        >
          Start Session
        </button>
      )}
      {state.status === 'active' && (
        <button
          onClick={endSession}
          className="ml-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500"
        >
          End Session
        </button>
      )}
    </div>
  )
}
