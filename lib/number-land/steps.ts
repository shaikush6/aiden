// The activities a level is made of, once the planner has filled in the actual numbers.
import type { ParsedWord } from '../reading-quest/types.ts'
import type { Animal } from './words.ts'
import type { NStory } from './stories.ts'
import type { Option, Term, Topic } from './terms.ts'

/** A question with answer cards: the picture of the problem on top, the choices below. */
export interface ChooseStep {
  kind: 'choose'
  /** The lesson that explains this question (the 💡 button plays it). */
  topic: Topic
  /** What Kit says, in order. */
  say: string[]
  /** The question, as shown in Kit's speech bubble. */
  ask: string
  prompt: Term[]
  /** A picture that makes the question easier ("show me"). Using it means the answer is not first try. */
  hint?: Term[]
  options: Option[]
  /** Index into `options`. */
  answer: number
  /** What the prompt turns into once it is solved. */
  solved: Term[]
  /** Said after the answer. */
  told: string
  /** The numbers this question is about, for the grown-up's "numbers to practise" view. */
  numbers: number[]
  /** Number words the child reads, for the "words read" counter. */
  words: number
}

export type NStep =
  | { kind: 'learn'; topic: Topic }
  | { kind: 'meet'; n: number }
  | ChooseStep
  | { kind: 'count'; animal: Animal; n: number; options: number[] }
  | { kind: 'build'; n: number }
  | { kind: 'story'; story: NStory; options: number[] }
  | { kind: 'rocket'; from: 'num' | 'word'; rounds: { n: number; options: [number, number] }[] }
  | { kind: 'wordBond'; word: ParsedWord; demo: boolean }
  | { kind: 'soundCompare'; a: ParsedWord; b: ParsedWord }

/** True for steps the child answers (everything except the teaching cards). */
export const isNScored = (s: NStep): boolean => s.kind !== 'meet' && s.kind !== 'learn'
