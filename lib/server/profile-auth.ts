// The gate. Only people holding an invite code can use cloud profiles. The invite list lives in the
// PROFILE_CODES environment variable (set in Vercel), never in the code: "aiden:K7M29QXPW4TH,maya:..."
import { createHash, timingSafeEqual } from 'node:crypto'

export interface Invite { name: string; code: string }

/** Codes are typed by hand, so ignore case, spaces and dashes. */
export const normalizeCode = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

export function invites(env: string | undefined = process.env.PROFILE_CODES): Invite[] {
  return (env ?? '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .flatMap(entry => {
      const [name, code] = entry.split(':').map(x => x.trim())
      const clean = (name ?? '').toLowerCase()
      if (!/^[a-z0-9_-]{1,24}$/.test(clean) || !code || normalizeCode(code).length < 10) return []
      return [{ name: clean, code: normalizeCode(code) }]
    })
}

const digest = (s: string): Buffer => createHash('sha256').update(s).digest()

/** The invite that matches this code, found without leaking how much of the code was right. */
export function findInvite(code: string | null | undefined, list: Invite[] = invites()): Invite | null {
  if (!code) return null
  const given = digest(normalizeCode(code))
  let found: Invite | null = null
  for (const invite of list) {
    if (timingSafeEqual(given, digest(invite.code))) found = invite
  }
  return found
}
