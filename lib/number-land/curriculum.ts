// Block Buddy Land: six towns, twenty-one levels. Each level is a recipe of activities.
// The order teaches number words first, then math words, then puts them to work.
import type { ClueKind } from './riddles.ts'

export type Token =
  | 'meetBuddies' | 'meetWords' | 'wake' | 'build' | 'plus' | 'minus' | 'compare'
  | 'oddEven' | 'riddle' | 'story' | 'wordBond' | 'soundCompare' | 'rocket'

export interface Town {
  id: string
  name: string
  emoji: string
  /** Tailwind gradient classes (light and dark). */
  theme: string
  /** One line for the grown-ups panel. */
  skill: string
}

export interface NLevel {
  id: string
  town: number
  title: string
  /** Icon on the map node when the level has no new buddy to show. */
  icon: string
  /** Block Buddies introduced here (the numbers). */
  buddies: number[]
  /** Math words introduced here (keys of MATH_WORDS). */
  words: string[]
  /** Numbers used for practice. Buddies the child has not met yet are never used. */
  range: [number, number]
  plan: Token[]
  /** Which clue types riddles in this level may use. */
  riddle?: ClueKind[]
  boss?: boolean
}

export const TOWNS: Town[] = [
  { id: 't1', name: 'Tiny Town', emoji: '🏘️', theme: 'from-lime-300 via-green-200 to-emerald-200 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950', skill: 'Read the number words zero to five and match them to Block Buddies.' },
  { id: 't2', name: 'Six Street', emoji: '🏙️', theme: 'from-sky-300 via-cyan-200 to-blue-200 dark:from-sky-950 dark:via-slate-900 dark:to-slate-950', skill: 'Read the number words six to ten, including the tricky eight.' },
  { id: 't3', name: 'Math Word Park', emoji: '🌳', theme: 'from-amber-300 via-yellow-200 to-orange-200 dark:from-amber-950 dark:via-slate-900 dark:to-slate-950', skill: 'Read math words (plus, minus, more, less, odd, even) and number sentences.' },
  { id: 't4', name: 'Teen Tower', emoji: '🏰', theme: 'from-fuchsia-300 via-pink-200 to-rose-200 dark:from-fuchsia-950 dark:via-slate-900 dark:to-slate-950', skill: 'Read the teen words eleven to twenty; every teen is a ten plus some ones.' },
  { id: 't5', name: 'Detective Agency', emoji: '🔍', theme: 'from-slate-400 via-indigo-300 to-violet-300 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950', skill: 'Read riddles and number stories, then reason out the answer.' },
  { id: 't6', name: 'Word Gym', emoji: '🏋️', theme: 'from-orange-300 via-red-200 to-rose-200 dark:from-orange-950 dark:via-slate-900 dark:to-slate-950', skill: 'Split words into the first sound and the rest, and count the sounds in words.' },
]

