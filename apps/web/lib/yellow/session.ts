export type SessionStatus = 'disconnected' | 'connecting' | 'active' | 'settling' | 'settled' | 'error'

export interface SessionState {
  status: SessionStatus
  balance: string
  sessionId?: string
  error?: string
}

export interface SessionManager {
  getState(): SessionState
  createSession(): Promise<void>
  executeOffChainAction(action: { type: string; amount: string }): Promise<void>
  settleSession(): Promise<void>
  subscribe(callback: (state: SessionState) => void): () => void
}

export function createSessionManager(): SessionManager {
  let state: SessionState = {
    status: 'disconnected',
    balance: '0.00',
  }
  
  const listeners = new Set<(state: SessionState) => void>()
  
  function setState(updates: Partial<SessionState>) {
    state = { ...state, ...updates }
    listeners.forEach(cb => cb(state))
  }
  
  return {
    getState() {
      return state
    },
    
    async createSession() {
      setState({ status: 'connecting' })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setState({
        status: 'active',
        balance: '100.00',
        sessionId: `session-${Date.now()}`,
      })
      
      console.log('[Yellow Session] Created:', state.sessionId)
    },
    
    async executeOffChainAction(action) {
      if (state.status !== 'active') {
        throw new Error('Session not active')
      }
      
      const currentBalance = parseFloat(state.balance)
      const amount = parseFloat(action.amount)
      
      if (amount > currentBalance) {
        throw new Error('Insufficient balance')
      }
      
      const newBalance = (currentBalance - amount).toFixed(2)
      setState({ balance: newBalance })
      
      console.log(`[Yellow Session] ${action.type}: -${action.amount}, balance: ${newBalance}`)
    },
    
    async settleSession() {
      if (state.status !== 'active') {
        throw new Error('No active session to settle')
      }
      
      setState({ status: 'settling' })
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log('[Yellow Session] Settled. Final balance:', state.balance)
      
      setState({ status: 'settled' })
    },
    
    subscribe(callback) {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
  }
}
