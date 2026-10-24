// Checks for profiles: merging must never lose progress, and the gate must only open for the right code.
import { findInvite, invites, normalizeCode } from '../server/profile-auth.ts'
import { parseProfile } from './data.ts'
import { mergeProfile, type ProfileData } from './merge.ts'

/** Same progress, whatever order the keys and the unordered lists came out in. */
function canon(p: ProfileData): string {
  const sorted = (xs: string[]) => [...xs].sort()
  const copy: ProfileData = {
    ...p,
    quest: { ...p.quest, celebratedWorlds: sorted(p.quest.celebratedWorlds) },
    land: { ...p.land, signs: sorted(p.land.signs), celebratedTowns: sorted(p.land.celebratedTowns) },
    blaster: { ...p.blaster, unlocked: sorted(p.blaster.unlocked) },
  }
  return JSON.stringify(copy, (_, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([x], [y]) => x.localeCompare(y))) : v))
}

export function validateProfiles(): string[] {
  const errors: string[] = []
  const err = (m: string) => errors.push(`profile: ${m}`)

  const blank = parseProfile(null)
  const a: ProfileData = parseProfile({
    quest: { v: 1, levels: { l1: { stars: 3, plays: 2 }, l2: { stars: 1, plays: 1 } }, sounds: { s: { right: 5, wrong: 1 } }, wordsRead: 40, unlockAll: false, settings: { music: false, narrator: true, narratorVoice: 'verse', musicVolume: 0.3, voiceVolume: 1, duck: true }, celebratedWorlds: ['w1'], rocketBest: 20 },
    land: { v: 2, levels: { n1: { stars: 2, plays: 1 } }, buddies: [1, 2], signs: ['+'], wordsRead: 3, numbers: { 2: { right: 1, wrong: 0 } }, rocketBest: 15, celebratedTowns: [], unlockAll: false },
    blaster: { highScore: 900, unlocked: ['blaster', 'spread'], zoneStars: [3, 1] },
    prefs: { avatar: '🐯' },
    updatedAt: 100,
  })
  const b: ProfileData = parseProfile({
    quest: { v: 1, levels: { l1: { stars: 1, plays: 4 }, l3: { stars: 2, plays: 1 } }, sounds: {}, wordsRead: 90, unlockAll: true, settings: { music: true, narrator: false, narratorVoice: 'ash', musicVolume: 0.8, voiceVolume: 0.6, duck: false }, celebratedWorlds: ['w2'], rocketBest: 12 },
    land: { v: 2, levels: { n2: { stars: 3, plays: 1 } }, buddies: [2, 3], signs: ['−'], wordsRead: 1, numbers: {}, rocketBest: null, celebratedTowns: ['t1'], unlockAll: false },
    blaster: { highScore: 400, unlocked: ['blaster', 'plasma'], zoneStars: [1, 3, 2] },
    prefs: { avatar: '🦁' },
    updatedAt: 200,
  })

  const ab = mergeProfile(a, b)
  const ba = mergeProfile(b, a)
  if (canon(ab) !== canon(ba)) err('merging is not the same in both directions')
  if (canon(mergeProfile(ab, ab)) !== canon(ab)) err('merging twice changes the result')
  if (ab.quest.levels.l1.stars !== 3 || ab.quest.levels.l1.plays !== 4) err('a level lost stars or plays')
  if (!ab.quest.levels.l2 || !ab.quest.levels.l3) err('a finished level went missing')
  if (ab.quest.wordsRead !== 90 || ab.quest.rocketBest !== 12) err('best numbers were not kept')
  if (!ab.quest.unlockAll) err('unlock-all was lost')
  if (ab.quest.celebratedWorlds.length !== 2) err('celebrations were lost')
  if (!ab.quest.settings.music || ab.quest.settings.narrator) err('the newer settings should win')
  if (ab.land.buddies.join() !== '1,2,3' || ab.land.signs.length !== 2) err('buddies or signs were lost')
  if (ab.blaster.highScore !== 900 || ab.blaster.unlocked.length !== 3 || ab.blaster.zoneStars.join() !== '3,3,2') err('space game progress was lost')
  if (ab.prefs.avatar !== '🦁') err('the newer avatar should win')
  if (JSON.stringify(mergeProfile(a, blank).quest.levels) !== JSON.stringify(a.quest.levels)) err('an empty profile changed real progress')

  // Hostile or broken data must come out as a valid profile.
  const junk = parseProfile({ quest: { v: 1, levels: { x: { stars: 'lots' } }, wordsRead: 'many' }, land: 5, blaster: { highScore: -4, unlocked: [3] }, prefs: { avatar: '💣' } })
  if (Object.keys(junk.quest.levels).length) err('a broken level got through')
  if (junk.prefs.avatar !== '🦊' || junk.blaster.highScore !== 0) err('broken prefs or score got through')

  // The gate.
  const list = invites('aiden:K7M2-9QXP-W4TH, maya:ABCD1234EFGH, bad name:SHORT1, x:tiny')
  if (list.length !== 2) err(`invite list should have 2 valid entries, got ${list.length}`)
  if (findInvite('k7m2 9qxp w4th', list)?.name !== 'aiden') err('the right code should open the gate, ignoring case and dashes')
  if (findInvite('K7M29QXPW4TX', list)) err('a code that is one letter wrong opened the gate')
  if (findInvite('', list) || findInvite(null, list)) err('an empty code opened the gate')
  if (invites('').length !== 0) err('no invites should mean no gate')
  if (normalizeCode(' ab-12 ') !== 'AB12') err('code normalizing is wrong')
  return errors
}
