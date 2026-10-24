// Block Buddy Land: eight towns, thirty short levels. Each level is a recipe of activities.
// The journey is numeral-first: he meets numbers by counting, learns every sign (+ − = < >) in a short
// animated lesson before he is asked to use it, and reads number words as a side-quest in every town.
import { LESSONS } from './lessons.ts'
import type { ClueKind, Topic } from './terms.ts'

export type Token =
  | 'numMatch' | 'count' | 'build' | 'rocket' | 'rocketWord'
  | 'add' | 'addN' | 'sub' | 'subN' | 'missing'
  | 'more' | 'sign' | 'oddEven' | 'teenSum' | 'next' | 'before' | 'between' | 'skip' | 'double' | 'bond'
  | 'riddle' | 'story' | 'wordNum' | 'wordSign' | 'wordBond' | 'soundCompare'

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
  /** Block Buddies introduced here (the numbers), in order. */
  meets: number[]
  /** Lessons played first, after the new buddies. */
  learn: Topic[]
  /** Numbers used for practice. Buddies the child has not met yet are never used. */
  range: [number, number]
  /** The activities after the lessons. */
  plan: Token[]
  /** Which clue types riddles in this level may use. */
  riddle?: ClueKind[]
  boss?: boolean
}

export const TOWNS: Town[] = [
  { id: 't1', name: 'Counting Cove', emoji: '🏖️', theme: 'from-cyan-300 via-sky-200 to-blue-200 dark:from-cyan-950 dark:via-slate-900 dark:to-slate-950', skill: 'Meet the numbers zero to ten by counting blocks, and match numerals, Block Buddies and number names.' },
  { id: 't2', name: 'Plus Park', emoji: '🌳', theme: 'from-lime-300 via-green-200 to-emerald-200 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950', skill: 'The plus and equals signs. Adding up to ten with pictures, then with numerals, then in number stories.' },
  { id: 't3', name: 'Minus Mountain', emoji: '⛰️', theme: 'from-slate-300 via-blue-200 to-indigo-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950', skill: 'The minus sign. Taking away, and mixing plus and minus in number stories.' },
  { id: 't4', name: 'Compare Castle', emoji: '🏰', theme: 'from-fuchsia-300 via-pink-200 to-rose-200 dark:from-fuchsia-950 dark:via-slate-900 dark:to-slate-950', skill: 'More and less, and the signs < and > (the hungry mouth) and =.' },
  { id: 't5', name: 'Teen Tower', emoji: '🏗️', theme: 'from-amber-300 via-yellow-200 to-orange-200 dark:from-amber-950 dark:via-slate-900 dark:to-slate-950', skill: 'The teens as a ten plus some ones, numbers to twenty, what comes next, and skip counting.' },
  { id: 't6', name: 'Pairs Playground', emoji: '🎪', theme: 'from-teal-300 via-emerald-200 to-green-200 dark:from-teal-950 dark:via-slate-900 dark:to-slate-950', skill: 'Odd and even, doubles, and the pairs of numbers that make ten.' },
  { id: 't7', name: 'Detective Agency', emoji: '🔍', theme: 'from-slate-400 via-indigo-300 to-violet-300 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-950', skill: 'Spoken number riddles with clues, and number stories with animals.' },
  { id: 't8', name: 'Word Wizard Tower', emoji: '📖', theme: 'from-orange-300 via-red-200 to-rose-200 dark:from-orange-950 dark:via-slate-900 dark:to-slate-950', skill: 'Reading the number names, and splitting words into the first sound and the rest.' },
]

