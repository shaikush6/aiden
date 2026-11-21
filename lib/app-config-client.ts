// The admin's app-wide settings on this device: fetched once when the app opens, and again after the admin saves.
import { DEFAULT_CONFIG, publicPart, type PublicConfig } from './app-config.ts'
import { applyDefaults } from './reading-quest/progress.ts'

const DEFAULTS = publicPart(DEFAULT_CONFIG)
let config: PublicConfig = DEFAULTS
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

export const getAppConfig = (): PublicConfig => config
export const getServerAppConfig = (): PublicConfig => DEFAULTS
export function subscribeAppConfig(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Use these settings on this device (and the voice and music defaults, unless the player chose their own). */
export function applyAppConfig(next: PublicConfig) {
  config = next
  applyDefaults({ narratorVoice: next.voice, music: next.music })
  listeners.forEach(fn => fn())
}

export function loadAppConfig(): Promise<void> {
  loading ??= (async () => {
    try {
      const res = await fetch('/api/config', { cache: 'no-store' })
      if (res.ok) applyAppConfig((await res.json()) as PublicConfig)
    } catch { /* offline: keep the defaults */ }
  })()
  return loading
}
