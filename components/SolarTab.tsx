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
            className="py-4 px-5 bg-white/20 rounded-xl font-black text-white text-lg min-w-[56px]"
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
type SpaceGame = 'ORDER' | 'SIZE' | 'BLASTER' | null;

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

function ordinal(n: number) {
  return `${n}${['st', 'nd', 'rd'][n - 1] ?? 'th'}`;
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

const TOTAL_ROUNDS = 10;

// Reusable Back + Score header bar
function GameHeader({ onBack, score, label }: { onBack: () => void; score: number; label?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onBack}
        className="bg-white/20 text-white font-black py-2 px-4 rounded-xl text-base"
      >
        ← BACK
      </motion.button>
      <div className="bg-white/10 text-white font-black py-2 px-4 rounded-xl text-base">
        ⭐ {score}{label ? ` ${label}` : ''}
      </div>
    </div>
  );
}

// ---------- PLANET ORDER GAME ----------
type OrderQuestion =
  | { kind: 'name'; position: number; options: Planet[]; answerId: string }
  | { kind: 'number'; planet: Planet; options: number[]; answer: number };

function makeOrderQuestion(): OrderQuestion {
  if (Math.random() < 0.5) {
    // "Which planet is N-th from the Sun?"
    const position = Math.floor(Math.random() * PLANETS.length) + 1; // 1..8
    const correct = PLANETS[position - 1];
    const distractors = shuffle(PLANETS.filter(p => p.id !== correct.id)).slice(0, 2);
    return {
      kind: 'name',
      position,
      options: shuffle([correct, ...distractors]),
      answerId: correct.id,
    };
  } else {
    // "[PLANET] is what number from the Sun?"
    const planet = randomPlanet();
    const answer = PLANETS.indexOf(planet) + 1;
    const numbers = new Set<number>([answer]);
    while (numbers.size < 3) {
      numbers.add(Math.floor(Math.random() * PLANETS.length) + 1);
    }
    return {
      kind: 'number',
      planet,
      options: shuffle([...numbers]),
      answer,
    };
  }
}

function PlanetOrderGame({ onBack }: { onBack: () => void }) {
  const { width, height } = useWindowSize();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState<OrderQuestion>(() => makeOrderQuestion());
  const [selected, setSelected] = useState<string | number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [done, setDone] = useState(false);

  const nextRound = useCallback(() => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setDone(true);
      setShowConfetti(true);
      return;
    }
    setRound(r => r + 1);
    setQuestion(makeOrderQuestion());
    setSelected(null);
    setFeedback(null);
  }, [round]);

  const handleAnswer = useCallback((value: string | number, correct: boolean) => {
    if (feedback === 'correct' || selected !== null) return;
    setSelected(value);
    if (correct) {
      setFeedback('correct');
      setScore(s => s + 1);
      speakEncouragement(true);
      setTimeout(nextRound, 1300);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      // allow retry on this round
      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
      }, 700);
    }
  }, [feedback, selected, nextRound]);

  const restart = useCallback(() => {
    setScore(0);
    setRound(0);
    setQuestion(makeOrderQuestion());
    setSelected(null);
    setFeedback(null);
    setShowConfetti(false);
    setDone(false);
  }, []);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        {showConfetti && width > 0 && (
          <ReactConfetti width={width} height={height} numberOfPieces={250} recycle={false} />
        )}
        <div className="text-6xl">🏆</div>
        <h3 className="text-3xl font-black text-white text-center">
          You got {score} out of {TOTAL_ROUNDS}!
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
            className="bg-white/20 text-white font-black text-xl py-4 px-6 rounded-2xl"
          >
            ← BACK
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <GameHeader onBack={onBack} score={score} label={`/ ${round}`} />

      <p className="text-center text-indigo-300 font-bold text-sm mb-2">
        Question {round + 1} of {TOTAL_ROUNDS}
      </p>

      <motion.h3
        key={round}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-black text-white text-center mb-8 px-2"
      >
        {question.kind === 'name'
          ? `Which planet is ${ordinal(question.position)} from the Sun? ☀️`
          : `${question.planet.name} is what number from the Sun? ☀️`}
      </motion.h3>

      <div className="flex flex-col gap-3">
        {question.kind === 'name'
          ? question.options.map(opt => {
              const isSel = selected === opt.id;
              const isCorrect = opt.id === question.answerId;
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.96 }}
                  animate={isSel && feedback === 'wrong' ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  onClick={() => handleAnswer(opt.id, isCorrect)}
                  className="flex items-center gap-4 rounded-2xl p-4 border-2 transition-colors"
                  style={{
                    background:
                      isSel && feedback === 'correct'
                        ? '#16a34a'
                        : isSel && feedback === 'wrong'
                        ? '#dc2626'
                        : 'rgba(255,255,255,0.1)',
                    borderColor: isSel ? '#fff' : 'rgba(255,255,255,0.15)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${opt.glowColor}, ${opt.color})`,
                    }}
                  />
                  <span className="text-white font-black text-xl">{opt.name}</span>
                </motion.button>
              );
            })
          : question.options.map(num => {
              const isSel = selected === num;
              const isCorrect = num === question.answer;
              return (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.96 }}
                  animate={isSel && feedback === 'wrong' ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                  onClick={() => handleAnswer(num, isCorrect)}
                  className="rounded-2xl p-5 border-2 transition-colors"
                  style={{
                    background:
                      isSel && feedback === 'correct'
                        ? '#16a34a'
                        : isSel && feedback === 'wrong'
                        ? '#dc2626'
                        : 'rgba(255,255,255,0.1)',
                    borderColor: isSel ? '#fff' : 'rgba(255,255,255,0.15)',
                  }}
                >
                  <span className="text-white font-black text-3xl">{ordinal(num)}</span>
                </motion.button>
              );
            })}
      </div>

      {feedback === 'correct' && (
        <p className="text-center text-green-400 font-black text-2xl mt-6">YES! 🎉</p>
      )}
      {feedback === 'wrong' && (
        <p className="text-center text-red-400 font-black text-xl mt-6">Try again! 💪</p>
      )}
    </div>
  );
}

