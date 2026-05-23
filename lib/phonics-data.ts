export type VowelSound = 'A' | 'E' | 'I' | 'O' | 'U';

export interface CVCWord {
  word: string;
  emoji: string;
  vowel: VowelSound;
  consonants?: string[];     // explicit consonant list (required for digraph words)
  digraph?: 'SH' | 'CH' | 'TH' | 'WH' | 'CK';
}

export const CVC_WORDS: CVCWord[] = [
  // Short A
  { word: 'CAT', emoji: '🐱', vowel: 'A' },
  { word: 'BAT', emoji: '🦇', vowel: 'A' },
  { word: 'HAT', emoji: '🎩', vowel: 'A' },
  { word: 'MAT', emoji: '🟫', vowel: 'A' },
  { word: 'RAT', emoji: '🐀', vowel: 'A' },
  { word: 'SAT', emoji: '💺', vowel: 'A' },
  { word: 'PAT', emoji: '👋', vowel: 'A' },
  { word: 'FAT', emoji: '🍖', vowel: 'A' },
  { word: 'VAN', emoji: '🚐', vowel: 'A' },
  { word: 'CAN', emoji: '🥫', vowel: 'A' },
  { word: 'MAN', emoji: '🧑', vowel: 'A' },
  { word: 'PAN', emoji: '🍳', vowel: 'A' },
  { word: 'TAN', emoji: '🏖️', vowel: 'A' },
  { word: 'RAN', emoji: '🏃', vowel: 'A' },
  { word: 'BAG', emoji: '👜', vowel: 'A' },
  { word: 'TAG', emoji: '🏷️', vowel: 'A' },
  { word: 'RAG', emoji: '🧹', vowel: 'A' },
  { word: 'MAP', emoji: '🗺️', vowel: 'A' },
  { word: 'NAP', emoji: '😴', vowel: 'A' },
  { word: 'CAP', emoji: '🧢', vowel: 'A' },
  { word: 'LAP', emoji: '🪑', vowel: 'A' },
  { word: 'TAP', emoji: '🚰', vowel: 'A' },
  { word: 'DAD', emoji: '👨', vowel: 'A' },
  { word: 'MAD', emoji: '😠', vowel: 'A' },
  { word: 'SAD', emoji: '😢', vowel: 'A' },
  { word: 'BAD', emoji: '👎', vowel: 'A' },
  { word: 'HAD', emoji: '✓', vowel: 'A' },
  { word: 'GAS', emoji: '⛽', vowel: 'A' },
  { word: 'JAM', emoji: '🍇', vowel: 'A' },
  { word: 'HAM', emoji: '🍖', vowel: 'A' },
  { word: 'RAM', emoji: '🐏', vowel: 'A' },
  { word: 'YAM', emoji: '🍠', vowel: 'A' },
  // Short E
  { word: 'BED', emoji: '🛏️', vowel: 'E' },
  { word: 'RED', emoji: '🔴', vowel: 'E' },
  { word: 'FED', emoji: '🍼', vowel: 'E' },
  { word: 'LED', emoji: '💡', vowel: 'E' },
  { word: 'HEN', emoji: '🐔', vowel: 'E' },
  { word: 'PEN', emoji: '✏️', vowel: 'E' },
  { word: 'TEN', emoji: '🔟', vowel: 'E' },
  { word: 'MEN', emoji: '👨', vowel: 'E' },
  { word: 'DEN', emoji: '🐻', vowel: 'E' },
  { word: 'BEG', emoji: '🙏', vowel: 'E' },
  { word: 'LEG', emoji: '🦵', vowel: 'E' },
  { word: 'PEG', emoji: '📌', vowel: 'E' },
  { word: 'NET', emoji: '🥅', vowel: 'E' },
  { word: 'PET', emoji: '🐾', vowel: 'E' },
  { word: 'SET', emoji: '⚙️', vowel: 'E' },
  { word: 'VET', emoji: '👩‍⚕️', vowel: 'E' },
  { word: 'WET', emoji: '💧', vowel: 'E' },
  { word: 'JET', emoji: '✈️', vowel: 'E' },
  { word: 'BET', emoji: '🎲', vowel: 'E' },
  { word: 'GET', emoji: '📥', vowel: 'E' },
  { word: 'LET', emoji: '✅', vowel: 'E' },
  { word: 'MET', emoji: '🤝', vowel: 'E' },
  // Short I
  { word: 'BIT', emoji: '🔪', vowel: 'I' },
  { word: 'FIT', emoji: '💪', vowel: 'I' },
  { word: 'HIT', emoji: '🥊', vowel: 'I' },
  { word: 'KIT', emoji: '🧰', vowel: 'I' },
  { word: 'LIT', emoji: '🕯️', vowel: 'I' },
  { word: 'PIT', emoji: '🕳️', vowel: 'I' },
  { word: 'SIT', emoji: '🪑', vowel: 'I' },
  { word: 'WIT', emoji: '🧠', vowel: 'I' },
  { word: 'BIG', emoji: '🔭', vowel: 'I' },
  { word: 'DIG', emoji: '⛏️', vowel: 'I' },
  { word: 'PIG', emoji: '🐷', vowel: 'I' },
  { word: 'WIG', emoji: '👩', vowel: 'I' },
  { word: 'FIN', emoji: '🦈', vowel: 'I' },
  { word: 'PIN', emoji: '📌', vowel: 'I' },
  { word: 'TIN', emoji: '🥫', vowel: 'I' },
  { word: 'WIN', emoji: '🏆', vowel: 'I' },
  { word: 'HID', emoji: '🙈', vowel: 'I' },
  { word: 'LID', emoji: '🪣', vowel: 'I' },
  { word: 'HIP', emoji: '🕺', vowel: 'I' },
  { word: 'DIP', emoji: '🫙', vowel: 'I' },
  { word: 'LIP', emoji: '💋', vowel: 'I' },
  { word: 'SIP', emoji: '☕', vowel: 'I' },
  { word: 'TIP', emoji: '💡', vowel: 'I' },
  { word: 'ZIP', emoji: '🤐', vowel: 'I' },
  // Short O
  { word: 'DOG', emoji: '🐕', vowel: 'O' },
  { word: 'FOG', emoji: '🌫️', vowel: 'O' },
  { word: 'HOG', emoji: '🐖', vowel: 'O' },
  { word: 'JOG', emoji: '🏃', vowel: 'O' },
  { word: 'LOG', emoji: '🪵', vowel: 'O' },
  { word: 'HOP', emoji: '🐰', vowel: 'O' },
  { word: 'MOP', emoji: '🧹', vowel: 'O' },
  { word: 'POP', emoji: '🎈', vowel: 'O' },
  { word: 'TOP', emoji: '🔝', vowel: 'O' },
  { word: 'DOT', emoji: '⚫', vowel: 'O' },
  { word: 'HOT', emoji: '🔥', vowel: 'O' },
  { word: 'LOT', emoji: '🅿️', vowel: 'O' },
  { word: 'NOT', emoji: '❌', vowel: 'O' },
  { word: 'POT', emoji: '🪴', vowel: 'O' },
  { word: 'ROD', emoji: '🎣', vowel: 'O' },
  { word: 'NOD', emoji: '😊', vowel: 'O' },
  { word: 'COD', emoji: '🐟', vowel: 'O' },
  { word: 'BOB', emoji: '💈', vowel: 'O' },
  { word: 'JOB', emoji: '💼', vowel: 'O' },
  { word: 'SOB', emoji: '😭', vowel: 'O' },
  { word: 'COP', emoji: '👮', vowel: 'O' },
  { word: 'COT', emoji: '🛏️', vowel: 'O' },
  { word: 'GOT', emoji: '✅', vowel: 'O' },
  // Short U
  { word: 'BUD', emoji: '🌱', vowel: 'U' },
  { word: 'BUG', emoji: '🐛', vowel: 'U' },
  { word: 'HUG', emoji: '🤗', vowel: 'U' },
  { word: 'JUG', emoji: '🫙', vowel: 'U' },
  { word: 'MUG', emoji: '☕', vowel: 'U' },
  { word: 'PUG', emoji: '🐶', vowel: 'U' },
  { word: 'RUG', emoji: '🟫', vowel: 'U' },
  { word: 'TUG', emoji: '🚢', vowel: 'U' },
  { word: 'GUM', emoji: '🍬', vowel: 'U' },
  { word: 'HUM', emoji: '🎵', vowel: 'U' },
  { word: 'SUM', emoji: '➕', vowel: 'U' },
  { word: 'BUN', emoji: '🍞', vowel: 'U' },
  { word: 'FUN', emoji: '🎉', vowel: 'U' },
  { word: 'RUN', emoji: '🏃', vowel: 'U' },
  { word: 'SUN', emoji: '☀️', vowel: 'U' },
  { word: 'CUB', emoji: '🐻', vowel: 'U' },
  { word: 'CUP', emoji: '☕', vowel: 'U' },
  { word: 'TUB', emoji: '🛁', vowel: 'U' },
  { word: 'CUT', emoji: '✂️', vowel: 'U' },
  { word: 'HUT', emoji: '🏚️', vowel: 'U' },
  { word: 'NUT', emoji: '🥜', vowel: 'U' },
  { word: 'BUS', emoji: '🚌', vowel: 'U' },

  // ── Digraph words ────────────────────────────────────────────────
  // SH
  { word: 'SHIP', emoji: '🚢', vowel: 'I', consonants: ['P'], digraph: 'SH' },
  { word: 'SHOP', emoji: '🏪', vowel: 'O', consonants: ['P'], digraph: 'SH' },
  { word: 'SHOT', emoji: '💉', vowel: 'O', consonants: ['T'], digraph: 'SH' },
  { word: 'SHED', emoji: '🛖', vowel: 'E', consonants: ['D'], digraph: 'SH' },
  { word: 'SHIN', emoji: '🦵', vowel: 'I', consonants: ['N'], digraph: 'SH' },
  { word: 'FISH', emoji: '🐟', vowel: 'I', consonants: ['F'], digraph: 'SH' },
  { word: 'DISH', emoji: '🍽️', vowel: 'I', consonants: ['D'], digraph: 'SH' },
  { word: 'WISH', emoji: '⭐', vowel: 'I', consonants: ['W'], digraph: 'SH' },
  { word: 'RUSH', emoji: '💨', vowel: 'U', consonants: ['R'], digraph: 'SH' },
  { word: 'CASH', emoji: '💰', vowel: 'A', consonants: ['C'], digraph: 'SH' },
  // CH
  { word: 'CHIP', emoji: '🍟', vowel: 'I', consonants: ['P'], digraph: 'CH' },
  { word: 'CHOP', emoji: '🪓', vowel: 'O', consonants: ['P'], digraph: 'CH' },
  { word: 'CHIN', emoji: '😊', vowel: 'I', consonants: ['N'], digraph: 'CH' },
  { word: 'CHAT', emoji: '💬', vowel: 'A', consonants: ['T'], digraph: 'CH' },
  { word: 'RICH', emoji: '💎', vowel: 'I', consonants: ['R'], digraph: 'CH' },
  { word: 'MUCH', emoji: '🌊', vowel: 'U', consonants: ['M'], digraph: 'CH' },
  // TH
  { word: 'THIS', emoji: '👆', vowel: 'I', consonants: ['S'], digraph: 'TH' },
  { word: 'THAT', emoji: '👉', vowel: 'A', consonants: ['T'], digraph: 'TH' },
  { word: 'THIN', emoji: '🥢', vowel: 'I', consonants: ['N'], digraph: 'TH' },
  { word: 'THEN', emoji: '⏭️', vowel: 'E', consonants: ['N'], digraph: 'TH' },
  { word: 'WITH', emoji: '🤝', vowel: 'I', consonants: ['W'], digraph: 'TH' },
  { word: 'BATH', emoji: '🛁', vowel: 'A', consonants: ['B'], digraph: 'TH' },
  { word: 'MATH', emoji: '➕', vowel: 'A', consonants: ['M'], digraph: 'TH' },
  // CK
  { word: 'BACK', emoji: '🔙', vowel: 'A', consonants: ['B'], digraph: 'CK' },
  { word: 'PACK', emoji: '🎒', vowel: 'A', consonants: ['P'], digraph: 'CK' },
  { word: 'KICK', emoji: '⚽', vowel: 'I', consonants: ['K'], digraph: 'CK' },
  { word: 'DUCK', emoji: '🦆', vowel: 'U', consonants: ['D'], digraph: 'CK' },
  { word: 'ROCK', emoji: '🪨', vowel: 'O', consonants: ['R'], digraph: 'CK' },
  { word: 'LOCK', emoji: '🔒', vowel: 'O', consonants: ['L'], digraph: 'CK' },
  { word: 'NECK', emoji: '🦒', vowel: 'E', consonants: ['N'], digraph: 'CK' },
  { word: 'SOCK', emoji: '🧦', vowel: 'O', consonants: ['S'], digraph: 'CK' },
];

