'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { OBJECT_EMOJIS, NUMBER_BONDS_TO_5, NUMBER_BONDS_TO_10,
         DICE_POSITIONS, SUBITIZE_CONFIGS, type NumberBond } from "@/lib/math-data";
import { speakText, speakNumber, speakEncouragement } from "@/lib/speech";
const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

// ── Shared bits ─────────────────────────────────────────────────────

const CONFETTI_STYLE = { position: 'fixed' as const, top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' as const };

function Confetti({ show }: { show: boolean }) {
  return show ? <ReactConfetti recycle={false} numberOfPieces={180} style={CONFETTI_STYLE} /> : null;
}

function Score({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">⭐</span>
      <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{score}</span>
    </div>
  );
}

function Title({ text, say }: { text: string; say?: string }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-2xl font-black text-orange-700 dark:text-orange-400 text-center">{text}</p>
      <button
        onClick={() => speakText(say ?? text)}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 text-sm shrink-0"
        aria-label="Read aloud"
      >🔊</button>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Reusable answer button with correct/wrong/idle states.
function AnswerButton({
  value, selected, isCorrect, onPick,
}: {
  value: number;
  selected: number | null;
  isCorrect: (n: number) => boolean;
  onPick: (n: number) => void;
}) {
  const picked = selected === value;
  const wrong = picked && !isCorrect(value);
  const right = picked && isCorrect(value);
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onPick(value)}
      animate={right ? { scale: [1, 1.3, 1] } : wrong ? { x: [0, -8, 8, -8, 0] } : {}}
      className={`min-h-[56px] min-w-[56px] px-6 rounded-2xl shadow-lg font-black text-3xl transition-colors ${
        right ? 'bg-green-400 text-white'
        : wrong ? 'bg-red-300 text-white'
        : 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400'
      }`}
    >
      {value}
    </motion.button>
  );
}

// ── 1. NumberBondsMode ──────────────────────────────────────────────

