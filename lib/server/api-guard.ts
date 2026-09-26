// Basic protection for the routes that spend OpenAI credits.
// The app has no login, so this cannot stop a determined attacker, but it blocks
// other websites from using these endpoints and slows down scripted abuse.
import type { NextRequest } from 'next/server'

/** True when the request comes from this site's own pages. */
export function isSameOrigin(req: NextRequest): boolean {
  const site = req.headers.get('sec-fetch-site')
  if (site) return site === 'same-origin'
  // Older browsers (e.g. iPads before iOS 16.4) do not send Sec-Fetch-Site: fall back to Origin, then Referer.
  const host = req.headers.get('host')
  const source = req.headers.get('origin') ?? req.headers.get('referer')
  if (!source || !host) return false
  try {
    return new URL(source).host === host
  } catch {
    return false
  }
}

function clientIp(req: NextRequest): string {
  return req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

interface Bucket { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000

/**
 * Fixed-window rate limit, per route and IP. Memory is bounded: expired buckets are
 * pruned whenever the map grows large. It is per server instance, so treat it as a speed bump.
 */
export function rateLimited(req: NextRequest, route: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
    if (buckets.size > MAX_BUCKETS) buckets.clear()
  }
  const key = `${route}:${clientIp(req)}`
  const b = buckets.get(key)
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  b.count++
  return b.count > limit
}

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status })
}
