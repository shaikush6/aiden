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
}

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
const DEFAULT_SETTINGS: QuestSettings = { music: true, narrator: true, narratorVoice: DEFAULT_NARRATOR_VOICE }
const EMPTY: QuestProgress = {
  v: 1, levels: {}, sounds: {}, wordsRead: 0, unlockAll: false, settings: DEFAULT_SETTINGS, celebratedWorlds: [], rocketBest: null,
}

let current: QuestProgress | null = null
const listeners = new Set<() => void>()

function cleanSettings(raw: Partial<QuestSettings> | undefined): QuestSettings {
  const merged = { ...DEFAULT_SETTINGS, ...raw }
  // Fall back to the default if a saved voice is no longer offered.
  if (!NARRATOR_VOICES.some(v => v.id === merged.narratorVoice)) merged.narratorVoice = DEFAULT_NARRATOR_VOICE
  return merged
}

function load(): QuestProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<QuestProgress>
    if (parsed?.v !== 1) return EMPTY
    return {
      v: 1,
      levels: parsed.levels ?? {},
      sounds: parsed.sounds ?? {},
      wordsRead: Number(parsed.wordsRead) || 0,
      unlockAll: Boolean(parsed.unlockAll),
      settings: cleanSettings(parsed.settings),
      celebratedWorlds: Array.isArray(parsed.celebratedWorlds) ? parsed.celebratedWorlds.filter(w => typeof w === 'string') : [],
      rocketBest: typeof parsed.rocketBest === 'number' ? parsed.rocketBest : null,
    }
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

export function setSettings(patch: Partial<QuestSettings>) {
  const p = getProgress()
  commit({ ...p, settings: { ...p.settings, ...patch } })
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
