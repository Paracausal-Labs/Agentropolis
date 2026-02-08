import { getAddress, isAddress } from 'viem'
import type { NextRequest } from 'next/server'

export function getClientIp(request: Pick<NextRequest, 'headers'>): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() || 'unknown'

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) return xRealIp.trim()

  // `NextRequest.ip` exists in some runtimes but isn't always typed.
  const maybeIp = (request as unknown as { ip?: string }).ip
  return maybeIp ?? 'unknown'
}

export function getValidatedUserAddress(headers: Headers): `0x${string}` | null {
  const raw = headers.get('x-user-address') ?? headers.get('X-User-Address')
  if (!raw) return null
  const value = raw.trim()
  if (!isAddress(value)) return null
  return getAddress(value)
}

export async function readJsonWithLimit<T>(
  request: Request,
  maxBytes: number
): Promise<{ ok: true; value: T } | { ok: false; status: number; error: string }> {
  const text = await request.text()

  if (text.length > maxBytes) {
    return { ok: false, status: 413, error: `Request body too large (max ${maxBytes} bytes)` }
  }

  try {
    return { ok: true, value: JSON.parse(text) as T }
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON body' }
  }
}
