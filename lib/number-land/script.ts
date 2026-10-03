// What is said when a level opens and when it is won, in Kit's voice or the narrator's.
// Shared by the screens and the checker, so the checker can prove every line is allowlisted.
import { NUMBER_LEVELS, TOWNS, type NLevel } from './curriculum.ts'
import { KIT_NL, MISSION_DONE_NL, MISSION_START_NL, TOWN_NARRATION, pickLine } from './lines.ts'

export interface NLScript { intro: string[]; outro: string[] }

/** The line for arriving in a town (Kit's short welcome, or the narrator's big arrival). */
export function townIntro(townId: string, narrator: boolean): string {
  const t = TOWN_NARRATION[townId]
  return narrator ? t.arrive : t.kit
}

export function levelScript(level: NLevel, narrator: boolean): NLScript {
  const town = TOWNS[level.town]
  const inTown = NUMBER_LEVELS.filter(l => l.town === level.town)
  const first = inTown[0].id === level.id
  const last = inTown[inTown.length - 1].id === level.id
  return {
    intro: [first ? townIntro(town.id, narrator) : pickLine(MISSION_START_NL)],
    outro: narrator
      ? (last ? [TOWN_NARRATION[town.id].complete] : [pickLine(MISSION_DONE_NL)])
      : [KIT_NL.levelDone],
  }
}
