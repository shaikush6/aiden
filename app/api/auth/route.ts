import { NextRequest, NextResponse } from 'next/server'
import {
  SESSION_COOKIE, authEnabled, checkPassword, checkUsername, createSession, createUser, endSession, getUser, inviteOk,
  sessionCookie, sessionUser, verifyUser,
} from '@/lib/server/auth'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'
import { quotaUsd, remainingUsd } from '@/lib/server/quota'
import { isAdmin } from '@/lib/server/admin'
import { getConfig } from '@/lib/server/app-config'

const noStore = { 'Cache-Control': 'no-store' }

async function me(username: string) {
  const user = await getUser(username)
  const [quota, remaining] = await Promise.all([quotaUsd(username), remainingUsd(username)])
  return { username, displayName: user?.displayName ?? username, quota, remaining, admin: isAdmin(username) }
}

/** Who is signed in on this device (and how much AI credit they have left). */
export async function GET(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (!authEnabled()) return NextResponse.json({ enabled: false, user: null }, { headers: noStore })
  try {
    const username = await sessionUser(req)
    return NextResponse.json({ enabled: true, user: username ? await me(username) : null }, { headers: noStore })
  } catch {
    return jsonError('Could not reach the account store', 502)
  }
}

/** { action: 'login' | 'signup' | 'logout', username, password, invite } */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (!authEnabled()) return jsonError('Accounts are not set up', 503)

  let body: Record<string, unknown>
  try { body = ((await req.json()) ?? {}) as Record<string, unknown> } catch { return jsonError('Bad request', 400) }
  const action = body.action
  const username = typeof body.username === 'string' ? body.username : ''
  const password = typeof body.password === 'string' ? body.password : ''

  try {
    if (action === 'logout') {
      await endSession(req.cookies.get(SESSION_COOKIE)?.value)
      const res = NextResponse.json({ ok: true }, { headers: noStore })
      res.cookies.set({ ...sessionCookie('', 0) })
      return res
    }

    // Guessing passwords or invite codes gets slow quickly.
    if (rateLimited(req, 'auth', 10, 10 * 60_000)) return jsonError('Too many tries. Wait a few minutes, then try again.', 429)

    let signedIn: string | null = null
    if (action === 'signup') {
      if (!(await getConfig()).signupsOpen) return jsonError('New accounts are closed right now. Ask the grown-up who runs the app.', 403)
      if (!(await inviteOk(typeof body.invite === 'string' ? body.invite : ''))) return jsonError('That invite code is not right.', 403)
      const problem = checkUsername(username) ?? checkPassword(password)
      if (problem) return jsonError(problem, 400)
      const user = await createUser(username, password)
      if (user === 'taken') return jsonError('That username is taken. Try another one.', 409)
      signedIn = user.username
    } else if (action === 'login') {
      const user = await verifyUser(username, password)
      if (!user) return jsonError('That username and password do not match.', 401)
      signedIn = user.username
    } else {
      return jsonError('Bad request', 400)
    }

    const { token, maxAge } = await createSession(signedIn)
    const res = NextResponse.json({ user: await me(signedIn) }, { headers: noStore })
    res.cookies.set(sessionCookie(token, maxAge))
    return res
  } catch {
    return jsonError('Could not reach the account store', 502)
  }
}
