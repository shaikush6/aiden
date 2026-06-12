'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { speakText } from '@/lib/speech';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

interface Asteroid {
  id: number;
  num: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  exploding: boolean;
  wobbling: boolean;
}

const TOTAL_ROUNDS = 10;
const ASTEROID_COUNT = 7;

function getRangeForRound(round: number): [number, number] {
  if (round <= 3) return [1, 5];
  if (round <= 7) return [1, 7];
  return [1, 9];
}

function randInt(lo: number, hi: number) {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function buildAsteroids(target: number, round: number, idStart: number): Asteroid[] {
  const [lo, hi] = getRangeForRound(round);
  const targets = Math.min(3, Math.max(2, randInt(2, 3)));
  const nums: number[] = Array.from({ length: targets }, () => target);
  while (nums.length < ASTEROID_COUNT) {
    let n = randInt(lo, hi);
    while (n === target) n = randInt(lo, hi);
    nums.push(n);
  }
  nums.sort(() => Math.random() - 0.5);
  return nums.map((num, i) => ({
    id: idStart + i,
    num,
    x: 15 + Math.random() * 70,
    y: 10 + Math.random() * 75,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.1,
    exploding: false,
    wobbling: false,
  }));
}

const STAR_DOTS = Array.from({ length: 30 }, (_, i) => ({
  left: `${(i * 37) % 97}%`,
  top: `${(i * 53) % 93}%`,
}));

export default function RocketCount({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(1);
  const [score, setScore] = useState(0);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winSize, setWinSize] = useState({ width: 0, height: 0 });

  const idRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const remainingRef = useRef(0);
  const roundRef = useRef(1);
  const targetRef = useRef(1);
  const scoreRef = useRef(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => setWinSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const startLoop = useCallback(() => {
    const tick = () => {
      asteroidsRef.current = asteroidsRef.current.map((a) => {
        if (a.exploding) return a;
        let nx = a.x + a.vx;
        let ny = a.y + a.vy;
        let nvx = a.vx;
        let nvy = a.vy;
        if (nx < 5 || nx > 95) { nvx = -nvx; nx = Math.max(5, Math.min(95, nx)); }
        if (ny < 5 || ny > 90) { nvy = -nvy; ny = Math.max(5, Math.min(90, ny)); }
        return { ...a, x: nx, y: ny, vx: nvx, vy: nvy };
      });
      setAsteroids([...asteroidsRef.current]);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const setupRound = useCallback((r: number) => {
    const [lo, hi] = getRangeForRound(r);
    const t = randInt(lo, hi);
    const id = idRef.current;
    const asts = buildAsteroids(t, r, id);
    idRef.current += ASTEROID_COUNT;
    const rem = asts.filter((a) => a.num === t).length;
    targetRef.current = t;
    roundRef.current = r;
    remainingRef.current = rem;
    asteroidsRef.current = asts;
    setTarget(t);
    setRound(r);
    setRemaining(rem);
    setAsteroids([...asts]);
    speakText(`Tap all the ${t}s!`);
  }, []);

  const startGame = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    scoreRef.current = 0;
    setScore(0);
    setShowConfetti(false);
    setPhase('playing');
    setupRound(1);
    startLoop();
  }, [setupRound, startLoop]);

  const advanceRound = useCallback(() => {
    const next = roundRef.current + 1;
    if (next > TOTAL_ROUNDS) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      setPhase('done');
      setShowConfetti(true);
      speakText(`Amazing! You scored ${scoreRef.current} out of ${TOTAL_ROUNDS}!`);
    } else {
      setupRound(next);
    }
  }, [setupRound]);

  const handleTap = useCallback((id: number) => {
    const ast = asteroidsRef.current.find((a) => a.id === id);
    if (!ast || ast.exploding || ast.wobbling) return;
    if (ast.num === targetRef.current) {
      asteroidsRef.current = asteroidsRef.current.map((a) =>
        a.id === id ? { ...a, exploding: true } : a
      );
      setAsteroids([...asteroidsRef.current]);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      remainingRef.current -= 1;
      setRemaining(remainingRef.current);
      if (remainingRef.current <= 0) {
        advanceTimerRef.current = setTimeout(advanceRound, 800);
      }
    } else {
      asteroidsRef.current = asteroidsRef.current.map((a) =>
        a.id === id ? { ...a, wobbling: true } : a
      );
      setAsteroids([...asteroidsRef.current]);
      setTimeout(() => {
        asteroidsRef.current = asteroidsRef.current.map((a) =>
          a.id === id ? { ...a, wobbling: false } : a
        );
        setAsteroids([...asteroidsRef.current]);
      }, 500);
    }
  }, [advanceRound]);

  const heroMsg = score >= 8 ? 'SPACE GENIUS! 🌟' : score >= 5 ? 'GREAT JOB! 🚀' : 'KEEP PRACTICING! 💪';

  return (
    <div className="bg-slate-950 rounded-2xl text-white overflow-hidden">
      {showConfetti && winSize.width > 0 && (
        <ReactConfetti width={winSize.width} height={winSize.height} recycle={false} numberOfPieces={280} />
      )}

      {phase === 'ready' && (
        <div className="flex flex-col items-center gap-6 p-8">
          <motion.div
            className="text-8xl"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🪨
          </motion.div>
          <h1 className="text-4xl font-black text-white text-center">ROCKET COUNT!</h1>
          <p className="text-indigo-300 text-center text-lg">
            A voice will say a number. Tap all the asteroids with that number!
          </p>
          <div className="flex gap-2 text-2xl">🔢 10 rounds 🪨 7 asteroids each</div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="bg-purple-600 hover:bg-purple-500 text-white text-2xl font-black py-5 px-10 rounded-2xl shadow-xl"
          >
            LAUNCH! 🚀
          </motion.button>
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">
            ← Back
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <div>
          {/* HUD */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <button onClick={onBack} className="text-indigo-300 text-sm font-bold">
              ← BACK
            </button>
            <div className="flex flex-col items-center">
              <span className="text-xs text-indigo-400 font-bold">ROUND {round}/{TOTAL_ROUNDS}</span>
              <span className="text-indigo-300 text-sm font-black">Find all the <span className="text-yellow-300 text-xl">{target}</span>s!</span>
            </div>
            <div className="text-white font-black text-lg">⭐ {score}</div>
          </div>

          {/* Play field */}
          <div className="relative mx-2 mb-3" style={{ height: 340 }}>
            {/* Stars */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl bg-slate-900 overflow-hidden">
              {STAR_DOTS.map((s, i) => (
                <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-50" style={s} />
              ))}
            </div>

            <AnimatePresence>
              {asteroids.map((ast) =>
                ast.exploding ? (
                  <motion.div
                    key={ast.id}
                    className="absolute pointer-events-none"
                    style={{ left: `${ast.x}%`, top: `${ast.y}%` }}
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-3xl -translate-x-1/2 -translate-y-1/2">💥</div>
                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                      <motion.div
                        key={deg}
                        className="absolute w-2 h-2 bg-yellow-300 rounded-full -translate-x-1/2 -translate-y-1/2"
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{
                          x: Math.cos((deg * Math.PI) / 180) * 28,
                          y: Math.sin((deg * Math.PI) / 180) * 28,
                          opacity: 0,
                        }}
                        transition={{ duration: 0.45 }}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.button
                    key={ast.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-600 border-2 border-slate-400 flex items-center justify-center font-black text-2xl text-white shadow-lg select-none"
                    style={{ left: `${ast.x}%`, top: `${ast.y}%` }}
                    animate={ast.wobbling ? { x: [-6, 6, -6, 6, 0] } : { x: 0 }}
                    transition={ast.wobbling ? { duration: 0.4 } : { duration: 0.15 }}
                    onClick={() => handleTap(ast.id)}
                    whileTap={{ scale: 0.85 }}
                  >
                    {ast.num}
                  </motion.button>
                )
              )}
            </AnimatePresence>
          </div>

          <div className="text-center pb-3 text-indigo-400 text-sm font-bold">
            {remaining > 0 ? `${remaining} more to find!` : 'Found them all!'}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-col items-center gap-6 p-8">
          <div className="text-7xl">🏆</div>
          <p className="text-2xl font-black text-white text-center">
            You scored {score} / {TOTAL_ROUNDS}!
          </p>
          <p className="text-3xl font-black text-yellow-300 text-center">{heroMsg}</p>
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xl font-black py-4 px-8 rounded-2xl shadow-xl"
            >
              PLAY AGAIN
            </motion.button>
            <button
              onClick={onBack}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xl font-black py-4 px-8 rounded-2xl"
            >
              BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
