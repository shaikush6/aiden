'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PATTERN_QUESTIONS, type PatternQuestion } from '@/lib/patterns-data';
import { speakText, speakEncouragement } from '@/lib/speech';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

function PatternItem({ item, isMissing }: { item: string; isMissing: boolean }) {
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

  // If it's a number string
  const isNum = /^\d+$/.test(item);
  if (isNum) {
    return (
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-2xl font-black text-white shadow">
        {item}
      </div>
    );
  }

  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white shadow flex items-center justify-center text-3xl">
      {item}
    </div>
  );
}

function OptionButton({
  option,
  onSelect,
  disabled,
  result,
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
      ) : (
        option
      )}
    </motion.button>
  );
}

export default function PatternsTab() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const question: PatternQuestion = PATTERN_QUESTIONS[questionIndex % PATTERN_QUESTIONS.length];

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
        speakText('Try again!', 0.9, 1.2);
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

  return (
    <div className="flex flex-col gap-6 p-4 pb-8 items-center">
      {showConfetti && (
        <ReactConfetti
          recycle={false}
          numberOfPieces={200}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
        />
      )}

      {/* Score */}
      <div className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow">
        <span className="text-3xl">⭐</span>
        <span className="text-3xl font-black text-purple-600">{score}</span>
        <span className="text-lg font-bold text-purple-400">STARS</span>
      </div>

      {/* Question counter */}
      <p className="text-purple-500 font-black text-sm tracking-widest">
        QUESTION {(questionIndex % PATTERN_QUESTIONS.length) + 1} OF {PATTERN_QUESTIONS.length}
      </p>

      {/* Pattern sequence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          className="bg-white/80 rounded-3xl shadow-xl p-6 w-full max-w-lg"
        >
          <p className="text-center text-purple-600 font-black text-lg mb-4 tracking-wide">
            WHAT COMES NEXT? 🤔
          </p>

          {/* Sequence display */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {displaySequence.map((item, idx) => (
              <PatternItem key={idx} item={item} isMissing={item === '?'} />
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={`text-center text-2xl font-black mb-4 ${
                  feedback === 'correct' ? 'text-green-500' : 'text-red-400'
                }`}
              >
                {feedback === 'correct' ? '⭐ GREAT JOB! ⭐' : '💪 TRY AGAIN!'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer options */}
          <div className="flex gap-4 justify-center">
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
    </div>
  );
}
