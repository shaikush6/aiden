'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { speakText } from '@/lib/speech';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

interface ConstellationDef { name: string; emoji: string; stars: { x: number; y: number }[] }

const CONSTELLATIONS: ConstellationDef[] = [
  { name: 'ROCKET', emoji: '🚀', stars: [{ x: 50, y: 85 }, { x: 50, y: 65 }, { x: 50, y: 45 }, { x: 50, y: 25 }, { x: 35, y: 38 }, { x: 65, y: 38 }] },
  { name: 'BIG DIPPER', emoji: '🥄', stars: [{ x: 15, y: 72 }, { x: 27, y: 65 }, { x: 38, y: 68 }, { x: 50, y: 63 }, { x: 62, y: 48 }, { x: 73, y: 36 }, { x: 82, y: 26 }] },
  { name: 'ASTRONAUT', emoji: '👨‍🚀', stars: [{ x: 50, y: 14 }, { x: 50, y: 30 }, { x: 36, y: 42 }, { x: 64, y: 42 }, { x: 50, y: 55 }, { x: 38, y: 72 }, { x: 62, y: 72 }] },
  { name: 'FISH', emoji: '🐟', stars: [{ x: 20, y: 50 }, { x: 35, y: 38 }, { x: 52, y: 44 }, { x: 68, y: 38 }, { x: 82, y: 50 }, { x: 68, y: 62 }, { x: 52, y: 56 }, { x: 35, y: 62 }] },
  { name: 'HEART', emoji: '❤️', stars: [{ x: 50, y: 72 }, { x: 28, y: 44 }, { x: 16, y: 28 }, { x: 35, y: 16 }, { x: 50, y: 32 }, { x: 65, y: 16 }, { x: 84, y: 28 }, { x: 72, y: 44 }] },
];

// Decorative background twinkle stars (not tappable). Hardcoded so they stay stable across renders.
const BG_STARS: { x: number; y: number; big: boolean; twinkle: boolean; dur: number }[] = [
  { x: 8, y: 12, big: false, twinkle: true, dur: 2.4 }, { x: 18, y: 22, big: false, twinkle: false, dur: 3 },
  { x: 30, y: 8, big: true, twinkle: true, dur: 3.2 }, { x: 44, y: 18, big: false, twinkle: false, dur: 2 },
  { x: 58, y: 6, big: false, twinkle: true, dur: 2.8 }, { x: 70, y: 14, big: false, twinkle: false, dur: 3.6 },
  { x: 84, y: 9, big: true, twinkle: true, dur: 2.2 }, { x: 92, y: 20, big: false, twinkle: false, dur: 3.4 },
  { x: 6, y: 40, big: false, twinkle: true, dur: 2.6 }, { x: 14, y: 55, big: false, twinkle: false, dur: 3.8 },
  { x: 24, y: 48, big: true, twinkle: true, dur: 2.1 }, { x: 40, y: 60, big: false, twinkle: false, dur: 3.1 },
  { x: 56, y: 52, big: false, twinkle: true, dur: 2.9 }, { x: 66, y: 70, big: false, twinkle: false, dur: 2.3 },
  { x: 78, y: 58, big: true, twinkle: true, dur: 3.3 }, { x: 90, y: 48, big: false, twinkle: false, dur: 2.7 },
  { x: 4, y: 78, big: false, twinkle: true, dur: 3.7 }, { x: 16, y: 90, big: false, twinkle: false, dur: 2.5 },
  { x: 28, y: 82, big: true, twinkle: true, dur: 3.9 }, { x: 42, y: 92, big: false, twinkle: false, dur: 2 },
  { x: 54, y: 86, big: false, twinkle: true, dur: 3 }, { x: 64, y: 94, big: false, twinkle: false, dur: 2.8 },
  { x: 76, y: 88, big: true, twinkle: true, dur: 2.4 }, { x: 88, y: 80, big: false, twinkle: false, dur: 3.5 },
  { x: 96, y: 64, big: false, twinkle: true, dur: 2.2 }, { x: 2, y: 28, big: false, twinkle: false, dur: 3.2 },
  { x: 36, y: 34, big: false, twinkle: true, dur: 2.6 }, { x: 48, y: 42, big: false, twinkle: false, dur: 3.6 },
  { x: 60, y: 30, big: false, twinkle: true, dur: 2.1 }, { x: 82, y: 38, big: false, twinkle: false, dur: 3.4 },
];

