// Everything Number Land can ever ask the voice to say, as plain scripts.
// The Quest's allowlist merges these in, so the voice endpoint stays locked to pre-approved text.
import { KIT_NL, MISSION_DONE_NL, MISSION_START_NL, NARRATOR_NL, TOWN_NARRATION } from './lines.ts'
import { LEXICON, MATH_WORDS, NUMBER_ENTRIES, NUMBER_TEXT } from './words.ts'
import { allClueTexts } from './riddles.ts'
import { allStorySentences } from './stories.ts'
import { lessonScripts } from './lessons.ts'
import { questionScripts } from './speech.ts'

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
  const shared: string[] = [
    ...MISSION_START_NL, ...MISSION_DONE_NL, ...allClueTexts(), ...allStorySentences(), ...lessonScripts(), ...questionScripts(),
  ]
  NUMBER_ENTRIES.forEach(e => shared.push(e.tip))
  Object.values(MATH_WORDS).forEach(e => shared.push(e.tip))

  const towns = Object.values(TOWN_NARRATION)
  return {
    kit: [...Object.values(KIT_NL), ...towns.map(t => t.kit)],
    narrator: [...Object.values(NARRATOR_NL), ...towns.flatMap(t => [t.arrive, t.complete])],
    shared,
    words: [...NUMBER_TEXT, ...[...LEXICON.values()].map(e => e.word.say)],
  }
}
