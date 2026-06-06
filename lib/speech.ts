// OpenAI TTS — silently no-ops if API key is missing.
// All public functions return Promise<void> that resolve when audio finishes.

let voiceEnabled = true
export function setVoiceEnabled(v: boolean) { voiceEnabled = v }
export function getVoiceEnabled() { return voiceEnabled }

const LETTER_SOUNDS: Record<string, string> = {
  A: 'aah', B: 'buh', C: 'cuh', D: 'duh', E: 'eh', F: 'fuh',
  G: 'guh', H: 'huh', I: 'ih', J: 'juh', K: 'kuh', L: 'luh',
  M: 'muh', N: 'nuh', O: 'oh', P: 'puh', Q: 'kwuh', R: 'ruh',
  S: 'sss', T: 'tuh', U: 'uh', V: 'vuh', W: 'wuh', X: 'ks',
  Y: 'yuh', Z: 'zzz',
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

async function fetchTTS(text: string, speed: number): Promise<string | null> {
  const cacheKey = `${text}|${speed}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, speed }),
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

async function playTTS(text: string, speed = 1.0): Promise<void> {
  if (!voiceEnabled) return
  if (typeof window === 'undefined') return

  stopCurrent()
  const mySeq = ++reqSeq          // claim a sequence slot
  const url = await fetchTTS(text, speed)

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

export function speakLetterSound(letter: string): Promise<void> {
  const sound = LETTER_SOUNDS[letter.toUpperCase()] ?? letter.toLowerCase()
  return playTTS(sound, 0.85)
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
