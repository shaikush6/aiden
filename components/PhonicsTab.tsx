'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  ALL_CONSONANTS,
  ALL_VOWELS,
  ALL_DIGRAPHS,
  type VowelSound,
  filterWords,
  filterSentences,
  PHONICS_STORIES,
  WORD_CHAINS,
  type CVCWord,
  type Phonicssentence,
} from '@/lib/phonics-data';
import { speakWord, speakLetterSound, speakText } from '@/lib/speech';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type Mode = 'WORDS' | 'SENTENCES' | 'STORY' | 'CHAIN' | 'AI';

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

type CardState = 'hidden' | 'speaking' | 'revealed';

function SoundWave() {
  return (
    <div className="flex items-center gap-1 justify-center">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 rounded-full bg-sky-400"
          animate={{ height: ['8px', '24px', '8px'] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function WordCard({ word, onConfetti }: { word: CVCWord; onConfetti: () => void }) {
  const [cardState, setCardState] = useState<CardState>('hidden');
  const [letterPop, setLetterPop] = useState<number | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWordClick = useCallback(async () => {
    if (cardState === 'speaking') return;

    // Reset any existing timer
    if (resetTimer.current) clearTimeout(resetTimer.current);

    // Start fresh: hide emoji, show speaking animation
    setCardState('speaking');

    await speakWord(word.word);

    // Reveal emoji with flip
    setCardState('revealed');
    onConfetti();

    // Reset after 3 seconds
    resetTimer.current = setTimeout(() => {
      setCardState('hidden');
    }, 3000);
  }, [cardState, word.word, onConfetti]);

  const handleLetterClick = useCallback((letter: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    speakLetterSound(letter);
    setLetterPop(idx);
    setTimeout(() => setLetterPop(null), 400);
  }, []);

  const handleRespeakClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(word.word);
  }, [word.word]);

  return (
    <motion.div
      whileHover={{ scale: cardState === 'speaking' ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 flex flex-col items-center gap-2 cursor-pointer select-none border-4 border-sky-200 hover:border-sky-400 transition-colors relative"
      onClick={handleWordClick}
      style={{ minHeight: '140px' }}
    >
      {/* Re-speak button — only when revealed */}
      {cardState === 'revealed' && (
        <button
          onClick={handleRespeakClick}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-sky-100 dark:bg-slate-700 hover:bg-sky-200 dark:hover:bg-slate-700 transition-colors text-sm"
          aria-label="Hear word again"
        >
          🔊
        </button>
      )}

      {/* Emoji area */}
      <div className="w-12 h-12 flex items-center justify-center">
        {cardState === 'hidden' && (
          <motion.div
            animate={{ borderColor: ['#7dd3fc', '#0ea5e9', '#7dd3fc'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-12 h-12 rounded-xl border-4 border-dashed border-sky-300 flex items-center justify-center text-sky-400 font-black text-2xl bg-sky-50 dark:bg-slate-800"
          >
            ?
          </motion.div>
        )}

        {cardState === 'speaking' && <SoundWave />}

        {cardState === 'revealed' && (
          <motion.div
            initial={{ rotateY: 90, scale: 0.8 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="text-4xl"
          >
            {word.emoji}
          </motion.div>
        )}
      </div>

      {/* Letters */}
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

      {/* Tap hint */}
      {cardState === 'hidden' && (
        <span className="text-xs text-sky-400 font-bold">TAP TO HEAR!</span>
      )}
    </motion.div>
  );
}

function SentenceView({ sentence }: { sentence: Phonicssentence }) {
  const handleClick = () => speakText(sentence.text.toLowerCase());

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 cursor-pointer border-4 border-sky-200 hover:border-sky-400 transition-colors"
    >
      <p className="text-2xl font-black text-sky-800 dark:text-sky-300 leading-relaxed text-center">{sentence.text}</p>
      <p className="text-3xl text-center mt-2">{sentence.emojis}</p>
    </motion.div>
  );
}

function StoryView({ story }: { story: (typeof PHONICS_STORIES)[0] }) {
  const handleSentenceClick = (sentence: string) => {
    speakText(sentence.toLowerCase());
  };

  const handleFullStory = () => {
    const fullText = story.sentences.join(' ');
    speakText(fullText.toLowerCase());
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2">
        <h3 className="text-2xl font-black text-sky-800 dark:text-sky-300 text-center">{story.title}</h3>
        <button
          onClick={() => speakText(story.title.toLowerCase())}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-sky-100 dark:bg-slate-700 hover:bg-sky-200 dark:hover:bg-slate-700 transition-colors text-sm flex-shrink-0"
          aria-label="Hear title"
        >
          🔊
        </button>
      </div>
      {story.sentences.map((s, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSentenceClick(s)}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 cursor-pointer border-4 border-sky-200 hover:border-sky-400 transition-colors"
        >
          <p className="text-2xl font-black text-sky-800 dark:text-sky-300 text-center">{s}</p>
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

// ── Word Chain Drill ─────────────────────────────────────────────────
function findChangedIndex(wordA: string, wordB: string): number {
  for (let i = 0; i < Math.max(wordA.length, wordB.length); i++) {
    if (wordA[i] !== wordB[i]) return i;
  }
  return -1;
}

function WordChainDrill({ onConfetti }: { onConfetti: () => void }) {
  const [chainIdx, setChainIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  const chain = WORD_CHAINS[chainIdx % WORD_CHAINS.length];
  const currentWord = chain.chain[step];
  const nextWord = chain.chain[step + 1] ?? null;
  const changedIdx = nextWord ? findChangedIndex(currentWord, nextWord) : -1;

  const handleWordTap = useCallback(async () => {
    if (celebrating) return;
    await speakWord(currentWord);

    if (step < chain.chain.length - 1) {
      // Move to next word after short delay
      setTimeout(() => {
        setStep(s => s + 1);
      }, 1200);
    } else {
      // End of chain — celebrate
      setCelebrating(true);
      onConfetti();
      speakText('You did it! The whole chain!');
      setTimeout(() => {
        setCelebrating(false);
        setChainIdx(ci => ci + 1);
        setStep(0);
      }, 3000);
    }
  }, [currentWord, step, chain.chain.length, celebrating, onConfetti]);

  const handleLetterTap = useCallback((letter: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speakLetterSound(letter);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <p className="text-sm font-black text-sky-600 uppercase tracking-widest">{chain.description}</p>
      </div>

      {/* Chain name */}
      <p className="text-xs font-black text-sky-400 uppercase tracking-wider">
        CHAIN {(chainIdx % WORD_CHAINS.length) + 1} OF {WORD_CHAINS.length}
      </p>

      {/* Progress dots */}
      <div className="flex gap-3">
        {chain.chain.map((_, i) => (
          <motion.div
            key={i}
            animate={i === step ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.6, repeat: i === step ? Infinity : 0 }}
            className={`w-4 h-4 rounded-full transition-colors ${
              i < step ? 'bg-sky-500' : i === step ? 'bg-purple-500' : 'bg-sky-200'
            }`}
          />
        ))}
      </div>

      {/* Main word card — tap to speak */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${chainIdx}-${step}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleWordTap}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 flex flex-col items-center gap-4 cursor-pointer border-4 border-purple-200 hover:border-purple-400 transition-colors select-none"
          style={{ minWidth: 220 }}
        >
          {celebrating ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          ) : (
            <div className="text-6xl">{chain.emojis[step]}</div>
          )}

          {/* Letters with changed letter highlighted */}
          <div className="flex gap-2">
            {currentWord.split('').map((letter, idx) => {
              const isChanged = idx === changedIdx && nextWord !== null;
              return (
                <motion.span
                  key={idx}
                  whileTap={{ scale: 1.4 }}
                  onClick={(e) => handleLetterTap(letter, e)}
                  className={`text-5xl font-black cursor-pointer rounded-xl px-2 py-1 transition-colors ${
                    isChanged
                      ? 'text-rose-500 bg-rose-50 ring-2 ring-rose-300'
                      : 'text-sky-700'
                  }`}
                >
                  {letter}
                </motion.span>
              );
            })}
          </div>

          {celebrating ? (
            <p className="text-xl font-black text-purple-600">YOU DID IT! THE WHOLE CHAIN!</p>
          ) : (
            <p className="text-sm text-sky-400 font-bold">TAP TO HEAR!</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Preview of next word (what will change) */}
      {nextWord && !celebrating && (
        <div className="text-center">
          <p className="text-xs text-sky-400 font-bold mb-1">NEXT WORD:</p>
          <div className="flex gap-2 justify-center">
            {nextWord.split('').map((letter, idx) => {
              const isNew = idx === changedIdx;
              return (
                <span
                  key={idx}
                  className={`text-2xl font-black ${isNew ? 'text-rose-400' : 'text-sky-300'}`}
                >
                  {isNew ? letter : '·'}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI Generate mode ─────────────────────────────────────────────────
type AIContentType = 'story' | 'sentences' | null;

function AIGenerateMode({
  selectedVowels,
  selectedConsonants,
}: {
  selectedVowels: Set<VowelSound>;
  selectedConsonants: Set<string>;
}) {
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<AIContentType>(null);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generate = useCallback(async (type: 'story' | 'sentences') => {
    setLoading(true);
    setContentType(type);
    setError('');
    setGeneratedText('');

    speakText(type === 'story' ? 'Mimi is writing a story!' : 'Mimi is writing some sentences!');

    try {
      const res = await fetch('/api/generate-phonics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          vowels: Array.from(selectedVowels),
          consonants: Array.from(selectedConsonants),
        }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json() as { text: string };
      setGeneratedText(data.text);
    } catch {
      setError('OOPS! COULD NOT CONNECT. TRY AGAIN!');
    } finally {
      setLoading(false);
    }
  }, [selectedVowels, selectedConsonants]);

  const words = generatedText.split(/\s+/).filter(Boolean);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg font-black text-sky-700 text-center">MIMI WRITES JUST FOR YOU! ✨</p>

      <div className="flex gap-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => generate('story')}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white font-black text-lg py-5 px-6 rounded-2xl shadow-lg disabled:opacity-50 transition-colors"
        >
          🎲 SURPRISE STORY
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => generate('sentences')}
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-600 text-white font-black text-lg py-5 px-6 rounded-2xl shadow-lg disabled:opacity-50 transition-colors"
        >
          📝 SURPRISE SENTENCES
        </motion.button>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="text-5xl"
          >
            ✏️
          </motion.div>
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xl font-black text-purple-500"
          >
            MIMI IS WRITING...
          </motion.p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-4 border-red-200 rounded-2xl p-4 text-center">
          <p className="text-lg font-black text-red-500">{error}</p>
        </div>
      )}

      {!loading && generatedText && (
        <div className="w-full flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border-4 border-purple-200 cursor-pointer"
            onClick={() => speakText(generatedText.toLowerCase())}
          >
            <p className="text-xs font-black text-purple-400 mb-3 text-center uppercase tracking-wider">
              {contentType === 'story' ? '📖 MIMI\'S STORY — TAP A WORD TO HEAR IT!' : '📝 MIMI\'S SENTENCES — TAP A WORD TO HEAR IT!'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  whileTap={{ scale: 1.3, color: '#7c3aed' }}
                  onClick={(e) => { e.stopPropagation(); speakWord(word.replace(/[^A-Za-z]/g, '')); }}
                  className="text-2xl font-black text-sky-800 dark:text-sky-300 cursor-pointer hover:text-purple-600 transition-colors"
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <p className="text-xs text-sky-400 font-bold text-center mt-3">TAP THE WHOLE BOX TO HEAR IT ALL!</p>
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => generate(contentType ?? 'story')}
            className="bg-green-500 hover:bg-green-600 text-white font-black text-xl py-4 px-8 rounded-2xl shadow-lg transition-colors"
          >
            GET ANOTHER! 🔄
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default function PhonicsTab() {
  const [selectedVowels, setSelectedVowels] = useState<Set<VowelSound>>(new Set(ALL_VOWELS));
  const [selectedConsonants, setSelectedConsonants] = useState<Set<string>>(new Set(ALL_CONSONANTS));
  const [selectedDigraphs, setSelectedDigraphs] = useState<string[]>([]);
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

  const toggleDigraph = (d: string) => {
    setSelectedDigraphs(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const filteredWords = filterWords(selectedVowels, selectedConsonants, selectedDigraphs);
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
      <div className="flex gap-2 justify-center flex-wrap">
        {([
          { id: 'WORDS', label: 'WORDS' },
          { id: 'SENTENCES', label: 'SENTENCES' },
          { id: 'STORY', label: 'STORY' },
          { id: 'CHAIN', label: '🔗 CHAIN' },
          { id: 'AI', label: '✨ AI' },
        ] as { id: Mode; label: string }[]).map(m => (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => setMode(m.id)}
            className={`py-2 px-4 rounded-xl font-black text-base transition-all shadow ${
              mode === m.id ? 'bg-sky-500 text-white scale-105 shadow-md' : 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300'
            }`}
          >
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Vowel selector */}
      <div className="bg-white/70 dark:bg-slate-800 rounded-2xl p-3 shadow">
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
      <div className="bg-white/70 dark:bg-slate-800 rounded-2xl p-3 shadow">
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
                  : 'bg-white dark:bg-slate-700 text-sky-400 opacity-50'
              }`}
            >
              {c}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Digraph selector */}
      <div className="bg-white/70 dark:bg-slate-800 rounded-2xl p-3 shadow">
        <p className="text-xs font-black text-rose-600 mb-2 text-center uppercase tracking-widest">
          Digraphs <span className="text-rose-400 normal-case font-semibold">(optional add-ons)</span>
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {ALL_DIGRAPHS.map(d => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleDigraph(d)}
              className={`px-4 h-10 rounded-xl font-black text-sm transition-all shadow ${
                selectedDigraphs.includes(d)
                  ? 'bg-rose-500 text-white ring-4 ring-rose-600 scale-105'
                  : 'bg-rose-50 dark:bg-slate-800 text-rose-400 border-2 border-rose-200'
              }`}
            >
              {d}
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
            <div className="flex gap-2 justify-center flex-wrap">
              {PHONICS_STORIES.map((s, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setStoryIndex(i)}
                  className={`py-2 px-4 rounded-xl font-black text-sm transition-all ${
                    storyIndex === i ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300'
                  }`}
                >
                  STORY {i + 1}
                </motion.button>
              ))}
            </div>

            {storyAvailable ? (
              <StoryView story={currentStory} />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center shadow">
                <p className="text-2xl font-black text-sky-700 dark:text-sky-300">
                  TURN ON MORE LETTERS TO READ THIS STORY! 📚
                </p>
                <p className="text-sm text-sky-500 mt-2">
                  Needs vowels: {currentStory.requiredVowels.join(', ')}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'CHAIN' && (
          <motion.div
            key="chain"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <WordChainDrill onConfetti={triggerConfetti} />
          </motion.div>
        )}

        {mode === 'AI' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AIGenerateMode
              selectedVowels={selectedVowels}
              selectedConsonants={selectedConsonants}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
