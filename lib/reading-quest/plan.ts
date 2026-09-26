// Builds the activity sequence for one play of a level.
// Call it from an event handler (it uses randomness), then pass the steps down as props.
import { tokenize, type HeartWord, type LevelInfo, type StorySum } from './catalog.ts'
import { defaultPhoneme, isKnownGrapheme } from './phonemes.ts'
import type { ParsedWord, SentenceDef, SoundDef, StoryDef } from './types.ts'
import type { QuestProgress } from './progress.ts'

export type Step =
  | { kind: 'meet'; sound: SoundDef; phoneme: string; examples: ParsedWord[] }
  | { kind: 'hearPick'; phoneme: string; answer: string; options: string[]; gpc: string }
  | { kind: 'blend'; word: ParsedWord; choices: ParsedWord[] }
  | { kind: 'readPick'; word: ParsedWord; choices: ParsedWord[] }
  | { kind: 'build'; word: ParsedWord; tiles: string[] }
  | { kind: 'goal'; word: ParsedWord; options: ParsedWord[] }
  | { kind: 'alien'; word: ParsedWord; real: boolean }
  | { kind: 'heart'; heart: HeartWord; options: ParsedWord[] }
  | { kind: 'sentence'; sentence: SentenceDef; pics?: string[] }
  | { kind: 'story'; story: StoryDef }
  | { kind: 'soundBlocks'; word: ParsedWord }
  | { kind: 'readNumber'; word: ParsedWord; value: number }
  | { kind: 'storySum'; sum: StorySum; options: number[] }
  | { kind: 'wordChain'; chain: ParsedWord[]; palettes: string[][] }
  | { kind: 'bubblePop'; phoneme: string; correct: string[]; bubbles: { label: string; correct: boolean }[] }
  | { kind: 'rocketRead'; rounds: { word: ParsedWord; choices: ParsedWord[] }[] }

/** Steps that are scored (everything except introducing a new sound). */
export function isScored(step: Step): boolean {
  return step.kind !== 'meet'
}

/** How many words the child reads in a step, for the "words read" counter. */
export function wordsInStep(step: Step): number {
  if (step.kind === 'sentence') return tokenize(step.sentence.t).length
  if (step.kind === 'story') return step.story.pages.reduce((n, p) => n + tokenize(p.t).length, 0)
  if (step.kind === 'storySum') return tokenize(step.sum.text).length
  if (step.kind === 'wordChain') return step.chain.length
  if (step.kind === 'rocketRead') return step.rounds.length
  if (step.kind === 'meet' || step.kind === 'hearPick' || step.kind === 'bubblePop') return 0
  return 1
}

/** Sound ids practiced by a step, for the parent's "tricky sounds" view. */
export function gpcsInStep(step: Step): string[] {
  switch (step.kind) {
    case 'hearPick': return [step.gpc]
    case 'blend': case 'readPick': case 'build': case 'goal': return step.word.units.map(u => u.gpc)
    case 'alien': case 'soundBlocks': return step.word.units.map(u => u.gpc)
    case 'bubblePop': return step.correct
    default: return []
  }
}

export function displayGrapheme(g: string): string {
  return g.replace('_', '‑')
}

// ---------- helpers ----------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Higher = looks more alike (same length, same sounds in the same places). */
function similarity(a: ParsedWord, b: ParsedWord): number {
  let score = a.units.length === b.units.length ? 3 : 0
  const n = Math.min(a.units.length, b.units.length)
  for (let i = 0; i < n; i++) if (a.units[i].gpc === b.units[i].gpc) score += 2
  if (a.text[0] === b.text[0]) score += 1
  return score + Math.random()   // break ties differently each play
}

function pickSimilar(target: ParsedWord, pool: ParsedWord[], count: number, needEmoji: boolean): ParsedWord[] {
  const seenText = new Set([target.text])
  const seenEmoji = new Set([target.emoji])
  const ranked = pool
    .filter(w => (!needEmoji || w.emoji) && w.text !== target.text)
    .sort((a, b) => similarity(target, b) - similarity(target, a))
  const out: ParsedWord[] = []
  for (const w of ranked) {
    if (out.length === count) break
    if (seenText.has(w.text) || (needEmoji && seenEmoji.has(w.emoji))) continue
    seenText.add(w.text)
    seenEmoji.add(w.emoji)
    out.push(w)
  }
  return out
}

/** Endless supply of focus words: each is used once before any repeats. */
function wordFeeder(words: ParsedWord[]): () => ParsedWord {
  let queue: ParsedWord[] = []
  return () => {
    if (!queue.length) queue = shuffle(words)
    return queue.shift()!
  }
}

// ---------- step builders ----------

