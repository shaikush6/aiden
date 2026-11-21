// Quest progress, saved in this browser's localStorage.
// Exposed as a tiny external store so React reads it with useSyncExternalStore (no effects needed).
import { LEVELS } from './catalog.ts'
import { DEFAULT_NARRATOR_VOICE, NARRATOR_VOICES, type NarratorVoice } from './narration.ts'

export interface LevelProgress { stars: number; plays: number }
export interface SoundStat { right: number; wrong: number }

export interface QuestSettings {
  /** Background music per scene. */
  music: boolean
  /** Dramatic narrator voice for instructions and story moments. */
  narrator: boolean
  narratorVoice: NarratorVoice
  /** Music loudness, 0 to 1. */
  musicVolume: number
  /** Voice loudness, 0 to 1. */
  voiceVolume: number
  /** Lower the music while the voice is talking. */
  duck: boolean
  /** Settings the player changed themselves. The admin's app-wide defaults never override these. */
  custom: ('narratorVoice' | 'music')[]
}

/** The settings the admin can set a default for, for everyone. */
export type DefaultableSetting = QuestSettings['custom'][number]
const DEFAULTABLE: DefaultableSetting[] = ['narratorVoice', 'music']

export interface QuestProgress {
  v: 1
  levels: Record<string, LevelProgress>
  sounds: Record<string, SoundStat>
  wordsRead: number
  unlockAll: boolean
  settings: QuestSettings
  /** Worlds whose "new world unlocked" celebration has already played. */
  celebratedWorlds: string[]
  /** Fastest Rocket Read, in seconds. */
  rocketBest: number | null
}

const KEY = 'aiden-reading-quest-v1'
const DEFAULT_SETTINGS: QuestSettings = { music: true, narrator: true, narratorVoice: DEFAULT_NARRATOR_VOICE, musicVolume: 0.5, voiceVolume: 1, duck: true, custom: [] }
const EMPTY: QuestProgress = {
  v: 1, levels: {}, sounds: {}, wordsRead: 0, unlockAll: false, settings: DEFAULT_SETTINGS, celebratedWorlds: [], rocketBest: null,
}

let current: QuestProgress | null = null
const listeners = new Set<() => void>()

function cleanSettings(raw: Partial<QuestSettings> | undefined): QuestSettings {
  const merged = { ...DEFAULT_SETTINGS, ...raw }
  // Fall back to the default if a saved voice is no longer offered.
  if (!NARRATOR_VOICES.some(v => v.id === merged.narratorVoice)) merged.narratorVoice = DEFAULT_NARRATOR_VOICE
  const level = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback)
  merged.musicVolume = level(merged.musicVolume, DEFAULT_SETTINGS.musicVolume)
  merged.voiceVolume = level(merged.voiceVolume, DEFAULT_SETTINGS.voiceVolume)
  merged.duck = typeof merged.duck === 'boolean' ? merged.duck : true
  merged.custom = Array.isArray(merged.custom) ? DEFAULTABLE.filter(k => merged.custom.includes(k)) : []
  return merged
}

/** Turn anything (saved text, or data from the cloud) into valid progress. Bad parts fall back to empty. */
export function parseProgress(raw: unknown): QuestProgress {
  const parsed = raw as Partial<QuestProgress> | null
  if (!parsed || typeof parsed !== 'object' || parsed.v !== 1) return EMPTY
  const levels: Record<string, LevelProgress> = {}
  for (const [id, l] of Object.entries(parsed.levels ?? {})) {
    if (l && Number.isFinite(l.stars) && Number.isFinite(l.plays)) levels[id] = { stars: l.stars, plays: l.plays }
  }
  const sounds: Record<string, SoundStat> = {}
  for (const [k, s] of Object.entries(parsed.sounds ?? {})) {
    if (s && Number.isFinite(s.right) && Number.isFinite(s.wrong)) sounds[k] = { right: s.right, wrong: s.wrong }
  }
  return {
    v: 1,
    levels,
    sounds,
    wordsRead: Number(parsed.wordsRead) || 0,
    unlockAll: Boolean(parsed.unlockAll),
    settings: cleanSettings(parsed.settings),
    celebratedWorlds: Array.isArray(parsed.celebratedWorlds) ? parsed.celebratedWorlds.filter(w => typeof w === 'string') : [],
    rocketBest: typeof parsed.rocketBest === 'number' ? parsed.rocketBest : null,
  }
}

function load(): QuestProgress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? parseProgress(JSON.parse(raw)) : EMPTY
  } catch {
    return EMPTY
  }
}

export function getProgress(): QuestProgress {
  if (typeof window === 'undefined') return EMPTY
  if (!current) current = load()
  return current
}

export function getServerProgress(): QuestProgress {
  return EMPTY
}

