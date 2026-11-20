// The browser side of accounts: who is signed in on this device, and keeping their progress in step with the cloud.
//
//   - Sign-in is a username and password. The server keeps the session in an httpOnly cookie, so this file
//     never sees or stores a password or token.
//   - Local first: the games always read and write this device's storage, so nothing waits for the network.
//   - Every change is saved to the cloud a moment later. Progress from the cloud is merged in, never swapped in.
//   - If the network is down, nothing is lost; the next change (or coming back online) tries again.
import { getProgress, replaceProgress, subscribeProgress } from '../reading-quest/progress.ts'
import { getNL, replaceNL, subscribeNL } from '../number-land/progress.ts'
import { SAVE_KEY, loadSave, persistSave, type WeaponId } from '@/components/space/laser-blaster/types'
import { parseProfile } from './data.ts'
import { DEFAULT_AVATAR, mergeProfile, parsePrefs, type Prefs, type ProfileData } from './merge.ts'

export type Phase = 'checking' | 'gate' | 'in' | 'open'
export type SyncState = 'idle' | 'saving' | 'saved' | 'offline'

export interface Credit { quota: number; remaining: number }

export interface ProfileState {
  /** checking: asking the server. gate: sign-in needed. in: signed in. open: accounts are not set up, local only. */
  phase: Phase
  name: string | null
  displayName: string | null
  prefs: Prefs
  sync: SyncState
  /** AI credit for this account, in dollars. */
  credit: Credit | null
}

const LOCAL_KEY = 'aiden-account-v1'      // remembers the name and avatar, so the badge shows instantly
const OWNER_KEY = 'aiden-profile-owner'   // whose progress is on this device right now
const STAMP_KEY = 'aiden-profile-stamp'
const OLD_KEYS = ['aiden-profile-v1']     // the old invite-code sign-in, replaced by accounts
const SAVE_DELAY_MS = 2500
const CHECK_EVERY_MS = 120_000

const CHECKING: ProfileState = { phase: 'checking', name: null, displayName: null, prefs: { avatar: DEFAULT_AVATAR }, sync: 'idle', credit: null }
let state: ProfileState = CHECKING
const listeners = new Set<() => void>()

let started = false
let applying = false
let lastSynced = ''
let saveTimer: ReturnType<typeof setTimeout> | null = null
let checkTimer: ReturnType<typeof setInterval> | null = null
let unsubscribers: (() => void)[] = []
let teardown: (() => void) | null = null

export const getProfileState = (): ProfileState => state
export const getServerProfileState = (): ProfileState => CHECKING
export function subscribeProfile(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function setState(patch: Partial<ProfileState>) {
  state = { ...state, ...patch }
  listeners.forEach(fn => fn())
}

// ---------- this device's copy ----------

const read = (k: string): string | null => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch { /* private mode */ } }

function collectLocal(): ProfileData {
  return {
    quest: getProgress(),
    land: getNL(),
    blaster: loadSave(),
    prefs: state.prefs,
    updatedAt: Number(read(STAMP_KEY)) || 0,
  }
}

/** Put a profile on this device. `applying` stops this from looking like a change that needs saving. */
function applyLocal(d: ProfileData) {
  applying = true
  try {
    replaceProgress(d.quest)
    replaceNL(d.land)
    const weapons = d.blaster.unlocked.filter((w): w is WeaponId => ['blaster', 'spread', 'plasma', 'rainbow'].includes(w))
    persistSave({ ...d.blaster, unlocked: weapons.length ? weapons : ['blaster'] })
  } finally {
    applying = false
  }
  write(STAMP_KEY, String(d.updatedAt))
}

const fingerprint = (d: ProfileData): string => JSON.stringify([d.quest, d.land, d.blaster, d.prefs])

function remember(name: string, displayName: string, prefs: Prefs) {
  write(LOCAL_KEY, JSON.stringify({ name, displayName, avatar: prefs.avatar }))
}

// ---------- talking to the server ----------

type Reply =
  | { ok: true; name: string; data: ProfileData | null; credit: Credit | null }
  | { ok: false; reason: 'signedOut' | 'slow' | 'off' | 'unset' }

