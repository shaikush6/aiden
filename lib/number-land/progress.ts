// Number Land progress, saved in this browser's localStorage and exposed as a tiny external store
// (read it with useSyncExternalStore, like the Quest's progress).
import { NUMBER_LEVELS } from './curriculum.ts'

export interface NLLevelProgress { stars: number; plays: number }
export interface NumberStat { right: number; wrong: number }

export interface NLProgress {
  v: 1
  levels: Record<string, NLLevelProgress>
  /** Block Buddies the child has met (the numbers). */
  buddies: number[]
  /** Math words the child has met. */
  words: string[]
  wordsRead: number
  /** How often each number was answered right or wrong the first time. */
  numbers: Record<string, NumberStat>
  rocketBest: number | null
  celebratedTowns: string[]
  unlockAll: boolean
}

const KEY = 'aiden-number-land-v1'
const EMPTY: NLProgress = {
  v: 1, levels: {}, buddies: [], words: [], wordsRead: 0, numbers: {}, rocketBest: null, celebratedTowns: [], unlockAll: false,
}

let current: NLProgress | null = null
const listeners = new Set<() => void>()

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])

function load(): NLProgress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const p = JSON.parse(raw) as Partial<NLProgress>
    if (p?.v !== 1) return EMPTY
    return {
      v: 1,
      levels: p.levels ?? {},
      buddies: Array.isArray(p.buddies) ? p.buddies.filter((n): n is number => Number.isInteger(n)) : [],
      words: strings(p.words),
      wordsRead: Number(p.wordsRead) || 0,
      numbers: p.numbers ?? {},
      rocketBest: typeof p.rocketBest === 'number' ? p.rocketBest : null,
      celebratedTowns: strings(p.celebratedTowns),
      unlockAll: Boolean(p.unlockAll),
    }
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
  words: string[]
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
    words: [...new Set([...p.words, ...r.words])],
    numbers,
    wordsRead: p.wordsRead + r.wordsRead,
  })
}

/** Mark a Block Buddy as met as soon as the child has finished meeting it (the Buddy Book fills up live). */
export function meetBuddy(n: number) {
  const p = getNL()
  if (!p.buddies.includes(n)) commit({ ...p, buddies: [...p.buddies, n].sort((a, b) => a - b) })
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
