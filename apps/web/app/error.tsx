'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full border border-red-500/40 bg-red-950/20 p-6">
        <h1 className="text-xl font-black tracking-widest uppercase text-red-200">System Fault</h1>
        <p className="mt-3 text-sm text-red-100/90">
          Something crashed while rendering this page.
        </p>
        <pre className="mt-4 text-xs overflow-auto bg-black/40 p-3 border border-red-500/20">
          {String(error?.message || 'Unknown error')}
        </pre>
        <div className="mt-5 flex gap-3">
          <button
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-red-300/40 hover:bg-red-500/10"
            onClick={() => reset()}
          >
            Retry
          </button>
          <button
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-white/20 hover:bg-white/5"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  )
}