export function subscribeProgress(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function commit(next: QuestProgress) {
  current = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode: keep in memory only */ }
  listeners.forEach(fn => fn())
}

export interface LevelResult {
  levelId: string
  stars: number
  wordsRead: number
  sounds: Record<string, SoundStat>
}

export function recordLevel(r: LevelResult) {
  const p = getProgress()
  const prev = p.levels[r.levelId]
  const sounds = { ...p.sounds }
  for (const [gpc, s] of Object.entries(r.sounds)) {
    const old = sounds[gpc] ?? { right: 0, wrong: 0 }
    sounds[gpc] = { right: old.right + s.right, wrong: old.wrong + s.wrong }
  }
  commit({
    ...p,
    levels: { ...p.levels, [r.levelId]: { stars: Math.max(prev?.stars ?? 0, r.stars), plays: (prev?.plays ?? 0) + 1 } },
    sounds,
    wordsRead: p.wordsRead + r.wordsRead,
  })
}

export function setUnlockAll(v: boolean) {
  commit({ ...getProgress(), unlockAll: v })
}

/** A change the player (or a grown-up) made. Voice and music choices are remembered as theirs. */
export function setSettings(patch: Partial<QuestSettings>) {
  const p = getProgress()
  const custom = [...new Set([...p.settings.custom, ...DEFAULTABLE.filter(k => k in patch)])]
  commit({ ...p, settings: { ...p.settings, ...patch, custom } })
}

/** The admin's app-wide defaults: applied only to settings this player never changed. */
export function applyDefaults(defaults: Pick<QuestSettings, DefaultableSetting>) {
  const p = getProgress()
  const patch: Partial<QuestSettings> = {}
  for (const k of DEFAULTABLE) {
    if (p.settings.custom.includes(k) || p.settings[k] === defaults[k]) continue
    Object.assign(patch, { [k]: defaults[k] })
  }
  if (Object.keys(patch).length) commit({ ...p, settings: { ...p.settings, ...patch } })
}

export function markWorldCelebrated(worldId: string) {
  const p = getProgress()
  if (!p.celebratedWorlds.includes(worldId)) commit({ ...p, celebratedWorlds: [...p.celebratedWorlds, worldId] })
}

/** Record a Rocket Read time; returns true when it beats the previous best. */
export function recordRocketTime(seconds: number): boolean {
  const p = getProgress()
  const isBest = p.rocketBest === null || seconds < p.rocketBest
  if (isBest) commit({ ...p, rocketBest: seconds })
  return isBest
}

/** Replace everything (used when progress arrives from his profile in the cloud). */
export function replaceProgress(raw: unknown) {
  commit(parseProgress(raw))
}

/**
 * Start from a later level (a returning player picking where they got to): every level before `index`
 * counts as done. Only ever adds progress, so stars already earned are kept.
 */
export function completeUpTo(index: number) {
  const p = getProgress()
  const levels = { ...p.levels }
  const worldsDone = new Set<string>()
  LEVELS.forEach((l, i) => {
    if (i >= index) return
    if (!levels[l.def.id]) levels[l.def.id] = { stars: 3, plays: 0 }
  })
  // Worlds finished entirely before the start point have had their "new world" moment already.
  for (const l of LEVELS) if (l.world.levels.every(d => levels[d.id])) worldsDone.add(l.world.id)
  commit({ ...p, levels, celebratedWorlds: [...new Set([...p.celebratedWorlds, ...worldsDone])] })
}

/** Reset rescues and stats, but keep the grown-up's sound settings. */
export function resetProgress() {
  commit({ ...EMPTY, settings: getProgress().settings })
}

export function isCompleted(p: QuestProgress, levelId: string): boolean {
  return Boolean(p.levels[levelId])
}

/** A level is open when it is the first, the one before it is done, or a grown-up unlocked everything. */
export function isUnlocked(p: QuestProgress, index: number): boolean {
  if (p.unlockAll || index === 0) return true
  const prev = LEVELS[index - 1]
  return Boolean(prev && p.levels[prev.def.id])
}

/** Index of the level the child should play next. */
export function nextLevelIndex(p: QuestProgress): number {
  const i = LEVELS.findIndex(l => !p.levels[l.def.id])
  return i === -1 ? LEVELS.length - 1 : i
}

/** Sounds the child has missed most often, weakest first. */
export function weakSounds(p: QuestProgress, limit = 8): { gpc: string; right: number; wrong: number }[] {
  return Object.entries(p.sounds)
    .filter(([, s]) => s.wrong > 0)
    .map(([gpc, s]) => ({ gpc, ...s }))
    .sort((a, b) => b.wrong / (b.right + b.wrong) - a.wrong / (a.right + a.wrong) || b.wrong - a.wrong)
    .slice(0, limit)
}
