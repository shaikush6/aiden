// Client-side audio for the quest.
// Spoken lines come from GET /api/tts?id=… (allowlisted, cached by the CDN, the browser, and Cache Storage).
// Letter sounds come from the static recordings in /public/phonics.
import { playSequence } from '../audio-player'
import { cachedAudioUrl } from '../speech'
import { lineId, type LineKind } from './allowlist.ts'
import { soundSource, UNKNOWN_PHONEME } from './phonemes.ts'
import { getProgress } from './progress.ts'
import type { ParsedWord, PhonemeKey } from './types.ts'

type Clip = string | (() => Promise<string | null>)

/** Guide lines switch to the narrator voice when narrator mode is on. Words and sounds never do. */
function voiceFor(kind: LineKind): LineKind {
  return kind === 'line' && getProgress().settings.narrator ? 'narration' : kind
}

export function lineClip(text: string, kind: LineKind = 'line'): Clip {
  const id = lineId(voiceFor(kind), text)
  return () => cachedAudioUrl(`q:${id}`, `/__tts-cache/q-${id}`, () => fetch(`/api/tts?id=${id}`))
}

export function phonemeClips(p: PhonemeKey): Clip[] {
  if (p === UNKNOWN_PHONEME) return []
  const src = soundSource(p)
  if (src.kind === 'file') return [`/phonics/${src.file}.m4a`]
  if (src.kind === 'seq') return src.parts.flatMap(phonemeClips)
  return [lineClip(src.text, 'sound')]
}

export function wordClip(word: ParsedWord, alien = false): Clip {
  return lineClip(word.say, alien ? 'alien' : 'word')
}

/** Say one or more lines in a row. Strings are spoken lines; clips play as-is. */
export function say(...parts: (string | Clip | Clip[])[]): Promise<boolean> {
  const clips = parts.flatMap(p => {
    if (Array.isArray(p)) return p
    if (typeof p === 'string' && !p.startsWith('/')) return [lineClip(p)]
    return [p]
  })
  return playSequence(clips)
}

export function sayPhoneme(p: PhonemeKey): Promise<boolean> {
  return playSequence(phonemeClips(p), 60)
}

export function sayWord(word: ParsedWord, alien = false): Promise<boolean> {
  return playSequence([wordClip(word, alien)])
}

/** Sound out a word unit by unit (heart parts are skipped: they cannot be sounded out). */
export function soundOut(word: ParsedWord, gapMs = 350, skip: number[] = []): Promise<boolean> {
  const clips = word.units.flatMap((u, i) => (skip.includes(i) ? [] : phonemeClips(u.phoneme)))
  return playSequence(clips, gapMs)
}

/** Warm the caches for lines a level will need, a few at a time so it never floods the network. */
export async function prefetchLines(items: { text: string; kind: LineKind }[], concurrency = 3): Promise<void> {
  const queue = [...items]
  const worker = async () => {
    while (queue.length) {
      const item = queue.shift()!
      // Only warm the voice the child will actually hear.
      if (item.kind === 'line' && getProgress().settings.narrator) continue
      if (item.kind === 'narration' && !getProgress().settings.narrator) continue
      const clip = lineClip(item.text, item.kind)
      if (typeof clip !== 'string') await clip()
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
}