function hearPickStep(level: LevelInfo, gpc: string): Step | null {
  const [grapheme] = gpc.split('=')
  const phoneme = defaultPhoneme(grapheme)
  // Only plain spellings, and never two options that make the same sound (c and k, ai and ay).
  const others = shuffle(
    [...level.taught].filter(g => !g.includes('=') && isKnownGrapheme(g) && defaultPhoneme(g) !== phoneme),
  )
  // Prefer distractors that look different from the answer.
  const distractors = others.sort((a, b) => Number(a[0] === grapheme[0]) - Number(b[0] === grapheme[0])).slice(0, 2)
  if (distractors.length < 2) return null
  return { kind: 'hearPick', phoneme, answer: grapheme, options: shuffle([grapheme, ...distractors]), gpc: grapheme }
}

function buildTiles(level: LevelInfo, word: ParsedWord): string[] {
  const inWord = new Set(word.chunks.map(c => c.text))
  const spare = shuffle(
    [...level.taught].filter(g => !g.includes('=') && !g.includes('_') && isKnownGrapheme(g) && !inWord.has(g)),
  ).slice(0, 2)
  return shuffle([...word.chunks.map(c => c.text), ...spare])
}

function newSoundGpcs(level: LevelInfo): string[] {
  return level.newGpcs.filter(g => !g.includes('='))
}

/** Plain sound ids from earlier levels, weakest first (so review targets what the child finds hard). */
function reviewGpcs(level: LevelInfo, progress: QuestProgress): string[] {
  const fresh = new Set(level.newGpcs)
  const older = [...level.taught].filter(g => !fresh.has(g) && !g.includes('=') && isKnownGrapheme(g))
  const rate = (g: string) => {
    const s = progress.sounds[g]
    return s ? s.wrong / (s.right + s.wrong + 1) : 0
  }
  return shuffle(older).sort((a, b) => rate(b) - rate(a))
}

/** Plain spellings the child knows (no alternative sounds, no split magic-e), for tiles and bubbles. */
function plainGraphemes(level: LevelInfo): string[] {
  return [...level.taught].filter(g => !g.includes('=') && !g.includes('_') && isKnownGrapheme(g))
}

/** Bubble Pop: pop every bubble whose spelling makes the target sound (teaches alternative spellings too). */
function bubbleStep(level: LevelInfo, gpc: string): Step | null {
  const phoneme = defaultPhoneme(gpc.split('=')[0])
  const plain = plainGraphemes(level)
  const correct = plain.filter(g => defaultPhoneme(g) === phoneme)
  const others = shuffle(plain.filter(g => defaultPhoneme(g) !== phoneme))
  if (!correct.length || others.length < 4) return null
  const bubbles = shuffle([
    ...Array.from({ length: 5 }, (_, i) => ({ label: correct[i % correct.length], correct: true })),
    ...others.slice(0, 5).map(label => ({ label, correct: false })),
  ])
  return { kind: 'bubblePop', phoneme, correct, bubbles }
}

/** Word Chain Bridge: four words, each one sound different from the last (cat → cot → dot → dog). */
function chainStep(level: LevelInfo): Step | null {
  const simple = (w: ParsedWord) => w.units.every(u => u.chunks.length === 1 && isKnownGrapheme(u.grapheme))
  const words = [...level.bank.values()].filter(w => simple(w) && w.units.length >= 3 && w.units.length <= 4)
  const diffAt = (a: ParsedWord, b: ParsedWord) => {
    if (a.units.length !== b.units.length) return -1
    let at = -1
    for (let i = 0; i < a.units.length; i++) {
      if (a.units[i].grapheme !== b.units[i].grapheme) { if (at !== -1) return -1; at = i }
    }
    return at
  }
  const starts = shuffle(level.words.filter(simple).concat(shuffle(words).slice(0, 20)))
  for (const start of starts.slice(0, 30)) {
    const chain = [start]
    while (chain.length < 4) {
      const last = chain[chain.length - 1]
      const next = shuffle(words).find(w => diffAt(last, w) >= 0 && !chain.some(c => c.text === w.text))
      if (!next) break
      chain.push(next)
    }
    if (chain.length < 4) continue
    const plain = plainGraphemes(level)
    const palettes = chain.slice(1).map((w, i) => {
      const at = diffAt(chain[i], w)
      const right = w.units[at].grapheme
      const wrong = shuffle(plain.filter(g => g !== right && g !== chain[i].units[at].grapheme)).slice(0, 3)
      return shuffle([right, ...wrong])
    })
    return { kind: 'wordChain', chain, palettes }
  }
  return null
}

/** Rocket Read: six quick words, two pictures each, as fast as possible. */
function rocketStep(level: LevelInfo, pictureBank: ParsedWord[]): Step | null {
  const pool = shuffle(level.world.levels.flatMap(d => pictureBank.filter(w => d.words.some(x => x.seg === w.seg))))
  const words = (pool.length >= 6 ? pool : shuffle(pictureBank)).slice(0, 6)
  if (words.length < 6) return null
  return { kind: 'rocketRead', rounds: words.map(word => ({ word, choices: shuffle([word, ...pickSimilar(word, pictureBank, 1, true)]) })) }
}

