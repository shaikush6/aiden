// The reading lexicon for Block Buddy Land: number words 0-20, the math words, and the few
// everyday words the number stories use. Everything the child reads in Number Land comes from here,
// and the validator checks that nothing else sneaks into a sentence.
import { parseSeg } from '../reading-quest/parse.ts'
import type { ParsedWord } from '../reading-quest/types.ts'

export interface LexEntry {
  word: ParsedWord
  /** Indexes of the tricky (heart) sounds in the word. */
  heart: number[]
  /** Spoken teaching line, with /sound/ and [letter] markers. */
  tip: string
}

export type Demo = 'plus' | 'minus' | 'more' | 'less' | 'odd' | 'even'

interface Def { seg: string; heart?: number[]; tip: string; demo?: Demo }

const entry = (d: Def): LexEntry => ({ word: parseSeg(d.seg), heart: d.heart ?? [], tip: d.tip })

// ---------- number words, indexed by the number they name ----------

const NUMBER_DEFS: Def[] = [
  { seg: 'z.e.r.o', heart: [1, 3], tip: 'Zero is a heart word! It sounds like /z/ /ee/ /r/ /oa/: zero!' },
  { seg: 'o.n.e', heart: [0, 1, 2], tip: 'One is a heart word! It sounds like /w/ /u/ /n/: one!' },
  { seg: 't.wo', heart: [1], tip: 'Two is a heart word! The [w] is silent, and the [o] says /oo/: two!' },
  { seg: 'th.r.ee', tip: 'Three is made of /th/ /r/ /ee/. Sound it out: three!' },
  { seg: 'f.our', heart: [1], tip: 'Four is a heart word! The letters [o], [u] and [r] say /or/: four!' },
  { seg: 'f.i_e.v', tip: 'Five has a magic [e]! It makes the letter [i] say its name: /igh/. Five!' },
  { seg: 's.i.x', tip: 'Six: /s/ /i/ /ks/. Six!' },
  { seg: 's.e.v.e.n', tip: 'Seven: /s/ /e/ /v/ /e/ /n/. Seven!' },
  { seg: 'eigh.t', heart: [0], tip: 'Eight is a heart word! The letters [e], [i], [g] and [h] say /ai/: eight!' },
  { seg: 'n.i_e.n', tip: 'Nine has a magic [e]! It makes the letter [i] say its name: /igh/. Nine!' },
  { seg: 't.e.n', tip: 'Ten: /t/ /e/ /n/. Ten!' },
  { seg: 'e.l.e.v.e.n', heart: [0, 2, 4], tip: 'Eleven is a long heart word. Say it with me: e-lev-en!' },
  { seg: 't.w.e.l.v.e', heart: [5], tip: 'In the word twelve, the last [e] is silent: twelve!' },
  { seg: 'th.ir.t.ee.n', tip: 'Thirteen is three and ten, mixed up. /th/ /er/ /t/ /ee/ /n/: thirteen!' },
  { seg: 'f.our.t.ee.n', heart: [1], tip: 'Fourteen is four and ten. The letters [o], [u] and [r] say /or/: fourteen!' },
  { seg: 'f.i.f.t.ee.n', tip: 'Fifteen: /f/ /i/ /f/ /t/ /ee/ /n/. Fifteen!' },
  { seg: 's.i.x.t.ee.n', tip: 'Sixteen: /s/ /i/ /ks/ /t/ /ee/ /n/. Sixteen!' },
  { seg: 's.e.v.e.n.t.ee.n', tip: 'Seventeen is seven and ten. /s/ /e/ /v/ /e/ /n/ /t/ /ee/ /n/: seventeen!' },
  { seg: 'eigh.t.ee.n', heart: [0], tip: 'Eighteen is eight and ten. The letters [e], [i], [g] and [h] say /ai/: eighteen!' },
  { seg: 'n.i_e.n.t.ee.n', tip: 'Nineteen is nine and ten. Magic [e] makes the letter [i] say /igh/. Nineteen!' },
  { seg: 't.w.e.n.t.y=ee', tip: 'Twenty: /t/ /w/ /e/ /n/ /t/ /ee/. At the end, the letter [y] says /ee/: twenty!' },
]

export const MAX_NUMBER = NUMBER_DEFS.length - 1

export const NUMBER_ENTRIES: LexEntry[] = NUMBER_DEFS.map(entry)

/** Lowercase text of each number word: NUMBER_TEXT[7] is "seven". */
export const NUMBER_TEXT: string[] = NUMBER_ENTRIES.map(e => e.word.text)

export function numberWord(n: number): ParsedWord {
  return NUMBER_ENTRIES[n].word
}

export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

// ---------- math words (introduced by the journey) ----------

