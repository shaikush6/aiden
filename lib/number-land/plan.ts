// Turns a level's recipe into the concrete activities for one play. It is pure: pass in the word bank
// (the Quest words the child has met, for the Word Gym) and, in tests, a seeded random function.
import type { ParsedWord } from '../reading-quest/types.ts'
import { MAX_NUMBER } from './words.ts'
import { knownNumbersAt, knownWordsAt, levelIndex, type NLevel } from './curriculum.ts'
import { RIDDLE_QUESTION, makeClue, makeRiddle, riddleOptions, type Clue } from './riddles.ts'
import { makeStory, type NStory } from './stories.ts'
import { canSplit, pickSoundPair } from './word-bonds.ts'
import { compareAnswer, compareQuestion, tokenKeys, type Ask, type Op } from './sentences.ts'

export type NStep =
  | { kind: 'meet'; n: number }
  | { kind: 'meetWord'; key: string }
  | { kind: 'wake'; n: number; options: number[] }
  | { kind: 'build'; n: number }
  | { kind: 'equation'; op: Op; a: number; b: number; answer: number; options: number[] }
  | { kind: 'riddle'; clues: Clue[]; answer: number; options: number[] }
  | { kind: 'oddEven'; n: number }
  | { kind: 'compare'; a: number; b: number; ask: Ask }
  | { kind: 'story'; story: NStory; options: number[] }
  | { kind: 'wordBond'; word: ParsedWord; demo: boolean }
  | { kind: 'soundCompare'; a: ParsedWord; b: ParsedWord }
  | { kind: 'rocket'; rounds: { n: number; options: [number, number] }[] }

type Rand = () => number

function shuffle<T>(arr: T[], rand: Rand): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const randInt = (lo: number, hi: number, rand: Rand) => lo + Math.floor(rand() * (hi - lo + 1))

/** The answer plus two close-by numbers, shuffled. Never a negative or past twenty. */
export function numberOptions(n: number, rand: Rand = Math.random): number[] {
  const min = n === 0 ? 0 : 1
  const valid = (x: number) => x >= min && x <= MAX_NUMBER && x !== n
  const near = shuffle([n - 2, n - 1, n + 1, n + 2].filter(valid), rand)
  const far = shuffle([n - 3, n + 3].filter(valid), rand)
  return shuffle([n, ...[...near, ...far].slice(0, 2)], rand)
}

/** True for steps the child answers (everything except the two "meet" cards). */
export const isNScored = (s: NStep): boolean => s.kind !== 'meet' && s.kind !== 'meetWord'

/** How many words the child reads in a step, for the "words read" counter. */
export function nWordsInStep(s: NStep): number {
  switch (s.kind) {
    case 'equation': return 4
    case 'oddEven': return 5
    case 'compare': return tokenKeys(compareQuestion(s.a, s.b, s.ask)).length
    case 'riddle': return s.clues.reduce((n, c) => n + tokenKeys(c.text).length, 0) + tokenKeys(RIDDLE_QUESTION).length
    case 'story': return s.story.sentences.reduce((n, t) => n + tokenKeys(t).length, 0)
    case 'rocket': return s.rounds.length
    case 'meet': case 'meetWord': return 0
    default: return 1
  }
}

/** The numbers a step is "about", for the grown-up's "numbers to practise" view. */
export function nStepNumbers(s: NStep): number[] {
  switch (s.kind) {
    case 'wake': case 'build': case 'oddEven': return [s.n]
    case 'equation': case 'riddle': return [s.answer]
    case 'compare': return [compareAnswer(s.a, s.b, s.ask)]
    case 'story': return [s.story.answer]
    case 'rocket': return s.rounds.map(r => r.n)
    default: return []
  }
}

