// The browser side of profiles: who is signed in on this device, and keeping his progress in step with the cloud.
//
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

export interface ProfileState {
  /** checking: asking the server. gate: sign-in needed. in: signed in. open: no sign-in is set up, local only. */
  phase: Phase
  name: string | null
  prefs: Prefs
  sync: SyncState
}

const SESSION_KEY = 'aiden-profile-v1'
const OWNER_KEY = 'aiden-profile-owner'
const STAMP_KEY = 'aiden-profile-stamp'
const SAVE_DELAY_MS = 2500
const CHECK_EVERY_MS = 120_000

const CHECKING: ProfileState = { phase: 'checking', name: null, prefs: { avatar: DEFAULT_AVATAR }, sync: 'idle' }
let state: ProfileState = CHECKING
const listeners = new Set<() => void>()

let code: string | null = null
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

// ---------- talking to the server ----------

type Reply = { ok: true; name: string; data: ProfileData | null } | { ok: false; reason: 'wrong' | 'slow' | 'off' | 'unset' }

async function call(method: 'GET' | 'PUT', withCode: string, body?: ProfileData): Promise<Reply> {
  try {
    const res = await fetch('/api/profile', {
      method,
      headers: { 'x-profile-code': withCode, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify({ data: body }) : undefined,
      keepalive: Boolean(body) && JSON.stringify(body).length < 60_000,
      cache: 'no-store',
    })
    if (res.status === 401) return { ok: false, reason: 'wrong' }
    if (res.status === 429) return { ok: false, reason: 'slow' }
    if (res.status === 503) return { ok: false, reason: 'unset' }
    if (!res.ok) return { ok: false, reason: 'off' }
    const json = (await res.json()) as { name: string; data: unknown }
    return { ok: true, name: json.name, data: json.data ? parseProfile(json.data) : null }
  } catch {
    return { ok: false, reason: 'off' }
  }
}

/** Merge the cloud's copy into this device, then save the combined result back. */
async function reconcile(withCode: string, name: string, first: ProfileData | null): Promise<Reply> {
  const reply = first ? ({ ok: true, name, data: first } as Reply) : await call('GET', withCode)
  if (!reply.ok) return reply
  // Progress that belongs to a different profile must never be mixed into this one.
  const foreign = read(OWNER_KEY) !== null && read(OWNER_KEY) !== reply.name
  const local = foreign ? parseProfile(null) : collectLocal()
  const merged = reply.data ? mergeProfile(reply.data, local) : local
  applyLocal(merged)
  write(OWNER_KEY, reply.name)
  setState({ prefs: merged.prefs, sync: 'saving' })
  const saved = await call('PUT', withCode, merged)
  if (!saved.ok) return saved
  if (saved.data) applyLocal(saved.data)
  lastSynced = fingerprint(collectLocal())
  setState({ sync: 'saved', prefs: saved.data?.prefs ?? merged.prefs })
  return saved
}

async function pushNow(): Promise<boolean> {
  if (!code || state.phase !== 'in') return true
  const current = collectLocal()
  if (fingerprint(current) === lastSynced) { setState({ sync: 'saved' }); return true }
  setState({ sync: 'saving' })
  const reply = await call('PUT', code, { ...current, updatedAt: Number(read(STAMP_KEY)) || Date.now() })
  if (!reply.ok) {
    if (reply.reason === 'wrong') await dropSession()
    else setState({ sync: 'offline' })
    return false
  }
  if (reply.data) {
    applyLocal(reply.data)
    lastSynced = fingerprint(collectLocal())
    setState({ sync: 'saved', prefs: reply.data.prefs })
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

// ---------- public actions ----------

async function dropSession() {
  stopWatching()
  code = null
  write(SESSION_KEY, null)
  setState({ phase: 'gate', name: null, sync: 'idle' })
}

/** Run once when the app opens. Returns a cleanup function. */
export function initProfile(): () => void {
  if (started) return () => {}
  started = true
  void (async () => {
    const saved = read(SESSION_KEY)
    let session: { code: string; name: string; avatar?: string } | null = null
    try { session = saved ? JSON.parse(saved) : null } catch { session = null }

    if (session?.code && session.name) {
      // Already signed in on this device: open right away, check in the background.
      code = session.code
      setState({ phase: 'in', name: session.name, prefs: parsePrefs({ avatar: session.avatar }), sync: 'idle' })
      startWatching()
      const result = await reconcile(session.code, session.name, null)
      if (!result.ok) {
        if (result.reason === 'wrong') await dropSession()
        else if (result.reason === 'unset') { stopWatching(); code = null; setState({ phase: 'open', sync: 'idle' }) }
        else setState({ sync: 'offline' })
      }
      return
    }

    // Nobody signed in: ask whether a sign-in is needed at all.
    try {
      const res = await fetch('/api/profile', { cache: 'no-store' })
      const json = res.ok ? ((await res.json()) as { gate: boolean }) : { gate: false }
      setState({ phase: json.gate ? 'gate' : 'open' })
    } catch {
      setState({ phase: 'open' })   // never lock him out because the network is down
    }
  })()
  return () => { started = false; stopWatching() }
}

export type SignInResult = { ok: true } | { ok: false; message: string }

export async function signIn(typed: string): Promise<SignInResult> {
  const attempt = typed.trim()
  if (!attempt) return { ok: false, message: 'Type the code first.' }
  const reply = await call('GET', attempt)
  if (!reply.ok) {
    return { ok: false, message: reply.reason === 'wrong' ? 'That code is not right. Try again!'
      : reply.reason === 'slow' ? 'Too many tries. Wait a minute, then try again.'
        : reply.reason === 'unset' ? 'Sign-in is not ready yet.' : 'Cannot reach the internet right now.' }
  }
  code = attempt
  write(SESSION_KEY, JSON.stringify({ code: attempt, name: reply.name, avatar: reply.data?.prefs.avatar }))
  setState({ phase: 'in', name: reply.name, prefs: reply.data?.prefs ?? state.prefs, sync: 'saving' })
  startWatching()
  const result = await reconcile(attempt, reply.name, reply.data)
  if (!result.ok) setState({ sync: 'offline' })
  return { ok: true }
}

/** Sign out of this device. Saves first, then clears this device so the next person starts clean. */
export async function signOut(): Promise<{ ok: boolean; message?: string }> {
  if (code) {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
    const saved = await pushNow()
    if (!saved) return { ok: false, message: 'Cannot save his progress to the cloud right now, so it is not safe to sign out. Try again when the internet is back.' }
  }
  stopWatching()
  code = null
  applyLocal(parseProfile(null))
  write(SESSION_KEY, null)
  write(OWNER_KEY, null)
  write(STAMP_KEY, null)
  write(SAVE_KEY, null)
  setState({ phase: 'gate', name: null, prefs: { avatar: DEFAULT_AVATAR }, sync: 'idle' })
  return { ok: true }
}

export function setAvatar(avatar: string) {
  const prefs = parsePrefs({ avatar })
  setState({ prefs })
  const saved = read(SESSION_KEY)
  try { if (saved) write(SESSION_KEY, JSON.stringify({ ...JSON.parse(saved), avatar: prefs.avatar })) } catch { /* ignore */ }
  noteChange()
}

export async function syncNow(): Promise<boolean> {
  return pushNow()
}
