'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PATTERN_QUESTIONS, PATTERN_EMOJIS_POOL, type PatternQuestion, type Difficulty } from '@/lib/patterns-data';
import { speakText, speakEncouragement } from '@/lib/speech';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

// ── Tone map: each emoji slot gets a musical note ──────────────────
const NOTE_FREQS = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3]; // C4-C5

function playTone(index: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = NOTE_FREQS[index % NOTE_FREQS.length];
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch { /* ignore */ }
}

// ── Pattern item display ───────────────────────────────────────────
function PatternItem({ item, isMissing, index }: { item: string; isMissing: boolean; index: number }) {
  if (isMissing) {
    return (
      <motion.div
        animate={{ borderColor: ['#a855f7', '#7c3aed', '#a855f7'] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-4 border-dashed border-purple-400 flex items-center justify-center bg-purple-50 text-2xl font-black text-purple-400"
      >
        ?
      </motion.div>
    );
  }

  const isNum = /^\d+$/.test(item);
  const handleClick = () => playTone(index);

  if (isNum) {
    return (
      <motion.div
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-2xl font-black text-white shadow cursor-pointer"
      >
        {item}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white shadow flex items-center justify-center text-3xl cursor-pointer"
    >
      {item}
    </motion.div>
  );
}

// ── Answer option button ───────────────────────────────────────────
function OptionButton({
  option, onSelect, disabled, result,
}: {
  option: string;
  onSelect: () => void;
  disabled: boolean;
  result: 'correct' | 'wrong' | null;
}) {
  const isNum = /^\d+$/.test(option);
  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.92 }}
      whileHover={disabled ? {} : { scale: 1.08 }}
      animate={
        result === 'correct'
          ? { scale: [1, 1.2, 1], backgroundColor: ['#a855f7', '#22c55e', '#22c55e'] }
          : result === 'wrong'
          ? { x: [0, -8, 8, -8, 8, 0] }
          : {}
      }
      onClick={disabled ? undefined : onSelect}
      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg text-3xl font-black flex items-center justify-center transition-colors
        ${result === 'correct' ? 'bg-green-400 text-white' : result === 'wrong' ? 'bg-red-300 text-white' : 'bg-white hover:bg-purple-50 text-gray-700'}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isNum ? (
        <span className="text-2xl font-black text-purple-700">{option}</span>
      ) : option}
    </motion.button>
  );
}

