// Word bonds: split a word into its first sound(s) and the rest, like splitting a number into two parts.
//   c|at   sh|ip   fr|og   st|op
// This is the "onset and rime" skill, and it works on whatever words the child has already met in the Quest.
import type { ParsedWord } from '../reading-quest/types.ts'

const VOWEL_SOUNDS = new Set([
  'a', 'e', 'i', 'o', 'u', 'ai', 'ee', 'igh', 'oa', 'oo', 'uu', 'ow', 'oi', 'aw', 'ar', 'or', 'er', 'air', 'ear', 'yoo',
])

/**
 * How many sounds come before the vowel, or null when the word can't be split this way
 * (it starts with a vowel, has several syllables, or uses a split digraph like magic e).
 */
export function onsetSize(word: ParsedWord): number | null {
  if (word.syllables !== 1) return null
  if (word.chunks.length !== word.units.length) return null      // magic-e style words
  if (word.units.length < 3 || word.units.length > 6) return null
  const first = word.units.findIndex(u => VOWEL_SOUNDS.has(u.phoneme))
  return first >= 1 && first < word.units.length ? first : null
}

export const canSplit = (word: ParsedWord): boolean => onsetSize(word) !== null

export function splittableWords(bank: ParsedWord[]): ParsedWord[] {
  return bank.filter(canSplit)
}

type Rand = () => number

/**
 * Two words with different numbers of sounds. Where possible, the pair is one where counting LETTERS
 * would give the wrong answer ("ship" has 4 letters but 3 sounds), so he has to count sounds.
 */
export function pickSoundPair(bank: ParsedWord[], rand: Rand = Math.random): [ParsedWord, ParsedWord] | null {
  const pool = bank.filter(w => w.units.length >= 2 && w.units.length <= 6)
  if (pool.length < 2) return null
  const good: [ParsedWord, ParsedWord][] = []
  const any: [ParsedWord, ParsedWord][] = []
  // Search every pair: misleading ones are rare (about 1 in 200), so random sampling would miss them.
  for (const a of pool) {
    for (const b of pool) {
      const soundDiff = a.units.length - b.units.length
      if (a.text === b.text || soundDiff === 0 || Math.abs(soundDiff) > 3) continue
      const letterDiff = a.text.length - b.text.length
      ;(letterDiff !== 0 && letterDiff * soundDiff < 0 ? good : any).push([a, b])
    }
  }
  const choices = good.length ? good : any
  return choices.length ? choices[Math.floor(rand() * choices.length)] : null
}
