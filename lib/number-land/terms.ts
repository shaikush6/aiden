// The little pictures Number Land is built from. A "term" is one thing on the screen: a Block Buddy,
// a numeral, a sign like + or =, a row of animals. Lessons and questions are just lists of terms,
// so every screen is drawn the same way and everything on it can be tapped for an explanation.

export type Sign = '+' | '−' | '=' | '<' | '>'

export type ClueKind = 'more' | 'less' | 'odd' | 'even' | 'onemore'

export type Fx = 'pairs' | 'leftover' | 'glow'

export type Term =
  /** A Block Buddy: the number as a stack of blocks. */
  | { t: 'buddy'; n: number; fx?: Fx; asleep?: boolean }
  /** The number written as a numeral, like 7. */
  | { t: 'num'; n: number; fx?: Fx }
  | { t: 'sign'; s: Sign; fx?: Fx }
  /** The mystery spot the child fills in. */
  | { t: 'blank' }
  /** A row of the same picture, like three frogs. */
  | { t: 'items'; emoji: string; n: number; faded?: number }
  /** A number word or math word, with sound buttons. */
  | { t: 'word'; text: string }
  /** A small label such as "or" or "makes". */
  | { t: 'text'; text: string }
  /** A riddle clue card, drawn as a picture: "? > 3", "? < 6", "? is odd". */
  | { t: 'clue'; text: string; kind: ClueKind; n: number }
  /** The numbers from..to, with some crossed out (riddle lesson). */
  | { t: 'strip'; from: number; to: number; out: number[]; glow?: number[] }

/** An answer card. */
export type Option =
  | { t: 'num'; n: number }
  | { t: 'buddy'; n: number }
  | { t: 'sign'; s: Sign }
  | { t: 'word'; text: string; icon?: string }

export const optionKey = (o: Option): string => {
  switch (o.t) {
    case 'num': case 'buddy': return `${o.t}${o.n}`
    case 'sign': return `sign${o.s}`
    case 'word': return `word${o.text}`
  }
}

/** The lessons a child can be taught, and can ask to be taught again. */
export type Topic =
  | 'numerals' | 'plus' | 'equals' | 'minus' | 'compare' | 'signs' | 'oddEven' | 'teen'
  | 'next' | 'skip' | 'double' | 'bond' | 'riddle' | 'story' | 'words'

/** Which signs a lesson introduces. */
export const TOPIC_SIGNS: Partial<Record<Topic, Sign[]>> = {
  plus: ['+'], equals: ['='], minus: ['−'], signs: ['<', '>'],
}

export const SIGN_TOPIC: Record<Sign, Topic> = { '+': 'plus', '−': 'minus', '=': 'equals', '<': 'signs', '>': 'signs' }

export const SIGN_NAME: Record<Sign, string> = {
  '+': 'plus', '−': 'minus', '=': 'equals', '<': 'less than', '>': 'more than',
}
