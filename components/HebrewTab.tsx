'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HEBREW_LETTERS, HEBREW_WORDS, COMPARE_FACTS, CATEGORY_LABELS,
  type HebrewLetter, type HebrewWord,
} from '@/lib/hebrew-data';
import { speakText } from '@/lib/speech';

type SubMode = 'LETTERS' | 'WORDS' | 'COMPARE';

// Map each light card colour to a muted dark-mode equivalent.
const DARK_CARD_BG: Record<string, string> = {
  'bg-red-100': 'dark:bg-red-900/20',
  'bg-orange-100': 'dark:bg-orange-900/20',
  'bg-amber-100': 'dark:bg-amber-900/20',
  'bg-yellow-100': 'dark:bg-yellow-900/20',
  'bg-lime-100': 'dark:bg-lime-900/20',
  'bg-green-100': 'dark:bg-green-900/20',
  'bg-teal-100': 'dark:bg-teal-900/20',
  'bg-cyan-100': 'dark:bg-cyan-900/20',
  'bg-sky-100': 'dark:bg-sky-900/20',
  'bg-blue-100': 'dark:bg-blue-900/20',
  'bg-indigo-100': 'dark:bg-indigo-900/20',
  'bg-violet-100': 'dark:bg-violet-900/20',
  'bg-purple-100': 'dark:bg-purple-900/20',
  'bg-fuchsia-100': 'dark:bg-fuchsia-900/20',
  'bg-pink-100': 'dark:bg-pink-900/20',
  'bg-rose-100': 'dark:bg-rose-900/20',
};

