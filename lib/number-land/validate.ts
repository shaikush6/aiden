// Checks for Block Buddy Land. Run with `npm run quest:check` (it runs these along with the Quest checks).
// Every question is re-checked from its own pictures (is 3 + 2 really 5? is the right card really the right card?),
// so a mistake in a builder cannot slip through to the child.
import { LEVELS } from '../reading-quest/catalog.ts'
import { collectQuestLines, lineId } from '../reading-quest/allowlist.ts'
import { NARRATOR_VOICES } from '../reading-quest/narration.ts'
import { isKnownGrapheme } from '../reading-quest/phonemes.ts'
import { checkScript, spokenFragments } from '../reading-quest/script.ts'
import type { ParsedWord } from '../reading-quest/types.ts'
import { NUMBER_LEVELS, TOWNS, knownNumbersAt, knownTopicsAt, type Token } from './curriculum.ts'
import { KIT_NL, MISSION_DONE_NL, MISSION_START_NL, NARRATOR_NL, TOWN_NARRATION } from './lines.ts'
import { LESSONS } from './lessons.ts'
import { planNumberLevel } from './plan.ts'
import { clueFits, solutions } from './riddles.ts'
import { stepSpeech } from './spoken.ts'
import { levelScript, townIntro } from './script.ts'
import { buddyLayout } from './buddy.ts'
import { questionScripts } from './speech.ts'
import type { ChooseStep, NStep } from './steps.ts'
import { TOPIC_SIGNS, optionKey, type Sign, type Term, type Topic } from './terms.ts'
import { LEXICON, MATH_WORDS, MAX_NUMBER, NUMBER_ENTRIES, NUMBER_TEXT } from './words.ts'
import { canSplit } from './word-bonds.ts'
import { tokenKeys } from './speech.ts'

const EXPECTED = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
]

const PLAN_RUNS = 40

/** What each activity needs the child to have been taught first. */
const NEEDS: Partial<Record<Token, Topic[]>> = {
  add: ['plus'], addN: ['plus'],
  sub: ['minus'], subN: ['minus'],
  missing: ['plus', 'equals'],
  more: ['compare'], sign: ['signs'], oddEven: ['oddEven'], teenSum: ['teen'], next: ['next'], before: ['next'], between: ['next'],
  skip: ['skip'], double: ['double'], bond: ['bond'], riddle: ['riddle', 'signs'], story: ['story', 'plus'],
  wordNum: ['words'], rocketWord: ['words'], wordSign: ['plus', 'minus'],
}

