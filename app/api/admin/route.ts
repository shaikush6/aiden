import { NextRequest, NextResponse } from 'next/server'
import { LEVELS } from '@/lib/reading-quest/catalog'
import { NUMBER_LEVELS } from '@/lib/number-land/curriculum'
import { parseProfile } from '@/lib/profile/data'
import { adminGate, isAdmin } from '@/lib/server/admin'
import { isSameOrigin, jsonError } from '@/lib/server/api-guard'
import { checkPassword, deleteAccount, getUser, listUsernames, normalizeUsername, setPassword } from '@/lib/server/auth'
import { getConfig, saveConfig } from '@/lib/server/app-config'
import { kvGetJson } from '@/lib/server/kv'
import type { AdminAccount } from '@/lib/admin-types'
import { forgetMoney, quotaUsd, resetSpent, setQuotaUsd, spentUsd } from '@/lib/server/quota'

const noStore = { 'Cache-Control': 'no-store' }

async function account(username: string): Promise<AdminAccount | null> {
  const [user, raw, spent, quota] = await Promise.all([getUser(username), kvGetJson(`aiden:profile:${username}`), spentUsd(username), quotaUsd(username)])
  if (!user) return null
  const p = parseProfile(raw)
  return {
    username,
    displayName: user.displayName,
    admin: isAdmin(username),
    createdAt: user.createdAt,
    lastSaved: raw ? p.updatedAt : 0,
    quest: { done: Object.keys(p.quest.levels).length, of: LEVELS.length },
    land: { done: Object.keys(p.land.levels).length, of: NUMBER_LEVELS.length },
    spent: Math.round(spent * 10000) / 10000,
    quota,
  }
}

/** Everything the admin panel shows: every account and the app-wide settings. */
export async function GET(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  const gate = await adminGate(req)
  if ('error' in gate) return gate.error
  try {
    const names = await listUsernames()
    const accounts = (await Promise.all(names.map(account))).filter((a): a is AdminAccount => a !== null)
    accounts.sort((a, b) => b.lastSaved - a.lastSaved)
    return NextResponse.json({ accounts, config: await getConfig(), me: gate.admin }, { headers: noStore })
  } catch {
    return jsonError('Could not reach the account store', 502)
  }
}

/**
 * { action: 'config', config } · { action: 'quota', username, usd } · { action: 'resetSpent', username }
 * { action: 'password', username, password } · { action: 'delete', username }
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  const gate = await adminGate(req)
  if ('error' in gate) return gate.error

  let body: Record<string, unknown>
  try { body = ((await req.json()) ?? {}) as Record<string, unknown> } catch { return jsonError('Bad request', 400) }
  const username = typeof body.username === 'string' ? normalizeUsername(body.username) : ''

  try {
    if (body.action === 'config') {
      return NextResponse.json({ config: await saveConfig({ ...(await getConfig()), ...(body.config as object) }) }, { headers: noStore })
    }
    if (!username || !(await getUser(username))) return jsonError('No such account', 404)

    switch (body.action) {
      case 'quota': {
        const usd = Number(body.usd)
        if (!Number.isFinite(usd) || usd < 0 || usd > 1000) return jsonError('Pick an amount from 0 to 1000 dollars', 400)
        await setQuotaUsd(username, usd)
        break
      }
      case 'resetSpent':
        await resetSpent(username)
        break
      case 'password': {
        const password = typeof body.password === 'string' ? body.password : ''
        const problem = checkPassword(password)
        if (problem) return jsonError(problem, 400)
        await setPassword(username, password)
        break
      }
      case 'delete':
        if (username === gate.admin) return jsonError('You cannot delete your own account from here', 400)
        await deleteAccount(username)
        await forgetMoney(username)
        return NextResponse.json({ ok: true }, { headers: noStore })
      default:
        return jsonError('Bad request', 400)
    }
    return NextResponse.json({ account: await account(username) }, { headers: noStore })
  } catch {
    return jsonError('Could not reach the account store', 502)
  }
}
