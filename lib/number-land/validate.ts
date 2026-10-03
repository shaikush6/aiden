// Checks for Block Buddy Land. Run with `npm run quest:check` (it runs these along with the Quest checks).
import { LEVELS } from '../reading-quest/catalog.ts'
import { collectQuestLines, lineId } from '../reading-quest/allowlist.ts'
import { NARRATOR_VOICES } from '../reading-quest/narration.ts'
import { isKnownGrapheme } from '../reading-quest/phonemes.ts'
import { checkScript, spokenFragments } from '../reading-quest/script.ts'
import type { ParsedWord } from '../reading-quest/types.ts'
import { NUMBER_LEVELS, TOWNS, knownNumbersAt, knownWordsAt } from './curriculum.ts'
import { KIT_NL, MISSION_DONE_NL, MISSION_START_NL, NARRATOR_NL, TOWN_NARRATION } from './lines.ts'
import { planNumberLevel, type NStep } from './plan.ts'
import { RIDDLE_QUESTION, clueFits, solutions } from './riddles.ts'
import { compareAnswer, compareFact, compareQuestion, equationFull, oddEvenQuestion, teenFact, tokenKeys } from './sentences.ts'
import { stepSpeech } from './spoken.ts'
import { levelScript, townIntro } from './script.ts'
import { buddyLayout } from './buddy.ts'
import { parityFact } from './riddles.ts'
import { BASE_KEYS, LEXICON, MATH_WORDS, MAX_NUMBER, NUMBER_ENTRIES, NUMBER_TEXT } from './words.ts'
import { canSplit } from './word-bonds.ts'

const EXPECTED = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
]

const PLAN_RUNS = 30

