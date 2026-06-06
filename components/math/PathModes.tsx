'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { OBJECT_EMOJIS, NUMBER_BONDS_TO_5, NUMBER_BONDS_TO_10,
         DICE_POSITIONS, SUBITIZE_CONFIGS, type NumberBond } from "@/lib/math-data";
import { speakText, speakNumber, speakEncouragement } from "@/lib/speech";

const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

// ── NumberLineMode ──────────────────────────────────────────────────
type LineMode = "where" | "jump" | "before_after";

const STONES = Array.from({ length: 11 }, (_, i) => i); // 0-10

export function NumberLineMode() {
  const [frogPos, setFrogPos] = useState(0);
  const [targetPos, setTargetPos] = useState(5);
  const [mode, setMode] = useState<LineMode>("where");
  const [jumpBy, setJumpBy] = useState(2);
  const [beforeAfter, setBeforeAfter] = useState<"before" | "after">("before");
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [wrongStone, setWrongStone] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hopping, setHopping] = useState(false);

  const hopTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The correct stone to tap for the current round.
  const answer = useMemo(() => {
    if (mode === "where") return targetPos;
    if (mode === "jump") return frogPos + jumpBy;
    return beforeAfter === "before" ? targetPos - 1 : targetPos + 1;
  }, [mode, targetPos, frogPos, jumpBy, beforeAfter]);

  const prompt = useMemo(() => {
    if (mode === "where") return `FIND NUMBER ${targetPos}! 🐸`;
    if (mode === "jump") return `JUMP ${jumpBy} STEPS FORWARD! 🐸`;
    return `WHAT COMES ${beforeAfter === "before" ? "BEFORE" : "AFTER"} ${targetPos}?`;
  }, [mode, targetPos, jumpBy, beforeAfter]);

  const spoken = useMemo(() => {
    if (mode === "where") return `Find number ${targetPos}!`;
    if (mode === "jump") return `Jump ${jumpBy} steps forward!`;
    return `What comes ${beforeAfter} ${targetPos}?`;
  }, [mode, targetPos, jumpBy, beforeAfter]);

  const clearTimers = useCallback(() => {
    hopTimers.current.forEach(clearTimeout);
    hopTimers.current = [];
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
  }, []);

  const generateNew = useCallback(() => {
    const modes: LineMode[] = ["where", "jump", "before_after"];
    const nextMode = modes[Math.floor(Math.random() * modes.length)];
    setMode(nextMode);
    setSelected(null);
    setFeedback(null);
    setWrongStone(null);
    setHopping(false);

    if (nextMode === "where") {
      const t = Math.floor(Math.random() * 11);
      setTargetPos(t);
      setFrogPos(0);
    } else if (nextMode === "jump") {
      const by = Math.floor(Math.random() * 4) + 1; // 1-4
      const from = Math.floor(Math.random() * (11 - by)); // landing stays 0-10
      setJumpBy(by);
      setFrogPos(from);
      setTargetPos(from + by);
    } else {
      // before_after: target where both target±1 considerations stay valid
      const ba: "before" | "after" = Math.random() > 0.5 ? "before" : "after";
      // ensure answer in 0-10
      const t = ba === "before"
        ? Math.floor(Math.random() * 10) + 1   // 1-10 → before is 0-9
        : Math.floor(Math.random() * 10);      // 0-9  → after is 1-10
      setBeforeAfter(ba);
      setTargetPos(t);
      setFrogPos(0);
    }
  }, []);

  // Speak prompt whenever a new round is set up.
  useEffect(() => {
    speakText(spoken);
  }, [spoken]);

  // Cleanup on unmount.
  useEffect(() => () => clearTimers(), [clearTimers]);

  const animateHops = useCallback((from: number, to: number, after: () => void) => {
    setHopping(true);
    const step = to >= from ? 1 : -1;
    const total = Math.abs(to - from);
    let i = 0;
    const hop = () => {
      i += 1;
      setFrogPos(from + step * i);
      if (i < total) {
        hopTimers.current.push(setTimeout(hop, 300));
      } else {
        setHopping(false);
        after();
      }
    };
    if (total === 0) { setHopping(false); after(); return; }
    hopTimers.current.push(setTimeout(hop, 300));
  }, []);

  const handleTap = (n: number) => {
    if (selected !== null || hopping) return;
    setSelected(n);

    if (n === answer) {
      const land = () => {
        setFeedback("correct");
        setScore((s) => s + 1);
        setShowConfetti(true);
        speakEncouragement(true);
        advanceTimer.current = setTimeout(() => {
          setShowConfetti(false);
          generateNew();
        }, 2200);
      };
      // Frog hops to the answer stone (where/before_after start at 0; jump from frogPos).
      animateHops(frogPos, n, land);
    } else {
      setFeedback("wrong");
      setWrongStone(answer);
      speakEncouragement(false);
      advanceTimer.current = setTimeout(() => {
        setSelected(null);
        setFeedback(null);
        setWrongStone(null);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }} />}

      <div className="flex items-center gap-2">
        <p className="text-xl font-black text-orange-700 dark:text-orange-400 text-center">{prompt}</p>
        <button onClick={() => speakText(spoken)} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 text-sm flex-shrink-0">🔊</button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{score}</span>
      </div>

      {/* Row of stones */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg w-full max-w-sm overflow-x-auto">
        <div className="flex gap-2 min-w-max justify-center px-1 py-2">
          {STONES.map((n) => {
            const isFrog = n === frogPos;
            const isTarget =
              feedback !== "correct" &&
              ((mode === "where" && n === targetPos) ||
               (mode === "jump" && n === answer) ||
               (mode === "before_after" && n === targetPos));
            const isAnswerStone = n === answer;
            const showWrongHighlight = wrongStone === n;
            const isCorrectLanded = feedback === "correct" && isAnswerStone;

            return (
              <motion.button
                key={n}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleTap(n)}
                animate={
                  isTarget
                    ? { boxShadow: ["0 0 0px #f97316", "0 0 14px #f97316", "0 0 0px #f97316"] }
                    : showWrongHighlight
                    ? { boxShadow: ["0 0 0px #22c55e", "0 0 16px #22c55e", "0 0 0px #22c55e"] }
                    : {}
                }
                transition={isTarget ? { duration: 1.2, repeat: Infinity } : { duration: 0.6, repeat: 2 }}
                className={`relative w-12 h-12 min-w-[48px] rounded-full font-black text-base flex items-center justify-center flex-shrink-0 transition-colors border-4
                  ${isFrog || isCorrectLanded ? "bg-green-400 text-white border-green-300" :
                    isTarget ? "border-orange-300 bg-orange-50 dark:bg-slate-700 text-orange-600 dark:text-orange-400" :
                    "border-transparent bg-orange-50 dark:bg-slate-700 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-slate-600"}
                `}
              >
                {isFrog && (
                  <motion.span
                    key={`frog-${frogPos}`}
                    initial={{ y: -14, scale: 0.8 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 12 }}
                    className="absolute -top-6 text-2xl leading-none pointer-events-none"
                  >
                    🐸
                  </motion.span>
                )}
                <span>{n}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === "correct" ? "text-green-500 dark:text-green-400" : "text-red-400 dark:text-red-400"}`}>
          {feedback === "correct" ? "⭐ YES! ⭐" : "💪 TRY AGAIN!"}
        </motion.p>
      )}
    </div>
  );
}

// ── OneMoreMode ─────────────────────────────────────────────────────
type Machine = "+1" | "-1";
type Phase = "show" | "through" | "answer";

export function OneMoreMode() {
  const [inputCount, setInputCount] = useState(3);
  const [machineType, setMachineType] = useState<Machine>("+1");
  const [phase, setPhase] = useState<Phase>("show");
  const [score, setScore] = useState(0);
  const [emoji, setEmoji] = useState("🟦");
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const throughTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const answer = machineType === "+1" ? inputCount + 1 : inputCount - 1;

  const options = useMemo(() => {
    const opts = machineType === "+1"
      ? [inputCount, inputCount + 1, inputCount + 2]
      : [inputCount - 2, inputCount - 1, inputCount];
    return opts;
  }, [inputCount, machineType]);

  const clearTimers = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (throughTimer.current) clearTimeout(throughTimer.current);
    advanceTimer.current = null;
    throughTimer.current = null;
  }, []);

  const generateNew = useCallback((nextMachine: Machine) => {
    // +1: input 1-9 → answer up to 10. -1: input 2-9 → answer >= 1, options stay >= 0.
    const count = nextMachine === "+1"
      ? Math.floor(Math.random() * 9) + 1   // 1-9
      : Math.floor(Math.random() * 8) + 2;  // 2-9
    setMachineType(nextMachine);
    setInputCount(count);
    setEmoji(OBJECT_EMOJIS[Math.floor(Math.random() * OBJECT_EMOJIS.length)]);
    setPhase("show");
    setSelected(null);
    setFeedback(null);
  }, []);

  useEffect(() => {
    const label = machineType === "+1" ? "One more!" : "One less!";
    speakText(`${label} Send them through the machine!`);
  }, [inputCount, machineType]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleGo = () => {
    if (phase !== "show") return;
    setPhase("through");
    throughTimer.current = setTimeout(() => setPhase("answer"), 1100);
  };

  const handleSelect = (n: number) => {
    if (selected !== null || phase !== "answer") return;
    setSelected(n);

    if (n === answer) {
      setFeedback("correct");
      setScore((s) => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      speakText(machineType === "+1" ? `One more makes ${answer}!` : `One less leaves ${answer}!`);
      const nextMachine: Machine = machineType === "+1" ? "-1" : "+1";
      advanceTimer.current = setTimeout(() => {
        setShowConfetti(false);
        generateNew(nextMachine);
      }, 2500);
    } else {
      setFeedback("wrong");
      speakEncouragement(false);
      advanceTimer.current = setTimeout(() => {
        setSelected(null);
        setFeedback(null);
      }, 1500);
    }
  };

  const badge = machineType === "+1" ? "+1 MORE!" : "-1 LESS!";

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={180} style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }} />}

      <div className="flex items-center gap-2">
        <p className="text-2xl font-black text-orange-700 dark:text-orange-400">{machineType === "+1" ? "ONE MORE! ⚙️" : "ONE LESS! ⚙️"}</p>
        <button onClick={() => speakText(machineType === "+1" ? "One more!" : "One less!")} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 text-sm">🔊</button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{score}</span>
      </div>

      {/* Machine + conveyor */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between gap-2">
          {/* Left: input objects */}
          <div className="flex flex-col items-center gap-1 w-20 flex-shrink-0">
            <div className="flex flex-wrap gap-1 justify-center items-center min-h-[64px] w-full">
              <AnimatePresence>
                {phase === "show" && Array.from({ length: inputCount }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-2xl"
                  >
                    {emoji}
                  </motion.span>
                ))}
                {phase === "through" && Array.from({ length: inputCount }).map((_, i) => (
                  <motion.span
                    key={`thru-${i}`}
                    initial={{ x: 0, opacity: 1 }}
                    animate={{ x: 90, opacity: 0 }}
                    transition={{ duration: 0.9, delay: i * 0.06, ease: "easeIn" }}
                    className="text-2xl absolute"
                  >
                    {emoji}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <span className="text-xl font-black text-orange-600 dark:text-orange-400">{inputCount}</span>
          </div>

          {/* Machine block */}
          <motion.div
            animate={phase === "through" ? { rotate: [0, -3, 3, -3, 0] } : {}}
            transition={{ duration: 0.4, repeat: phase === "through" ? 2 : 0 }}
            className="flex flex-col items-center justify-center gap-1 bg-slate-700 dark:bg-slate-900 rounded-2xl px-3 py-4 shadow-inner flex-shrink-0 border-4 border-slate-500"
          >
            <span className="text-2xl">⚙️</span>
            <span className={`text-sm font-black px-2 py-1 rounded-lg ${machineType === "+1" ? "bg-green-400 text-white" : "bg-rose-400 text-white"}`}>
              {badge}
            </span>
          </motion.div>

          {/* Right: output */}
          <div className="flex flex-col items-center gap-1 w-20 flex-shrink-0">
            <div className="flex flex-wrap gap-1 justify-center items-center min-h-[64px] w-full">
              {phase === "answer" && feedback !== "correct" && (
                <span className="text-4xl font-black text-orange-300">?</span>
              )}
              {feedback === "correct" && Array.from({ length: answer }).map((_, i) => (
                <motion.span
                  key={`out-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-2xl"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            {feedback === "correct" && (
              <span className="text-xl font-black text-green-500 dark:text-green-400">{answer}</span>
            )}
          </div>
        </div>

        {/* Conveyor belt line */}
        <div className="mt-3 h-2 rounded-full bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600" />
      </div>

      {/* GO button or question */}
      {phase === "show" && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.06 }}
          onClick={handleGo}
          className="bg-orange-500 text-white rounded-2xl shadow-lg font-black text-2xl px-8 min-h-[56px]"
        >
          GO! ▶
        </motion.button>
      )}

      {phase === "through" && (
        <p className="text-xl font-black text-orange-400 min-h-[56px] flex items-center">…</p>
      )}

      {phase === "answer" && (
        <>
          <div className="flex items-center gap-2">
            <p className="text-xl font-black text-orange-700 dark:text-orange-400">HOW MANY CAME OUT? 🤔</p>
            <button onClick={() => speakText("How many came out?")} className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20 text-sm">🔊</button>
          </div>
          <div className="flex gap-4">
            {options.map((opt) => (
              <motion.button
                key={opt}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleSelect(opt)}
                animate={
                  selected === opt && feedback === "correct" ? { scale: [1, 1.3, 1] } :
                  selected === opt && feedback === "wrong" ? { x: [0, -8, 8, -8, 0] } : {}
                }
                className={`w-20 h-20 min-h-[56px] min-w-[56px] rounded-2xl text-3xl font-black shadow-lg transition-colors
                  ${selected === opt && feedback === "correct" ? "bg-green-400 text-white" :
                    selected === opt && feedback === "wrong" ? "bg-red-300 text-white" :
                    "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-600"}
                `}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </>
      )}

      {feedback && (
        <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-2xl font-black ${feedback === "correct" ? "text-green-500 dark:text-green-400" : "text-red-400 dark:text-red-400"}`}>
          {feedback === "correct" ? "⭐ YES! ⭐" : "💪 TRY AGAIN!"}
        </motion.p>
      )}
    </div>
  );
}
