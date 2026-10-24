// Every sentence Number Land asks the voice to say, built in one place. The planner, the screens, the
// voice allowlist and the checker all call these builders, so they always agree about the exact words.
// Numbers are written as words here (never digits) because that is how the voice should say them.
import { NUMBER_TEXT, MAX_NUMBER, ANIMALS, cap, type Animal } from './words.ts'
import { parseSeg } from '../reading-quest/parse.ts'
import { RIDDLE_QUESTION } from './riddles.ts'

export { RIDDLE_QUESTION }

export type Op = 'plus' | 'minus'
export type Ask = 'more' | 'less'

const W = (n: number): string => NUMBER_TEXT[n]
const C = (n: number): string => cap(NUMBER_TEXT[n])

export const pluralOf = (a: Animal): string => parseSeg(a.plural).text

// ---------- meeting numbers ----------

export const meetName = (n: number): string =>
  n === 0 ? 'Zero means none. There are no blocks at all! This is the number zero.' : `So this is the number ${W(n)}!`

/** "Thirteen is ten and three." */
export const teenFact = (n: number): string => `${C(n)} is ten and ${W(n - 10)}.`

// ---------- questions and answers ----------

export const countAsk = (a: Animal): string => `How many ${pluralOf(a)}? Tap each one to count!`
export const countTold = (a: Animal, n: number): string =>
  n === 0 ? `There are no ${pluralOf(a)}. That is zero!` : `${C(n)} ${pluralOf(a)}!`

export const buddyOfAsk = (n: number): string => `Which Block Buddy is ${W(n)}?`
export const numberOfAsk = 'How many blocks? Tap the number.'
export const numberTold = (n: number): string => `${C(n)}!`

export const addAsk = (a: number, b: number): string => `What is ${W(a)} plus ${W(b)}?`
export const subAsk = (a: number, b: number): string => `What is ${W(a)} minus ${W(b)}?`
export const sumTold = (op: Op, a: number, b: number, c: number): string => `${C(a)} ${op} ${W(b)} equals ${W(c)}.`
export const missingAsk = (a: number, c: number): string => `${C(a)} plus what equals ${W(c)}?`

export const moreAsk = (a: number, b: number, ask: Ask): string => `Which number is ${ask}, ${W(a)} or ${W(b)}?`
export const compareTold = (a: number, b: number, ask: Ask): string => {
  const hi = Math.max(a, b)
  const lo = Math.min(a, b)
  return ask === 'more' ? `${C(hi)} is more than ${W(lo)}.` : `${C(lo)} is less than ${W(hi)}.`
}

export const signAsk = (a: number, b: number): string => `Which sign goes between ${W(a)} and ${W(b)}?`
export const signTold = (a: number, b: number): string =>
  a === b ? `${C(a)} equals ${W(b)}.` : a > b ? `${C(a)} is more than ${W(b)}.` : `${C(a)} is less than ${W(b)}.`

export const oddEvenAsk = (n: number): string => `Is ${W(n)} odd or even?`
export const oddEvenTold = (n: number): string =>
  n % 2 === 0 ? `${C(n)} is even. Everyone has a partner!` : `${C(n)} is odd. One block is left over!`

export const nextAsk = (a: number): string => `${C(a)}, ${W(a + 1)}, ${W(a + 2)}, what comes next?`
export const nextTold = (a: number): string => `${C(a)}, ${W(a + 1)}, ${W(a + 2)}, ${W(a + 3)}!`
export const beforeAsk = (n: number): string => `What number comes before ${W(n)}?`
export const beforeTold = (n: number): string => `${C(n - 1)} comes right before ${W(n)}.`
export const betweenAsk = (a: number): string => `What number is between ${W(a)} and ${W(a + 2)}?`
export const betweenTold = (a: number): string => `${C(a + 1)} is between ${W(a)} and ${W(a + 2)}.`

