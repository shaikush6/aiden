// What each Number Land activity speaks, so we can warm the audio cache before it is needed
// and prove (in the checker) that every spoken line is on the allowlist.
import { NUMBER_ENTRIES, NUMBER_TEXT } from './words.ts'
import { MATH_WORDS } from './words.ts'
import { RIDDLE_QUESTION, parityFact } from './riddles.ts'
import { compareFact, compareQuestion, equationFull, oddEvenQuestion, teenFact } from './sentences.ts'
import type { NStep } from './plan.ts'

export interface StepSpeech { scripts: string[]; words: string[] }

export function stepSpeech(step: NStep): StepSpeech {
  const counting = (n: number) => NUMBER_TEXT.slice(1, n + 1)
  switch (step.kind) {
    case 'meet':
      return {
        scripts: [NUMBER_ENTRIES[step.n].tip, ...(step.n > 10 ? [teenFact(step.n)] : [])],
        words: [...counting(step.n), NUMBER_TEXT[step.n]],
      }
    case 'meetWord':
      return { scripts: [MATH_WORDS[step.key].tip], words: [MATH_WORDS[step.key].word.say] }
    case 'wake': case 'build':
      return { scripts: [], words: [...counting(step.n), NUMBER_TEXT[step.n]] }
    case 'equation':
      return { scripts: [equationFull(step.op, step.a, step.b, step.answer)], words: [] }
    case 'riddle':
      return { scripts: [...step.clues.map(c => c.text), RIDDLE_QUESTION], words: [] }
    case 'oddEven':
      return { scripts: [oddEvenQuestion(step.n), parityFact(step.n)], words: [] }
    case 'compare':
      return { scripts: [compareQuestion(step.a, step.b, step.ask), compareFact(step.a, step.b, step.ask)], words: [] }
    case 'story':
      return { scripts: step.story.sentences, words: [] }
    case 'rocket':
      return { scripts: [], words: step.rounds.map(r => NUMBER_TEXT[r.n]) }
    case 'wordBond': case 'soundCompare':
      return { scripts: [], words: [] }   // these use Quest words, which the Quest allowlist already covers
  }
}
