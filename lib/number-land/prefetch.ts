// The audio to warm up before a Number Land level starts, in the voice the child will actually hear.
import { asKit, asNarrator, type QuestLine } from '../reading-quest/allowlist.ts'
import { KIT_NL, NARRATOR_NL } from './lines.ts'
import { stepSpeech } from './spoken.ts'
import type { NStep } from './plan.ts'

export function levelPrefetchItems(steps: NStep[]): QuestLine[] {
  const speech = steps.map(stepSpeech)
  const scripts = [...new Set(speech.flatMap(s => s.scripts))]
  const words = [...new Set(speech.flatMap(s => s.words))]
  return [
    ...asKit([...Object.values(KIT_NL), ...scripts]),
    ...asNarrator([...Object.values(NARRATOR_NL), ...scripts]),
    ...words.map(text => ({ kind: 'word' as const, text })),
  ]
}