export interface Phonicssentence {
  text: string;
  emojis: string;
  vowels: VowelSound[];
  consonants: string[];
}

// Sight words that are excluded from consonant/vowel filtering
export const SIGHT_WORDS = new Set(['THE', 'A', 'ON', 'IN', 'IS', 'HE', 'SHE', 'AND', 'WAS', 'DID', 'HAS', 'NOT', 'FAR']);

export const PHONICS_SENTENCES: Phonicssentence[] = [
  { text: 'THE CAT SAT ON THE MAT.', emojis: '🐱🟫', vowels: ['A'], consonants: ['C','T','S','M'] },
  { text: 'THE BIG PIG DID A JIG.', emojis: '🐷', vowels: ['I'], consonants: ['B','G','P','J','D'] },
  { text: 'THE DOG RAN AND HAD FUN.', emojis: '🐕', vowels: ['O','A','U'], consonants: ['D','G','R','N','H','F'] },
  { text: 'THE RED HEN HAS A PEN.', emojis: '🐔✏️', vowels: ['E'], consonants: ['R','D','H','N','P'] },
  { text: 'THE SUN IS HOT.', emojis: '☀️🔥', vowels: ['U','O'], consonants: ['S','N','H','T'] },
  { text: 'A BIG BUG SAT ON A RUG.', emojis: '🐛🟫', vowels: ['I','U','A'], consonants: ['B','G','S','T','R'] },
  { text: 'THE PIG IS NOT A BIG PIG.', emojis: '🐷', vowels: ['I','O'], consonants: ['P','G','N','T','B'] },
  { text: 'THE MAN HID IN THE DEN.', emojis: '🧑🐻', vowels: ['A','I','E'], consonants: ['M','N','H','D'] },
  { text: 'A CAP AND A MAP.', emojis: '🧢🗺️', vowels: ['A'], consonants: ['C','P','M'] },
  { text: 'THE HEN MET THE HEN IN THE NET.', emojis: '🐔🥅', vowels: ['E'], consonants: ['H','N','M','T'] },
];

