// The complete set of things the quest ever asks the voice to say.
// The server only generates speech for ids in this list, so the quest's audio endpoint
// cannot be used to generate arbitrary speech.
import { hashKey } from '../hash.ts'
import { LEVELS, type LevelInfo } from './catalog.ts'
import { GOAL, LINES, PRAISE, RETRY, rescuedLine } from './lines.ts'
import { narrationLines, WORLD_NARRATION } from './narration.ts'
import { phonemeTtsTexts } from './phonemes.ts'

/** How the voice should say a line. */
export type LineKind = 'line' | 'narration' | 'word' | 'alien' | 'sound'

export const VOICE_VERSION = 'v1'

export function lineId(kind: LineKind, text: string): string {
  return hashKey(`${VOICE_VERSION}|${kind}|${text}`)
}

export interface QuestLine { kind: LineKind; text: string }

/** In narrator mode, every guide line can also be spoken by the narrator voice. */
function withNarration(lines: QuestLine[]): QuestLine[] {
  return lines.flatMap(l => (l.kind === 'line' ? [l, { kind: 'narration' as const, text: l.text }] : [l]))
}

/** Everything one level may say (not counting the shared fixed lines). */
export function levelLines(level: LevelInfo): QuestLine[] {
  const out: QuestLine[] = []
  const add = (kind: LineKind, text: string) => { if (text) out.push({ kind, text }) }
  const { def } = level
  if (level.world.levels[0].id === def.id) add('line', level.world.intro)
  add('line', def.animal.rescue)
  add('line', def.animal.fact)
  add('line', rescuedLine(def.animal.name))
  def.sounds.forEach(s => add('line', s.tip))
  level.newHeart.forEach(h => { add('line', h.tip); add('word', h.word.say) })
  level.words.forEach(w => add('word', w.say))
  level.aliens.forEach(a => add('alien', a.say))
  def.sentences.forEach(s => add('line', s.t))
  if (def.story) {
    add('line', def.story.title)
    def.story.pages.forEach(p => add('line', p.t))
    def.story.questions.forEach(q => add('line', q.ask))
  }
  const story = WORLD_NARRATION[level.world.id]
  if (story && level.world.levels[0].id === def.id) add('narration', story.arrive)
  if (story && level.isBoss) add('narration', story.complete)
  return withNarration(out)
}

/** The lines every level uses: instructions, praise, and phoneme sounds. */
export function sharedLines(): QuestLine[] {
  return withNarration([
    ...[...Object.values(LINES), ...PRAISE, ...RETRY, GOAL].map(text => ({ kind: 'line' as const, text })),
    ...narrationLines().map(text => ({ kind: 'narration' as const, text })),
    ...phonemeTtsTexts().map(text => ({ kind: 'sound' as const, text })),
  ])
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
  if (!byId) byId = new Map(collectQuestLines().map(l => [lineId(l.kind, l.text), l]))
  return byId.get(id)
}