// ── Make Your Own Pattern mode ─────────────────────────────────────
function MakeYourOwnMode() {
  const SLOT_COUNT = 8;
  const [slots, setSlots] = useState<(string | null)[]>(Array(SLOT_COUNT).fill(null));
  const [result, setResult] = useState<'pattern' | 'no-pattern' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const OPTIONS = PATTERN_EMOJIS_POOL.slice(0, 6);

  const handleSlotFill = (emoji: string) => {
    const firstEmpty = slots.findIndex(s => s === null);
    if (firstEmpty === -1) return;
    const next = [...slots];
    next[firstEmpty] = emoji;
    playTone(firstEmpty);
    setSlots(next);
    setResult(null);
  };

  const checkPattern = useCallback(() => {
    const filled = slots.filter(Boolean) as string[];
    if (filled.length < 4) {
      speakText('Keep going! Fill more slots!');
      return;
    }
    // Simple pattern detection: check if sequence repeats with period 2, 3, or 4
    const isPattern = ([2, 3, 4] as const).some(period => {
      if (filled.length < period * 2) return false;
      for (let i = period; i < filled.length; i++) {
        if (filled[i] !== filled[i % period]) return false;
      }
      return true;
    });

    if (isPattern) {
      setResult('pattern');
      setShowConfetti(true);
      speakText('Amazing! That IS a pattern! Great job!');
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setResult('no-pattern');
      speakText('Not quite a pattern yet! Try using the same items again and again!');
    }
  }, [slots]);

  const reset = () => {
    setSlots(Array(SLOT_COUNT).fill(null));
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="flex items-center gap-2">
        <p className="text-xl font-black text-purple-700">MAKE YOUR PATTERN!</p>
        <button onClick={() => speakText('Make your own pattern! Tap the shapes below to fill the slots.')} className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-100 text-sm">🔊</button>
      </div>

      {/* Slots */}
      <div className="flex flex-wrap gap-2 justify-center bg-white rounded-2xl p-4 shadow-lg w-full max-w-sm">
        {slots.map((s, i) => (
          <motion.div
            key={i}
            animate={s ? {} : { borderColor: ['#c4b5fd', '#7c3aed', '#c4b5fd'] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className={`w-14 h-14 rounded-xl border-4 flex items-center justify-center text-2xl
              ${s ? 'bg-purple-50 border-purple-400' : 'border-dashed border-purple-200 bg-purple-50/50'}
            `}
          >
            {s ?? ''}
          </motion.div>
        ))}
      </div>

      {/* Options */}
      <div className="flex gap-3 justify-center flex-wrap">
        {OPTIONS.map(emoji => (
          <motion.button
            key={emoji}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
            onClick={() => handleSlotFill(emoji)}
            className="w-14 h-14 rounded-2xl bg-white shadow-lg text-3xl flex items-center justify-center cursor-pointer"
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {result && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-xl font-black text-center px-6 py-3 rounded-2xl ${result === 'pattern' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}
        >
          {result === 'pattern' ? '⭐ YES! That\'s a pattern! ⭐' : '🤔 Almost! Try again!'}
        </motion.div>
      )}

      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={checkPattern}
          className="bg-purple-500 text-white font-black text-lg py-3 px-6 rounded-xl shadow"
        >
          CHECK IT! 🔍
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={reset}
          className="bg-white text-purple-500 font-black text-lg py-3 px-6 rounded-xl shadow border-2 border-purple-200"
        >
          RESET 🔄
        </motion.button>
      </div>
    </div>
  );
}

// ── Main PatternsTab ───────────────────────────────────────────────
type TabMode = 'QUIZ' | 'CREATE';

export default function PatternsTab() {
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [tabMode, setTabMode] = useState<TabMode>('QUIZ');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const spokenRef = useRef(false);

  const filteredQuestions = PATTERN_QUESTIONS.filter(q => q.difficulty === difficulty);
  const question: PatternQuestion = filteredQuestions[questionIndex % filteredQuestions.length];

  // Auto-speak "What comes next?" when question changes
  useEffect(() => {
    spokenRef.current = false;
    const timer = setTimeout(() => {
      if (!spokenRef.current) {
        speakText('What comes next?');
        spokenRef.current = true;
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [questionIndex, difficulty]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (selected !== null) return;
      setSelected(option);

      if (option === question.answer) {
        setFeedback('correct');
        setScore(s => s + 1);
        setShowConfetti(true);
        speakEncouragement(true);
        setTimeout(() => {
          setShowConfetti(false);
          setFeedback(null);
          setSelected(null);
          setQuestionIndex(i => i + 1);
        }, 2000);
      } else {
        setFeedback('wrong');
        speakEncouragement(false);
        speakText('Try again!');
        setTimeout(() => {
          setFeedback(null);
          setSelected(null);
        }, 1500);
      }
    },
    [selected, question.answer]
  );

  const displaySequence = question.sequence.map((item, idx) =>
    idx === question.missingIndex ? '?' : item
  );

  const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string }> = {
    EASY:   { label: 'EASY',   color: 'text-green-700', bg: 'bg-green-500' },
    MEDIUM: { label: 'MEDIUM', color: 'text-yellow-700', bg: 'bg-yellow-500' },
    HARD:   { label: 'HARD',   color: 'text-red-700',   bg: 'bg-red-500' },
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-8 items-center">
      {showConfetti && (
        <ReactConfetti recycle={false} numberOfPieces={200} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />
      )}

      {/* Tab mode toggle */}
      <div className="flex gap-2 w-full max-w-sm">
        {(['QUIZ', 'CREATE'] as TabMode[]).map(m => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.92 }}
            onClick={() => setTabMode(m)}
            className={`flex-1 py-3 rounded-xl font-black text-base transition-all shadow ${
              tabMode === m ? 'bg-purple-500 text-white scale-105 shadow-md' : 'bg-white text-purple-600'
            }`}
          >
            {m === 'QUIZ' ? '🎯 QUIZ' : '🎨 CREATE'}
          </motion.button>
        ))}
      </div>

      {tabMode === 'CREATE' ? (
        <MakeYourOwnMode />
      ) : (
        <>
          {/* Difficulty selector */}
          <div className="flex gap-3 justify-center w-full max-w-sm">
            {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
              <motion.button
                key={d}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setDifficulty(d);
                  setQuestionIndex(0);
                  setSelected(null);
                  setFeedback(null);
                }}
                className={`flex-1 py-3 rounded-xl font-black text-sm transition-all shadow ${
                  difficulty === d ? `${difficultyConfig[d].bg} text-white scale-105 shadow-md` : 'bg-white text-gray-600'
                }`}
              >
                {difficultyConfig[d].label}
              </motion.button>
            ))}
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow">
            <span className="text-3xl">⭐</span>
            <span className="text-3xl font-black text-purple-600">{score}</span>
            <span className="text-lg font-bold text-purple-400">STARS</span>
          </div>

          {/* Question counter */}
          <p className="text-purple-500 font-black text-sm tracking-widest">
            QUESTION {(questionIndex % filteredQuestions.length) + 1} OF {filteredQuestions.length}
          </p>

          {/* Pattern sequence */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${difficulty}-${questionIndex}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              className="bg-white/80 rounded-3xl shadow-xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-center text-purple-600 font-black text-lg tracking-wide">
                  WHAT COMES NEXT? 🤔
                </p>
                <button
                  onClick={() => speakText('What comes next?')}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-100 text-sm flex-shrink-0"
                >
                  🔊
                </button>
              </div>

              {/* Sequence display */}
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                {displaySequence.map((item, idx) => (
                  <PatternItem key={idx} item={item} isMissing={item === '?'} index={idx} />
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className={`text-center text-2xl font-black mb-4 ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}
                  >
                    {feedback === 'correct' ? '⭐ GREAT JOB! ⭐' : '💪 TRY AGAIN!'}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Answer options */}
              <div className="flex gap-4 justify-center flex-wrap">
                {question.options.map(opt => (
                  <OptionButton
                    key={opt}
                    option={opt}
                    onSelect={() => handleAnswer(opt)}
                    disabled={selected !== null}
                    result={selected === opt ? feedback : null}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Skip button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setSelected(null);
              setFeedback(null);
              setQuestionIndex(i => i + 1);
            }}
            className="text-purple-400 font-black text-sm underline"
          >
            SKIP THIS ONE →
          </motion.button>
        </>
      )}
    </div>
  );
}
