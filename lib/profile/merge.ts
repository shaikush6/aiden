// Merging two copies of a profile's progress (this device and the cloud) without ever losing anything.
// Progress only grows: stars go up, levels get finished, buddies get met. So the merge keeps the bigger
// number or the union of both lists. It does not matter which device saved first, or if both did.
import type { QuestProgress } from '../reading-quest/progress.ts'
import type { NLProgress } from '../number-land/progress.ts'

export interface BlasterSave { highScore: number; unlocked: string[]; zoneStars: number[] }

export interface Prefs {
  /** The emoji that stands for him in the corner of the screen. */
  avatar: string
  /** True once the new-account "where were you up to?" question has been answered or skipped. */
  placed: boolean
}

export interface ProfileData {
  quest: QuestProgress
  land: NLProgress
  blaster: BlasterSave
  prefs: Prefs
  /** When the newest change was made (milliseconds). The newer side wins for settings. */
  updatedAt: number
}

export const AVATARS = ['🦊', '🐯', '🦁', '🐼', '🐸', '🦄', '🐙', '🦖', '🚀', '⚽', '🤖', '🌟'] as const
export const DEFAULT_AVATAR = AVATARS[0]

const maxMap = <T>(a: Record<string, T>, b: Record<string, T>, pick: (x: T, y: T) => T): Record<string, T> => {
  const out: Record<string, T> = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = k in out ? pick(out[k], v) : v
  return out
}

const union = <T>(a: T[], b: T[]): T[] => [...new Set([...a, ...b])]
const minNullable = (a: number | null, b: number | null): number | null => (a === null ? b : b === null ? a : Math.min(a, b))

export function mergeQuest(a: QuestProgress, b: QuestProgress, newer: 'a' | 'b'): QuestProgress {
  return {
    v: 1,
    levels: maxMap(a.levels, b.levels, (x, y) => ({ stars: Math.max(x.stars, y.stars), plays: Math.max(x.plays, y.plays) })),
    sounds: maxMap(a.sounds, b.sounds, (x, y) => ({ right: Math.max(x.right, y.right), wrong: Math.max(x.wrong, y.wrong) })),
    wordsRead: Math.max(a.wordsRead, b.wordsRead),
    unlockAll: a.unlockAll || b.unlockAll,
    settings: newer === 'a' ? a.settings : b.settings,
    celebratedWorlds: union(a.celebratedWorlds, b.celebratedWorlds),
    rocketBest: minNullable(a.rocketBest, b.rocketBest),
  }
}

export function mergeLand(a: NLProgress, b: NLProgress): NLProgress {
  return {
    v: 2,
    levels: maxMap(a.levels, b.levels, (x, y) => ({ stars: Math.max(x.stars, y.stars), plays: Math.max(x.plays, y.plays) })),
    buddies: union(a.buddies, b.buddies).sort((x, y) => x - y),
    signs: union(a.signs, b.signs),
    wordsRead: Math.max(a.wordsRead, b.wordsRead),
    numbers: maxMap(a.numbers, b.numbers, (x, y) => ({ right: Math.max(x.right, y.right), wrong: Math.max(x.wrong, y.wrong) })),
    rocketBest: minNullable(a.rocketBest, b.rocketBest),
    celebratedTowns: union(a.celebratedTowns, b.celebratedTowns),
    unlockAll: a.unlockAll || b.unlockAll,
  }
}

export function mergeBlaster(a: BlasterSave, b: BlasterSave): BlasterSave {
  const len = Math.max(a.zoneStars.length, b.zoneStars.length)
  return {
    highScore: Math.max(a.highScore, b.highScore),
    unlocked: union(a.unlocked, b.unlocked),
    zoneStars: Array.from({ length: len }, (_, i) => Math.max(a.zoneStars[i] ?? 0, b.zoneStars[i] ?? 0)),
  }
}

export function mergeProfile(a: ProfileData, b: ProfileData): ProfileData {
  const newer = a.updatedAt >= b.updatedAt ? 'a' : 'b'
  return {
    quest: mergeQuest(a.quest, b.quest, newer),
    land: mergeLand(a.land, b.land),
    blaster: mergeBlaster(a.blaster, b.blaster),
    // Once answered on any device, the starting-point question never comes back.
    prefs: { ...(newer === 'a' ? a.prefs : b.prefs), placed: a.prefs.placed || b.prefs.placed },
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  }
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 200) : [])

export function parseBlaster(raw: unknown): BlasterSave {
  const d = raw as Partial<BlasterSave> | null
  const nums = (v: unknown): number[] => (Array.isArray(v) ? v.filter((n): n is number => Number.isFinite(n)).slice(0, 50) : [])
  return {
    highScore: d && Number.isFinite(d.highScore) ? Math.max(0, d.highScore as number) : 0,
    unlocked: strings(d?.unlocked).length ? strings(d?.unlocked) : ['blaster'],
    zoneStars: nums(d?.zoneStars),
  }
}

export function parsePrefs(raw: unknown): Prefs {
  const p = raw as Partial<Prefs> | null
  const avatar = p?.avatar
  return {
    avatar: (AVATARS as readonly string[]).includes(avatar ?? '') ? (avatar as string) : DEFAULT_AVATAR,
    placed: p?.placed === true,
  }
}
