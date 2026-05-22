export interface MathRiddle {
  id: number;
  riddle: string;
  answer: number;
  options: number[];
  hint?: string;
}

export interface MathProblem {
  id: number;
  type: 'add' | 'subtract';
  a: number;
  b: number;
  aEmojis: string;
  bEmojis: string;
  answer: number;
  options: number[];
}

export interface CountProblem {
  id: number;
  count: number;
  emoji: string;
  options: number[];
}

export const MATH_RIDDLES: MathRiddle[] = [
  {
    id: 1,
    riddle: 'I am more than 3. I am less than 6. I am even. Who am I?',
    answer: 4,
    options: [3, 4, 5],
    hint: 'Even numbers are 2, 4, 6, 8...',
  },
  {
    id: 2,
    riddle: 'I come after 9. I have a 1 and a 0. Who am I?',
    answer: 10,
    options: [8, 10, 12],
    hint: 'Count on your fingers after 9...',
  },
  {
    id: 3,
    riddle: 'I am half of 10. I have 5 fingers on one hand. Who am I?',
    answer: 5,
    options: [4, 5, 6],
  },
  {
    id: 4,
    riddle: 'I am more than 6 but less than 9. I am odd. Who am I?',
    answer: 7,
    options: [6, 7, 8],
    hint: 'Odd numbers are 1, 3, 5, 7, 9...',
  },
  {
    id: 5,
    riddle: 'Count all your fingers! How many do you have?',
    answer: 10,
    options: [8, 9, 10],
  },
  {
    id: 6,
    riddle: 'I have 2 eyes, 2 ears, and 1 nose on a face. How many things is that?',
    answer: 5,
    options: [4, 5, 6],
  },
  {
    id: 7,
    riddle: 'I am the number that comes before 8. Who am I?',
    answer: 7,
    options: [6, 7, 9],
  },
  {
    id: 8,
    riddle: 'A dog has 4 legs. How many legs do 2 dogs have?',
    answer: 8,
    options: [6, 8, 10],
  },
  {
    id: 9,
    riddle: 'I am more than 10. I am less than 13. I am even. Who am I?',
    answer: 12,
    options: [11, 12, 14],
  },
  {
    id: 10,
    riddle: 'I am the biggest number you can show with 1 hand. Who am I?',
    answer: 5,
    options: [4, 5, 10],
  },
  {
    id: 11,
    riddle: 'Start at 1. Skip a number. Skip a number. You land on 3. Skip again — you land on 5. What comes next?',
    answer: 7,
    options: [6, 7, 8],
  },
  {
    id: 12,
    riddle: 'I have 3 sides. I am not a square. I am not a circle. How many sides do I have?',
    answer: 3,
    options: [3, 4, 6],
  },
  {
    id: 13,
    riddle: 'You have 10 apples. You eat 3. How many are left?',
    answer: 7,
    options: [6, 7, 8],
  },
  {
    id: 14,
    riddle: 'A cat has 4 legs. A bird has 2 legs. Together, how many legs?',
    answer: 6,
    options: [5, 6, 8],
  },
  {
    id: 15,
    riddle: 'I am the number of days in a week. Who am I?',
    answer: 7,
    options: [5, 7, 8],
  },
  {
    id: 16,
    riddle: 'I am more than 14. I am less than 17. I am odd. Who am I?',
    answer: 15,
    options: [14, 15, 16],
  },
  {
    id: 17,
    riddle: '5 birds sit on a branch. 3 more fly in. How many birds now?',
    answer: 8,
    options: [7, 8, 9],
  },
];

export const OBJECT_EMOJIS = [
  '🍎', '🌟', '🐱', '🐶', '🦋', '🌺', '🍊', '🐸',
  '🚗', '⭐', '🎈', '🐣', '🦄', '🍓', '🌈', '🐢',
];

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

export const ADD_PROBLEMS: MathProblem[] = [
  { id: 1, type: 'add', a: 1, b: 2, aEmojis: '🍎', bEmojis: '🍊', answer: 3, options: [2, 3, 4] },
  { id: 2, type: 'add', a: 2, b: 3, aEmojis: '⭐', bEmojis: '⭐', answer: 5, options: [4, 5, 6] },
  { id: 3, type: 'add', a: 3, b: 4, aEmojis: '🐱', bEmojis: '🐶', answer: 7, options: [6, 7, 8] },
  { id: 4, type: 'add', a: 4, b: 3, aEmojis: '🌺', bEmojis: '🌸', answer: 7, options: [5, 7, 9] },
  { id: 5, type: 'add', a: 5, b: 5, aEmojis: '🎈', bEmojis: '🎈', answer: 10, options: [8, 10, 12] },
  { id: 6, type: 'add', a: 2, b: 2, aEmojis: '🐸', bEmojis: '🐸', answer: 4, options: [3, 4, 5] },
  { id: 7, type: 'add', a: 6, b: 3, aEmojis: '🦋', bEmojis: '🦋', answer: 9, options: [8, 9, 10] },
  { id: 8, type: 'add', a: 4, b: 4, aEmojis: '🍓', bEmojis: '🍓', answer: 8, options: [7, 8, 9] },
  { id: 9, type: 'add', a: 7, b: 2, aEmojis: '🌟', bEmojis: '🌟', answer: 9, options: [8, 9, 11] },
  { id: 10, type: 'add', a: 3, b: 3, aEmojis: '🐣', bEmojis: '🐣', answer: 6, options: [5, 6, 7] },
  { id: 11, type: 'subtract', a: 5, b: 2, aEmojis: '🍎', bEmojis: '🍎', answer: 3, options: [2, 3, 4] },
  { id: 12, type: 'subtract', a: 8, b: 3, aEmojis: '⭐', bEmojis: '⭐', answer: 5, options: [4, 5, 6] },
  { id: 13, type: 'subtract', a: 10, b: 4, aEmojis: '🎈', bEmojis: '🎈', answer: 6, options: [5, 6, 7] },
  { id: 14, type: 'subtract', a: 7, b: 3, aEmojis: '🌺', bEmojis: '🌺', answer: 4, options: [3, 4, 5] },
  { id: 15, type: 'subtract', a: 9, b: 5, aEmojis: '🐱', bEmojis: '🐱', answer: 4, options: [3, 4, 6] },
];
