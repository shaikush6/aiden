// Block Buddy shapes. The shape itself teaches number sense:
//   even numbers stand in pairs (two columns, nothing left over)
//   odd numbers are pairs plus one block on top ("left over")
//   teens are a full ten-block with the ones beside it, which is how teen words are built
export interface BuddyCell {
  /** Column position (can be fractional: the odd block sits between the two columns). */
  x: number
  /** Row from the bottom. */
  y: number
  /** 0 = the main buddy (or the ten-block), 1 = the ones beside a ten. */
  group: 0 | 1
}

export interface BuddyLayout {
  cells: BuddyCell[]
  cols: number
  rows: number
}

function ones(n: number, dx: number, group: 0 | 1): BuddyCell[] {
  const cells: BuddyCell[] = []
  const pairs = Math.floor(n / 2)
  for (let r = 0; r < pairs; r++) cells.push({ x: dx, y: r, group }, { x: dx + 1, y: r, group })
  if (n % 2 === 1) cells.push({ x: pairs === 0 ? dx : dx + 0.5, y: pairs, group })
  return cells
}

const TEN_GAP = 2.6

export function buddyLayout(n: number): BuddyLayout {
  let cells: BuddyCell[]
  if (n <= 0) cells = []
  else if (n <= 10) cells = ones(n, 0, 0)
  else if (n >= 20) cells = [...ones(10, 0, 0), ...ones(10, TEN_GAP, 0)]
  else cells = [...ones(10, 0, 0), ...ones(n - 10, TEN_GAP, 1)]
  if (!cells.length) return { cells, cols: 2, rows: 2 }
  return {
    cells,
    cols: Math.max(...cells.map(c => c.x)) + 1,
    rows: Math.max(...cells.map(c => c.y)) + 1,
  }
}

export const isOdd = (n: number): boolean => n % 2 === 1

/** Cell colours per number, as full Tailwind classes. Index 10 is the colour of a ten-block. */
const PALETTE = [
  'bg-slate-200 border-slate-400',
  'bg-red-400 border-red-600',
  'bg-orange-400 border-orange-600',
  'bg-yellow-300 border-yellow-500',
  'bg-green-400 border-green-600',
  'bg-sky-400 border-sky-600',
  'bg-indigo-400 border-indigo-600',
  'bg-violet-400 border-violet-600',
  'bg-fuchsia-400 border-fuchsia-600',
  'bg-stone-400 border-stone-600',
  'bg-amber-200 border-amber-500',
]

export function buddyColor(n: number): string {
  return PALETTE[Math.max(0, Math.min(10, n))]
}

/** Colour for one cell: the ten-block is always gold; ones take the colour of how many there are. */
export function cellColor(n: number, group: 0 | 1): string {
  if (n <= 10) return buddyColor(n)
  return group === 0 ? PALETTE[10] : buddyColor(n - 10)
}
