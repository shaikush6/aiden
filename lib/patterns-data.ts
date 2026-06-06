export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' | 'MASTER';
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

  // ════════════════════════════════════════════════════════════════
  // EASY — AB patterns, 2 alternating elements, short 4-6 item runs
  // ════════════════════════════════════════════════════════════════

  // NEXT — answer at varied positions
  { id: 1, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐱','🐶','🐱','🐶','🐱','?'],
    missingIndex: 5, answer: '🐶', options: ['🐶','🐱','🐸'] },               // answer idx 0
  { id: 2, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['🔴','🔵','🔴','🔵','🔴','?'],
    missingIndex: 5, answer: '🔵', options: ['🟡','🔵','🔴'] },               // answer idx 1
  { id: 3, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['⭕','🔺','⭕','🔺','⭕','?'],
    missingIndex: 5, answer: '🔺', options: ['⭕','⬛','🔺'] },               // answer idx 2
  { id: 4, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🌟','🌙','🌟','🌙','🌟','?'],
    missingIndex: 5, answer: '🌙', options: ['🌙','☀️','🌟'] },              // answer idx 0
  { id: 5, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍎','🍊','🍎','🍊','🍎','?'],
    missingIndex: 5, answer: '🍊', options: ['🍋','🍊','🍎'] },              // answer idx 1
  { id: 6, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🚗','✈️','🚗','✈️','🚗','?'],
    missingIndex: 5, answer: '✈️', options: ['🚗','🚢','✈️'] },              // answer idx 2
  { id: 7, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🦁','🐘','🦁','🐘','🦁','?'],
    missingIndex: 5, answer: '🐘', options: ['🐘','🦒','🦁'] },              // answer idx 0
  { id: 8, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍕','🍔','🍕','🍔','🍕','?'],
    missingIndex: 5, answer: '🍔', options: ['🍕','🍔','🌮'] },              // answer idx 1
  { id: 9, difficulty: 'EASY', drillType: 'NEXT', type: 'size',
    sequence: ['🔵','🔹','🔵','🔹','🔵','?'],
    missingIndex: 5, answer: '🔹', options: ['🔵','🟦','🔹'] },              // answer idx 2
  { id: 10, difficulty: 'EASY', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐧','🐬','🐧','🐬','🐧','?'],
    missingIndex: 5, answer: '🐬', options: ['🐬','🐧','🐙'] },             // answer idx 0
  { id: 11, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['🟠','🟣','🟠','🟣','🟠','?'],
    missingIndex: 5, answer: '🟣', options: ['🟠','🟣','🟢'] },             // answer idx 1
  { id: 12, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['⬛','⬜','⬛','⬜','⬛','?'],
    missingIndex: 5, answer: '⬜', options: ['⬛','🔺','⬜'] },              // answer idx 2

  // EASY — MISSING MIDDLE
  { id: 13, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🐱','🐶','?','🐶','🐱','🐶'],
    missingIndex: 2, answer: '🐱', options: ['🐱','🐶','🐸'] },             // answer idx 0
  { id: 14, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'color',
    sequence: ['🔴','🔵','🔴','?','🔴','🔵'],
    missingIndex: 3, answer: '🔵', options: ['🟡','🔵','🔴'] },             // answer idx 1
  { id: 15, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🌻','🌺','🌻','🌺','?','🌺'],
    missingIndex: 4, answer: '🌻', options: ['🌹','🌺','🌻'] },            // answer idx 2

  // EASY — FIND THE MISTAKE (short)
  { id: 16, difficulty: 'EASY', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🐱','🐶','🐱','🦁','🐱','🐶'],
    missingIndex: 3, answer: '🦁', options: ['🦁'] },
  { id: 17, difficulty: 'EASY', drillType: 'FIND_MISTAKE', type: 'color',
    sequence: ['🔴','🔵','🔴','🔵','🟡','🔵'],
    missingIndex: 4, answer: '🟡', options: ['🟡'] },
  { id: 18, difficulty: 'EASY', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🌟','🌙','🌟','🌙','🌟','☀️'],
    missingIndex: 5, answer: '☀️', options: ['☀️'] },

  // EASY — COUNT
  { id: 19, difficulty: 'EASY', drillType: 'COUNT', type: 'emoji',
    sequence: ['🔴','🔵','🔴','🔵','🔴'],
    missingIndex: -1, answer: '3', options: ['3','2','4'], countTarget: '🔴' },  // answer idx 0
  { id: 20, difficulty: 'EASY', drillType: 'COUNT', type: 'emoji',
    sequence: ['🐱','🐶','🐱','🐶','🐶'],
    missingIndex: -1, answer: '2', options: ['1','2','3'], countTarget: '🐱' },  // answer idx 1

  // ════════════════════════════════════════════════════════════════
  // MEDIUM — ABC patterns, 3 cycling elements, 6-9 items
  // ════════════════════════════════════════════════════════════════

  { id: 21, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍎','🍊','?'],
    missingIndex: 5, answer: '🍋', options: ['🍋','🍎','🍊'] },             // answer idx 0
  { id: 22, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'color',
    sequence: ['🔴','🟡','🔵','🔴','🟡','?'],
    missingIndex: 5, answer: '🔵', options: ['🟡','🔵','🔴'] },             // answer idx 1
  { id: 23, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['🔺','⭕','⬛','🔺','⭕','?'],
    missingIndex: 5, answer: '⬛', options: ['🔺','⭕','⬛'] },             // answer idx 2
  { id: 24, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐮','🐷','🐔','🐮','🐷','?'],
    missingIndex: 5, answer: '🐔', options: ['🐔','🐮','🐷'] },            // answer idx 0
  { id: 25, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬆️','➡️','?'],
    missingIndex: 5, answer: '⬇️', options: ['➡️','⬇️','⬆️'] },           // answer idx 1
  { id: 26, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🌞','🌧️','🌈','🌞','🌧️','?'],
    missingIndex: 5, answer: '🌈', options: ['🌞','🌧️','🌈'] },          // answer idx 2
  { id: 27, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐸','🦊','🐼','🐸','🦊','?'],
    missingIndex: 5, answer: '🐼', options: ['🐼','🐸','🦊'] },           // answer idx 0
  { id: 28, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍓','🍇','🍒','🍓','🍇','?'],
    missingIndex: 5, answer: '🍒', options: ['🍇','🍒','🍓'] },           // answer idx 1

  // MEDIUM — LONG (8-9 items, ABC)
  { id: 29, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🐱','🐶','🐸','🐱','🐶','?'],
    missingIndex: 8, answer: '🐸', options: ['🐱','🐶','🐸'] },           // answer idx 2
  { id: 30, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'emoji',
    sequence: ['⭐','🌙','☀️','⭐','🌙','☀️','⭐','🌙','?'],
    missingIndex: 8, answer: '☀️', options: ['☀️','⭐','🌙'] },           // answer idx 0
  { id: 31, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'color',
    sequence: ['🟢','🟠','🟣','🟢','🟠','🟣','🟢','🟠','?'],
    missingIndex: 8, answer: '🟣', options: ['🟢','🟣','🟠'] },          // answer idx 1

  // MEDIUM — MISSING MIDDLE
  { id: 32, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍎','?','🍋','🍎'],
    missingIndex: 4, answer: '🍊', options: ['🍊','🍎','🍋'] },          // answer idx 0
  { id: 33, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬆️','➡️','?','⬆️'],
    missingIndex: 5, answer: '⬇️', options: ['➡️','⬇️','⬆️'] },         // answer idx 1
  { id: 34, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🚀','🛸','🌍','🚀','🛸','🌍','?','🛸','🌍'],
    missingIndex: 6, answer: '🚀', options: ['🌍','🛸','🚀'] },          // answer idx 2

  // MEDIUM — FIND THE MISTAKE
  { id: 35, difficulty: 'MEDIUM', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍎','🍊','🐸','🍎','🍊','🍋'],
    missingIndex: 5, answer: '🐸', options: ['🐸'] },
  { id: 36, difficulty: 'MEDIUM', drillType: 'FIND_MISTAKE', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬆️','➡️','⬅️','⬆️','➡️','⬇️'],
    missingIndex: 5, answer: '⬅️', options: ['⬅️'] },
  { id: 37, difficulty: 'MEDIUM', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🌞','🌧️','🌈','🌞','🌧️','🌈','🌞','🐱','🌈'],
    missingIndex: 7, answer: '🐱', options: ['🐱'] },

  // MEDIUM — COUNT
  { id: 38, difficulty: 'MEDIUM', drillType: 'COUNT', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍎','🍊','🍎','🍊','🍎'],
    missingIndex: -1, answer: '4', options: ['4','3','5'], countTarget: '🍎' },  // answer idx 0
  { id: 39, difficulty: 'MEDIUM', drillType: 'COUNT', type: 'color',
    sequence: ['🔴','🟡','🔵','🔴','🟡','🔵','🔴'],
    missingIndex: -1, answer: '3', options: ['2','3','4'], countTarget: '🔴' },  // answer idx 1
  { id: 40, difficulty: 'MEDIUM', drillType: 'COUNT', type: 'emoji',
    sequence: ['⭐','🌙','☀️','⭐','🌙','⭐','🌙','⭐'],
    missingIndex: -1, answer: '4', options: ['2','3','4'], countTarget: '⭐' },  // answer idx 2

  // ════════════════════════════════════════════════════════════════
  // HARD — AABB / AAB patterns, trickier mistakes
  // ════════════════════════════════════════════════════════════════

  // AABB — NEXT
  { id: 41, difficulty: 'HARD', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐱','🐱','🐶','🐶','🐱','🐱','?'],
    missingIndex: 6, answer: '🐶', options: ['🐶','🐱','🐸'] },          // answer idx 0
  { id: 42, difficulty: 'HARD', drillType: 'NEXT', type: 'color',
    sequence: ['🔴','🔴','🔵','🔵','🔴','🔴','?'],
    missingIndex: 6, answer: '🔵', options: ['🔴','🔵','🟡'] },          // answer idx 1
  { id: 43, difficulty: 'HARD', drillType: 'NEXT', type: 'shape',
    sequence: ['⬛','⬛','⬜','⬜','⬛','⬛','?'],
    missingIndex: 6, answer: '⬜', options: ['⬛','🔺','⬜'] },          // answer idx 2

  // AAB — NEXT
  { id: 44, difficulty: 'HARD', drillType: 'NEXT', type: 'emoji',
    sequence: ['⭐','⭐','🌙','⭐','⭐','🌙','⭐','⭐','?'],
    missingIndex: 8, answer: '🌙', options: ['🌙','⭐','☀️'] },         // answer idx 0
  { id: 45, difficulty: 'HARD', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍎','🍎','🍊','🍎','🍎','🍊','🍎','🍎','?'],
    missingIndex: 8, answer: '🍊', options: ['🍎','🍊','🍋'] },         // answer idx 1
  { id: 46, difficulty: 'HARD', drillType: 'NEXT', type: 'emoji',
    sequence: ['🦊','🦊','🐻','🦊','🦊','🐻','🦊','🦊','?'],
    missingIndex: 8, answer: '🐻', options: ['🦊','🐱','🐻'] },         // answer idx 2

  // ABB — NEXT
  { id: 47, difficulty: 'HARD', drillType: 'NEXT', type: 'emoji',
    sequence: ['🌻','🍀','🍀','🌻','🍀','🍀','🌻','?'],
    missingIndex: 7, answer: '🍀', options: ['🍀','🌻','🌹'] },         // answer idx 0
  { id: 48, difficulty: 'HARD', drillType: 'NEXT', type: 'color',
    sequence: ['🟢','🟡','🟡','🟢','🟡','🟡','🟢','?'],
    missingIndex: 7, answer: '🟡', options: ['🟢','🟡','🟣'] },         // answer idx 1

  // HARD — AABB MISSING MIDDLE
  { id: 49, difficulty: 'HARD', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🐱','🐱','🐶','?','🐱','🐱','🐶','🐶'],
    missingIndex: 3, answer: '🐶', options: ['🐶','🐱','🐸'] },         // answer idx 0
  { id: 50, difficulty: 'HARD', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['⭐','⭐','🌙','⭐','⭐','?','⭐','⭐','🌙'],
    missingIndex: 5, answer: '🌙', options: ['⭐','🌙','☀️'] },         // answer idx 1
  { id: 51, difficulty: 'HARD', drillType: 'MISSING_MIDDLE', type: 'color',
    sequence: ['🔴','🔴','🔵','🔵','?','🔴','🔵','🔵'],
    missingIndex: 4, answer: '🔴', options: ['🔵','🟡','🔴'] },         // answer idx 2

  // HARD — FIND THE MISTAKE (trickier — break inside a pair)
  { id: 52, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🐱','🐱','🐶','🐶','🐱','🐸','🐶','🐶','🐱','🐱'],
    missingIndex: 5, answer: '🐸', options: ['🐸'] },
  { id: 53, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['⭐','⭐','🌙','⭐','⭐','🌙','⭐','☀️','🌙'],
    missingIndex: 7, answer: '☀️', options: ['☀️'] },
  { id: 54, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'color',
    sequence: ['🔴','🔴','🔵','🔵','🟡','🔴','🔵','🔵','🔴','🔴'],
    missingIndex: 4, answer: '🟡', options: ['🟡'] },

  // HARD — COUNT
  { id: 55, difficulty: 'HARD', drillType: 'COUNT', type: 'emoji',
    sequence: ['🐱','🐱','🐶','🐶','🐱','🐱','🐶','🐶','🐱'],
    missingIndex: -1, answer: '5', options: ['5','4','6'], countTarget: '🐱' },  // answer idx 0
  { id: 56, difficulty: 'HARD', drillType: 'COUNT', type: 'emoji',
    sequence: ['⭐','⭐','🌙','⭐','⭐','🌙','⭐','⭐','🌙'],
    missingIndex: -1, answer: '3', options: ['2','3','4'], countTarget: '🌙' },  // answer idx 1
  { id: 57, difficulty: 'HARD', drillType: 'COUNT', type: 'color',
    sequence: ['🔵','🔵','🟢','🔵','🔵','🟢','🔵'],
    missingIndex: -1, answer: '5', options: ['3','4','5'], countTarget: '🔵' },  // answer idx 2

  // ════════════════════════════════════════════════════════════════
  // EXPERT — 4-element cycles, very long FIND_MISTAKE sequences
  // ════════════════════════════════════════════════════════════════

  // 4-element cycle — NEXT (4 options)
  { id: 58, difficulty: 'EXPERT', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🦊','🐱','🐶','🐸','🦊','🐱','?'],
    missingIndex: 9, answer: '🐶', options: ['🐶','🐱','🐸','🦊'] },     // answer idx 0
  { id: 59, difficulty: 'EXPERT', drillType: 'NEXT', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬅️','⬆️','➡️','⬇️','⬅️','⬆️','?'],
    missingIndex: 9, answer: '➡️', options: ['⬆️','➡️','⬇️','⬅️'] },     // answer idx 1
  { id: 60, difficulty: 'EXPERT', drillType: 'NEXT', type: 'color',
    sequence: ['🔴','🟡','🔵','🟢','🔴','🟡','🔵','🟢','🔴','?'],
    missingIndex: 9, answer: '🟡', options: ['🔵','🟢','🟡','🔴'] },     // answer idx 2
  { id: 61, difficulty: 'EXPERT', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍇','🍎','🍊','🍋','🍇','🍎','?'],
    missingIndex: 9, answer: '🍊', options: ['🍎','🍋','🍇','🍊'] },     // answer idx 3
  { id: 62, difficulty: 'EXPERT', drillType: 'NEXT', type: 'emoji',
    sequence: ['⭐','🌙','☀️','🌈','⭐','🌙','☀️','🌈','⭐','?'],
    missingIndex: 9, answer: '🌙', options: ['🌙','☀️','🌈','⭐'] },     // answer idx 0

  // EXPERT — 4-element MISSING MIDDLE (4 options)
  { id: 63, difficulty: 'EXPERT', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🦊','🐱','?','🐸','🦊','🐱','🐶'],
    missingIndex: 5, answer: '🐶', options: ['🐸','🐶','🦊','🐱'] },     // answer idx 1
  { id: 64, difficulty: 'EXPERT', drillType: 'MISSING_MIDDLE', type: 'color',
    sequence: ['🔴','🟡','🔵','🟢','🔴','🟡','?','🟢','🔴','🟡'],
    missingIndex: 6, answer: '🔵', options: ['🔴','🟢','🔵','🟡'] },     // answer idx 2
  { id: 65, difficulty: 'EXPERT', drillType: 'MISSING_MIDDLE', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬅️','?','➡️','⬇️','⬅️','⬆️','➡️'],
    missingIndex: 4, answer: '⬆️', options: ['⬆️','➡️','⬇️','⬅️'] },     // answer idx 0

  // EXPERT — very long FIND_MISTAKE
  { id: 66, difficulty: 'EXPERT', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🦊','🐱','🐶','🐸','🦊','🐱','🐼','🐸','🦊'],
    missingIndex: 9, answer: '🐼', options: ['🐼'] },
  { id: 67, difficulty: 'EXPERT', drillType: 'FIND_MISTAKE', type: 'color',
    sequence: ['🔴','🟡','🔵','🟢','🔴','🟡','🔵','🟢','🔴','🟡','🟣','🟢'],
    missingIndex: 10, answer: '🟣', options: ['🟣'] },
  { id: 68, difficulty: 'EXPERT', drillType: 'FIND_MISTAKE', type: 'rotation',
    sequence: ['⬆️','➡️','⬇️','⬅️','⬆️','➡️','⬇️','⬅️','⬆️','↗️','⬇️','⬅️'],
    missingIndex: 9, answer: '↗️', options: ['↗️'] },
  { id: 69, difficulty: 'EXPERT', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍇','🍎','🍊','🍋','🍇','🍎','🍊','🍓','🍇'],
    missingIndex: 10, answer: '🍓', options: ['🍓'] },

  // EXPERT — COUNT (4 options)
  { id: 70, difficulty: 'EXPERT', drillType: 'COUNT', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🦊','🐱','🐶','🐸','🦊','🐱','🐶'],
    missingIndex: -1, answer: '3', options: ['3','2','4','5'], countTarget: '🐱' },  // idx 0
  { id: 71, difficulty: 'EXPERT', drillType: 'COUNT', type: 'color',
    sequence: ['🔴','🟡','🔵','🟢','🔴','🟡','🔵','🟢','🔴','🟡','🔵'],
    missingIndex: -1, answer: '3', options: ['2','3','4','5'], countTarget: '🔵' },  // idx 1

  // ════════════════════════════════════════════════════════════════
  // MASTER — complex long sequences, COUNT with 4 options
  // ════════════════════════════════════════════════════════════════

  // MASTER — long AABB cycles, NEXT
  { id: 72, difficulty: 'MASTER', drillType: 'NEXT', type: 'emoji',
    sequence: ['🐱','🐱','🐶','🐶','🐸','🐸','🐱','🐱','🐶','🐶','🐸','?'],
    missingIndex: 11, answer: '🐸', options: ['🐸','🐱','🐶','🦊'] },     // answer idx 0
  { id: 73, difficulty: 'MASTER', drillType: 'NEXT', type: 'color',
    sequence: ['🔴','🔴','🟡','🟡','🔵','🔵','🔴','🔴','🟡','🟡','🔵','?'],
    missingIndex: 11, answer: '🔵', options: ['🔴','🔵','🟡','🟢'] },     // answer idx 1
  { id: 74, difficulty: 'MASTER', drillType: 'NEXT', type: 'emoji',
    sequence: ['⭐','🌙','🌙','☀️','⭐','🌙','🌙','☀️','⭐','🌙','🌙','?'],
    missingIndex: 11, answer: '☀️', options: ['⭐','🌙','☀️','🌈'] },     // answer idx 2

  // MASTER — long 4-element cycle, NEXT
  { id: 75, difficulty: 'MASTER', drillType: 'NEXT', type: 'emoji',
    sequence: ['🚗','✈️','🚢','🚂','🚗','✈️','🚢','🚂','🚗','✈️','🚢','?'],
    missingIndex: 11, answer: '🚂', options: ['🚗','✈️','🚢','🚂'] },     // answer idx 3
  { id: 76, difficulty: 'MASTER', drillType: 'NEXT', type: 'emoji',
    sequence: ['🍎','🍊','🍋','🍇','🍓','🍎','🍊','🍋','🍇','🍓','🍎','?'],
    missingIndex: 11, answer: '🍊', options: ['🍊','🍋','🍇','🍓'] },     // answer idx 0 (5-cycle)

  // MASTER — complex MISSING MIDDLE
  { id: 77, difficulty: 'MASTER', drillType: 'MISSING_MIDDLE', type: 'emoji',
    sequence: ['🐱','🐱','🐶','🐶','🐸','🐸','🐱','?','🐶','🐶','🐸','🐸'],
    missingIndex: 7, answer: '🐱', options: ['🐶','🐱','🐸','🦊'] },     // answer idx 1
  { id: 78, difficulty: 'MASTER', drillType: 'MISSING_MIDDLE', type: 'color',
    sequence: ['🔴','🟡','🔵','🟢','🟣','🔴','🟡','🔵','?','🟣','🔴','🟡'],
    missingIndex: 8, answer: '🟢', options: ['🔴','🟣','🟢','🟡'] },     // answer idx 2 (5-cycle)
  { id: 79, difficulty: 'MASTER', drillType: 'MISSING_MIDDLE', type: 'rotation',
    sequence: ['⬆️','⬆️','➡️','➡️','⬇️','⬇️','?','⬆️','➡️','➡️','⬇️','⬇️'],
    missingIndex: 6, answer: '⬆️', options: ['⬆️','➡️','⬇️','⬅️'] },     // answer idx 0

  // MASTER — extra-long FIND_MISTAKE
  { id: 80, difficulty: 'MASTER', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🐱','🐱','🐶','🐶','🐸','🐸','🐱','🐱','🐶','🦊','🐸','🐸','🐱','🐱'],
    missingIndex: 9, answer: '🦊', options: ['🦊'] },
  { id: 81, difficulty: 'MASTER', drillType: 'FIND_MISTAKE', type: 'emoji',
    sequence: ['🚗','✈️','🚢','🚂','🚗','✈️','🚢','🚂','🚗','✈️','🚁','🚂','🚗','✈️'],
    missingIndex: 10, answer: '🚁', options: ['🚁'] },
  { id: 82, difficulty: 'MASTER', drillType: 'FIND_MISTAKE', type: 'color',
    sequence: ['🔴','🟡','🔵','🟢','🟣','🔴','🟡','🔵','🟢','🟣','🔴','🟠','🔵','🟢'],
    missingIndex: 11, answer: '🟠', options: ['🟠'] },

  // MASTER — COUNT with 4 options
  { id: 83, difficulty: 'MASTER', drillType: 'COUNT', type: 'emoji',
    sequence: ['🐱','🐶','🐸','🐱','🐶','🐱','🐸','🐱','🐶','🐱','🐸','🐱'],
    missingIndex: -1, answer: '6', options: ['6','4','5','7'], countTarget: '🐱' },  // idx 0
  { id: 84, difficulty: 'MASTER', drillType: 'COUNT', type: 'color',
    sequence: ['🔴','🟡','🔵','🟢','🔴','🟡','🔴','🟢','🔴','🟡','🔵','🔴'],
    missingIndex: -1, answer: '5', options: ['4','5','6','7'], countTarget: '🔴' },  // idx 1
  { id: 85, difficulty: 'MASTER', drillType: 'COUNT', type: 'emoji',
    sequence: ['⭐','🌙','☀️','⭐','🌙','⭐','☀️','⭐','🌙','⭐','☀️','⭐'],
    missingIndex: -1, answer: '6', options: ['4','5','6','7'], countTarget: '⭐' },  // idx 2

  // ════════════════════════════════════════════════════════════════
  // ░░░ SHAPE-BASED QUESTIONS (CSS shapes via "shape:color[:size]") ░░░
  // ════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────
  // EASY — Type A (ABAB colour, same shape) + Type B (ABAB shape, same colour)
  // ────────────────────────────────────────────────────────────────

  // Type A — ABAB colour patterns
  { id: 101, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['circle:red','circle:blue','circle:red','circle:blue','circle:red','?'],
    missingIndex: 5, answer: 'circle:blue', options: ['circle:blue','circle:red','circle:yellow'] },  // idx 0
  { id: 102, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['square:yellow','square:green','square:yellow','square:green','square:yellow','?'],
    missingIndex: 5, answer: 'square:green', options: ['square:yellow','square:green','square:blue'] },  // idx 1
  { id: 103, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['triangle:red','triangle:purple','triangle:red','triangle:purple','triangle:red','?'],
    missingIndex: 5, answer: 'triangle:purple', options: ['triangle:red','triangle:green','triangle:purple'] },  // idx 2
  { id: 104, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['heart:pink','heart:teal','heart:pink','heart:teal','heart:pink','?'],
    missingIndex: 5, answer: 'heart:teal', options: ['heart:teal','heart:pink','heart:orange'] },  // idx 0
  { id: 105, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['star:orange','star:blue','star:orange','star:blue','star:orange','?'],
    missingIndex: 5, answer: 'star:blue', options: ['star:orange','star:blue','star:green'] },  // idx 1
  { id: 106, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['diamond:green','diamond:orange','diamond:green','diamond:orange','diamond:green','?'],
    missingIndex: 5, answer: 'diamond:orange', options: ['diamond:green','diamond:purple','diamond:orange'] },  // idx 2

  // Type B — ABAB alternating shapes, same colour
  { id: 107, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['circle:red','square:red','circle:red','square:red','circle:red','?'],
    missingIndex: 5, answer: 'square:red', options: ['square:red','circle:red','triangle:red'] },  // idx 0
  { id: 108, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['triangle:blue','diamond:blue','triangle:blue','diamond:blue','triangle:blue','?'],
    missingIndex: 5, answer: 'diamond:blue', options: ['triangle:blue','diamond:blue','circle:blue'] },  // idx 1
  { id: 109, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['star:purple','heart:purple','star:purple','heart:purple','star:purple','?'],
    missingIndex: 5, answer: 'heart:purple', options: ['star:purple','circle:purple','heart:purple'] },  // idx 2
  { id: 110, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['circle:green','triangle:green','circle:green','triangle:green','circle:green','?'],
    missingIndex: 5, answer: 'triangle:green', options: ['triangle:green','circle:green','square:green'] },  // idx 0
  { id: 111, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['square:orange','star:orange','square:orange','star:orange','square:orange','?'],
    missingIndex: 5, answer: 'star:orange', options: ['square:orange','star:orange','heart:orange'] },  // idx 1
  { id: 112, difficulty: 'EASY', drillType: 'NEXT', type: 'shape',
    sequence: ['heart:teal','diamond:teal','heart:teal','diamond:teal','heart:teal','?'],
    missingIndex: 5, answer: 'diamond:teal', options: ['heart:teal','circle:teal','diamond:teal'] },  // idx 2

  // EASY — Type F colour-only rows (circles, 2 colours)
  { id: 113, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['circle:green','circle:orange','circle:green','circle:orange','?'],
    missingIndex: 4, answer: 'circle:green', options: ['circle:green','circle:orange','circle:blue'] },  // idx 0
  { id: 114, difficulty: 'EASY', drillType: 'NEXT', type: 'color',
    sequence: ['circle:purple','circle:yellow','circle:purple','circle:yellow','?'],
    missingIndex: 4, answer: 'circle:purple', options: ['circle:yellow','circle:purple','circle:red'] },  // idx 1

  // EASY — MISSING_MIDDLE with shapes
  { id: 115, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'shape',
    sequence: ['circle:red','square:blue','?','square:blue','circle:red','square:blue'],
    missingIndex: 2, answer: 'circle:red', options: ['circle:red','square:blue','triangle:red'] },  // idx 0
  { id: 116, difficulty: 'EASY', drillType: 'MISSING_MIDDLE', type: 'color',
    sequence: ['star:yellow','star:pink','star:yellow','?','star:yellow','star:pink'],
    missingIndex: 3, answer: 'star:pink', options: ['star:yellow','star:pink','star:blue'] },  // idx 1

  // ────────────────────────────────────────────────────────────────
  // MEDIUM — Type C (AABB) + Type D (ABC cycle) + Type F (3-colour)
  // ────────────────────────────────────────────────────────────────

  // Type D — ABC 3-element cycles
  { id: 117, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['circle:red','square:blue','triangle:yellow','circle:red','square:blue','?'],
    missingIndex: 5, answer: 'triangle:yellow', options: ['triangle:yellow','circle:red','square:blue'] },  // idx 0
  { id: 118, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['heart:pink','star:orange','diamond:purple','heart:pink','star:orange','?'],
    missingIndex: 5, answer: 'diamond:purple', options: ['heart:pink','diamond:purple','star:orange'] },  // idx 1
  { id: 119, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['triangle:green','circle:orange','square:purple','triangle:green','circle:orange','?'],
    missingIndex: 5, answer: 'square:purple', options: ['triangle:green','circle:orange','square:purple'] },  // idx 2
  { id: 120, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['star:red','heart:blue','circle:yellow','star:red','heart:blue','?'],
    missingIndex: 5, answer: 'circle:yellow', options: ['circle:yellow','star:red','heart:blue'] },  // idx 0
  { id: 121, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['diamond:teal','square:pink','triangle:orange','diamond:teal','square:pink','?'],
    missingIndex: 5, answer: 'triangle:orange', options: ['diamond:teal','triangle:orange','square:pink'] },  // idx 1

  // Type C — AABB patterns
  { id: 122, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['circle:red','circle:red','square:blue','square:blue','circle:red','circle:red','?'],
    missingIndex: 6, answer: 'square:blue', options: ['square:blue','circle:red','triangle:blue'] },  // idx 0
  { id: 123, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['star:yellow','star:yellow','heart:pink','heart:pink','star:yellow','?'],
    missingIndex: 5, answer: 'star:yellow', options: ['heart:pink','star:yellow','diamond:yellow'] },  // idx 1
  { id: 124, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'color',
    sequence: ['circle:green','circle:green','circle:purple','circle:purple','circle:green','circle:green','?'],
    missingIndex: 6, answer: 'circle:purple', options: ['circle:green','circle:orange','circle:purple'] },  // idx 2
  { id: 125, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['triangle:orange','triangle:orange','diamond:teal','diamond:teal','triangle:orange','triangle:orange','?'],
    missingIndex: 6, answer: 'diamond:teal', options: ['diamond:teal','triangle:orange','star:teal'] },  // idx 0

  // Type F — colour-only 3-colour rows
  { id: 126, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'color',
    sequence: ['circle:red','circle:blue','circle:yellow','circle:red','circle:blue','?'],
    missingIndex: 5, answer: 'circle:yellow', options: ['circle:red','circle:yellow','circle:blue'] },  // idx 1
  { id: 127, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'color',
    sequence: ['circle:green','circle:orange','circle:purple','circle:green','circle:orange','?'],
    missingIndex: 5, answer: 'circle:purple', options: ['circle:green','circle:orange','circle:purple'] },  // idx 2

  // MEDIUM — MISSING_MIDDLE (ABC)
  { id: 128, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'shape',
    sequence: ['circle:red','square:blue','triangle:yellow','circle:red','?','triangle:yellow','circle:red'],
    missingIndex: 4, answer: 'square:blue', options: ['square:blue','circle:red','triangle:yellow'] },  // idx 0
  { id: 129, difficulty: 'MEDIUM', drillType: 'MISSING_MIDDLE', type: 'shape',
    sequence: ['heart:pink','star:orange','diamond:purple','heart:pink','star:orange','?','heart:pink'],
    missingIndex: 5, answer: 'diamond:purple', options: ['heart:pink','diamond:purple','star:orange'] },  // idx 1

  // MEDIUM — Type B long alternating shapes
  { id: 130, difficulty: 'MEDIUM', drillType: 'NEXT', type: 'shape',
    sequence: ['circle:blue','star:blue','circle:blue','star:blue','circle:blue','star:blue','circle:blue','?'],
    missingIndex: 7, answer: 'star:blue', options: ['circle:blue','square:blue','star:blue'] },  // idx 2

  // ────────────────────────────────────────────────────────────────
  // HARD — Type E (size progression) + long AABB + Type G (find mistake)
  // ────────────────────────────────────────────────────────────────

  // Type E — size progression
  { id: 131, difficulty: 'HARD', drillType: 'NEXT', type: 'size',
    sequence: ['circle:red:lg','circle:red:sm','circle:red:lg','circle:red:sm','?'],
    missingIndex: 4, answer: 'circle:red:lg', options: ['circle:red:lg','circle:red:sm','square:red:lg'] },  // idx 0
  { id: 132, difficulty: 'HARD', drillType: 'NEXT', type: 'size',
    sequence: ['square:blue:lg','square:blue:sm','square:blue:lg','square:blue:sm','square:blue:lg','?'],
    missingIndex: 5, answer: 'square:blue:sm', options: ['square:blue:lg','square:blue:sm','circle:blue:sm'] },  // idx 1
  { id: 133, difficulty: 'HARD', drillType: 'NEXT', type: 'size',
    sequence: ['star:orange:sm','star:orange:lg','star:orange:sm','star:orange:lg','star:orange:sm','?'],
    missingIndex: 5, answer: 'star:orange:lg', options: ['star:orange:sm','heart:orange:lg','star:orange:lg'] },  // idx 2
  { id: 134, difficulty: 'HARD', drillType: 'NEXT', type: 'size',
    sequence: ['triangle:green:lg','triangle:green:sm','triangle:green:lg','triangle:green:sm','?'],
    missingIndex: 4, answer: 'triangle:green:lg', options: ['triangle:green:lg','triangle:green:sm','diamond:green:lg'] },  // idx 0

  // HARD — long AABB
  { id: 135, difficulty: 'HARD', drillType: 'NEXT', type: 'shape',
    sequence: ['circle:red','circle:red','triangle:yellow','triangle:yellow','circle:red','circle:red','triangle:yellow','?'],
    missingIndex: 7, answer: 'triangle:yellow', options: ['circle:red','triangle:yellow','square:yellow'] },  // idx 1
  { id: 136, difficulty: 'HARD', drillType: 'NEXT', type: 'shape',
    sequence: ['heart:pink','heart:pink','diamond:purple','diamond:purple','heart:pink','heart:pink','diamond:purple','?'],
    missingIndex: 7, answer: 'diamond:purple', options: ['heart:pink','star:purple','diamond:purple'] },  // idx 2

  // Type G — FIND_MISTAKE with shapes
  { id: 137, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'shape',
    sequence: ['circle:red','square:blue','circle:red','triangle:yellow','circle:red','square:blue'],
    missingIndex: 3, answer: 'triangle:yellow', options: ['triangle:yellow'] },
  { id: 138, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'color',
    sequence: ['circle:red','circle:blue','circle:red','circle:blue','circle:green','circle:blue'],
    missingIndex: 4, answer: 'circle:green', options: ['circle:green'] },
  { id: 139, difficulty: 'HARD', drillType: 'FIND_MISTAKE', type: 'shape',
    sequence: ['star:orange','heart:pink','star:orange','heart:pink','star:orange','diamond:pink'],
    missingIndex: 5, answer: 'diamond:pink', options: ['diamond:pink'] },

  // HARD — MISSING_MIDDLE size progression
  { id: 140, difficulty: 'HARD', drillType: 'MISSING_MIDDLE', type: 'size',
    sequence: ['circle:purple:lg','circle:purple:sm','circle:purple:lg','?','circle:purple:lg','circle:purple:sm'],
    missingIndex: 3, answer: 'circle:purple:sm', options: ['circle:purple:lg','circle:purple:sm','square:purple:sm'] },  // idx 1

  // HARD — COUNT with shapes
  { id: 141, difficulty: 'HARD', drillType: 'COUNT', type: 'shape',
    sequence: ['circle:red','square:blue','circle:red','square:blue','circle:red'],
    missingIndex: -1, answer: '3', options: ['3','2','4'], countTarget: 'circle:red' },  // idx 0
  { id: 142, difficulty: 'HARD', drillType: 'COUNT', type: 'shape',
    sequence: ['star:orange','heart:pink','star:orange','heart:pink','heart:pink','star:orange'],
    missingIndex: -1, answer: '3', options: ['2','3','4'], countTarget: 'heart:pink' },  // idx 1

  // ────────────────────────────────────────────────────────────────
  // EXPERT — multi-attribute, long sequences, tricky mistakes
  // ────────────────────────────────────────────────────────────────

  // Multi-attribute (colour AND shape both change in a cycle)
  { id: 143, difficulty: 'EXPERT', drillType: 'NEXT', type: 'mixed',
    sequence: ['circle:red','square:blue','triangle:yellow','diamond:green','circle:red','square:blue','triangle:yellow','?'],
    missingIndex: 7, answer: 'diamond:green', options: ['diamond:green','circle:red','square:blue','triangle:yellow'] },  // idx 0
  { id: 144, difficulty: 'EXPERT', drillType: 'NEXT', type: 'mixed',
    sequence: ['star:orange','heart:pink','diamond:purple','circle:teal','star:orange','heart:pink','diamond:purple','?'],
    missingIndex: 7, answer: 'circle:teal', options: ['star:orange','circle:teal','heart:pink','diamond:purple'] },  // idx 1
  { id: 145, difficulty: 'EXPERT', drillType: 'NEXT', type: 'mixed',
    sequence: ['square:red','circle:blue','star:yellow','heart:green','square:red','circle:blue','star:yellow','?'],
    missingIndex: 7, answer: 'heart:green', options: ['square:red','circle:blue','heart:green','star:yellow'] },  // idx 2

  // EXPERT — size + colour multi-attribute progression
  { id: 146, difficulty: 'EXPERT', drillType: 'NEXT', type: 'mixed',
    sequence: ['circle:red:lg','circle:blue:sm','circle:red:lg','circle:blue:sm','circle:red:lg','?'],
    missingIndex: 5, answer: 'circle:blue:sm', options: ['circle:blue:sm','circle:red:lg','circle:red:sm','circle:blue:lg'] },  // idx 0
  { id: 147, difficulty: 'EXPERT', drillType: 'NEXT', type: 'mixed',
    sequence: ['square:green:sm','square:orange:lg','square:green:sm','square:orange:lg','square:green:sm','?'],
    missingIndex: 5, answer: 'square:orange:lg', options: ['square:green:sm','square:orange:lg','square:green:lg','square:orange:sm'] },  // idx 1

  // EXPERT — long tricky FIND_MISTAKE
  { id: 148, difficulty: 'EXPERT', drillType: 'FIND_MISTAKE', type: 'mixed',
    sequence: ['circle:red','square:blue','triangle:yellow','circle:red','square:blue','triangle:yellow','circle:red','square:green','triangle:yellow'],
    missingIndex: 7, answer: 'square:green', options: ['square:green'] },
  { id: 149, difficulty: 'EXPERT', drillType: 'FIND_MISTAKE', type: 'mixed',
    sequence: ['star:orange','heart:pink','diamond:purple','star:orange','heart:pink','diamond:purple','star:orange','heart:teal','diamond:purple'],
    missingIndex: 7, answer: 'heart:teal', options: ['heart:teal'] },
  { id: 150, difficulty: 'EXPERT', drillType: 'FIND_MISTAKE', type: 'shape',
    sequence: ['circle:red','circle:red','square:blue','square:blue','circle:red','triangle:red','square:blue','square:blue'],
    missingIndex: 5, answer: 'triangle:red', options: ['triangle:red'] },

  // EXPERT — MISSING_MIDDLE 4-element cycle
  { id: 151, difficulty: 'EXPERT', drillType: 'MISSING_MIDDLE', type: 'mixed',
    sequence: ['circle:red','square:blue','triangle:yellow','diamond:green','circle:red','?','triangle:yellow','diamond:green'],
    missingIndex: 5, answer: 'square:blue', options: ['circle:red','square:blue','triangle:yellow','diamond:green'] },  // idx 1

  // EXPERT — COUNT 4-option with shapes
  { id: 152, difficulty: 'EXPERT', drillType: 'COUNT', type: 'shape',
    sequence: ['circle:red','square:blue','triangle:yellow','circle:red','square:blue','circle:red','triangle:yellow','circle:red'],
    missingIndex: -1, answer: '4', options: ['4','3','5','2'], countTarget: 'circle:red' },  // idx 0
  { id: 153, difficulty: 'EXPERT', drillType: 'COUNT', type: 'shape',
    sequence: ['star:orange','heart:pink','diamond:purple','star:orange','heart:pink','star:orange','diamond:purple'],
    missingIndex: -1, answer: '3', options: ['2','3','4','5'], countTarget: 'star:orange' },  // idx 1

  // ────────────────────────────────────────────────────────────────
  // MASTER — 4-element cycles colour+shape, COUNT 4-option, extra long
  // ────────────────────────────────────────────────────────────────

  { id: 154, difficulty: 'MASTER', drillType: 'NEXT', type: 'mixed',
    sequence: ['circle:red','square:blue','triangle:yellow','diamond:green','star:orange','circle:red','square:blue','triangle:yellow','diamond:green','?'],
    missingIndex: 9, answer: 'star:orange', options: ['star:orange','circle:red','square:blue','triangle:yellow'] },  // idx 0 (5-cycle)
  { id: 155, difficulty: 'MASTER', drillType: 'NEXT', type: 'mixed',
    sequence: ['heart:pink','star:orange','diamond:purple','circle:teal','heart:pink','star:orange','diamond:purple','circle:teal','heart:pink','?'],
    missingIndex: 9, answer: 'star:orange', options: ['heart:pink','star:orange','diamond:purple','circle:teal'] },  // idx 1
  { id: 156, difficulty: 'MASTER', drillType: 'NEXT', type: 'mixed',
    sequence: ['square:red:lg','square:red:sm','circle:blue:lg','circle:blue:sm','square:red:lg','square:red:sm','circle:blue:lg','?'],
    missingIndex: 7, answer: 'circle:blue:sm', options: ['square:red:lg','square:red:sm','circle:blue:sm','circle:blue:lg'] },  // idx 2

  // MASTER — long AABB with shape+colour
  { id: 157, difficulty: 'MASTER', drillType: 'NEXT', type: 'mixed',
    sequence: ['circle:red','circle:red','square:blue','square:blue','triangle:yellow','triangle:yellow','circle:red','circle:red','square:blue','square:blue','triangle:yellow','?'],
    missingIndex: 11, answer: 'triangle:yellow', options: ['triangle:yellow','circle:red','square:blue','diamond:yellow'] },  // idx 0

  // MASTER — extra-long FIND_MISTAKE
  { id: 158, difficulty: 'MASTER', drillType: 'FIND_MISTAKE', type: 'mixed',
    sequence: ['circle:red','square:blue','triangle:yellow','diamond:green','circle:red','square:blue','triangle:yellow','diamond:green','circle:red','square:purple','triangle:yellow','diamond:green'],
    missingIndex: 9, answer: 'square:purple', options: ['square:purple'] },
  { id: 159, difficulty: 'MASTER', drillType: 'FIND_MISTAKE', type: 'mixed',
    sequence: ['star:orange','heart:pink','diamond:purple','circle:teal','star:orange','heart:pink','diamond:purple','circle:teal','star:orange','heart:pink','pentagon:purple','circle:teal'],
    missingIndex: 10, answer: 'pentagon:purple', options: ['pentagon:purple'] },

  // MASTER — COUNT with 4 options
  { id: 160, difficulty: 'MASTER', drillType: 'COUNT', type: 'mixed',
    sequence: ['circle:red','square:blue','triangle:yellow','circle:red','diamond:green','circle:red','square:blue','circle:red','triangle:yellow','circle:red','square:blue','circle:red'],
    missingIndex: -1, answer: '6', options: ['6','4','5','7'], countTarget: 'circle:red' },  // idx 0
  { id: 161, difficulty: 'MASTER', drillType: 'COUNT', type: 'mixed',
    sequence: ['star:orange','heart:pink','star:orange','diamond:purple','star:orange','heart:pink','star:orange','star:orange','diamond:purple','star:orange','heart:pink','star:orange'],
    missingIndex: -1, answer: '7', options: ['6','7','8','5'], countTarget: 'star:orange' },  // idx 1

  // MASTER — complex MISSING_MIDDLE 4-cycle
  { id: 162, difficulty: 'MASTER', drillType: 'MISSING_MIDDLE', type: 'mixed',
    sequence: ['circle:red','square:blue','triangle:yellow','diamond:green','circle:red','square:blue','?','diamond:green','circle:red','square:blue','triangle:yellow','diamond:green'],
    missingIndex: 6, answer: 'triangle:yellow', options: ['circle:red','square:blue','triangle:yellow','diamond:green'] },  // idx 2
];

export const PATTERN_EMOJIS_POOL = [
  '🔴','🔵','🟡','🟢','🟠','🟣',
  '⭕','🔺','⬛','⬜','💎',
  '🐱','🐶','🐸','🦊','🦁','🐘',
  '🍎','🍊','🍋','🌟','🌙','☀️',
];
