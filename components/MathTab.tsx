'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { MATH_RIDDLES, ADD_PROBLEMS, OBJECT_EMOJIS, type MathProblem } from '@/lib/math-data';
import { speakText, speakNumber, speakEncouragement } from '@/lib/speech';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type SubMode = 'COUNT' | 'PLACE_VALUE' | 'RIDDLES' | 'ADD';

// -- Count sub-mode --
function CountMode() {
  const [count, setCount] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [emoji, setEmoji] = useState(() => OBJECT_EMOJIS[0]);
  const [options, setOptions] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const generateNew = useCallback(() => {
    const newCount = Math.floor(Math.random() * 10) + 1;
    const newEmoji = OBJECT_EMOJIS[Math.floor(Math.random() * OBJECT_EMOJIS.length)];
    const wrong1 = newCount === 1 ? 2 : newCount - 1;
    const wrong2 = newCount >= 10 ? newCount - 2 : newCount + 1;
    const opts = Array.from(new Set([newCount, wrong1, wrong2])).sort(() => Math.random() - 0.5);
    setCount(newCount);
    setEmoji(newEmoji);
    setOptions(opts.slice(0, 3));
    setSelected(null);
    setFeedback(null);
  }, []);

  useMemo(() => {
    const wrong1 = count === 1 ? 2 : count - 1;
    const wrong2 = count >= 10 ? count - 2 : count + 1;
    const opts = Array.from(new Set([count, wrong1, wrong2])).sort(() => Math.random() - 0.5);
    setOptions(opts.slice(0, 3));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === count) {
      setFeedback('correct');
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`Yes! There are ${count}!`, 0.85, 1.2);
      setTimeout(() => { setShowConfetti(false); generateNew(); }, 2200);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setSelected(null); setFeedback(null); }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}
      <p className="text-2xl font-black text-orange-700">HOW MANY? 🤔</p>
      <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full">
        <div className="flex flex-wrap gap-2 justify-center min-h-[120px] items-center">
          {Array.from({ length: count }).map((_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} className="text-4xl">
              {emoji}
            </motion.span>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        {options.map(opt => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => handleSelect(opt)}
            animate={
              selected === opt && feedback === 'correct' ? { scale: [1, 1.3, 1], backgroundColor: ['#f97316', '#22c55e', '#22c55e'] } :
              selected === opt && feedback === 'wrong' ? { x: [0, -8, 8, -8, 0] } : {}
            }
            className={`w-20 h-20 rounded-2xl text-4xl font-black shadow-lg transition-colors
              ${selected === opt && feedback === 'correct' ? 'bg-green-400 text-white' :
                selected === opt && feedback === 'wrong' ? 'bg-red-300 text-white' :
                'bg-white text-orange-600 hover:bg-orange-50'}
            `}
          >
            {opt}
          </motion.button>
        ))}
      </div>
      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
          {feedback === 'correct' ? '⭐ AMAZING! ⭐' : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

// -- Place Value sub-mode --
function PlaceValueMode() {
  const [number, setNumber] = useState(23);
  const [asking, setAsking] = useState<'tens' | 'ones'>('tens');
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const tens = Math.floor(number / 10);
  const ones = number % 10;
  const answer = asking === 'tens' ? tens : ones;

  const generateNew = useCallback(() => {
    const n = Math.floor(Math.random() * 99) + 10;
    setNumber(n);
    setAsking(Math.random() > 0.5 ? 'tens' : 'ones');
    setSelected(null);
    setFeedback(null);
  }, []);

  const wrong1 = answer === 0 ? 1 : answer - 1;
  const wrong2 = answer + 1;
  const options = Array.from(new Set([answer, wrong1, wrong2])).sort(() => Math.random() - 0.5).slice(0, 3);

  const handleSelect = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === answer) {
      setFeedback('correct');
      setShowConfetti(true);
      speakEncouragement(true);
      setTimeout(() => { setShowConfetti(false); generateNew(); }, 2000);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setSelected(null); setFeedback(null); }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="text-6xl font-black text-orange-700 bg-white rounded-2xl w-28 h-28 flex items-center justify-center shadow-lg">
        {number}
      </div>

      <p className="text-2xl font-black text-orange-700 text-center">
        HOW MANY {asking === 'tens' ? '🔵 TENS' : '🟡 ONES'}?
      </p>

      {/* Visual Dienes */}
      <div className="bg-white rounded-2xl p-4 shadow-lg flex gap-6 items-end">
        {/* Tens rods */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-black text-blue-600">TENS 🔵</p>
          <div className="flex gap-1">
            {Array.from({ length: tens }).map((_, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                {Array.from({ length: 10 }).map((__, j) => (
                  <div key={j} className="w-5 h-3 bg-blue-500 rounded-sm shadow-sm" />
                ))}
              </div>
            ))}
            {tens === 0 && <div className="w-5 h-3 opacity-20 bg-blue-300 rounded-sm" />}
          </div>
        </div>

        {/* Ones cubes */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-black text-yellow-600">ONES 🟡</p>
          <div className="flex flex-wrap gap-1 max-w-[80px]">
            {Array.from({ length: ones }).map((_, i) => (
              <div key={i} className="w-5 h-5 bg-yellow-400 rounded-sm shadow-sm" />
            ))}
            {ones === 0 && <div className="w-5 h-5 opacity-20 bg-yellow-300 rounded-sm" />}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {options.map(opt => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => handleSelect(opt)}
            animate={
              selected === opt && feedback === 'correct' ? { scale: [1, 1.3, 1] } :
              selected === opt && feedback === 'wrong' ? { x: [0, -8, 8, -8, 0] } : {}
            }
            className={`w-20 h-20 rounded-2xl text-3xl font-black shadow-lg transition-colors
              ${selected === opt && feedback === 'correct' ? 'bg-green-400 text-white' :
                selected === opt && feedback === 'wrong' ? 'bg-red-300 text-white' :
                'bg-white text-orange-600 hover:bg-orange-50'}
            `}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
          {feedback === 'correct' ? '⭐ AMAZING! ⭐' : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

// -- Riddles sub-mode --
function RiddlesMode() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const riddle = MATH_RIDDLES[idx % MATH_RIDDLES.length];

  const handleSelect = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === riddle.answer) {
      setFeedback('correct');
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`The answer is ${riddle.answer}!`, 0.85, 1.2);
      setTimeout(() => { setShowConfetti(false); setFeedback(null); setSelected(null); setIdx(i => i + 1); }, 2200);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      if (riddle.hint) speakText(riddle.hint, 0.85, 1.1);
      setTimeout(() => { setFeedback(null); setSelected(null); }, 1800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600">{score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full"
        >
          <div className="text-4xl text-center mb-4">🧩</div>
          <p className="text-xl font-black text-orange-700 text-center leading-relaxed">
            {riddle.riddle}
          </p>
          {riddle.hint && feedback === 'wrong' && (
            <p className="text-sm text-orange-400 text-center mt-2 italic">Hint: {riddle.hint}</p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4">
        {riddle.options.map(opt => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => handleSelect(opt)}
            animate={
              selected === opt && feedback === 'correct' ? { scale: [1, 1.3, 1] } :
              selected === opt && feedback === 'wrong' ? { x: [0, -8, 8, -8, 0] } : {}
            }
            className={`w-20 h-20 rounded-2xl text-3xl font-black shadow-lg transition-colors
              ${selected === opt && feedback === 'correct' ? 'bg-green-400 text-white' :
                selected === opt && feedback === 'wrong' ? 'bg-red-300 text-white' :
                'bg-white text-orange-600 hover:bg-orange-50'}
            `}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
          {feedback === 'correct' ? '⭐ CORRECT! ⭐' : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

// -- Add/Subtract sub-mode --
function AddMode() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const problem: MathProblem = ADD_PROBLEMS[idx % ADD_PROBLEMS.length];

  const handleSelect = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === problem.answer) {
      setFeedback('correct');
      setShowConfetti(true);
      speakEncouragement(true);
      speakNumber(problem.answer);
      setTimeout(() => { setShowConfetti(false); setFeedback(null); setSelected(null); setIdx(i => i + 1); }, 2200);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setFeedback(null); setSelected(null); }, 1500);
    }
  };

  const opSymbol = problem.type === 'add' ? '+' : '-';
  const opText = problem.type === 'add' ? 'PLUS' : 'MINUS';

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-3xl p-6 shadow-xl max-w-sm w-full flex flex-col items-center gap-4"
        >
          {/* A group */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
              {Array.from({ length: problem.a }).map((_, i) => (
                <span key={i} className="text-3xl">{problem.aEmojis}</span>
              ))}
            </div>
            <span className="text-3xl font-black text-orange-600">{problem.a}</span>
          </div>

          <span className="text-4xl font-black text-orange-400">{opSymbol}</span>

          {/* B group */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
              {Array.from({ length: problem.b }).map((_, i) => (
                <span key={i} className="text-3xl">{problem.bEmojis}</span>
              ))}
            </div>
            <span className="text-3xl font-black text-orange-600">{problem.b}</span>
          </div>

          <span className="text-3xl font-black text-orange-400">= ?</span>

          <p className="text-lg font-black text-orange-500">
            {problem.a} {opText} {problem.b} = ?
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-4">
        {problem.options.map(opt => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => handleSelect(opt)}
            animate={
              selected === opt && feedback === 'correct' ? { scale: [1, 1.3, 1] } :
              selected === opt && feedback === 'wrong' ? { x: [0, -8, 8, -8, 0] } : {}
            }
            className={`w-20 h-20 rounded-2xl text-3xl font-black shadow-lg transition-colors
              ${selected === opt && feedback === 'correct' ? 'bg-green-400 text-white' :
                selected === opt && feedback === 'wrong' ? 'bg-red-300 text-white' :
                'bg-white text-orange-600 hover:bg-orange-50'}
            `}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
          {feedback === 'correct' ? '⭐ YES! ⭐' : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

const SUB_MODES: { id: SubMode; label: string; icon: string }[] = [
  { id: 'COUNT', label: 'COUNT', icon: '🔢' },
  { id: 'PLACE_VALUE', label: 'TENS & ONES', icon: '🔵🟡' },
  { id: 'RIDDLES', label: 'RIDDLES', icon: '🧩' },
  { id: 'ADD', label: 'ADD & SUBTRACT', icon: '➕' },
];

export default function MathTab() {
  const [subMode, setSubMode] = useState<SubMode>('COUNT');

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      {/* Sub-mode selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SUB_MODES.map(m => (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSubMode(m.id)}
            className={`py-3 px-2 rounded-xl font-black text-sm transition-all shadow text-center ${
              subMode === m.id ? 'bg-orange-500 text-white scale-105 shadow-md' : 'bg-white text-orange-600'
            }`}
          >
            <div className="text-xl mb-1">{m.icon}</div>
            {m.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-2"
        >
          {subMode === 'COUNT' && <CountMode />}
          {subMode === 'PLACE_VALUE' && <PlaceValueMode />}
          {subMode === 'RIDDLES' && <RiddlesMode />}
          {subMode === 'ADD' && <AddMode />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
