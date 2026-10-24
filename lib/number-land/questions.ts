// Builds one question of each kind. Every builder is pure: give it the numbers and a random function.
// The pictures (prompt, hint, solved) and the spoken lines all come from here, so the screen and the
// voice can never disagree.
import { MAX_NUMBER, ANIMALS, NUMBER_TEXT, type Animal } from './words.ts'
import { RIDDLE_QUESTION, clueFits, type Riddle } from './riddles.ts'
import type { ChooseStep } from './steps.ts'
import type { Option, Sign, Term } from './terms.ts'
import * as sp from './speech.ts'

export type Rand = () => number

/** Random numbers, plus the smallest and biggest number he has met (a wrong answer must never be a number he has not seen). */
export interface Ctx { rand: Rand; min: number; max: number }

export function shuffle<T>(arr: T[], rand: Rand): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const randInt = (lo: number, hi: number, rand: Rand): number => lo + Math.floor(rand() * (hi - lo + 1))
export const pick = <T>(list: T[], rand: Rand): T => list[Math.floor(rand() * list.length)]

const buddy = (n: number, fx?: 'pairs' | 'leftover' | 'glow'): Term => ({ t: 'buddy', n, fx })
const num = (n: number, fx?: 'glow'): Term => ({ t: 'num', n, fx })
const sign = (s: Sign): Term => ({ t: 'sign', s })
const text = (t: string): Term => ({ t: 'text', text: t })
const BLANK: Term = { t: 'blank' }

/**
 * The right number plus close-by wrong ones, shuffled. `lure` numbers (like the two numbers being added)
 * are tempting wrong answers, so they are used first.
 */
export function numberChoices(answer: number, ctx: Ctx, opts: { count?: number; min?: number; max?: number; lure?: number[] } = {}): number[] {
  const { rand } = ctx
  const { count = 3, lure = [] } = opts
  const min = Math.max(opts.min ?? 0, ctx.min)
  const max = Math.min(opts.max ?? MAX_NUMBER, ctx.max)
  const ok = (x: number) => x >= min && x <= max && x !== answer
  const picked: number[] = []
  const add = (x: number) => { if (ok(x) && !picked.includes(x) && picked.length < count - 1) picked.push(x) }
  shuffle(lure, rand).forEach(add)
  shuffle([answer - 1, answer + 1], rand).forEach(add)
  shuffle([answer - 2, answer + 2, answer - 3, answer + 3], rand).forEach(add)
  for (let x = min; picked.length < count - 1 && x <= max; x++) add(x)
  return shuffle([answer, ...picked], rand)
}

const asNums = (ns: number[]): Option[] => ns.map(n => ({ t: 'num', n }))
const asBuddies = (ns: number[]): Option[] => ns.map(n => ({ t: 'buddy', n }))
const indexOfNum = (opts: Option[], n: number): number => opts.findIndex(o => (o.t === 'num' || o.t === 'buddy') && o.n === n)

// ---------- meeting numbers on the screen ----------

/** Tap the Block Buddy that matches a numeral. */
export function numeralToBuddy(n: number, ctx: Ctx): ChooseStep {
  const options = asBuddies(numberChoices(n, ctx, { min: n === 0 ? 0 : 1, max: Math.min(MAX_NUMBER, Math.max(n + 3, 5)) }))
  return {
    kind: 'choose', topic: 'numerals', say: [sp.buddyOfAsk(n)], ask: sp.buddyOfAsk(n),
    prompt: [num(n)], options, answer: indexOfNum(options, n),
    solved: [num(n), buddy(n)], told: sp.numberTold(n), numbers: [n], words: 0,
  }
}

/** Count the blocks, then tap the numeral. */
export function buddyToNumeral(n: number, ctx: Ctx): ChooseStep {
  const options = asNums(numberChoices(n, ctx, { min: n === 0 ? 0 : 1, max: Math.min(MAX_NUMBER, Math.max(n + 3, 5)) }))
  return {
    kind: 'choose', topic: 'numerals', say: [sp.numberOfAsk], ask: sp.numberOfAsk,
    prompt: [buddy(n)], options, answer: indexOfNum(options, n),
    solved: [buddy(n), num(n)], told: sp.numberTold(n), numbers: [n], words: 0,
  }
}

export function countStep(n: number, ctx: Ctx): { kind: 'count'; animal: Animal; n: number; options: number[] } {
  const { rand } = ctx
  return { kind: 'count', animal: pick(ANIMALS, rand), n, options: numberChoices(n, ctx, { min: 0, max: Math.min(MAX_NUMBER, Math.max(n + 3, 5)) }) }
}