export const SKIP_STEPS = [2, 5] as const
const SKIP_WORD: Record<number, string> = { 2: 'twos', 5: 'fives' }
export const skipAsk = (s: number): string => `Count by ${SKIP_WORD[s]}. ${C(s)}, ${W(2 * s)}, ${W(3 * s)}, what comes next?`
export const skipTold = (s: number): string => `${C(s)}, ${W(2 * s)}, ${W(3 * s)}, ${W(4 * s)}!`

export const doubleAsk = (n: number): string => `What is double ${W(n)}?`
export const doubleTold = (n: number): string => `Double ${W(n)} is ${W(2 * n)}.`

export const bondAsk = (a: number, t: number): string => `${C(a)} and what make ${W(t)}?`
export const bondTold = (a: number, b: number, t: number): string => `${C(a)} and ${W(b)} make ${W(t)}.`

export const teenAsk = (k: number): string => `What is ten and ${W(k)}?`
export const teenSumTold = (k: number): string => `Ten and ${W(k)} is ${W(10 + k)}.`

export const riddleTold = (n: number): string => `I am ${W(n)}!`

export const wordNumAsk = 'Read the number name. Then tap that number.'
export const wordSignAsk = 'Read the word. Then tap its sign.'
export const wordSignTold = (word: 'plus' | 'minus'): string =>
  word === 'plus' ? 'Plus means put together.' : 'Minus means take away.'

/** Lowercase word keys of a sentence, for looking words up. */
export function tokenKeys(text: string): string[] {
  return text.split(/\s+/).filter(Boolean).map(t => t.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean)
}

// ---------- stories ----------

export const storyTold = (a: Animal, n: number): string => `${C(n)} ${pluralOf(a)}!`

// ---------- everything that can ever be spoken (for the voice allowlist) ----------

/** Highest total used by plus and minus questions. */
export const SUM_MAX = 10

export function questionScripts(): string[] {
  const out: string[] = [numberOfAsk, wordNumAsk, wordSignAsk, wordSignTold('plus'), wordSignTold('minus'), RIDDLE_QUESTION]
  for (const a of ANIMALS) {
    for (let n = 0; n <= MAX_NUMBER; n++) out.push(countAsk(a), countTold(a, n))
    for (let n = 1; n <= SUM_MAX; n++) out.push(storyTold(a, n))
  }
  for (let n = 0; n <= MAX_NUMBER; n++) {
    out.push(buddyOfAsk(n), numberTold(n), oddEvenAsk(n), oddEvenTold(n), riddleTold(n))
    if (n > 10) out.push(teenFact(n))
  }
  for (let a = 1; a <= SUM_MAX; a++) {
    for (let b = 1; a + b <= SUM_MAX; b++) {
      out.push(addAsk(a, b), sumTold('plus', a, b, a + b), missingAsk(a, a + b))
    }
    for (let b = 1; b < a; b++) out.push(subAsk(a, b), sumTold('minus', a, b, a - b))
  }
  for (let a = 0; a <= MAX_NUMBER; a++) {
    for (let b = 0; b <= MAX_NUMBER; b++) {
      out.push(signAsk(a, b), signTold(a, b))
      if (a !== b) for (const ask of ['more', 'less'] as const) out.push(moreAsk(a, b, ask), compareTold(a, b, ask))
    }
  }
  for (let a = 0; a + 3 <= MAX_NUMBER; a++) out.push(nextAsk(a), nextTold(a))
  for (let n = 1; n <= MAX_NUMBER; n++) out.push(beforeAsk(n), beforeTold(n))
  for (let a = 0; a + 2 <= MAX_NUMBER; a++) out.push(betweenAsk(a), betweenTold(a))
  for (const s of SKIP_STEPS) out.push(skipAsk(s), skipTold(s))
  for (let n = 1; n <= 10; n++) out.push(doubleAsk(n), doubleTold(n))
  for (let t = 3; t <= 10; t++) for (let a = 1; a < t; a++) out.push(bondAsk(a, t), bondTold(a, t - a, t))
  for (let k = 1; k <= 10; k++) out.push(teenAsk(k), teenSumTold(k))
  for (let n = 0; n <= MAX_NUMBER; n++) out.push(meetName(n))
  return out
}
