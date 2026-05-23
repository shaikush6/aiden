'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { MATH_RIDDLES, ADD_PROBLEMS, OBJECT_EMOJIS, NUMBER_BONDS_TO_5, NUMBER_BONDS_TO_10, type MathProblem, type NumberBond } from '@/lib/math-data';
import { speakText, speakNumber, speakEncouragement } from '@/lib/speech';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type SubMode = 'COUNT' | 'PLACE_VALUE' | 'RIDDLES' | 'ADD' | 'NUMBER_LINE' | 'WHICH_MORE' | 'MISSING' | 'DICE' | 'BONDS';

// ── Dice roll animation ─────────────────────────────────────────────
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function DiceMode() {
  const [die1, setDie1] = useState(1);
  const [die2, setDie2] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const total = die1 + die2;

  const wrong1 = total === 2 ? 3 : total - 1;
  const wrong2 = total >= 12 ? total - 2 : total + 1;
  const options = useMemo(
    () => Array.from(new Set([total, wrong1, wrong2])).sort(() => Math.random() - 0.5).slice(0, 3),
    [total, wrong1, wrong2]
  );

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setSelected(null);
    setFeedback(null);
    let ticks = 0;
    const interval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks >= 8) {
        clearInterval(interval);
        setRolling(false);
        speakText('How many dots in total?');
      }
    }, 80);
  };

  const handleSelect = (n: number) => {
    if (selected !== null || rolling) return;
    setSelected(n);
    if (n === total) {
      setFeedback('correct');
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`Yes! ${die1} plus ${die2} equals ${total}!`);
      setTimeout(() => { setShowConfetti(false); setFeedback(null); setSelected(null); }, 2500);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setFeedback(null); setSelected(null); }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="flex items-center gap-2">
        <p className="text-2xl font-black text-orange-700">HOW MANY DOTS IN TOTAL? 🎲</p>
        <button onClick={() => speakText('How many dots in total?')} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm">🔊</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600">{score}</span>
      </div>

      <div className="flex gap-6 items-center">
        {[die1, die2].map((d, i) => (
          <motion.div
            key={i}
            animate={rolling ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.2, 0.9, 1.1, 1] } : {}}
            transition={{ duration: 0.08, repeat: rolling ? Infinity : 0 }}
            className="text-7xl select-none"
          >
            {DICE_FACES[d - 1]}
          </motion.div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={roll}
        disabled={rolling}
        className="bg-orange-500 text-white font-black text-2xl py-4 px-10 rounded-2xl shadow-xl"
      >
        {rolling ? 'ROLLING...' : 'ROLL DICE! 🎲'}
      </motion.button>

      {!rolling && (
        <div className="flex gap-4">
          {options.map(opt => (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.9 }}
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
      )}

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
          {feedback === 'correct' ? '⭐ AMAZING! ⭐' : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

// ── Number Line mode ───────────────────────────────────────────────
function NumberLineMode() {
  const [targetPos, setTargetPos] = useState(() => Math.floor(Math.random() * 19) + 1);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mode, setMode] = useState<'where' | 'jump'>('where');
  const [jumpFrom, setJumpFrom] = useState(0);
  const [jumpBy, setJumpBy] = useState(3);

  const generateNew = useCallback(() => {
    const m = Math.random() > 0.5 ? 'where' : 'jump';
    setMode(m);
    setSelected(null);
    setFeedback(null);
    if (m === 'where') {
      setTargetPos(Math.floor(Math.random() * 19) + 1);
    } else {
      const from = Math.floor(Math.random() * 15);
      const by = Math.floor(Math.random() * 4) + 1;
      setJumpFrom(from);
      setJumpBy(by);
      setTargetPos(from + by);
    }
  }, []);

  useEffect(() => {
    if (mode === 'where') {
      speakText(`Where is the frog? Find number ${targetPos}!`);
    } else {
      speakText(`Jump ${jumpBy} steps forward from ${jumpFrom}. Where do you land?`);
    }
  }, [targetPos, mode, jumpFrom, jumpBy]);

  const handleTap = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === targetPos) {
      setFeedback('correct');
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`Yes! Number ${targetPos}!`);
      setTimeout(() => { setShowConfetti(false); generateNew(); }, 2200);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setSelected(null); setFeedback(null); }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="flex items-center gap-2">
        <p className="text-xl font-black text-orange-700 text-center">
          {mode === 'where'
            ? `WHERE IS THE FROG? 🐸 FIND ${targetPos}!`
            : `JUMP ${jumpBy} STEPS FROM ${jumpFrom}! 🐸`}
        </p>
        <button onClick={() => speakText(mode === 'where' ? `Where is the frog? Find number ${targetPos}` : `Jump ${jumpBy} steps from ${jumpFrom}`)} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm flex-shrink-0">🔊</button>
      </div>

      {/* Number line */}
      <div className="bg-white rounded-2xl p-4 shadow-lg w-full max-w-sm overflow-x-auto">
        <div className="flex gap-1 min-w-max justify-center">
          {Array.from({ length: 21 }, (_, i) => i).map(n => {
            const isFrog = mode === 'jump' && n === jumpFrom;
            const isSelected = selected === n;
            const isTarget = n === targetPos && feedback === 'correct';
            return (
              <motion.button
                key={n}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleTap(n)}
                className={`w-11 h-11 rounded-lg font-black text-sm flex flex-col items-center justify-center flex-shrink-0 transition-colors
                  ${isTarget ? 'bg-green-400 text-white' :
                    isSelected && feedback === 'wrong' ? 'bg-red-300 text-white' :
                    isFrog ? 'bg-orange-200 text-orange-700' :
                    'bg-orange-50 text-orange-600 hover:bg-orange-200'}
                `}
              >
                {isFrog && <span className="text-base leading-none">🐸</span>}
                <span className="leading-none">{n}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
          {feedback === 'correct' ? '⭐ YES! ⭐' : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

// ── Which Is More mode ─────────────────────────────────────────────
function WhichMoreMode() {
  const [countA, setCountA] = useState(3);
  const [countB, setCountB] = useState(7);
  const [emoji, setEmoji] = useState('🍎');
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const correct = countA > countB ? 'A' : 'B';

  const generateNew = useCallback((roundNum: number) => {
    const diff = Math.max(1, 8 - roundNum);
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.max(1, Math.min(10, a + (Math.random() > 0.5 ? diff : -diff)));
    const e = OBJECT_EMOJIS[Math.floor(Math.random() * OBJECT_EMOJIS.length)];
    setCountA(a);
    setCountB(b);
    setEmoji(e);
    setSelected(null);
    setFeedback(null);
  }, []);

  useEffect(() => {
    speakText(`Which group has more ${emoji}?`);
  }, [countA, countB, emoji]);

  const handleSelect = (side: 'A' | 'B') => {
    if (selected !== null) return;
    setSelected(side);
    if (side === correct) {
      setFeedback('correct');
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`Yes! ${side === 'A' ? countA : countB} is more!`);
      setTimeout(() => {
        setShowConfetti(false);
        const next = round + 1;
        setRound(next);
        generateNew(next);
      }, 2200);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setSelected(null); setFeedback(null); }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="flex items-center gap-2">
        <p className="text-2xl font-black text-orange-700">WHICH IS MORE? 🤔</p>
        <button onClick={() => speakText('Which group has more?')} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm">🔊</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600">{score}</span>
      </div>

      <div className="flex gap-6">
        {(['A', 'B'] as const).map(side => {
          const count = side === 'A' ? countA : countB;
          const isCorrect = side === correct && selected !== null && feedback === 'correct';
          const isWrong = side === selected && feedback === 'wrong';
          return (
            <motion.button
              key={side}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => handleSelect(side)}
              animate={isWrong ? { x: [0, -8, 8, -8, 0] } : {}}
              className={`flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-lg border-4 transition-colors min-w-[140px]
                ${isCorrect ? 'border-green-400' : isWrong ? 'border-red-300' : 'border-transparent hover:border-orange-300'}
              `}
            >
              <div className="flex flex-wrap gap-1 justify-center max-w-[110px] min-h-[80px] items-center">
                {Array.from({ length: count }).map((_, i) => (
                  <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04 }} className="text-3xl">
                    {emoji}
                  </motion.span>
                ))}
              </div>
              <span className="text-3xl font-black text-orange-600">{count}</span>
            </motion.button>
          );
        })}
      </div>

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
          {feedback === 'correct' ? '⭐ CORRECT! ⭐' : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

// ── Missing Number mode ─────────────────────────────────────────────
function MissingNumberMode() {
  const [start, setStart] = useState(1);
  const [step, setStep] = useState(1);
  const [gapIdx, setGapIdx] = useState(2);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const LENGTH = 5;
  const sequence = Array.from({ length: LENGTH }, (_, i) => start + i * step);
  const answer = sequence[gapIdx];

  const wrong1 = answer + step;
  const wrong2 = Math.max(0, answer - step);
  const options = useMemo(
    () => Array.from(new Set([answer, wrong1, wrong2])).sort(() => Math.random() - 0.5).slice(0, 3),
    [answer, wrong1, wrong2]
  );

  const generateNew = useCallback(() => {
    const newStart = Math.floor(Math.random() * 10);
    const newStep = Math.floor(Math.random() * 3) + 1;
    const newGap = Math.floor(Math.random() * 3) + 1;
    setStart(newStart);
    setStep(newStep);
    setGapIdx(newGap);
    setSelected(null);
    setFeedback(null);
  }, []);

  useEffect(() => {
    const seq = sequence.map((n, i) => i === gapIdx ? '?' : String(n)).join(', ');
    speakText(`What is the missing number? ${seq}`);
  }, [start, step, gapIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === answer) {
      setFeedback('correct');
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`Yes! The missing number is ${answer}!`);
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

      <div className="flex items-center gap-2">
        <p className="text-2xl font-black text-orange-700">WHAT IS THE MISSING NUMBER? 🔢</p>
        <button onClick={() => speakText('What is the missing number?')} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm">🔊</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600">{score}</span>
      </div>

      <div className="flex gap-2 items-center bg-white rounded-2xl p-4 shadow-lg flex-wrap justify-center">
        {sequence.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            {i === gapIdx ? (
              <motion.div
                animate={{ borderColor: ['#f97316', '#ea580c', '#f97316'] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-14 h-14 rounded-xl border-4 border-dashed border-orange-400 flex items-center justify-center text-2xl font-black text-orange-400 bg-orange-50"
              >
                ?
              </motion.div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-2xl font-black text-orange-700">
                {n}
              </div>
            )}
            {i < LENGTH - 1 && <span className="text-2xl font-black text-orange-400">,</span>}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {options.map(opt => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.9 }}
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

// ── Count sub-mode ──────────────────────────────────────────────────
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
      speakText(`Yes! There are ${count}!`);
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
      <div className="flex items-center gap-2">
        <p className="text-2xl font-black text-orange-700">HOW MANY? 🤔</p>
        <button onClick={() => speakText('How many?')} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm">🔊</button>
      </div>
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

// ── Place Value sub-mode ───────────────────────────────────────────
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
    const n = Math.floor(Math.random() * 89) + 10;
    setNumber(n);
    setAsking(Math.random() > 0.5 ? 'tens' : 'ones');
    setSelected(null);
    setFeedback(null);
  }, []);

  const wrong1 = answer === 0 ? 1 : answer - 1;
  const wrong2 = answer + 1;
  const options = useMemo(
    () => Array.from(new Set([answer, wrong1, wrong2])).sort(() => Math.random() - 0.5).slice(0, 3),
    [answer, wrong1, wrong2]
  );

  useEffect(() => {
    speakText(`How many ${asking === 'tens' ? 'tens' : 'ones'} in ${number}?`);
  }, [number, asking]);

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

      <div className="flex items-center gap-2">
        <p className="text-2xl font-black text-orange-700 text-center">
          HOW MANY {asking === 'tens' ? '🔵 TENS' : '🟡 ONES'}?
        </p>
        <button onClick={() => speakText(`How many ${asking === 'tens' ? 'tens' : 'ones'}?`)} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm">🔊</button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-lg flex gap-6 items-end">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-black text-blue-600">TENS 🔵</p>
          <div className="flex gap-1">
            {Array.from({ length: tens }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col gap-0.5"
              >
                {Array.from({ length: 10 }).map((__, j) => (
                  <div key={j} className="w-5 h-3 bg-blue-500 rounded-sm shadow-sm" />
                ))}
              </motion.div>
            ))}
            {tens === 0 && <div className="w-5 h-3 opacity-20 bg-blue-300 rounded-sm" />}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-black text-yellow-600">ONES 🟡</p>
          <div className="flex flex-wrap gap-1 max-w-[80px]">
            {Array.from({ length: ones }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: tens * 0.05 + i * 0.04 }}
                className="w-5 h-5 bg-yellow-400 rounded-sm shadow-sm"
              />
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

// ── Riddles sub-mode ────────────────────────────────────────────────
function RiddlesMode() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const riddle = MATH_RIDDLES[idx % MATH_RIDDLES.length];

  // Auto-speak riddle
  useEffect(() => {
    const timer = setTimeout(() => speakText(riddle.riddle), 400);
    return () => clearTimeout(timer);
  }, [idx, riddle.riddle]);

  const handleSelect = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === riddle.answer) {
      setFeedback('correct');
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`The answer is ${riddle.answer}!`);
      setTimeout(() => { setShowConfetti(false); setFeedback(null); setSelected(null); setIdx(i => i + 1); }, 2200);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      if (riddle.hint) speakText(riddle.hint);
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
          <div className="text-4xl text-center mb-4">{riddle.emoji ?? '🧩'}</div>
          <div className="flex items-start gap-2">
            <p className="text-xl font-black text-orange-700 text-center leading-relaxed flex-1">
              {riddle.riddle}
            </p>
            <button onClick={() => speakText(riddle.riddle)} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm flex-shrink-0 mt-1">🔊</button>
          </div>
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

// ── Add/Subtract sub-mode ───────────────────────────────────────────
function AddMode() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const problem: MathProblem = ADD_PROBLEMS[idx % ADD_PROBLEMS.length];

  useEffect(() => {
    const opText = problem.type === 'add' ? 'plus' : 'minus';
    speakText(`${problem.a} ${opText} ${problem.b} equals?`);
  }, [idx, problem]);

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
          <div className="flex items-center gap-2 self-stretch justify-center">
            <p className="text-lg font-black text-orange-500">
              {problem.a} {opText} {problem.b} = ?
            </p>
            <button onClick={() => speakText(`${problem.a} ${opText.toLowerCase()} ${problem.b} equals?`)} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm">🔊</button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
              {Array.from({ length: problem.a }).map((_, i) => (
                <span key={i} className="text-3xl">{problem.aEmojis}</span>
              ))}
            </div>
            <span className="text-3xl font-black text-orange-600">{problem.a}</span>
          </div>
          <span className="text-4xl font-black text-orange-400">{opSymbol}</span>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
              {Array.from({ length: problem.b }).map((_, i) => (
                <span key={i} className="text-3xl">{problem.bEmojis}</span>
              ))}
            </div>
            <span className="text-3xl font-black text-orange-600">{problem.b}</span>
          </div>
          <span className="text-3xl font-black text-orange-400">= ?</span>
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

// ── Number Bonds mode ───────────────────────────────────────────────
type BondDifficulty = 'easy' | 'hard';
type HiddenSlot = 'total' | 'partA' | 'partB';

function NumberBondsMode() {
  const [difficulty, setDifficulty] = useState<BondDifficulty>('easy');
  const [bondIdx, setBondIdx] = useState(0);
  const [hiddenSlot, setHiddenSlot] = useState<HiddenSlot>('partA');
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const bonds: NumberBond[] = difficulty === 'easy' ? NUMBER_BONDS_TO_5 : NUMBER_BONDS_TO_10;
  const bond = bonds[bondIdx % bonds.length];

  // Generate options (3 choices)
  const answer = hiddenSlot === 'total' ? bond.total : hiddenSlot === 'partA' ? bond.partA : bond.partB;
  const max = difficulty === 'easy' ? 5 : 10;
  const wrong1 = answer === 0 ? 1 : answer - 1;
  const wrong2 = answer >= max ? answer - 2 : answer + 1;
  const options = useMemo(
    () => Array.from(new Set([answer, wrong1, wrong2])).sort(() => Math.random() - 0.5).slice(0, 3),
    [answer, wrong1, wrong2]
  );

  const generateNew = useCallback(() => {
    setBondIdx(i => i + 1);
    // For easy: only hide a part; for hard: randomly hide any slot
    const slots: HiddenSlot[] = difficulty === 'easy'
      ? ['partA', 'partB']
      : ['total', 'partA', 'partB'];
    setHiddenSlot(slots[Math.floor(Math.random() * slots.length)]);
    setSelected(null);
    setFeedback(null);
  }, [difficulty]);

  // Speak on mount and when difficulty changes
  useEffect(() => {
    speakText(`Number bonds to ${difficulty === 'easy' ? 'five' : 'ten'}!`);
  }, [difficulty]);

  const handleSelect = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === answer) {
      setFeedback('correct');
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`Yes! ${bond.partA} and ${bond.partB} make ${bond.total}!`);
      setTimeout(() => { setShowConfetti(false); generateNew(); }, 2500);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setSelected(null); setFeedback(null); }, 1500);
    }
  };

  const SlotBox = ({
    value,
    slot,
    color,
  }: {
    value: number;
    slot: HiddenSlot;
    color: string;
  }) => {
    const isHidden = slot === hiddenSlot;
    return (
      <motion.div
        animate={isHidden ? { borderColor: ['#f97316', '#ea580c', '#f97316'] } : {}}
        transition={{ duration: 1.2, repeat: isHidden ? Infinity : 0 }}
        className={`w-20 h-20 rounded-2xl flex items-center justify-center text-5xl font-black shadow-lg border-4 ${
          isHidden
            ? 'border-dashed border-orange-400 bg-orange-50 text-orange-300'
            : `${color} border-transparent`
        }`}
      >
        {isHidden ? '?' : value}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      {/* Difficulty toggle */}
      <div className="flex gap-3">
        {(['easy', 'hard'] as BondDifficulty[]).map(d => (
          <motion.button
            key={d}
            whileTap={{ scale: 0.92 }}
            onClick={() => { setDifficulty(d); setBondIdx(0); setSelected(null); setFeedback(null); speakText(d === 'easy' ? 'Number bonds to five!' : 'Number bonds to ten!'); }}
            className={`py-2 px-5 rounded-xl font-black text-sm transition-all shadow ${
              difficulty === d ? 'bg-orange-500 text-white scale-105' : 'bg-white text-orange-500'
            }`}
          >
            {d === 'easy' ? 'BONDS TO 5' : 'BONDS TO 10'}
          </motion.button>
        ))}
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600">{score}</span>
      </div>

      {/* Emoji */}
      <div className="text-5xl">{bond.emoji}</div>

      {/* Bond diagram */}
      <div className="flex flex-col items-center gap-1">
        {/* Total at top */}
        <SlotBox value={bond.total} slot="total" color="bg-orange-400 text-white" />

        {/* Connecting lines using SVG */}
        <svg width="160" height="40" viewBox="0 0 160 40" className="overflow-visible">
          <line x1="80" y1="0" x2="30" y2="40" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="0" x2="130" y2="40" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
        </svg>

        {/* Parts side by side */}
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-1">
            <SlotBox value={bond.partA} slot="partA" color="bg-sky-400 text-white" />
            <span className="text-xs font-black text-sky-500">PART A</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <SlotBox value={bond.partB} slot="partB" color="bg-purple-400 text-white" />
            <span className="text-xs font-black text-purple-500">PART B</span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="flex items-center gap-2">
        <p className="text-xl font-black text-orange-700 text-center">
          WHAT IS THE <span className="text-orange-400">?</span>
        </p>
        <button
          onClick={() => speakText(`What is the missing number? ${bond.partA} and ${bond.partB} make ${bond.total}`)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 text-sm"
        >
          🔊
        </button>
      </div>

      {/* Answer buttons */}
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
          {feedback === 'correct' ? `⭐ YES! ${bond.partA} + ${bond.partB} = ${bond.total}! ⭐` : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

// ── Mode config ────────────────────────────────────────────────────
const SUB_MODES: { id: SubMode; label: string; icon: string }[] = [
  { id: 'COUNT', label: 'COUNT', icon: '🔢' },
  { id: 'PLACE_VALUE', label: 'TENS & ONES', icon: '🔵🟡' },
  { id: 'RIDDLES', label: 'RIDDLES', icon: '🧩' },
  { id: 'ADD', label: 'ADD & SUBTRACT', icon: '➕' },
  { id: 'NUMBER_LINE', label: 'NUMBER LINE', icon: '🐸' },
  { id: 'WHICH_MORE', label: 'WHICH MORE?', icon: '🍎' },
  { id: 'MISSING', label: 'MISSING №', icon: '❓' },
  { id: 'DICE', label: 'DICE', icon: '🎲' },
  { id: 'BONDS', label: 'NUMBER BONDS', icon: '🔗' },
];

const MODE_NAMES: Record<SubMode, string> = {
  COUNT: 'Count mode!',
  PLACE_VALUE: 'Tens and ones mode!',
  RIDDLES: 'Riddles mode!',
  ADD: 'Add and subtract mode!',
  NUMBER_LINE: 'Number line mode!',
  WHICH_MORE: 'Which is more mode!',
  MISSING: 'Missing number mode!',
  DICE: 'Dice game!',
  BONDS: 'Number bonds!',
};

export default function MathTab() {
  const [subMode, setSubMode] = useState<SubMode>('COUNT');

  const handleModeChange = useCallback((id: SubMode) => {
    setSubMode(id);
    speakText(MODE_NAMES[id]);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      {/* Sub-mode selector */}
      <div className="grid grid-cols-4 gap-2">
        {SUB_MODES.map(m => (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleModeChange(m.id)}
            className={`py-3 px-1 rounded-xl font-black text-xs transition-all shadow text-center min-h-[72px] ${
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
          {subMode === 'NUMBER_LINE' && <NumberLineMode />}
          {subMode === 'WHICH_MORE' && <WhichMoreMode />}
          {subMode === 'MISSING' && <MissingNumberMode />}
          {subMode === 'DICE' && <DiceMode />}
          {subMode === 'BONDS' && <NumberBondsMode />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
