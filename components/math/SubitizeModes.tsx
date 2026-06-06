'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { OBJECT_EMOJIS, NUMBER_BONDS_TO_5, NUMBER_BONDS_TO_10,
         DICE_POSITIONS, SUBITIZE_CONFIGS, type NumberBond } from "@/lib/math-data";
import { speakText, speakNumber, speakEncouragement } from "@/lib/speech";
const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

// ── Shared helpers ──────────────────────────────────────────────────

const CONFETTI_STYLE = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  zIndex: 9999,
  pointerEvents: "none" as const,
};

const CIRCLE_COLORS = [
  "bg-orange-400",
  "bg-sky-400",
  "bg-green-400",
  "bg-purple-400",
  "bg-pink-400",
];

// Deterministic linear-congruential shuffle so layouts never jump on re-render.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  let state = (seed * 31 + 17) & 0xffffffff;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Three options around the correct count: [correct, correct-1, correct+1].
function buildOptions(correct: number, seed: number): number[] {
  const lower = Math.max(1, correct - 1);
  const upper = Math.min(10, correct + 1);
  const set = Array.from(new Set([correct, lower, upper]));
  // Pad to 3 if clamping collapsed an option.
  let pad = 1;
  while (set.length < 3) {
    const cand = Math.min(10, Math.max(1, correct + pad));
    if (!set.includes(cand)) set.push(cand);
    pad = pad > 0 ? -pad : -pad + 1;
  }
  return seededShuffle(set.slice(0, 3), seed);
}

// ── QuickLookMode ───────────────────────────────────────────────────

type QuickPhase = "ready" | "flash" | "answer";

function flashDurationFor(level: number): number {
  if (level >= 5) return 750;
  if (level >= 3) return 1000;
  return 1500;
}

