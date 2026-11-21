// Settings the admin sets once for everyone who uses the app (kept in the store, read by every device).
// This file is shared by the server and the browser, so it holds nothing secret.
import { DEFAULT_NARRATOR_VOICE, NARRATOR_VOICES, type NarratorVoice } from './reading-quest/narration.ts'

export const TAB_IDS = ['quest', 'phonics', 'patterns', 'math', 'solar', 'teacher', 'hebrew', 'prep'] as const
export type AppTab = (typeof TAB_IDS)[number]

export const THEMES = [
  { id: 'tabs', label: 'Each tab its own colour', swatch: 'from-lime-300 via-sky-300 to-fuchsia-300' },
  { id: 'sunset', label: 'Sunset', swatch: 'from-amber-200 via-orange-200 to-pink-200' },
  { id: 'ocean', label: 'Ocean', swatch: 'from-cyan-200 via-sky-200 to-blue-300' },
  { id: 'forest', label: 'Forest', swatch: 'from-lime-200 via-green-200 to-emerald-300' },
  { id: 'candy', label: 'Candy', swatch: 'from-pink-200 via-fuchsia-200 to-violet-300' },
] as const
export type ThemeId = (typeof THEMES)[number]['id']

export interface PublicConfig {
  /** Guide voice for players who have not picked one themselves. */
  voice: NarratorVoice
  /** Music on or off for players who have not switched it themselves. */
  music: boolean
  /** Tabs nobody sees (the admin still does, marked as hidden). */
  hiddenTabs: AppTab[]
  /** When false, the invite code stops working and nobody new can join. */
  signupsOpen: boolean
  theme: ThemeId
}

export interface AppConfig extends PublicConfig {
  /** Replaces the INVITE_CODE set in Vercel. Empty means "use the Vercel one". Never sent to players. */
  inviteCode: string
}

export const DEFAULT_CONFIG: AppConfig = {
  voice: DEFAULT_NARRATOR_VOICE, music: true, hiddenTabs: [], signupsOpen: true, theme: 'tabs', inviteCode: '',
}

/** Anything (saved text, a request body) into a valid config. Unknown values fall back to the defaults. */
export function parseConfig(raw: unknown): AppConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof AppConfig, unknown>>
  return {
    voice: NARRATOR_VOICES.some(v => v.id === r.voice) ? (r.voice as NarratorVoice) : DEFAULT_CONFIG.voice,
    music: typeof r.music === 'boolean' ? r.music : DEFAULT_CONFIG.music,
    hiddenTabs: Array.isArray(r.hiddenTabs) ? TAB_IDS.filter(t => (r.hiddenTabs as unknown[]).includes(t) && t !== 'quest') : [],
    signupsOpen: typeof r.signupsOpen === 'boolean' ? r.signupsOpen : DEFAULT_CONFIG.signupsOpen,
    theme: THEMES.some(t => t.id === r.theme) ? (r.theme as ThemeId) : DEFAULT_CONFIG.theme,
    inviteCode: typeof r.inviteCode === 'string' ? r.inviteCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 40) : '',
  }
}

export function publicPart(c: AppConfig): PublicConfig {
  return { voice: c.voice, music: c.music, hiddenTabs: c.hiddenTabs, signupsOpen: c.signupsOpen, theme: c.theme }
}
