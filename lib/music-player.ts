// Background music: one <audio> element routed through a Web Audio gain node.
// - Crossfades between tracks. Dips under speech so the voice stays clear, then ramps smoothly back up.
// - Uses a gain node because iPad Safari ignores <audio>.volume.
// - Pauses while the page is hidden, and resumes when it comes back.
import { onSpeechChange } from './audio-player'

const FULL = 1.0     // files are pre-normalized quiet, so full gain already sits under speech
const DUCKED = 0.3    // about -10 dB while anyone is speaking
const DUCK_DOWN_S = 0.3
const DUCK_UP_S = 1.5 // slow, smooth return after speech
const FADE_S = 0.6

let el: HTMLAudioElement | null = null
let ctx: AudioContext | null = null
let gain: GainNode | null = null
let current: { src: string; loop: boolean } | null = null
// The track most recently asked for. A stop that is still fading out must not hide a new request for the same track.
let target: { src: string; loop: boolean } | null = null
let enabled = true
// The child's own mix. 0.5 is the level the tracks were tuned for; the slider can go quieter or up to twice as loud.
let volume = 0.5
let duckOn = true
let ducked = false
let swapToken = 0
let fadingOut = false
let unduckTimer: ReturnType<typeof setTimeout> | null = null
let installed = false

function level(): number {
  if (!enabled || !current) return 0
  return (ducked && duckOn ? DUCKED : FULL) * volume * 2
}

function rampTo(value: number, seconds = FADE_S) {
  if (gain && ctx) {
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(value, now + seconds)
  } else if (el) {
    el.volume = value   // desktop fallback when Web Audio is unavailable
  }
}

function setup(): boolean {
  if (typeof window === 'undefined') return false
  if (el) return true
  el = new Audio()
  el.preload = 'auto'
  // A one-shot track (the victory fanfare) is finished once it ends; a later tap must not replay it.
  el.addEventListener('ended', () => { if (current && !current.loop) { current = null; target = null } })
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctx()
    gain = ctx.createGain()
    gain.gain.value = 0
    ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination)
  } catch {
    ctx = null
    gain = null
  }
  if (!installed) {
    installed = true
    // Browsers only start audio after a tap: resume on every tap until it is running.
    document.addEventListener('pointerdown', () => {
      if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
      if (el && current && enabled && el.paused && !document.hidden) el.play().catch(() => {})
    }, true)
    document.addEventListener('visibilitychange', () => {
      if (!el || !current) return
      if (document.hidden) el.pause()
      else if (enabled) el.play().catch(() => {})
    })
    onSpeechChange(speaking => {
      if (unduckTimer) { clearTimeout(unduckTimer); unduckTimer = null }
      if (speaking) {
        ducked = true
        if (!fadingOut) rampTo(level(), DUCK_DOWN_S)
        return
      }
      // Wait a moment before coming back up, so music does not pump between back-to-back clips.
      unduckTimer = setTimeout(() => {
        unduckTimer = null
        ducked = false
        if (!fadingOut) rampTo(level(), DUCK_UP_S)
      }, 350)
    })
  }
  return true
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

/** Switch to a track (or to silence with null), fading out the old one first. */
export async function playMusic(track: { src: string; loop: boolean } | null) {
  if (!setup() || !el) return
  if (track?.src === target?.src) return
  target = track
  const mine = ++swapToken
  if (track && track.src === current?.src) {
    // Asked for the track that is already loaded (for example while a stop was fading it out): keep it going.
    fadingOut = false
    if (enabled && el.paused) await el.play().catch(() => {})
    if (mine === swapToken) rampTo(level())
    return
  }
  if (current) {
    fadingOut = true
    rampTo(0)
    await wait(FADE_S * 1000)
    if (mine !== swapToken) return
  }
  fadingOut = false
  current = track
  if (!track) { el.pause(); return }
  el.src = track.src
  el.loop = track.loop
  if (enabled) {
    await el.play().catch(() => {})
    if (mine === swapToken) rampTo(level())
  }
}

export function stopMusic() {
  void playMusic(null)
}

export function setMusicEnabled(v: boolean) {
  enabled = v
  if (!el) return
  if (!v) { rampTo(0, 0.3); setTimeout(() => { if (!enabled) el?.pause() }, 300) }
  else if (current) { el.play().catch(() => {}); rampTo(level()) }
}

/** 0 to 1 (0.5 is the tuned level). */
export function setMusicVolume(v: number) {
  volume = Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0.5))
  if (el && current && enabled) rampTo(level(), 0.15)
}

/** Whether the music dips while someone is speaking. */
export function setMusicDucking(v: boolean) {
  duckOn = v
  if (el && current && enabled) rampTo(level(), 0.3)
}
