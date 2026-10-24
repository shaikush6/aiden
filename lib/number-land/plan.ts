// Turns a level's recipe into the concrete activities for one play. It is pure: pass in the word bank
// (the Quest words he has already met, for the word-splitting games) and, in tests, a seeded random function.
import type { ParsedWord } from '../reading-quest/types.ts'
import { MAX_NUMBER } from './words.ts'
import { knownNumbersAt, knownTopicsAt, levelIndex, type NLevel } from './curriculum.ts'
import { makeClue, makeRiddle, riddleOptions } from './riddles.ts'
import { makeStory } from './stories.ts'
import { canSplit, pickSoundPair } from './word-bonds.ts'
import { SKIP_STEPS, SUM_MAX, tokenKeys } from './speech.ts'
import * as q from './questions.ts'
import { isNScored, type NStep } from './steps.ts'

export type { NStep }
export { isNScored }

type Rand = q.Rand

/** How many words the child reads in a step, for the "words read" counter. */
export function nWordsInStep(s: NStep): number {
  switch (s.kind) {
    case 'choose': return s.words
    case 'story': return s.story.sentences.reduce((n, t) => n + tokenKeys(t).length, 0)
    case 'rocket': return s.from === 'word' ? s.rounds.length : 0
    case 'wordBond': case 'soundCompare': return 1
    default: return 0
  }
}

/** The numbers a step is "about", for the grown-up's "numbers to practise" view. */
export function nStepNumbers(s: NStep): number[] {
  switch (s.kind) {
    case 'choose': return s.numbers
    case 'count': case 'build': return [s.n]
    case 'story': return [s.story.answer]
    case 'rocket': return s.rounds.map(r => r.n)
    default: return []
  }
}

