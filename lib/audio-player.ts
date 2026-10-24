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

// Voice volume. iPad Safari ignores <audio>.volume, so any level below full goes through a Web Audio gain node.
let voiceVolume = 1
let voiceCtx: AudioContext | null = null
let voiceGain: GainNode | null = null
let routeTried = false

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

/** Apply the voice volume. Called when it changes, and just before each clip plays. */
function applyVoiceVolume() {
  const a = el
  if (!a) return
  if (voiceGain) {
    voiceGain.gain.value = voiceVolume
    if (voiceCtx?.state === 'suspended') voiceCtx.resume().catch(() => {})
    return
  }
  if (voiceVolume < 1 && !routeTried) {
    // Route the shared element through a gain node once; this only happens after a tap, when a clip is about to play.
    routeTried = true
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      voiceCtx = new Ctx()
      voiceGain = voiceCtx.createGain()
      voiceCtx.createMediaElementSource(a).connect(voiceGain).connect(voiceCtx.destination)
      voiceGain.gain.value = voiceVolume
      a.volume = 1
      void voiceCtx.resume().catch(() => {})
      document.addEventListener('pointerdown', () => { if (voiceCtx?.state === 'suspended') voiceCtx.resume().catch(() => {}) }, true)
      return
    } catch {
      voiceCtx = null
      voiceGain = null
    }
  }
  a.volume = voiceVolume
}

/** 0 to 1. Takes effect straight away, even mid-sentence. */
export function setVoiceVolume(v: number) {
  voiceVolume = Math.min(1, Math.max(0, Number.isFinite(v) ? v : 1))
  applyVoiceVolume()
}

// A clip that never reports that it ended (an iPad audio interruption, a dropped connection) must not freeze the
// lesson: every answer waits for its praise to finish, so a stuck clip would leave the buttons disabled for good.
const NO_METADATA_LIMIT_MS = 15_000
const END_GRACE_MS = 2_000

function playOne(url: string): Promise<void> {
  return new Promise(resolve => {
    const a = getEl()
    if (!a) return resolve()
    let watchdog: ReturnType<typeof setTimeout> | null = null
    const done = () => {
      if (watchdog) clearTimeout(watchdog)
      a.onended = null
      a.onerror = null
      a.onloadedmetadata = null
      if (finishCurrent === done) finishCurrent = null
      resolve()
    }
    finishCurrent = done
    a.onended = done
    a.onerror = done
    watchdog = setTimeout(done, NO_METADATA_LIMIT_MS)
    // Once the length is known, give the clip that long plus a little grace.
    a.onloadedmetadata = () => {
      if (watchdog) clearTimeout(watchdog)
      const length = Number.isFinite(a.duration) ? a.duration * 1000 : NO_METADATA_LIMIT_MS
      watchdog = setTimeout(done, length + END_GRACE_MS)
    }
    a.src = url
    applyVoiceVolume()
    a.play().catch(done)
  })
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

/** The clip's address, or null if it took too long to arrive (a slow connection must not freeze the lesson). */
const CLIP_LOAD_LIMIT_MS = 12_000
const loaded = (url: Promise<string | null>): Promise<string | null> =>
  Promise.race([url, new Promise<null>(resolve => setTimeout(() => resolve(null), CLIP_LOAD_LIMIT_MS))])

/**
 * Play clips in order. Each clip is a URL or a function that resolves to one (e.g. a TTS fetch).
 * Resolves true if the whole sequence finished (or audio is off, so there is nothing to wait for), false if it was interrupted.
 */
export async function playSequence(clips: ClipSource[], gapMs = 120): Promise<boolean> {
  stopAudio()
  // With the voice switched off the lesson carries on silently; callers treat false as "interrupted" and would stall.
  if (!enabled || !getEl()) return true
  const mine = token
  setSpeaking(true)
  // Start resolving every clip at once so network time overlaps with playback.
  const urls = clips.map(c => (typeof c === 'string' ? Promise.resolve(c) : c()))
  for (let i = 0; i < urls.length; i++) {
    const url = await loaded(urls[i])
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
