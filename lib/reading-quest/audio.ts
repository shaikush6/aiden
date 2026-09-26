// Client-side audio for the quest.
// Spoken lines come from GET /api/tts?id=… (allowlisted, cached by the CDN, the browser, and Cache Storage).
// Letter sounds come from the static recordings in /public/phonics.
import { playSequence } from '../audio-player'
import { cachedAudioUrl } from '../speech'
import { lineId, type LineKind } from './allowlist.ts'
import { soundSource, UNKNOWN_PHONEME } from './phonemes.ts'
import { parseScript } from './script.ts'
import { getProgress } from './progress.ts'
import type { ParsedWord, PhonemeKey } from './types.ts'

type Clip = string | (() => Promise<string | null>)

/** Guide and content lines switch to the narrator voice when narrator mode is on. Words and sounds never do. */
function voiceFor(kind: LineKind): { kind: LineKind; voice: string } {
  const { narrator, narratorVoice } = getProgress().settings
  if (kind === 'narration' || (kind === 'line' && narrator)) return { kind: 'narration', voice: narratorVoice }
  return { kind, voice: '' }
}

export function lineClip(text: string, kind: LineKind = 'line'): Clip {
  const v = voiceFor(kind)
  const id = lineId(v.kind, text, v.voice)
  return () => cachedAudioUrl(`q:${id}`, `/__tts-cache/q-${id}`, () => fetch(`/api/tts?id=${id}`))
}

/** A script with /sound/ markers becomes spoken pieces with the real phonics recordings in between. */
export function scriptClips(script: string, kind: LineKind = 'line'): Clip[] {
  return parseScript(script).flatMap(p => ('phoneme' in p ? phonemeClips(p.phoneme) : [lineClip(p.text, kind)]))
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

/** Say scripts and clips in a row. Strings are scripts (they may contain /sound/ and [letter] markers). */
export function say(...parts: (string | Clip | Clip[])[]): Promise<boolean> {
  const clips = parts.flatMap(p => {
    if (Array.isArray(p)) return p
    if (typeof p === 'string') return scriptClips(p)
    return [p]
  })
  return playSequence(clips)
}

/** Preview a narrator voice (for the grown-up settings), whatever the current setting is. */
export function previewVoice(voice: string, text: string): Promise<boolean> {
  const id = lineId('narration', text, voice)
  return playSequence([() => cachedAudioUrl(`q:${id}`, `/__tts-cache/q-${id}`, () => fetch(`/api/tts?id=${id}`))])
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
export async function prefetchLines(items: { text: string; kind: LineKind; voice?: string }[], concurrency = 3): Promise<void> {
  const queue = [...items]
  const worker = async () => {
    while (queue.length) {
      const item = queue.shift()!
      // Only warm the voice the child will actually hear.
      const { narrator, narratorVoice } = getProgress().settings
      if (item.kind === 'line' && narrator) continue
      if (item.kind === 'narration' && (!narrator || item.voice !== narratorVoice)) continue
      const clip = lineClip(item.text, item.kind)
      if (typeof clip !== 'string') await clip()
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
}
