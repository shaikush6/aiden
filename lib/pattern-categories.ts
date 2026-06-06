// ════════════════════════════════════════════════════════════════════════════
// pattern-categories.ts — metadata for the pattern-recognition filter system.
// This file holds NO questions. It is the single source of truth for the labels,
// icons, tooltips, and filter groups used by the teacher/parent UI to slice the
// dataset in lib/patterns-data.ts.
// ════════════════════════════════════════════════════════════════════════════

import type {
  PatternCore,
  ChangeType,
  Theme,
  DrillType,
  PatternQuestion,
} from './patterns-data';

// ── 1. PATTERN CORE LABELS ──────────────────────────────────────────────────
// label:       short badge text
// example:     a tiny visual sample (emoji where it reads cleanly)
// description: one plain-language sentence for a tooltip
export const PATTERN_CORE_LABELS: Record<
  PatternCore,
  { label: string; example: string; description: string }
> = {
  AB: {
    label: 'AB',
    example: '🔴🔵🔴🔵',
    description: 'Two items take turns over and over — the simplest pattern.',
  },
  AAB: {
    label: 'AAB',
    example: '🔴🔴🔵',
    description: 'Two of the first item, then one of the second, repeating.',
  },
  ABB: {
    label: 'ABB',
    example: '🔴🔵🔵',
    description: 'One of the first item, then two of the second, repeating.',
  },
  ABA: {
    label: 'ABA',
    example: '🔴🔵🔴',
    description: 'The first item bookends the second inside each repeating unit.',
  },
  AABB: {
    label: 'AABB',
    example: '🔴🔴🔵🔵',
    description: 'A pair of the first item, then a pair of the second, repeating.',
  },
  ABBA: {
    label: 'ABBA',
    example: '🔴🔵🔵🔴',
    description: 'A mirrored four-item unit — outside items match, inside items match.',
  },
  ABBB: {
    label: 'ABBB',
    example: '🔴🔵🔵🔵',
    description: 'One of the first item, then three of the second — a rare-element pattern.',
  },
  AAAB: {
    label: 'AAAB',
    example: '🔴🔴🔴🔵',
    description: 'Three of the first item, then one of the second, repeating.',
  },
  AABC: {
    label: 'AABC',
    example: '🔴🔴🔵🟡',
    description: 'A pair, then two different singles — a four-item unit with one repeat.',
  },
  ABBC: {
    label: 'ABBC',
    example: '🔴🔵🔵🟡',
    description: 'A single, a doubled middle, then a different single.',
  },
  ABCC: {
    label: 'ABCC',
    example: '🔴🔵🟡🟡',
    description: 'Two different singles, then a doubled item — the mirror of AABC.',
  },
  ABAC: {
    label: 'ABAC',
    example: '🔴🔵🔴🟡',
    description: 'The first item alternates with two different partners.',
  },
  ABCA: {
    label: 'ABCA',
    example: '🔴🔵🟡🔴',
    description: 'Three items where the first one returns to close the unit.',
  },
  ABCB: {
    label: 'ABCB',
    example: '🔴🔵🟡🔵',
    description: 'A four-item unit where the second item also appears at the end.',
  },
  ABCD: {
    label: 'ABCD',
    example: '🔴🔵🟡🟢',
    description: 'Four completely different items cycling in order.',
  },
  ABCBA: {
    label: 'ABCBA',
    example: '🔴🔵🟡🔵🔴',
    description: 'A five-item palindrome unit that reads the same forwards and backwards.',
  },
  ABCDE: {
    label: 'ABCDE',
    example: '🔴🔵🟡🟢🟣',
    description: 'Five completely different items cycling in order.',
  },
  AABBC: {
    label: 'AABBC',
    example: '🔴🔴🔵🔵🟡',
    description: 'Two pairs followed by a single item — a five-item unit.',
  },
  ABBCC: {
    label: 'ABBCC',
    example: '🔴🔵🔵🟡🟡',
    description: 'A single followed by two pairs — a five-item unit.',
  },
  growing: {
    label: 'Growing',
    example: '▪️ ▪️▪️ ▪️▪️▪️',
    description: 'Each step adds one more item than the step before it.',
  },
  shrinking: {
    label: 'Shrinking',
    example: '▪️▪️▪️ ▪️▪️ ▪️',
    description: 'Each step removes one item — the sequence gets smaller.',
  },
  mirror: {
    label: 'Mirror',
    example: '🔴🔵🟡🔵🔴',
    description: 'The sequence is symmetric — it reflects around a center point.',
  },
  rotation: {
    label: 'Rotation',
    example: '⬆️➡️⬇️⬅️',
    description: 'Items turn step by step, cycling through directions.',
  },
  matrix: {
    label: 'Matrix',
    example: '🔴🔵 / 🟥🟦',
    description: 'A 2x2 grid where rows and columns each follow their own rule.',
  },
  other: {
    label: 'Other',
    example: '✦',
    description: 'A special or compound pattern that does not fit the standard cores.',
  },
};