// ---------- adding and taking away ----------

/** Shows "makes" until the equals sign has been taught. */
const equalsTerm = (useEquals: boolean): Term => (useEquals ? sign('=') : text('makes'))

export function addStep(a: number, b: number, o: { pictures: boolean; useEquals: boolean; max: number }, ctx: Ctx): ChooseStep {
  const c = a + b
  const shape = (n: number) => (o.pictures ? buddy(n) : num(n))
  const options = asNums(numberChoices(c, ctx, { min: 1, max: Math.min(MAX_NUMBER, Math.max(o.max, c + 2)), lure: [a, b] }))
  return {
    kind: 'choose', topic: 'plus', say: [sp.addAsk(a, b)], ask: sp.addAsk(a, b),
    prompt: [shape(a), sign('+'), shape(b), equalsTerm(o.useEquals), BLANK],
    hint: o.pictures ? undefined : [buddy(a), sign('+'), buddy(b)],
    options, answer: indexOfNum(options, c),
    solved: [shape(a), sign('+'), shape(b), equalsTerm(o.useEquals), o.pictures ? buddy(c) : num(c)],
    told: sp.sumTold('plus', a, b, c), numbers: [c], words: 0,
  }
}

export function subStep(a: number, b: number, o: { pictures: boolean; max: number }, ctx: Ctx): ChooseStep {
  const c = a - b
  const shape = (n: number) => (o.pictures ? buddy(n) : num(n))
  const options = asNums(numberChoices(c, ctx, { min: 0, max: Math.min(MAX_NUMBER, Math.max(o.max, a)), lure: [a, b] }))
  return {
    kind: 'choose', topic: 'minus', say: [sp.subAsk(a, b)], ask: sp.subAsk(a, b),
    prompt: [shape(a), sign('−'), shape(b), sign('='), BLANK],
    hint: o.pictures ? undefined : [buddy(a), sign('−'), buddy(b)],
    options, answer: indexOfNum(options, c),
    solved: [shape(a), sign('−'), shape(b), sign('='), o.pictures ? buddy(c) : num(c)],
    told: sp.sumTold('minus', a, b, c), numbers: [c], words: 0,
  }
}

/** Five plus what makes eight? */
export function missingStep(a: number, c: number, ctx: Ctx): ChooseStep {
  const b = c - a
  const options = asNums(numberChoices(b, ctx, { min: 1, max: Math.min(MAX_NUMBER, Math.max(c, 5)), lure: [a, c] }))
  return {
    kind: 'choose', topic: 'equals', say: [sp.missingAsk(a, c)], ask: sp.missingAsk(a, c),
    prompt: [num(a), sign('+'), BLANK, sign('='), num(c)],
    hint: [buddy(a), sign('+'), text('?'), sign('='), buddy(c)],
    options, answer: indexOfNum(options, b),
    solved: [num(a), sign('+'), num(b), sign('='), num(c)],
    told: sp.sumTold('plus', a, b, c), numbers: [b], words: 0,
  }
}

// ---------- comparing ----------

export function moreStep(a: number, b: number, ask: 'more' | 'less', ctx: Ctx): ChooseStep {
  const { rand } = ctx
  const winner = ask === 'more' ? Math.max(a, b) : Math.min(a, b)
  const pictures = Math.max(a, b) <= 10
  const shape = (n: number, glow: boolean): Term => (pictures ? buddy(n, glow ? 'glow' : undefined) : num(n, glow ? 'glow' : undefined))
  const options = shuffle(asNums([a, b]), rand)
  return {
    kind: 'choose', topic: 'compare', say: [sp.moreAsk(a, b, ask)], ask: sp.moreAsk(a, b, ask),
    prompt: [shape(a, false), text('or'), shape(b, false)],
    hint: pictures ? undefined : [buddy(a), text('or'), buddy(b)],
    options, answer: indexOfNum(options, winner),
    solved: [shape(a, a === winner), text('or'), shape(b, b === winner)],
    told: sp.compareTold(a, b, ask), numbers: [winner], words: 0,
  }
}