export function NumberBondsMode() {
  const [difficulty, setDifficulty] = useState<"5" | "10">("5");
  const [splitAt, setSplitAt] = useState(0);
  const [confirmedSplits, setConfirmedSplits] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [splitting, setSplitting] = useState(false);
  const total = difficulty === "5" ? 5 : 10;

  const partA = splitAt;
  const partB = total - splitAt;
  const found = confirmedSplits.size;
  const goal = total - 1; // valid splits are 1..total-1
  const allDone = found >= goal;

  const reset = useCallback((d: "5" | "10") => {
    setDifficulty(d);
    setSplitAt(0);
    setConfirmedSplits(new Set());
  }, []);

  useEffect(() => {
    speakText(`Find all the ways to make ${total}!`);
  }, [total]);

  const confirm = useCallback(() => {
    if (splitAt < 1 || splitAt > total - 1) return;
    if (confirmedSplits.has(splitAt)) return;
    const next = new Set(confirmedSplits);
    next.add(splitAt);
    setConfirmedSplits(next);
    setScore(s => s + 1);
    setSplitting(true);
    speakText(`${partA} and ${partB} make ${total}!`);
    setTimeout(() => setSplitting(false), 600);
    if (next.size >= goal) {
      setTimeout(() => speakText(`You found all the ways to make ${total}!`), 700);
    }
  }, [splitAt, total, confirmedSplits, partA, partB, goal]);

  const alreadyConfirmed = confirmedSplits.has(splitAt);
  const validSplit = splitAt >= 1 && splitAt <= total - 1;

  return (
    <div className="flex flex-col items-center gap-6">
      <Confetti show={allDone} />
      <Title text="MAKE THE TRAIN INTO TWO PARTS 🚂" say={`Find all the ways to make ${total}`} />
      <Score score={score} />

      <div className="flex gap-3">
        {(["5", "10"] as const).map(d => (
          <button
            key={d}
            onClick={() => reset(d)}
            className={`min-h-[56px] px-5 rounded-2xl font-black shadow-lg ${
              difficulty === d
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400'
            }`}
          >
            BONDS TO {d}
          </button>
        ))}
      </div>

      <p className="text-xl font-black text-orange-700 dark:text-orange-400">Total: {total}</p>

      {/* Train of cars with tap zones between them */}
      <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
        {Array.from({ length: total }).map((_, i) => {
          const isPartA = i < splitAt;
          return (
            <div key={i} className="flex items-center">
              <motion.div
                animate={splitting ? { x: isPartA ? -8 : 8 } : { x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                className={`w-12 h-12 rounded-xl shadow flex items-center justify-center text-white font-black ${
                  isPartA ? 'bg-sky-400' : 'bg-orange-400'
                }`}
              >
                🚃
              </motion.div>
              {i < total - 1 && (
                <button
                  onClick={() => setSplitAt(i + 1)}
                  aria-label={`Split after car ${i + 1}`}
                  className="h-12 w-4 flex items-center justify-center group"
                >
                  <span className={`w-1 rounded-full transition-all ${
                    splitAt === i + 1 ? 'h-12 bg-orange-600' : 'h-6 bg-transparent group-hover:bg-orange-300'
                  }`} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-10">
        <p className="text-lg font-black text-sky-500">Part A: {partA}</p>
        <p className="text-lg font-black text-orange-500">Part B: {partB}</p>
      </div>

      {/* Part-whole bond tree */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-xl bg-orange-500 text-white flex items-center justify-center text-3xl font-black shadow-lg">
          {total}
        </div>
        <div className="flex gap-12 mt-1 mb-1">
          <span className="text-2xl text-orange-300">╱</span>
          <span className="text-2xl text-orange-300">╲</span>
        </div>
        <div className="flex gap-8">
          <div className="w-14 h-14 rounded-xl bg-sky-400 text-white flex items-center justify-center text-2xl font-black shadow-lg">{partA}</div>
          <div className="w-14 h-14 rounded-xl bg-orange-400 text-white flex items-center justify-center text-2xl font-black shadow-lg">{partB}</div>
        </div>
      </div>

      {/* Dot row */}
      <div className="flex items-center gap-1 flex-wrap justify-center max-w-md">
        {Array.from({ length: partA }).map((_, i) => (
          <span key={`a${i}`} className="w-5 h-5 rounded-full bg-sky-400 inline-block" />
        ))}
        {Array.from({ length: partB }).map((_, i) => (
          <span key={`b${i}`} className="w-5 h-5 rounded-full bg-orange-400 inline-block" />
        ))}
        <span className="mx-2 text-2xl font-black text-orange-600 dark:text-orange-400">=</span>
        {Array.from({ length: total }).map((_, i) => (
          <span key={`t${i}`} className="w-5 h-5 rounded-full bg-orange-400 inline-block" />
        ))}
      </div>

      <button
        onClick={confirm}
        disabled={!validSplit || alreadyConfirmed}
        className={`min-h-[56px] px-8 rounded-2xl font-black shadow-lg text-xl ${
          !validSplit || alreadyConfirmed
            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400'
            : 'bg-green-400 text-white'
        }`}
      >
        {alreadyConfirmed ? 'ALREADY FOUND ✓' : 'CONFIRM THIS SPLIT ✓'}
      </button>

      <p className="text-lg font-black text-orange-700 dark:text-orange-400">
        {found} / {goal} splits found
      </p>

      <AnimatePresence>
        {allDone && (
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-green-500 text-center"
          >
            🎉 You found ALL the ways to make {total}!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 2. HideFindMode ─────────────────────────────────────────────────

export function HideFindMode() {
  const [total, setTotal] = useState(5);
  const [hidden, setHidden] = useState(2);
  const [phase, setPhase] = useState<"show" | "hide" | "ask" | "reveal">("show");
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [round, setRound] = useState(0);
  const [popped, setPopped] = useState(0);

  const emoji = OBJECT_EMOJIS[round % OBJECT_EMOJIS.length];
  const visible = total - hidden;

  const newRound = useCallback(() => {
    const t = Math.floor(Math.random() * 6) + 3; // 3-8
    const base = Math.floor(t / 2);
    let h = base + (Math.random() > 0.5 ? 1 : -1);
    h = Math.max(1, Math.min(t - 1, h));
    setTotal(t);
    setHidden(h);
    setSelected(null);
    setPhase("show");
    setPopped(0);
    setRound(r => r + 1);
  }, []);

  // Pop objects in one-by-one during show.
  useEffect(() => {
    if (phase !== "show") return;
    speakText(`There are ${total} ${emoji}!`);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setPopped(i);
      if (i >= total) clearInterval(id);
    }, 200);
    return () => clearInterval(id);
  }, [phase, total]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "ask") speakText("How many are hiding?");
  }, [phase]);

  const options = useMemo(
    () => shuffle(Array.from(new Set([hidden, Math.max(1, hidden - 1), hidden + 1]))).slice(0, 3),
    [hidden, round] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handlePick = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    setPhase("reveal");
    if (n === hidden) {
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`Right! ${hidden} were hiding! ${visible} plus ${hidden} equals ${total}!`);
      setTimeout(() => { setShowConfetti(false); newRound(); }, 2800);
    } else {
      speakEncouragement(false);
      speakText(`Look! ${hidden} were hiding.`);
      setTimeout(() => { setSelected(null); setPhase("ask"); }, 2200);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Confetti show={showConfetti} />
      <Title text="HIDE & FIND ☕" say="Some are hiding under the cup!" />
      <Score score={score} />

      {phase === "show" && (
        <>
          <p className="text-xl font-black text-orange-700 dark:text-orange-400">There are {total}!</p>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-wrap gap-2 justify-center max-w-md min-h-[100px] items-center">
            {Array.from({ length: total }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: i < popped ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                className="text-4xl"
              >{emoji}</motion.span>
            ))}
          </div>
          <button
            onClick={() => { setPhase("hide"); speakText("Hide some!"); setTimeout(() => setPhase("ask"), 1400); }}
            className="min-h-[56px] px-8 rounded-2xl font-black shadow-lg text-xl bg-orange-500 text-white"
          >
            HIDE SOME! 🫣
          </button>
        </>
      )}

      {(phase === "hide" || phase === "ask" || phase === "reveal") && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-6 max-w-md">
          <div className="flex items-end gap-8">
            {/* Cup with hidden objects */}
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={phase === "reveal" ? { rotate: 35, y: -10 } : { rotate: 0, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                className="text-7xl"
              >☕</motion.div>
              <div className="flex gap-1 mt-1 flex-wrap justify-center max-w-[120px]">
                {Array.from({ length: hidden }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={false}
                    animate={
                      phase === "reveal"
                        ? { y: [0, -40, 0], opacity: 1 }
                        : { opacity: phase === "hide" ? [1, 0] : 0 }
                    }
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    className="text-3xl"
                  >{emoji}</motion.span>
                ))}
              </div>
            </div>

            {/* Visible objects */}
            <div className="flex flex-wrap gap-1 justify-center max-w-[140px]">
              {Array.from({ length: visible }).map((_, i) => (
                <span key={i} className="text-4xl">{emoji}</span>
              ))}
            </div>
          </div>

          {phase === "ask" && (
            <Title text="How many are HIDING? 🤔" say="How many are hiding?" />
          )}

          {phase === "reveal" && selected === hidden && (
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl font-black text-green-500 text-center"
            >
              {visible} + {hidden} = {total}!
            </motion.p>
          )}
        </div>
      )}

      {phase === "ask" && (
        <div className="flex gap-4">
          {options.map(opt => (
            <AnswerButton
              key={opt}
              value={opt}
              selected={selected}
              isCorrect={n => n === hidden}
              onPick={handlePick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 3. BalanceMode ──────────────────────────────────────────────────

function BalancePan({ count, glow }: { count: number; glow: boolean }) {
  return (
    <div className={`flex flex-col-reverse items-center gap-1 p-3 rounded-2xl min-w-[80px] min-h-[80px] justify-end transition-all ${
      glow ? 'bg-amber-200 dark:bg-amber-500/30 ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)]' : 'bg-white/60 dark:bg-slate-700/60'
    }`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded bg-orange-400 shadow"
        />
      ))}
    </div>
  );
}

export function BalanceMode() {
  const [leftCount, setLeftCount] = useState(4);
  const [rightCount, setRightCount] = useState(0);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [balanced, setBalanced] = useState(false);

  const tiltDeg = balanced ? 0 : leftCount > rightCount ? -15 : leftCount < rightCount ? 15 : 0;

  const newRound = useCallback(() => {
    setLeftCount(Math.floor(Math.random() * 7) + 2); // 2-8
    setRightCount(0);
    setBalanced(false);
  }, []);

  useEffect(() => {
    speakText("Make them equal!");
  }, [leftCount]);

  const checkBalance = useCallback((nextRight: number) => {
    if (balanced) return;
    if (nextRight > 0 && nextRight === leftCount) {
      setBalanced(true);
      setScore(s => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(`${leftCount} equals ${nextRight}! Balanced!`);
      setTimeout(() => { setShowConfetti(false); newRound(); }, 2400);
    }
  }, [balanced, leftCount, newRound]);

  const addBlock = () => {
    if (balanced) return;
    setRightCount(c => {
      const next = Math.min(12, c + 1);
      checkBalance(next);
      return next;
    });
  };
  const removeBlock = () => {
    if (balanced) return;
    setRightCount(c => Math.max(0, c - 1));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Confetti show={showConfetti} />
      <Title text="Make them EQUAL! ⚖️" say="Make them equal!" />
      <Score score={score} />

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <motion.div
          animate={{ rotate: tiltDeg }}
          transition={{ type: 'spring', stiffness: 120, damping: 10 }}
          className="flex items-end gap-16 origin-center"
        >
          <BalancePan count={leftCount} glow={balanced} />
          <BalancePan count={rightCount} glow={balanced} />
        </motion.div>
        {/* Beam + fulcrum */}
        <div className="w-64 h-2 bg-slate-400 dark:bg-slate-500 rounded-full -mt-1" />
        <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[32px] border-l-transparent border-r-transparent border-b-slate-500 dark:border-b-slate-400" />
      </div>

      <div className="flex gap-16">
        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{leftCount}</span>
        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{rightCount}</span>
      </div>

      <div className="flex gap-4">
        <button
          onClick={addBlock}
          disabled={balanced}
          className="min-h-[56px] px-6 rounded-2xl font-black shadow-lg text-xl bg-green-400 text-white disabled:opacity-50"
        >
          + BLOCK
        </button>
        <button
          onClick={removeBlock}
          disabled={balanced || rightCount === 0}
          className="min-h-[56px] px-6 rounded-2xl font-black shadow-lg text-xl bg-red-300 text-white disabled:opacity-50"
        >
          – BLOCK
        </button>
      </div>

      <AnimatePresence>
        {balanced && (
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-2xl font-black text-green-500 text-center"
          >
            {leftCount} = {rightCount}! BALANCED!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 4. AddMode ──────────────────────────────────────────────────────

export function AddMode() {
  const [busCount, setBusCount] = useState(2);
  const [waiters, setWaiters] = useState(3);
  const [boarded, setBoarded] = useState(0);
  const [phase, setPhase] = useState<"show" | "boarding" | "answer" | "equation">("show");
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [round, setRound] = useState(0);

  const isSub = round % 2 === 1; // alternate: subtraction variant
  const emoji = OBJECT_EMOJIS[round % OBJECT_EMOJIS.length];

  // For addition: bus starts with busCount, waiters board → total.
  // For subtraction: bus starts full (busCount+waiters), waiters exit → busCount remain.
  const total = busCount + waiters;
  const onBusNow = isSub ? total - boarded : busCount + boarded;
  const answer = isSub ? busCount : total;

  const newRound = useCallback(() => {
    setBusCount(Math.floor(Math.random() * 4) + 1); // 1-4
    setWaiters(Math.floor(Math.random() * 4) + 1);  // 1-4
    setBoarded(0);
    setSelected(null);
    setPhase("show");
    setRound(r => r + 1);
  }, []);

  useEffect(() => {
    if (phase === "show") {
      speakText(isSub ? "People get off at the stop! Tap each one!" : "The people at the stop want to get on! Tap each one!");
    }
    if (phase === "answer") {
      speakText(isSub ? "How many are left on the bus?" : "How many on the bus now?");
    }
  }, [phase, isSub]);

  const tapWaiter = () => {
    if (phase !== "show" && phase !== "boarding") return;
    const next = boarded + 1;
    setBoarded(next);
    setPhase("boarding");
    if (next >= waiters) setTimeout(() => setPhase("answer"), 500);
  };

  const options = useMemo(
    () => shuffle(Array.from(new Set([answer, Math.max(0, answer - 1), answer + 1]))).slice(0, 3),
    [answer, round] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handlePick = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === answer) {
      setPhase("equation");
      setScore(s => s + 1);
      speakEncouragement(true);
      setShowConfetti(true);
      speakText(isSub
        ? `${total} take away ${waiters} equals ${busCount}!`
        : `${busCount} plus ${waiters} equals ${total}!`);
      setTimeout(() => { setShowConfetti(false); newRound(); }, 2800);
    } else {
      speakEncouragement(false);
      setTimeout(() => setSelected(null), 1400);
    }
  };

  // Bus passengers currently shown (in the windows).
  const busPassengers = phase === "show" && isSub ? total : onBusNow;
  const waitersRemaining = waiters - boarded;

  return (
    <div className="flex flex-col items-center gap-6">
      <Confetti show={showConfetti} />
      <Title
        text={isSub ? "People get OFF at the stop! 🚌" : "People get ON the bus! 🚌"}
        say={isSub ? "People get off at the stop!" : "The people at the stop want to get on!"}
      />
      <Score score={score} />

      {/* Bus */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-2">
        <div className="text-6xl">🚌</div>
        <div className="flex flex-wrap gap-1 justify-center max-w-[220px] min-h-[40px]">
          {Array.from({ length: busPassengers }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl"
            >{emoji}</motion.span>
          ))}
        </div>
        <p className="text-sm font-black text-orange-700 dark:text-orange-400">On the bus: {onBusNow}</p>
      </div>

      {/* Bus stop with tappable people (only during show/boarding) */}
      {(phase === "show" || phase === "boarding") && (
        <>
          <div className="text-3xl">🚏</div>
          <div className="flex flex-wrap gap-3 justify-center max-w-md min-h-[60px]">
            <AnimatePresence>
              {Array.from({ length: waitersRemaining }).map((_, i) => (
                <motion.button
                  key={`${round}-${boarded}-${i}`}
                  onClick={tapWaiter}
                  whileTap={{ scale: 0.8 }}
                  exit={{ y: -100, opacity: 0 }}
                  className="text-4xl min-h-[56px] min-w-[56px]"
                >{emoji}</motion.button>
              ))}
            </AnimatePresence>
          </div>
          {boarded > 0 && (
            <p className="text-lg font-black text-orange-700 dark:text-orange-400">
              {isSub ? `${boarded} got off...` : `${boarded} got on...`}
            </p>
          )}
        </>
      )}

      {phase === "answer" && (
        <>
          <Title
            text={isSub ? "How many are LEFT? 🚌" : "How many on the bus NOW? 🚌"}
            say={isSub ? "How many are left?" : "How many on the bus now?"}
          />
          <div className="flex gap-4">
            {options.map(opt => (
              <AnswerButton
                key={opt}
                value={opt}
                selected={selected}
                isCorrect={n => n === answer}
                onPick={handlePick}
              />
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {phase === "equation" && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg px-8 py-4"
          >
            <p className="text-3xl font-black text-orange-600 dark:text-orange-400">
              {isSub
                ? `${total} − ${waiters} = ${busCount}`
                : `${busCount} + ${waiters} = ${total}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 5. MissingMode (bead string) ────────────────────────────────────

export function MissingMode() {
  const [start, setStart] = useState(1);
  const [step, setStep] = useState(1);
  const [gapIdx, setGapIdx] = useState(2);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const LENGTH = 5;
  const sequence = useMemo(
    () => Array.from({ length: LENGTH }, (_, i) => start + i * step),
    [start, step]
  );
  const answer = sequence[gapIdx];

  const options = useMemo(
    () => shuffle(Array.from(new Set([answer, answer + step, Math.max(0, answer - step)]))).slice(0, 3),
    [answer, step]
  );

  const generateNew = useCallback(() => {
    setStart(Math.floor(Math.random() * 10));
    setStep(Math.floor(Math.random() * 3) + 1); // 1,2,3 — no negatives
    setGapIdx(Math.floor(Math.random() * 3) + 1);
    setSelected(null);
    setFeedback(null);
  }, []);

  useEffect(() => {
    const seq = sequence.map((n, i) => i === gapIdx ? 'what' : String(n)).join(', ');
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

  // Bead colors alternate red/blue in groups of 5.
  const beadColor = (n: number) => (Math.floor(n / 5) % 2 === 0 ? 'bg-red-400' : 'bg-blue-400');

  return (
    <div className="flex flex-col items-center gap-6">
      <Confetti show={showConfetti} />
      <Title text="WHAT IS THE MISSING NUMBER? 🔢" say="What is the missing number?" />
      <Score score={score} />

      {/* Bead string */}
      <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
        {/* the string line behind beads */}
        <div className="absolute left-6 right-6 top-1/2 h-1 bg-amber-700/40 rounded-full -translate-y-1/2" />
        {sequence.map((n, i) => {
          const isGap = i === gapIdx;
          const filled = isGap && feedback === 'correct';
          return (
            <div key={i} className="relative z-10 flex items-center">
              {isGap && !filled ? (
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  className="w-14 h-14 rounded-full border-4 border-dashed border-orange-400 flex items-center justify-center text-2xl font-black text-orange-400 bg-orange-50 dark:bg-slate-700"
                >
                  ?
                </motion.div>
              ) : (
                <motion.div
                  initial={filled ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                  className={`w-14 h-14 rounded-full ${beadColor(n)} flex items-center justify-center text-2xl font-black text-white shadow-lg`}
                >
                  {n}
                </motion.div>
              )}
              {i < LENGTH - 1 && (
                <div className="flex flex-col items-center justify-center w-8">
                  {step !== 1 && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full mb-0.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                      +{step}
                    </span>
                  )}
                  <span className="text-lg font-black text-orange-400 leading-none">→</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        {options.map(opt => (
          <AnswerButton
            key={opt}
            value={opt}
            selected={selected}
            isCorrect={n => n === answer}
            onPick={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ── 6. TenFrameMode ─────────────────────────────────────────────────

function TenFrame({
  count, tappable, bounceLast, onTapCell,
}: {
  count: number;
  tappable: boolean;
  bounceLast: boolean;
  onTapCell: (idx: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 grid-rows-2 gap-2 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
      {Array.from({ length: 10 }).map((_, i) => {
        const isFilled = i < count;
        const isLast = i === count - 1;
        return (
          <motion.button
            key={i}
            onClick={() => tappable && onTapCell(i)}
            disabled={!tappable}
            animate={
              bounceLast && isLast ? { y: [0, -8, 0] }
              : isFilled ? { scale: [0, 1] } : { scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
            className={`w-12 h-12 rounded-full ${
              isFilled
                ? 'bg-orange-400'
                : 'bg-white dark:bg-slate-700 border-2 border-dashed border-orange-300'
            }`}
          />
        );
      })}
    </div>
  );
}

export function TenFrameMode() {
  const [target, setTarget] = useState(7);
  const [filled, setFilled] = useState(0);
  const [mode, setMode] = useState<"fill" | "count" | "complement">("fill");
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [bounceLast, setBounceLast] = useState(false);
  const [round, setRound] = useState(0);

  // For complement: frame pre-filled with `target` dots, answer = 10 - target.
  const complementAnswer = 10 - target;

  const newRound = useCallback(() => {
    const modes: ("fill" | "count" | "complement")[] = ["fill", "count", "complement"];
    const nextMode = modes[(round + 1) % 3];
    const t = nextMode === "complement"
      ? Math.floor(Math.random() * 9) + 1   // 1-9 so there's something to complete
      : Math.floor(Math.random() * 10) + 1; // 1-10
    setMode(nextMode);
    setTarget(t);
    setFilled(nextMode === "count" || nextMode === "complement" ? t : 0);
    setSelected(null);
    setRound(r => r + 1);
  }, [round]);

  useEffect(() => {
    if (mode === "fill") speakText(`Fill the frame to make ${target}!`);
    else if (mode === "count") speakText("How many dots?");
    else speakText("How many more to make 10?");
  }, [mode, target]);

  const win = useCallback((msg: string) => {
    setScore(s => s + 1);
    setShowConfetti(true);
    speakEncouragement(true);
    speakText(msg);
    setTimeout(() => { setShowConfetti(false); newRound(); }, 2400);
  }, [newRound]);

  const tapCell = (idx: number) => {
    if (mode !== "fill") return;
    if (filled >= target) {
      setBounceLast(true);
      setTimeout(() => setBounceLast(false), 300);
      return;
    }
    if (idx !== filled) return; // must fill left-to-right, top-to-bottom (next empty)
    const next = filled + 1;
    setFilled(next);
    if (next === target) {
      if (target === 10) {
        win(`That is ${target}! A full ten!`);
      } else {
        win(`That IS ${target}!`);
      }
    }
  };

  const countOptions = useMemo(
    () => shuffle(Array.from(new Set([target, Math.max(0, target - 1), target + 1]))).slice(0, 3),
    [target, round] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const complementOptions = useMemo(
    () => shuffle(Array.from(new Set([complementAnswer, Math.max(0, complementAnswer - 1), complementAnswer + 1]))).slice(0, 3),
    [complementAnswer, round] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const pickCount = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === target) win(`Yes! ${target} dots!`);
    else { speakEncouragement(false); setTimeout(() => setSelected(null), 1400); }
  };
  const pickComplement = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === complementAnswer) win(`Yes! ${target} and ${complementAnswer} make 10!`);
    else { speakEncouragement(false); setTimeout(() => setSelected(null), 1400); }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Confetti show={showConfetti} />
      {mode === "fill" && <Title text={`Fill the frame to make ${target}!`} say={`Fill the frame to make ${target}`} />}
      {mode === "count" && <Title text="How many dots? 🔢" say="How many dots?" />}
      {mode === "complement" && <Title text="How many MORE to make 10? 🔟" say="How many more to make 10?" />}
      <Score score={score} />

      {mode === "fill" && target > 10 ? (
        <div className="flex gap-3">
          <TenFrame count={Math.min(filled, 10)} tappable bounceLast={bounceLast} onTapCell={tapCell} />
          <TenFrame count={Math.max(0, filled - 10)} tappable bounceLast={bounceLast} onTapCell={tapCell} />
        </div>
      ) : mode === "count" || mode === "complement" ? (
        target > 10 ? (
          <div className="flex gap-3">
            <TenFrame count={Math.min(filled, 10)} tappable={false} bounceLast={false} onTapCell={tapCell} />
            <TenFrame count={Math.max(0, filled - 10)} tappable={false} bounceLast={false} onTapCell={tapCell} />
          </div>
        ) : (
          <TenFrame count={filled} tappable={false} bounceLast={false} onTapCell={tapCell} />
        )
      ) : (
        <TenFrame count={filled} tappable bounceLast={bounceLast} onTapCell={tapCell} />
      )}

      {mode === "fill" && (
        <p className="text-xl font-black text-orange-700 dark:text-orange-400">{filled} / {target}</p>
      )}

      {mode === "count" && (
        <div className="flex gap-4">
          {countOptions.map(opt => (
            <AnswerButton key={opt} value={opt} selected={selected} isCorrect={n => n === target} onPick={pickCount} />
          ))}
        </div>
      )}

      {mode === "complement" && (
        <div className="flex gap-4">
          {complementOptions.map(opt => (
            <AnswerButton key={opt} value={opt} selected={selected} isCorrect={n => n === complementAnswer} onPick={pickComplement} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showConfetti && mode === "fill" && target === 10 && (
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1.1 }}
            className="text-3xl font-black text-green-500"
          >
            A FULL TEN! 🎉
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
