'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { speakText } from '@/lib/speech';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type Phase = 'ready' | 'playing' | 'done';
type AsteroidType = 'rocky' | 'icy' | 'metal';
type PowerKind = 'wide' | 'shield' | 'speed';

interface Laser {
  id: number;
  x: number;
  y: number;
  wide: boolean;
}
interface Asteroid {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  type: AsteroidType;
}
interface Powerup {
  id: number;
  x: number;
  y: number;
  kind: PowerKind;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const POWER_EMOJI: Record<PowerKind, string> = {
  wide: '⚡',
  shield: '🛡️',
  speed: '💨',
};

const starStyles = `@keyframes scrollStars { from { transform: translateX(0); } to { transform: translateX(-50%); } }`;

// Hardcoded star positions for one half of a layer (duplicated for seamless loop).
const STAR_SET_1 = [
  [2, 10], [7, 30], [12, 55], [18, 8], [22, 70], [27, 40], [33, 22], [38, 60],
  [42, 12], [46, 48], [3, 80], [9, 90], [15, 35], [20, 18], [25, 62],
  [30, 5], [36, 78], [40, 28], [44, 92], [48, 50],
];
const STAR_SET_2 = [
  [4, 20], [10, 65], [16, 15], [21, 45], [26, 85], [31, 33], [37, 70],
  [41, 5], [45, 58], [6, 38], [13, 88], [19, 25], [24, 52], [29, 72],
  [35, 12], [39, 42], [43, 80], [47, 18], [1, 60], [8, 48],
];
const STAR_SET_3 = [
  [5, 14], [11, 50], [17, 78], [23, 30], [28, 66], [34, 8], [40, 44],
  [2, 92], [14, 22], [20, 88], [26, 16], [32, 54], [38, 36], [44, 70],
  [47, 6], [9, 74], [15, 60], [22, 40], [30, 84], [42, 26],
];

function StarLayer({ stars, duration }: { stars: number[][]; duration: string }) {
  const doubled = [...stars, ...stars.map(([x, y]) => [x + 50, y])];
  return (
    <div
      className="absolute inset-0"
      style={{ width: '200%', animation: `scrollStars ${duration} linear infinite`, willChange: 'transform' }}
    >
      {doubled.map(([x, y], i) => (
        <div
          key={i}
          className="w-0.5 h-0.5 bg-white rounded-full absolute"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </div>
  );
}

export default function LaserBlasterGame({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [rocketY, setRocketY] = useState(40);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [powerup, setPowerup] = useState<Powerup | null>(null);
  const [activePower, setActivePower] = useState<PowerKind | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hitFlash, setHitFlash] = useState(false);
  const [killCount, setKillCount] = useState(0);

  // Refs for the game loop (avoid stale closures).
  const rocketYRef = useRef(40);
  const lasersRef = useRef<Laser[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const powerupRef = useRef<Powerup | null>(null);
  const activePowerRef = useRef<PowerKind | null>(null);
  const killCountRef = useRef(0);
  const firingRef = useRef(false);
  const livesRef = useRef(3);

  const gameLoopRef = useRef<number | null>(null);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const laserTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hitFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const powerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.offsetWidth, h: containerRef.current.offsetHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const clearTimers = useCallback(() => {
    if (gameLoopRef.current != null) cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = null;
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    spawnTimerRef.current = null;
    if (laserTimerRef.current) clearInterval(laserTimerRef.current);
    laserTimerRef.current = null;
    if (hitFlashTimerRef.current) clearTimeout(hitFlashTimerRef.current);
    hitFlashTimerRef.current = null;
    if (powerTimerRef.current) clearTimeout(powerTimerRef.current);
    powerTimerRef.current = null;
  }, []);

  // Cleanup on unmount.
  useEffect(() => clearTimers, [clearTimers]);

  const fireLaser = useCallback(() => {
    lasersRef.current = [
      ...lasersRef.current,
      {
        id: nextId(),
        x: 10,
        y: rocketYRef.current + 3,
        wide: activePowerRef.current === 'wide',
      },
    ];
  }, []);

  const spawnAsteroid = useCallback(() => {
    const kc = killCountRef.current;
    let type: AsteroidType = 'rocky';
    if (kc < 20) {
      type = 'rocky';
    } else if (kc < 50) {
      type = Math.random() < 0.5 ? 'rocky' : 'icy';
    } else {
      const r = Math.random();
      type = r < 0.34 ? 'rocky' : r < 0.67 ? 'icy' : 'metal';
    }
    const hp = type === 'metal' ? 3 : type === 'icy' ? 2 : 1;
    const y = 20 + Math.random() * 50;
    asteroidsRef.current = [
      ...asteroidsRef.current,
      { id: nextId(), x: 105, y, hp, maxHp: hp, type },
    ];
  }, []);

  const spawnPowerup = useCallback((kind: PowerKind) => {
    powerupRef.current = { id: nextId(), x: 105, y: 45, kind };
  }, []);

  const startSpawnLoop = useCallback(() => {
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    let interval = 2000;
    const kc = killCountRef.current;
    if (kc >= 50) interval = 1200;
    else if (kc >= 20) interval = 1500;

    spawnTimerRef.current = setInterval(() => {
      spawnAsteroid();
      // Adjust cadence as waves progress.
      const cur = killCountRef.current;
      const want = cur >= 50 ? 1200 : cur >= 20 ? 1500 : 2000;
      if (want !== interval) {
        interval = want;
        if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
        startSpawnLoop();
      }
    }, interval);
  }, [spawnAsteroid]);

  const gameLoop = useCallback(() => {
    // Move items.
    lasersRef.current = lasersRef.current
      .map((l) => ({ ...l, x: l.x + 7 }))
      .filter((l) => l.x < 108);
    asteroidsRef.current = asteroidsRef.current.map((a) => ({ ...a, x: a.x - 1.8 }));
    if (powerupRef.current) {
      powerupRef.current = { ...powerupRef.current, x: powerupRef.current.x - 0.8 };
    }

    // Collision: lasers vs asteroids.
    const destroyedIds = new Set<number>();
    const hitIds = new Set<number>();
    lasersRef.current = lasersRef.current.filter((laser) => {
      const hit = asteroidsRef.current.find(
        (a) =>
          !destroyedIds.has(a.id) &&
          Math.abs(laser.x - a.x) < 8 &&
          Math.abs(laser.y - a.y) < 8
      );
      if (hit) {
        hit.hp -= 1;
        if (hit.hp <= 0) {
          destroyedIds.add(hit.id);
          killCountRef.current++;
        } else {
          hitIds.add(hit.id);
        }
        return false; // consume laser
      }
      return true;
    });
    asteroidsRef.current = asteroidsRef.current.filter((a) => !destroyedIds.has(a.id));

    // Rocket hit by asteroid.
    const rY = rocketYRef.current;
    const rocketHit = asteroidsRef.current.find((a) => a.x < 14 && Math.abs(a.y - rY) < 10);
    if (rocketHit) {
      asteroidsRef.current = asteroidsRef.current.filter((a) => a.id !== rocketHit.id);
      if (activePowerRef.current === 'shield') {
        activePowerRef.current = null; // shield absorbs hit
        setActivePower(null);
      } else {
        livesRef.current -= 1;
        setHitFlash(true);
        if (hitFlashTimerRef.current) clearTimeout(hitFlashTimerRef.current);
        hitFlashTimerRef.current = setTimeout(() => setHitFlash(false), 500);
        if (livesRef.current <= 0) {
          setLives(0);
          setAsteroids([...asteroidsRef.current]);
          setLasers([...lasersRef.current]);
          clearTimers();
          setPhase('done');
          setShowConfetti(true);
          return;
        }
      }
      setLives(livesRef.current);
    }

    // Powerup collection.
    if (
      powerupRef.current &&
      Math.abs(powerupRef.current.x - 8) < 12 &&
      Math.abs(powerupRef.current.y - rY) < 12
    ) {
      const kind = powerupRef.current.kind;
      activePowerRef.current = kind;
      setActivePower(kind);
      powerupRef.current = null;
      if (powerTimerRef.current) clearTimeout(powerTimerRef.current);
      powerTimerRef.current = setTimeout(() => {
        activePowerRef.current = null;
        setActivePower(null);
      }, 8000);
    }
    if (powerupRef.current && powerupRef.current.x < 0) powerupRef.current = null;

    // Score + kill count from kills.
    if (destroyedIds.size > 0) {
      setScore((s) => s + destroyedIds.size);
      setKillCount(killCountRef.current);

      // Powerup spawns at kill milestones.
      const kc = killCountRef.current;
      if (kc === 15) spawnPowerup('wide');
      else if (kc === 35) spawnPowerup('shield');
      else if (kc === 60) spawnPowerup('speed');
    }

    // Batch render update.
    setLasers([...lasersRef.current]);
    setAsteroids([...asteroidsRef.current]);
    setPowerup(powerupRef.current ? { ...powerupRef.current } : null);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [clearTimers, spawnPowerup]);

  const startGame = useCallback(() => {
    // Reset refs.
    lasersRef.current = [];
    asteroidsRef.current = [];
    powerupRef.current = null;
    activePowerRef.current = null;
    killCountRef.current = 0;
    rocketYRef.current = 40;
    livesRef.current = 3;
    firingRef.current = false;
    // Reset state.
    setScore(0);
    setLives(3);
    setRocketY(40);
    setLasers([]);
    setAsteroids([]);
    setPowerup(null);
    setActivePower(null);
    setShowConfetti(false);
    setHitFlash(false);
    setKillCount(0);
    setPhase('playing');

    speakText('Blast off! Shoot the asteroids!');

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    startSpawnLoop();
  }, [gameLoop, startSpawnLoop]);

  const stopFiring = useCallback(() => {
    firingRef.current = false;
    if (laserTimerRef.current) clearInterval(laserTimerRef.current);
    laserTimerRef.current = null;
  }, []);

  const startFiring = useCallback(() => {
    if (phase !== 'playing') return;
    firingRef.current = true;
    fireLaser();
    if (laserTimerRef.current) clearInterval(laserTimerRef.current);
    laserTimerRef.current = setInterval(fireLaser, 200);
  }, [phase, fireLaser]);

  const moveRocket = useCallback((delta: number) => {
    rocketYRef.current = clamp(rocketYRef.current + delta, 5, 75);
    setRocketY(rocketYRef.current);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons <= 0) return;
    const el = playAreaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((e.clientY - rect.top) / rect.height) * 100;
    rocketYRef.current = clamp(pct, 5, 75);
    setRocketY(rocketYRef.current);
  }, []);

  // Wave banner text.
  const waveBanner =
    killCount >= 50 ? 'Near Jupiter! 🟠' : killCount >= 20 ? 'Flying past Mars! 🔴' : '';

  const heroLine = score > 25 ? 'SPACE HERO! 🌟' : 'GREAT FLYING! 🚀';

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto">
      <style>{starStyles}</style>

      {showConfetti && phase === 'done' && score > 0 && (
        <ReactConfetti width={dims.w || 400} height={dims.h || 600} recycle={false} numberOfPieces={250} />
      )}

      {phase === 'ready' && (
        <div className="bg-slate-950 rounded-2xl p-8 flex flex-col items-center gap-6">
          <motion.div
            className="text-8xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🚀
          </motion.div>
          <h1 className="text-4xl font-black text-white">LASER BLASTER</h1>
          <p className="text-indigo-300 text-center">
            🔫 Shoot asteroids before they reach your rocket!
          </p>
          <div className="text-2xl">❤️❤️❤️</div>
          <button
            onClick={startGame}
            className="bg-purple-600 hover:bg-purple-500 text-white text-2xl font-black py-5 px-10 rounded-2xl shadow-xl"
          >
            LAUNCH! 🚀
          </button>
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">
            ← Back
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <div>
          <div
            ref={playAreaRef}
            onPointerMove={handlePointerMove}
            className="h-72 w-full relative overflow-hidden bg-slate-950 rounded-2xl border border-slate-800 touch-none"
          >
            {/* Parallax stars */}
            <StarLayer stars={STAR_SET_1} duration="8s" />
            <StarLayer stars={STAR_SET_2} duration="14s" />
            <StarLayer stars={STAR_SET_3} duration="22s" />

            {/* Rocket */}
            <div
              className="absolute"
              style={{ left: 12, top: `${rocketY}%` }}
            >
              <div className="relative w-14 h-8 flex items-center">
                <div
                  className={`absolute w-10 h-7 bg-indigo-600 rounded-l-3xl rounded-r-md ${
                    hitFlash ? 'ring-2 ring-red-500' : ''
                  } ${activePower === 'shield' ? 'ring-4 ring-cyan-400' : ''}`}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-1.5 bg-yellow-400 rounded-full" />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-300 rounded-full" />
                <motion.div
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-4 bg-orange-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>

            {/* Lasers */}
            {lasers.map((l) => (
              <div
                key={l.id}
                className={`absolute -translate-y-1/2 rounded-full ${
                  l.wide ? 'h-3 w-10 bg-cyan-400' : 'h-1 w-8 bg-yellow-300'
                }`}
                style={{ left: `${l.x}%`, top: `${l.y}%` }}
              />
            ))}

            {/* Asteroids */}
            <AnimatePresence>
              {asteroids.map((a) => {
                const cracked = a.hp < a.maxHp;
                const base =
                  a.type === 'rocky'
                    ? 'w-10 h-10 bg-slate-500 rounded-full border-2 border-slate-400'
                    : a.type === 'icy'
                    ? 'w-12 h-12 bg-sky-300/80 rounded-full border-2 border-sky-200'
                    : 'w-8 h-8 bg-amber-800 rounded-full border-2 border-amber-600';
                return (
                  <motion.div
                    key={a.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden ${base} ${
                      cracked ? 'opacity-70' : ''
                    }`}
                    style={{ left: `${a.x}%`, top: `${a.y}%` }}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: cracked ? 0.7 : 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {cracked && (
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Powerup */}
            {powerup && (
              <div
                className="absolute w-10 h-10 bg-purple-900/80 border border-purple-500 rounded-xl flex items-center justify-center text-xl -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${powerup.x}%`, top: `${powerup.y}%` }}
              >
                {POWER_EMOJI[powerup.kind]}
              </div>
            )}

            {/* HUD */}
            <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
              <div className="text-lg">{'❤️'.repeat(lives) + '🖤'.repeat(3 - lives)}</div>
              <div className="text-white font-black text-sm">{waveBanner}</div>
              <div className="text-white font-black">⭐ {score}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-2 flex items-center justify-between px-2">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveRocket(-12)}
                className="min-w-14 min-h-12 bg-slate-700 text-white rounded-xl font-black text-xl"
              >
                ▲
              </button>
              <button
                onClick={() => moveRocket(12)}
                className="min-w-14 min-h-12 bg-slate-700 text-white rounded-xl font-black text-xl"
              >
                ▼
              </button>
            </div>
            <button
              onPointerDown={startFiring}
              onPointerUp={stopFiring}
              onPointerLeave={stopFiring}
              className="bg-red-600 text-white rounded-2xl min-w-28 min-h-14 text-3xl font-black select-none touch-none"
            >
              🔴 FIRE
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-slate-950 rounded-2xl p-8 flex flex-col items-center gap-6">
          <div className="text-7xl">🏆</div>
          <p className="text-2xl font-black text-white text-center">
            You blasted {score} asteroids!
          </p>
          <p className="text-3xl font-black text-yellow-300 text-center">{heroLine}</p>
          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xl font-black py-4 px-8 rounded-2xl shadow-xl"
            >
              PLAY AGAIN
            </button>
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