/** Which sign goes between two numbers: the hungry mouth. */
export function signStep(a: number, b: number, ctx: Ctx): ChooseStep {
  const { rand } = ctx
  const right: Sign = a === b ? '=' : a > b ? '>' : '<'
  const signs: Sign[] = a === b ? ['<', '=', '>'] : ['<', '>']
  const options: Option[] = shuffle(signs, rand).map(s => ({ t: 'sign', s }))
  return {
    kind: 'choose', topic: 'signs', say: [sp.signAsk(a, b)], ask: sp.signAsk(a, b),
    prompt: [num(a), BLANK, num(b)],
    hint: [buddy(a), text('or'), buddy(b)],
    options, answer: options.findIndex(o => o.t === 'sign' && o.s === right),
    solved: [num(a), sign(right), num(b)],
    told: sp.signTold(a, b), numbers: [Math.max(a, b)], words: 0,
  }
}

export function oddEvenStep(n: number, ctx: Ctx): ChooseStep {
  const { rand } = ctx
  const even = n % 2 === 0
  const options: Option[] = shuffle<Option>([{ t: 'word', text: 'odd', icon: '1️⃣' }, { t: 'word', text: 'even', icon: '👯' }], rand)
  return {
    kind: 'choose', topic: 'oddEven', say: [sp.oddEvenAsk(n)], ask: sp.oddEvenAsk(n),
    prompt: [num(n), buddy(n)],
    hint: [buddy(n, even ? 'pairs' : 'leftover')],
    options, answer: options.findIndex(o => o.t === 'word' && o.text === (even ? 'even' : 'odd')),
    solved: [num(n), buddy(n, even ? 'pairs' : 'leftover')],
    told: sp.oddEvenTold(n), numbers: [n], words: 0,
  }
}

// ---------- number order ----------

export function nextStep(a: number, ctx: Ctx): ChooseStep {
  const c = a + 3
  const options = asNums(numberChoices(c, ctx, { min: 1, max: MAX_NUMBER, lure: [a + 2] }))
  return {
    kind: 'choose', topic: 'next', say: [sp.nextAsk(a)], ask: sp.nextAsk(a),
    prompt: [num(a), num(a + 1), num(a + 2), BLANK],
    options, answer: indexOfNum(options, c),
    solved: [num(a), num(a + 1), num(a + 2), num(c, 'glow')],
    told: sp.nextTold(a), numbers: [c], words: 0,
  }
}

export function beforeStep(n: number, ctx: Ctx): ChooseStep {
  const c = n - 1
  const options = asNums(numberChoices(c, ctx, { min: 0, max: MAX_NUMBER, lure: [n + 1] }))
  return {
    kind: 'choose', topic: 'next', say: [sp.beforeAsk(n)], ask: sp.beforeAsk(n),
    prompt: [BLANK, num(n), num(n + 1)],
    options, answer: indexOfNum(options, c),
    solved: [num(c, 'glow'), num(n), num(n + 1)],
    told: sp.beforeTold(n), numbers: [c], words: 0,
  }
}

export function betweenStep(a: number, ctx: Ctx): ChooseStep {
  const c = a + 1
  const options = asNums(numberChoices(c, ctx, { min: 0, max: MAX_NUMBER, lure: [a, a + 2] }))
  return {
    kind: 'choose', topic: 'next', say: [sp.betweenAsk(a)], ask: sp.betweenAsk(a),
    prompt: [num(a), BLANK, num(a + 2)],
    options, answer: indexOfNum(options, c),
    solved: [num(a), num(c, 'glow'), num(a + 2)],
    told: sp.betweenTold(a), numbers: [c], words: 0,
  }
}

export function skipStep(s: number, ctx: Ctx): ChooseStep {
  const c = 4 * s
  const options = asNums(numberChoices(c, ctx, { min: 1, max: MAX_NUMBER, lure: [3 * s + 1, 3 * s + s - 1].filter(x => x !== c) }))
  return {
    kind: 'choose', topic: 'skip', say: [sp.skipAsk(s)], ask: sp.skipAsk(s),
    prompt: [num(s), num(2 * s), num(3 * s), BLANK],
    options, answer: indexOfNum(options, c),
    solved: [num(s), num(2 * s), num(3 * s), num(c, 'glow')],
    told: sp.skipTold(s), numbers: [c], words: 0,
  }
}

// ---------- doubles, bonds, teens ----------

