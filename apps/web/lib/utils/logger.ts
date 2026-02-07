const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Level-gated logger that suppresses debug/info output in production.
 * Warnings and errors are always emitted.
 */
export const logger = {
  /** Debug-level: only in development */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args)
    }
  },

  /** Info-level: only in development */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args)
    }
  },

  /** Warnings: always emitted */
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args)
  },

  /** Errors: always emitted */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args)
  },
}
