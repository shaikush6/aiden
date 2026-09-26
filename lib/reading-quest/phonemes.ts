// Grapheme → default phoneme, and phoneme → audio source.
// Consonants, short vowels and most vowel teams use the pure-sound recordings in /public/phonics.
// The r-controlled sounds use spoken American audio, because the recordings are British and drop the "r".

import type { PhonemeKey } from './types.ts'

const DEFAULT_PHONEME: Record<string, PhonemeKey> = {
  // single letters
  a: 'a', b: 'b', c: 'k', d: 'd', e: 'e', f: 'f', g: 'g', h: 'h', i: 'i', j: 'j',
  k: 'k', l: 'l', m: 'm', n: 'n', o: 'o', p: 'p', r: 'r', s: 's', t: 't', u: 'u',
  v: 'v', w: 'w', x: 'ks', y: 'y', z: 'z',
  // doubles and consonant digraphs
  ff: 'f', ll: 'l', ss: 's', zz: 'z', ck: 'k', qu: 'kw',
  sh: 'sh', ch: 'ch', th: 'th', ng: 'ng', nk: 'nk',
  bb: 'b', dd: 'd', gg: 'g', mm: 'm', nn: 'n', pp: 'p', rr: 'r', tt: 't',
  wh: 'w', ph: 'f', kn: 'n', wr: 'r', tch: 'ch', dge: 'j', le: 'ul', ed: 'd', tion: 'shun',
  // long vowels
  ai: 'ai', ay: 'ai', a_e: 'ai', ea: 'ee', ee: 'ee', e_e: 'ee', ey: 'ee',
  igh: 'igh', ie: 'igh', i_e: 'igh', oa: 'oa', oe: 'oa', o_e: 'oa', u_e: 'yoo',
  // other vowel sounds
  oo: 'oo', ew: 'oo', ue: 'oo', ow: 'ow', ou: 'ow', oi: 'oi', oy: 'oi', aw: 'aw', au: 'aw',
  // r-controlled
  ar: 'ar', or: 'or', ore: 'or', er: 'er', ir: 'er', ur: 'er',
  air: 'air', are: 'air', ear: 'ear', eer: 'ear',
}

/** Placeholder phoneme for spellings that only appear as the tricky part of heart words (e.g. 'ough'). */
export const UNKNOWN_PHONEME = '?'

export function isKnownGrapheme(grapheme: string): boolean {
  return grapheme in DEFAULT_PHONEME
}

export function defaultPhoneme(grapheme: string): PhonemeKey {
  return DEFAULT_PHONEME[grapheme] ?? UNKNOWN_PHONEME
}

export function gpcId(grapheme: string, phoneme?: PhonemeKey): string {
  if (!phoneme || phoneme === defaultPhoneme(grapheme)) return grapheme
  return `${grapheme}=${phoneme}`
}

export type SoundSource =
  | { kind: 'file'; file: string }
  | { kind: 'seq'; parts: PhonemeKey[] }
  | { kind: 'tts'; text: string }

const SOURCES: Record<PhonemeKey, SoundSource> = {
  kw: { kind: 'file', file: 'qu' },
  ks: { kind: 'file', file: 'x' },
  k: { kind: 'file', file: 'c' },
  nk: { kind: 'seq', parts: ['ng', 'k'] },
  oo: { kind: 'file', file: 'ooo' },   // long oo, as in moon
  uu: { kind: 'file', file: 'oo' },    // short oo, as in book
  id: { kind: 'seq', parts: ['i', 'd'] },
  yoo: { kind: 'tts', text: 'you' },
  aw: { kind: 'tts', text: 'aw' },
  ar: { kind: 'tts', text: 'are' },
  or: { kind: 'tts', text: 'or' },
  er: { kind: 'tts', text: 'err' },
  air: { kind: 'tts', text: 'air' },
  ear: { kind: 'tts', text: 'ear' },
  ul: { kind: 'tts', text: 'ull' },
  shun: { kind: 'tts', text: 'shun' },
}

const FILE_PHONEMES = new Set([
  'a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u',
  'v', 'w', 'y', 'z', 'sh', 'ch', 'th', 'ng', 'ai', 'ee', 'igh', 'oa', 'ow', 'oi',
])

export function soundSource(p: PhonemeKey): SoundSource {
  if (SOURCES[p]) return SOURCES[p]
  if (FILE_PHONEMES.has(p)) return { kind: 'file', file: p }
  throw new Error(`No audio for phoneme "${p}"`)
}

/** Every text the voice may need to say for phonemes (for the audio allowlist). */
export function phonemeTtsTexts(): string[] {
  return Object.values(SOURCES).flatMap(s => (s.kind === 'tts' ? [s.text] : []))
}