export function doubleStep(n: number, ctx: Ctx): ChooseStep {
  const c = 2 * n
  const options = asNums(numberChoices(c, ctx, { min: 2, max: MAX_NUMBER, lure: [n] }))
  return {
    kind: 'choose', topic: 'double', say: [sp.doubleAsk(n)], ask: sp.doubleAsk(n),
    prompt: [buddy(n), sign('+'), buddy(n), sign('='), BLANK],
    options, answer: indexOfNum(options, c),
    solved: [buddy(n), sign('+'), buddy(n), sign('='), buddy(c)],
    told: sp.doubleTold(n), numbers: [c], words: 0,
  }
}

/** a and what make t? */
export function bondStep(a: number, t: number, ctx: Ctx): ChooseStep {
  const b = t - a
  const options = asNums(numberChoices(b, ctx, { min: 1, max: Math.min(MAX_NUMBER, Math.max(t, 5)), lure: [a] }))
  return {
    kind: 'choose', topic: 'bond', say: [sp.bondAsk(a, t)], ask: sp.bondAsk(a, t),
    prompt: [buddy(a), sign('+'), BLANK, sign('='), buddy(t)],
    hint: [buddy(a), sign('+'), text('?'), sign('='), buddy(t)],
    options, answer: indexOfNum(options, b),
    solved: [buddy(a), sign('+'), buddy(b), sign('='), buddy(t)],
    told: sp.bondTold(a, b, t), numbers: [b], words: 0,
  }
}

export function teenSumStep(k: number, ctx: Ctx): ChooseStep {
  const c = 10 + k
  const options = asNums(numberChoices(c, ctx, { min: 11, max: MAX_NUMBER, lure: [10] }))
  return {
    kind: 'choose', topic: 'teen', say: [sp.teenAsk(k)], ask: sp.teenAsk(k),
    prompt: [num(10), sign('+'), num(k), sign('='), BLANK],
    hint: [buddy(c)],
    options, answer: indexOfNum(options, c),
    solved: [num(10), sign('+'), num(k), sign('='), num(c)],
    told: sp.teenSumTold(k), numbers: [c], words: 0,
  }
}

// ---------- riddles ----------

/** The numbers that survive all clues (the 🔍 hint crosses out the rest). */
export function riddleStep(r: Riddle, options: number[]): ChooseStep {
  const out: number[] = []
  const top = Math.max(r.hi, ...options)
  for (let n = 1; n <= top; n++) if (!r.clues.every(c => clueFits(c, n))) out.push(n)
  const cards: Term[] = r.clues.map(c => ({ t: 'clue', text: c.text, kind: c.kind, n: c.k }))
  return {
    kind: 'choose', topic: 'riddle', say: [...r.clues.map(c => c.text), RIDDLE_QUESTION], ask: RIDDLE_QUESTION,
    prompt: cards,
    hint: [{ t: 'strip', from: 1, to: top, out }],
    options: asNums(options), answer: options.indexOf(r.answer),
    solved: [...cards, text('so I am'), num(r.answer, 'glow')],
    told: sp.riddleTold(r.answer), numbers: [r.answer],
    words: r.clues.reduce((n, c) => n + sp.tokenKeys(c.text).length, 0),
  }
}

// ---------- reading ----------

export function wordNumStep(n: number, ctx: Ctx): ChooseStep {
  const options = asNums(numberChoices(n, ctx, { min: n === 0 ? 0 : 1, max: Math.min(MAX_NUMBER, Math.max(n + 3, 5)) }))
  return {
    kind: 'choose', topic: 'words', say: [sp.wordNumAsk], ask: sp.wordNumAsk,
    prompt: [{ t: 'word', text: NUMBER_TEXT[n] }],
    hint: [buddy(n)],
    options, answer: indexOfNum(options, n),
    solved: [{ t: 'word', text: NUMBER_TEXT[n] }, num(n), buddy(n)],
    told: sp.numberTold(n), numbers: [n], words: 1,
  }
}

export function wordSignStep(word: 'plus' | 'minus', ctx: Ctx): ChooseStep {
  const { rand } = ctx
  const want: Sign = word === 'plus' ? '+' : '−'
  const options: Option[] = shuffle<Option>([{ t: 'sign', s: '+' }, { t: 'sign', s: '−' }], rand)
  return {
    kind: 'choose', topic: word, say: [sp.wordSignAsk], ask: sp.wordSignAsk,
    prompt: [{ t: 'word', text: word }],
    options, answer: options.findIndex(o => o.t === 'sign' && o.s === want),
    solved: [{ t: 'word', text: word }, sign(want)],
    told: sp.wordSignTold(word), numbers: [], words: 1,
  }
}