export function validateNumberLand(): string[] {
  const errors: string[] = []
  const err = (m: string) => errors.push(`number-land: ${m}`)

  // ----- words -----
  EXPECTED.forEach((w, n) => { if (NUMBER_TEXT[n] !== w) err(`number word ${n} spells "${NUMBER_TEXT[n]}", expected "${w}"`) })
  const lexed: [string, ParsedWord, number[], string][] = [
    ...NUMBER_ENTRIES.map((e, n) => [`number ${n}`, e.word, e.heart, e.tip] as [string, ParsedWord, number[], string]),
    ...Object.entries(MATH_WORDS).map(([k, e]) => [`math word "${k}"`, e.word, e.heart, e.tip] as [string, ParsedWord, number[], string]),
  ]
  for (const [name, word, heart, tip] of lexed) {
    word.units.forEach((u, i) => { if (!heart.includes(i) && !isKnownGrapheme(u.grapheme)) err(`${name}: sound "${u.grapheme}" has no recording`) })
    if (!tip) err(`${name} needs a tip`)
    checkScript(tip).forEach(p => err(`${name} tip: ${p}`))
  }
  for (const [key, e] of LEXICON) {
    if (key !== e.word.text.toLowerCase()) err(`lexicon key "${key}" does not match its word`)
    e.word.units.forEach((u, i) => { if (!e.heart.includes(i) && !isKnownGrapheme(u.grapheme)) err(`word "${key}": sound "${u.grapheme}" has no recording`) })
  }
  const fixed = [
    ...Object.values(KIT_NL), ...Object.values(NARRATOR_NL), ...MISSION_START_NL, ...MISSION_DONE_NL,
    ...Object.values(TOWN_NARRATION).flatMap(t => [t.kit, t.arrive, t.complete]),
  ]
  fixed.forEach(t => checkScript(t).forEach(p => err(`line "${t.slice(0, 40)}…": ${p}`)))
  TOWNS.forEach(t => { if (!TOWN_NARRATION[t.id]) err(`town ${t.id} has no narration`) })

  // ----- Block Buddy shapes -----
  for (let n = 0; n <= MAX_NUMBER; n++) {
    const { cells, rows } = buddyLayout(n)
    if (cells.length !== n) err(`buddy ${n} draws ${cells.length} blocks`)
    const spots = new Set(cells.map(c => `${c.x},${c.y}`))
    if (spots.size !== cells.length) err(`buddy ${n} has overlapping blocks`)
    if (rows > 5) err(`buddy ${n} is ${rows} rows tall`)
  }

  // ----- curriculum -----
  const ids = new Set<string>()
  const buddies: number[] = []
  const seenWords = new Set<string>()
  NUMBER_LEVELS.forEach((level, index) => {
    const at = (m: string) => err(`${level.id}: ${m}`)
    if (ids.has(level.id)) at('duplicate id')
    ids.add(level.id)
    if (level.town < 0 || level.town >= TOWNS.length) at('bad town')
    buddies.push(...level.buddies)
    for (const w of level.words) {
      if (!MATH_WORDS[w]) at(`unknown math word "${w}"`)
      if (seenWords.has(w)) at(`word "${w}" is introduced twice`)
      seenWords.add(w)
    }
    const words = knownWordsAt(index)
    const known = knownNumbersAt(index)
    const need = (token: string, keys: string[]) => keys.filter(k => !words.has(k)).forEach(k => at(`"${token}" needs the word "${k}" first`))
    for (const token of level.plan) {
      if (token === 'plus') need(token, ['plus', 'is'])
      if (token === 'minus') need(token, ['minus', 'is'])
      if (token === 'compare') need(token, ['which', 'is', 'more', 'or'])
      if (token === 'oddEven') need(token, ['odd', 'even', 'or'])
      if (token === 'story') need(token, ['how', 'many', 'now', 'are', 'left'])
      if (token === 'riddle') {
        need(token, ['who', 'am', 'i'])
        const kinds = level.riddle ?? ['more', 'less']
        if (kinds.includes('more') || kinds.includes('less') || kinds.includes('onemore')) need(token, ['more', 'less', 'than'])
        if (kinds.includes('odd') || kinds.includes('even')) need(token, ['odd', 'even'])
      }
    }
    if (known.length < 2 && level.plan.some(t => t !== 'meetBuddies')) at('not enough buddies known yet')
    const [lo, hi] = level.range
    if (lo > hi) at('bad range')
  })
  const expected = Array.from({ length: MAX_NUMBER + 1 }, (_, n) => n)
  if (buddies.join() !== expected.join()) err(`buddies must be introduced 0 to ${MAX_NUMBER} in order, once each (got ${buddies.join(',')})`)

  // ----- plans -----
  const allLines = collectQuestLines()
  const approved = new Set(allLines.map(l => lineId(l.kind, l.text, l.voice)))
  const spoken = (kind: 'line' | 'narration' | 'word', text: string, voice = ''): boolean => approved.has(lineId(kind, text, voice))
  const banks: ParsedWord[][] = [[...LEVELS[0].bank.values()], [...LEVELS[Math.min(20, LEVELS.length - 1)].bank.values()]]

  NUMBER_LEVELS.forEach((level, index) => {
    const known = knownNumbersAt(index)
    const words = knownWordsAt(index)
    const [lo, hi] = level.range
    const maxKnown = Math.max(...known)
    const readable = new Set<string>([...BASE_KEYS])
    known.forEach(n => readable.add(NUMBER_TEXT[n]))
    words.forEach(w => readable.add(w))
    const expectCount = level.plan.reduce((n, t) => n + (t === 'meetBuddies' ? level.buddies.length : t === 'meetWords' ? level.words.length : 1), 0)

    for (const bank of banks) {
      for (let run = 0; run < PLAN_RUNS; run++) {
        const steps = planNumberLevel(level, bank)
        const at = (m: string) => err(`${level.id}: plan: ${m}`)
        if (steps.length !== expectCount) at(`has ${steps.length} steps, expected ${expectCount}`)
        const distinct3 = (o: number[], answer: number) => o.length === 3 && new Set(o).size === 3 && o.includes(answer) && o.every(n => n >= 0 && n <= MAX_NUMBER)
        const readsOk = (text: string, what: string) => tokenKeys(text).forEach(k => { if (!readable.has(k)) at(`${what}: "${k}" is not readable yet ("${text}")`) })
        const isKnown = (n: number, what: string) => { if (!known.includes(n)) at(`${what} uses ${n}, which is not met yet`) }

        for (const s of steps as NStep[]) {
          switch (s.kind) {
            case 'wake': isKnown(s.n, 'wake'); if (!distinct3(s.options, s.n)) at(`wake ${s.n} options ${s.options}`); break
            case 'build': isKnown(s.n, 'build'); if (s.n < 1) at('build zero'); break
            case 'equation': {
              [s.a, s.b, s.answer].forEach(n => isKnown(n, 'equation'))
              if (s.answer !== (s.op === 'plus' ? s.a + s.b : s.a - s.b) || s.answer < 1) at(`equation ${s.a} ${s.op} ${s.b} = ${s.answer}`)
              if (s.answer > hi && s.answer > maxKnown) at('equation is past the range')
              if (!distinct3(s.options, s.answer)) at(`equation options ${s.options} for ${s.answer}`)
              readsOk(equationFull(s.op, s.a, s.b, s.answer), 'equation')
              break
            }
            case 'riddle': {
              if (s.clues.length < 2 || s.clues.length > 3) at('riddle needs 2 or 3 clues')
              const sol = solutions(s.clues, Math.max(1, lo), Math.min(hi, maxKnown))
              if (sol.length !== 1 || sol[0] !== s.answer) at(`riddle has answers ${sol} but should have only ${s.answer}`)
              if (!s.clues.every(c => clueFits(c, s.answer))) at('a riddle clue is false for the answer')
              if (!distinct3(s.options, s.answer)) at(`riddle options ${s.options} for ${s.answer}`)
              s.clues.forEach(c => readsOk(c.text, 'clue'))
              s.options.forEach(n => isKnown(n, 'riddle option'))
              readsOk(RIDDLE_QUESTION, 'riddle')
              const kinds = level.riddle ?? ['more', 'less']
              s.clues.forEach(c => { if (!kinds.includes(c.kind)) at(`riddle clue "${c.kind}" is not allowed here`) })
              break
            }
            case 'oddEven': isKnown(s.n, 'odd/even'); readsOk(oddEvenQuestion(s.n), 'odd/even'); readsOk(parityFact(s.n), 'parity'); break
            case 'compare': {
              isKnown(s.a, 'compare'); isKnown(s.b, 'compare')
              if (s.a === s.b) at('compare of equal numbers')
              if (s.ask === 'less' && !words.has('less')) at('asks "less" before it is taught')
              readsOk(compareQuestion(s.a, s.b, s.ask), 'compare'); readsOk(compareFact(s.a, s.b, s.ask), 'compare fact')
              if (compareAnswer(s.a, s.b, s.ask) === (s.ask === 'more' ? Math.min(s.a, s.b) : Math.max(s.a, s.b))) at('compare answer is wrong')
              break
            }
            case 'story': {
              const st = s.story
              if (st.a < 2 || st.b < 2) at(`story uses ${st.a} and ${st.b}`)
              if (st.answer !== (st.op === 'plus' ? st.a + st.b : st.a - st.b) || st.answer < 1 || st.answer > 10) at(`story answer ${st.answer}`)
              if (!distinct3(s.options, st.answer)) at(`story options ${s.options}`)
              st.sentences.forEach(t => readsOk(t, 'story'))
              break
            }
            case 'wordBond': if (!canSplit(s.word)) at(`"${s.word.text}" cannot be split`); break
            case 'soundCompare': if (s.a.units.length === s.b.units.length) at('sound compare of equal counts'); break
            case 'rocket': {
              if (s.rounds.length !== 6) at('rocket needs 6 rounds')
              s.rounds.forEach(r => { isKnown(r.n, 'rocket'); if (r.options[0] === r.options[1] || !r.options.includes(r.n)) at(`rocket options ${r.options}`) })
              break
            }
            case 'meet': isKnown(s.n, 'meet'); if (s.n > 10) readsOk(teenFact(s.n), 'teen fact'); break
            case 'meetWord': if (!MATH_WORDS[s.key]) at(`unknown word ${s.key}`); break
          }
          // Every spoken line must be on the allowlist, in Kit's voice and in every narrator voice.
          const speech = stepSpeech(s)
          for (const script of speech.scripts) {
            for (const frag of spokenFragments(script)) {
              if (!spoken('line', frag)) at(`Kit line not allowlisted: "${frag}"`)
              for (const v of NARRATOR_VOICES) if (!spoken('narration', frag, v.id)) at(`narrator (${v.id}) line not allowlisted: "${frag}"`)
            }
          }
          for (const w of speech.words) if (!spoken('word', w)) at(`word not allowlisted: "${w}"`)
        }
      }
    }
  })

  // Level intros and outros, in Kit's voice and in the narrator's voice.
  const lineOk = (script: string, narrator: boolean): boolean => spokenFragments(script).every(frag =>
    narrator ? NARRATOR_VOICES.every(v => spoken('narration', frag, v.id)) : spoken('line', frag))
  for (const level of NUMBER_LEVELS) {
    for (const narrator of [false, true]) {
      const { intro, outro } = levelScript(level, narrator)
      for (const line of [...intro, ...outro]) if (!lineOk(line, narrator)) err(`${level.id}: ${narrator ? 'narrator' : 'Kit'} intro/outro not allowlisted: "${line.slice(0, 50)}"`)
    }
  }
  for (const t of TOWNS) for (const narrator of [false, true]) {
    if (!lineOk(townIntro(t.id, narrator), narrator)) err(`town ${t.id}: ${narrator ? 'narrator' : 'Kit'} greeting not allowlisted`)
  }
  for (const key of Object.keys(KIT_NL) as (keyof typeof KIT_NL)[]) {
    if (!lineOk(KIT_NL[key], false)) err(`Kit line "${key}" not allowlisted`)
    if (!lineOk(NARRATOR_NL[key], true)) err(`narrator line "${key}" not allowlisted`)
  }

  return [...new Set(errors)]
}

export function numberLandSummary() {
  return { levels: NUMBER_LEVELS.length, towns: TOWNS.length, numberWords: NUMBER_ENTRIES.length, mathWords: Object.keys(MATH_WORDS).length }
}
