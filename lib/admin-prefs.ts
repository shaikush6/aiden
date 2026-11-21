// The admin's own testing switches on this device (not synced, not seen by anyone else).
const KEY = 'aiden-admin-prefs'

export interface AdminPrefs {
  /** Show a "skip" button on every question inside a level. */
  skip: boolean
}

const DEFAULTS: AdminPrefs = { skip: true }
let prefs: AdminPrefs | null = null
const listeners = new Set<() => void>()

export function getAdminPrefs(): AdminPrefs {
  if (prefs) return prefs
  try { prefs = { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<AdminPrefs>) } } catch { prefs = DEFAULTS }
  return prefs
}
export const getServerAdminPrefs = (): AdminPrefs => DEFAULTS
export function subscribeAdminPrefs(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setAdminPrefs(patch: Partial<AdminPrefs>) {
  prefs = { ...getAdminPrefs(), ...patch }
  try { localStorage.setItem(KEY, JSON.stringify(prefs)) } catch { /* private mode */ }
  listeners.forEach(fn => fn())
}
