// The admin: accounts named in ADMIN_USERS (a comma-separated list, set in Vercel) get the admin panel.
// While developing locally without that setting, every account is an admin so the panel can be tried.
import type { NextRequest } from 'next/server'
import { authEnabled, normalizeUsername, sessionUser } from './auth.ts'
import { jsonError } from './api-guard.ts'

export function isAdmin(username: string | null | undefined): boolean {
  if (!username) return false
  const list = process.env.ADMIN_USERS
  if (!list) return process.env.NODE_ENV !== 'production'
  return list.split(',').map(normalizeUsername).filter(Boolean).includes(normalizeUsername(username))
}

/** Only the admin gets past this. Returns the admin's username, or the response to send instead. */
export async function adminGate(req: NextRequest): Promise<{ admin: string } | { error: Response }> {
  if (!authEnabled()) return { error: jsonError('Accounts are not set up', 503) }
  const user = await sessionUser(req)
  if (!user) return { error: jsonError('Please sign in', 401) }
  if (!isAdmin(user)) return { error: jsonError('Admins only', 403) }
  return { admin: user }
}
