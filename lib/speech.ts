// OpenAI TTS — silently no-ops if the API is unavailable.
// All public functions return Promise<void> that resolve when audio finishes.
// Playback goes through the shared player, so only one clip ever plays at a time.

import { isAudioEnabled, playClip, setAudioEnabled, stopAudio } from './audio-player'
import { hashKey } from './hash'

export function setVoiceEnabled(v: boolean) { setAudioEnabled(v) }
export function getVoiceEnabled() { return isAudioEnabled() }
export { stopAudio as stopSpeech }

// Static phonics audio files — MIT licensed from hellodeborahuk/buzzphonics
// https://github.com/hellodeborahuk/buzzphonics  (MIT license)
// Synthetic phonics sounds: pure phonemes, no letter names, no schwa added.
const STATIC_PHONICS: Record<string, string> = {
  A: 'a',   B: 'b',   C: 'c',   D: 'd',   E: 'e',
  F: 'f',   G: 'g',   H: 'h',   I: 'i',   J: 'j',
  K: 'c',   // /k/ — same as hard-c sound file
  L: 'l',   M: 'm',   N: 'n',   O: 'o',   P: 'p',
  Q: 'qu',  R: 'r',   S: 's',   T: 't',   U: 'u',
  V: 'v',   W: 'w',   X: 'x',   Y: 'y',   Z: 'z',
  // Digraphs
  SH: 'sh', CH: 'ch', TH: 'th', NG: 'ng', NG_: 'ng',
  OO: 'oo', AI: 'ai', EE: 'ee', IGH: 'igh',
  AR: 'ar', OR: 'or', ER: 'er', OW: 'ow',  OI: 'oi',
  OA: 'oa', AIR: 'air', EAR: 'ear', UR: 'ur', URE: 'ure',
  CK: 'c',  PH: 'f',   WH: 'w',   QU: 'qu',
}

// TTS fallback map (used only when static file is unavailable)
const PHONEME_MAP: Record<string, string> = {
  A: 'a', E: 'e', I: 'i', O: 'o', U: 'u',
  B: 'b', C: 'k', D: 'd', F: 'f', G: 'g', H: 'h', J: 'j',
  K: 'k', L: 'l', M: 'm', N: 'n', P: 'p', Q: 'qu',
  R: 'r', S: 's', T: 't', V: 'v', W: 'w', X: 'x', Y: 'y', Z: 'z',
  SH: 'sh', CH: 'ch', TH: 'th', NG: 'ng', OO: 'oo',
}

// ---------- Caching ----------
// Layer 1: in-memory object URLs, capped so a long session cannot grow memory without limit.
// Layer 2: the browser's Cache Storage, so clips survive page reloads and are fetched only once per device.

const MAX_URLS = 200
const urlCache = new Map<string, string>()
const inFlight = new Map<string, Promise<string | null>>()
const CACHE_NAME = 'aiden-tts-v1'

function rememberUrl(key: string, url: string) {
  urlCache.set(key, url)
  if (urlCache.size > MAX_URLS) {
    const oldest = urlCache.keys().next().value as string
    const oldUrl = urlCache.get(oldest)
    urlCache.delete(oldest)
    // The shared player may still be using the most recent clips, never the oldest one.
    if (oldUrl) URL.revokeObjectURL(oldUrl)
  }
}

async function openCache(): Promise<Cache | null> {
  try {
    return typeof caches === 'undefined' ? null : await caches.open(CACHE_NAME)
  } catch {
    return null
  }
}

/**
 * Get a playable object URL for `key`, loading it with `load` only when neither cache has it.
 * `persistKey` is a same-origin path used as the Cache Storage key.
 */
export async function cachedAudioUrl(
  key: string,
  persistKey: string,
  load: () => Promise<Response>,
): Promise<string | null> {
  const hit = urlCache.get(key)
  if (hit) {
    urlCache.delete(key)          // refresh recency
    urlCache.set(key, hit)
    return hit
  }
  const pending = inFlight.get(key)
  if (pending) return pending

  const job = (async () => {
    try {
      const cache = await openCache()
      let res = cache ? await cache.match(persistKey) : undefined
      if (!res) {
        const fresh = await load()
        if (!fresh.ok) return null
        if (cache) await cache.put(persistKey, fresh.clone()).catch(() => {})
        res = fresh
      }
      const url = URL.createObjectURL(await res.blob())
      rememberUrl(key, url)
      return url
    } catch {
      return null
    } finally {
      inFlight.delete(key)
    }
  })()
  inFlight.set(key, job)
  return job
}

function fetchTTS(text: string, speed: number, phonics = false): Promise<string | null> {
  const key = `${phonics ? 'ph:' : ''}${text}|${speed}`
  return cachedAudioUrl(key, `/__tts-cache/${hashKey(key)}`, () =>
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed, phonics }),
    }),
  )
}

async function playTTS(text: string, speed = 1.0, phonics = false): Promise<void> {
  if (!isAudioEnabled() || typeof window === 'undefined') return
  await playClip(() => fetchTTS(text, speed, phonics))
}

// Public API

export function speakWord(word: string): Promise<void> {
  return playTTS(word.toLowerCase(), 0.9)
}

async function playPhonicsFile(filename: string): Promise<void> {
  if (!isAudioEnabled() || typeof window === 'undefined') return
  await playClip(`/phonics/${filename}.m4a`)
}

export async function speakLetterSound(letter: string): Promise<void> {
  const key = letter.toUpperCase()
  const file = STATIC_PHONICS[key]
  if (file) return playPhonicsFile(file)
  // Fallback: TTS with phonics instructions
  const phoneme = PHONEME_MAP[key] ?? letter.toLowerCase()
  return playTTS(phoneme, 0.85, true)
}

export async function speakDigraph(digraph: string): Promise<void> {
  const key = digraph.toUpperCase()
  const file = STATIC_PHONICS[key]
  if (file) return playPhonicsFile(file)
  const phoneme = PHONEME_MAP[key] ?? digraph.toLowerCase()
  return playTTS(phoneme, 0.85, true)
}

export function speakText(text: string): Promise<void> {
  return playTTS(text, 1.0)
}

export function speakNumber(n: number): Promise<void> {
  return playTTS(String(n), 1.0)
}

export function speakEncouragement(correct: boolean): Promise<void> {
  const correctPhrases = [
    'Amazing! Well done!',
    'Super! You got it!',
    'Fantastic! Great job!',
    'Wonderful! You are so smart!',
    'Yes! That is right!',
  ]
  const wrongPhrases = [
    'Try again! You can do it!',
    'Almost! Try one more time!',
    'Good try! Try again!',
  ]
  const phrases = correct ? correctPhrases : wrongPhrases
  const phrase = phrases[Math.floor(Math.random() * phrases.length)]
  return playTTS(phrase, 1.0)
}

export function speakSlow(text: string): Promise<void> {
  return playTTS(text, 0.7)
}

