// Every paid AI request goes through here: it must come from a signed-in account that still has credit.
import type { NextRequest } from 'next/server'
import { authEnabled, sessionUser } from './auth.ts'
import { jsonError } from './api-guard.ts'
import { remainingUsd } from './quota.ts'
import { isAdmin } from './admin.ts'

export type Gate = { user: string | null } | { error: Response }

/** `minUsd`: how much credit must be left to start (a voice chat needs a little headroom). */
export async function aiGate(req: NextRequest, minUsd = 0): Promise<Gate> {
  if (!authEnabled()) return { user: null }
  const user = await sessionUser(req)
  if (!user) return { error: jsonError('Please sign in', 401) }
  // The admin tests freely: spending is still counted, but never blocks.
  if (!isAdmin(user) && (await remainingUsd(user)) <= minUsd) return { error: jsonError('AI credit used up', 402) }
  return { user }
}
