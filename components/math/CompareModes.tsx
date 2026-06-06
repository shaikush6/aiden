'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { OBJECT_EMOJIS, NUMBER_BONDS_TO_5, NUMBER_BONDS_TO_10,
         DICE_POSITIONS, SUBITIZE_CONFIGS, type NumberBond } from "@/lib/math-data";
import { speakText, speakNumber, speakEncouragement } from "@/lib/speech";
const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

// ════════════════════════════════════════════════════════════════════
// WhichMoreMode — bridge matching to compare two groups.
// Every 5th round becomes a Conservation variant: equal counts, different
// spacing, teaching that arrangement does not change quantity.
// ════════════════════════════════════════════════════════════════════
export function WhichMoreMode() {
  const [countA, setCountA] = useState(5);
  const [countB, setCountB] = useState(3);
  const [emoji, setEmoji] = useState('🍎');
  // bridges: array of [indexA, indexB] pairs already matched
  const [bridges, setBridges] = useState<[number, number][]>([]);
  // tappingFrom: the currently-selected item on side A waiting for a B partner
  const [tappingFrom, setTappingFrom] = useState<null | { side: 'A'; idx: number }>(null);
  const [answered, setAnswered] = useState<null | 'A' | 'B' | 'SAME'>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  // Every 5th round is the conservation variant (equal counts).
  const isConservationRound = round % 5 === 0;
  const correct: 'A' | 'B' | 'SAME' =
    isConservationRound ? 'SAME' : countA > countB ? 'A' : 'B';

  // Refs to each item DOM node so bridges can be drawn between real positions.
  const itemRefsA = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefsB = useRef<(HTMLDivElement | null)[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);
  // Recomputed line coordinates after layout settles.
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([]);

  const generateNew = useCallback((nextRound: number) => {
    const e = OBJECT_EMOJIS[Math.floor(Math.random() * OBJECT_EMOJIS.length)];
    if (nextRound % 5 === 0) {
      // Conservation variant: same count both sides.
      const n = Math.floor(Math.random() * 5) + 3; // 3-7
      setCountA(n);
      setCountB(n);
    } else {
      const a = Math.floor(Math.random() * 7) + 2; // 2-8
      let b = Math.floor(Math.random() * 7) + 2; // 2-8
      while (a === b) b = Math.floor(Math.random() * 7) + 2;
      setCountA(a);
      setCountB(b);
    }
    setEmoji(e);
    setBridges([]);
    setTappingFrom(null);
    setAnswered(null);
    setFeedback(null);
    setLines([]);
    itemRefsA.current = [];
    itemRefsB.current = [];
  }, []);

  useEffect(() => {
    if (isConservationRound) {
      speakText('Match them up! Are these groups the SAME?');
    } else {
      speakText(`Match the ${emoji} across the bridge. Which group has more?`);
    }
  }, [round, emoji, isConservationRound]);

  // All items on both sides have been bridged or no more pairings possible.
  const exhausted =
    bridges.length === Math.min(countA, countB);

  // Recompute bridge line coordinates whenever bridges change or on resize.
  const recomputeLines = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const bRect = board.getBoundingClientRect();
    const next = bridges.map(([ia, ib]) => {
      const na = itemRefsA.current[ia];
      const nb = itemRefsB.current[ib];
      if (!na || !nb) return null;
      const ra = na.getBoundingClientRect();
      const rb = nb.getBoundingClientRect();
      return {
        x1: ra.right - bRect.left,
        y1: ra.top + ra.height / 2 - bRect.top,
        x2: rb.left - bRect.left,
        y2: rb.top + rb.height / 2 - bRect.top,
      };
    }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[];
    setLines(next);
  }, [bridges]);

  useEffect(() => {
    // Defer to next frame so DOM has painted the new bridge.
    const id = requestAnimationFrame(recomputeLines);
    return () => cancelAnimationFrame(id);
  }, [recomputeLines]);

  useEffect(() => {
    const onResize = () => recomputeLines();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [recomputeLines]);

  const bridgedA = useMemo(() => new Set(bridges.map(b => b[0])), [bridges]);
  const bridgedB = useMemo(() => new Set(bridges.map(b => b[1])), [bridges]);

  const tapItem = (side: 'A' | 'B', idx: number) => {
    if (answered) return;
    if (side === 'A') {
      if (bridgedA.has(idx)) return;
      setTappingFrom({ side: 'A', idx });
    } else {
      if (bridgedB.has(idx)) return;
      if (!tappingFrom) return; // must pick from A first
      setBridges(prev => [...prev, [tappingFrom.idx, idx]]);
      setTappingFrom(null);
    }
  };

  const answer = (choice: 'A' | 'B' | 'SAME') => {
    if (answered) return;
    setAnswered(choice);
    if (choice === correct) {
      setFeedback('correct');
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      if (correct === 'SAME') {
        speakText('Yes! They match up perfectly — the SAME number!');
      } else {
        const more = correct === 'A' ? countA : countB;
        speakText(`Yes! That group has more — ${more}!`);
      }
      setTimeout(() => {
        setShowConfetti(false);
        const next = round + 1;
        setRound(next);
        generateNew(next);
      }, 2400);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => { setAnswered(null); setFeedback(null); }, 1500);
    }
  };

  // Pre-scatter vertical offsets so unbridged items "glow" in a stable spot.
  return (
    <div className="flex flex-col items-center gap-5">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="flex items-center gap-2">
        <p className="text-2xl font-black text-orange-700 dark:text-orange-400 text-center">
          {isConservationRound ? 'ARE THEY THE SAME? 🤔' : 'WHICH HAS MORE? 🌉'}
        </p>
        <button onClick={() => speakText(isConservationRound ? 'Are these groups the same?' : 'Match them up. Which group has more?')} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 text-sm flex-shrink-0">🔊</button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{score}</span>
      </div>

      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 text-center max-w-xs">
        {tappingFrom
          ? 'Now tap one on the RIGHT to build a bridge!'
          : exhausted
            ? 'All matched! Now choose your answer below.'
            : 'Tap one on the LEFT, then its partner on the RIGHT.'}
      </p>

      {/* Two columns with an SVG bridge layer between them */}
      <div ref={boardRef} className="relative flex gap-16 sm:gap-24 bg-white dark:bg-slate-800 rounded-2xl shadow-lg px-6 py-6">
        {/* Bridge lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {lines.map((l, i) => (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={answered === correct && feedback === 'correct' ? '#4ade80' : '#a855f7'}
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Group A */}
        <div className="flex flex-col items-center gap-3 z-10">
          <span className="text-xs font-black text-orange-600 dark:text-orange-400">GROUP A</span>
          {Array.from({ length: countA }).map((_, i) => {
            const isBridged = bridgedA.has(i);
            const isPicked = tappingFrom?.idx === i;
            const isWinnerPulse = feedback === 'correct' && correct === 'A';
            return (
              <motion.div
                key={i}
                ref={el => { itemRefsA.current[i] = el; }}
                onClick={() => tapItem('A', i)}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  opacity: isBridged ? 0.4 : 1,
                  ...(isWinnerPulse ? { scale: [1, 1.2, 1] } : {}),
                }}
                transition={{ delay: i * 0.05, ...(isWinnerPulse ? { repeat: 2, duration: 0.4 } : {}) }}
                className={`min-w-[56px] min-h-[56px] flex items-center justify-center text-4xl rounded-2xl cursor-pointer select-none transition-shadow
                  ${isPicked ? 'ring-4 ring-purple-500' : ''}
                  ${!isBridged && !answered ? 'drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]' : ''}
                `}
              >
                {emoji}
              </motion.div>
            );
          })}
        </div>

        {/* Group B */}
        <div className="flex flex-col items-center gap-3 z-10">
          <span className="text-xs font-black text-orange-600 dark:text-orange-400">GROUP B</span>
          {Array.from({ length: countB }).map((_, i) => {
            const isBridged = bridgedB.has(i);
            const canTap = !!tappingFrom && !isBridged;
            const isWinnerPulse = feedback === 'correct' && correct === 'B';
            return (
              <motion.div
                key={i}
                ref={el => { itemRefsB.current[i] = el; }}
                onClick={() => tapItem('B', i)}
                initial={{ scale: 0 }}
                animate={{
                  scale: 1,
                  opacity: isBridged ? 0.4 : 1,
                  ...(isWinnerPulse ? { scale: [1, 1.2, 1] } : {}),
                }}
                transition={{ delay: i * 0.05, ...(isWinnerPulse ? { repeat: 2, duration: 0.4 } : {}) }}
                className={`min-w-[56px] min-h-[56px] flex items-center justify-center text-4xl rounded-2xl cursor-pointer select-none transition-shadow
                  ${canTap ? 'ring-4 ring-purple-300' : ''}
                  ${!isBridged && !answered ? 'drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]' : ''}
                `}
              >
                {emoji}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Answer buttons appear once matching is exhausted */}
      <AnimatePresence>
        {exhausted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 w-full max-w-xs"
          >
            <p className="text-lg font-black text-orange-700 dark:text-orange-400">
              {isConservationRound ? 'Did they ALL match up?' : 'Which group has MORE?'}
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              {(isConservationRound
                ? ([['SAME', 'SAME! ✅']] as const)
                : ([['A', 'GROUP A'], ['B', 'GROUP B']] as const)
              ).map(([val, lbl]) => {
                const isChosenCorrect = answered === val && val === correct && feedback === 'correct';
                const isChosenWrong = answered === val && feedback === 'wrong';
                return (
                  <motion.button
                    key={val}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => answer(val)}
                    className={`min-h-[56px] px-6 rounded-2xl shadow-lg font-black text-xl transition-colors
                      ${isChosenCorrect ? 'bg-green-400 text-white'
                        : isChosenWrong ? 'bg-red-300 text-white'
                        : 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400'}
                    `}
                  >
                    {lbl}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === 'correct' ? 'text-green-500 dark:text-green-400' : 'text-red-400 dark:text-red-400'}`}>
          {feedback === 'correct'
            ? (isConservationRound ? '⭐ SAME! ⭐' : '⭐ CORRECT! ⭐')
            : '💪 TRY AGAIN!'}
        </motion.p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ConservationMode — count a line of objects, then watch them rearrange.
// Is it STILL the same number? Teaches number conservation.
// ════════════════════════════════════════════════════════════════════
// Build 3 shuffled count options (correct ± 1) for a given count.
function buildOptions(count: number): number[] {
  const opts = [count, count + 1, Math.max(1, count - 1)];
  const uniq = Array.from(new Set(opts));
  while (uniq.length < 3) uniq.push(count + uniq.length);
  return uniq.slice(0, 3).sort(() => Math.random() - 0.5);
}

export function ConservationMode() {
  const [count, setCount] = useState(4);
  const [emoji, setEmoji] = useState('🍎');
  const [phase, setPhase] = useState<'count' | 'rearranged' | 'result'>('count');
  const [layout, setLayout] = useState<'close' | 'spread'>('close');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // During a wrong answer we count out objects one-by-one to prove it.
  const [tickIndex, setTickIndex] = useState(0);
  const [counting, setCounting] = useState(false);

  // Phase-1 answer options: correct ±1, shuffled once per round (in state,
  // not during render — shuffling in render would be impure).
  const [options, setOptions] = useState<number[]>(() => buildOptions(4));

  const newRound = useCallback(() => {
    const n = Math.floor(Math.random() * 5) + 3; // 3-7
    const e = OBJECT_EMOJIS[Math.floor(Math.random() * OBJECT_EMOJIS.length)];
    setCount(n);
    setEmoji(e);
    setOptions(buildOptions(n));
    setPhase('count');
    setLayout('close');
    setFeedback(null);
    setTickIndex(0);
    setCounting(false);
  }, []);

  useEffect(() => {
    if (phase === 'count') {
      speakText('Count them! How many are there?');
    } else if (phase === 'rearranged') {
      speakText(`I moved them around. Is it still ${count}?`);
    }
  }, [phase, count]);

  // Phase 1: count answer.
  const handleCountAnswer = (n: number) => {
    if (feedback) return;
    if (n === count) {
      setFeedback('correct');
      speakEncouragement(true);
      speakText(`Yes! ${count}! Now watch carefully...`);
      setTimeout(() => {
        setFeedback(null);
        setLayout('spread');
        setPhase('rearranged');
      }, 1800);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => setFeedback(null), 1300);
    }
  };

  // Phase 2: still the same? Tick-counting proof on a wrong answer.
  const tickTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { tickTimers.current.forEach(clearTimeout); }, []);

  const handleSameAnswer = (saysSame: boolean) => {
    if (feedback || counting) return;
    if (saysSame) {
      setFeedback('correct');
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText('Right! Moving them does NOT change the number!');
      setTimeout(() => { setShowConfetti(false); newRound(); }, 2600);
    } else {
      // Prove it: count them out one by one, number ticks up.
      setFeedback('wrong');
      setCounting(true);
      setTickIndex(0);
      speakText('Let us check together...');
      tickTimers.current.forEach(clearTimeout);
      tickTimers.current = [];
      for (let i = 0; i < count; i++) {
        tickTimers.current.push(setTimeout(() => {
          setTickIndex(i + 1);
          speakNumber(i + 1);
        }, 300 * (i + 1)));
      }
      tickTimers.current.push(setTimeout(() => {
        speakText(`See? It is STILL ${count}! Moving them did not change it.`);
      }, 300 * (count + 1)));
      tickTimers.current.push(setTimeout(() => {
        setFeedback(null);
        setCounting(false);
        setTickIndex(0);
        newRound();
      }, 300 * (count + 1) + 2400));
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />}

      <div className="flex items-center gap-2">
        <p className="text-2xl font-black text-orange-700 dark:text-orange-400 text-center">
          {phase === 'count' ? 'COUNT THEM! 🔢' : 'STILL THE SAME? 🪄'}
        </p>
        <button onClick={() => speakText(phase === 'count' ? 'Count them! How many?' : `I moved them around. Is it still ${count}?`)} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 text-sm flex-shrink-0">🔊</button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{score}</span>
      </div>

      {/* Object row — animates from close to spread via gap + layout */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg px-6 py-8 w-full max-w-md flex items-center justify-center min-h-[120px]">
        <motion.div
          layout
          className="flex items-center"
          animate={{ gap: layout === 'close' ? 4 : 28 }}
          style={{ gap: layout === 'close' ? 4 : 28 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        >
          {Array.from({ length: count }).map((_, i) => {
            const ticked = counting && i < tickIndex;
            return (
              <motion.span
                key={i}
                layout
                initial={{ scale: 0 }}
                animate={{
                  scale: ticked ? [1, 1.4, 1] : 1,
                }}
                transition={{ delay: phase === 'count' ? i * 0.05 : 0, duration: 0.3 }}
                className={`text-4xl sm:text-5xl ${ticked ? 'drop-shadow-[0_0_10px_rgba(74,222,128,0.9)]' : ''}`}
              >
                {emoji}
              </motion.span>
            );
          })}
        </motion.div>
      </div>

      {/* Live tick-up number when proving conservation on a wrong answer */}
      {counting && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl font-black text-green-500 dark:text-green-400">
          {tickIndex}
        </motion.div>
      )}

      {/* Phase 1: count answer buttons */}
      {phase === 'count' && (
        <div className="flex gap-3">
          {options.map(n => {
            const isCorrect = feedback === 'correct' && n === count;
            const isWrong = feedback === 'wrong' && n !== count;
            return (
              <motion.button
                key={n}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCountAnswer(n)}
                className={`min-w-[56px] min-h-[56px] px-5 rounded-2xl shadow-lg font-black text-3xl transition-colors
                  ${isCorrect ? 'bg-green-400 text-white'
                    : isWrong ? 'bg-red-300 text-white'
                    : 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400'}
                `}
              >
                {n}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Phase 2: still the same? */}
      {phase === 'rearranged' && !counting && (
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
          <p className="text-lg font-black text-orange-700 dark:text-orange-400 text-center">
            I moved them around... Is it STILL {count}?
          </p>
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSameAnswer(true)}
              className={`min-h-[56px] px-6 rounded-2xl shadow-lg font-black text-xl transition-colors
                ${feedback === 'correct' ? 'bg-green-400 text-white' : 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400'}`}
            >
              YES! Same! ✅
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSameAnswer(false)}
              className={`min-h-[56px] px-6 rounded-2xl shadow-lg font-black text-xl transition-colors
                ${feedback === 'wrong' ? 'bg-red-300 text-white' : 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400'}`}
            >
              Changed! 🔄
            </motion.button>
          </div>
        </div>
      )}

      {feedback === 'correct' && phase === 'rearranged' && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl font-black text-green-500 dark:text-green-400 text-center max-w-sm">
          ⭐ Right! Moving them does NOT change the number! ⭐
        </motion.p>
      )}
      {feedback === 'correct' && phase === 'count' && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl font-black text-green-500 dark:text-green-400">
          ⭐ YES! {count}! ⭐
        </motion.p>
      )}
    </div>
  );
}
