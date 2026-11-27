import { NextRequest, NextResponse } from 'next/server'
import { authEnabled, sessionUser } from '@/lib/server/auth'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'
import { MIMI_USD_PER_MINUTE, charge } from '@/lib/server/quota'

/**
 * Mimi talks to ElevenLabs straight from the browser, so the server cannot see how long she talks.
 * While a chat is open the browser sends one ping a minute, and each ping is charged here.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (!authEnabled()) return NextResponse.json({ remaining: null, stop: false })
  const user = await sessionUser(req)
  if (!user) return jsonError('Please sign in', 401)
  if (rateLimited(req, 'usage', 10, 60_000)) return jsonError('Too many requests', 429)

  try {
    const remaining = await charge(user, MIMI_USD_PER_MINUTE)
    return NextResponse.json({ remaining, stop: remaining <= 0 }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return jsonError('Could not save usage', 502)
  }
}
