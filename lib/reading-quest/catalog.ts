// Derived, cumulative view of the curriculum: what has been taught by each level.
import { WORLDS } from './curriculum/index.ts'
import { gpcId } from './phonemes.ts'
import { parseSeg, parseWord } from './parse.ts'
import type { HeartWordDef, LevelDef, ParsedWord, WorldDef } from './types.ts'

export interface HeartWord {
  word: ParsedWord
  heart: number[]
  tip: string
}

export interface LevelInfo {
  def: LevelDef
  world: WorldDef
  worldIndex: number
  /** Position in the whole quest, 0-based. */
  index: number
  isBoss: boolean
  /** Sounds (grapheme-phoneme ids) taught up to and including this level. */
  taught: Set<string>
  /** Sound ids introduced by this level. */
  newGpcs: string[]
  /** Practice words, parsed. */
  words: ParsedWord[]
  /** Every real word the child can read by this level, keyed by lowercase text. */
  bank: Map<string, ParsedWord>
  /** Heart words introduced in this level. */
  newHeart: HeartWord[]
  /** Every heart word taught up to and including this level. */
  heart: Map<string, HeartWord>
  aliens: ParsedWord[]
  /** Number words the child can read by this level (for Block Buddies). */
  numberWords: { word: ParsedWord; value: number }[]
  /** Decodable number stories (one adding, one taking away), when the words allow. */
  sums: StorySum[]
}

export interface StorySum {
  text: string
  question: 'now' | 'left'
  a: number
  b: number
  answer: number
  /** Picture scene, e.g. "5🐱 on 🪵". */
  scene: string
  /** Words used in the story that are not in the bank (plurals), for tap-for-help. */
  extra: ParsedWord[]
}

const NUMBER_WORDS: [string, number][] = [
  ['one', 1], ['two', 2], ['three', 3], ['four', 4], ['five', 5],
  ['six', 6], ['seven', 7], ['eight', 8], ['nine', 9], ['ten', 10],
]

/** Every number word, for counting aloud 1-10 (these are pre-approved for the voice). */
export const COUNTING_WORDS = NUMBER_WORDS.map(([w]) => w)

const SUM_ANIMALS: [string, string][] = [
  ['cat', '🐱'], ['dog', '🐶'], ['pig', '🐷'], ['hen', '🐔'], ['bug', '🐛'], ['duck', '🦆'], ['frog', '🐸'],
  ['rat', '🐀'], ['bat', '🦇'], ['cub', '🐻'], ['goat', '🐐'], ['seal', '🦭'], ['cow', '🐄'], ['bird', '🐦'],
]
const SUM_PLACES: [string, string][] = [
  ['log', '🪵'], ['rock', '🪨'], ['bed', '🛏️'], ['bus', '🚌'], ['hill', '⛰️'], ['boat', '🚤'], ['tree', '🌳'],
]
const SUM_WORDS = ['sit', 'on', 'the', 'get', 'it', 'run', 'off']
const UNVOICED_END = new Set(['p', 't', 'k', 'f', 'th'])

function hasWord(bank: Map<string, ParsedWord>, heart: Map<string, HeartWord>, key: string) {
  return bank.has(key) || heart.has(key)
}

/** "cat" → "cats" (s) and "dog" → "dogs" (s says z), only if that plural is decodable yet. */
function plural(base: ParsedWord, taught: Set<string>): ParsedWord | null {
  const last = base.units[base.units.length - 1]
  if (!last || ['s', 'z', 'ks', 'sh', 'ch', 'j'].includes(last.phoneme)) return null
  const ending = UNVOICED_END.has(last.phoneme) ? 's' : 's=z'
  if (!taught.has(ending)) return null
  return parseSeg(`${base.seg}.${ending}`)
}

function buildSums(index: number, bank: Map<string, ParsedWord>, heart: Map<string, HeartWord>, taught: Set<string>): StorySum[] {
  if (!SUM_WORDS.every(w => hasWord(bank, heart, w))) return []
  const pick = <T,>(list: T[], offset: number, ok: (t: T) => boolean) => {
    for (let i = 0; i < list.length; i++) { const t = list[(offset + i) % list.length]; if (ok(t)) return t }
    return null
  }
  const animal = pick(SUM_ANIMALS, index, ([w]) => { const b = bank.get(w); return Boolean(b && plural(b, taught)) })
  const place = pick(SUM_PLACES, index * 3, ([w]) => bank.has(w))
  if (!animal || !place) return []
  const pl = plural(bank.get(animal[0])!, taught)!
  // b is at least 2 (so the plural reads right) and a + b is at most 10 (one Block Buddy).
  const a = 4 + (index % 4)
  const b = 2 + (index % 2)
  const opening = `${a} ${pl.text} sit on the ${place[0]}.`
  return [
    { text: `${opening} ${b} ${pl.text} get on it.`, question: 'now', a, b, answer: a + b, scene: `${a}${animal[1]} on ${place[1]}`, extra: [pl] },
    { text: `${opening} ${b} ${pl.text} run off.`, question: 'left', a, b, answer: a - b, scene: `${a}${animal[1]} on ${place[1]}`, extra: [pl] },
  ]
}

export function parseHeart(def: HeartWordDef): HeartWord {
  return { word: parseSeg(def.seg, undefined, def.say), heart: def.heart, tip: def.tip }
}

function build(): LevelInfo[] {
  const out: LevelInfo[] = []
  const taught = new Set<string>()
  const bank = new Map<string, ParsedWord>()
  const heart = new Map<string, HeartWord>()

  WORLDS.forEach((world, worldIndex) => {
    for (const def of world.levels) {
      const newGpcs = def.sounds.map(s => gpcId(s.g, s.p))
      newGpcs.forEach(g => taught.add(g))

      const words = def.words.map(parseWord)
      const extras = (def.extra ?? []).map(parseWord)
      for (const pw of [...words, ...extras]) {
        const key = pw.text.toLowerCase()
        if (!bank.has(key)) bank.set(key, pw)
      }
      const newHeart = (def.heart ?? []).map(parseHeart)
      newHeart.forEach(h => heart.set(h.word.text.toLowerCase(), h))

      out.push({
        def, world, worldIndex, index: out.length,
        isBoss: Boolean(def.story),
        taught: new Set(taught),
        newGpcs,
        words,
        bank: new Map(bank),
        newHeart,
        heart: new Map(heart),
        aliens: (def.aliens ?? []).map(seg => parseSeg(seg)),
        numberWords: NUMBER_WORDS.flatMap(([w, value]) => {
          const found = bank.get(w) ?? heart.get(w)?.word
          return found ? [{ word: found, value }] : []
        }),
        sums: buildSums(out.length, bank, heart, taught),
      })
    }
  })
  return out
}

export const LEVELS: LevelInfo[] = build()

const BY_ID = new Map(LEVELS.map(l => [l.def.id, l]))

export function getLevel(id: string): LevelInfo | undefined {
  return BY_ID.get(id)
}

/** Split sentence text into display tokens, keeping punctuation attached for display. */
export function tokenize(text: string): { display: string; key: string }[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map(display => ({ display, key: display.toLowerCase().replace(/[^a-z0-9]/g, '') }))
}

/** Look up a sentence token as a readable word (regular or heart). */
export function lookupWord(level: LevelInfo, key: string): { word: ParsedWord; heart?: HeartWord } | null {
  const h = level.heart.get(key)
  if (h) return { word: h.word, heart: h }
  const w = level.bank.get(key)
  return w ? { word: w } : null
}
