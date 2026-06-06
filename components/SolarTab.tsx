'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PLANETS, FUN_FACTS, type Planet } from '@/lib/solar-data';
import { speakText, speakEncouragement } from '@/lib/speech';

// Dynamic import with SSR disabled — Three.js requires browser APIs
const SolarSystem3D = dynamic(() => import('@/components/SolarSystem3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] flex items-center justify-center">
      <div className="text-indigo-300 font-black text-lg animate-pulse">LOADING SOLAR SYSTEM...</div>
    </div>
  ),
});

// Confetti — browser-only, never SSR
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

function PlanetInfoPanel({ planet, onClose }: { planet: Planet; onClose: () => void }) {
  const handleRead = useCallback(() => {
    const sentence = `${planet.name} is the ${PLANETS.indexOf(planet) + 1}${['st','nd','rd'][PLANETS.indexOf(planet)] ?? 'th'} planet from the Sun. ${planet.facts.join(' ')}`;
    speakText(sentence);
  }, [planet]);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto"
    >
      <div
        className="rounded-t-3xl p-6 shadow-2xl border-t-4"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          borderColor: planet.color,
        }}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex-shrink-0 shadow-lg"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${planet.glowColor}, ${planet.color})`,
              boxShadow: `0 0 20px ${planet.color}60`,
            }}
          />
          <div>
            <h2 className="text-3xl font-black text-white">{planet.name}</h2>
            <p className="text-indigo-300 text-sm font-bold">{planet.distanceAU} AU from the Sun</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: '📏 SIZE', value: `${planet.diameterKm.toLocaleString()} km` },
            { label: '🌙 MOONS', value: `${planet.moons} moon${planet.moons !== 1 ? 's' : ''}` },
            { label: '🌡️ TEMP', value: planet.tempDesc },
            { label: '📍 DISTANCE', value: `${planet.distanceAU} AU` },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-xs font-black text-indigo-300 mb-1">{stat.label}</p>
              <p className="text-white font-bold text-sm">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Fun facts */}
        <div className="flex flex-col gap-2 mb-4">
          {planet.facts.map((fact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 bg-white/10 rounded-xl p-3"
            >
              <span className="text-xl mt-0.5">{'🌟✨⚡'[i]}</span>
              <p className="text-white font-bold text-base">{fact}</p>
            </motion.div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleRead}
            className="flex-1 py-4 rounded-xl font-black text-white text-lg"
            style={{ background: planet.color }}
          >
            🔊 HEAR ABOUT {planet.name}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            className="py-4 px-5 bg-white/20 dark:bg-slate-800/40 rounded-xl font-black text-white text-lg min-w-[56px]"
          >
            ✕
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// SPACE GAMES
// ============================================================================

type SolarTabMode = 'EXPLORE' | 'GAMES';
type SpaceGame = 'BLASTER' | 'LINEUP' | 'MEMORY' | null;

// Small helpers shared by games
function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomPlanet(exclude?: Planet): Planet {
  const pool = exclude ? PLANETS.filter(p => p.id !== exclude.id) : PLANETS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Reusable Back + Score header bar
function GameHeader({ onBack, score, label }: { onBack: () => void; score: number; label?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onBack}
        className="bg-white/20 dark:bg-slate-800/40 text-white font-black py-2 px-4 rounded-xl text-base"
      >
        ← BACK
      </motion.button>
      <div className="bg-white/10 dark:bg-slate-800/40 text-white font-black py-2 px-4 rounded-xl text-base">
        ⭐ {score}{label ? ` ${label}` : ''}
      </div>
    </div>
  );
}

// ============================================================================
// GAME 1: ASTEROID BLASTER — tap the asteroid matching the target planet
// ============================================================================
interface Asteroid {
  id: number;
  planet: Planet;
  y: number;
  duration: number;
}

const BLASTER_TIME = 30;
const MAX_ASTEROIDS = 5;
const SPAWN_MS = 1200;

function AsteroidBlaster({ onBack }: { onBack: () => void }) {
  const { width, height } = useWindowSize();
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BLASTER_TIME);
  const [target, setTarget] = useState<Planet>(() => randomPlanet());
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [hitId, setHitId] = useState<number | null>(null);
  const [missId, setMissId] = useState<number | null>(null);
  const [burst, setBurst] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const missTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);
  const targetRef = useRef<Planet>(target);
  useEffect(() => { targetRef.current = target; }, [target]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
    if (missTimeoutRef.current) { clearTimeout(missTimeoutRef.current); missTimeoutRef.current = null; }
  }, []);

  // Cleanup on unmount — no leaked timers
  useEffect(() => clearTimers, [clearTimers]);

  const makeAsteroid = useCallback((planet: Planet): Asteroid => ({
    id: ++idRef.current,
    planet,
    y: 20 + Math.random() * 200,
    duration: 3 + Math.random() * 2,
  }), []);

  const spawn = useCallback(() => {
    setAsteroids(prev => {
      if (prev.length >= MAX_ASTEROIDS) return prev;
      const additions: Asteroid[] = [];
      const hasTarget = prev.some(a => a.planet.id === targetRef.current.id);
      if (!hasTarget) additions.push(makeAsteroid(targetRef.current));
      const room = MAX_ASTEROIDS - prev.length - additions.length;
      const distractors = Math.min(room, 1 + Math.floor(Math.random() * 2));
      for (let i = 0; i < distractors; i++) {
        additions.push(makeAsteroid(randomPlanet(targetRef.current)));
      }
      return [...prev, ...additions];
    });
  }, [makeAsteroid]);

  const spawnFreshWave = useCallback((newTarget: Planet) => {
    const wave: Asteroid[] = [makeAsteroid(newTarget)];
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) wave.push(makeAsteroid(randomPlanet(newTarget)));
    setAsteroids(wave);
  }, [makeAsteroid]);

  const startGame = useCallback(() => {
    clearTimers();
    setScore(0);
    setTimeLeft(BLASTER_TIME);
    setHitId(null);
    setMissId(null);
    const first = randomPlanet();
    setTarget(first);
    targetRef.current = first;
    setAsteroids([]);
    setPhase('playing');

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearTimers();
          setPhase('done');
          setAsteroids([]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    spawn();
    spawnRef.current = setInterval(spawn, SPAWN_MS);
  }, [spawn, clearTimers]);

  const removeAsteroid = useCallback((id: number) => {
    setAsteroids(prev => prev.filter(a => a.id !== id));
  }, []);

  const tapAsteroid = useCallback((asteroid: Asteroid) => {
    if (asteroid.planet.id === targetRef.current.id) {
      setHitId(asteroid.id);
      setScore(s => s + 1);
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
      speakEncouragement(true);
      const next = randomPlanet(asteroid.planet);
      setTarget(next);
      targetRef.current = next;
      spawnFreshWave(next);
      // remove the hit asteroid after its explosion animation
      setTimeout(() => {
        setHitId(null);
        removeAsteroid(asteroid.id);
      }, 300);
    } else {
      setMissId(asteroid.id);
      if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
      missTimeoutRef.current = setTimeout(() => setMissId(null), 400);
    }
  }, [spawnFreshWave, removeAsteroid]);

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <GameHeader onBack={onBack} score={0} />
        <div className="text-7xl">🚀</div>
        <h3 className="text-4xl font-black text-white text-center">ASTEROID BLASTER</h3>
        <p className="text-indigo-200 font-bold text-center text-lg px-4">Ready to shoot?</p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={startGame}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white font-black text-4xl py-8 px-14 rounded-full shadow-2xl"
        >
          START
        </motion.button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        {width > 0 && (
          <ReactConfetti width={width} height={height} numberOfPieces={250} recycle={false} />
        )}
        <div className="text-6xl">🚀</div>
        <h3 className="text-3xl font-black text-white text-center">
          BLAST OFF! You got {score} planet{score !== 1 ? 's' : ''}!
        </h3>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={startGame}
            className="bg-gradient-to-r from-pink-500 to-orange-500 text-white font-black text-xl py-4 px-6 rounded-2xl"
          >
            PLAY AGAIN 🔁
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { clearTimers(); onBack(); }}
            className="bg-white/20 dark:bg-slate-800/40 text-white font-black text-xl py-4 px-6 rounded-2xl"
          >
            ← BACK
          </motion.button>
        </div>
      </div>
    );
  }

  // playing
  return (
    <div>
      {burst && width > 0 && (
        <ReactConfetti width={width} height={height} numberOfPieces={80} recycle={false} />
      )}
      <div className="flex items-center justify-between mb-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => { clearTimers(); onBack(); }}
          className="bg-white/20 dark:bg-slate-800/40 text-white font-black py-2 px-4 rounded-xl text-base"
        >
          ← BACK
        </motion.button>
        <div className="flex items-center gap-2">
          <div className="bg-white/10 dark:bg-slate-800/40 text-white font-black py-2 px-4 rounded-xl text-2xl">
            {timeLeft}
          </div>
          <div className="bg-white/10 dark:bg-slate-800/40 text-white font-black py-2 px-4 rounded-xl text-base">
            ⭐ {score}
          </div>
        </div>
      </div>

      <motion.h3
        key={target.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl font-black text-center mb-3 text-white"
        style={{ textShadow: `0 0 16px ${target.color}, 0 0 6px ${target.color}` }}
      >
        FIND: {target.emoji} {target.name}!
      </motion.h3>

      <div className="relative h-64 w-full overflow-hidden bg-slate-900 rounded-2xl border border-indigo-800/40">
        <AnimatePresence>
          {asteroids.map(asteroid => {
            const isHit = hitId === asteroid.id;
            const isMiss = missId === asteroid.id;
            return (
              <motion.button
                key={asteroid.id}
                initial={{ x: 600 }}
                animate={
                  isHit
                    ? { scale: [1, 1.6], opacity: [1, 0] }
                    : isMiss
                    ? { x: [600, -200], y: [0, -8, 8, -8, 8, 0] }
                    : { x: [600, -200] }
                }
                transition={
                  isHit
                    ? { duration: 0.3 }
                    : { x: { duration: asteroid.duration, ease: 'linear' } }
                }
                onAnimationComplete={() => {
                  if (!isHit) removeAsteroid(asteroid.id);
                }}
                onClick={() => tapAsteroid(asteroid)}
                className="absolute flex items-center justify-center w-16 h-16 rounded-full shadow-lg"
                style={{
                  top: asteroid.y,
                  backgroundColor: asteroid.planet.color,
                  boxShadow: `0 0 16px ${asteroid.planet.color}90`,
                }}
              >
                <span className="text-3xl leading-none">{asteroid.planet.emoji}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// GAME 2: PLANET LINEUP — tap which planet is Nth from the Sun, build the system
// ============================================================================
function PlanetLineup({ onBack }: { onBack: () => void }) {
  const { width, height } = useWindowSize();
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [placed, setPlaced] = useState<Planet[]>([]);
  const [remaining, setRemaining] = useState<Planet[]>(() => shuffle(PLANETS));
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
  }, []);

  const currentPosition = placed.length + 1; // 1..8
  const nextCorrect = PLANETS[placed.length]; // the planet that should be placed next

  const handleTap = useCallback((planet: Planet) => {
    if (planet.id === nextCorrect.id) {
      const newPlaced = [...placed, planet];
      setPlaced(newPlaced);
      setRemaining(prev => prev.filter(p => p.id !== planet.id));
      speakEncouragement(true);
      if (newPlaced.length === PLANETS.length) {
        setShowConfetti(true);
        setPhase('done');
      }
    } else {
      setWrongId(planet.id);
      speakEncouragement(false);
      if (wrongTimeoutRef.current) clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = setTimeout(() => setWrongId(null), 500);
    }
  }, [nextCorrect, placed]);

  const restart = useCallback(() => {
    if (wrongTimeoutRef.current) { clearTimeout(wrongTimeoutRef.current); wrongTimeoutRef.current = null; }
    setPlaced([]);
    setRemaining(shuffle(PLANETS));
    setWrongId(null);
    setShowConfetti(false);
    setPhase('playing');
  }, []);

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        {showConfetti && width > 0 && (
          <ReactConfetti width={width} height={height} numberOfPieces={250} recycle={false} />
        )}
        <div className="text-6xl">☀️</div>
        <h3 className="text-3xl font-black text-white text-center">
          You built the solar system! 🎉
        </h3>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={restart}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xl py-4 px-6 rounded-2xl"
          >
            PLAY AGAIN 🔁
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="bg-white/20 dark:bg-slate-800/40 text-white font-black text-xl py-4 px-6 rounded-2xl"
          >
            ← BACK
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <GameHeader onBack={onBack} score={placed.length} label={`/ ${PLANETS.length}`} />

      {/* Orbit bar — 8 numbered slots */}
      <div className="flex justify-between gap-1 bg-slate-800 rounded-2xl p-2 mb-6">
        {PLANETS.map((_, i) => {
          const p = placed[i];
          return (
            <div
              key={i}
              className="flex-1 aspect-square rounded-full flex items-center justify-center text-sm font-black"
              style={{
                backgroundColor: p ? p.color : 'rgba(255,255,255,0.08)',
                color: p ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {p ? <span className="text-lg leading-none">{p.emoji}</span> : i + 1}
            </div>
          );
        })}
      </div>

      <motion.h3
        key={currentPosition}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-2xl font-black text-white text-center mb-1"
      >
        Which is PLANET NUMBER
      </motion.h3>
      <motion.div
        key={`num-${currentPosition}`}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-7xl font-black text-center mb-6 text-yellow-300"
        style={{ textShadow: '0 0 24px #fbbf24' }}
      >
        ☀️ {currentPosition}
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {remaining.map(planet => {
          const isWrong = wrongId === planet.id;
          return (
            <motion.button
              key={planet.id}
              layout
              whileTap={{ scale: 0.92 }}
              animate={isWrong ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              onClick={() => handleTap(planet)}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: planet.color,
                  boxShadow: isWrong ? '0 0 18px 4px #dc2626' : `0 0 12px ${planet.color}80`,
                }}
              >
                <span className="text-3xl leading-none">{planet.emoji}</span>
              </div>
              <span className="text-white font-black text-[10px] tracking-tight">{planet.name}</span>
            </motion.button>
          );
        })}
      </div>

      {wrongId && (
        <p className="text-center text-red-400 font-black text-xl mt-6">Try again! 💪</p>
      )}
    </div>
  );
}

// ============================================================================
// GAME 3: PLANET MEMORY MATCH — flip-card concentration game
// ============================================================================
interface MemoryCard {
  id: number;
  planetId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function makeMemoryDeck(): MemoryCard[] {
  const pairs = PLANETS.flatMap(p => [p, p]);
  return shuffle(pairs).map((p, i) => ({
    id: i,
    planetId: p.id,
    isFlipped: false,
    isMatched: false,
  }));
}

const PLANET_BY_ID = Object.fromEntries(PLANETS.map(p => [p.id, p])) as Record<string, Planet>;

function PlanetMemory({ onBack }: { onBack: () => void }) {
  const { width, height } = useWindowSize();
  const [cards, setCards] = useState<MemoryCard[]>(() => makeMemoryDeck());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
  }, []);

  const done = matchedPairs === PLANETS.length;

  const flipCard = useCallback((card: MemoryCard) => {
    if (isChecking || card.isFlipped || card.isMatched || flippedIds.length >= 2) return;

    const newFlipped = [...flippedIds, card.id];
    setCards(prev => prev.map(c => (c.id === card.id ? { ...c, isFlipped: true } : c)));
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [aId, bId] = newFlipped;
      const a = cards.find(c => c.id === aId)!;
      const b = cards.find(c => c.id === bId)!;
      if (a.planetId === b.planetId) {
        // match
        setCards(prev => prev.map(c =>
          c.id === aId || c.id === bId ? { ...c, isMatched: true } : c
        ));
        setFlippedIds([]);
        setMatchedPairs(p => {
          const next = p + 1;
          if (next === PLANETS.length) setShowConfetti(true);
          return next;
        });
        speakEncouragement(true);
      } else {
        // no match — flip back after delay
        setIsChecking(true);
        if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === aId || c.id === bId ? { ...c, isFlipped: false } : c
          ));
          setFlippedIds([]);
          setIsChecking(false);
        }, 900);
      }
    }
  }, [isChecking, flippedIds, cards]);

  const restart = useCallback(() => {
    if (checkTimeoutRef.current) { clearTimeout(checkTimeoutRef.current); checkTimeoutRef.current = null; }
    setCards(makeMemoryDeck());
    setFlippedIds([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsChecking(false);
    setShowConfetti(false);
  }, []);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        {showConfetti && width > 0 && (
          <ReactConfetti width={width} height={height} numberOfPieces={250} recycle={false} />
        )}
        <div className="text-6xl">🧠</div>
        <h3 className="text-3xl font-black text-white text-center">
          AMAZING! You matched all planets in {moves} moves!
        </h3>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={restart}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xl py-4 px-6 rounded-2xl"
          >
            PLAY AGAIN 🔁
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="bg-white/20 dark:bg-slate-800/40 text-white font-black text-xl py-4 px-6 rounded-2xl"
          >
            ← BACK
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onBack}
          className="bg-white/20 dark:bg-slate-800/40 text-white font-black py-2 px-4 rounded-xl text-base"
        >
          ← BACK
        </motion.button>
        <div className="flex items-center gap-2">
          <div className="bg-white/10 dark:bg-slate-800/40 text-white font-black py-2 px-4 rounded-xl text-base">
            🔄 {moves}
          </div>
          <div className="bg-white/10 dark:bg-slate-800/40 text-white font-black py-2 px-4 rounded-xl text-base">
            ✅ {matchedPairs}/{PLANETS.length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 justify-items-center">
        {cards.map(card => {
          const planet = PLANET_BY_ID[card.planetId];
          const faceUp = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => flipCard(card)}
              className="w-16 h-16"
              style={{ perspective: 1000 }}
            >
              <motion.div
                animate={{ rotateY: faceUp ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back (face-down) */}
                <div
                  className="absolute inset-0 rounded-xl bg-slate-700 flex items-center justify-center text-2xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  ⭐
                </div>
                {/* Front (face-up) */}
                <div
                  className={`absolute inset-0 rounded-xl flex items-center justify-center shadow-lg ${card.isMatched ? 'ring-2 ring-yellow-400' : ''}`}
                  style={{
                    backgroundColor: planet.color,
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    boxShadow: `0 0 12px ${planet.color}80`,
                  }}
                >
                  <span className="text-3xl leading-none">{planet.emoji}</span>
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- GAMES PANEL ----------
function SpaceGamesPanel() {
  const [activeGame, setActiveGame] = useState<SpaceGame>(null);
  const back = useCallback(() => setActiveGame(null), []);

  if (activeGame === 'BLASTER') return <AsteroidBlaster onBack={back} />;
  if (activeGame === 'LINEUP') return <PlanetLineup onBack={back} />;
  if (activeGame === 'MEMORY') return <PlanetMemory onBack={back} />;

  const cards: { game: Exclude<SpaceGame, null>; emoji: string; title: string; sub: string }[] = [
    { game: 'BLASTER', emoji: '🚀', title: 'ASTEROID BLASTER', sub: 'Shoot the right planet!' },
    { game: 'LINEUP', emoji: '☀️', title: 'PLANET LINEUP', sub: 'Put planets in order!' },
    { game: 'MEMORY', emoji: '🧠', title: 'MEMORY MATCH', sub: 'Find the matching pairs!' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {cards.map(card => (
        <motion.button
          key={card.game}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setActiveGame(card.game)}
          className="flex items-center gap-4 rounded-2xl p-5 text-left border border-indigo-700/40"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}
        >
          <span className="text-5xl flex-shrink-0">{card.emoji}</span>
          <div>
            <h3 className="text-white font-black text-2xl">{card.title}</h3>
            <p className="text-indigo-300 font-bold text-sm mt-0.5">{card.sub}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export default function SolarTab() {
  const [tabMode, setTabMode] = useState<SolarTabMode>('EXPLORE');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);

  const handlePlanetSelect = useCallback((id: string) => {
    const planet = PLANETS.find(p => p.id === id);
    if (planet) {
      setSelectedPlanet(planet);
      speakText(planet.name);
    }
  }, []);

  const handleFunFact = () => {
    const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
    setFunFact(fact);
    speakText(fact);
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Mode toggle */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setTabMode('EXPLORE')}
          className="flex-1 py-3 rounded-2xl font-black text-lg text-white"
          style={{
            background: tabMode === 'EXPLORE'
              ? 'linear-gradient(to right, #6366f1, #9333ea)'
              : 'rgba(255,255,255,0.2)',
          }}
        >
          🔭 EXPLORE
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setTabMode('GAMES'); speakText('Game time!'); }}
          className="flex-1 py-3 rounded-2xl font-black text-lg text-white"
          style={{
            background: tabMode === 'GAMES'
              ? 'linear-gradient(to right, #ec4899, #f97316)'
              : 'rgba(255,255,255,0.2)',
          }}
        >
          🎮 GAMES
        </motion.button>
      </div>

      {tabMode === 'GAMES' ? (
        <SpaceGamesPanel />
      ) : (
        <>
          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl font-black text-white">SPACE EXPLORER 🚀</h2>
            <p className="text-indigo-300 text-sm font-bold mt-1">TAP A PLANET TO EXPLORE!</p>
          </div>

          {/* Control hints */}
          <p className="text-center text-indigo-400 text-xs font-bold tracking-widest">
            drag to orbit • pinch to zoom • tap a planet
          </p>

          {/* Three.js Solar System */}
          <div className="rounded-2xl overflow-hidden border border-indigo-800/40">
            <SolarSystem3D onSelectPlanet={handlePlanetSelect} planets={PLANETS} />
          </div>

          {/* Fun fact button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFunFact}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xl py-4 px-6 rounded-2xl shadow-xl"
          >
            DID YOU KNOW? 🤩
          </motion.button>

          {/* Fun fact display */}
          <AnimatePresence>
            {funFact && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setFunFact(null)}
                className="bg-white/10 border border-indigo-400/30 rounded-2xl p-4 cursor-pointer"
              >
                <p className="text-white font-bold text-lg text-center">{funFact}</p>
                <p className="text-indigo-300 text-xs text-center mt-2">Tap to dismiss</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Planet list grid */}
          <div className="grid grid-cols-2 gap-3">
            {PLANETS.map(p => (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlanetSelect(p.id)}
                className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 text-left border border-white/10 min-h-[56px]"
              >
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${p.glowColor}, ${p.color})`,
                    boxShadow: `0 0 10px ${p.color}60`,
                  }}
                />
                <div>
                  <p className="text-white font-black text-base">{p.name}</p>
                  <p className="text-indigo-300 text-xs font-bold">{p.moons} moon{p.moons !== 1 ? 's' : ''}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {/* Planet detail panel */}
      <AnimatePresence>
        {selectedPlanet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSelectedPlanet(null)}
            />
            <PlanetInfoPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