const MATH_DEFS: Record<string, Def> = {
  and: { seg: 'a.n.d', tip: 'And joins things together! /a/ /n/ /d/: and!' },
  is: { seg: 'i.s=z', tip: 'In the word is, the letter [s] says /z/: is!' },
  plus: { seg: 'p.l.u.s', tip: 'Plus means put them together! /p/ /l/ /u/ /s/: plus!', demo: 'plus' },
  minus: { seg: 'm.i.n.u.s', tip: 'Minus means take some away! /m/ /i/ /n/ /u/ /s/: minus!', demo: 'minus' },
  which: { seg: 'wh.i.ch', tip: 'In the word which, the letters [w] and [h] say /w/, and the letters [c] and [h] say /ch/: which!' },
  or: { seg: 'or', tip: 'The letters [o] and [r] together say /or/: or!' },
  more: { seg: 'm.ore', tip: 'More means a bigger number! The letters [o], [r] and [e] say /or/: more!', demo: 'more' },
  less: { seg: 'l.e.ss', tip: 'Less means a smaller number! /l/ /e/ /s/: less!', demo: 'less' },
  than: { seg: 'th.a.n', tip: 'Five is more than three. /th/ /a/ /n/: than!' },
  odd: { seg: 'o.dd', tip: 'Odd means one is left over! /o/ /d/: odd!', demo: 'odd' },
  even: { seg: 'e=ee.v.e.n', tip: 'Even means two equal sides, with nothing left over! The first [e] says /ee/: even!', demo: 'even' },
  who: { seg: 'wh.o', heart: [0, 1], tip: 'In the word who, the letters [w] and [h] say /h/, and the [o] says /oo/: who!' },
  am: { seg: 'a.m', tip: '/a/ /m/: am!' },
  i: { seg: 'i=igh', heart: [0], tip: 'The word I is just one letter. It is the letter [i], and it says its name: /igh/!' },
  how: { seg: 'h.ow', tip: '/h/ /ow/: how!' },
  many: { seg: 'm.a.n.y=ee', heart: [1, 3], tip: 'In the word many, the [a] says /e/, and the [y] says /ee/: many!' },
  now: { seg: 'n.ow', tip: '/n/ /ow/: now!' },
  are: { seg: 'are=ar', heart: [0], tip: 'Are is a heart word. It says /ar/: are!' },
  left: { seg: 'l.e.f.t', tip: '/l/ /e/ /f/ /t/: left!' },
}

export type MathWord = keyof typeof MATH_DEFS

export const MATH_WORDS: Record<string, LexEntry & { demo?: Demo }> = Object.fromEntries(
  Object.entries(MATH_DEFS).map(([k, d]) => [k, { ...entry(d), demo: d.demo }]),
)

// ---------- everyday words used in the number stories (assumed known) ----------

const BASE_DEFS: Def[] = [
  { seg: 'th.e', heart: [0, 1], tip: 'The is a heart word. We learn it by heart: the!' },
  { seg: 'o.n', tip: '/o/ /n/: on!' },
  { seg: 'o.ff', tip: '/o/ /f/: off!' },
  { seg: 's.i.t', tip: '/s/ /i/ /t/: sit!' },
  { seg: 'h.o.p', tip: '/h/ /o/ /p/: hop!' },
  { seg: 'r.u.n', tip: '/r/ /u/ /n/: run!' },
]

export interface Animal { key: string; seg: string; plural: string; emoji: string }
export interface Place { key: string; seg: string; emoji: string }

export const ANIMALS: Animal[] = [
  { key: 'cat', seg: 'c.a.t', plural: 'c.a.t.s', emoji: '🐱' },
  { key: 'dog', seg: 'd.o.g', plural: 'd.o.g.s=z', emoji: '🐶' },
  { key: 'pig', seg: 'p.i.g', plural: 'p.i.g.s=z', emoji: '🐷' },
  { key: 'hen', seg: 'h.e.n', plural: 'h.e.n.s=z', emoji: '🐔' },
  { key: 'bug', seg: 'b.u.g', plural: 'b.u.g.s=z', emoji: '🐛' },
  { key: 'frog', seg: 'f.r.o.g', plural: 'f.r.o.g.s=z', emoji: '🐸' },
  { key: 'duck', seg: 'd.u.ck', plural: 'd.u.ck.s', emoji: '🦆' },
  { key: 'rat', seg: 'r.a.t', plural: 'r.a.t.s', emoji: '🐀' },
  { key: 'bat', seg: 'b.a.t', plural: 'b.a.t.s', emoji: '🦇' },
  { key: 'cub', seg: 'c.u.b', plural: 'c.u.b.s=z', emoji: '🐻' },
]

export const PLACES: Place[] = [
  { key: 'log', seg: 'l.o.g', emoji: '🪵' },
  { key: 'rock', seg: 'r.o.ck', emoji: '🪨' },
  { key: 'bed', seg: 'b.e.d', emoji: '🛏️' },
  { key: 'bus', seg: 'b.u.s', emoji: '🚌' },
  { key: 'hill', seg: 'h.i.ll', emoji: '⛰️' },
]

/** Every readable word in Number Land, by lowercase text. */
export const LEXICON: Map<string, LexEntry> = (() => {
  const map = new Map<string, LexEntry>()
  const add = (e: LexEntry) => { map.set(e.word.text.toLowerCase(), e) }
  NUMBER_ENTRIES.forEach(add)
  Object.values(MATH_WORDS).forEach(add)
  BASE_DEFS.map(entry).forEach(add)
  for (const a of ANIMALS) {
    add({ word: parseSeg(a.seg), heart: [], tip: '' })
    add({ word: parseSeg(a.plural), heart: [], tip: '' })
  }
  for (const p of PLACES) add({ word: parseSeg(p.seg), heart: [], tip: '' })
  return map
})()

/** Words that are always allowed in sentences (everyday words, animals, places). */
export const BASE_KEYS: Set<string> = new Set([
  ...BASE_DEFS.map(d => entry(d).word.text.toLowerCase()),
  ...ANIMALS.flatMap(a => [a.key, parseSeg(a.plural).text.toLowerCase()]),
  ...PLACES.map(p => p.key),
])

export function lookupLexicon(key: string): { word: ParsedWord; heart: number[] } | null {
  const e = LEXICON.get(key)
  return e ? { word: e.word, heart: e.heart } : null
}
