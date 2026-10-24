import { NextRequest, NextResponse } from 'next/server'
import { hasProgress, parseProfile } from '@/lib/profile/data'
import { mergeProfile } from '@/lib/profile/merge'
import { findInvite, invites } from '@/lib/server/profile-auth'
import { readProfile, storeAvailable, writeProfile } from '@/lib/server/profile-store'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'

const MAX_BODY = 200_000
const CODE_HEADER = 'x-profile-code'

/** Is the gate on? Only when there is an invite list AND somewhere to keep profiles. */
function gateOn(): boolean {
  return invites().length > 0 && storeAvailable()
}

/**
 * No code: just says whether sign-in is needed. With a code: checks it and returns that profile's saved progress.
 * A wrong code gets a plain 401, and too many wrong codes in a minute get slowed down.
 */
export async function GET(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  const code = req.headers.get(CODE_HEADER)
  if (!code) return NextResponse.json({ gate: gateOn() })
  if (!gateOn()) return jsonError('Profiles are not set up', 503)

  const invite = findInvite(code)
  if (!invite) return rateLimited(req, 'profile-fail', 8, 60_000) ? jsonError('Too many tries', 429) : jsonError('That code is not right', 401)
  if (rateLimited(req, 'profile-get', 120, 60_000)) return jsonError('Too many requests', 429)

  try {
    const saved = await readProfile(invite.name)
    return NextResponse.json({ name: invite.name, data: saved ? parseProfile(saved) : null })
  } catch {
    return jsonError('Could not reach the profile store', 502)
  }
}

/** Save progress. It is merged with what is already saved, so two devices can never overwrite each other. */
export async function PUT(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (!gateOn()) return jsonError('Profiles are not set up', 503)
  const invite = findInvite(req.headers.get(CODE_HEADER))
  if (!invite) return rateLimited(req, 'profile-fail', 8, 60_000) ? jsonError('Too many tries', 429) : jsonError('That code is not right', 401)
  if (rateLimited(req, 'profile-put', 120, 60_000)) return jsonError('Too many requests', 429)

  const length = Number(req.headers.get('content-length') ?? 0)
  if (length > MAX_BODY) return jsonError('Too big', 413)
  let body: unknown
  try { body = await req.json() } catch { return jsonError('Bad request', 400) }

  try {
    const incoming = parseProfile((body as { data?: unknown } | null)?.data)
    const savedRaw = await readProfile(invite.name)
    const saved = savedRaw ? parseProfile(savedRaw) : null
    // An empty profile never replaces real progress.
    const merged = saved ? mergeProfile(saved, incoming) : incoming
    if (hasProgress(merged) || saved) await writeProfile(invite.name, merged)
    return NextResponse.json({ name: invite.name, data: merged })
  } catch {
    return jsonError('Could not save', 502)
  }
}
