// Everything Number Land can ever ask the voice to say, as plain scripts.
// The Quest's allowlist merges these in, so the voice endpoint stays locked to pre-approved text.
import { KIT_NL, MISSION_DONE_NL, MISSION_START_NL, NARRATOR_NL, TOWN_NARRATION } from './lines.ts'
import { LEXICON, MATH_WORDS, MAX_NUMBER, NUMBER_ENTRIES, NUMBER_TEXT } from './words.ts'
import { allClueTexts, parityFact } from './riddles.ts'
import { allStorySentences } from './stories.ts'
import { compareFact, compareQuestion, equationFull, oddEvenQuestion, teenFact } from './sentences.ts'

export interface NLScripts {
  /** Spoken in Kit's voice only. */
  kit: string[]
  /** Spoken in the narrator's voice only. */
  narrator: string[]
  /** Content lines, spoken in whichever voice is on. */
  shared: string[]
  /** Single words (the teacher voice reads these in both modes). */
  words: string[]
}

export function numberLandScripts(): NLScripts {
  const shared: string[] = []
  NUMBER_ENTRIES.forEach(e => shared.push(e.tip))
  Object.values(MATH_WORDS).forEach(e => shared.push(e.tip))
  shared.push(...MISSION_START_NL, ...MISSION_DONE_NL, ...allClueTexts(), ...allStorySentences())

  for (let n = 0; n <= MAX_NUMBER; n++) {
    shared.push(parityFact(n), oddEvenQuestion(n))
    if (n > 10) shared.push(teenFact(n))
  }
  for (let a = 1; a <= MAX_NUMBER; a++) {
    for (let b = 1; b <= MAX_NUMBER; b++) {
      if (a + b <= MAX_NUMBER) shared.push(equationFull('plus', a, b, a + b))
      if (b < a) shared.push(equationFull('minus', a, b, a - b))
      if (a !== b) for (const ask of ['more', 'less'] as const) shared.push(compareQuestion(a, b, ask), compareFact(a, b, ask))
    }
  }

  const towns = Object.values(TOWN_NARRATION)
  return {
    kit: [...Object.values(KIT_NL), ...towns.map(t => t.kit)],
    narrator: [...Object.values(NARRATOR_NL), ...towns.flatMap(t => [t.arrive, t.complete])],
    shared,
    words: [...NUMBER_TEXT, ...[...LEXICON.values()].map(e => e.word.say)],
  }
}
