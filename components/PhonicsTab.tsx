'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  ALL_CONSONANTS,
  ALL_VOWELS,
  type VowelSound,
  filterWords,
  filterSentences,
  PHONICS_STORIES,
  type CVCWord,
  type Phonicssentence,
} from '@/lib/phonics-data';
import { speakWord, speakLetterSound, speakText } from '@/lib/speech';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type Mode = 'WORDS' | 'SENTENCES' | 'STORY';

const VOWEL_COLORS: Record<VowelSound, string> = {
  A: 'bg-red-400 text-white',
  E: 'bg-green-400 text-white',
  I: 'bg-blue-400 text-white',
  O: 'bg-orange-400 text-white',
  U: 'bg-purple-400 text-white',
};

const VOWEL_SELECTED: Record<VowelSound, string> = {
  A: 'ring-4 ring-red-600 scale-110',
  E: 'ring-4 ring-green-600 scale-110',
  I: 'ring-4 ring-blue-600 scale-110',
  O: 'ring-4 ring-orange-600 scale-110',
  U: 'ring-4 ring-purple-600 scale-110',
};

function WordCard({ word, onConfetti }: { word: CVCWord; onConfetti: () => void }) {
  const [letterPop, setLetterPop] = useState<number | null>(null);

  const handleWordClick = useCallback(() => {
    speakWord(word.word);
    onConfetti();
  }, [word.word, onConfetti]);

  const handleLetterClick = useCallback((letter: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    speakLetterSound(letter);
    setLetterPop(idx);
    setTimeout(() => setLetterPop(null), 400);
  }, []);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center gap-2 cursor-pointer select-none border-4 border-sky-200 hover:border-sky-400 transition-colors"
      onClick={handleWordClick}
    >
      <span className="text-4xl">{word.emoji}</span>
      <div className="flex gap-1">
        {word.word.split('').map((letter, idx) => (
          <motion.span
            key={idx}
            animate={letterPop === idx ? { scale: [1, 1.5, 1], color: ['#0ea5e9', '#7c3aed', '#0ea5e9'] } : {}}
            className="text-3xl font-black text-sky-700 cursor-pointer hover:text-purple-600 transition-colors px-1 rounded"
            onClick={(e) => handleLetterClick(letter, idx, e)}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

function SentenceView({ sentence }: { sentence: Phonicssentence }) {
  const handleClick = () => speakText(sentence.text.toLowerCase(), 0.65, 1.1);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-lg p-5 cursor-pointer border-4 border-sky-200 hover:border-sky-400 transition-colors"
    >
      <p className="text-2xl font-black text-sky-800 leading-relaxed text-center">{sentence.text}</p>
      <p className="text-3xl text-center mt-2">{sentence.emojis}</p>
    </motion.div>
  );
}

function StoryView({ story }: { story: (typeof PHONICS_STORIES)[0] }) {
  const handleSentenceClick = (sentence: string) => {
    speakText(sentence.toLowerCase(), 0.65, 1.1);
  };

  const handleFullStory = () => {
    const fullText = story.sentences.join(' ');
    speakText(fullText.toLowerCase(), 0.65, 1.1);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-2xl font-black text-sky-800 text-center">{story.title}</h3>
      {story.sentences.map((s, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSentenceClick(s)}
          className="bg-white rounded-2xl shadow p-4 cursor-pointer border-4 border-sky-200 hover:border-sky-400 transition-colors"
        >
          <p className="text-2xl font-black text-sky-800 text-center">{s}</p>
        </motion.div>
      ))}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleFullStory}
        className="mt-2 bg-sky-500 hover:bg-sky-600 text-white font-black text-xl py-4 px-8 rounded-2xl shadow-lg transition-colors"
      >
        READ THE WHOLE STORY 📖
      </motion.button>
    </div>
  );
}

export default function PhonicsTab() {
  const [selectedVowels, setSelectedVowels] = useState<Set<VowelSound>>(new Set(ALL_VOWELS));
  const [selectedConsonants, setSelectedConsonants] = useState<Set<string>>(new Set(ALL_CONSONANTS));
  const [mode, setMode] = useState<Mode>('WORDS');
  const [showConfetti, setShowConfetti] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  }, []);

  const toggleVowel = (v: VowelSound) => {
    setSelectedVowels(prev => {
      const next = new Set(prev);
      if (next.has(v) && next.size > 1) next.delete(v);
      else next.add(v);
      return next;
    });
  };

  const toggleConsonant = (c: string) => {
    setSelectedConsonants(prev => {
      const next = new Set(prev);
      if (next.has(c) && next.size > 1) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const filteredWords = filterWords(selectedVowels, selectedConsonants);
  const filteredSentences = filterSentences(selectedVowels, selectedConsonants);

  const currentStory = PHONICS_STORIES[storyIndex];
  const storyAvailable =
    currentStory.requiredVowels.every(v => selectedVowels.has(v)) &&
    currentStory.requiredConsonants.every(c => selectedConsonants.has(c));

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      {showConfetti && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={200}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
        />
      )}

      {/* Mode selector */}
      <div className="flex gap-2 justify-center">
        {(['WORDS', 'SENTENCES', 'STORY'] as Mode[]).map(m => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => setMode(m)}
            className={`py-2 px-4 rounded-xl font-black text-base transition-all shadow ${
              mode === m ? 'bg-sky-500 text-white scale-105 shadow-md' : 'bg-white text-sky-600'
            }`}
          >
            {m}
          </motion.button>
        ))}
      </div>

      {/* Vowel selector */}
      <div className="bg-white/70 rounded-2xl p-3 shadow">
        <p className="text-xs font-black text-sky-700 mb-2 text-center uppercase tracking-widest">Vowels</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {ALL_VOWELS.map(v => (
            <motion.button
              key={v}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleVowel(v)}
              className={`w-12 h-12 rounded-xl font-black text-xl transition-all shadow ${VOWEL_COLORS[v]} ${
                selectedVowels.has(v) ? VOWEL_SELECTED[v] : 'opacity-40'
              }`}
            >
              {v}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Consonant selector */}
      <div className="bg-white/70 rounded-2xl p-3 shadow">
        <p className="text-xs font-black text-sky-700 mb-2 text-center uppercase tracking-widest">Consonants</p>
        <div className="flex gap-1 justify-center flex-wrap">
          {ALL_CONSONANTS.map(c => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleConsonant(c)}
              className={`w-9 h-9 rounded-lg font-black text-sm transition-all shadow ${
                selectedConsonants.has(c)
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-sky-400 opacity-50'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        {mode === 'WORDS' && (
          <motion.div
            key="words"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {filteredWords.length === 0 ? (
              <div className="text-center text-sky-600 font-black text-xl py-8">
                NO WORDS MATCH! TRY SELECTING MORE LETTERS. 🤔
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredWords.map(w => (
                  <WordCard key={w.word} word={w} onConfetti={triggerConfetti} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {mode === 'SENTENCES' && (
          <motion.div
            key="sentences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-3"
          >
            {filteredSentences.length === 0 ? (
              <div className="text-center text-sky-600 font-black text-xl py-8">
                NO SENTENCES MATCH! TRY SELECTING MORE LETTERS. 🤔
              </div>
            ) : (
              filteredSentences.map((s, i) => <SentenceView key={i} sentence={s} />)
            )}
          </motion.div>
        )}

        {mode === 'STORY' && (
          <motion.div
            key="story"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-4"
          >
            {/* Story switcher */}
            <div className="flex gap-2 justify-center">
              {PHONICS_STORIES.map((s, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setStoryIndex(i)}
                  className={`py-2 px-4 rounded-xl font-black text-sm transition-all ${
                    storyIndex === i ? 'bg-sky-500 text-white' : 'bg-white text-sky-600'
                  }`}
                >
                  STORY {i + 1}
                </motion.button>
              ))}
            </div>

            {storyAvailable ? (
              <StoryView story={currentStory} />
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center shadow">
                <p className="text-2xl font-black text-sky-700">
                  TURN ON MORE LETTERS TO READ THIS STORY! 📚
                </p>
                <p className="text-sm text-sky-500 mt-2">
                  Needs vowels: {currentStory.requiredVowels.join(', ')}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
