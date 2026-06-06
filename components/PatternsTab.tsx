'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  PATTERN_QUESTIONS, PATTERN_EMOJIS_POOL,
  type PatternQuestion, type Difficulty, type DrillType,
} from '@/lib/patterns-data';
import { speakText, speakEncouragement } from '@/lib/speech';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

const NOTE_FREQS = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3];
function playTone(index: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = NOTE_FREQS[index % NOTE_FREQS.length];
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(); osc.stop(ctx.currentTime + 0.4);
  } catch { /* ignore */ }
}

// Deterministic seeded shuffle (Fisher-Yates + LCG) — same question.id always
// yields the same option order, so answer position is stable but not predictable.
function seededShuffle<T>(items: T[], id: number): T[] {
  const out = items.slice();
  let state = (id * 2654435761) >>> 0; // seed: id * large prime, kept unsigned
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) & 0xffffffff;
    state = state >>> 0;
    return state / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ── ShapeDisplay — renders "shape:color[:size]" as a CSS shape, or emoji text ──
function ShapeDisplay({ item, size = 'md' }: { item: string; size?: 'sm' | 'md' | 'lg' }) {
  if (!item.includes(':')) {
    return <span className="text-3xl leading-none select-none">{item}</span>;
  }
  const parts = item.split(':');
  const shape = parts[0];
  const color = parts[1];
  const sz = (parts[2] as 'sm' | 'md' | 'lg') || size;

  const dim = sz === 'sm' ? 'w-7 h-7' : sz === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const fontSize = sz === 'sm' ? 'text-xl' : sz === 'lg' ? 'text-4xl' : 'text-3xl';

  const FILL: Record<string, string> = {
    red: 'bg-red-500', blue: 'bg-blue-500', yellow: 'bg-yellow-400',
    green: 'bg-green-500', orange: 'bg-orange-500', purple: 'bg-purple-500',
    pink: 'bg-pink-400', teal: 'bg-teal-500', white: 'bg-white border-2 border-gray-400',
  };
  const TEXT_COLOR: Record<string, string> = {
    red: 'text-red-500', blue: 'text-blue-500', yellow: 'text-yellow-400',
    green: 'text-green-500', orange: 'text-orange-500', purple: 'text-purple-500',
    pink: 'text-pink-400', teal: 'text-teal-500',
  };
  const fill = FILL[color] || 'bg-gray-400';
  const textCol = TEXT_COLOR[color] || 'text-gray-500';

  if (shape === 'circle') return <div className={dim + ' ' + fill + ' rounded-full shadow-sm'} />;
  if (shape === 'square') return <div className={dim + ' ' + fill + ' rounded-sm shadow-sm'} />;
  if (shape === 'oval') return <div className={'h-8 w-12 ' + fill + ' rounded-full shadow-sm'} />;
  if (shape === 'diamond') return <div className={'relative ' + dim + ' flex items-center justify-center'}><div className={'w-3/4 h-3/4 ' + fill + ' rotate-45 shadow-sm'} /></div>;
  if (shape === 'triangle') return <div className={'flex items-center justify-center ' + dim}><span className={fontSize + ' ' + textCol + ' leading-none'} style={{ lineHeight: 1 }}>▲</span></div>;
  if (shape === 'star') return <div className={'flex items-center justify-center ' + dim}><span className={fontSize + ' ' + textCol + ' leading-none'} style={{ lineHeight: 1 }}>★</span></div>;
  if (shape === 'heart') return <div className={'flex items-center justify-center ' + dim}><span className={fontSize + ' ' + textCol + ' leading-none'} style={{ lineHeight: 1 }}>♥</span></div>;
  if (shape === 'pentagon') return <div className={'flex items-center justify-center ' + dim}><span className={fontSize + ' ' + textCol + ' leading-none'} style={{ lineHeight: 1 }}>⬠</span></div>;
  return <div className={dim + ' ' + fill + ' rounded-sm shadow-sm'} />;
}