export const NUMBER_LEVELS: NLevel[] = [
  // Town 1: Counting Cove
  { id: 'n1', town: 0, title: 'Hello, Block Buddies!', icon: '👋', meets: [1, 2, 3], learn: ['words'], range: [1, 3], plan: ['numMatch', 'count', 'numMatch', 'build', 'wordNum', 'count', 'numMatch'] },
  { id: 'n2', town: 0, title: 'Four, Five and Six', icon: '🖐️', meets: [4, 5, 6], learn: [], range: [1, 6], plan: ['numMatch', 'count', 'build', 'numMatch', 'wordNum', 'count', 'numMatch'] },
  { id: 'n3', town: 0, title: 'Seven to Ten', icon: '🔟', meets: [7, 8, 9, 10], learn: [], range: [1, 10], plan: ['count', 'numMatch', 'build', 'numMatch', 'wordNum', 'count', 'rocket'] },
  { id: 'n4', town: 0, title: 'Zero and Friends', icon: '0️⃣', meets: [0], learn: [], range: [0, 10], plan: ['count', 'numMatch', 'count', 'wordNum', 'numMatch', 'rocket'], boss: true },
  // Town 2: Plus Park
  { id: 'n5', town: 1, title: 'The Plus Sign', icon: '➕', meets: [], learn: ['plus'], range: [1, 5], plan: ['add', 'add', 'add', 'add', 'add', 'add'] },
  { id: 'n6', town: 1, title: 'The Equals Sign', icon: '🟰', meets: [], learn: ['equals'], range: [1, 6], plan: ['add', 'add', 'addN', 'missing', 'add', 'missing'] },
  { id: 'n7', town: 1, title: 'Bigger Sums', icon: '🧮', meets: [], learn: [], range: [1, 10], plan: ['addN', 'addN', 'missing', 'addN', 'addN', 'missing', 'addN'] },
  { id: 'n8', town: 1, title: 'Plus Stories', icon: '🐸', meets: [], learn: ['story'], range: [1, 10], plan: ['story', 'story', 'addN', 'story', 'missing', 'story'], boss: true },
  // Town 3: Minus Mountain
  { id: 'n9', town: 2, title: 'The Minus Sign', icon: '➖', meets: [], learn: ['minus'], range: [1, 5], plan: ['sub', 'sub', 'sub', 'sub', 'sub', 'sub'] },
  { id: 'n10', town: 2, title: 'Take Away More', icon: '🍪', meets: [], learn: [], range: [1, 10], plan: ['sub', 'subN', 'subN', 'subN', 'sub', 'subN', 'subN'] },
  { id: 'n11', town: 2, title: 'Plus or Minus?', icon: '🔀', meets: [], learn: [], range: [1, 10], plan: ['addN', 'subN', 'wordSign', 'addN', 'subN', 'wordSign', 'story', 'subN'] },
  { id: 'n12', town: 2, title: 'Summit Stories', icon: '🏔️', meets: [], learn: [], range: [1, 10], plan: ['story', 'story', 'subN', 'story', 'addN', 'story', 'rocket'], boss: true },
  // Town 4: Compare Castle
  { id: 'n13', town: 3, title: 'More and Less', icon: '⚖️', meets: [], learn: ['compare'], range: [1, 10], plan: ['more', 'more', 'more', 'more', 'numMatch', 'more'] },
  { id: 'n14', town: 3, title: 'The Hungry Mouth', icon: '🐊', meets: [], learn: ['signs'], range: [1, 10], plan: ['sign', 'sign', 'sign', 'sign', 'sign', 'more', 'sign'] },
  { id: 'n15', town: 3, title: 'Same or Different?', icon: '👯', meets: [], learn: [], range: [1, 10], plan: ['sign', 'sign', 'sign', 'more', 'sign', 'sign', 'sign', 'more'], boss: true },
  // Town 5: Teen Tower
  { id: 'n16', town: 4, title: 'Eleven, Twelve, Thirteen', icon: '🏗️', meets: [11, 12, 13], learn: ['teen'], range: [1, 13], plan: ['numMatch', 'count', 'build', 'teenSum', 'wordNum', 'numMatch', 'teenSum'] },
  { id: 'n17', town: 4, title: 'Fourteen, Fifteen, Sixteen', icon: '🏗️', meets: [14, 15, 16], learn: [], range: [1, 16], plan: ['numMatch', 'count', 'build', 'teenSum', 'wordNum', 'numMatch', 'teenSum'] },
  { id: 'n18', town: 4, title: 'Seventeen to Twenty', icon: '2️⃣', meets: [17, 18, 19, 20], learn: [], range: [1, 20], plan: ['numMatch', 'count', 'build', 'teenSum', 'wordNum', 'count', 'rocket'], boss: true },
  { id: 'n19', town: 4, title: 'What Comes Next?', icon: '🪜', meets: [], learn: ['next'], range: [1, 20], plan: ['next', 'before', 'between', 'next', 'before', 'between', 'next'] },
  { id: 'n20', town: 4, title: 'Skip Counting', icon: '🐸', meets: [], learn: ['skip'], range: [1, 20], plan: ['skip', 'skip', 'next', 'skip', 'skip', 'before'], boss: true },
  // Town 6: Pairs Playground
  { id: 'n21', town: 5, title: 'Odd or Even?', icon: '🎲', meets: [], learn: ['oddEven'], range: [1, 10], plan: ['oddEven', 'oddEven', 'oddEven', 'oddEven', 'oddEven', 'numMatch', 'oddEven'] },
  { id: 'n22', town: 5, title: 'Doubles', icon: '👯', meets: [], learn: ['double'], range: [1, 10], plan: ['double', 'double', 'double', 'double', 'addN', 'double'] },
  { id: 'n23', town: 5, title: 'Make Ten', icon: '🔟', meets: [], learn: ['bond'], range: [1, 10], plan: ['bond', 'bond', 'bond', 'bond', 'bond', 'missing', 'bond'], boss: true },
  // Town 7: Detective Agency
  { id: 'n24', town: 6, title: 'The First Clue', icon: '🔍', meets: [], learn: ['riddle'], range: [1, 10], plan: ['riddle', 'riddle', 'riddle', 'riddle', 'riddle'], riddle: ['more', 'less'] },
  { id: 'n25', town: 6, title: 'Odd, Even and One More', icon: '🕵️', meets: [], learn: [], range: [1, 10], plan: ['riddle', 'riddle', 'oddEven', 'riddle', 'riddle', 'riddle'], riddle: ['more', 'less', 'odd', 'even', 'onemore'] },
  { id: 'n26', town: 6, title: 'The Big Case', icon: '🗂️', meets: [], learn: [], range: [1, 10], plan: ['riddle', 'story', 'riddle', 'story', 'riddle', 'story', 'rocket'], riddle: ['more', 'less', 'odd', 'even', 'onemore'], boss: true },
  // Town 8: Word Wizard Tower
  { id: 'n27', town: 7, title: 'Number Names to Ten', icon: '🔤', meets: [], learn: [], range: [0, 10], plan: ['wordNum', 'wordNum', 'wordNum', 'wordNum', 'rocketWord', 'wordNum', 'wordNum'] },
  { id: 'n28', town: 7, title: 'The Teen Names', icon: '📚', meets: [], learn: [], range: [11, 20], plan: ['wordNum', 'wordNum', 'wordNum', 'wordNum', 'rocketWord', 'wordNum', 'wordNum'] },
  { id: 'n29', town: 7, title: 'Split the Word', icon: '✂️', meets: [], learn: [], range: [1, 10], plan: ['wordBond', 'wordBond', 'wordBond', 'wordBond', 'wordBond', 'wordBond'] },
  { id: 'n30', town: 7, title: 'Word Wizard Champion', icon: '🏆', meets: [], learn: [], range: [1, 10], plan: ['wordBond', 'soundCompare', 'wordNum', 'soundCompare', 'rocketWord', 'wordBond', 'soundCompare'], boss: true },
]