export interface PhonicsStory {
  title: string;
  sentences: string[];
  requiredVowels: VowelSound[];
  requiredConsonants: string[];
}

export const PHONICS_STORIES: PhonicsStory[] = [
  {
    title: 'THE CAT AND THE RAT',
    sentences: [
      'THE BIG CAT SAT ON A MAT.',
      'THE FAT RAT RAN AND HID.',
      'THE CAT GOT MAD.',
      'THE RAT RAN FAR AND WAS SAD.',
      'THE END.',
    ],
    requiredVowels: ['A', 'E', 'I', 'O', 'U'],
    requiredConsonants: ['B','C','D','F','G','H','J','L','M','N','P','R','S','T'],
  },
  {
    title: 'TOM AND THE PUG',
    sentences: [
      'TOM HAD A BIG PUG.',
      'THE PUG DID RUN AND JOG.',
      'TOM DID SIT AND RUB THE PUG.',
      'THE PUG GOT A HUG.',
      'THE PUG WAS FUN!',
    ],
    requiredVowels: ['A', 'I', 'O', 'U'],
    requiredConsonants: ['T','M','H','D','B','G','P','R','N','J','S'],
  },
  {
    title: 'THE BIG FAT CAT',
    sentences: [
      'THE BIG FAT CAT SAT ON THE MAT.',
      'THE CAT HAD A NAP.',
      'A RAT SAT ON THE CAT!',
      'THE CAT DID NOT NAP.',
      'THE FAT CAT RAN AND RAN.',
      'THE RAT HAD FUN.',
      'THE END!',
    ],
    requiredVowels: ['A', 'E', 'I', 'O', 'U'],
    requiredConsonants: ['B','C','D','F','G','H','M','N','P','R','S','T'],
  },
  {
    title: 'THE DOG AND THE BUG',
    sentences: [
      'A DOG SAT ON A LOG.',
      'A BUG DID JOG TO THE LOG.',
      'THE DOG GOT MAD.',
      'THE BUG DID NOT STOP.',
      'THE DOG DID HOP AND HOP.',
      'THE BUG GOT ON THE DOG.',
      'THE DOG AND THE BUG HAD FUN!',
      'THE END!',
    ],
    requiredVowels: ['A', 'E', 'I', 'O', 'U'],
    requiredConsonants: ['B','D','G','H','J','L','M','N','P','R','S','T'],
  },
  {
    title: 'THE PIG AND THE PUP',
    sentences: [
      'A FAT PIG AND A PUP SAT IN THE SUN.',
      'THE PIG HAD HAM.',
      'THE PUP HAD A BUN.',
      'THE PIG DID NOT LET THE PUP GET THE HAM.',
      'THE PUP WAS SAD.',
      'THE PIG GOT BAD.',
      'THEN THE PUP GOT THE HAM AND THE BUN.',
      'THE PIG AND THE PUP GOT FUN.',
      'THE END!',
    ],
    requiredVowels: ['A', 'E', 'I', 'O', 'U'],
    requiredConsonants: ['B','D','F','G','H','L','M','N','P','R','S','T','W'],
  },
  {
    title: 'THE FISH AND THE SHIP',
    sentences: [
      'A BIG FISH SAT IN THE SEA.',
      'A SHIP DID RUSH PAST THE FISH.',
      'THE FISH GOT A WISH.',
      'THE FISH SAID: LET ME ON THE SHIP!',
      'THE SHIP DID STOP.',
      'THE FISH GOT ON.',
      'THE SHIP AND THE FISH HAD FUN.',
      'THE FISH GOT HIS WISH!',
      'THE END!',
    ],
    requiredVowels: ['A', 'E', 'I', 'O', 'U'],
    requiredConsonants: ['B','D','F','G','H','L','M','N','P','R','S','T','W'],
  },
];

