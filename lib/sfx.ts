// Tiny, soft sound effects synthesized with Web Audio: short bell-like chimes, never loops.
// Quiet on purpose (they sit under speech) and silent when the app's voice switch is off.
import { isAudioEnabled } from './audio-player'

let ctx: AudioContext | null = null
let unlockInstalled = false

function context(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new Ctx()
    } catch {
      return null
    }
  }
  if (!unlockInstalled) {
    unlockInstalled = true
    document.addEventListener('pointerdown', () => { if (ctx?.state === 'suspended') ctx.resume().catch(() => {}) }, true)
  }
  return ctx
}

/** One soft bell note: sine with a quick attack and a gentle fade. */
function note(freq: number, at: number, dur = 0.35, vol = 0.08) {
  const c = context()
  if (!c || !isAudioEnabled()) return
  const t = c.currentTime + at
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** Counting scale: each block you count sounds a little higher, like climbing stairs. */
const COUNT_SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760]

export const sfx = {
  /** The i-th block being counted (0-based). */
  count(i: number) { note(COUNT_SCALE[i % COUNT_SCALE.length], 0, 0.25, 0.06) },
  /** Right answer: two rising bell notes. */
  correct() { note(1046.5, 0); note(1568, 0.08) },
  /** Wrong answer: one low, soft, short note (not a buzzer). */
  wrong() { note(392, 0, 0.18, 0.05) },
  /** A tiny pop: tiles, bubbles, stars. */
  pop() { note(1318.5, 0, 0.12, 0.06) },
  /** Combo: a quick rising sparkle. */
  combo() { [1046.5, 1318.5, 1568, 2093].forEach((f, i) => note(f, i * 0.06, 0.3, 0.06)) },
  /** Rocket launch / big win: a happy four-note fanfare. */
  fanfare() { [784, 1046.5, 1318.5, 1568].forEach((f, i) => note(f, i * 0.1, 0.45, 0.07)) },
}