export function planNumberLevel(level: NLevel, bank: ParsedWord[], rand: Rand = Math.random): NStep[] {
  const idx = levelIndex(level.id)
  const known = knownNumbersAt(idx)
  const words = knownWordsAt(idx)
  const [lo, hi] = level.range
  const maxKnown = known.length ? Math.max(...known) : 0
  const pool = known.filter(n => n >= lo && n <= hi)
  const buildPool = pool.filter(n => n >= 1)
  const splittable = shuffle(bank.filter(canSplit), rand)

  // New buddies are practised first, then anything in range, never the same number twice in a row.
  const fresh = [...level.buddies, ...level.buddies]
  let last = -1
  const nextN = (from: number[]): number => {
    const cand = fresh.find(n => from.includes(n))
    if (cand !== undefined) {
      fresh.splice(fresh.indexOf(cand), 1)
      return (last = cand)
    }
    const choices = from.filter(n => n !== last)
    const list = choices.length ? choices : from
    return (last = list[Math.floor(rand() * list.length)])
  }

  const steps: NStep[] = []
  let storyCount = 0
  let bondCount = 0
  const used = new Set<string>()

  for (const token of level.plan) {
    switch (token) {
      case 'meetBuddies':
        level.buddies.forEach(n => steps.push({ kind: 'meet', n }))
        break
      case 'meetWords':
        level.words.forEach(key => steps.push({ kind: 'meetWord', key }))
        break
      case 'wake': {
        const n = nextN(pool)
        steps.push({ kind: 'wake', n, options: numberOptions(n, rand) })
        break
      }
      case 'build':
        steps.push({ kind: 'build', n: nextN(buildPool) })
        break
      case 'plus': case 'minus': {
        const top = Math.min(hi, maxKnown)
        const sums: { a: number; b: number; answer: number }[] = []
        for (const a of known) for (const b of known) {
          if (a < 1 || b < 1) continue
          if (token === 'plus' && a + b <= top && known.includes(a + b)) sums.push({ a, b, answer: a + b })
          if (token === 'minus' && a <= top && b < a && known.includes(a - b) && a - b >= 1) sums.push({ a, b, answer: a - b })
        }
        const mixed = shuffle(sums, rand)
        const pick = mixed.find(s => !used.has(`${token}${s.a}.${s.b}`)) ?? mixed[0]
        if (pick) {
          used.add(`${token}${pick.a}.${pick.b}`)
          steps.push({ kind: 'equation', op: token, ...pick, options: numberOptions(pick.answer, rand) })
        }
        break
      }
      case 'compare': {
        const a = nextN(buildPool)
        let b = a
        for (let i = 0; i < 20 && b === a; i++) b = buildPool[Math.floor(rand() * buildPool.length)]
        if (b === a) break
        steps.push({ kind: 'compare', a, b, ask: words.has('less') && rand() < 0.5 ? 'less' : 'more' })
        break
      }
      case 'oddEven':
        steps.push({ kind: 'oddEven', n: nextN(buildPool) })
        break
      case 'riddle': {
        const kinds = level.riddle ?? ['more', 'less']
        const r = makeRiddle(Math.max(1, lo), Math.min(hi, maxKnown), kinds, rand)
        const riddle = r ?? { clues: [makeClue('more', 1), makeClue('less', 3)], answer: 2, lo: 1, hi: 10 }
        steps.push({ kind: 'riddle', clues: riddle.clues, answer: riddle.answer, options: riddleOptions(riddle, rand) })
        break
      }
      case 'story': {
        const story = makeStory(storyCount++ % 2 === 0 ? 'plus' : 'minus', hi, rand)
        steps.push({ kind: 'story', story, options: numberOptions(story.answer, rand) })
        break
      }
      case 'wordBond': {
        const word = splittable[bondCount % Math.max(1, splittable.length)]
        if (word) steps.push({ kind: 'wordBond', word, demo: level.id === 'nl19' && bondCount === 0 })
        bondCount++
        break
      }
      case 'soundCompare': {
        const pair = pickSoundPair(bank, rand)
        if (pair) steps.push({ kind: 'soundCompare', a: pair[0], b: pair[1] })
        break
      }
      case 'rocket': {
        const rounds = Array.from({ length: 6 }, () => {
          const n = buildPool[randInt(0, buildPool.length - 1, rand)]
          const other = numberOptions(n, rand).find(x => x !== n && x >= 1) ?? (n === 1 ? 2 : n - 1)
          const options = shuffle([n, other], rand) as [number, number]
          return { n, options }
        })
        steps.push({ kind: 'rocket', rounds })
        break
      }
    }
  }
  return steps
}
