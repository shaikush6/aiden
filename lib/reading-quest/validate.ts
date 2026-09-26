// Curriculum checks: every word, sentence and story may only use sounds and heart words
// that have already been taught. Run with `npm run quest:check`.
import { LEVELS, tokenize, type LevelInfo } from './catalog.ts'
import { isKnownGrapheme } from './phonemes.ts'
import { parseSeg, parseWord } from './parse.ts'
import type { ParsedWord } from './types.ts'
import { planLevel } from './plan.ts'
import { checkScript } from './script.ts'
import { KIT_LINES, NARRATOR_LINES, NARRATOR_PRAISE, NARRATOR_RETRY, KIT_PRAISE, KIT_RETRY } from './lines.ts'
import { narrationLines } from './narration.ts'
import { WORLDS } from './curriculum/index.ts'
import type { QuestProgress } from './progress.ts'

const MAX_SPOKEN = 300

export function validateCurriculum(): string[] {
  const errors: string[] = []
  const seenIds = new Set<string>()
  const segByText = new Map<string, string>()

  for (const level of LEVELS) {
    const { def } = level
    const at = (msg: string) => errors.push(`${def.id}: ${msg}`)

    if (seenIds.has(def.id)) at('duplicate level id')
    seenIds.add(def.id)
    if (!def.title) at('missing title')
    if (!def.animal.name || !def.animal.fact || !def.animal.rescue || !def.animal.stat) at('animal is incomplete')

    for (const s of def.sounds) {
      if (!isKnownGrapheme(s.g)) at(`sound "${s.g}" is not a known grapheme`)
      if (!s.tip || !s.emoji) at(`sound "${s.g}" needs a tip and an emoji`)
    }

    const checkDecodable = (pw: ParsedWord, what: string, heartIdx: number[] = []) => {
      pw.units.forEach((u, i) => {
        if (heartIdx.includes(i)) return
        if (!isKnownGrapheme(u.grapheme)) at(`${what} "${pw.text}": unknown grapheme "${u.grapheme}"`)
        else if (!level.taught.has(u.gpc)) at(`${what} "${pw.text}": sound "${u.gpc}" not taught yet`)
      })
    }

    const defineWord = (seg: string, emoji: string | undefined, say: string | undefined, what: string) => {
      let pw: ParsedWord
      try { pw = parseWord({ seg, emoji, say }) } catch (e) { at(`${what} "${seg}": ${(e as Error).message}`); return }
      checkDecodable(pw, what)
      const key = pw.text.toLowerCase()
      const prev = segByText.get(key)
      if (prev && prev !== seg) at(`${what} "${pw.text}" segmented as "${seg}" but earlier as "${prev}"`)
      if (!prev) segByText.set(key, seg)
    }

    def.words.forEach(w => defineWord(w.seg, w.emoji, w.say, 'word'))
    ;(def.extra ?? []).forEach(w => defineWord(w.seg, w.emoji, w.say, 'extra word'))

    // Picture words in one level must have distinct pictures, or picture choices become ambiguous.
    const byEmoji = new Map<string, string>()
    for (const w of level.words) {
      if (!w.emoji) continue
      const other = byEmoji.get(w.emoji)
      if (other && other !== w.text) at(`words "${other}" and "${w.text}" share the picture ${w.emoji}`)
      byEmoji.set(w.emoji, w.text)
    }
    if (!level.isBoss && level.words.filter(w => w.emoji).length < 6) at('needs at least 6 picture words')

    for (const h of level.newHeart) {
      if (!h.tip) at(`heart word "${h.word.text}" needs a tip`)
      if (h.heart.some(i => i < 0 || i >= h.word.units.length)) at(`heart word "${h.word.text}" has a bad heart index`)
      checkDecodable(h.word, 'heart word', h.heart)
    }

    for (const seg of def.aliens ?? []) {
      try {
        const pw = parseSeg(seg)
        checkDecodable(pw, 'alien word')
        if (level.bank.has(pw.text) || level.heart.has(pw.text)) at(`alien word "${pw.text}" is a real word in the bank`)
      } catch (e) { at(`alien "${seg}": ${(e as Error).message}`) }
    }

    // Every spoken script must play real phonics sounds, never a sound spelled as text.
    const scripts: [string, string][] = [
      ...def.sounds.map(s => [s.tip, `sound "${s.g}" tip`] as [string, string]),
      ...(def.heart ?? []).map(h => [h.tip, `heart word "${h.seg}" tip`] as [string, string]),
      [def.animal.rescue, 'rescue line'], [def.animal.fact, 'animal fact'],
    ]
    for (const [text, what] of scripts) checkScript(text).forEach(p => at(`${what}: ${p}`))

    const checkText = (text: string, what: string) => {
      if (text.length > MAX_SPOKEN) at(`${what} is too long to speak`)
      for (const tok of tokenize(text)) {
        if (/^\d+$/.test(tok.key)) continue
        if (/['’-]/.test(tok.display)) { at(`${what}: avoid contractions and hyphens ("${tok.display}")`); continue }
        if (!level.heart.has(tok.key) && !level.bank.has(tok.key)) at(`${what}: "${tok.display}" is not a taught word ("${text}")`)
      }
    }

    def.sentences.forEach((s, i) => {
      checkText(s.t, `sentence ${i + 1}`)
      if ('pic' in s) {
        const all = [s.pic, ...s.alts]
        if (new Set(all).size !== 3) at(`sentence ${i + 1}: picture choices must all differ`)
      }
    })
    if (!level.isBoss && def.sentences.length < 2) at('needs at least 2 sentences')

    if (def.story) {
      def.story.pages.forEach((p, i) => { checkText(p.t, `story page ${i + 1}`); if (!p.pic) at(`story page ${i + 1} needs a picture`) })
      checkText(def.story.title, 'story title')
      def.story.questions.forEach((q, i) => {
        if (new Set(q.options).size !== 3) at(`story question ${i + 1}: options must differ`)
        if (q.answer < 0 || q.answer > 2) at(`story question ${i + 1}: bad answer index`)
      })
      if (def.story.pages.length < 4) at('story needs at least 4 pages')
      if (def.story.questions.length < 2) at('story needs at least 2 questions')
    }
  }
  // Fixed lines, narration, and world intros.
  const fixed = [
    ...Object.values(KIT_LINES), ...Object.values(NARRATOR_LINES), ...KIT_PRAISE, ...KIT_RETRY,
    ...NARRATOR_PRAISE, ...NARRATOR_RETRY, ...narrationLines(), ...WORLDS.map(w => w.intro),
  ]
  for (const text of fixed) checkScript(text).forEach(p => errors.push(`fixed line "${text.slice(0, 40)}…": ${p}`))
  return errors
}

const NO_PROGRESS: QuestProgress = { v: 1, levels: {}, sounds: {}, wordsRead: 0, unlockAll: false, settings: { music: false, narrator: false, narratorVoice: 'verse' } }

/** Generate each level's activities many times and make sure every activity has a full set of choices. */
export function validatePlans(runs = 25): string[] {
  const errors = new Set<string>()
  for (const level of LEVELS) {
    for (let r = 0; r < runs; r++) {
      const steps = planLevel(level, NO_PROGRESS)
      const at = (msg: string) => errors.add(`${level.def.id}: plan: ${msg}`)
      if (steps.length < (level.isBoss ? 3 : 10)) at(`only ${steps.length} activities`)
      for (const st of steps) {
        if ((st.kind === 'blend' || st.kind === 'readPick') && (st.choices.length !== 3 || new Set(st.choices.map(c => c.emoji)).size !== 3))
          at(`"${st.word.text}" (${st.kind}) could not get 3 distinct pictures`)
        if (st.kind === 'goal' && st.options.length !== 3) at(`goal "${st.word.text}" has ${st.options.length} options`)
        if (st.kind === 'heart' && st.options.length !== 3) at(`heart "${st.heart.word.text}" has ${st.options.length} options`)
        if (st.kind === 'hearPick' && st.options.length !== 3) at(`sound "${st.answer}" has ${st.options.length} options`)
        if (st.kind === 'build' && st.tiles.length < st.word.chunks.length + 1) at(`build "${st.word.text}" lacks spare tiles`)
      }
    }
  }
  return [...errors]
}

export function summary(levels: LevelInfo[] = LEVELS) {
  const words = new Set<string>()
  levels.forEach(l => l.words.forEach(w => words.add(w.text)))
  return { levels: levels.length, practiceWords: words.size, sounds: levels.at(-1)?.taught.size ?? 0 }
}
