import { keccak256, toUtf8Bytes, getBytes, Wallet } from 'ethers'

export const YELLOW_SANDBOX_URL = 'wss://clearnet-sandbox.yellow.com/ws'

export interface YellowConfig {
  mockMode?: boolean
  endpoint?: string
}

export async function signYellowPayload(payload: object, wallet: Wallet): Promise<string> {
  const jsonStr = JSON.stringify(payload)
  const hash = keccak256(toUtf8Bytes(jsonStr))
  return wallet.signMessage(getBytes(hash))
}

export function createYellowClient(config: YellowConfig = {}) {
  const { mockMode = false, endpoint = YELLOW_SANDBOX_URL } = config

  return {
    mockMode,
    endpoint,
    
    connect(): Promise<WebSocket | null> {
      if (mockMode) {
        console.log('[Yellow] Running in mock mode')
        return Promise.resolve(null)
      }
      
      return new Promise((resolve, reject) => {
        const ws = new WebSocket(endpoint)
        
        ws.onopen = () => {
          console.log('[Yellow] Connected to', endpoint)
          resolve(ws)
        }
        
        ws.onerror = (err) => {
          console.error('[Yellow] Connection error')
          reject(err)
        }
      })
    },
  }
}
