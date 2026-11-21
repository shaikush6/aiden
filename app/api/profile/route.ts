import { NextRequest, NextResponse } from 'next/server'
import { hasProgress, parseProfile } from '@/lib/profile/data'
import { mergeProfile } from '@/lib/profile/merge'
import { authEnabled, sessionUser } from '@/lib/server/auth'
import { kvGetJson, kvSet } from '@/lib/server/kv'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'
import { quotaUsd, remainingUsd } from '@/lib/server/quota'

const MAX_BODY = 200_000
const profileKey = (u: string) => `aiden:profile:${u}`
const noStore = { 'Cache-Control': 'no-store' }

async function whoAmI(req: NextRequest): Promise<string | Response> {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (!authEnabled()) return jsonError('Accounts are not set up', 503)
  const user = await sessionUser(req)
  return user ?? jsonError('Please sign in', 401)
}

/** The signed-in account's saved progress (and how much AI credit is left). */
export async function GET(req: NextRequest) {
  const user = await whoAmI(req)
  if (typeof user !== 'string') return user
  if (rateLimited(req, 'profile-get', 120, 60_000)) return jsonError('Too many requests', 429)
  try {
    const saved = await kvGetJson(profileKey(user))
    return NextResponse.json({ name: user, data: saved ? parseProfile(saved) : null, quota: await quotaUsd(user), remaining: await remainingUsd(user) }, { headers: noStore })
  } catch {
    return jsonError('Could not reach the profile store', 502)
  }
}

/** Save progress. It is merged with what is already saved, so two devices can never overwrite each other. */
export async function PUT(req: NextRequest) {
  const user = await whoAmI(req)
  if (typeof user !== 'string') return user
  if (rateLimited(req, 'profile-put', 120, 60_000)) return jsonError('Too many requests', 429)
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY) return jsonError('Too big', 413)

  let body: unknown
  try { body = await req.json() } catch { return jsonError('Bad request', 400) }
  try {
    const incoming = parseProfile((body as { data?: unknown } | null)?.data)
    const savedRaw = await kvGetJson(profileKey(user))
    const saved = savedRaw ? parseProfile(savedRaw) : null
    // An empty profile never replaces real progress.
    const merged = saved ? mergeProfile(saved, incoming) : incoming
    if (hasProgress(merged) || saved) await kvSet(profileKey(user), JSON.stringify(merged))
    return NextResponse.json({ name: user, data: merged, quota: await quotaUsd(user), remaining: await remainingUsd(user) }, { headers: noStore })
  } catch {
    return jsonError('Could not save', 502)
  }
}