export function planNumberLevel(level: NLevel, bank: ParsedWord[], rand: Rand = Math.random): NStep[] {
  const idx = levelIndex(level.id)
  const known = knownNumbersAt(idx)
  const topics = knownTopicsAt(idx)
  const [lo, hi] = level.range
  const maxKnown = known.length ? Math.max(...known) : 0
  const pool = known.filter(n => n >= lo && n <= hi)
  const positive = pool.filter(n => n >= 1)
  // The level that introduces zero practises zero too.
  const practice = level.meets.includes(0) ? pool : positive
  const sumTop = Math.min(hi, SUM_MAX, maxKnown)
  const ctx: q.Ctx = { rand, min: known.includes(0) ? 0 : 1, max: Math.min(MAX_NUMBER, Math.max(maxKnown, 1)) }
  const splittable = q.shuffle(bank.filter(canSplit), rand)

  // New buddies are practised first, then anything in range, never the same number twice in a row.
  const fresh = [...level.meets, ...level.meets]
  let last = -1
  const nextN = (from: number[]): number => {
    const cand = fresh.find(n => from.includes(n))
    if (cand !== undefined) {
      fresh.splice(fresh.indexOf(cand), 1)
      return (last = cand)
    }
    const choices = from.filter(n => n !== last)
    const list = choices.length ? choices : from
    return (last = q.pick(list, rand))
  }

  const steps: NStep[] = []
  const used = new Set<string>()
  const unused = (key: string): boolean => !used.has(key)
  const mark = (key: string) => { used.add(key) }
  let matches = 0
  let stories = 0
  let bonds = 0
  let skips = 0
  let wordSigns = 0
  let wordNums = q.shuffle(pool, rand)

  level.meets.forEach(n => steps.push({ kind: 'meet', n }))
  level.learn.forEach(topic => steps.push({ kind: 'learn', topic }))

  const useEquals = topics.has('equals')

  for (const token of level.plan) {
    switch (token) {
      case 'numMatch': {
        const n = nextN(practice)
        // He sees the blocks and picks the numeral first; later the numeral is the clue.
        steps.push(matches++ % 2 === 0 ? q.buddyToNumeral(n, ctx) : q.numeralToBuddy(n, ctx))
        break
      }
      case 'count':
        steps.push(q.countStep(nextN(practice), ctx))
        break
      case 'build':
        steps.push({ kind: 'build', n: nextN(positive) })
        break
      case 'rocket': case 'rocketWord': {
        const source = positive
        const rounds = Array.from({ length: 6 }, () => {
          const n = q.pick(source, rand)
          const other = q.numberChoices(n, ctx, { min: 1, max: Math.min(MAX_NUMBER, Math.max(maxKnown, 5)) }).find(x => x !== n) ?? (n === 1 ? 2 : n - 1)
          return { n, options: q.shuffle([n, other], rand) as [number, number] }
        })
        steps.push({ kind: 'rocket', from: token === 'rocket' ? 'num' : 'word', rounds })
        break
      }
      case 'add': case 'addN': case 'sub': case 'subN': case 'missing': {
        const isAdd = token === 'add' || token === 'addN'
        const sums: { a: number; b: number }[] = []
        for (const a of positive) for (const b of positive) {
          if (token === 'missing' ? a + b <= sumTop && a >= 1 : isAdd ? a + b <= sumTop : a <= sumTop && b < a) sums.push({ a, b })
        }
        const mixed = q.shuffle(sums, rand)
        const choice = mixed.find(s => unused(`${token}${s.a}.${s.b}`)) ?? mixed[0]
        if (!choice) break
        mark(`${token}${choice.a}.${choice.b}`)
        const pictures = token === 'add' || token === 'sub'
        if (token === 'missing') steps.push(q.missingStep(choice.a, choice.a + choice.b, ctx))
        else if (isAdd) steps.push(q.addStep(choice.a, choice.b, { pictures, useEquals, max: SUM_MAX }, ctx))
        else steps.push(q.subStep(choice.a, choice.b, { pictures, max: SUM_MAX }, ctx))
        break
      }
      case 'more': {
        const a = nextN(positive)
        let b = a
        for (let i = 0; i < 20 && b === a; i++) b = q.pick(positive, rand)
        if (b !== a) steps.push(q.moreStep(a, b, rand() < 0.5 ? 'more' : 'less', ctx))
        break
      }
      case 'sign': {
        const a = nextN(positive)
        let b = rand() < 0.25 ? a : q.pick(positive, rand)
        if (b === a && rand() < 0.5) b = q.pick(positive, rand)
        steps.push(q.signStep(a, b, ctx))
        break
      }
      case 'oddEven':
        steps.push(q.oddEvenStep(nextN(positive), ctx))
        break
      case 'teenSum': {
        const teens = known.filter(n => n >= 11 && n <= 20).map(n => n - 10)
        if (teens.length) steps.push(q.teenSumStep(q.pick(teens, rand), ctx))
        break
      }
      case 'next': {
        const starts = positive.filter(n => n + 3 <= maxKnown && n + 3 <= MAX_NUMBER)
        if (starts.length) steps.push(q.nextStep(q.pick(starts, rand), ctx))
        break
      }
      case 'before': {
        const ns = positive.filter(n => n >= 2 && n + 1 <= MAX_NUMBER && n + 1 <= maxKnown)
        if (ns.length) steps.push(q.beforeStep(q.pick(ns, rand), ctx))
        break
      }
      case 'between': {
        const as = positive.filter(n => n + 2 <= maxKnown)
        if (as.length) steps.push(q.betweenStep(q.pick(as, rand), ctx))
        break
      }
      case 'skip':
        steps.push(q.skipStep(SKIP_STEPS[skips++ % SKIP_STEPS.length], ctx))
        break
      case 'double': {
        const ns = positive.filter(n => n >= 2 && n <= 9)
        const fresh2 = ns.filter(n => unused(`d${n}`))
        if (ns.length) {
          const n = q.pick(fresh2.length ? fresh2 : ns, rand)
          mark(`d${n}`)
          steps.push(q.doubleStep(n, ctx))
        }
        break
      }
      case 'bond': {
        const t = bonds++ < 2 ? 10 : q.pick([5, 10], rand)
        const as = Array.from({ length: t - 1 }, (_, i) => i + 1).filter(a => unused(`b${a}.${t}`))
        const a = q.pick(as.length ? as : [1], rand)
        mark(`b${a}.${t}`)
        steps.push(q.bondStep(a, t, ctx))
        break
      }
      case 'riddle': {
        const kinds = level.riddle ?? ['more', 'less']
        const r = makeRiddle(Math.max(1, lo), Math.min(hi, maxKnown), kinds, rand)
        const riddle = r ?? { clues: [makeClue('more', 1), makeClue('less', 3)], answer: 2, lo: 1, hi: 10 }
        steps.push(q.riddleStep(riddle, riddleOptions(riddle, rand)))
        break
      }
      case 'story': {
        const op = topics.has('minus') && stories++ % 2 === 1 ? 'minus' : 'plus'
        const story = makeStory(op, Math.min(hi, 10), rand)
        steps.push({ kind: 'story', story, options: q.numberChoices(story.answer, ctx, { min: 1, max: 10, lure: [story.a, story.b] }) })
        break
      }
      case 'wordNum': {
        if (!wordNums.length) wordNums = q.shuffle(pool, rand)
        steps.push(q.wordNumStep(wordNums.pop() as number, ctx))
        break
      }
      case 'wordSign':
        steps.push(q.wordSignStep(wordSigns++ % 2 === 0 ? 'plus' : 'minus', ctx))
        break
      case 'wordBond': {
        const word = splittable[bonds++ % Math.max(1, splittable.length)]
        if (word) steps.push({ kind: 'wordBond', word, demo: level.id === 'n29' && bonds === 1 })
        break
      }
      case 'soundCompare': {
        const pair = pickSoundPair(bank, rand)
        if (pair) steps.push({ kind: 'soundCompare', a: pair[0], b: pair[1] })
        break
      }
    }
  }
  return steps
}