// ── 2. CHANGE TYPE LABELS ───────────────────────────────────────────────────
export const CHANGE_TYPE_LABELS: Record<
  ChangeType,
  { label: string; icon: string }
> = {
  color: { label: 'Color', icon: '🎨' },
  shape: { label: 'Shape', icon: '🔷' },
  size: { label: 'Size', icon: '📐' },
  orientation: { label: 'Orientation', icon: '🧭' },
  fill: { label: 'Fill', icon: '⬤' },
  count: { label: 'Count', icon: '🔢' },
  position: { label: 'Position', icon: '📍' },
  'color+shape': { label: 'Color + Shape', icon: '🎨🔷' },
  'color+size': { label: 'Color + Size', icon: '🎨📐' },
  'shape+size': { label: 'Shape + Size', icon: '🔷📐' },
  'color+shape+size': { label: 'Color + Shape + Size', icon: '🌈' },
  'rotation+color': { label: 'Rotation + Color', icon: '🧭🎨' },
  'rotation+shape': { label: 'Rotation + Shape', icon: '🧭🔷' },
  'growing-count': { label: 'Growing Count', icon: '📈' },
};

// ── 3. THEME LABELS ─────────────────────────────────────────────────────────
export const THEME_LABELS: Record<Theme, { label: string; icon: string }> = {
  geometric: { label: 'Shapes', icon: '🔷' },
  animals: { label: 'Animals', icon: '🐱' },
  food: { label: 'Food', icon: '🍎' },
  nature: { label: 'Nature', icon: '🌟' },
  space: { label: 'Space', icon: '🚀' },
  transport: { label: 'Transport', icon: '🚗' },
  household: { label: 'Household', icon: '🏠' },
  mixed: { label: 'Mixed', icon: '🎲' },
};

// ── 4. DRILL TYPE LABELS ────────────────────────────────────────────────────
export const DRILL_TYPE_LABELS: Record<
  DrillType,
  { label: string; icon: string; description: string }
> = {
  NEXT: {
    label: 'What Comes Next',
    icon: '➡️',
    description: 'The child predicts the item that continues the sequence.',
  },
  MISSING_MIDDLE: {
    label: 'Missing Middle',
    icon: '🧩',
    description: 'One item inside the sequence is blank — the child fills the gap.',
  },
  FIND_MISTAKE: {
    label: 'Find the Mistake',
    icon: '🔍',
    description: 'One item breaks the pattern — the child spots the odd one out.',
  },
  COUNT: {
    label: 'Count It',
    icon: '🔢',
    description: 'The child counts how many times a specific item appears.',
  },
  MATRIX: {
    label: 'Grid Puzzle',
    icon: '🔲',
    description: 'A 2x2 grid where the child finds the item for the empty corner.',
  },
  UNIT_ID: {
    label: 'Find the Unit',
    icon: '🔁',
    description: 'The child identifies the smallest chunk that repeats to build the pattern.',
  },
};

