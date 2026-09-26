// The complete set of things the quest ever asks the voice to say.
// The server only generates speech for ids in this list, so the quest's audio endpoint
// cannot be used to generate arbitrary speech.
// Scripts are stored split at their /sound/ markers: only the text pieces are spoken by the voice;
// the phonics sounds between them are real recordings.
import { hashKey } from '../hash.ts'
import { LEVELS, type LevelInfo } from './catalog.ts'
import {
  KIT_GOAL, KIT_LINES, KIT_PRAISE, KIT_RETRY, NARRATOR_GOAL, NARRATOR_LINES, NARRATOR_PRAISE, NARRATOR_RETRY, rescuedLine,
} from './lines.ts'
import { NARRATOR_VOICES, narrationLines, WORLD_NARRATION } from './narration.ts'
import { phonemeTtsTexts } from './phonemes.ts'
import { spokenFragments } from './script.ts'

/** How a line is voiced: Kit's teacher voice, the narrator, a single word, a made-up word, or a speech sound. */
export type LineKind = 'line' | 'narration' | 'word' | 'alien' | 'sound'

export const VOICE_VERSION = 'v2'

export function lineId(kind: LineKind, text: string, voice = ''): string {
  return hashKey(`${VOICE_VERSION}|${kind}|${voice}|${text}`)
}

export interface QuestLine { kind: LineKind; text: string; voice?: string }

/** Kit's voice: every text piece of these scripts. */
function asKit(scripts: string[]): QuestLine[] {
  return scripts.flatMap(spokenFragments).map(text => ({ kind: 'line' as const, text }))
}

/** Narrator voice: every text piece of these scripts, in every voice a grown-up can choose. */
function asNarrator(scripts: string[]): QuestLine[] {
  return scripts.flatMap(spokenFragments).flatMap(text => NARRATOR_VOICES.map(v => ({ kind: 'narration' as const, text, voice: v.id })))
}

/** Everything one level may say (not counting the shared fixed lines). */
export function levelLines(level: LevelInfo): QuestLine[] {
  const { def } = level
  const firstOfWorld = level.world.levels[0].id === def.id
  // Content scripts are spoken by Kit or by the narrator, depending on the setting.
  const content: string[] = [
    ...(firstOfWorld ? [level.world.intro] : []),
    def.animal.rescue, def.animal.fact, rescuedLine(def.animal.name),
    ...def.sounds.map(s => s.tip),
    ...level.newHeart.map(h => h.tip),
    ...def.sentences.map(s => s.t),
    ...(def.story ? [def.story.title, ...def.story.pages.map(p => p.t), ...def.story.questions.map(q => q.ask)] : []),
  ]
  const world = WORLD_NARRATION[level.world.id]
  const narratorOnly = [
    ...(world && firstOfWorld ? [world.arrive] : []),
    ...(world && level.isBoss ? [world.complete] : []),
  ]
  return [
    ...asKit(content),
    ...asNarrator([...content, ...narratorOnly]),
    ...level.newHeart.map(h => ({ kind: 'word' as const, text: h.word.say })),
    ...level.words.map(w => ({ kind: 'word' as const, text: w.say })),
    ...level.aliens.map(a => ({ kind: 'alien' as const, text: a.say })),
  ]
}

/** The lines every level uses: instructions, praise, narrator moments, and speech sounds. */
export function sharedLines(): QuestLine[] {
  return [
    ...asKit([...Object.values(KIT_LINES), ...KIT_PRAISE, ...KIT_RETRY, KIT_GOAL]),
    ...asNarrator([...Object.values(NARRATOR_LINES), ...NARRATOR_PRAISE, ...NARRATOR_RETRY, NARRATOR_GOAL, ...narrationLines()]),
    ...phonemeTtsTexts().map(text => ({ kind: 'sound' as const, text })),
  ]
}

export function collectQuestLines(): QuestLine[] {
  const out = sharedLines()
  for (const level of LEVELS) {
    out.push(...levelLines(level))
    // Any word in the bank can be tapped for help or used as a distractor, so all are allowed.
    level.bank.forEach(w => out.push({ kind: 'word', text: w.say }))
  }
  return out
}

let byId: Map<string, QuestLine> | null = null

export function findQuestLine(id: string): QuestLine | undefined {
  if (!byId) byId = new Map(collectQuestLines().map(l => [lineId(l.kind, l.text, l.voice), l]))
  return byId.get(id)
}