async function call(method: 'GET' | 'PUT', body?: ProfileData): Promise<Reply> {
  try {
    const res = await fetch('/api/profile', {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify({ data: body }) : undefined,
      keepalive: Boolean(body) && JSON.stringify(body).length < 60_000,
      cache: 'no-store',
    })
    if (res.status === 401) return { ok: false, reason: 'signedOut' }
    if (res.status === 429) return { ok: false, reason: 'slow' }
    if (res.status === 503) return { ok: false, reason: 'unset' }
    if (!res.ok) return { ok: false, reason: 'off' }
    const json = (await res.json()) as { name: string; data: unknown; quota?: number; remaining?: number }
    const credit = typeof json.remaining === 'number' && typeof json.quota === 'number' ? { quota: json.quota, remaining: json.remaining } : null
    return { ok: true, name: json.name, data: json.data ? parseProfile(json.data) : null, credit }
  } catch {
    return { ok: false, reason: 'off' }
  }
}

/** Merge the cloud's copy into this device, then save the combined result back. */
async function reconcile(name: string): Promise<Reply> {
  const reply = await call('GET')
  if (!reply.ok) return reply
  // Progress that belongs to a different account must never be mixed into this one.
  const foreign = read(OWNER_KEY) !== null && read(OWNER_KEY) !== name
  const local = foreign ? parseProfile(null) : collectLocal()
  const merged = reply.data ? mergeProfile(reply.data, local) : local
  applyLocal(merged)
  write(OWNER_KEY, name)
  setState({ prefs: merged.prefs, sync: 'saving', credit: reply.credit ?? state.credit })
  const saved = await call('PUT', merged)
  if (!saved.ok) return saved
  if (saved.data) applyLocal(saved.data)
  lastSynced = fingerprint(collectLocal())
  const prefs = saved.data?.prefs ?? merged.prefs
  setState({ sync: 'saved', prefs, credit: saved.credit ?? state.credit })
  remember(name, state.displayName ?? name, prefs)
  return saved
}

async function pushNow(): Promise<boolean> {
  if (state.phase !== 'in') return true
  const current = collectLocal()
  if (fingerprint(current) === lastSynced) { setState({ sync: 'saved' }); return true }
  setState({ sync: 'saving' })
  const reply = await call('PUT', { ...current, updatedAt: Number(read(STAMP_KEY)) || Date.now() })
  if (!reply.ok) {
    if (reply.reason === 'signedOut') dropSession()
    else setState({ sync: 'offline' })
    return false
  }
  if (reply.data) {
    applyLocal(reply.data)
    lastSynced = fingerprint(collectLocal())
    setState({ sync: 'saved', prefs: reply.data.prefs, credit: reply.credit ?? state.credit })
  }
  return true
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => { saveTimer = null; void pushNow() }, SAVE_DELAY_MS)
}

function noteChange() {
  if (applying || state.phase !== 'in') return
  write(STAMP_KEY, String(Date.now()))
  scheduleSave()
}

function startWatching() {
  stopWatching()
  unsubscribers = [subscribeProgress(noteChange), subscribeNL(noteChange)]
  const onHide = () => { if (document.visibilityState === 'hidden') void pushNow() }
  const onOnline = () => { void pushNow() }
  document.addEventListener('visibilitychange', onHide)
  window.addEventListener('pagehide', onOnline)
  window.addEventListener('online', onOnline)
  // The space game saves on its own, so look for its changes now and then.
  checkTimer = setInterval(() => { if (document.visibilityState === 'visible') void pushNow() }, CHECK_EVERY_MS)
  teardown = () => {
    document.removeEventListener('visibilitychange', onHide)
    window.removeEventListener('pagehide', onOnline)
    window.removeEventListener('online', onOnline)
  }
}

function stopWatching() {
  unsubscribers.forEach(u => u())
  unsubscribers = []
  teardown?.()
  teardown = null
  if (checkTimer) clearInterval(checkTimer)
  checkTimer = null
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = null
}

function dropSession() {
  stopWatching()
  write(LOCAL_KEY, null)
  setState({ phase: 'gate', name: null, displayName: null, sync: 'idle', credit: null })
}

