// Checks for profiles: merging must never lose progress, and the gate must only open for the right code.
import { checkPassword, checkUsername, normalizeUsername } from '../server/auth.ts'
import { QUOTA_USD, chatCost, realtimeCost, ttsCost } from '../server/quota.ts'
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
    quest: { v: 1, levels: { l1: { stars: 3, plays: 2 }, l2: { stars: 1, plays: 1 } }, sounds: { s: { right: 5, wrong: 1 } }, wordsRead: 40, unlockAll: false, settings: { music: false, narrator: true, narratorVoice: 'alloy', musicVolume: 0.3, voiceVolume: 1, duck: true }, celebratedWorlds: ['w1'], rocketBest: 20 },
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

  const placedOld = parseProfile({ prefs: { placed: true }, updatedAt: 1 })
  const placedNew = parseProfile({ prefs: { placed: false }, updatedAt: 999 })
  if (!mergeProfile(placedOld, placedNew).prefs.placed) err('the starting-point question came back after being answered')

  // Accounts.
  if (checkUsername('Aiden') !== null || normalizeUsername(' Aiden ') !== 'aiden') err('a normal username was refused or not normalized')
  if (checkUsername('a') === null || checkUsername('no spaces') === null || checkUsername('x'.repeat(30)) === null) err('a bad username was accepted')
  if (checkPassword('12345') === null || checkPassword('123456') !== null) err('password length rule is wrong')

  // Costs, against OpenAI list prices: a 3-second spoken line is a fraction of a cent,
  // a minute of Mimi talking is around 15 cents, and the quota lasts a long time.
  const line = ttsCost(48_000, 400)
  if (!(line > 0.0001 && line < 0.002)) err(`a short spoken line costs ${line} dollars`)
  const story = chatCost(300, 300)
  if (!(story > 0.001 && story < 0.01)) err(`a generated story costs ${story} dollars`)
  const minute = realtimeCost({ input_token_details: { audio_tokens: 600 }, output_token_details: { audio_tokens: 1200 } })
  if (!(minute > 0.05 && minute < 0.3)) err(`a minute of Mimi costs ${minute} dollars`)
  if (realtimeCost({ input_token_details: { audio_tokens: -5 } }) !== 0) err('negative usage was charged')
  if (QUOTA_USD !== 15) err('the quota should be 15 dollars')
  return errors
}
