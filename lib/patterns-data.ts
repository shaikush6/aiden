export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type DrillType = 'NEXT' | 'MISSING_MIDDLE' | 'FIND_MISTAKE' | 'COUNT';

export interface PatternQuestion {
  id: number;
  type: 'color' | 'shape' | 'emoji' | 'number' | 'size' | 'rotation' | 'mixed';
  drillType: DrillType;
  sequence: string[];
  missingIndex: number;   // index of blank / mistake / item to count
  answer: string;
  options: string[];      // answer choices (for NEXT/MISSING_MIDDLE/COUNT) or wrong item (FIND_MISTAKE uses options[0])
  difficulty: Difficulty;
  countTarget?: string;   // for COUNT drills: which item to count
}

export const PATTERN_QUESTIONS: PatternQuestion[] = [

  // ────────────────────────────────────────────────────────────────
  // EASY — short AB sequences, WHAT COMES NEXT
  // ────────────────────────────────────────────────────────────────
  { id: 1, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['🔴','🔵','🔴','🔵','🔴','?'],
    missingIndex: 5, answer: '🔵', options: ['🔴','🔵','🟡'] },
  { id: 2, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['🟡','🟢','🟡','🟢','🟡','?'],
    missingIndex: 5, answer: '🟢', options: ['🟡','🟢','🔴'] },
  { id: 3, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['⭕','🔺','⭕','🔺','⭕','?'],
    missingIndex: 5, answer: '🔺', options: ['⭕','🔺','⬛'] },
  { id: 4, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐱','🐶','🐱','🐶','🐱','?'],
    missingIndex: 5, answer: '🐶', options: ['🐱','🐶','🐸'] },
  { id: 5, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🌟','🌙','🌟','🌙','🌟','?'],
    missingIndex: 5, answer: '🌙', options: ['🌟','🌙','☀️'] },
  { id: 6, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍎','🍊','🍎','🍊','🍎','?'],
    missingIndex: 5, answer: '🍊', options: ['🍎','🍊','🍋'] },
  { id: 7, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🚗','✈️','🚗','✈️','🚗','?'],
    missingIndex: 5, answer: '✈️', options: ['🚗','✈️','🚢'] },
  { id: 8, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🦁','🐘','🦁','🐘','🦁','?'],
    missingIndex: 5, answer: '🐘', options: ['🦁','🐘','🦒'] },
  { id: 9, difficulty: 'EASY', drillType: 'NEXT', type: 'size',
    sequence: ['🔵','🔹','🔵','🔹','🔵','?'],
    missingIndex: 5, answer: '🔹', options: ['🔵','🔹','🟦'] },
  { id: 10, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍕','🍔','🍕','🍔','🍕','?'],
    missingIndex: 5, answer: '🍔', options: ['🍕','🍔','🌮'] },

  // EASY — LONG sequences (8+ slots, still AB)
  { id: 11, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐝','🦋','🐝','🦋','🐝','🦋','🐝','?'],
    missingIndex: 7, answer: '🦋', options: ['🐝','🦋','🐛'] },
  { id: 12, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['🟠','🟣','🟠','🟣','🟠','🟣','🟠','?'],
    missingIndex: 7, answer: '🟣', options: ['🟠','🟣','🟢'] },
  { id: 13, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['⬛','⬜','⬛','⬜','⬛','⬜','⬛','?'],
    missingIndex: 7, answer: '⬜', options: ['⬛','⬜','🔺'] },
  { id: 14, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🌺','🌻','🌺','🌻','🌺','🌻','🌺','?'],
    missingIndex: 7, answer: '🌻', options: ['🌺','🌻','🌹'] },
  { id: 15, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐸','🐸','🦊','🐸','🐸','🦊','🐸','?'],
    missingIndex: 7, answer: '🐸', options: ['🦊','🐸','🦁'] },

  // EASY — MISSING MIDDLE
  { id: 16, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🐱','🐶','?','🐶','🐱','🐶'],
    missingIndex: 2, answer: '🐱', options: ['🐱','🐶','🐸'] },
  { id: 17, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'color',
    sequence: ['🔴','🔵','🔴','?','🔴','🔵'],
    missingIndex: 3, answer: '🔵', options: ['🔴','🔵','🟡'] },
  { id: 18, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🌟','🌙','🌟','🌙','?','🌙'],
    missingIndex: 4, answer: '🌟', options: ['🌟','🌙','☀️'] },
  { id: 19, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'shape',
    sequence: ['⭕','🔺','?','🔺','⭕','🔺'],
    missingIndex: 2, answer: '⭕', options: ['⭕','🔺','⬛'] },

  // EASY — FIND THE MISTAKE (short)
  { id: 20, difficulty: 'EASY', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🐱','🐶','🐱','🦁','🐱','🐶'],
    missingIndex: 3, answer: '🦁', options: ['🦁'] },
  { id: 21, difficulty: 'EASY', drillType: 'FIND_MISTAKE', type: 'color',
    sequence: ['🔴','🔵','🔴','🔵','🟡','🔵'],
    missingIndex: 4, answer: '🟡', options: ['🟡'] },
  { id: 22, difficulty: 'EASY', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🌟','🌙','🌟','🌙','🌟','☀️'],
    missingIndex: 5, answer: '☀️', options: ['☀️'] },

  // EASY — COUNT
  { id: 23, difficulty: 'EASY', drillType: 'COUNT', type: 'emoji',
    sequence: ['🔴','🔵','🔴','🔵','🔴'],
    missingIndex: -1, answer: '3', options: ['2','3','4'],
    countTarget: '🔴' },
  { id: 24, difficulty: 'EASY', drillType: 'COUNT', type: 'emoji',
    sequence: ['🐱','🐶','🐱','🐶','🐶'],
    missingIndex: -1, answer: '2', options: ['1','2','3'],
    countTarget: '🐱' },

  // ────────────────────────────────────────────────────────────────
  // MEDIUM — ABC patterns, longer sequences, NEXT + MISSING
  // ────────────────────────────────────────────────────────────────
  { id: 25, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍎','🍊','?'],
    missingIndex: 5, answer: '🍋', options: ['🍎','🍊','🍋'] },
  { id: 26, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'color',
    sequence: ['🔴','🟡','🔵','🔴','🟡','?'],
    missingIndex: 5, answer: '🔵', options: ['🔴','🟡','🔵'] },
  { id: 27, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['🔺','⭕','⬛','🔺','⭕','?'],
    missingIndex: 5, answer: '⬛', options: ['🔺','⭕','⬛'] },
  { id: 28, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐮','🐷','🐔','🐮','🐷','?'],
    missingIndex: 5, answer: '🐔', options: ['🐮','🐷','🐔'] },
  { id: 29, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬅️','⬆️','?'],
    missingIndex: 5, answer: '➡️', options: ['⬆️','➡️','⬇️'] },
  { id: 30, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'number',
    sequence: ['1','2','3','4','5','?'],
    missingIndex: 5, answer: '6', options: ['5','6','7'] },
  { id: 31, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'number',
    sequence: ['2','4','6','8','?'],
    missingIndex: 4, answer: '10', options: ['9','10','12'] },
  { id: 32, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'number',
    sequence: ['10','9','8','7','?'],
    missingIndex: 4, answer: '6', options: ['5','6','7'] },
  { id: 33, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'number',
    sequence: ['5','10','15','?'],
    missingIndex: 3, answer: '20', options: ['18','20','25'] },

  // MEDIUM — LONG sequences (9-10 items, ABC)
  { id: 34, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🐱','🐶','🐸','🐱','🐶','?'],
    missingIndex: 8, answer: '🐸', options: ['🐱','🐶','🐸'] },
  { id: 35, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'color',
    sequence: ['🔴','🟡','🔵','🟢','🔴','🟡','🔵','?'],
    missingIndex: 7, answer: '🟢', options: ['🔴','🟡','🔵','🟢'] },
  { id: 36, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🌞','🌧️','🌈','🌞','🌧️','🌈','🌞','🌧️','?'],
    missingIndex: 8, answer: '🌈', options: ['🌞','🌧️','🌈'] },
  { id: 37, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['⭐','⭐','🌙','⭐','⭐','🌙','⭐','⭐','?'],
    missingIndex: 8, answer: '🌙', options: ['⭐','🌙','☀️'] },

  // MEDIUM — MISSING MIDDLE (longer)
  { id: 38, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍎','?','🍋','🍎','🍊','🍋'],
    missingIndex: 4, answer: '🍊', options: ['🍎','🍊','🍋'] },
  { id: 39, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','?','⬆️','➡️','⬇️','⬅️'],
    missingIndex: 3, answer: '⬅️', options: ['⬆️','➡️','⬇️','⬅️'] },
  { id: 40, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'number',
    sequence: ['2','4','?','8','10'],
    missingIndex: 2, answer: '6', options: ['5','6','7'] },
  { id: 41, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'number',
    sequence: ['1','2','3','?','5','6'],
    missingIndex: 3, answer: '4', options: ['3','4','5'] },

  // MEDIUM — FIND THE MISTAKE (longer sequences)
  { id: 42, difficulty: 'MEDIUM', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍎','🍊','🐸','🍎','🍊','🍋'],
    missingIndex: 5, answer: '🐸', options: ['🐸'] },
  { id: 43, difficulty: 'MEDIUM', drillType: 'FIND_MISTAKE', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬅️','⬆️','⬇️','⬇️','⬅️'],
    missingIndex: 5, answer: '⬇️', options: ['⬇️'] },
  { id: 44, difficulty: 'MEDIUM', drillType: 'FIND_MISTAKE', type: 'number',
    sequence: ['2','4','6','9','10','12'],
    missingIndex: 3, answer: '9', options: ['9'] },

  // MEDIUM — COUNT
  { id: 45, difficulty: 'MEDIUM', drillType: 'COUNT', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍎','🍊','🍎','🍊','🍎'],
    missingIndex: -1, answer: '4', options: ['3','4','5'],
    countTarget: '🍎' },
  { id: 46, difficulty: 'MEDIUM', drillType: 'COUNT', type: 'color',
    sequence: ['🔴','🟡','🔵','🔴','🟡','🔵','🔴'],
    missingIndex: -1, answer: '3', options: ['2','3','4'],
    countTarget: '🔴' },

  // ────────────────────────────────────────────────────────────────
  // HARD — number sequences, mixed, very long, 4 options
  // ────────────────────────────────────────────────────────────────
  { id: 47, difficulty: 'HARD', drillType: 'NEXT', type: 'number',
    sequence: ['1','2','4','8','16','?'],
    missingIndex: 5, answer: '32', options: ['24','30','32','20'] },
  { id: 48, difficulty: 'HARD', drillType: 'NEXT', type: 'number',
    sequence: ['1','3','5','7','?'],
    missingIndex: 4, answer: '9', options: ['8','9','10','11'] },
  { id: 49, difficulty: 'HARD', drillType: 'NEXT', type: 'number',
    sequence: ['3','6','9','12','?'],
    missingIndex: 4, answer: '15', options: ['13','14','15','16'] },
  { id: 50, difficulty: 'HARD', drillType: 'NEXT', type: 'number',
    sequence: ['100','90','80','70','?'],
    missingIndex: 4, answer: '60', options: ['50','60','65','55'] },
  { id: 51, difficulty: 'HARD', drillType: 'NEXT', type: 'number',
    sequence: ['1','4','9','16','?'],
    missingIndex: 4, answer: '25', options: ['20','24','25','36'] },
  { id: 52, difficulty: 'HARD', drillType: 'NEXT', type: 'number',
    sequence: ['5','8','11','14','?'],
    missingIndex: 4, answer: '17', options: ['15','16','17','18'] },
  { id: 53, difficulty: 'HARD', drillType: 'NEXT', type: 'number',
    sequence: ['1','1','2','3','5','?'],
    missingIndex: 5, answer: '8', options: ['6','7','8','9'] },
  { id: 54, difficulty: 'HARD', drillType: 'NEXT', type: 'number',
    sequence: ['50','45','40','35','?'],
    missingIndex: 4, answer: '30', options: ['25','28','30','32'] },

  // HARD — LONG mixed sequences (10+ items)
  { id: 55, difficulty: 'HARD', drillType: 'NEXT', type: 'mixed',
    sequence: ['🔴⭐','🔵⭐','🟡⭐','🔴⭐','🔵⭐','🟡⭐','🔴⭐','🔵⭐','?'],
    missingIndex: 8, answer: '🟡⭐', options: ['🔴⭐','🔵⭐','🟡⭐','🟢⭐'] },
  { id: 56, difficulty: 'HARD', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🦊','🐱','🐶','🐸','🦊','🐱','?'],
    missingIndex: 9, answer: '🐶', options: ['🐱','🐶','🐸','🦊'] },
  { id: 57, difficulty: 'HARD', drillType: 'NEXT', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬅️','⬆️','➡️','⬇️','⬅️','⬆️','?'],
    missingIndex: 9, answer: '➡️', options: ['⬆️','➡️','⬇️','⬅️'] },

  // HARD — MISSING MIDDLE (tricky positions)
  { id: 58, difficulty: 'HARD', drillType: 'MISSING_MIDDLE', type: 'number',
    sequence: ['1','2','4','8','?','32'],
    missingIndex: 4, answer: '16', options: ['12','14','16','20'] },
  { id: 59, difficulty: 'HARD', drillType: 'MISSING_MIDDLE', type: 'number',
    sequence: ['3','6','9','?','15','18'],
    missingIndex: 3, answer: '12', options: ['10','11','12','13'] },
  { id: 60, difficulty: 'HARD', drillType: 'MISSING_MIDDLE', type: 'mixed',
    sequence: ['🔴⭐','🔵⭐','🟡⭐','🔴⭐','?','🟡⭐','🔴⭐'],
    missingIndex: 4, answer: '🔵⭐', options: ['🔴⭐','🔵⭐','🟡⭐','🟢⭐'] },

  // HARD — FIND THE MISTAKE
  { id: 61, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'number',
    sequence: ['2','4','6','8','11','12','14'],
    missingIndex: 4, answer: '11', options: ['11'] },
  { id: 62, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'number',
    sequence: ['1','1','2','3','5','7','13'],
    missingIndex: 5, answer: '7', options: ['7'] },
  { id: 63, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'mixed',
    sequence: ['🔴⭐','🔵⭐','🟡⭐','🔴⭐','🔵🌙','🟡⭐'],
    missingIndex: 4, answer: '🔵🌙', options: ['🔵🌙'] },

  // HARD — COUNT (larger numbers)
  { id: 64, difficulty: 'HARD', drillType: 'COUNT', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🐱','🐶','🐱','🐶','🐱','🐸','🐱'],
    missingIndex: -1, answer: '5', options: ['4','5','6','7'],
    countTarget: '🐱' },
  { id: 65, difficulty: 'HARD', drillType: 'COUNT', type: 'number',
    sequence: ['1','2','1','3','1','2','1','3','1'],
    missingIndex: -1, answer: '5', options: ['4','5','6','7'],
    countTarget: '1' },
];

export const PATTERN_EMOJIS_POOL = [
  '🔴','🔵','🟡','🟢','🟠','🟣',
  '⭕','🔺','⬛','⬜','💎',
  '🐱','🐶','🐸','🦊','🦁','🐘',
  '🍎','🍊','🍋','🌟','🌙','☀️',
];