export function QuickLookMode() {
  const [phase, setPhase] = useState<QuickPhase>("ready");
  const [configIndex, setConfigIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Difficulty: advance one config every 3 correct in a row.
  const flashConfig = SUBITIZE_CONFIGS[configIndex];
  const correct = flashConfig.count;
  const options = useMemo(() => buildOptions(correct, score), [correct, score]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const after = useCallback((ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const startFlash = useCallback(() => {
    setLastCorrect(null);
    setPhase("flash");
    speakText("Watch and count!");
    after(flashDurationFor(flashConfig.level), () => setPhase("answer"));
  }, [after, flashConfig.level]);

  const nextRound = useCallback((advance: boolean) => {
    setShowConfetti(false);
    setConfirming(false);
    setLastCorrect(null);
    if (advance) {
      setConfigIndex((i) => Math.min(SUBITIZE_CONFIGS.length - 1, i + 1));
    }
    setPhase("ready");
  }, []);

  const onPick = useCallback((value: number) => {
    if (phase !== "answer" || confirming) return;
    if (value === correct) {
      setLastCorrect(true);
      setScore((s) => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const advance = newStreak % 3 === 0 &&
        configIndex < SUBITIZE_CONFIGS.length - 1;
      // Flash objects again for 800ms as confirmation.
      setConfirming(true);
      setPhase("flash");
      after(800, () => nextRound(advance));
    } else {
      setLastCorrect(false);
      setStreak(0);
      speakText("Let us count together!");
      setConfirming(true);
      setPhase("flash");
      after(1500, () => nextRound(false));
    }
  }, [phase, confirming, correct, streak, configIndex, after, nextRound]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {showConfetti && (
        <ReactConfetti recycle={false} numberOfPieces={180} style={CONFETTI_STYLE} />
      )}

      <div className="text-2xl font-black text-orange-700 dark:text-orange-400">
        ⭐ {score}
      </div>

      {phase === "ready" && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
            Watch and count!
          </p>
          <button
            onClick={startFlash}
            className="min-h-[56px] px-10 py-6 bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 rounded-2xl shadow-lg font-black text-3xl active:scale-95 transition-transform"
          >
            READY? 👀
          </button>
        </div>
      )}

      {phase === "flash" && (
        <FlashPanel config={flashConfig} correct={correct} score={score} />
      )}

      {phase === "answer" && (
        <div className="flex flex-col items-center gap-5 w-full">
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100 text-center">
            How many did you see? 🤔
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            {options.map((opt) => {
              const isCorrect = lastCorrect !== null && opt === correct;
              const isWrong = lastCorrect === false && opt !== correct;
              const state = isCorrect
                ? "bg-green-400 text-white"
                : isWrong
                ? "bg-red-300 text-white"
                : "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400";
              return (
                <button
                  key={opt}
                  onClick={() => onPick(opt)}
                  className={`min-w-[56px] min-h-[56px] w-20 h-20 rounded-2xl shadow-lg font-black text-3xl active:scale-95 transition-all ${state}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// The dark flash panel that renders objects in one of four layouts.
function FlashPanel({
  config,
  correct,
  score,
}: {
  config: (typeof SUBITIZE_CONFIGS)[number];
  correct: number;
  score: number;
}) {
  // Render `correct` objects positioned per the layout.
  const dots = Array.from({ length: correct }, (_, i) => i);

  return (
    <div className="bg-slate-800 rounded-2xl h-52 w-full relative overflow-hidden shadow-lg">
      {config.layout === "random" &&
        dots.map((i) => {
          const xPct = ((i * 137 + correct * 31 + score * 17) % 80) + 10;
          const yPct = ((i * 97 + correct * 43 + score * 11) % 60) + 10;
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`absolute w-10 h-10 rounded-full ${CIRCLE_COLORS[i % CIRCLE_COLORS.length]}`}
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}

      {config.layout === "dice" &&
        (DICE_POSITIONS[correct] ?? []).map(([xPct, yPct], i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`absolute w-10 h-10 rounded-full ${CIRCLE_COLORS[i % CIRCLE_COLORS.length]}`}
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

      {config.layout === "frame" && <TenFrame filled={correct} />}

      {config.layout === "rekenrek" && <Rekenrek filled={correct} />}
    </div>
  );
}

// 2-row × 5-col ten-frame, fills from the left.
function TenFrame({ filled }: { filled: number }) {
  const cells = Array.from({ length: 10 }, (_, i) => i < filled);
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="grid grid-cols-5 grid-rows-2 gap-2 p-3 bg-slate-700/40 rounded-xl">
        {cells.map((isFilled, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-md border-2 border-slate-500 flex items-center justify-center"
          >
            {isFilled ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="w-7 h-7 rounded-full bg-orange-400"
              />
            ) : (
              <div className="w-7 h-7 rounded-full border-2 border-slate-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Two rows of 5; first row fills orange, second row overflow.
function Rekenrek({ filled }: { filled: number }) {
  const row1 = Math.min(5, filled);
  const row2 = Math.max(0, filled - 5);
  const renderRow = (count: number, rowKey: number) => (
    <div className="flex gap-2">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="w-9 h-9 flex items-center justify-center">
          {i < count ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (rowKey * 5 + i) * 0.03 }}
              className="w-8 h-8 rounded-full bg-orange-400"
            />
          ) : (
            <div className="w-8 h-8 rounded-full border-2 border-slate-500" />
          )}
        </div>
      ))}
    </div>
  );
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      {renderRow(row1, 0)}
      {renderRow(row2, 1)}
    </div>
  );
}

// ── BuildMeMode ─────────────────────────────────────────────────────

type BuildPhase = "prompt" | "filling" | "done";
const CHARACTERS = ["🐱", "🐰", "🐻", "🦊"];

export function BuildMeMode() {
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [phase, setPhase] = useState<BuildPhase>("filling");
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [overflowKey, setOverflowKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Round-derived values are pure functions of `round` — no effect needed.
  const character = CHARACTERS[round % CHARACTERS.length];
  const emoji = OBJECT_EMOJIS[round % OBJECT_EMOJIS.length];
  const target = ((round * 13 + 5) % 7) + 2; // 2..8

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  // Announce the new round (side-effect only, no setState).
  useEffect(() => {
    speakText(`Please give me ${target} ${emoji}!`);
  }, [round, target, emoji]);

  const onTapSource = useCallback(() => {
    if (phase !== "filling") return;
    if (placed >= target) {
      // Overflow: bounce the last attempt back.
      setOverflowKey((k) => k + 1);
      speakText("The bowl is full!");
      return;
    }
    const newPlaced = placed + 1;
    setPlaced(newPlaced);
    if (newPlaced === target) {
      setPhase("done");
      setScore((s) => s + 1);
      setShowConfetti(true);
      speakText(`Perfect! That is ${target}!`);
      const id = setTimeout(() => {
        setShowConfetti(false);
        setPlaced(0);
        setPhase("filling");
        setRound((r) => r + 1);
      }, 2000);
      timers.current.push(id);
    }
  }, [phase, placed, target]);

  const ghosts = Array.from({ length: target }, (_, i) => i);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      {showConfetti && (
        <ReactConfetti recycle={false} numberOfPieces={180} style={CONFETTI_STYLE} />
      )}

      <div className="text-2xl font-black text-orange-700 dark:text-orange-400">
        ⭐ {score}
      </div>

      {/* Character + speech bubble */}
      <div className="flex items-center gap-3">
        <div className="text-6xl">{character}</div>
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg px-5 py-3">
          <p className="text-lg font-black text-slate-800 dark:text-slate-100">
            Please give me {target} {emoji}!
          </p>
        </div>
      </div>

      {/* Bowl with ghost slots */}
      <motion.div
        animate={
          phase === "done" ? { scale: [1, 1.05, 1] } : { scale: 1 }
        }
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 w-full flex flex-wrap items-center justify-center gap-3 min-h-[140px] border-4 ${
          phase === "done"
            ? "ring-4 ring-green-400 border-green-300"
            : "border-slate-200 dark:border-slate-700"
        }`}
      >
        <span className="absolute -mt-24 text-3xl opacity-50 pointer-events-none">
          🪣
        </span>
        {ghosts.map((i) => {
          const isFilled = i < placed;
          return (
            <div
              key={i}
              className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center"
            >
              <AnimatePresence>
                {isFilled && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-3xl"
                  >
                    {emoji}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>

      {/* Source row: 10 tappable items */}
      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.button
            key={`${overflowKey}-${i}`}
            onClick={onTapSource}
            disabled={phase === "done"}
            animate={
              i === 0 && phase === "filling" && placed >= target
                ? { x: [0, 12, -12, 0] }
                : { x: 0 }
            }
            className="min-w-[56px] min-h-[56px] w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl shadow-lg text-3xl flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── CountMode ───────────────────────────────────────────────────────

interface CountObject {
  id: number;
  x: number; // percent
  y: number; // percent
  emoji: string;
  counted: boolean;
}

// Deterministic, non-overlapping positions seeded from total+score.
function generateCountObjects(total: number, score: number, emoji: string): CountObject[] {
  let state = ((total * 31 + score * 17) & 0x7fffffff) || 1;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  const objs: CountObject[] = [];
  let guard = 0;
  while (objs.length < total && guard < 2000) {
    guard++;
    const x = 5 + next() * 80; // 5..85
    const y = 5 + next() * 70; // 5..75
    const tooClose = objs.some(
      (o) => Math.abs(o.x - x) < 15 && Math.abs(o.y - y) < 15
    );
    if (tooClose) continue;
    objs.push({ id: objs.length, x, y, emoji, counted: false });
  }
  return objs;
}

export function CountMode() {
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Round-derived: total + emoji are pure functions of `round`.
  const total = ((round * 7 + 3) % 8) + 2; // 2..9
  const emoji = OBJECT_EMOJIS[round % OBJECT_EMOJIS.length];

  // `counted` ids are the only real per-round mutable state.
  const [countedIds, setCountedIds] = useState<Set<number>>(() => new Set());

  // Object positions are deterministic from total+round; counted overlaid.
  const baseObjects = useMemo(
    () => generateCountObjects(total, round, emoji),
    [total, round, emoji]
  );
  const objects = useMemo(
    () => baseObjects.map((o) => ({ ...o, counted: countedIds.has(o.id) })),
    [baseObjects, countedIds]
  );

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => () => clearTimers(), [clearTimers]);

  // Announce the new round (side-effect only, no setState).
  useEffect(() => {
    speakText(`Count the ${emoji}s!`);
  }, [round, emoji]);

  const countedSoFar = objects.filter((o) => o.counted).length;
  const allCounted = total > 0 && countedSoFar === total;

  const options = useMemo(() => buildOptions(total, score), [total, score]);

  const onTapObject = useCallback((id: number) => {
    setCountedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      speakNumber(next.size);
      return next;
    });
  }, []);

  const onPick = useCallback((value: number) => {
    if (!allCounted || answered) return;
    setSelected(value);
    if (value === total) {
      setFeedback(true);
      setAnswered(true);
      setScore((s) => s + 1);
      setShowConfetti(true);
      speakEncouragement(true);
      const id = setTimeout(() => {
        setShowConfetti(false);
        setAnswered(false);
        setSelected(null);
        setFeedback(null);
        setCountedIds(new Set());
        setRound((r) => r + 1);
      }, 1600);
      timers.current.push(id);
    } else {
      setFeedback(false);
      speakEncouragement(false);
      // Uncount objects, let them try again.
      const id = setTimeout(() => {
        setCountedIds(new Set());
        setSelected(null);
        setFeedback(null);
      }, 900);
      timers.current.push(id);
    }
  }, [allCounted, answered, total]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      {showConfetti && (
        <ReactConfetti recycle={false} numberOfPieces={180} style={CONFETTI_STYLE} />
      )}

      <div className="flex items-center gap-6">
        <div className="text-2xl font-black text-orange-700 dark:text-orange-400">
          ⭐ {score}
        </div>
        <div className="text-2xl font-black text-slate-700 dark:text-slate-200">
          🔢 {countedSoFar}
        </div>
      </div>

      {/* Play area */}
      <div className="relative h-56 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
        {objects.map((o) => (
          <motion.button
            key={o.id}
            onClick={() => onTapObject(o.id)}
            animate={o.counted ? { scale: 1.25 } : { scale: 1 }}
            className={`absolute min-w-[56px] min-h-[56px] w-12 h-12 flex items-center justify-center text-4xl rounded-full ${
              o.counted ? "ring-4 ring-orange-400 ring-offset-2" : ""
            }`}
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
            }}
          >
            {o.emoji}
          </motion.button>
        ))}
      </div>

      {/* Answer prompt */}
      {allCounted && (
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
            How many? 🤔
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            {options.map((opt) => {
              const isThis = selected === opt;
              const state =
                isThis && feedback === true
                  ? "bg-green-400 text-white"
                  : isThis && feedback === false
                  ? "bg-red-300 text-white"
                  : "bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400";
              return (
                <button
                  key={opt}
                  onClick={() => onPick(opt)}
                  disabled={answered}
                  className={`min-w-[56px] min-h-[56px] w-20 h-20 rounded-2xl shadow-lg font-black text-3xl active:scale-95 transition-all ${state}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
