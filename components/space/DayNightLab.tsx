'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { speakText } from '@/lib/speech';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type Side = 'day' | 'night';

const CHALLENGES = [
  { prompt: 'Make it NIGHT TIME for the city! 🌙', targetSide: 'night' as Side, zone: 'city', icon: '🌆' },
  { prompt: 'Wake up the FARM! Give it sunshine! 🌞', targetSide: 'day' as Side, zone: 'farm', icon: '🌾' },
  { prompt: 'Put the children to SLEEP! 💤', targetSide: 'night' as Side, zone: 'house', icon: '🏠' },
  { prompt: 'Make the STARS appear in the sky! ✨', targetSide: 'night' as Side, zone: 'sky', icon: '⭐' },
  { prompt: 'Let the SUNFLOWER face the Sun! 🌻', targetSide: 'day' as Side, zone: 'flower', icon: '🌻' },
];

const EARTH_ITEMS = [
  { zone: 'city', angle: 0, dayVersion: '🌆', nightVersion: '🌃' },
  { zone: 'farm', angle: 60, dayVersion: '🌾', nightVersion: '🌿' },
  { zone: 'house', angle: 120, dayVersion: '🏠', nightVersion: '🌙' },
  { zone: 'sky', angle: 180, dayVersion: '☀️', nightVersion: '⭐' },
  { zone: 'flower', angle: 270, dayVersion: '🌻', nightVersion: '🌸' },
];

const ZONE_ANGLES: Record<string, number> = {
  city: 0,
  farm: 45,
  house: 90,
  sky: 135,
  flower: 270,
};

const EARTH_RADIUS = 88; // px (half of w-44 = 176px)

function normalize(deg: number) {
  return ((deg % 360) + 360) % 360;
}

function isDayForZone(zoneName: string, currentAngle: number) {
  const effective = normalize(currentAngle + (ZONE_ANGLES[zoneName] ?? 0));
  return effective < 180; // first 180 = day (facing sun on right)
}

