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
];

export const PATTERN_EMOJIS_POOL = [
  '🔴','🔵','🟡','🟢','🟠','🟣',
  '⭕','🔺','⬛','⬜','💎',
  '🐱','🐶','🐸','🦊','🦁','🐘',
  '🍎','🍊','🍋','🌟','🌙','☀️',
];
