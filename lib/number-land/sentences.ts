// The sentences Number Land asks the child to read, built in one place so the planner,
// the screens, the voice allowlist and the checker always agree about the exact words.
import { NUMBER_TEXT, cap } from './words.ts'

export type Op = 'plus' | 'minus'
export type Ask = 'more' | 'less'

const W = (n: number): string => NUMBER_TEXT[n]

/** "Two plus three is" (what he reads before choosing the answer). */
export const equationLead = (op: Op, a: number, b: number): string => `${cap(W(a))} ${op} ${W(b)} is`

/** "Two plus three is five." (what is spoken after the answer). */
export const equationFull = (op: Op, a: number, b: number, answer: number): string =>
  `${equationLead(op, a, b)} ${W(answer)}.`

export const oddEvenQuestion = (n: number): string => `Is ${W(n)} odd or even?`

export const compareQuestion = (a: number, b: number, ask: Ask): string => `Which is ${ask}, ${W(a)} or ${W(b)}?`

export function compareAnswer(a: number, b: number, ask: Ask): number {
  return ask === 'more' ? Math.max(a, b) : Math.min(a, b)
}

/** "Five is more than three." or "Three is less than five." */
export function compareFact(a: number, b: number, ask: Ask): string {
  const hi = Math.max(a, b)
  const lo = Math.min(a, b)
  return ask === 'more' ? `${cap(W(hi))} is more than ${W(lo)}.` : `${cap(W(lo))} is less than ${W(hi)}.`
}

/** "Thirteen is ten and three." for the Buddy Book. */
export function teenFact(n: number): string {
  return `${cap(W(n))} is ten and ${W(n - 10)}.`
}

/** Lowercase word keys of a sentence, for looking words up. */
export function tokenKeys(text: string): string[] {
  return text.split(/\s+/).filter(Boolean).map(t => t.toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean)
}