export const ALL_CONSONANTS = ['B','C','D','F','G','H','J','K','L','M','N','P','R','S','T','V','W','X','Y','Z'];
export const ALL_VOWELS: VowelSound[] = ['A','E','I','O','U'];
export const ALL_DIGRAPHS = ['SH', 'CH', 'TH', 'WH', 'CK'] as const;
export type DigiraphSound = typeof ALL_DIGRAPHS[number];

export function getWordConsonants(word: string): string[] {
  return word.split('').filter(l => ALL_CONSONANTS.includes(l));
}

export function filterWords(
  selectedVowels: Set<VowelSound>,
  selectedConsonants: Set<string>,
  selectedDigraphs: string[] = []
): CVCWord[] {
  return CVC_WORDS.filter(w => {
    if (!selectedVowels.has(w.vowel)) return false;

    if (w.digraph) {
      // Digraph word: require the digraph to be selected
      if (!selectedDigraphs.includes(w.digraph)) return false;
      // Check the explicit consonants list
      const cons = w.consonants ?? [];
      return cons.every(c => selectedConsonants.has(c));
    }

    // Regular CVC word
    const consonants = getWordConsonants(w.word);
    return consonants.every(c => selectedConsonants.has(c));
  });
}

export function filterSentences(
  selectedVowels: Set<VowelSound>,
  selectedConsonants: Set<string>
): PhonicssentenceWithFilter[] {
  return PHONICS_SENTENCES.filter(s => {
    return s.vowels.every(v => selectedVowels.has(v)) &&
      s.consonants.every(c => selectedConsonants.has(c));
  });
}

