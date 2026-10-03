// Number Detective riddles: "I am more than six. I am less than eight. Who am I?"
// Every riddle is checked by brute force so exactly ONE number fits all its clues.
import { NUMBER_TEXT, MAX_NUMBER, cap } from './words.ts'

export type ClueKind = 'more' | 'less' | 'odd' | 'even' | 'onemore'

export interface Clue { kind: ClueKind; k: number; text: string }

export const RIDDLE_QUESTION = 'Who am I?'

export function clueText(kind: ClueKind, k: number): string {
  const w = NUMBER_TEXT[k]
  switch (kind) {
    case 'more': return `I am more than ${w}.`
    case 'less': return `I am less than ${w}.`
    case 'onemore': return `I am one more than ${w}.`
    case 'odd': return 'I am odd.'
    case 'even': return 'I am even.'
  }
}

export function makeClue(kind: ClueKind, k = 0): Clue {
  return { kind, k, text: clueText(kind, k) }
}

export function clueFits(c: Clue, n: number): boolean {
  switch (c.kind) {
    case 'more': return n > c.k
    case 'less': return n < c.k
    case 'onemore': return n === c.k + 1
    case 'odd': return n % 2 === 1
    case 'even': return n % 2 === 0
  }
}

export const fitsAll = (clues: Clue[], n: number): boolean => clues.every(c => clueFits(c, n))

/** Numbers in [lo, hi] that satisfy every clue. */
export function solutions(clues: Clue[], lo: number, hi: number): number[] {
  const out: number[] = []
  for (let n = lo; n <= hi; n++) if (fitsAll(clues, n)) out.push(n)
  return out
}

export interface Riddle { clues: Clue[]; answer: number; lo: number; hi: number }

type Rand = () => number
const randInt = (lo: number, hi: number, rand: Rand) => lo + Math.floor(rand() * (hi - lo + 1))

function shuffle<T>(arr: T[], rand: Rand): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Sensible clue sets for answer n: a window around n that the other clues then narrow to exactly n.
 * (Building from templates avoids silly riddles like "more than nine, more than seven".)
 */
function templates(n: number, kinds: ClueKind[], hi: number): Clue[][] {
  const has = (k: ClueKind) => kinds.includes(k)
  const top = Math.min(MAX_NUMBER, hi + 1)
  const parity: ClueKind = n % 2 === 1 ? 'odd' : 'even'
  const out: Clue[][] = []
  if (has('more') && has('less')) {
    if (n - 1 >= 1 && n + 1 <= top) out.push([makeClue('more', n - 1), makeClue('less', n + 1)])
    if (has(parity)) {
      if (n - 1 >= 1 && n + 2 <= top) out.push([makeClue('more', n - 1), makeClue('less', n + 2), makeClue(parity)])
      if (n - 2 >= 1 && n + 1 <= top) out.push([makeClue('more', n - 2), makeClue('less', n + 1), makeClue(parity)])
      if (n - 2 >= 1 && n + 2 <= top) out.push([makeClue('more', n - 2), makeClue('less', n + 2), makeClue(parity)])
    }
  }
  if (has('onemore') && n - 1 >= 1) {
    const one = makeClue('onemore', n - 1)
    if (has('less') && n + 2 <= top) out.push([one, makeClue('less', n + 2)])
    if (has('more') && n - 2 >= 1) out.push([one, makeClue('more', n - 2)])
    if (has(parity)) out.push([one, makeClue(parity)])
  }
  return out
}

/** Make a riddle with 2-3 clues and exactly one answer in [lo, hi]. Returns null if none could be built. */
export function makeRiddle(lo: number, hi: number, kinds: ClueKind[], rand: Rand = Math.random): Riddle | null {
  for (let attempt = 0; attempt < 60; attempt++) {
    const answer = randInt(Math.max(2, lo), hi, rand)
    const options = templates(answer, kinds, hi).filter(set => {
      const sol = solutions(set, lo, hi)
      return sol.length === 1 && sol[0] === answer
    })
    if (!options.length) continue
    const clues = options[Math.floor(rand() * options.length)]
    return { clues: shuffle(clues, rand), answer, lo, hi }
  }
  return null
}

/** Three answer choices: the answer, near-misses that fit all but one clue, then close numbers. */
export function riddleOptions(r: Riddle, rand: Rand = Math.random): number[] {
  const opts = [r.answer]
  const partial = shuffle(
    Array.from({ length: r.hi - r.lo + 1 }, (_, i) => r.lo + i).filter(n =>
      n !== r.answer && r.clues.filter(c => clueFits(c, n)).length === r.clues.length - 1),
    rand,
  )
  for (const n of partial) if (opts.length < 3) opts.push(n)
  const near = shuffle([r.answer - 2, r.answer - 1, r.answer + 1, r.answer + 2], rand)
  for (const n of near) {
    if (opts.length >= 3) break
    if (n >= Math.max(1, r.lo) && n <= Math.min(MAX_NUMBER, r.hi + 1) && !opts.includes(n)) opts.push(n)
  }
  for (let n = Math.max(1, r.lo); opts.length < 3 && n <= MAX_NUMBER; n++) if (!opts.includes(n)) opts.push(n)
  return shuffle(opts, rand)
}

/** The clue sentences that can ever be spoken (for the voice allowlist). */
export function allClueTexts(): string[] {
  const out = [RIDDLE_QUESTION, clueText('odd', 0), clueText('even', 0)]
  for (let k = 1; k <= MAX_NUMBER; k++) out.push(clueText('more', k), clueText('less', k), clueText('onemore', k))
  return out
}

/** "Five is odd." style sentences, spoken when a riddle is solved or the Buddy Book opens. */
export function parityFact(n: number): string {
  return `${cap(NUMBER_TEXT[n])} is ${n % 2 === 0 ? 'even' : 'odd'}.`
}