export const NUMBER_LEVELS: NLevel[] = [
  // Town 1: Tiny Town
  { id: 'nl1', town: 0, title: 'Hello, Zero, One and Two', icon: '👋', buddies: [0, 1, 2], words: [], range: [0, 3], plan: ['meetBuddies', 'wake', 'wake', 'build', 'wake', 'build', 'wake'] },
  { id: 'nl2', town: 0, title: 'Three and Four', icon: '🧱', buddies: [3, 4], words: [], range: [1, 4], plan: ['meetBuddies', 'wake', 'wake', 'build', 'wake', 'build', 'wake', 'build'] },
  { id: 'nl3', town: 0, title: 'Five Alive!', icon: '🖐️', buddies: [5], words: [], range: [1, 5], plan: ['meetBuddies', 'wake', 'build', 'wake', 'rocket', 'build', 'wake'], boss: true },
  // Town 2: Six Street
  { id: 'nl4', town: 1, title: 'Six and Seven', icon: '🧱', buddies: [6, 7], words: [], range: [1, 7], plan: ['meetBuddies', 'wake', 'wake', 'build', 'wake', 'build', 'wake', 'build'] },
  { id: 'nl5', town: 1, title: 'Eight and Nine', icon: '🧱', buddies: [8, 9], words: [], range: [1, 9], plan: ['meetBuddies', 'wake', 'wake', 'build', 'wake', 'build', 'wake', 'build'] },
  { id: 'nl6', town: 1, title: 'Big Ten!', icon: '🔟', buddies: [10], words: [], range: [1, 10], plan: ['meetBuddies', 'wake', 'build', 'wake', 'build', 'rocket', 'wake'], boss: true },
  // Town 3: Math Word Park
  { id: 'nl7', town: 2, title: 'Plus Park', icon: '➕', buddies: [], words: ['and', 'is', 'plus'], range: [1, 6], plan: ['meetWords', 'plus', 'plus', 'plus', 'build', 'plus', 'plus'] },
  { id: 'nl8', town: 2, title: 'Minus Mountain', icon: '➖', buddies: [], words: ['minus'], range: [1, 8], plan: ['meetWords', 'minus', 'minus', 'plus', 'minus', 'minus', 'plus', 'minus'] },
  { id: 'nl9', town: 2, title: 'More or Less?', icon: '⚖️', buddies: [], words: ['which', 'or', 'more', 'less', 'than'], range: [1, 10], plan: ['meetWords', 'compare', 'compare', 'compare', 'compare', 'wake', 'compare', 'compare'] },
  { id: 'nl10', town: 2, title: 'Odd or Even?', icon: '🎲', buddies: [], words: ['odd', 'even'], range: [1, 10], plan: ['meetWords', 'oddEven', 'oddEven', 'oddEven', 'oddEven', 'build', 'oddEven', 'compare'] },
  { id: 'nl11', town: 2, title: 'Word Park Rally', icon: '🏁', buddies: [], words: [], range: [1, 10], plan: ['plus', 'minus', 'compare', 'oddEven', 'rocket', 'plus', 'minus', 'compare', 'oddEven'], boss: true },
  // Town 4: Teen Tower
  { id: 'nl12', town: 3, title: 'Eleven to Thirteen', icon: '🧱', buddies: [11, 12, 13], words: [], range: [1, 13], plan: ['meetBuddies', 'wake', 'wake', 'build', 'wake', 'build', 'plus'] },
  { id: 'nl13', town: 3, title: 'Fourteen to Sixteen', icon: '🧱', buddies: [14, 15, 16], words: [], range: [1, 16], plan: ['meetBuddies', 'wake', 'wake', 'build', 'wake', 'build', 'minus'] },
  { id: 'nl14', town: 3, title: 'Seventeen to Nineteen', icon: '🧱', buddies: [17, 18, 19], words: [], range: [1, 19], plan: ['meetBuddies', 'wake', 'wake', 'build', 'wake', 'build', 'oddEven'] },
  { id: 'nl15', town: 3, title: 'Twenty!', icon: '2️⃣', buddies: [20], words: [], range: [1, 20], plan: ['meetBuddies', 'wake', 'build', 'plus', 'minus', 'rocket', 'oddEven', 'compare'], boss: true },
  // Town 5: Detective Agency
  { id: 'nl16', town: 4, title: 'The First Clue', icon: '🔍', buddies: [], words: ['who', 'am', 'i'], range: [1, 10], plan: ['meetWords', 'riddle', 'riddle', 'riddle', 'riddle', 'wake', 'riddle'], riddle: ['more', 'less'] },
  { id: 'nl17', town: 4, title: 'Odd and Even Clues', icon: '🕵️', buddies: [], words: [], range: [1, 10], plan: ['riddle', 'riddle', 'oddEven', 'riddle', 'riddle', 'riddle', 'compare'], riddle: ['more', 'less', 'odd', 'even'] },
  { id: 'nl18', town: 4, title: 'The Big Case', icon: '🗂️', buddies: [], words: ['how', 'many', 'now', 'are', 'left'], range: [1, 10], plan: ['meetWords', 'story', 'story', 'riddle', 'riddle', 'story', 'rocket'], riddle: ['more', 'less', 'odd', 'even', 'onemore'], boss: true },
  // Town 6: Word Gym
  { id: 'nl19', town: 5, title: 'Split the Word', icon: '✂️', buddies: [], words: [], range: [1, 10], plan: ['wordBond', 'wordBond', 'wordBond', 'wordBond', 'wordBond', 'wordBond'] },
  { id: 'nl20', town: 5, title: 'More Sounds?', icon: '👂', buddies: [], words: [], range: [1, 10], plan: ['soundCompare', 'soundCompare', 'soundCompare', 'soundCompare', 'soundCompare', 'soundCompare'] },
  { id: 'nl21', town: 5, title: 'Gym Champion', icon: '🏆', buddies: [], words: [], range: [1, 10], plan: ['wordBond', 'soundCompare', 'wordBond', 'soundCompare', 'rocket', 'wordBond', 'soundCompare'], boss: true },
]

const BY_ID = new Map(NUMBER_LEVELS.map(l => [l.id, l]))
export const getNumberLevel = (id: string): NLevel | undefined => BY_ID.get(id)

/** Numbers the child can read once level `index` is reached (cumulative). */
export function knownNumbersAt(index: number): number[] {
  const out = new Set<number>()
  for (let i = 0; i <= index && i < NUMBER_LEVELS.length; i++) NUMBER_LEVELS[i].buddies.forEach(n => out.add(n))
  return [...out].sort((a, b) => a - b)
}

/** Math words the child can read once level `index` is reached (cumulative). */
export function knownWordsAt(index: number): Set<string> {
  const out = new Set<string>()
  for (let i = 0; i <= index && i < NUMBER_LEVELS.length; i++) NUMBER_LEVELS[i].words.forEach(w => out.add(w))
  return out
}

export const levelIndex = (id: string): number => NUMBER_LEVELS.findIndex(l => l.id === id)
