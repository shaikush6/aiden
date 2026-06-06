export interface HebrewLetter {
  letter: string;
  name: string;        // English transliteration of letter name
  sound: string;       // plain-English sound description
  phonetic: string;    // phonetic symbol / shorthand
  word: string;        // Hebrew example word
  wordTranslit: string;
  wordEnglish: string;
  emoji: string;
  color: string;       // Tailwind bg class for card accent
}

export interface HebrewWord {
  word: string;
  translit: string;
  english: string;
  emoji: string;
  category: 'family' | 'animals' | 'nature' | 'everyday' | 'greetings';
}

export const HEBREW_LETTERS: HebrewLetter[] = [
  { letter: 'א', name: 'Alef',   sound: 'silent — the vowel carries the sound', phonetic: '—',  word: 'אריה',  wordTranslit: 'Arye',    wordEnglish: 'lion',    emoji: '🦁', color: 'bg-red-100' },
  { letter: 'ב', name: 'Bet',    sound: 'like the B in ball',                    phonetic: 'b',  word: 'בית',   wordTranslit: 'Bayit',   wordEnglish: 'house',   emoji: '🏠', color: 'bg-orange-100' },
  { letter: 'ג', name: 'Gimel',  sound: 'like the G in go',                      phonetic: 'g',  word: 'גמל',   wordTranslit: 'Gamal',   wordEnglish: 'camel',   emoji: '🐪', color: 'bg-amber-100' },
  { letter: 'ד', name: 'Dalet',  sound: 'like the D in dog',                     phonetic: 'd',  word: 'דג',    wordTranslit: 'Dag',     wordEnglish: 'fish',    emoji: '🐟', color: 'bg-yellow-100' },
  { letter: 'ה', name: 'Hey',    sound: 'like the H in hello',                   phonetic: 'h',  word: 'הר',    wordTranslit: 'Har',     wordEnglish: 'mountain',emoji: '⛰️', color: 'bg-lime-100' },
  { letter: 'ו', name: 'Vav',    sound: 'like the V in vine',                    phonetic: 'v',  word: 'ורד',   wordTranslit: 'Vered',   wordEnglish: 'rose',    emoji: '🌹', color: 'bg-green-100' },
  { letter: 'ז', name: 'Zayin',  sound: 'like the Z in zoo',                     phonetic: 'z',  word: 'זאב',   wordTranslit: "Ze'ev",   wordEnglish: 'wolf',    emoji: '🐺', color: 'bg-teal-100' },
  { letter: 'ח', name: 'Chet',   sound: 'a deep throat sound — like clearing your throat gently', phonetic: 'ch', word: 'חתול', wordTranslit: 'Chatul', wordEnglish: 'cat', emoji: '🐱', color: 'bg-cyan-100' },
  { letter: 'ט', name: 'Tet',    sound: 'like the T in top',                     phonetic: 't',  word: 'טוס',   wordTranslit: 'Tus',     wordEnglish: 'fly / plane', emoji: '✈️', color: 'bg-sky-100' },
  { letter: 'י', name: 'Yod',    sound: 'like the Y in yes',                     phonetic: 'y',  word: 'ים',    wordTranslit: 'Yam',     wordEnglish: 'sea',     emoji: '🌊', color: 'bg-blue-100' },
  { letter: 'כ', name: 'Kaf',    sound: 'like the K in kite',                    phonetic: 'k',  word: 'כלב',   wordTranslit: 'Kelev',   wordEnglish: 'dog',     emoji: '🐶', color: 'bg-indigo-100' },
  { letter: 'ל', name: 'Lamed',  sound: 'like the L in lion',                    phonetic: 'l',  word: 'לב',    wordTranslit: 'Lev',     wordEnglish: 'heart',   emoji: '❤️', color: 'bg-violet-100' },
  { letter: 'מ', name: 'Mem',    sound: 'like the M in moon',                    phonetic: 'm',  word: 'מים',   wordTranslit: 'Mayim',   wordEnglish: 'water',   emoji: '💧', color: 'bg-purple-100' },
  { letter: 'נ', name: 'Nun',    sound: 'like the N in night',                   phonetic: 'n',  word: 'נחש',   wordTranslit: 'Nachash', wordEnglish: 'snake',   emoji: '🐍', color: 'bg-fuchsia-100' },
  { letter: 'ס', name: 'Samech', sound: 'like the S in sun',                     phonetic: 's',  word: 'סוס',   wordTranslit: 'Sus',     wordEnglish: 'horse',   emoji: '🐴', color: 'bg-pink-100' },
  { letter: 'ע', name: 'Ayin',   sound: 'silent — like Alef, the vowel carries the sound', phonetic: '—', word: 'עוגה', wordTranslit: 'Uga', wordEnglish: 'cake', emoji: '🎂', color: 'bg-rose-100' },
  { letter: 'פ', name: 'Pe',     sound: 'like the P in park',                    phonetic: 'p',  word: 'פרח',   wordTranslit: 'Perach',  wordEnglish: 'flower',  emoji: '🌸', color: 'bg-red-100' },
  { letter: 'צ', name: 'Tsadi',  sound: 'TS — like the end of "cats"',           phonetic: 'ts', word: 'צב',    wordTranslit: 'Tsav',    wordEnglish: 'turtle',  emoji: '🐢', color: 'bg-orange-100' },
  { letter: 'ק', name: 'Kuf',    sound: 'like the K in king',                    phonetic: 'k',  word: 'קוף',   wordTranslit: 'Kof',     wordEnglish: 'monkey',  emoji: '🐒', color: 'bg-amber-100' },
  { letter: 'ר', name: 'Resh',   sound: 'like the R in run (rolled a little)',   phonetic: 'r',  word: 'רגל',   wordTranslit: 'Regel',   wordEnglish: 'leg / foot', emoji: '🦵', color: 'bg-yellow-100' },
  { letter: 'ש', name: 'Shin',   sound: 'like SH in ship',                       phonetic: 'sh', word: 'שמש',   wordTranslit: 'Shemesh', wordEnglish: 'sun',     emoji: '☀️', color: 'bg-lime-100' },
  { letter: 'ת', name: 'Tav',    sound: 'like the T in tree',                    phonetic: 't',  word: 'תפוח',  wordTranslit: 'Tapuach', wordEnglish: 'apple',   emoji: '🍎', color: 'bg-green-100' },
];

