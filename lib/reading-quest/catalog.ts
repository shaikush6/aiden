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
