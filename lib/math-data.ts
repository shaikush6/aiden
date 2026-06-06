// ── Core types ──────────────────────────────────────────────────────

export type MathLane = 'SUBITIZE' | 'BUILD' | 'COMPARE' | 'PATH' | 'COMPOSE';

export type MathMode =
  | 'QUICK_LOOK'    // Lane SUBITIZE: flash objects, child rebuilds count
  | 'BUILD_ME'      // Lane BUILD: produce exact set by tapping objects in
  | 'COUNT'         // Lane BUILD: count scattered objects, touch each one
  | 'WHICH_MORE'    // Lane COMPARE: more/less with bridge matching
  | 'CONSERVATION'  // Lane COMPARE: same group rearranged — still same number?
  | 'NUMBER_LINE'   // Lane PATH: hop path, drag jump arcs
  | 'ONE_MORE'      // Lane PATH: one-more/one-less machine
  | 'BONDS'         // Lane COMPOSE: split train, drag divider
  | 'HIDE_FIND'     // Lane COMPOSE: cup counters — whole minus visible part
  | 'BALANCE'       // Lane COMPOSE: balance scale equality
  | 'ADD'           // Lane COMPOSE: bus stop — drag characters, equation after
  | 'MISSING'       // Lane COMPOSE: bead string with gap
  | 'TEN_FRAME';    // Lane COMPOSE: fill the ten-frame

export interface MathActivity {
  id: MathMode;
  lane: MathLane;
  label: string;
  icon: string;
  cogLevel: number;        // 1-5
  description: string;     // one sentence for tooltip
}

export interface CountProblem {
  id: number;
  count: number;
  emoji: string;
  options: number[];
}

export interface NumberBond {
  total: number;
  partA: number;
  partB: number;
  emoji: string;
}

// ── Object palette ──────────────────────────────────────────────────

export const OBJECT_EMOJIS = [
  '🍎', '🌟', '🐱', '🐶', '🦋', '🌺', '🍊', '🐸',
  '🚗', '⭐', '🎈', '🐣', '🦄', '🍓', '🌈', '🐢',
];

// ── Count mode (used by COUNT) ──────────────────────────────────────

export function generateCountProblems(): CountProblem[] {
  const problems: CountProblem[] = [];
  for (let i = 0; i < 15; i++) {
    const count = Math.floor(Math.random() * 10) + 1;
    const emoji = OBJECT_EMOJIS[i % OBJECT_EMOJIS.length];
    const wrong1 = count + (Math.random() > 0.5 ? 1 : -1);
    const wrong2 = count + (Math.random() > 0.5 ? 2 : -2);
    const opts = Array.from(new Set([
      count,
      Math.max(1, wrong1),
      Math.max(1, wrong2),
    ])).slice(0, 3);
    while (opts.length < 3) opts.push(count + opts.length);
    problems.push({ id: i, count, emoji, options: opts.sort((a, b) => a - b) });
  }
  return problems;
}

// ── Number bonds (used by BONDS) ────────────────────────────────────

// Number bonds to 5 (easier)
export const NUMBER_BONDS_TO_5: NumberBond[] = [
  { total: 5, partA: 1, partB: 4, emoji: '🍓' },
  { total: 5, partA: 2, partB: 3, emoji: '🌻' },
  { total: 5, partA: 3, partB: 2, emoji: '🐮' },
  { total: 5, partA: 4, partB: 1, emoji: '🦁' },
];

// All number bonds to 10
export const NUMBER_BONDS_TO_10: NumberBond[] = [
  { total: 10, partA: 1, partB: 9, emoji: '🍎' },
  { total: 10, partA: 2, partB: 8, emoji: '🐟' },
  { total: 10, partA: 3, partB: 7, emoji: '⭐' },
  { total: 10, partA: 4, partB: 6, emoji: '🌸' },
  { total: 10, partA: 5, partB: 5, emoji: '🦋' },
  { total: 10, partA: 6, partB: 4, emoji: '🍊' },
  { total: 10, partA: 7, partB: 3, emoji: '🚀' },
  { total: 10, partA: 8, partB: 2, emoji: '🐸' },
  { total: 10, partA: 9, partB: 1, emoji: '🌈' },
];

// ── Subitize mode (used by QUICK_LOOK) ──────────────────────────────

export type SubitizeLayout = 'random' | 'dice' | 'frame' | 'rekenrek';

export interface SubitizeConfig {
  count: number;
  layout: SubitizeLayout;
  level: number;
}

export const SUBITIZE_CONFIGS: SubitizeConfig[] = [
  // Level 1: count 1-3, random scatter
  { count: 1, layout: 'random', level: 1 },
  { count: 2, layout: 'random', level: 1 },
  { count: 3, layout: 'random', level: 1 },
  // Level 2: count 1-5, standard dice dot positions
  { count: 1, layout: 'dice', level: 2 },
  { count: 2, layout: 'dice', level: 2 },
  { count: 3, layout: 'dice', level: 2 },
  { count: 4, layout: 'dice', level: 2 },
  { count: 5, layout: 'dice', level: 2 },
  // Level 3: count 1-5, two-row frame grid
  { count: 1, layout: 'frame', level: 3 },
  { count: 2, layout: 'frame', level: 3 },
  { count: 3, layout: 'frame', level: 3 },
  { count: 4, layout: 'frame', level: 3 },
  { count: 5, layout: 'frame', level: 3 },
  // Level 4: count 6-10, rekenrek (5 + N)
  { count: 6, layout: 'rekenrek', level: 4 },
  { count: 7, layout: 'rekenrek', level: 4 },
  { count: 8, layout: 'rekenrek', level: 4 },
  { count: 9, layout: 'rekenrek', level: 4 },
  { count: 10, layout: 'rekenrek', level: 4 },
  // Level 5: count 6-10, ten-frame
  { count: 6, layout: 'frame', level: 5 },
  { count: 7, layout: 'frame', level: 5 },
  { count: 8, layout: 'frame', level: 5 },
  { count: 9, layout: 'frame', level: 5 },
  { count: 10, layout: 'frame', level: 5 },
];

// Standard dice dot positions as [x%, y%] coordinates for counts 1-6.
export const DICE_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};