// Re-export with type alias
export type PhonicssentenceWithFilter = Phonicssentence;

// ── Word Chains ──────────────────────────────────────────────────────
export interface WordChain {
  id: number;
  chain: string[];   // sequence of words where each differs by one letter
  emojis: string[];  // one emoji per word in the chain
  description: string;
}

export const WORD_CHAINS: WordChain[] = [
  { id: 1, chain: ['CAT','BAT','BAD','BED'], emojis: ['🐱','🦇','👎','🛏️'], description: 'ONE LETTER CHANGES!' },
  { id: 2, chain: ['HOP','MOP','MAP','NAP'], emojis: ['🐰','🧹','🗺️','😴'], description: 'ONE LETTER CHANGES!' },
  { id: 3, chain: ['PIG','BIG','BIT','SIT'], emojis: ['🐷','🔭','🔪','🪑'], description: 'ONE LETTER CHANGES!' },
  { id: 4, chain: ['SUN','RUN','BUN','BUS'], emojis: ['☀️','🏃','🍞','🚌'], description: 'ONE LETTER CHANGES!' },
  { id: 5, chain: ['DOG','LOG','LEG','BEG'], emojis: ['🐕','🪵','🦵','🙏'], description: 'ONE LETTER CHANGES!' },
  { id: 6, chain: ['FAN','FIN','PIN','PAN'], emojis: ['💨','🦈','📌','🍳'], description: 'ONE LETTER CHANGES!' },
  { id: 7, chain: ['WET','NET','NOT','NUT'], emojis: ['💧','🥅','❌','🥜'], description: 'ONE LETTER CHANGES!' },
  { id: 8, chain: ['HIT','HAT','RAT','RAG'], emojis: ['🥊','🎩','🐀','🧹'], description: 'ONE LETTER CHANGES!' },
  { id: 9, chain: ['MUG','BUG','BUD','BAD'], emojis: ['☕','🐛','🌱','👎'], description: 'ONE LETTER CHANGES!' },
  { id: 10, chain: ['POT','PET','PEG','BEG'], emojis: ['🪴','🐾','📌','🙏'], description: 'ONE LETTER CHANGES!' },
];