export default function DayNightLab({ onBack }: { onBack: () => void }) {
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [solved, setSolved] = useState(0);
  const [phase, setPhase] = useState<'free' | 'challenge'>('free');
  const [showConfetti, setShowConfetti] = useState(false);
  const [challengeSolved, setChallengeSolved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [winSize, setWinSize] = useState({ width: 0, height: 0 });

  const lastPointerX = useRef(0);
  const draggingRef = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Window size for confetti
  useEffect(() => {
    const update = () =>
      setWinSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Global pointer move/up for drag-to-spin
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientX - lastPointerX.current;
      lastPointerX.current = e.clientX;
      setAngle((a) => a + delta * 0.6);
    };
    const onUp = () => {
      draggingRef.current = false;
      setDragging(false);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // Clean up any pending advance timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  // Watch for challenge solved
  useEffect(() => {
    if (phase !== 'challenge' || challengeSolved || completed) return;
    const challenge = CHALLENGES[challengeIdx];
    if (!challenge) return;
    const matches =
      isDayForZone(challenge.zone, angle) === (challenge.targetSide === 'day');
    if (matches) {
      setChallengeSolved(true);
      speakText('You did it!');
      setSolved((s) => s + 1);
      advanceTimer.current = setTimeout(() => {
        setChallengeSolved(false);
        const next = challengeIdx + 1;
        if (next >= CHALLENGES.length) {
          setCompleted(true);
          setShowConfetti(true);
          speakText('You are a space scientist! Amazing!');
        } else {
          setChallengeIdx(next);
          speakText(CHALLENGES[next].prompt.replace(/[^\w !?']/g, ''));
        }
      }, 1500);
    }
  }, [angle, phase, challengeIdx, challengeSolved, completed]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    setDragging(true);
    lastPointerX.current = e.clientX;
  }, []);

  const spin = useCallback((dir: number) => {
    setAngle((a) => a + dir * 30);
  }, []);

  const startChallenges = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setPhase('challenge');
    setChallengeIdx(0);
    setSolved(0);
    setChallengeSolved(false);
    setCompleted(false);
    setShowConfetti(false);
    speakText(CHALLENGES[0].prompt.replace(/[^\w !?']/g, ''));
  }, []);

  const startFree = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setPhase('free');
    setChallengeSolved(false);
    setCompleted(false);
    setShowConfetti(false);
  }, []);

  const replay = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setChallengeIdx(0);
    setSolved(0);
    setChallengeSolved(false);
    setCompleted(false);
    setShowConfetti(false);
    speakText(CHALLENGES[0].prompt.replace(/[^\w !?']/g, ''));
  }, []);

  const challenge = CHALLENGES[challengeIdx];

  return (
    <div className="bg-slate-950 rounded-2xl p-4 text-white">
      {showConfetti && winSize.width > 0 && (
        <ReactConfetti
          width={winSize.width}
          height={winSize.height}
          recycle={false}
          numberOfPieces={250}
        />
      )}

      {/* TOP ROW: back + mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm font-bold text-indigo-300">
          ← BACK
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={startFree}
            className={`text-xs font-black px-3 py-1.5 rounded-full ${
              phase === 'free'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-indigo-300'
            }`}
          >
            FREE SPIN 🌍
          </button>
          <button
            onClick={startChallenges}
            className={`text-xs font-black px-3 py-1.5 rounded-full ${
              phase === 'challenge'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-indigo-300'
            }`}
          >
            CHALLENGES 🎯
          </button>
        </div>
      </div>

      {/* Subtitle / challenge card */}
      {phase === 'free' ? (
        <div className="text-center text-indigo-300 text-sm mb-2">
          Spin the Earth freely! 🌍
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={challengeIdx}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-slate-800/90 rounded-2xl p-3 mb-2 text-center"
          >
            <div className="text-2xl mb-1">{challenge?.icon}</div>
            <div className="font-black text-base">{challenge?.prompt}</div>
            <div className="text-indigo-300 text-xs mt-1 font-bold">
              {solved} / {CHALLENGES.length} solved
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* SCENE */}
      <div className="relative h-80 flex items-center overflow-hidden rounded-2xl bg-slate-950">
        {/* Background stars */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[
            { left: '10%', top: '14%' },
            { left: '20%', top: '70%' },
            { left: '32%', top: '30%' },
            { left: '15%', top: '50%' },
            { left: '28%', top: '88%' },
            { left: '6%', top: '34%' },
            { left: '40%', top: '12%' },
            { left: '24%', top: '20%' },
          ].map((s, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{ left: s.left, top: s.top }}
            />
          ))}
        </div>

        {/* SUN (fixed, right) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <div
            className="w-20 h-20 rounded-full bg-yellow-400"
            style={{ boxShadow: '0 0 30px #fbbf24, 0 0 60px #f59e0b60' }}
          />
        </div>

        {/* EARTH */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            onPointerDown={handlePointerDown}
            className={`w-44 h-44 rounded-full relative select-none touch-none ${
              dragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ touchAction: 'none' }}
          >
            {/* Rotating Earth surface */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                transform: `rotate(${angle}deg)`,
                background:
                  'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0ea5e9 50%, #16a34a 100%)',
                boxShadow:
                  'inset -12px 0 24px rgba(0,0,0,0.4), 0 0 16px rgba(14,165,233,0.3)',
              }}
            >
              {/* Continent patches (decorative) */}
              <div className="absolute top-6 right-8 w-8 h-6 bg-green-700/70 rounded-full" />
              <div className="absolute bottom-10 right-6 w-10 h-5 bg-green-800/70 rounded-full" />
            </div>

            {/* EMOJI ITEMS on Earth surface */}
            {EARTH_ITEMS.map((item) => {
              const itemAngleRad =
                ((item.angle + angle) * Math.PI) / 180;
              const x = Math.cos(itemAngleRad) * (EARTH_RADIUS * 0.7);
              const y = Math.sin(itemAngleRad) * (EARTH_RADIUS * 0.7);
              const effective = normalize(item.angle + angle);
              const isDay = effective < 180;
              return (
                <div
                  key={item.zone}
                  className="absolute left-1/2 top-1/2 z-30 pointer-events-none"
                  style={{
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  }}
                >
                  <div
                    className="text-2xl"
                    style={{ transform: `rotate(0deg)` }}
                  >
                    {isDay ? item.dayVersion : item.nightVersion}
                  </div>
                </div>
              );
            })}
          </div>

          {/* MOON orbiting Earth */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
            style={{ width: EARTH_RADIUS * 2 + 56, height: EARTH_RADIUS * 2 + 56 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="absolute"
              style={{ top: 0, left: '50%', transform: 'translateX(-50%) translateY(-50%)' }}
            >
              <div
                className="w-6 h-6 bg-gray-300 rounded-full"
                style={{ boxShadow: '0 0 10px rgba(255,255,255,0.4)' }}
              />
            </div>
          </motion.div>
        </div>

        {/* SOLVED flash */}
        <AnimatePresence>
          {challengeSolved && !completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
            >
              <div className="text-5xl font-black text-yellow-300 drop-shadow-lg">
                ✓ YES!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* COMPLETION */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50 gap-2 px-4 text-center"
            >
              <div className="text-6xl">🔬</div>
              <div className="text-3xl font-black text-white">
                SPACE SCIENTIST!
              </div>
              <div className="text-indigo-300">
                You solved every day &amp; night puzzle!
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={replay}
                  className="text-sm font-black px-4 py-2 rounded-full bg-indigo-500 text-white"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={onBack}
                  className="text-sm font-black px-4 py-2 rounded-full bg-slate-800 text-indigo-300"
                >
                  BACK
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTROLS */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="text-indigo-300 text-sm font-bold">
          DRAG THE EARTH TO SPIN IT! ↺
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => spin(-1)}
            className="bg-slate-700 text-white rounded-xl min-w-14 min-h-12 text-2xl font-black active:bg-slate-600"
            aria-label="Spin left"
          >
            ◀
          </button>
          <button
            onClick={() => spin(1)}
            className="bg-slate-700 text-white rounded-xl min-w-14 min-h-12 text-2xl font-black active:bg-slate-600"
            aria-label="Spin right"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