/** Three Block Buddies to choose from: the answer and two close numbers (1-10). */
function numberChoices(answer: number): number[] {
  const near = [answer - 1, answer + 1, answer - 2, answer + 2].filter(n => n >= 1 && n <= 10)
  return shuffle([answer, ...shuffle(near).slice(0, 2)])
}

/** A Block Buddy maths moment: read a number word, or read a number story. Alternates by level. */
function mathStep(level: LevelInfo): Step | null {
  const numbers = level.numberWords.filter(n => n.value >= 2)
  const sum = level.sums.length ? level.sums[Math.floor(Math.random() * level.sums.length)] : null
  const preferSum = level.index % 2 === 1
  if (sum && (preferSum || !numbers.length)) return { kind: 'storySum', sum, options: numberChoices(sum.answer) }
  if (numbers.length) {
    const n = numbers[Math.floor(Math.random() * numbers.length)]
    return { kind: 'readNumber', word: n.word, value: n.value }
  }
  return null
}

export function planLevel(level: LevelInfo, progress: QuestProgress): Step[] {
  const pictureBank = [...level.bank.values()].filter(w => w.emoji)
  const allBank = [...level.bank.values()]
  const review = reviewGpcs(level, progress)
  const steps: Step[] = []
  const push = (s: Step | null) => { if (s) steps.push(s) }

  if (level.isBoss && level.def.story) {
    review.slice(0, 1).forEach(g => push(hearPickStep(level, g)))
    push(rocketStep(level, pictureBank))
    push(mathStep(level))
    push({ kind: 'story', story: level.def.story })
    return steps
  }

  // 1. Meet each new sound, with example words that contain it.
  for (const sound of level.def.sounds) {
    const id = sound.p ? `${sound.g}=${sound.p}` : sound.g
    const examples = level.words.filter(w => w.emoji && w.units.some(u => u.gpc === id)).slice(0, 3)
    push({ kind: 'meet', sound, phoneme: sound.p ?? defaultPhoneme(sound.g), examples })
  }

  // 2. Practice, interleaved so no two activities of the same kind sit together.
  const fresh = newSoundGpcs(level)
  const focus = level.words.filter(w => w.emoji && (!fresh.length || w.units.some(u => fresh.includes(u.gpc))))
  const nextWord = wordFeeder(focus.length >= 4 ? focus : level.words.filter(w => w.emoji))
  const hearTargets = [...shuffle(fresh), ...review]
  let hearIdx = 0
  const nextHear = () => hearPickStep(level, hearTargets[hearIdx++ % Math.max(1, hearTargets.length)])

  const picture = (kind: 'blend' | 'readPick'): Step => {
    const word = nextWord()
    return { kind, word, choices: shuffle([word, ...pickSimilar(word, pictureBank, 2, true)]) }
  }
  const build = (): Step => {
    let word = nextWord()
    for (let tries = 0; tries < 4 && word.chunks.length > 6; tries++) word = nextWord()
    return { kind: 'build', word, tiles: buildTiles(level, word) }
  }
  const goal = (): Step => {
    const word = nextWord()
    return { kind: 'goal', word, options: shuffle([word, ...pickSimilar(word, allBank, 2, false)]) }
  }
  const aliens = shuffle(level.aliens)
  const alien = (i: number): Step | null => {
    if (i % 2 === 0 && aliens.length) return { kind: 'alien', word: aliens.shift()!, real: false }
    return { kind: 'alien', word: nextWord(), real: true }
  }

  // Sound check: Bubble Pop when the level brings a new sound, otherwise a quick sound hunt.
  const bubble = fresh.length ? bubbleStep(level, shuffle(fresh)[0]) : null
  if (bubble) push(bubble)
  else if (hearTargets.length) push(nextHear())
  push(picture('blend'))
  push(goal())
  push(picture('blend'))
  push(build())
  if (hearTargets.length) push(nextHear())
  push(picture('readPick'))
  for (const heart of level.newHeart) {
    const pool = [...allBank, ...[...level.heart.values()].map(h => h.word)]
    push({ kind: 'heart', heart, options: shuffle([heart.word, ...pickSimilar(heart.word, pool, 2, false)]) })
  }
  const alienOrder = shuffle([0, 1])
  if (level.aliens.length) push(alien(alienOrder[0]))
  push(chainStep(level))
  push(picture('readPick'))
  // Sound Blocks: count the sounds (not letters) with a Block Buddy tower.
  const blockWord = shuffle(focus.length ? focus : level.words.filter(w => w.emoji)).find(w => w.units.length >= 2 && w.units.length <= 6)
  if (blockWord) push({ kind: 'soundBlocks', word: blockWord })
  if (level.aliens.length) push(alien(alienOrder[1]))
  push(mathStep(level))

  for (const sentence of shuffle(level.def.sentences).slice(0, 3)) {
    push({ kind: 'sentence', sentence, pics: 'pic' in sentence ? shuffle([sentence.pic, ...sentence.alts]) : undefined })
  }
  return steps
}
