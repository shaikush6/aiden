// Number stories, written with number WORDS so the child has to read the quantities:
//   "Five cats sit on the log. Two cats hop on. How many cats now?"
//   "Seven ducks sit on the rock. Three ducks run off. How many ducks are left?"
import { parseSeg } from '../reading-quest/parse.ts'
import { ANIMALS, NUMBER_TEXT, PLACES, cap, type Animal, type Place } from './words.ts'

export interface NStory {
  op: 'plus' | 'minus'
  a: number
  b: number
  answer: number
  /** The sentences the child reads, in order, ending with the question. */
  sentences: string[]
  /** Picture of the answer: e.g. "8🐱 on 🪵". */
  scene: string
  animal: Animal
  place: Place
}

type Rand = () => number
const randInt = (lo: number, hi: number, rand: Rand) => lo + Math.floor(rand() * (hi - lo + 1))

const plural = (a: Animal): string => parseSeg(a.plural).text

/** a and b are at least 2 so "cats" is always correct; the total never goes past `hi`. */
export function makeStory(op: 'plus' | 'minus', hi: number, rand: Rand = Math.random): NStory {
  const animal = ANIMALS[randInt(0, ANIMALS.length - 1, rand)]
  const place = PLACES[randInt(0, PLACES.length - 1, rand)]
  const top = Math.max(5, Math.min(hi, 10))
  let a: number, b: number, answer: number
  if (op === 'plus') {
    a = randInt(2, top - 2, rand)
    b = randInt(2, top - a, rand)
    answer = a + b
  } else {
    a = randInt(4, top, rand)
    b = randInt(2, a - 1, rand)
    answer = a - b
  }
  const pl = plural(animal)
  const sentences = [
    `${cap(NUMBER_TEXT[a])} ${pl} sit on the ${place.key}.`,
    op === 'plus' ? `${cap(NUMBER_TEXT[b])} ${pl} hop on.` : `${cap(NUMBER_TEXT[b])} ${pl} run off.`,
    op === 'plus' ? `How many ${pl} now?` : `How many ${pl} are left?`,
  ]
  return { op, a, b, answer, sentences, scene: `${answer}${animal.emoji} on ${place.emoji}`, animal, place }
}

/** Every story sentence that can ever be spoken (for the voice allowlist). */
export function allStorySentences(): string[] {
  const out: string[] = []
  for (const animal of ANIMALS) {
    const pl = plural(animal)
    out.push(`How many ${pl} now?`, `How many ${pl} are left?`)
    for (let n = 2; n <= 10; n++) {
      out.push(`${cap(NUMBER_TEXT[n])} ${pl} hop on.`, `${cap(NUMBER_TEXT[n])} ${pl} run off.`)
      for (const place of PLACES) out.push(`${cap(NUMBER_TEXT[n])} ${pl} sit on the ${place.key}.`)
    }
  }
  return out
}