const BY_ID = new Map(NUMBER_LEVELS.map(l => [l.id, l]))
export const getNumberLevel = (id: string): NLevel | undefined => BY_ID.get(id)
export const levelIndex = (id: string): number => NUMBER_LEVELS.findIndex(l => l.id === id)

/** Numbers the child has met once level `index` is reached (cumulative). */
export function knownNumbersAt(index: number): number[] {
  const out = new Set<number>()
  for (let i = 0; i <= index && i < NUMBER_LEVELS.length; i++) NUMBER_LEVELS[i].meets.forEach(n => out.add(n))
  return [...out].sort((a, b) => a - b)
}

/** Lessons the child has had once level `index` is reached (cumulative). */
export function knownTopicsAt(index: number): Set<Topic> {
  const out = new Set<Topic>(['numerals'])
  for (let i = 0; i <= index && i < NUMBER_LEVELS.length; i++) NUMBER_LEVELS[i].learn.forEach(t => out.add(t))
  return out
}

/** One line on the map saying what a level is about, so he (and a grown-up) can see where the journey goes. */
export function levelBlurb(level: NLevel): string {
  if (level.learn.length && level.learn[0] !== 'words') return `Learn: ${LESSONS[level.learn[0]].title.toLowerCase()}`
  if (level.meets.length) return `Meet ${level.meets.length === 1 ? 'the number' : 'the numbers'} ${level.meets.join(', ')}`
  return 'Practice'
}
