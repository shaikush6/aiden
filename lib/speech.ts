// OpenAI TTS — silently no-ops if API key is missing.
// All public functions return Promise<void> that resolve when audio finishes.

let voiceEnabled = true
export function setVoiceEnabled(v: boolean) { voiceEnabled = v }
export function getVoiceEnabled() { return voiceEnabled }

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

// Blob URL cache: text -> object URL
const cache = new Map<string, string>()

// Current audio + request sequence counter.
// The sequence counter ensures that if two speak() calls race,
// only the LAST one actually plays — no overlapping or cut-off audio.
let currentAudio: HTMLAudioElement | null = null
let reqSeq = 0

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
}

async function fetchTTS(text: string, speed: number, phonics = false): Promise<string | null> {
  const cacheKey = `${phonics ? 'ph:' : ''}${text}|${speed}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed, phonics }),
    })
    if (!res.ok) return null
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    cache.set(cacheKey, url)
    return url
  } catch {
    return null
  }
}

async function playTTS(text: string, speed = 1.0, phonics = false): Promise<void> {
  if (!voiceEnabled) return
  if (typeof window === 'undefined') return

  stopCurrent()
  const mySeq = ++reqSeq          // claim a sequence slot
  const url = await fetchTTS(text, speed, phonics)

  // If another call was made while we were fetching, discard this result
  if (!url || mySeq !== reqSeq) return

  stopCurrent()                   // stop anything that snuck in during the await
  return new Promise(resolve => {
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => { currentAudio = null; resolve() }
    audio.onerror = () => { currentAudio = null; resolve() }
    audio.play().catch(() => { currentAudio = null; resolve() })
  })
}

// Public API

export function speakWord(word: string): Promise<void> {
  return playTTS(word.toLowerCase(), 0.9)
}

// Play a static phonics file from /public/phonics/, falling back to TTS
async function playPhonicsFile(filename: string): Promise<void> {
  if (!voiceEnabled || typeof window === 'undefined') return
  return new Promise(resolve => {
    const audio = new Audio(`/phonics/${filename}.m4a`)
    audio.onended = () => resolve()
    audio.onerror = () => resolve()  // silent — TTS fallback handled by caller
    audio.play().catch(() => resolve())
  })
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

export function speakText(text: string, _rate?: number, _pitch?: number): Promise<void> {
  // rate/pitch params kept for backward compat but ignored with OpenAI TTS
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
