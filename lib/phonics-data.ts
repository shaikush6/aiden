export type VowelSound = 'A' | 'E' | 'I' | 'O' | 'U';

export interface CVCWord {
  word: string;
  emoji: string;
  vowel: VowelSound;
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
];

export const ALL_CONSONANTS = ['B','C','D','F','G','H','J','K','L','M','N','P','R','S','T','V','W','X','Y','Z'];
export const ALL_VOWELS: VowelSound[] = ['A','E','I','O','U'];

export function getWordConsonants(word: string): string[] {
  return word.split('').filter(l => ALL_CONSONANTS.includes(l));
}

export function filterWords(
  selectedVowels: Set<VowelSound>,
  selectedConsonants: Set<string>
): CVCWord[] {
  return CVC_WORDS.filter(w => {
    if (!selectedVowels.has(w.vowel)) return false;
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
