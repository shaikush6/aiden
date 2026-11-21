// Number Land progress, saved in this browser's localStorage and exposed as a tiny external store
// (read it with useSyncExternalStore, like the Quest's progress).
import { NUMBER_LEVELS, TOWNS } from './curriculum.ts'
import { TOPIC_SIGNS } from './terms.ts'

export interface NLLevelProgress { stars: number; plays: number }
export interface NumberStat { right: number; wrong: number }

export interface NLProgress {
  v: 2
  levels: Record<string, NLLevelProgress>
  /** Block Buddies the child has met (the numbers). */
  buddies: number[]
  /** Signs the child has been taught (+ − = < >). */
  signs: string[]
  wordsRead: number
  /** How often each number was answered right or wrong the first time. */
  numbers: Record<string, NumberStat>
  rocketBest: number | null
  celebratedTowns: string[]
  unlockAll: boolean
}

// v2 is the numeral-first journey. v1 (the reading-first version) is left untouched in the browser.
const KEY = 'aiden-number-land-v2'
const EMPTY: NLProgress = {
  v: 2, levels: {}, buddies: [], signs: [], wordsRead: 0, numbers: {}, rocketBest: null, celebratedTowns: [], unlockAll: false,
}

let current: NLProgress | null = null
const listeners = new Set<() => void>()

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

/** Turn anything (saved text, or data from the cloud) into valid progress. Bad parts fall back to empty. */
export function parseNL(raw: unknown): NLProgress {
  const p = raw as Partial<NLProgress> | null
  if (!p || typeof p !== 'object' || p.v !== 2) return EMPTY
  const levels: Record<string, NLLevelProgress> = {}
  for (const [id, l] of Object.entries(p.levels ?? {})) {
    if (l && Number.isFinite(l.stars) && Number.isFinite(l.plays)) levels[id] = { stars: l.stars, plays: l.plays }
  }
  const numbers: Record<string, NumberStat> = {}
  for (const [k, s] of Object.entries(p.numbers ?? {})) {
    if (s && Number.isFinite(s.right) && Number.isFinite(s.wrong)) numbers[k] = { right: s.right, wrong: s.wrong }
  }
  return {
    v: 2,
    levels,
    buddies: Array.isArray(p.buddies) ? p.buddies.filter((n): n is number => Number.isInteger(n)) : [],
    signs: strings(p.signs),
    wordsRead: Number(p.wordsRead) || 0,
    numbers,
    rocketBest: typeof p.rocketBest === 'number' ? p.rocketBest : null,
    celebratedTowns: strings(p.celebratedTowns),
    unlockAll: Boolean(p.unlockAll),
  }
}

function load(): NLProgress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? parseNL(JSON.parse(raw)) : EMPTY
  } catch {
    return EMPTY
  }
}

export function getNL(): NLProgress {
  if (typeof window === 'undefined') return EMPTY
  if (!current) current = load()
  return current
}

export function getServerNL(): NLProgress {
  return EMPTY
}

export function subscribeNL(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function commit(next: NLProgress) {
  current = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode: keep in memory only */ }
  listeners.forEach(fn => fn())
}

export interface NLResult {
  levelId: string
  stars: number
  wordsRead: number
  buddies: number[]
  signs: string[]
  numbers: Record<string, NumberStat>
}

export function recordNLLevel(r: NLResult) {
  const p = getNL()
  const prev = p.levels[r.levelId]
  const numbers = { ...p.numbers }
  for (const [k, s] of Object.entries(r.numbers)) {
    const old = numbers[k] ?? { right: 0, wrong: 0 }
    numbers[k] = { right: old.right + s.right, wrong: old.wrong + s.wrong }
  }
  commit({
    ...p,
    levels: { ...p.levels, [r.levelId]: { stars: Math.max(prev?.stars ?? 0, r.stars), plays: (prev?.plays ?? 0) + 1 } },
    buddies: [...new Set([...p.buddies, ...r.buddies])].sort((a, b) => a - b),
    signs: [...new Set([...p.signs, ...r.signs])],
    numbers,
    wordsRead: p.wordsRead + r.wordsRead,
  })
}

/** Mark a Block Buddy as met as soon as the child has finished meeting it (the Buddy Book fills up live). */
export function meetBuddy(n: number) {
  const p = getNL()
  if (!p.buddies.includes(n)) commit({ ...p, buddies: [...p.buddies, n].sort((a, b) => a - b) })
}

/** Mark a sign as taught as soon as its lesson finishes (the Buddy Book fills up live). */
export function meetSign(s: string) {
  const p = getNL()
  if (!p.signs.includes(s)) commit({ ...p, signs: [...p.signs, s] })
}

export function recordNumberRocket(seconds: number): boolean {
  const p = getNL()
  const isBest = p.rocketBest === null || seconds < p.rocketBest
  if (isBest) commit({ ...p, rocketBest: seconds })
  return isBest
}

export function markTownCelebrated(townId: string) {
  const p = getNL()
  if (!p.celebratedTowns.includes(townId)) commit({ ...p, celebratedTowns: [...p.celebratedTowns, townId] })
}

export function setNLUnlockAll(v: boolean) {
  commit({ ...getNL(), unlockAll: v })
}

/** Replace everything (used when progress arrives from his profile in the cloud). */
export function replaceNL(raw: unknown) {
  commit(parseNL(raw))
}

/**
 * Start from a later level: every level before `index` counts as done, with its Block Buddies met
 * and its signs taught. Only ever adds progress.
 */
export function completeNLUpTo(index: number) {
  const p = getNL()
  const levels = { ...p.levels }
  const buddies = new Set(p.buddies)
  const signs = new Set(p.signs)
  NUMBER_LEVELS.forEach((l, i) => {
    if (i >= index) return
    if (!levels[l.id]) levels[l.id] = { stars: 3, plays: 0 }
    l.meets.forEach(n => buddies.add(n))
    l.learn.forEach(t => (TOPIC_SIGNS[t] ?? []).forEach(s => signs.add(s)))
  })
  const towns = new Set(p.celebratedTowns)
  TOWNS.forEach((t, ti) => { if (NUMBER_LEVELS.filter(l => l.town === ti).every(l => levels[l.id])) towns.add(t.id) })
  commit({ ...p, levels, buddies: [...buddies].sort((a, b) => a - b), signs: [...signs], celebratedTowns: [...towns] })
}

export function resetNL() {
  commit(EMPTY)
}

export const isNLCompleted = (p: NLProgress, levelId: string): boolean => Boolean(p.levels[levelId])

/** A level is open when it is the first, the one before it is done, or a grown-up unlocked everything. */
export function isNLUnlocked(p: NLProgress, index: number): boolean {
  if (p.unlockAll || index === 0) return true
  const prev = NUMBER_LEVELS[index - 1]
  return Boolean(prev && p.levels[prev.id])
}

export function nextNLIndex(p: NLProgress): number {
  const i = NUMBER_LEVELS.findIndex(l => !p.levels[l.id])
  return i === -1 ? NUMBER_LEVELS.length - 1 : i
}

/** Numbers the child misses most often, weakest first. */
export function weakNumbers(p: NLProgress, limit = 6): { n: number; right: number; wrong: number }[] {
  return Object.entries(p.numbers)
    .filter(([, s]) => s.wrong > 0)
    .map(([k, s]) => ({ n: Number(k), ...s }))
    .sort((a, b) => b.wrong / (b.right + b.wrong) - a.wrong / (a.right + a.wrong) || b.wrong - a.wrong)
    .slice(0, limit)
}
