// What each Number Land activity speaks, so we can warm the audio cache before it is needed
// and prove (in the checker) that every spoken line is on the allowlist.
import { NUMBER_TEXT } from './words.ts'
import { meetName, teenFact } from './speech.ts'
import { LESSONS } from './lessons.ts'
import { countAsk, countTold } from './speech.ts'
import type { NStep } from './steps.ts'
import { storyTold } from './speech.ts'

export interface StepSpeech { scripts: string[]; words: string[] }

const counting = (n: number): string[] => NUMBER_TEXT.slice(1, n + 1)

export function stepSpeech(step: NStep): StepSpeech {
  switch (step.kind) {
    case 'learn':
      return { scripts: LESSONS[step.topic].beats.map(b => b.say), words: [] }
    case 'meet':
      return { scripts: [meetName(step.n), ...(step.n > 10 ? [teenFact(step.n)] : [])], words: [...counting(step.n), NUMBER_TEXT[step.n]] }
    case 'choose':
      return { scripts: [...step.say, step.told], words: step.prompt.flatMap(t => (t.t === 'word' ? [t.text] : [])) }
    case 'count':
      return { scripts: [countAsk(step.animal), countTold(step.animal, step.n)], words: [...counting(step.n), NUMBER_TEXT[step.n]] }
    case 'build':
      return { scripts: [], words: [...counting(step.n), NUMBER_TEXT[step.n]] }
    case 'story':
      return { scripts: [...step.story.sentences, storyTold(step.story.animal, step.story.answer)], words: [] }
    case 'rocket':
      return { scripts: [], words: step.from === 'word' ? step.rounds.map(r => NUMBER_TEXT[r.n]) : [] }
    case 'wordBond': case 'soundCompare':
      return { scripts: [], words: [] }   // these use Quest words, which the Quest allowlist already covers
  }
}
