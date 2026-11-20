import { NextRequest, NextResponse } from 'next/server'
import { authEnabled, sessionUser } from '@/lib/server/auth'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'
import { charge, realtimeCost, type RealtimeUsage } from '@/lib/server/quota'

/**
 * Mimi talks to OpenAI straight from the browser, so the server cannot see her usage directly.
 * The browser forwards the token totals OpenAI sends after each reply, and they are charged here.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (!authEnabled()) return NextResponse.json({ remaining: null, stop: false })
  const user = await sessionUser(req)
  if (!user) return jsonError('Please sign in', 401)
  if (rateLimited(req, 'usage', 120, 60_000)) return jsonError('Too many requests', 429)

  let body: { usage?: RealtimeUsage } | null
  try { body = (await req.json()) as { usage?: RealtimeUsage } } catch { return jsonError('Bad request', 400) }
  try {
    const remaining = await charge(user, realtimeCost(body?.usage ?? {}))
    return NextResponse.json({ remaining, stop: remaining <= 0 }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return jsonError('Could not save usage', 502)
  }
}
