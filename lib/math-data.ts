export interface MathRiddle {
  id: number;
  riddle: string;
  answer: number;
  options: number[];
  hint?: string;
  emoji?: string;
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
  label?: string;
}

export interface CountProblem {
  id: number;
  count: number;
  emoji: string;
  options: number[];
}

export const MATH_RIDDLES: MathRiddle[] = [
  {
    id: 1, emoji: '🔢',
    riddle: 'I am more than 3. I am less than 6. I am even. Who am I?',
    answer: 4, options: [3, 4, 5],
    hint: 'Even numbers are 2, 4, 6, 8...',
  },
  {
    id: 2, emoji: '🔟',
    riddle: 'I come after 9. I have a 1 and a 0. Who am I?',
    answer: 10, options: [8, 10, 12],
    hint: 'Count on your fingers after 9...',
  },
  {
    id: 3, emoji: '✋',
    riddle: 'I am half of 10. I have 5 fingers on one hand. Who am I?',
    answer: 5, options: [4, 5, 6],
  },
  {
    id: 4, emoji: '🎯',
    riddle: 'I am more than 6 but less than 9. I am odd. Who am I?',
    answer: 7, options: [6, 7, 8],
    hint: 'Odd numbers are 1, 3, 5, 7, 9...',
  },
  {
    id: 5, emoji: '👐',
    riddle: 'Count all your fingers! How many do you have?',
    answer: 10, options: [8, 9, 10],
  },
  {
    id: 6, emoji: '😊',
    riddle: 'I have 2 eyes, 2 ears, and 1 nose on a face. How many things is that?',
    answer: 5, options: [4, 5, 6],
  },
  {
    id: 7, emoji: '7️⃣',
    riddle: 'I am the number that comes before 8. Who am I?',
    answer: 7, options: [6, 7, 9],
  },
  {
    id: 8, emoji: '🐕',
    riddle: 'A dog has 4 legs. How many legs do 2 dogs have?',
    answer: 8, options: [6, 8, 10],
  },
  {
    id: 9, emoji: '🔢',
    riddle: 'I am more than 10. I am less than 13. I am even. Who am I?',
    answer: 12, options: [11, 12, 14],
  },
  {
    id: 10, emoji: '✋',
    riddle: 'I am the biggest number you can show with 1 hand. Who am I?',
    answer: 5, options: [4, 5, 10],
  },
  {
    id: 11, emoji: '⭐',
    riddle: 'Start at 1. Skip. Skip. You land on 3. Skip again — you land on 5. What comes next?',
    answer: 7, options: [6, 7, 8],
  },
  {
    id: 12, emoji: '🔺',
    riddle: 'I have 3 sides. I am not a square. I am not a circle. How many sides do I have?',
    answer: 3, options: [3, 4, 6],
  },
  {
    id: 13, emoji: '🍎',
    riddle: 'You have 10 apples. You eat 3. How many are left?',
    answer: 7, options: [6, 7, 8],
  },
  {
    id: 14, emoji: '🐾',
    riddle: 'A cat has 4 legs. A bird has 2 legs. Together, how many legs?',
    answer: 6, options: [5, 6, 8],
  },
  {
    id: 15, emoji: '📅',
    riddle: 'I am the number of days in a week. Who am I?',
    answer: 7, options: [5, 7, 8],
  },
  {
    id: 16, emoji: '🔢',
    riddle: 'I am more than 14. I am less than 17. I am odd. Who am I?',
    answer: 15, options: [14, 15, 16],
  },
  {
    id: 17, emoji: '🐦',
    riddle: '5 birds sit on a branch. 3 more fly in. How many birds now?',
    answer: 8, options: [7, 8, 9],
  },
  {
    id: 18, emoji: '🍕',
    riddle: 'You have 2 pizzas. Each pizza has 4 slices. How many slices in total?',
    answer: 8, options: [6, 8, 10],
  },
  {
    id: 19, emoji: '🐟',
    riddle: 'There are 9 fish in a tank. 4 swim away. How many are left?',
    answer: 5, options: [4, 5, 6],
  },
  {
    id: 20, emoji: '⬜',
    riddle: 'A square has how many sides?',
    answer: 4, options: [3, 4, 5],
  },
  {
    id: 21, emoji: '🦷',
    riddle: 'I am the number of months in a year. Who am I?',
    answer: 12, options: [10, 12, 14],
  },
  {
    id: 22, emoji: '🌈',
    riddle: 'How many colors are in a rainbow?',
    answer: 7, options: [5, 6, 7],
  },
  {
    id: 23, emoji: '🐝',
    riddle: 'There are 3 hives. Each hive has 3 bees. How many bees?',
    answer: 9, options: [6, 9, 12],
  },
  {
    id: 24, emoji: '🎈',
    riddle: 'You have 15 balloons. 6 pop! How many are left?',
    answer: 9, options: [8, 9, 10],
  },
  {
    id: 25, emoji: '🏠',
    riddle: 'A house has 2 windows upstairs and 3 downstairs. How many windows total?',
    answer: 5, options: [4, 5, 6],
  },
  {
    id: 26, emoji: '🎲',
    riddle: 'I am a number you can make with TWO THREES. Who am I?',
    answer: 6, options: [5, 6, 7],
    hint: 'Three plus three...',
  },
  {
    id: 27, emoji: '🕰️',
    riddle: 'I come before 20 but after 17. I have a 1 and an 8. Who am I?',
    answer: 18, options: [17, 18, 19],
  },
  {
    id: 28, emoji: '✂️',
    riddle: 'I am half of 10. Who am I?',
    answer: 5, options: [4, 5, 6],
    hint: 'Cut 10 in two equal pieces...',
  },
  {
    id: 29, emoji: '📅',
    riddle: 'I am the number of days in a week. Who am I?',
    answer: 7, options: [5, 7, 8],
  },
  {
    id: 30, emoji: '🤚',
    riddle: 'You have 10 fingers. You fold 3. How many can you see?',
    answer: 7, options: [6, 7, 8],
    hint: '10 take away 3...',
  },
  {
    id: 31, emoji: '🎱',
    riddle: 'I am a double! 4 and 4 makes me. Who am I?',
    answer: 8, options: [6, 8, 10],
    hint: 'Four plus four...',
  },
  {
    id: 32, emoji: '🔟',
    riddle: 'Count by twos: 2, 4, 6, 8, ___',
    answer: 10, options: [9, 10, 12],
    hint: 'Keep counting by twos!',
  },
  {
    id: 33, emoji: '9️⃣',
    riddle: 'I am the biggest single digit. Who am I?',
    answer: 9, options: [8, 9, 10],
    hint: 'Single digit means just one digit — 1 through 9.',
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

export interface NumberBond {
  total: number;
  partA: number;
  partB: number;
  emoji: string;
}

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

export const ADD_PROBLEMS: MathProblem[] = [
  { id: 1, type: 'add', a: 1, b: 2, aEmojis: '🍎', bEmojis: '🍎', answer: 3, options: [2, 3, 4], label: 'apples' },
  { id: 2, type: 'add', a: 2, b: 3, aEmojis: '⭐', bEmojis: '⭐', answer: 5, options: [4, 5, 6], label: 'stars' },
  { id: 3, type: 'add', a: 3, b: 4, aEmojis: '🐱', bEmojis: '🐱', answer: 7, options: [6, 7, 8], label: 'cats' },
  { id: 4, type: 'add', a: 4, b: 3, aEmojis: '🌺', bEmojis: '🌺', answer: 7, options: [5, 7, 9], label: 'flowers' },
  { id: 5, type: 'add', a: 5, b: 5, aEmojis: '🎈', bEmojis: '🎈', answer: 10, options: [8, 10, 12], label: 'balloons' },
  { id: 6, type: 'add', a: 2, b: 2, aEmojis: '🐸', bEmojis: '🐸', answer: 4, options: [3, 4, 5], label: 'frogs' },
  { id: 7, type: 'add', a: 6, b: 3, aEmojis: '🦋', bEmojis: '🦋', answer: 9, options: [8, 9, 10], label: 'butterflies' },
  { id: 8, type: 'add', a: 4, b: 4, aEmojis: '🍓', bEmojis: '🍓', answer: 8, options: [7, 8, 9], label: 'strawberries' },
  { id: 9, type: 'add', a: 7, b: 2, aEmojis: '🌟', bEmojis: '🌟', answer: 9, options: [8, 9, 11], label: 'stars' },
  { id: 10, type: 'add', a: 3, b: 3, aEmojis: '🐣', bEmojis: '🐣', answer: 6, options: [5, 6, 7], label: 'chicks' },
  { id: 11, type: 'subtract', a: 5, b: 2, aEmojis: '🍎', bEmojis: '🍎', answer: 3, options: [2, 3, 4], label: 'apples' },
  { id: 12, type: 'subtract', a: 8, b: 3, aEmojis: '⭐', bEmojis: '⭐', answer: 5, options: [4, 5, 6], label: 'stars' },
  { id: 13, type: 'subtract', a: 10, b: 4, aEmojis: '🎈', bEmojis: '🎈', answer: 6, options: [5, 6, 7], label: 'balloons' },
  { id: 14, type: 'subtract', a: 7, b: 3, aEmojis: '🌺', bEmojis: '🌺', answer: 4, options: [3, 4, 5], label: 'flowers' },
  { id: 15, type: 'subtract', a: 9, b: 5, aEmojis: '🐱', bEmojis: '🐱', answer: 4, options: [3, 4, 6], label: 'cats' },
];