/** Start syncing for a signed-in account. */
async function enter(name: string, displayName: string, credit: Credit | null) {
  const cached = (() => { try { return JSON.parse(read(LOCAL_KEY) ?? 'null') as { name?: string; avatar?: string } | null } catch { return null } })()
  const prefs = cached?.name === name ? parsePrefs({ avatar: cached.avatar }) : state.prefs
  setState({ phase: 'in', name, displayName, prefs, credit, sync: 'saving' })
  startWatching()
  const result = await reconcile(name)
  if (!result.ok) {
    if (result.reason === 'signedOut') dropSession()
    else setState({ sync: 'offline' })
  }
}

// ---------- public actions ----------

interface Me { username: string; displayName: string; quota: number; remaining: number }

/** Run once when the app opens. Returns a cleanup function. */
export function initProfile(): () => void {
  if (started) return () => {}
  started = true
  OLD_KEYS.forEach(k => write(k, null))
  void (async () => {
    try {
      const res = await fetch('/api/auth', { cache: 'no-store' })
      const json = res.ok ? ((await res.json()) as { enabled: boolean; user: Me | null }) : null
      if (!json) {
        // The server is unreachable. If this device was signed in before, keep playing offline.
        const cached = read(LOCAL_KEY)
        setState(cached ? { phase: 'in', sync: 'offline', name: JSON.parse(cached).name, displayName: JSON.parse(cached).displayName } : { phase: 'open' })
        return
      }
      if (!json.enabled) { setState({ phase: 'open' }); return }
      if (!json.user) { setState({ phase: 'gate' }); return }
      await enter(json.user.username, json.user.displayName, { quota: json.user.quota, remaining: json.user.remaining })
    } catch {
      setState({ phase: 'open' })   // never lock him out because the network is down
    }
  })()
  return () => { started = false; stopWatching() }
}

export type AuthResult = { ok: true } | { ok: false; message: string }

async function authCall(body: Record<string, string>): Promise<AuthResult> {
  try {
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' })
    const json = (await res.json().catch(() => ({}))) as { user?: Me; error?: string }
    if (!res.ok || !json.user) return { ok: false, message: json.error ?? 'Something went wrong. Try again.' }
    await enter(json.user.username, json.user.displayName, { quota: json.user.quota, remaining: json.user.remaining })
    return { ok: true }
  } catch {
    return { ok: false, message: 'Cannot reach the internet right now.' }
  }
}

export function signIn(username: string, password: string): Promise<AuthResult> {
  if (!username.trim() || !password) return Promise.resolve({ ok: false, message: 'Type your username and password.' })
  return authCall({ action: 'login', username, password })
}

export function signUp(username: string, password: string, invite: string): Promise<AuthResult> {
  if (!username.trim() || !password || !invite.trim()) return Promise.resolve({ ok: false, message: 'Fill in all three boxes.' })
  return authCall({ action: 'signup', username, password, invite })
}

/** Sign out of this device. Saves first, then clears this device so the next person starts clean. */
export async function signOut(): Promise<{ ok: boolean; message?: string }> {
  if (state.phase === 'in') {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
    const saved = await pushNow()
    if (!saved) return { ok: false, message: 'Cannot save the progress to the cloud right now, so it is not safe to sign out. Try again when the internet is back.' }
  }
  await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }).catch(() => {})
  stopWatching()
  applyLocal(parseProfile(null))
  write(OWNER_KEY, null)
  write(STAMP_KEY, null)
  write(SAVE_KEY, null)
  dropSession()
  return { ok: true }
}

export function setAvatar(avatar: string) {
  const prefs = parsePrefs({ avatar })
  setState({ prefs })
  if (state.name) remember(state.name, state.displayName ?? state.name, prefs)
  noteChange()
}

/** Refresh the AI credit shown in the profile badge. */
export async function refreshCredit(): Promise<void> {
  try {
    const res = await fetch('/api/auth', { cache: 'no-store' })
    const json = (await res.json()) as { user: Me | null }
    if (json.user) setState({ credit: { quota: json.user.quota, remaining: json.user.remaining } })
  } catch { /* keep the old figure */ }
}

export async function syncNow(): Promise<boolean> {
  return pushNow()
}