// ---------- PLANET SIZE GAME ----------
function PlanetSizeGame({ onBack }: { onBack: () => void }) {
  const { width, height } = useWindowSize();
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [askBigger, setAskBigger] = useState(true);
  const [pair, setPair] = useState<[Planet, Planet]>(() => {
    const a = randomPlanet();
    return [a, randomPlanet(a)];
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [fact, setFact] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [done, setDone] = useState(false);

  const [planetA, planetB] = pair;
  const maxDiameter = Math.max(planetA.diameterKm, planetB.diameterKm);
  const sizeFor = (p: Planet) => Math.max(28, (p.diameterKm / maxDiameter) * 80);

  const correctId = askBigger
    ? (planetA.diameterKm >= planetB.diameterKm ? planetA.id : planetB.id)
    : (planetA.diameterKm <= planetB.diameterKm ? planetA.id : planetB.id);

  const nextRound = useCallback(() => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setDone(true);
      setShowConfetti(true);
      return;
    }
    setRound(r => r + 1);
    setAskBigger(b => !b);
    const a = randomPlanet();
    setPair([a, randomPlanet(a)]);
    setSelected(null);
    setFeedback(null);
    setFact(null);
  }, [round]);

  const handleTap = useCallback((planet: Planet) => {
    if (selected !== null) return;
    setSelected(planet.id);
    if (planet.id === correctId) {
      setFeedback('correct');
      setScore(s => s + 1);
      setFact(planet.facts[0]);
      speakEncouragement(true);
      setTimeout(nextRound, 2000);
    } else {
      setFeedback('wrong');
      speakEncouragement(false);
      setTimeout(() => {
        setSelected(null);
        setFeedback(null);
      }, 700);
    }
  }, [selected, correctId, nextRound]);

  const restart = useCallback(() => {
    setScore(0);
    setRound(0);
    setAskBigger(true);
    const a = randomPlanet();
    setPair([a, randomPlanet(a)]);
    setSelected(null);
    setFeedback(null);
    setFact(null);
    setShowConfetti(false);
    setDone(false);
  }, []);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        {showConfetti && width > 0 && (
          <ReactConfetti width={width} height={height} numberOfPieces={250} recycle={false} />
        )}
        <div className="text-6xl">🏆</div>
        <h3 className="text-3xl font-black text-white text-center">
          You got {score} out of {TOTAL_ROUNDS}!
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
            className="bg-white/20 text-white font-black text-xl py-4 px-6 rounded-2xl"
          >
            ← BACK
          </motion.button>
        </div>
      </div>
    );
  }

  const renderPlanet = (planet: Planet) => {
    const isSel = selected === planet.id;
    return (
      <motion.button
        key={planet.id}
        whileTap={{ scale: 0.95 }}
        animate={
          isSel && feedback === 'correct'
            ? { scale: [1, 1.25, 1.1] }
            : isSel && feedback === 'wrong'
            ? { x: [0, -8, 8, -8, 8, 0] }
            : {}
        }
        onClick={() => handleTap(planet)}
        className="flex flex-col items-center gap-3 flex-1"
      >
        <div className="h-[90px] flex items-center justify-center">
          <div
            className="rounded-full"
            style={{
              width: sizeFor(planet),
              height: sizeFor(planet),
              background: `radial-gradient(circle at 35% 35%, ${planet.glowColor}, ${planet.color})`,
              boxShadow:
                isSel && feedback === 'correct'
                  ? '0 0 30px 8px #22c55e'
                  : `0 0 14px ${planet.color}80`,
            }}
          />
        </div>
        <span className="text-white font-black text-xl">{planet.name}</span>
      </motion.button>
    );
  };

  return (
    <div>
      <GameHeader onBack={onBack} score={score} label={`/ ${round}`} />

      <p className="text-center text-indigo-300 font-bold text-sm mb-2">
        Question {round + 1} of {TOTAL_ROUNDS}
      </p>

      <motion.h3
        key={`${round}-${askBigger}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black text-center mb-8"
        style={{ color: askBigger ? '#fbbf24' : '#67e8f9' }}
      >
        Which is {askBigger ? 'BIGGER' : 'SMALLER'}? {askBigger ? '🔭' : '🔍'}
      </motion.h3>

      <div className="flex items-end justify-around gap-4 mb-6">
        {renderPlanet(planetA)}
        {renderPlanet(planetB)}
      </div>

      <AnimatePresence>
        {feedback === 'correct' && fact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/20 border-2 border-green-400/40 rounded-2xl p-4"
          >
            <p className="text-white font-black text-center text-lg">🎉 {fact}</p>
          </motion.div>
        )}
        {feedback === 'wrong' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-red-400 font-black text-xl"
          >
            Try the other one! 💪
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- PLANET BLASTER GAME ----------
interface Bubble {
  id: number;
  planet: Planet;
  xPct: number;
}

const BLASTER_TIME = 20;
const MAX_BUBBLES = 5;

function PlanetBlasterGame({ onBack }: { onBack: () => void }) {
  const { width, height } = useWindowSize();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BLASTER_TIME);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [target, setTarget] = useState<Planet>(() => randomPlanet());
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [shakeId, setShakeId] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bubbleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idRef = useRef(0);
  const targetRef = useRef<Planet>(target);
  targetRef.current = target;

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (bubbleRef.current) { clearInterval(bubbleRef.current); bubbleRef.current = null; }
  }, []);

  const spawnWave = useCallback(() => {
    setBubbles(prev => {
      if (prev.length >= MAX_BUBBLES) return prev;
      const additions: Bubble[] = [];
      const hasTarget = prev.some(b => b.planet.id === targetRef.current.id);
      if (!hasTarget) {
        additions.push({
          id: ++idRef.current,
          planet: targetRef.current,
          xPct: 8 + Math.random() * 78,
        });
      }
      const room = MAX_BUBBLES - prev.length - additions.length;
      const distractorCount = Math.min(room, 1 + Math.floor(Math.random() * 2));
      for (let i = 0; i < distractorCount; i++) {
        additions.push({
          id: ++idRef.current,
          planet: randomPlanet(targetRef.current),
          xPct: 8 + Math.random() * 78,
        });
      }
      return [...prev, ...additions];
    });
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(BLASTER_TIME);
    const first = randomPlanet();
    setTarget(first);
    targetRef.current = first;
    setBubbles([]);
    setPhase('playing');

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearTimers();
          setPhase('done');
          setBubbles([]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    spawnWave();
    bubbleRef.current = setInterval(spawnWave, 2000);
  }, [spawnWave, clearTimers]);

  // Cleanup on unmount — no leaked intervals
  useEffect(() => clearTimers, [clearTimers]);

  const popBubble = useCallback((bubble: Bubble) => {
    if (bubble.planet.id === targetRef.current.id) {
      setScore(s => s + 1);
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
      speakText(bubble.planet.name);
      const next = randomPlanet(bubble.planet);
      setTarget(next);
      targetRef.current = next;
    } else {
      setShakeId(bubble.id);
      setTimeout(() => setShakeId(null), 400);
    }
  }, []);

  const removeBubble = useCallback((id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
  }, []);

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <GameHeader onBack={onBack} score={0} />
        <div className="text-6xl">🚀</div>
        <p className="text-indigo-200 font-bold text-center text-lg px-4">
          Pop the right planet as fast as you can!
        </p>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={startGame}
          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white font-black text-4xl py-8 px-14 rounded-full shadow-2xl"
        >
          READY?
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
        <div className="text-6xl">🎉</div>
        <h3 className="text-3xl font-black text-white text-center">
          Time is up! You got {score} planet{score !== 1 ? 's' : ''}!
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
            onClick={onBack}
            className="bg-white/20 text-white font-black text-xl py-4 px-6 rounded-2xl"
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
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white/10 text-white font-black py-2 px-4 rounded-xl text-base">
          ⭐ {score}
        </div>
        <div className="bg-white/10 text-white font-black py-2 px-4 rounded-xl text-base">
          ⏱️ {timeLeft}s
        </div>
      </div>

      <motion.h3
        key={target.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl font-black text-center mb-3"
        style={{ color: target.color }}
      >
        FIND {target.name}! 🚀
      </motion.h3>

      <div
        className="relative w-full h-[360px] overflow-hidden rounded-2xl border border-indigo-800/40"
        style={{ background: 'radial-gradient(circle at 50% 120%, #1e1b4b, #020617)' }}
      >
        <AnimatePresence>
          {bubbles.map(bubble => (
            <motion.button
              key={bubble.id}
              initial={{ y: 300, opacity: 0 }}
              animate={
                shakeId === bubble.id
                  ? { y: 90, x: [0, -8, 8, -8, 8, 0], opacity: 1 }
                  : { y: -120, opacity: 1 }
              }
              exit={{ opacity: 0, scale: 0 }}
              transition={
                shakeId === bubble.id
                  ? { duration: 0.4 }
                  : { y: { duration: 5, ease: 'linear' }, opacity: { duration: 0.3 } }
              }
              onAnimationComplete={() => {
                if (shakeId !== bubble.id) removeBubble(bubble.id);
              }}
              onClick={() => popBubble(bubble)}
              className="absolute flex flex-col items-center justify-center rounded-full"
              style={{
                left: `${bubble.xPct}%`,
                bottom: 0,
                width: 72,
                height: 72,
                background: `radial-gradient(circle at 35% 35%, ${bubble.planet.glowColor}, ${bubble.planet.color})`,
                boxShadow: `0 0 16px ${bubble.planet.color}90`,
              }}
            >
              <span className="text-2xl leading-none">{bubble.planet.emoji}</span>
              <span className="text-[10px] font-black text-white leading-tight mt-0.5">
                {bubble.planet.name}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => { clearTimers(); onBack(); }}
          className="bg-white/20 text-white font-black py-2 px-5 rounded-xl text-base"
        >
          ← BACK
        </motion.button>
      </div>
    </div>
  );
}

// ---------- GAMES PANEL ----------
function SpaceGamesPanel() {
  const [activeGame, setActiveGame] = useState<SpaceGame>(null);
  const back = useCallback(() => setActiveGame(null), []);

  if (activeGame === 'ORDER') return <PlanetOrderGame onBack={back} />;
  if (activeGame === 'SIZE') return <PlanetSizeGame onBack={back} />;
  if (activeGame === 'BLASTER') return <PlanetBlasterGame onBack={back} />;

  const cards: { game: Exclude<SpaceGame, null>; emoji: string; title: string; sub: string }[] = [
    { game: 'ORDER', emoji: '🪐', title: 'PLANET ORDER', sub: 'Which planet is Nth from the Sun?' },
    { game: 'SIZE', emoji: '🔭', title: 'BIGGER OR SMALLER', sub: 'Spot the bigger planet!' },
    { game: 'BLASTER', emoji: '🚀', title: 'PLANET BLASTER', sub: 'Tap the right planet!' },
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