// ── DRILL: NEXT / MISSING_MIDDLE — show sequence with ? slot, pick from options ──
function QuizDrill({ question, onCorrect, onWrong }: {
  question: PatternQuestion;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const shuffledOptions = useMemo(
    () => seededShuffle(question.options, question.id),
    [question.id, question.options]
  );

  const handleAnswer = useCallback((opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    playTone(question.options.indexOf(opt));
    if (opt === question.answer) {
      setFeedback('correct');
      speakEncouragement(true);
      setTimeout(() => { setFeedback(null); setSelected(null); onCorrect(); }, 1800);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setFeedback(null); setSelected(null); onWrong(); }, 1400);
    }
  }, [selected, question, onCorrect, onWrong]);

  const displaySeq = question.sequence.map((item, i) =>
    i === question.missingIndex ? '?' : item
  );

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Sequence — wraps for long ones */}
      <div className="bg-white/80 dark:bg-slate-700 rounded-3xl shadow-xl p-5 w-full">
        <div className="flex flex-wrap gap-2 justify-center">
          {displaySeq.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => playTone(idx)}
              className={`min-w-[48px] h-12 sm:h-14 rounded-xl flex items-center justify-center text-2xl cursor-pointer select-none shadow
                ${item === '?' ? 'border-4 border-dashed border-purple-400 bg-purple-50 dark:bg-slate-800 text-purple-400 dark:text-purple-400 font-black text-xl' : 'bg-white dark:bg-slate-800'}`}
            >
              {item === '?' ? (
                <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>?</motion.span>
              ) : <ShapeDisplay item={item} />}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}
          >
            {feedback === 'correct' ? '⭐ GREAT JOB! ⭐' : '💪 TRY AGAIN!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options */}
      <div className="flex gap-3 justify-center flex-wrap">
        {shuffledOptions.map((opt) => (
          <motion.button
            key={opt}
            whileTap={selected ? {} : { scale: 0.9 }}
            whileHover={selected ? {} : { scale: 1.1 }}
            animate={
              selected === opt && feedback === 'correct'
                ? { scale: [1, 1.25, 1], backgroundColor: ['#ffffff', '#22c55e', '#22c55e'] }
                : selected === opt && feedback === 'wrong'
                ? { x: [0, -8, 8, -8, 8, 0] }
                : {}
            }
            onClick={() => handleAnswer(opt)}
            disabled={!!selected}
            className={`min-w-[56px] h-14 sm:h-16 rounded-2xl shadow-lg text-2xl font-black flex items-center justify-center px-3
              transition-colors select-none
              ${selected === opt && feedback === 'correct' ? 'bg-green-400 text-white'
                : selected === opt && feedback === 'wrong' ? 'bg-red-300 text-white'
                : 'bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-100'}
              ${selected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ShapeDisplay item={opt} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── DRILL: FIND_MISTAKE — tap the wrong item directly ──
function FindMistakeDrill({ question, onCorrect, onWrong }: {
  question: PatternQuestion;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [tapped, setTapped] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleTap = (idx: number, item: string) => {
    if (tapped !== null) return;
    setTapped(idx);
    playTone(idx);
    if (item === question.answer) {
      setFeedback('correct');
      speakEncouragement(true);
      setTimeout(() => { setFeedback(null); setTapped(null); onCorrect(); }, 1800);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setFeedback(null); setTapped(null); onWrong(); }, 1400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex items-center gap-2">
        <p className="text-xl font-black text-red-500">TAP THE WRONG ONE! 🔍</p>
        <button onClick={() => speakText('Tap the one that does not belong in the pattern!')} className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-sm flex-shrink-0">🔊</button>
      </div>

      <div className="bg-white/80 dark:bg-slate-700 rounded-3xl shadow-xl p-5 w-full">
        <div className="flex flex-wrap gap-2 justify-center">
          {question.sequence.map((item, idx) => (
            <motion.button
              key={idx}
              whileTap={tapped !== null ? {} : { scale: 0.85 }}
              whileHover={tapped !== null ? {} : { scale: 1.1 }}
              animate={
                tapped === idx && feedback === 'correct'
                  ? { scale: [1, 1.3, 1], backgroundColor: ['#ffffff', '#22c55e', '#22c55e'] }
                  : tapped === idx && feedback === 'wrong'
                  ? { x: [0, -8, 8, -8, 8, 0] }
                  : {}
              }
              onClick={() => handleTap(idx, item)}
              disabled={tapped !== null}
              className={`min-w-[52px] h-12 sm:h-14 rounded-xl text-2xl shadow flex items-center justify-center px-2
                transition-colors select-none cursor-pointer
                ${tapped === idx && feedback === 'correct' ? 'bg-green-400'
                  : tapped === idx && feedback === 'wrong' ? 'bg-red-300'
                  : 'bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-slate-700'}`}
            >
              <ShapeDisplay item={item} />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}
          >
            {feedback === 'correct' ? '⭐ FOUND IT! ⭐' : '💪 NOT THAT ONE — TRY AGAIN!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── DRILL: COUNT — how many of X are in the sequence? ──
function CountDrill({ question, onCorrect, onWrong }: {
  question: PatternQuestion;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const target = question.countTarget ?? '';

  const shuffledOptions = useMemo(
    () => seededShuffle(question.options, question.id),
    [question.id, question.options]
  );

  const handleAnswer = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === question.answer) {
      setFeedback('correct');
      speakEncouragement(true);
      setTimeout(() => { setFeedback(null); setSelected(null); onCorrect(); }, 1800);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setFeedback(null); setSelected(null); onWrong(); }, 1400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <p className="text-xl font-black text-purple-600 text-center">
          HOW MANY <span className="inline-flex align-middle"><ShapeDisplay item={target} /></span> CAN YOU SEE? 👀
        </p>
        <button onClick={() => speakText(`How many ${target} can you count?`)} className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-100 text-sm flex-shrink-0">🔊</button>
      </div>

      <div className="bg-white/80 dark:bg-slate-700 rounded-3xl shadow-xl p-5 w-full">
        <div className="flex flex-wrap gap-2 justify-center">
          {question.sequence.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.06, type: 'spring' }}
              className={`min-w-[48px] h-12 rounded-xl flex items-center justify-center text-2xl px-2
                ${item === target ? 'bg-purple-100 dark:bg-slate-700 ring-2 ring-purple-400' : 'bg-white dark:bg-slate-800'} shadow`}
            >
              <ShapeDisplay item={item} />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
            {feedback === 'correct' ? '⭐ CORRECT! ⭐' : '💪 TRY AGAIN!'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3 justify-center flex-wrap">
        {shuffledOptions.map((opt) => (
          <motion.button
            key={opt}
            whileTap={selected ? {} : { scale: 0.9 }}
            whileHover={selected ? {} : { scale: 1.1 }}
            onClick={() => handleAnswer(opt)}
            disabled={!!selected}
            className={`w-16 h-16 rounded-2xl text-2xl font-black shadow-lg
              ${selected === opt && feedback === 'correct' ? 'bg-green-400 text-white'
                : selected === opt && feedback === 'wrong' ? 'bg-red-300 text-white'
                : 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-700'}
              ${selected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── MAKE YOUR OWN ──────────────────────────────────────────────────
function MakeYourOwnMode() {
  const SLOT_COUNT = 10;
  const [slots, setSlots] = useState<(string | null)[]>(Array(SLOT_COUNT).fill(null));
  const [result, setResult] = useState<'pattern' | 'no-pattern' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const OPTIONS = [
    'circle:red', 'circle:blue', 'square:yellow', 'triangle:green', 'star:orange', 'heart:pink',
    'diamond:purple', 'circle:teal',
    ...PATTERN_EMOJIS_POOL.slice(0, 4),
  ];

  const handleSlotFill = (emoji: string) => {
    const firstEmpty = slots.findIndex(s => s === null);
    if (firstEmpty === -1) return;
    const next = [...slots]; next[firstEmpty] = emoji;
    playTone(firstEmpty);
    setSlots(next); setResult(null);
  };

  const checkPattern = useCallback(() => {
    const filled = slots.filter(Boolean) as string[];
    if (filled.length < 4) { speakText('Keep going! Fill more slots!'); return; }
    const isPattern = ([2, 3, 4] as const).some(period => {
      if (filled.length < period * 2) return false;
      for (let i = period; i < filled.length; i++) {
        if (filled[i] !== filled[i % period]) return false;
      }
      return true;
    });
    if (isPattern) {
      setResult('pattern'); setShowConfetti(true);
      speakText('Amazing! That IS a pattern! Great job!');
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setResult('no-pattern');
      speakText('Not quite a pattern yet! Try using the same items again and again!');
    }
  }, [slots]);

  return (
    <div className="flex flex-col items-center gap-5">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />}
      <div className="flex items-center gap-2">
        <p className="text-xl font-black text-purple-700 dark:text-purple-300">MAKE YOUR PATTERN!</p>
        <button onClick={() => speakText('Make your own pattern! Tap the shapes to fill the slots.')} className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-100 text-sm">🔊</button>
      </div>
      <div className="flex flex-wrap gap-2 justify-center bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg w-full max-w-sm">
        {slots.map((s, i) => (
          <motion.div key={i}
            animate={s ? {} : { borderColor: ['#c4b5fd','#7c3aed','#c4b5fd'] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            className={`w-12 h-12 rounded-xl border-4 flex items-center justify-center text-2xl
              ${s ? 'bg-purple-50 dark:bg-slate-700 border-purple-400' : 'border-dashed border-purple-200 bg-purple-50/50 dark:bg-slate-700/50'}`}
          >{s ? <ShapeDisplay item={s} /> : ''}</motion.div>
        ))}
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        {OPTIONS.map(emoji => (
          <motion.button key={emoji} whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.15 }}
            onClick={() => handleSlotFill(emoji)}
            className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-lg text-3xl flex items-center justify-center cursor-pointer">
            <ShapeDisplay item={emoji} size="lg" />
          </motion.button>
        ))}
      </div>
      {result && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className={`text-xl font-black text-center px-6 py-3 rounded-2xl ${result === 'pattern' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
          {result === 'pattern' ? "⭐ YES! That's a pattern! ⭐" : '🤔 Almost! Try again!'}
        </motion.div>
      )}
      <div className="flex gap-3">
        <motion.button whileTap={{ scale: 0.92 }} onClick={checkPattern}
          className="bg-purple-500 text-white font-black text-lg py-3 px-6 rounded-xl shadow">
          CHECK IT! 🔍
        </motion.button>
        <motion.button whileTap={{ scale: 0.92 }} onClick={() => { setSlots(Array(SLOT_COUNT).fill(null)); setResult(null); }}
          className="bg-white dark:bg-slate-700 text-purple-500 dark:text-purple-400 font-black text-lg py-3 px-6 rounded-xl shadow border-2 border-purple-200">
          RESET 🔄
        </motion.button>
      </div>
    </div>
  );
}

// ── Drill label ────────────────────────────────────────────────────
const DRILL_LABELS: Record<DrillType, { label: string; emoji: string; prompt: string }> = {
  NEXT:           { label: 'WHAT COMES NEXT?',    emoji: '➡️', prompt: 'What comes next?' },
  MISSING_MIDDLE: { label: "WHAT'S MISSING?",     emoji: '❓', prompt: "What is missing in the middle?" },
  FIND_MISTAKE:   { label: 'FIND THE MISTAKE!',   emoji: '🔍', prompt: 'Find the one that does not belong!' },
  COUNT:          { label: 'COUNT IT!',            emoji: '🔢', prompt: 'Count how many you see!' },
};

// ── Main ───────────────────────────────────────────────────────────
type TabMode = 'QUIZ' | 'CREATE';

export default function PatternsTab() {
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [tabMode, setTabMode] = useState<TabMode>('QUIZ');
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const spokenRef = useRef(false);

  const pool = PATTERN_QUESTIONS.filter(q => q.difficulty === difficulty);
  const question = pool[qIndex % pool.length];
  const drillInfo = DRILL_LABELS[question.drillType];

  useEffect(() => {
    spokenRef.current = false;
    const t = setTimeout(() => {
      if (!spokenRef.current) {
        speakText(drillInfo.prompt);
        spokenRef.current = true;
      }
    }, 600);
    return () => clearTimeout(t);
  }, [qIndex, difficulty, drillInfo.prompt]);

  const handleCorrect = () => {
    setScore(s => s + 1);
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setQIndex(i => i + 1); }, 1800);
  };
  const handleWrong = () => setQIndex(i => i);

  const diffConfig: Record<Difficulty, { label: string; bg: string }> = {
    EASY:   { label: '🌱 EASY',   bg: 'bg-green-500' },
    MEDIUM: { label: '⭐ MEDIUM', bg: 'bg-yellow-500' },
    HARD:   { label: '🔥 HARD',   bg: 'bg-red-500' },
    EXPERT: { label: '💡 EXPERT', bg: 'bg-purple-600' },
    MASTER: { label: '🏆 MASTER', bg: 'bg-gray-800' },
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-8 items-center">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      {/* Mode toggle */}
      <div className="flex gap-2 w-full max-w-sm">
        {(['QUIZ', 'CREATE'] as TabMode[]).map(m => (
          <motion.button key={m} whileTap={{ scale: 0.92 }}
            onClick={() => { setTabMode(m); speakText(m === 'QUIZ' ? 'Quiz time!' : 'Create your own pattern!'); }}
            className={`flex-1 py-3 rounded-xl font-black text-base shadow transition-all
              ${tabMode === m ? 'bg-purple-500 text-white scale-105' : 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400'}`}>
            {m === 'QUIZ' ? '🎯 QUIZ' : '🎨 CREATE'}
          </motion.button>
        ))}
      </div>

      {tabMode === 'CREATE' ? <MakeYourOwnMode /> : (
        <>
          {/* Difficulty */}
          <div className="grid grid-cols-5 gap-1 w-full max-w-sm">
            {(['EASY', 'MEDIUM', 'HARD', 'EXPERT', 'MASTER'] as Difficulty[]).map(d => (
              <motion.button key={d} whileTap={{ scale: 0.92 }}
                onClick={() => { setDifficulty(d); setQIndex(0); speakText(d.toLowerCase() + ' level!'); }}
                className={`py-1.5 rounded-xl font-black text-xs shadow transition-all
                  ${difficulty === d ? `${diffConfig[d].bg} text-white scale-105` : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                {diffConfig[d].label}
              </motion.button>
            ))}
          </div>

          {/* Score + counter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl px-5 py-2 shadow">
              <span className="text-2xl">⭐</span>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-300">{score}</span>
            </div>
            <p className="text-purple-400 dark:text-purple-400 font-black text-sm">
              Q {(qIndex % pool.length) + 1}/{pool.length}
            </p>
          </div>

          {/* Drill type banner */}
          <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 rounded-2xl px-5 py-2 shadow-sm w-full max-w-sm justify-center">
            <span className="text-xl">{drillInfo.emoji}</span>
            <span className="text-purple-700 dark:text-purple-300 font-black text-base">{drillInfo.label}</span>
            <button onClick={() => speakText(drillInfo.prompt)} className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-200 text-sm ml-1">🔊</button>
          </div>

          {/* Drill content — slides in per question */}
          <AnimatePresence mode="wait">
            <motion.div key={`${difficulty}-${qIndex}`}
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
              className="w-full max-w-lg">
              {question.drillType === 'FIND_MISTAKE' ? (
                <FindMistakeDrill question={question} onCorrect={handleCorrect} onWrong={handleWrong} />
              ) : question.drillType === 'COUNT' ? (
                <CountDrill question={question} onCorrect={handleCorrect} onWrong={handleWrong} />
              ) : (
                <QuizDrill question={question} onCorrect={handleCorrect} onWrong={handleWrong} />
              )}
            </motion.div>
          </AnimatePresence>

          <motion.button whileTap={{ scale: 0.92 }}
            onClick={() => setQIndex(i => i + 1)}
            className="text-purple-400 dark:text-purple-400 font-black text-sm underline mt-1">
            SKIP THIS ONE →
          </motion.button>
        </>
      )}
    </div>
  );
}
