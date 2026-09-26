// One shared <audio> element for the whole app.
// - Only one clip plays at a time; starting a new clip or sequence cancels the old one.
// - iPad Safari only allows programmatic playback on an element that was first played from a tap,
//   so we reuse a single element and "unlock" it on the first pointer press.

type ClipSource = string | (() => Promise<string | null>)

let el: HTMLAudioElement | null = null
let enabled = true
let token = 0
let finishCurrent: (() => void) | null = null
let unlockInstalled = false

// 20ms of silence, used to unlock the element on the first tap.
const SILENT_WAV = 'data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA'

function getEl(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (!el) {
    el = new Audio()
    el.preload = 'auto'
    installUnlock()
  }
  return el
}

function installUnlock() {
  if (unlockInstalled || typeof document === 'undefined') return
  unlockInstalled = true
  const unlock = () => {
    document.removeEventListener('pointerdown', unlock, true)
    const a = el
    if (!a || !a.paused) return
    a.src = SILENT_WAV
    // Only pause if a real clip has not already taken over the element during this same tap.
    a.play().then(() => { if (a.src === SILENT_WAV) a.pause() }).catch(() => {})
  }
  document.addEventListener('pointerdown', unlock, true)
}

// Create the element as soon as this module loads in the browser, so the very first tap unlocks it.
if (typeof window !== 'undefined') getEl()

// Listeners told when speech starts and stops (background music uses this to duck under speech).
const speechListeners = new Set<(speaking: boolean) => void>()
let speaking = false
function setSpeaking(v: boolean) {
  if (v === speaking) return
  speaking = v
  speechListeners.forEach(fn => fn(v))
}

export function onSpeechChange(fn: (speaking: boolean) => void): () => void {
  speechListeners.add(fn)
  return () => speechListeners.delete(fn)
}

export function setAudioEnabled(v: boolean) {
  enabled = v
  if (!v) stopAudio()
}

export function isAudioEnabled() {
  return enabled
}

/** Stop whatever is playing and cancel any running sequence. */
export function stopAudio() {
  token++
  el?.pause()
  finishCurrent?.()
  setSpeaking(false)
}

function playOne(url: string): Promise<void> {
  return new Promise(resolve => {
    const a = getEl()
    if (!a) return resolve()
    const done = () => {
      a.onended = null
      a.onerror = null
      if (finishCurrent === done) finishCurrent = null
      resolve()
    }
    finishCurrent = done
    a.onended = done
    a.onerror = done
    a.src = url
    a.play().catch(done)
  })
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

/**
 * Play clips in order. Each clip is a URL or a function that resolves to one (e.g. a TTS fetch).
 * Resolves true if the whole sequence finished, false if it was interrupted or audio is off.
 */
export async function playSequence(clips: ClipSource[], gapMs = 120): Promise<boolean> {
  stopAudio()
  if (!enabled || !getEl()) return false
  const mine = token
  setSpeaking(true)
  // Start resolving every clip at once so network time overlaps with playback.
  const urls = clips.map(c => (typeof c === 'string' ? Promise.resolve(c) : c()))
  for (let i = 0; i < urls.length; i++) {
    const url = await urls[i]
    if (mine !== token) return false
    if (!url) continue
    await playOne(url)
    if (mine !== token) return false
    if (gapMs && i < urls.length - 1) await wait(gapMs)
  }
  if (mine === token) setSpeaking(false)
  return mine === token
}

export function playClip(clip: ClipSource): Promise<boolean> {
  return playSequence([clip], 0)
}
