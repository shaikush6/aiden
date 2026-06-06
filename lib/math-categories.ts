import type { MathActivity, MathLane } from './math-data';

// All 13 activities, ordered by cognitive level (L1 → L5).
export const MATH_ACTIVITIES: MathActivity[] = [
  {
    id: 'QUICK_LOOK',
    lane: 'SUBITIZE',
    label: 'Quick Look',
    icon: '⚡',
    cogLevel: 1,
    description: 'Flash a group of objects, then rebuild how many you saw — no counting.',
  },
  {
    id: 'BUILD_ME',
    lane: 'BUILD',
    label: 'Build Me',
    icon: '🎯',
    cogLevel: 2,
    description: 'Tap objects into a container to make exactly the number asked for.',
  },
  {
    id: 'COUNT',
    lane: 'BUILD',
    label: 'Count',
    icon: '🔢',
    cogLevel: 2,
    description: 'Touch each scattered object once to count how many there are.',
  },
  {
    id: 'WHICH_MORE',
    lane: 'COMPARE',
    label: 'Which More',
    icon: '⚖️',
    cogLevel: 3,
    description: 'Match objects across a bridge to see which group has more.',
  },
  {
    id: 'CONSERVATION',
    lane: 'COMPARE',
    label: 'Still Same?',
    icon: '🪄',
    cogLevel: 3,
    description: 'A group is spread out or squished — is it still the same number?',
  },
  {
    id: 'NUMBER_LINE',
    lane: 'PATH',
    label: 'Number Path',
    icon: '🐸',
    cogLevel: 3,
    description: 'Hop the frog along the path and drag jump arcs to land on a number.',
  },
  {
    id: 'ONE_MORE',
    lane: 'PATH',
    label: 'One More',
    icon: '⚙️',
    cogLevel: 3,
    description: 'Turn the machine to make one more or one less than a number.',
  },
  {
    id: 'BONDS',
    lane: 'COMPOSE',
    label: 'Number Bonds',
    icon: '🚂',
    cogLevel: 4,
    description: 'Drag a divider to split the train into two parts that make the whole.',
  },
  {
    id: 'HIDE_FIND',
    lane: 'COMPOSE',
    label: 'Hide & Find',
    icon: '☕',
    cogLevel: 4,
    description: 'Some counters hide under a cup — work out how many are hidden.',
  },
  {
    id: 'BALANCE',
    lane: 'COMPOSE',
    label: 'Balance',
    icon: '⚖️',
    cogLevel: 4,
    description: 'Add counters to make both sides of the scale equal.',
  },
  {
    id: 'ADD',
    lane: 'COMPOSE',
    label: 'Add',
    icon: '🚌',
    cogLevel: 4,
    description: 'Drag characters onto the bus, then see the equation for what you did.',
  },
  {
    id: 'MISSING',
    lane: 'COMPOSE',
    label: 'Missing',
    icon: '❓',
    cogLevel: 4,
    description: 'Fill the gap in the bead string with the number that belongs.',
  },
  {
    id: 'TEN_FRAME',
    lane: 'COMPOSE',
    label: 'Ten Frame',
    icon: '📦',
    cogLevel: 5,
    description: 'Fill the ten-frame to see numbers as parts of ten.',
  },
];

export const LANE_CONFIG: Record<
  MathLane,
  { label: string; color: string; icon: string; description: string }
> = {
  SUBITIZE: {
    label: 'Quick Look',
    color: 'bg-yellow-500',
    icon: '⚡',
    description: 'Recognize how many at a glance, without counting.',
  },
  BUILD: {
    label: 'Build It',
    color: 'bg-green-500',
    icon: '🏗️',
    description: 'Count carefully and produce exact sets of objects.',
  },
  COMPARE: {
    label: 'Compare',
    color: 'bg-blue-500',
    icon: '⚖️',
    description: 'Decide more or less, and see that rearranging keeps the count.',
  },
  PATH: {
    label: 'Number Path',
    color: 'bg-purple-500',
    icon: '🛤️',
    description: 'Order numbers, find positions, and step one more or one less.',
  },
  COMPOSE: {
    label: 'Make & Break',
    color: 'bg-orange-500',
    icon: '🔀',
    description: 'Put parts together and break wholes apart — add and subtract.',
  },
};

export interface CognitiveLevel {
  level: number;
  name: string;
  description: string;
}

// The five cognitive levels from the research basis (Clements & Sarama, NCTM/NAEYC).
export const COGNITIVE_LEVELS: CognitiveLevel[] = [
  {
    level: 1,
    name: 'Perceptual recognition',
    description:
      'Subitize 1–5 and compare obvious differences — see quantity instantly without counting.',
  },
  {
    level: 2,
    name: 'Accurate counting and producing',
    description:
      'Count with one-to-one correspondence, understand cardinality, and produce a set on request ("give me 6").',
  },
  {
    level: 3,
    name: 'Relational number sense',
    description:
      'Order numbers, use a number line, find one more or one less, and understand conservation.',
  },
  {
    level: 4,
    name: 'Compositional number sense',
    description:
      'Understand that parts make wholes — compose and decompose numbers through addition and subtraction.',
  },
  {
    level: 5,
    name: 'Representational',
    description:
      'Use structured models like the ten-frame and read equations as notation for actions already performed.',
  },
];
