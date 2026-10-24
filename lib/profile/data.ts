// Turning anything that comes from outside (the browser's storage, the cloud) into a valid profile.
import { parseProgress } from '../reading-quest/progress.ts'
import { parseNL } from '../number-land/progress.ts'
import { parseBlaster, parsePrefs, type ProfileData } from './merge.ts'

export function parseProfile(raw: unknown): ProfileData {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    quest: parseProgress(d.quest),
    land: parseNL(d.land),
    blaster: parseBlaster(d.blaster),
    prefs: parsePrefs(d.prefs),
    updatedAt: Number.isFinite(d.updatedAt) ? Math.max(0, d.updatedAt as number) : 0,
  }
}

/** Is there anything worth saving? (An untouched profile should not overwrite someone's real progress.) */
export function hasProgress(p: ProfileData): boolean {
  return Object.keys(p.quest.levels).length > 0 || Object.keys(p.land.levels).length > 0 || p.blaster.highScore > 0
}