// ── 5. FILTER GROUPS ────────────────────────────────────────────────────────
// Each group maps a UI section to a question field plus the values it can take.
// Options are kept in a teaching-friendly order (simple → complex).
export interface FilterGroup {
  id: string;
  label: string;
  key: keyof PatternQuestion;
  options: string[];
}

export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'STRUCTURE',
    label: 'Pattern Structure',
    key: 'patternCore',
    options: [
      'AB', 'AAB', 'ABB', 'ABA', 'AABB', 'ABBA', 'ABBB', 'AAAB',
      'AABC', 'ABBC', 'ABCC', 'ABAC', 'ABCA', 'ABCB', 'ABCD',
      'ABCBA', 'ABCDE', 'AABBC', 'ABBCC',
      'growing', 'shrinking', 'mirror', 'rotation', 'matrix', 'other',
    ],
  },
  {
    id: 'CHANGE',
    label: 'What Changes',
    key: 'changeType',
    options: [
      'color', 'shape', 'size', 'orientation', 'fill', 'count', 'position',
      'color+shape', 'color+size', 'shape+size', 'color+shape+size',
      'rotation+color', 'rotation+shape', 'growing-count',
    ],
  },
  {
    id: 'THEME',
    label: 'Theme',
    key: 'theme',
    options: [
      'geometric', 'animals', 'food', 'nature',
      'space', 'transport', 'household', 'mixed',
    ],
  },
  {
    id: 'FORMAT',
    label: 'Question Format',
    key: 'drillType',
    options: ['NEXT', 'MISSING_MIDDLE', 'FIND_MISTAKE', 'COUNT', 'MATRIX', 'UNIT_ID'],
  },
];

// ── 6. COGNITIVE LEVELS ─────────────────────────────────────────────────────
// The 12-level Clements & Sarama patterning learning trajectory, adapted for
// this engine. Each question carries a cognitiveLevel (1-12) so the UI can grade
// difficulty along a research-based developmental path rather than guesswork.
export interface CognitiveLevel {
  level: number;
  name: string;
  description: string;
}

export const COGNITIVE_LEVELS: CognitiveLevel[] = [
  {
    level: 1,
    name: 'Pre-Patterner',
    description:
      'Notices that items differ but does not yet recognize a repeating regularity.',
  },
  {
    level: 2,
    name: 'Pattern Recognizer',
    description:
      'Recognizes a simple AB pattern and can say when something "looks the same again".',
  },
  {
    level: 3,
    name: 'Pattern Fixer',
    description:
      'Spots and fixes a single error in an otherwise correct AB or ABC pattern.',
  },
  {
    level: 4,
    name: 'Pattern Duplicator',
    description:
      'Copies a model AB or ABC pattern item-for-item with matching materials.',
  },
  {
    level: 5,
    name: 'Pattern Extender',
    description:
      'Continues a shown pattern forward by predicting the next several items.',
  },
  {
    level: 6,
    name: 'Pattern Completer',
    description:
      'Fills in a missing item from the middle of a pattern, not just the end.',
  },
  {
    level: 7,
    name: 'Unit Recognizer',
    description:
      'Identifies the smallest repeating unit (the "core") that builds the whole pattern.',
  },
  {
    level: 8,
    name: 'Unit Translator',
    description:
      'Re-creates the same pattern structure in a new material — e.g. claps an AAB seen as colors.',
  },
  {
    level: 9,
    name: 'Multi-Attribute Patterner',
    description:
      'Tracks two or more changing attributes at once, such as color and shape together.',
  },
  {
    level: 10,
    name: 'Growing-Pattern Reasoner',
    description:
      'Understands growing and shrinking patterns where the amount changes each step.',
  },
  {
    level: 11,
    name: 'Relational Patterner',
    description:
      'Solves 2x2 matrix puzzles by reasoning about row and column rules simultaneously.',
  },
  {
    level: 12,
    name: 'Pattern Generalizer',
    description:
      'Generalizes and manipulates complex structures — palindromes, mirrors, and abstract units.',
  },
];
