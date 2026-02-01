'use client'

import { useEffect, useState } from 'react'

interface Toast {
  id: string
  message: string
  type: 'error' | 'warning' | 'success'
}

let addToastFn: ((message: string, type: Toast['type']) => void) | null = null

export function showToast(message: string, type: Toast['type'] = 'error') {
  if (addToastFn) {
    addToastFn(message, type)
  }
}

export function ErrorToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = (message: string, type: Toast['type']) => {
      const id = `toast-${Date.now()}`
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 4000)
    }
    return () => { addToastFn = null }
  }, [])

  const colors = {
    error: 'bg-red-500/90 border-red-400',
    warning: 'bg-yellow-500/90 border-yellow-400 text-black',
    success: 'bg-green-500/90 border-green-400',
  }

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg border shadow-lg text-white animate-pulse ${colors[toast.type]}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </>
  )
}
