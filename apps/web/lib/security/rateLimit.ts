export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

const store = new Map<string, { count: number; resetAt: number }>()

export function cleanupExpiredRateLimits(now = Date.now()) {
  for (const [key, entry] of store.entries()) {
    if (now >= entry.resetAt) store.delete(key)
  }
}

export function checkRateLimit(
  key: string,
  {
    windowMs,
    max,
  }: {
    windowMs: number
    max: number
  },
  now = Date.now()
): RateLimitResult {
  const entry = store.get(key)
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: Math.max(0, max - 1), resetAt: now + windowMs }
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: Math.max(0, max - entry.count), resetAt: entry.resetAt }
}