export default function ConstellationGame({ onBack }: { onBack: () => void }) {
  const [constIdx, setConstIdx] = useState(0);
  const [nextTap, setNextTap] = useState(0); // index of the next star to tap
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const constellation = CONSTELLATIONS[constIdx];
  const stars = constellation.stars;

  // Capture viewport size for confetti once it mounts.
  const sizeConfetti = useCallback((el: HTMLDivElement | null) => {
    if (el) setDims({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  // Idle hint timer: lives in a closure, cleaned up on every reset so no timer leaks.
  // We track the active timeout id outside React state to avoid extra renders.
  const armHintTimer = useCallback(() => {
    let id: ReturnType<typeof setTimeout> | null = null;
    setShowHint(false);
    id = setTimeout(() => setShowHint(true), 5000);
    return () => { if (id) { clearTimeout(id); id = null; } };
  }, []);

  // Single mutable holder for the current hint cleanup, kept in state to survive renders.
  const [hintCleanup, setHintCleanup] = useState<(() => void) | null>(() => armHintTimer());

  const resetHint = useCallback(() => {
    if (hintCleanup) hintCleanup();
    setHintCleanup(() => armHintTimer());
  }, [hintCleanup, armHintTimer]);

  const handleStarTap = useCallback((idx: number) => {
    if (completed) return;
    if (idx === nextTap) {
      const next = nextTap + 1;
      setNextTap(next);
      resetHint();
      if (next === stars.length) {
        // Constellation complete.
        if (hintCleanup) hintCleanup();
        setShowHint(false);
        setCompleted(true);
        setShowConfetti(true);
        setScore((s) => s + 1);
        speakText('You connected the ' + constellation.name + ' constellation!');
        const advance = setTimeout(() => {
          setShowConfetti(false);
          setCompleted(false);
          setNextTap(0);
          setConstIdx((i) => (i + 1) % CONSTELLATIONS.length);
          setHintCleanup(() => armHintTimer());
        }, 2500);
        // Store cleanup so unmount-during-celebration clears the timer.
        setHintCleanup(() => () => clearTimeout(advance));
      }
    } else {
      setWrongFlash(true);
      resetHint();
      const id = setTimeout(() => setWrongFlash(false), 400);
      // Best-effort cleanup is handled by the short lifespan; no lingering reference.
      void id;
    }
  }, [completed, nextTap, stars.length, constellation.name, resetHint, hintCleanup, armHintTimer]);

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto p-4">
      {showConfetti && (
        <ReactConfetti width={dims.w || 400} height={dims.h || 600} recycle={false} numberOfPieces={250} />
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-black text-sm active:scale-95 transition-transform"
        >
          ← Back
        </button>
        <div className="text-center">
          <div className="text-white font-black text-lg leading-none">
            {constellation.emoji} {constellation.name}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-yellow-300 font-black text-sm">
          ⭐ {score}
        </div>
      </div>

      {/* PROGRESS DOTS */}
      <div className="flex items-center justify-center gap-2">
        {CONSTELLATIONS.map((_, i) => (
          <div
            key={i}
            className={
              'w-2.5 h-2.5 rounded-full transition-colors ' +
              (i === constIdx ? 'bg-white' : 'bg-indigo-800')
            }
          />
        ))}
      </div>

      {/* CANVAS */}
      <div
        ref={sizeConfetti}
        className="relative w-full h-72 bg-slate-950 rounded-2xl overflow-hidden select-none"
      >
        {/* Background twinkling stars */}
        {BG_STARS.map((s, i) =>
          s.twinkle ? (
            <motion.div
              key={i}
              className={(s.big ? 'w-1 h-1' : 'w-0.5 h-0.5') + ' absolute rounded-full bg-white'}
              style={{ left: s.x + '%', top: s.y + '%' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <div
              key={i}
              className={(s.big ? 'w-1 h-1' : 'w-0.5 h-0.5') + ' absolute rounded-full bg-white/40'}
              style={{ left: s.x + '%', top: s.y + '%' }}
            />
          )
        )}

        {/* SVG line overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {stars.slice(0, Math.max(0, nextTap - 1)).map((_, i) => {
            const a = stars[i];
            const b = stars[i + 1];
            return (
              <motion.line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#fbbf24"
                strokeWidth={completed ? 2.6 : 2}
                strokeLinecap="round"
                opacity={completed ? 1 : 0.9}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </svg>

        {/* Tappable constellation stars */}
        {stars.map((star, starIdx) => {
          const isTapped = starIdx < nextTap;
          const isNext = starIdx === nextTap && !completed;
          const hinting = isNext && showHint;
          return (
            <button
              key={starIdx}
              onClick={() => handleStarTap(starIdx)}
              className="absolute w-8 h-8 flex items-center justify-center"
              style={{ left: star.x + '%', top: star.y + '%', transform: 'translate(-50%, -50%)' }}
              aria-label={'Star ' + (starIdx + 1)}
            >
              <motion.span
                className={
                  'block w-5 h-5 rounded-full ' +
                  (isTapped
                    ? 'bg-yellow-300'
                    : isNext
                    ? 'bg-yellow-200'
                    : 'bg-yellow-100/60') +
                  (hinting ? ' ring-4 ring-yellow-400' : '')
                }
                style={
                  isTapped
                    ? { boxShadow: '0 0 8px #fbbf24' }
                    : undefined
                }
                animate={isNext ? { scale: [1, hinting ? 1.45 : 1.3, 1] } : { scale: 1 }}
                transition={isNext ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              />
              {/* Number badge */}
              <span className="absolute -top-2 -right-2 text-[9px] bg-slate-800 text-yellow-400 rounded-full w-4 h-4 flex items-center justify-center font-black">
                {starIdx + 1}
              </span>
            </button>
          );
        })}

        {/* Completion overlay */}
        <AnimatePresence>
          {completed && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-white font-black text-3xl text-center drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-5xl">{constellation.emoji}</div>
                {constellation.name}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BELOW CANVAS */}
      <div className="h-8 flex items-center justify-center text-center">
        {wrongFlash ? (
          <motion.p
            key="wrong"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-red-400 font-black"
          >
            Wrong star! Try {nextTap + 1}! 🌟
          </motion.p>
        ) : nextTap === 0 && !completed ? (
          <p className="text-indigo-200 font-black">TAP THE STARS IN ORDER! ✨</p>
        ) : null}
      </div>
    </div>
  );
}