const termValue = (t: Term | undefined): number | null => (t && (t.t === 'num' || t.t === 'buddy') ? t.n : null)
const termSign = (t: Term | undefined): Sign | null => (t && t.t === 'sign' ? t.s : null)

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
  Object.keys(KIT_NL).forEach(k => { if (!(k in NARRATOR_NL)) err(`narrator line "${k}" is missing`) })

  // Spoken scripts must be plain words: no digits, and no slashes unless they mark a real phonics sound.
  const speakable = [...questionScripts(), ...Object.values(LESSONS).flatMap(l => l.beats.map(b => b.say)), ...fixed]
  for (const text of new Set(speakable)) {
    if (/\d/.test(text)) err(`spoken line has a digit: "${text}"`)
    checkScript(text).forEach(p => err(`line "${text.slice(0, 40)}…": ${p}`))
  }

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
  const met: number[] = []
  const taught = new Map<Topic, number>()
  NUMBER_LEVELS.forEach((level, index) => {
    const at = (m: string) => err(`${level.id}: ${m}`)
    if (ids.has(level.id)) at('duplicate id')
    ids.add(level.id)
    if (level.town < 0 || level.town >= TOWNS.length) at('bad town')
    const [lo, hi] = level.range
    if (lo > hi) at('bad range')
    met.push(...level.meets)
    level.meets.forEach(n => { if (n > 10 && !met.includes(10)) at(`meets ${n} before ten`) })
    for (const t of level.learn) {
      if (!LESSONS[t]) at(`unknown lesson "${t}"`)
      if (taught.has(t)) at(`lesson "${t}" is taught twice`)
      taught.set(t, index)
    }
    const topics = knownTopicsAt(index)
    for (const token of level.plan) {
      for (const need of NEEDS[token] ?? []) if (!topics.has(need)) at(`"${token}" needs the "${need}" lesson first`)
    }
    if (level.plan.some(t => t === 'riddle') && !(level.riddle ?? ['more']).length) at('riddle kinds are empty')
  })
  if ([...met].sort((a, b) => a - b).join() !== Array.from({ length: MAX_NUMBER + 1 }, (_, n) => n).join()) {
    err(`every number 0 to ${MAX_NUMBER} must be met exactly once (got ${met.join(',')})`)
  }
  for (const topic of Object.keys(TOPIC_SIGNS) as Topic[]) if (!taught.has(topic)) err(`sign lesson "${topic}" is never taught`)

  // ----- lessons: every sign on a stage was taught by then -----
  for (const [topic, lesson] of Object.entries(LESSONS) as [Topic, (typeof LESSONS)[Topic]][]) {
    const when = taught.get(topic) ?? -1
    const signs = new Set<Sign>(when >= 0 ? [...knownTopicsAt(when)].flatMap(t => TOPIC_SIGNS[t] ?? []) : [])
    if (lesson.topic !== topic) err(`lesson ${topic} has the wrong topic`)
    if (lesson.beats.length < 2) err(`lesson ${topic} is too short`)
    lesson.beats.forEach((b, i) => {
      b.terms.forEach(t => {
        if (t.t === 'sign' && !signs.has(t.s) && when >= 0) err(`lesson ${topic} beat ${i + 1} shows "${t.s}" before it is taught`)
        if ((t.t === 'num' || t.t === 'buddy') && (t.n < 0 || t.n > MAX_NUMBER)) err(`lesson ${topic} beat ${i + 1} uses ${t.n}`)
        if (t.t === 'word' && !LEXICON.has(t.text)) err(`lesson ${topic} shows the word "${t.text}", which is not in the lexicon`)
      })
    })
  }

  // ----- plans -----
  const allLines = collectQuestLines()
  const approved = new Set(allLines.map(l => lineId(l.kind, l.text, l.voice)))
  const spoken = (kind: 'line' | 'narration' | 'word', text: string, voice = ''): boolean => approved.has(lineId(kind, text, voice))
  const scriptOk = (script: string, what: string, at: (m: string) => void) => {
    for (const frag of spokenFragments(script)) {
      for (const v of NARRATOR_VOICES) if (!spoken('line', frag, v.id)) at(`${what}: Kit (${v.id}) line not allowlisted: "${frag}"`)
      for (const v of NARRATOR_VOICES) if (!spoken('narration', frag, v.id)) at(`${what}: narrator (${v.id}) line not allowlisted: "${frag}"`)
    }
  }
  for (const lesson of Object.values(LESSONS)) lesson.beats.forEach(b => scriptOk(b.say, `lesson ${lesson.topic}`, err))

  const banks: ParsedWord[][] = [[...LEVELS[0].bank.values()], [...LEVELS[Math.min(20, LEVELS.length - 1)].bank.values()]]

  NUMBER_LEVELS.forEach((level, index) => {
    const known = knownNumbersAt(index)
    const topics = knownTopicsAt(index)
    const signsKnown = new Set<Sign>([...topics].flatMap(t => TOPIC_SIGNS[t] ?? []))
    const [lo, hi] = level.range
    const maxKnown = Math.max(0, ...known)
    const expectCount = level.meets.length + level.learn.length + level.plan.length

    for (const bank of banks) {
      for (let run = 0; run < PLAN_RUNS; run++) {
        const steps = planNumberLevel(level, bank)
        const at = (m: string) => err(`${level.id}: plan: ${m}`)
        if (steps.length !== expectCount) at(`has ${steps.length} steps, expected ${expectCount}`)
        const isKnown = (n: number, what: string) => { if (!known.includes(n)) at(`${what} uses ${n}, which is not met yet`) }

        const checkTerms = (terms: Term[], what: string) => {
          if (terms.filter(t => t.t === 'blank').length > 1) at(`${what} has two blanks`)
          for (const t of terms) {
            if ((t.t === 'num' || t.t === 'buddy') && t.n > MAX_NUMBER) at(`${what} shows ${t.n}`)
            if (t.t === 'num' || t.t === 'buddy') isKnown(t.n, what)
            if (t.t === 'sign' && !signsKnown.has(t.s)) at(`${what} shows the "${t.s}" sign before it is taught`)
            if (t.t === 'word' && !LEXICON.has(t.text)) at(`${what} shows the word "${t.text}", which is not in the lexicon`)
            if (t.t === 'clue' && t.kind !== 'odd' && t.kind !== 'even') isKnown(t.n, `${what} clue`)
          }
        }

        const checkChoose = (s: ChooseStep) => {
          const what = `${s.topic} "${s.ask.slice(0, 30)}"`
          if (s.options.length < 2 || s.options.length > 4) at(`${what} has ${s.options.length} choices`)
          if (new Set(s.options.map(optionKey)).size !== s.options.length) at(`${what} has repeated choices`)
          if (s.answer < 0 || s.answer >= s.options.length) { at(`${what} has no right answer`); return }
          const right = s.options[s.answer]
          if (!NEEDS_OK(topics, s.topic)) at(`${what} explains a lesson that has not been taught`)
          checkTerms(s.prompt, what); checkTerms(s.solved, `${what} (solved)`)
          if (s.hint) checkTerms(s.hint, `${what} (hint)`)
          s.options.forEach(o => {
            if (o.t === 'sign' && !signsKnown.has(o.s)) at(`${what} offers the "${o.s}" sign before it is taught`)
            if ((o.t === 'num' || o.t === 'buddy')) isKnown(o.n, `${what} choice`)
          })
          s.numbers.forEach(n => { if (n < 0 || n > MAX_NUMBER) at(`${what} is about ${n}`) })

          // The blank must become the right card.
          const blank = s.prompt.findIndex(t => t.t === 'blank')
          if (blank >= 0) {
            const filled = s.solved[blank]
            const want = right.t === 'sign' ? termSign(filled) : termValue(filled)
            const have = right.t === 'sign' ? right.s : right.t === 'num' || right.t === 'buddy' ? right.n : null
            if (want === null || want !== have) at(`${what}: the right card does not fill the blank`)
            if (s.options.some((o, i) => i !== s.answer && (o.t === 'sign' ? o.s : o.t === 'num' || o.t === 'buddy' ? o.n : null) === want)) at(`${what}: two cards fit the blank`)
          }

          // Check the arithmetic and comparisons in the solved picture.
          const v = s.solved.map(termValue)
          const g = s.solved.map(termSign)
          const eqAt = (i: number) => g[i] === '=' || (s.solved[i]?.t === 'text' && (s.solved[i] as { text: string }).text === 'makes')
          if (s.solved.length === 5 && v[0] !== null && v[2] !== null && v[4] !== null && (g[1] === '+' || g[1] === '−') && eqAt(3)) {
            const sum = g[1] === '+' ? v[0] + v[2] : v[0] - v[2]
            if (sum !== v[4]) at(`${what}: ${v[0]} ${g[1]} ${v[2]} is not ${v[4]}`)
            if (g[1] === '−' && v[4] < 1) at(`${what}: takes everything away`)
            if (v[4] > MAX_NUMBER) at(`${what}: goes past twenty`)
          } else if (s.topic === 'signs' && s.solved.length === 3) {
            const [a, b] = [v[0], v[2]]
            const want = a === null || b === null ? null : a === b ? '=' : a > b ? '>' : '<'
            if (want !== g[1]) at(`${what}: the sign should be ${want}`)
          } else if (s.topic === 'compare' && s.solved.length === 3 && v[0] !== null && v[2] !== null && right.t === 'num') {
            const more = /\bmore\b/.test(s.ask)
            const less = /\bless\b/.test(s.ask)
            const winner = more ? Math.max(v[0], v[2]) : Math.min(v[0], v[2])
            if (!more && !less) at(`${what}: does not ask more or less`)
            if (right.n !== winner || v[0] === v[2]) at(`${what}: the right card is ${right.n}, expected ${winner}`)
          } else if (s.topic === 'oddEven') {
            const n = termValue(s.prompt[0])
            const want = n !== null && n % 2 === 0 ? 'even' : 'odd'
            if (right.t !== 'word' || right.text !== want) at(`${what}: ${n} should be ${want}`)
          } else if (s.topic === 'numerals') {
            const a = termValue(s.prompt[0])
            if (right.t === 'sign' || right.t === 'word' || a === null || right.n !== a) at(`${what}: the card does not match ${a}`)
          } else if (s.prompt[0]?.t === 'word') {
            const w = s.prompt[0]
            if (w.t === 'word' && right.t === 'num') { if (NUMBER_TEXT[right.n] !== w.text) at(`${what}: "${w.text}" is not ${right.n}`) }
            else if (w.t === 'word' && right.t === 'sign') { if ((w.text === 'plus') !== (right.s === '+') || !['plus', 'minus'].includes(w.text)) at(`${what}: "${w.text}" is not ${right.s}`) }
            else at(`${what}: unexpected reading question`)
          } else if (s.topic === 'next' || s.topic === 'skip') {
            const seq = s.solved.map(termValue)
            if (seq.some(x => x === null)) at(`${what}: sequence has a gap`)
            else {
              const step = (seq[1] as number) - (seq[0] as number)
              seq.forEach((x, i) => { if (i > 0 && (x as number) - (seq[i - 1] as number) !== step) at(`${what}: sequence is not even steps`) })
              if (s.topic === 'next' && step !== 1) at(`${what}: counting on should go up by one`)
              if (s.topic === 'skip' && step !== 2 && step !== 5) at(`${what}: skip step ${step}`)
            }
          } else if (s.topic === 'riddle') {
            const clues = s.prompt.flatMap(t => (t.t === 'clue' ? [t] : []))
            const answer = right.t === 'num' ? right.n : -1
            const asClue = (c: (typeof clues)[number]) => ({ kind: c.kind, k: c.n, text: c.text })
            if (clues.length < 2 || clues.length > 3) at(`${what}: riddle needs 2 or 3 clues`)
            const sol = solutions(clues.map(asClue), Math.max(1, lo), Math.min(hi, maxKnown))
            if (sol.length !== 1 || sol[0] !== answer) at(`${what}: riddle has answers ${sol} but should have only ${answer}`)
            if (!clues.every(c => clueFits(asClue(c), answer))) at(`${what}: a clue is false for the answer`)
            const kinds = level.riddle ?? ['more', 'less']
            clues.forEach(c => { if (!kinds.includes(c.kind)) at(`${what}: clue "${c.kind}" is not allowed here`) })
          } else if (s.topic === 'double' || s.topic === 'bond' || s.topic === 'teen' || s.topic === 'equals' || s.topic === 'plus' || s.topic === 'minus') {
            if (blank < 0) at(`${what} has no blank`)
          } else {
            at(`${what}: no check written for this topic`)
          }
          s.say.forEach(line => scriptOk(line, what, at))
          scriptOk(s.told, `${what} (told)`, at)
        }

        for (const s of steps as NStep[]) {
          switch (s.kind) {
            case 'choose': checkChoose(s); break
            case 'count':
              isKnown(s.n, 'count')
              if (s.n > MAX_NUMBER) at(`count ${s.n}`)
              if (new Set(s.options).size !== s.options.length || !s.options.includes(s.n) || s.options.length !== 3) at(`count options ${s.options} for ${s.n}`)
              s.options.forEach(o => { if (o < 0 || o > MAX_NUMBER) at(`count option ${o}`) })
              break
            case 'build': isKnown(s.n, 'build'); if (s.n < 1) at('build zero'); break
            case 'meet': isKnown(s.n, 'meet'); break
            case 'learn': if (!LESSONS[s.topic]) at(`unknown lesson ${s.topic}`); break
            case 'story': {
              const st = s.story
              if (st.a < 2 || st.b < 2) at(`story uses ${st.a} and ${st.b}`)
              if (st.answer !== (st.op === 'plus' ? st.a + st.b : st.a - st.b) || st.answer < 1 || st.answer > 10) at(`story answer ${st.answer}`)
              if (st.op === 'minus' && !topics.has('minus')) at('minus story before the minus lesson')
              if (new Set(s.options).size !== s.options.length || !s.options.includes(st.answer) || s.options.length !== 3) at(`story options ${s.options}`)
              st.sentences.forEach(t => tokenKeys(t).forEach(k => { if (!LEXICON.has(k)) at(`story word "${k}" is not in the lexicon`) }))
              break
            }
            case 'wordBond': if (!canSplit(s.word)) at(`"${s.word.text}" cannot be split`); break
            case 'soundCompare': if (s.a.units.length === s.b.units.length) at('sound compare of equal counts'); break
            case 'rocket': {
              if (s.rounds.length !== 6) at('rocket needs 6 rounds')
              s.rounds.forEach(r => { isKnown(r.n, 'rocket'); if (r.options[0] === r.options[1] || !r.options.includes(r.n)) at(`rocket options ${r.options}`) })
              break
            }
          }
          // Every spoken line must be on the allowlist, in Kit's voice and in every narrator voice.
          const speech = stepSpeech(s)
          for (const script of speech.scripts) scriptOk(script, s.kind, at)
          for (const w of speech.words) if (!spoken('word', w)) at(`word not allowlisted: "${w}"`)
        }
      }
    }
  })

  // Level intros and outros, in Kit's voice and in the narrator's voice.
  const lineOk = (script: string, narrator: boolean): boolean => spokenFragments(script).every(frag =>
    NARRATOR_VOICES.every(v => spoken(narrator ? 'narration' : 'line', frag, v.id)))
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

function NEEDS_OK(topics: Set<Topic>, topic: Topic): boolean {
  return topics.has(topic)
}

export function numberLandSummary() {
  const lessons = Object.keys(LESSONS).length
  return { levels: NUMBER_LEVELS.length, towns: TOWNS.length, numberWords: NUMBER_ENTRIES.length, lessons }
}
