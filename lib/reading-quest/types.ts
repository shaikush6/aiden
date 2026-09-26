// Reading Quest — shared types.
// Content is authored as small segmentation strings, e.g. 'sh.i.p', 'c.a_e.k', 'r.a.b|b.i.t'.
//   '.'  separates graphemes (one sound each)
//   '|'  separates syllables
//   'x_e' is a split digraph (magic e): the 'e' is written after the next grapheme
//   'ow=oa' means grapheme 'ow' making the 'oa' sound (an alternative pronunciation)

export type PhonemeKey = string

/** A word as authored in the curriculum. */
export interface WordDef {
  seg: string
  emoji?: string
  /** What the voice should say, when the spelling alone is ambiguous for text-to-speech. */
  say?: string
}

/** One sound (grapheme-phoneme pair) introduced by a level. */
export interface SoundDef {
  /** Grapheme as written: 's', 'sh', 'a_e', 'ow' */
  g: string
  /** Phoneme key, only when it differs from the grapheme's default sound. */
  p?: PhonemeKey
  /** Spoken teaching line, e.g. "s says sss, like a hissing snake." */
  tip: string
  /** Picture that anchors the sound. */
  emoji: string
}

export interface HeartWordDef {
  seg: string
  /** Indexes of graphemes (in seg order) that are the "tricky" heart part. */
  heart: number[]
  /** Spoken explanation of the tricky part. */
  tip: string
  say?: string
}

export type SentenceDef =
  | { t: string; yes: boolean }                       // silly yes/no question
  | { t: string; pic: string; alts: [string, string] } // read and pick the matching picture

export interface StoryQuestion {
  ask: string
  options: [string, string, string]
  /** Index into options */
  answer: 0 | 1 | 2
}

export interface StoryDef {
  title: string
  pages: { t: string; pic: string }[]
  questions: StoryQuestion[]
}

export interface AnimalDef {
  emoji: string
  name: string
  /** Rescue setup, spoken at level start. */
  rescue: string
  /** Science fact, spoken on the creature card. */
  fact: string
  /** Big number shown on the card, e.g. "3 hearts". */
  stat: string
}

export interface LevelDef {
  id: string
  title: string
  animal: AnimalDef
  sounds: SoundDef[]
  words: WordDef[]
  /** Decodable words that appear in sentences or stories but are not practice words. */
  extra?: WordDef[]
  heart?: HeartWordDef[]
  /** Nonsense ("alien") words for pure decoding practice. */
  aliens?: string[]
  sentences: SentenceDef[]
  story?: StoryDef
}

export interface WorldDef {
  id: string
  name: string
  emoji: string
  habitat: string
  /** Tailwind gradient classes for the world theme. */
  theme: string
  intro: string
  /** One-line summary for the parent view. */
  skill: string
  levels: LevelDef[]
}

// ---------- Parsed forms ----------

export interface Unit {
  grapheme: string       // 'sh', 'a_e'
  phoneme: PhonemeKey    // 'sh', 'ai'
  gpc: string            // 'sh' or 'ow=oa'
  chunks: number[]       // indexes into ParsedWord.chunks
}

export interface Chunk {
  text: string
  unit: number
  syllable: number
}

export interface ParsedWord {
  text: string
  seg: string
  emoji?: string
  say: string
  chunks: Chunk[]
  units: Unit[]
  syllables: number
}
