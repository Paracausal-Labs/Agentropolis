'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const GUEST_SESSION_KEY = 'agentropolis_guest_session'
const GUEST_SESSION_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds
const WARNING_THRESHOLD = 2 * 60 * 1000 // 2 minutes in milliseconds

interface GuestSession {
  startTime: number
  expiresAt: number
}

export function GuestMode() {
  const router = useRouter()
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [showExpiredModal, setShowExpiredModal] = useState(false)

  // Initialize guest session
  useEffect(() => {
    const storedSession = localStorage.getItem(GUEST_SESSION_KEY)
    let session: GuestSession

    if (storedSession) {
      session = JSON.parse(storedSession)
      const now = Date.now()
      
      // Check if session has expired
      if (now >= session.expiresAt) {
        localStorage.removeItem(GUEST_SESSION_KEY)
        setShowExpiredModal(true)
        return
      }
    } else {
      // Create new guest session
      const now = Date.now()
      session = {
        startTime: now,
        expiresAt: now + GUEST_SESSION_DURATION,
      }
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session))
    }

    // Set initial time remaining
    const remaining = session.expiresAt - Date.now()
    setTimeRemaining(Math.max(0, remaining))
  }, [])

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval)
          localStorage.removeItem(GUEST_SESSION_KEY)
          setShowExpiredModal(true)
          return 0
        }

        const newTime = prev - 1000
        
        // Show warning at 2 minutes
        if (newTime <= WARNING_THRESHOLD && !showWarning) {
          setShowWarning(true)
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, showWarning])

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleConnectWallet = () => {
    localStorage.removeItem(GUEST_SESSION_KEY)
    router.push('/')
  }

  if (timeRemaining === null) {
    return null
  }

  return (
    <>
      {/* Timer Display */}
      <div className={`fixed top-4 right-4 z-40 px-4 py-2 rounded-lg font-mono text-sm font-bold transition-colors ${
        showWarning 
          ? 'bg-red-500/90 text-white animate-pulse' 
          : 'bg-blue-600/90 text-white'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider">Guest Mode</span>
          <span className="text-lg">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      {/* Warning Toast at 2 minutes */}
      {showWarning && (
        <div className="fixed bottom-4 left-4 z-40 bg-yellow-500 text-black px-6 py-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-bottom">
          <div className="font-bold mb-1">Session Expiring Soon</div>
          <div className="text-sm">
            Your guest session will expire in {formatTime(timeRemaining)}. Connect your wallet to continue.
          </div>
        </div>
      )}

      {/* Expiry Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Session Expired</h2>
            <p className="text-gray-300 mb-6">
              Your 10-minute guest session has ended. Connect your wallet to continue exploring Agentropolis and execute real trades.
            </p>
            <button
              onClick={handleConnectWallet}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
            >
              Connect Wallet for Full Access
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export function useGuestMode() {
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem(GUEST_SESSION_KEY)
    if (session) {
      const parsed = JSON.parse(session)
      setIsGuest(Date.now() < parsed.expiresAt)
    }
  }, [])

  return isGuest
}
