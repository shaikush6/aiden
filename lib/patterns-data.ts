export interface PatternQuestion {
  id: number;
  type: 'color' | 'shape' | 'emoji' | 'number';
  sequence: string[];
  missingIndex: number;
  answer: string;
  options: string[];
}

export const PATTERN_QUESTIONS: PatternQuestion[] = [
  // Color patterns
  {
    id: 1,
    type: 'color',
    sequence: ['🔴', '🔵', '🔴', '🔵', '?', '🔵'],
    missingIndex: 4,
    answer: '🔴',
    options: ['🔴', '🔵', '🟡'],
  },
  {
    id: 2,
    type: 'color',
    sequence: ['🟡', '🟢', '🟡', '🟢', '🟡', '?'],
    missingIndex: 5,
    answer: '🟢',
    options: ['🟡', '🟢', '🔴'],
  },
  {
    id: 3,
    type: 'color',
    sequence: ['🔴', '🔴', '🔵', '🔵', '?', '?'],
    missingIndex: 4,
    answer: '🔴',
    options: ['🔴', '🔵', '🟡'],
  },
  {
    id: 4,
    type: 'color',
    sequence: ['🟠', '🟣', '🟠', '🟣', '?', '🟣'],
    missingIndex: 4,
    answer: '🟠',
    options: ['🟠', '🟣', '🟢'],
  },
  {
    id: 5,
    type: 'color',
    sequence: ['🔴', '🟡', '🔵', '🔴', '🟡', '?'],
    missingIndex: 5,
    answer: '🔵',
    options: ['🔴', '🟡', '🔵'],
  },

  // Shape patterns
  {
    id: 6,
    type: 'shape',
    sequence: ['⭕', '🔺', '⭕', '🔺', '?', '🔺'],
    missingIndex: 4,
    answer: '⭕',
    options: ['⭕', '🔺', '⬛'],
  },
  {
    id: 7,
    type: 'shape',
    sequence: ['⬛', '⬜', '⬛', '⬜', '⬛', '?'],
    missingIndex: 5,
    answer: '⬜',
    options: ['⬛', '⬜', '🔺'],
  },
  {
    id: 8,
    type: 'shape',
    sequence: ['🔺', '🔺', '⭕', '🔺', '🔺', '?'],
    missingIndex: 5,
    answer: '⭕',
    options: ['🔺', '⭕', '⬛'],
  },
  {
    id: 9,
    type: 'shape',
    sequence: ['⭕', '⬛', '🔺', '⭕', '?', '🔺'],
    missingIndex: 4,
    answer: '⬛',
    options: ['⭕', '⬛', '🔺'],
  },
  {
    id: 10,
    type: 'shape',
    sequence: ['💎', '⬛', '💎', '⬛', '?', '⬛'],
    missingIndex: 4,
    answer: '💎',
    options: ['💎', '⬛', '⭕'],
  },

  // Emoji patterns
  {
    id: 11,
    type: 'emoji',
    sequence: ['🐱', '🐶', '🐱', '🐶', '?', '🐶'],
    missingIndex: 4,
    answer: '🐱',
    options: ['🐱', '🐶', '🐸'],
  },
  {
    id: 12,
    type: 'emoji',
    sequence: ['🌟', '🌙', '🌟', '🌙', '🌟', '?'],
    missingIndex: 5,
    answer: '🌙',
    options: ['🌟', '🌙', '☀️'],
  },
  {
    id: 13,
    type: 'emoji',
    sequence: ['🍎', '🍊', '🍋', '🍎', '🍊', '?'],
    missingIndex: 5,
    answer: '🍋',
    options: ['🍎', '🍊', '🍋'],
  },
  {
    id: 14,
    type: 'emoji',
    sequence: ['🚗', '✈️', '🚗', '✈️', '?', '✈️'],
    missingIndex: 4,
    answer: '🚗',
    options: ['🚗', '✈️', '🚢'],
  },
  {
    id: 15,
    type: 'emoji',
    sequence: ['🦁', '🐘', '🦁', '🐘', '🦁', '?'],
    missingIndex: 5,
    answer: '🐘',
    options: ['🦁', '🐘', '🦒'],
  },
  {
    id: 16,
    type: 'emoji',
    sequence: ['🌺', '🌻', '🌺', '🌺', '🌻', '?'],
    missingIndex: 5,
    answer: '🌺',
    options: ['🌺', '🌻', '🌹'],
  },

  // Number patterns
  {
    id: 17,
    type: 'number',
    sequence: ['1', '2', '3', '?'],
    missingIndex: 3,
    answer: '4',
    options: ['4', '5', '6'],
  },
  {
    id: 18,
    type: 'number',
    sequence: ['2', '4', '6', '?'],
    missingIndex: 3,
    answer: '8',
    options: ['7', '8', '9'],
  },
  {
    id: 19,
    type: 'number',
    sequence: ['5', '10', '15', '?'],
    missingIndex: 3,
    answer: '20',
    options: ['18', '20', '25'],
  },
  {
    id: 20,
    type: 'number',
    sequence: ['10', '9', '8', '?'],
    missingIndex: 3,
    answer: '7',
    options: ['6', '7', '5'],
  },
  {
    id: 21,
    type: 'number',
    sequence: ['1', '3', '5', '?'],
    missingIndex: 3,
    answer: '7',
    options: ['6', '7', '8'],
  },
  {
    id: 22,
    type: 'number',
    sequence: ['2', '2', '4', '?'],
    missingIndex: 3,
    answer: '4',
    options: ['3', '4', '6'],
  },
];