export const HEBREW_WORDS: HebrewWord[] = [
  // Greetings
  { word: 'שלום',  translit: 'Shalom',  english: 'hello / goodbye / peace', emoji: '👋',  category: 'greetings' },
  { word: 'תודה',  translit: 'Toda',    english: 'thank you',               emoji: '🙏',  category: 'greetings' },
  { word: 'כן',    translit: 'Ken',     english: 'yes',                     emoji: '✅',  category: 'greetings' },
  { word: 'לא',    translit: 'Lo',      english: 'no',                      emoji: '❌',  category: 'greetings' },
  { word: 'בבקשה', translit: 'Bevakasha', english: 'please / you\'re welcome', emoji: '🤲', category: 'greetings' },
  // Family
  { word: 'אבא',   translit: 'Abba',    english: 'dad',                     emoji: '👨',  category: 'family' },
  { word: 'אמא',   translit: 'Ima',     english: 'mom',                     emoji: '👩',  category: 'family' },
  { word: 'אח',    translit: 'Ach',     english: 'brother',                 emoji: '👦',  category: 'family' },
  { word: 'אחות',  translit: 'Achot',   english: 'sister',                  emoji: '👧',  category: 'family' },
  // Animals
  { word: 'כלב',   translit: 'Kelev',   english: 'dog',                     emoji: '🐶',  category: 'animals' },
  { word: 'חתול',  translit: 'Chatul',  english: 'cat',                     emoji: '🐱',  category: 'animals' },
  { word: 'דג',    translit: 'Dag',     english: 'fish',                    emoji: '🐟',  category: 'animals' },
  { word: 'ציפור', translit: 'Tsipor',  english: 'bird',                    emoji: '🐦',  category: 'animals' },
  // Nature
  { word: 'שמש',   translit: 'Shemesh', english: 'sun',                     emoji: '☀️',  category: 'nature' },
  { word: 'ירח',   translit: 'Yareach', english: 'moon',                    emoji: '🌙',  category: 'nature' },
  { word: 'כוכב',  translit: 'Kochav',  english: 'star',                    emoji: '⭐',  category: 'nature' },
  { word: 'ים',    translit: 'Yam',     english: 'sea',                     emoji: '🌊',  category: 'nature' },
  { word: 'מים',   translit: 'Mayim',   english: 'water',                   emoji: '💧',  category: 'nature' },
  // Everyday
  { word: 'בית',   translit: 'Bayit',   english: 'house / home',            emoji: '🏠',  category: 'everyday' },
  { word: 'ספר',   translit: 'Sefer',   english: 'book',                    emoji: '📚',  category: 'everyday' },
  { word: 'תפוח',  translit: 'Tapuach', english: 'apple',                   emoji: '🍎',  category: 'everyday' },
  { word: 'לחם',   translit: 'Lechem',  english: 'bread',                   emoji: '🍞',  category: 'everyday' },
  { word: 'אוכל',  translit: 'Ochel',   english: 'food',                    emoji: '🍽️',  category: 'everyday' },
];

export const CATEGORY_LABELS: Record<HebrewWord['category'], string> = {
  greetings: '👋 Greetings',
  family:    '👨‍👩‍👦 Family',
  animals:   '🐾 Animals',
  nature:    '🌿 Nature',
  everyday:  '🏠 Everyday',
};

export const COMPARE_FACTS = [
  {
    icon: '↔️',
    title: 'Different Directions!',
    english: 'English goes LEFT → RIGHT',
    hebrew:  'Hebrew goes RIGHT ← LEFT',
    demo: { english: 'A B C D E...', hebrew: '...ד ג ב א' },
  },
  {
    icon: '🔤',
    title: 'Different Letters!',
    english: 'English has 26 letters',
    hebrew:  'Hebrew has 22 letters',
    demo: { english: 'A B C D E F...', hebrew: 'א ב ג ד ה ו...' },
  },
  {
    icon: '🔇',
    title: 'Hidden Vowels!',
    english: 'English always writes vowels: C-A-T',
    hebrew:  'Hebrew usually hides the vowels!',
    demo: { english: 'cat', hebrew: 'חתול → ח-ת-ל (the A and U are hidden!)' },
  },
  {
    icon: '🅰️',
    title: 'No Capital Letters!',
    english: 'English: cat → Cat → CAT',
    hebrew:  'Hebrew has NO capitals — every letter looks the same!',
    demo: { english: 'a  →  A', hebrew: 'א  →  א (always the same!)' },
  },
];
