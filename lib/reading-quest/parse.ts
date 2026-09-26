import { defaultPhoneme, gpcId } from './phonemes.ts'
import type { Chunk, ParsedWord, Unit, WordDef } from './types.ts'

const SPLIT = /^([a-z])_e$/

/** Parse a segmentation string like 'c.a_e.k' or 'r.a.b|b.i.t' into sound units and written chunks. */
export function parseSeg(seg: string, emoji?: string, say?: string): ParsedWord {
  const chunks: Chunk[] = []
  const units: Unit[] = []
  const syllables = seg.split('|')
  let pendingE: number | null = null

  syllables.forEach((syl, sIdx) => {
    for (const token of syl.split('.')) {
      if (!token) throw new Error(`Empty grapheme in "${seg}"`)
      const [grapheme, forced] = token.split('=')
      const phoneme = forced ?? defaultPhoneme(grapheme)
      const unitIdx = units.length
      const unit: Unit = { grapheme, phoneme, gpc: gpcId(grapheme, forced), chunks: [] }
      units.push(unit)

      const split = SPLIT.exec(grapheme)
      const written = split ? split[1] : grapheme
      unit.chunks.push(chunks.length)
      chunks.push({ text: written, unit: unitIdx, syllable: sIdx })

      if (pendingE !== null) {
        units[pendingE].chunks.push(chunks.length)
        chunks.push({ text: 'e', unit: pendingE, syllable: sIdx })
        pendingE = null
      }
      if (split) pendingE = unitIdx
    }
  })
  if (pendingE !== null) throw new Error(`Split digraph needs a letter after it in "${seg}"`)
  // The pronoun I is always written as a capital letter.
  if (seg === 'i=igh') chunks[0].text = 'I'

  const text = chunks.map(c => c.text).join('')
  return { text, seg, emoji, say: say ?? text, chunks, units, syllables: syllables.length }
}

export function parseWord(def: WordDef): ParsedWord {
  return parseSeg(def.seg, def.emoji, def.say)
}

/** Plain text of a segmentation string without building the full structure. */
export function segText(seg: string): string {
  return parseSeg(seg).text
}