// ── Letter Card ────────────────────────────────────────────────────
function LetterCard({ letter, onClick }: { letter: HebrewLetter; onClick: () => void }) {
  const [flipped, setFlipped] = useState(false);

  const handleTap = () => {
    setFlipped(f => !f);
    onClick();
  };

  return (
    <motion.div
      whileTap={{ scale: 0.93 }}
      onClick={handleTap}
      className={`${letter.color} ${DARK_CARD_BG[letter.color] ?? 'dark:bg-slate-800'} rounded-2xl p-3 shadow-md cursor-pointer select-none flex flex-col items-center gap-1 border border-white dark:border-slate-600`}
    >
      <span dir="rtl" lang="he" className="text-5xl font-black text-blue-900 dark:text-blue-200 leading-none">{letter.letter}</span>
      <span dir="ltr" className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-wider">{letter.name}</span>
      <span dir="ltr" className="text-xs text-blue-500 dark:text-blue-400 font-bold text-center leading-tight">{letter.phonetic === '—' ? 'silent' : `/${letter.phonetic}/`}</span>
      <AnimatePresence mode="wait">
        {flipped ? (
          <motion.div key="word" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-0.5 mt-1">
            <span className="text-xl">{letter.emoji}</span>
            <span dir="rtl" lang="he" className="text-sm font-black text-blue-800 dark:text-blue-300">{letter.word}</span>
            <span dir="ltr" className="text-xs text-blue-500 dark:text-blue-400 font-bold">{letter.wordTranslit}</span>
            <span dir="ltr" className="text-xs text-gray-500 dark:text-slate-400 font-bold">{letter.wordEnglish}</span>
          </motion.div>
        ) : (
          <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mt-1 text-base">{letter.emoji}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Letters Mode ───────────────────────────────────────────────────
function LettersMode() {
  const speakLetter = (l: HebrewLetter) => {
    speakText(`${l.name}. It makes the ${l.sound}. Example: ${l.wordEnglish} — ${l.wordTranslit}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white/70 dark:bg-slate-800/80 rounded-2xl p-3 shadow text-center">
        <p className="text-sm font-black text-blue-700 dark:text-blue-300">TAP A LETTER TO FLIP IT AND HEAR IT! 🔊</p>
        <p className="text-xs text-blue-400 dark:text-blue-500 font-bold mt-0.5">Hebrew has 22 letters — all read right to left →</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {HEBREW_LETTERS.map(l => (
          <LetterCard key={l.letter} letter={l} onClick={() => speakLetter(l)} />
        ))}
      </div>
    </div>
  );
}

// ── Words Mode ─────────────────────────────────────────────────────
type WordCategory = HebrewWord['category'] | 'ALL';

function WordsMode() {
  const [category, setCategory] = useState<WordCategory>('ALL');
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const categories: WordCategory[] = ['ALL', 'greetings', 'family', 'animals', 'nature', 'everyday'];

  const filtered = useMemo(
    () => category === 'ALL' ? HEBREW_WORDS : HEBREW_WORDS.filter(w => w.category === category),
    [category]
  );

  const handleWordTap = (w: HebrewWord) => {
    setFlippedId(prev => prev === w.word ? null : w.word);
    speakText(w.word);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <motion.button key={cat} whileTap={{ scale: 0.92 }}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-black text-xs shadow transition-all
              ${category === cat ? 'bg-blue-600 text-white' : 'bg-white/80 dark:bg-slate-700 text-blue-600 dark:text-blue-400'}`}>
            {cat === 'ALL' ? '✨ ALL' : CATEGORY_LABELS[cat as HebrewWord['category']]}
          </motion.button>
        ))}
      </div>

      {/* Word grid */}
      <div className="grid grid-cols-3 gap-3">
        {filtered.map(w => (
          <motion.div
            key={w.word}
            whileTap={{ scale: 0.93 }}
            onClick={() => handleWordTap(w)}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-3 cursor-pointer flex flex-col items-center gap-1 border border-blue-100 dark:border-slate-600"
          >
            <span className="text-3xl">{w.emoji}</span>
            <span dir="rtl" lang="he" className="text-xl font-black text-blue-900 dark:text-blue-200 leading-none">{w.word}</span>
            <AnimatePresence mode="wait">
              {flippedId === w.word ? (
                <motion.div key="detail" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-0.5 w-full">
                  <span dir="ltr" className="text-xs font-black text-blue-500 dark:text-blue-400">{w.translit}</span>
                  <span dir="ltr" className="text-xs font-bold text-gray-500 dark:text-slate-400 text-center leading-tight">{w.english}</span>
                </motion.div>
              ) : (
                <motion.span key="tap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-blue-300 dark:text-blue-600 font-bold">tap!</motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Compare Mode ───────────────────────────────────────────────────
function CompareMode() {
  const [activeIdx, setActiveIdx] = useState(0);
  const fact = COMPARE_FACTS[activeIdx];

  return (
    <div dir="ltr" className="flex flex-col gap-4">
      <div className="bg-white/70 dark:bg-slate-800/80 rounded-2xl p-3 shadow text-center">
        <p className="text-sm font-black text-blue-700 dark:text-blue-300">HEBREW vs ENGLISH — THE DIFFERENCES! 🤔</p>
      </div>

      {/* Fact navigation */}
      <div className="flex gap-2 justify-center">
        {COMPARE_FACTS.map((f, i) => (
          <motion.button key={i} whileTap={{ scale: 0.9 }}
            onClick={() => setActiveIdx(i)}
            className={`w-10 h-10 rounded-xl font-black text-lg shadow transition-all
              ${activeIdx === i ? 'bg-blue-600 text-white scale-110' : 'bg-white dark:bg-slate-700 text-blue-400 dark:text-blue-400'}`}>
            {f.icon}
          </motion.button>
        ))}
      </div>

      {/* Fact card */}
      <AnimatePresence mode="wait">
        <motion.div key={activeIdx}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">

          <div className="bg-blue-600 p-4 text-center">
            <span className="text-4xl">{fact.icon}</span>
            <h3 className="text-xl font-black text-white mt-2">{fact.title}</h3>
          </div>

          <div className="p-4 flex flex-col gap-3">
            {/* English side */}
            <div className="bg-sky-50 dark:bg-slate-800 rounded-2xl p-3 border-2 border-sky-200 dark:border-sky-800">
              <p className="text-xs font-black text-sky-600 mb-1">🇬🇧 ENGLISH</p>
              <p className="text-sm font-bold text-sky-800 dark:text-sky-300">{fact.english}</p>
              <div className="mt-2 bg-white dark:bg-slate-700 rounded-xl p-2 text-center">
                <span className="text-lg font-black text-sky-700 dark:text-sky-300 tracking-widest">{fact.demo.english}</span>
                {activeIdx === 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-xs font-black text-sky-500 dark:text-sky-400">READ THIS WAY</span>
                    <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 1, repeat: Infinity }}
                      className="text-lg">→</motion.span>
                  </div>
                )}
              </div>
            </div>

            {/* Hebrew side */}
            <div className="bg-blue-50 dark:bg-slate-800 rounded-2xl p-3 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-xs font-black text-blue-600 dark:text-blue-400 mb-1">🇮🇱 HEBREW</p>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-300">{fact.hebrew}</p>
              <div className="mt-2 bg-white dark:bg-slate-700 rounded-xl p-2 text-center">
                {activeIdx === 0 ? (
                  <>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <motion.span animate={{ x: [0, -6, 0] }} transition={{ duration: 1, repeat: Infinity }}
                        className="text-lg">←</motion.span>
                      <span className="text-xs font-black text-blue-500 dark:text-blue-400">READ THIS WAY</span>
                    </div>
                    <span dir="rtl" lang="he" className="text-lg font-black text-blue-700 dark:text-blue-300 tracking-widest block">{fact.demo.hebrew}</span>
                  </>
                ) : (
                  <span dir="rtl" lang="he" className="text-lg font-black text-blue-700 dark:text-blue-300 tracking-widest">{fact.demo.hebrew}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <div className="flex gap-3 justify-center">
        <motion.button whileTap={{ scale: 0.92 }}
          onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
          disabled={activeIdx === 0}
          className="px-5 py-2 rounded-xl font-black text-sm bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow disabled:opacity-30">
          ← PREV
        </motion.button>
        <span className="flex items-center text-blue-400 dark:text-blue-500 font-black text-sm">
          {activeIdx + 1} / {COMPARE_FACTS.length}
        </span>
        <motion.button whileTap={{ scale: 0.92 }}
          onClick={() => setActiveIdx(i => Math.min(COMPARE_FACTS.length - 1, i + 1))}
          disabled={activeIdx === COMPARE_FACTS.length - 1}
          className="px-5 py-2 rounded-xl font-black text-sm bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow disabled:opacity-30">
          NEXT →
        </motion.button>
      </div>

      {/* Alphabet direction demo */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 text-center">
        <p className="text-xs font-black text-gray-500 dark:text-slate-400 mb-2">THE HEBREW ALPHABET IN ORDER (read right to left!)</p>
        <div dir="rtl" lang="he" className="flex flex-wrap justify-center gap-2">
          {HEBREW_LETTERS.map((l, i) => (
            <motion.span key={l.letter}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="text-xl font-black text-blue-800 dark:text-blue-300">
              {l.letter}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────
const SUB_MODES: { id: SubMode; label: string; emoji: string }[] = [
  { id: 'LETTERS', label: 'LETTERS', emoji: 'א' },
  { id: 'WORDS',   label: 'WORDS',   emoji: '💬' },
  { id: 'COMPARE', label: 'HEB vs ENG', emoji: '↔️' },
];

export default function HebrewTab() {
  const [subMode, setSubMode] = useState<SubMode>('LETTERS');

  return (
    <div dir="rtl" lang="he" className="flex flex-col gap-4 p-4 pb-8">

      {/* Sub-mode selector */}
      <div dir="ltr" className="flex gap-2">
        {SUB_MODES.map(m => (
          <motion.button key={m.id} whileTap={{ scale: 0.92 }}
            onClick={() => {
              setSubMode(m.id);
              speakText(m.id === 'LETTERS' ? 'Hebrew letters!' : m.id === 'WORDS' ? 'Hebrew words!' : 'Compare Hebrew and English!');
            }}
            className={`flex-1 py-3 rounded-xl font-black text-xs shadow flex flex-col items-center gap-1 transition-all
              ${subMode === m.id ? 'bg-blue-600 text-white scale-105 shadow-md' : 'bg-white/80 dark:bg-slate-700 text-blue-700 dark:text-blue-400'}`}>
            <span className="text-xl leading-none">{m.emoji}</span>
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={subMode}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}>
          {subMode === 'LETTERS' && <LettersMode />}
          {subMode === 'WORDS'   && <WordsMode />}
          {subMode === 'COMPARE' && <CompareMode />}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
