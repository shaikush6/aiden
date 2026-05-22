// Phonetic representations for letter sounds
const LETTER_SOUNDS: Record<string, string> = {
  A: 'aah',
  B: 'buh',
  C: 'cuh',
  D: 'duh',
  E: 'eh',
  F: 'fuh',
  G: 'guh',
  H: 'huh',
  I: 'ih',
  J: 'juh',
  K: 'kuh',
  L: 'luh',
  M: 'muh',
  N: 'nuh',
  O: 'oh',
  P: 'puh',
  Q: 'kwuh',
  R: 'ruh',
  S: 'sss',
  T: 'tuh',
  U: 'uh',
  V: 'vuh',
  W: 'wuh',
  X: 'ks',
  Y: 'yuh',
  Z: 'zzz',
};

function getVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices();
  // Prefer a female or child-friendly English voice
  const preferred = voices.find(
    v => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira') || v.name.includes('Veena'))
  );
  const english = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'));
  return preferred || english || voices[0] || null;
}

export function speakWord(word: string): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
  utterance.rate = 0.7;
  utterance.pitch = 1.2;
  utterance.volume = 1;
  const voice = getVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function speakLetterSound(letter: string): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const sound = LETTER_SOUNDS[letter.toUpperCase()] || letter.toLowerCase();
  const utterance = new SpeechSynthesisUtterance(sound);
  utterance.rate = 0.8;
  utterance.pitch = 1.3;
  utterance.volume = 1;
  const voice = getVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function speakText(text: string, rate = 0.8, pitch = 1.1): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;
  const voice = getVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

export function speakNumber(n: number): void {
  speakText(String(n), 0.9, 1.2);
}

export function speakEncouragement(correct: boolean): void {
  const correctPhrases = [
    'Amazing! Well done!',
    'Super! You got it!',
    'Fantastic! Great job!',
    'Wonderful! You are so smart!',
    'Yes! That is right!',
  ];
  const wrongPhrases = [
    'Try again! You can do it!',
    'Almost! Try one more time!',
    'Good try! Try again!',
  ];
  const phrases = correct ? correctPhrases : wrongPhrases;
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  speakText(phrase, 0.85, 1.2);
}
