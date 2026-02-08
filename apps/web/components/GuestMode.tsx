'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'

const GUEST_SESSION_KEY = 'agentropolis_guest_session'
const GUEST_SESSION_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds
const WARNING_THRESHOLD = 2 * 60 * 1000 // 2 minutes in milliseconds

interface GuestSession {
  startTime: number
  expiresAt: number
}

export function GuestMode() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [showExpiredModal, setShowExpiredModal] = useState(false)

  useEffect(() => {
    if (isConnected) {
      localStorage.removeItem(GUEST_SESSION_KEY)
      setTimeRemaining(null)
      setShowExpiredModal(false)
      return
    }

    const storedSession = localStorage.getItem(GUEST_SESSION_KEY)
    let session: GuestSession

    if (storedSession) {
      session = JSON.parse(storedSession)
      const now = Date.now()

      if (now >= session.expiresAt) {
        localStorage.removeItem(GUEST_SESSION_KEY)
        setShowExpiredModal(true)
        return
      }
    } else {
      const now = Date.now()
      session = {
        startTime: now,
        expiresAt: now + GUEST_SESSION_DURATION,
      }
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(session))
    }

    const remaining = session.expiresAt - Date.now()
    setTimeRemaining(Math.max(0, remaining))
  }, [isConnected])

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

  const handleConnectWallet = () => {
    localStorage.removeItem(GUEST_SESSION_KEY)
    router.push('/')
  }

  if (timeRemaining === null) {
    return null
  }

  return (
    <>
      {/* Expiry Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="cyber-panel bg-[#0a0a1a] border border-[#FCEE0A]/50 p-8 max-w-md">
            <h2 className="text-2xl font-black text-[#FCEE0A] uppercase tracking-widest mb-4">Session Expired</h2>
            <p className="text-gray-400 mb-6">
              Your 10-minute guest session has ended. Connect your wallet to continue exploring Agentropolis.
            </p>
            <button
              onClick={handleConnectWallet}
              className="w-full px-6 py-3 bg-[#FCEE0A] text-black font-bold uppercase tracking-wider hover:bg-[#FF00FF] hover:text-white transition-all"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export function GuestModeTimer() {
  const { isConnected } = useAccount()
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (isConnected) {
      setTimeRemaining(null)
      return
    }
    const storedSession = localStorage.getItem(GUEST_SESSION_KEY)
    if (storedSession) {
      const session = JSON.parse(storedSession)
      const remaining = session.expiresAt - Date.now()
      setTimeRemaining(Math.max(0, remaining))
    }
  }, [isConnected])

  useEffect(() => {
    if (timeRemaining === null) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval)
          return 0
        }
        const newTime = prev - 1000
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

  if (timeRemaining === null) {
    return null
  }

  return (
    <span className={`font-mono text-xs ${showWarning ? 'text-[#FF3366] animate-pulse' : 'text-[#00F0FF]'}`}>
      GUEST {formatTime(timeRemaining)}
    </span>
  )
}

export function useGuestMode() {
  const { isConnected } = useAccount()
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    if (isConnected) {
      setIsGuest(false)
      return
    }
    const session = localStorage.getItem(GUEST_SESSION_KEY)
    if (session) {
      const parsed = JSON.parse(session)
      setIsGuest(Date.now() < parsed.expiresAt)
    }
  }, [isConnected])

  return isGuest
}
