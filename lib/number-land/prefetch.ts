// The audio to warm up before a Number Land level starts, in the voice the child will actually hear.
import { asKit, asNarrator, type QuestLine } from '../reading-quest/allowlist.ts'
import { KIT_NL, NARRATOR_NL } from './lines.ts'
import { stepSpeech } from './spoken.ts'
import { LESSONS } from './lessons.ts'
import type { NStep } from './steps.ts'

export function levelPrefetchItems(steps: NStep[]): QuestLine[] {
  const speech = steps.map(stepSpeech)
  // The lessons behind the 💡 buttons, so an explanation starts the moment he asks for it.
  const lessons = steps.flatMap(s => (s.kind === 'choose' ? LESSONS[s.topic].beats.map(b => b.say) : []))
  const scripts = [...new Set([...speech.flatMap(s => s.scripts), ...lessons])]
  const words = [...new Set(speech.flatMap(s => s.words))]
  return [
    ...asKit([...Object.values(KIT_NL), ...scripts]),
    ...asNarrator([...Object.values(NARRATOR_NL), ...scripts]),
    ...words.map(text => ({ kind: 'word' as const, text })),
  ]
}
