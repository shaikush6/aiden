// The admin panel's calls to /api/admin.
import type { AdminAccount, AdminData } from './admin-types.ts'
import type { AppConfig } from './app-config.ts'
import { publicPart } from './app-config.ts'
import { applyAppConfig } from './app-config-client.ts'

export type Result<T> = { ok: true; value: T } | { ok: false; message: string }

async function call<T>(init?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch('/api/admin', { cache: 'no-store', ...init, headers: init?.body ? { 'Content-Type': 'application/json' } : undefined })
    const json = (await res.json().catch(() => ({}))) as T & { error?: string }
    if (!res.ok) return { ok: false, message: json.error ?? `Something went wrong (${res.status}).` }
    return { ok: true, value: json }
  } catch {
    return { ok: false, message: 'Cannot reach the server right now.' }
  }
}

const post = <T>(body: Record<string, unknown>) => call<T>({ method: 'POST', body: JSON.stringify(body) })

export const loadAdminData = () => call<AdminData>()

/** Save app-wide settings, and use them on this device straight away. */
export async function saveAppConfig(patch: Partial<AppConfig>): Promise<Result<AppConfig>> {
  const r = await post<{ config: AppConfig }>({ action: 'config', config: patch })
  if (!r.ok) return r
  applyAppConfig(publicPart(r.value.config))
  return { ok: true, value: r.value.config }
}

type AccountReply = Promise<Result<{ account: AdminAccount }>>
export const setQuota = (username: string, usd: number): AccountReply => post({ action: 'quota', username, usd })
export const resetSpent = (username: string): AccountReply => post({ action: 'resetSpent', username })
export const setPassword = (username: string, password: string): AccountReply => post({ action: 'password', username, password })
export const deleteAccount = (username: string) => post<{ ok: true }>({ action: 'delete', username })
