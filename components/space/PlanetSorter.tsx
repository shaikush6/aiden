'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PLANETS, type Planet } from '@/lib/solar-data';
import { speakText } from '@/lib/speech';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type SortMode = 'SIZE' | 'DISTANCE';

const TOTAL_ROUNDS = 5;

interface Slot {
  index: number;
  planet: Planet | null;
}

function pickFourPlanets(seed: number): Planet[] {
  const shuffled = [...PLANETS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

function correctOrder(planets: Planet[], mode: SortMode): Planet[] {
  return [...planets].sort((a, b) =>
    mode === 'SIZE'
      ? a.diameterKm - b.diameterKm
      : a.distanceAU - b.distanceAU
  );
}

const SLOT_LABELS = ['1st', '2nd', '3rd', '4th'];

function isCorrect(slots: Slot[], correct: Planet[]): boolean {
  return slots.every((s, i) => s.planet?.id === correct[i]?.id);
}

const STAR_DOTS = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 43) % 95}%`,
  top: `${(i * 67) % 90}%`,
}));

export default function PlanetSorter({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [round, setRound] = useState(1);
  const [mode, setMode] = useState<SortMode>('SIZE');
  const [trayPlanets, setTrayPlanets] = useState<(Planet | null)[]>([]);
  const [slots, setSlots] = useState<Slot[]>([
    { index: 0, planet: null },
    { index: 1, planet: null },
    { index: 2, planet: null },
    { index: 3, planet: null },
  ]);
  const [correct, setCorrect] = useState<Planet[]>([]);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winSize, setWinSize] = useState({ width: 0, height: 0 });
  const [held, setHeld] = useState<{ planet: Planet; from: 'tray' | 'slot'; fromIdx: number } | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => setWinSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); };
  }, []);

  const setupRound = useCallback((r: number, m: SortMode) => {
    const four = pickFourPlanets(r);
    const ord = correctOrder(four, m);
    setCorrect(ord);
    setTrayPlanets([...four].sort(() => Math.random() - 0.5));
    setSlots([
      { index: 0, planet: null },
      { index: 1, planet: null },
      { index: 2, planet: null },
      { index: 3, planet: null },
    ]);
    setHeld(null);
    setFlash(null);
    setWrongIds([]);
    const label =
      m === 'SIZE'
        ? 'Sort by size! Smallest to biggest!'
        : 'Sort by distance! Closest to furthest from the Sun!';
    speakText(label);
  }, []);

  const startGame = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setScore(0);
    setRound(1);
    setShowConfetti(false);
    setCompleted(false);
    const m: SortMode = 'SIZE';
    setMode(m);
    setPhase('playing');
    setupRound(1, m);
  }, [setupRound]);

  const checkAnswer = useCallback((newSlots: Slot[], currentCorrect: Planet[]) => {
    const allFilled = newSlots.every((s) => s.planet !== null);
    if (!allFilled) return;
    if (isCorrect(newSlots, currentCorrect)) {
      setFlash('correct');
      setScore((s) => s + 1);
      const names = currentCorrect.map((p) => p.name.toLowerCase()).join(', ');
      speakText(`Correct! ${names}`);
      advanceTimer.current = setTimeout(() => {
        const nextRound = round + 1;
        if (nextRound > TOTAL_ROUNDS) {
          setCompleted(true);
          setShowConfetti(true);
          speakText('You sorted all the planets! Amazing!');
          setPhase('done');
        } else {
          const nextMode: SortMode = nextRound % 2 === 0 ? 'DISTANCE' : 'SIZE';
          setRound(nextRound);
          setMode(nextMode);
          setupRound(nextRound, nextMode);
        }
      }, 1200);
    } else {
      setFlash('wrong');
      setWrongIds(
        newSlots
          .filter((s, i) => s.planet?.id !== currentCorrect[i]?.id)
          .map((s) => s.planet!.id)
      );
      setTimeout(() => {
        setFlash(null);
        setWrongIds([]);
      }, 800);
      speakText('Not quite! Try again!');
    }
  }, [round, setupRound]);

  const handleTrayTap = useCallback((planet: Planet, idx: number) => {
    if (!planet) return;
    if (held?.planet.id === planet.id) {
      setHeld(null);
      return;
    }
    if (held) {
      if (held.from === 'slot') {
        const newSlots = slots.map((s) =>
          s.index === held.fromIdx ? { ...s, planet: null } : s
        );
        const newTray = trayPlanets.map((p, i) => (i === idx ? held.planet : p));
        setSlots(newSlots);
        setTrayPlanets(newTray);
        const newHeld = planet ? { planet, from: 'tray' as const, fromIdx: idx } : null;
        setHeld(newHeld);
        return;
      }
    }
    speakText(planet.name.toLowerCase());
    setHeld({ planet, from: 'tray', fromIdx: idx });
  }, [held, slots, trayPlanets]);

  const handleSlotTap = useCallback((slotIdx: number) => {
    const slot = slots[slotIdx];
    if (!held) {
      if (slot.planet) {
        speakText(slot.planet.name.toLowerCase());
        const newTray = [...trayPlanets, slot.planet];
        const emptyTrayIdx = trayPlanets.findIndex((p) => p === null);
        if (emptyTrayIdx >= 0) {
          const nt = [...trayPlanets];
          nt[emptyTrayIdx] = slot.planet;
          setTrayPlanets(nt);
        } else {
          setTrayPlanets(newTray);
        }
        const newSlots = slots.map((s) => (s.index === slotIdx ? { ...s, planet: null } : s));
        setSlots(newSlots);
      }
      return;
    }
    const existingPlanet = slot.planet;
    let newSlots = slots.map((s) =>
      s.index === slotIdx ? { ...s, planet: held.planet } : s
    );
    if (held.from === 'tray') {
      const newTray = [...trayPlanets];
      newTray[held.fromIdx] = existingPlanet;
      setTrayPlanets(newTray);
    } else {
      newSlots = newSlots.map((s) =>
        s.index === held.fromIdx && s.index !== slotIdx ? { ...s, planet: existingPlanet } : s
      );
      if (existingPlanet && held.fromIdx !== slotIdx) {
        newSlots = newSlots.map((s) =>
          s.index === held.fromIdx ? { ...s, planet: existingPlanet } : s
        );
      }
    }
    setSlots(newSlots);
    setHeld(null);
    checkAnswer(newSlots, correct);
  }, [held, slots, trayPlanets, correct, checkAnswer]);

  const planetSize = (p: Planet) => {
    const big = p.id === 'jupiter' || p.id === 'saturn';
    const mid = p.id === 'uranus' || p.id === 'neptune';
    if (big) return 'w-14 h-14 text-2xl';
    if (mid) return 'w-12 h-12 text-xl';
    return 'w-10 h-10 text-lg';
  };

  return (
    <div className="bg-slate-950 rounded-2xl text-white overflow-hidden">
      {showConfetti && winSize.width > 0 && (
        <ReactConfetti width={winSize.width} height={winSize.height} recycle={false} numberOfPieces={280} />
      )}

      {phase === 'ready' && (
        <div className="flex flex-col items-center gap-6 p-8">
          <motion.div
            className="text-8xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🪐
          </motion.div>
          <h1 className="text-4xl font-black text-white text-center">PLANET SORTER</h1>
          <p className="text-indigo-300 text-center text-lg">
            Put 4 planets in the right order — by SIZE or by DISTANCE from the Sun!
          </p>
          <div className="flex gap-2 text-lg text-indigo-300 font-bold">5 rounds · drag planets into slots</div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-2xl font-black py-5 px-10 rounded-2xl shadow-xl"
          >
            START! 🪐
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
              <span className={`text-xs font-black px-3 py-1 rounded-full mt-1 ${
                mode === 'SIZE' ? 'bg-emerald-700 text-emerald-200' : 'bg-blue-700 text-blue-200'
              }`}>
                {mode === 'SIZE' ? '📏 SIZE ORDER' : '📍 DISTANCE ORDER'}
              </span>
            </div>
            <div className="text-white font-black text-lg">⭐ {score}</div>
          </div>

          <div className="px-3 text-center text-indigo-300 text-sm mb-2 font-bold">
            {mode === 'SIZE' ? 'Smallest → Biggest' : 'Closest → Furthest from Sun'}
          </div>

          {/* Background stars */}
          <div className="relative mx-3 mb-3 rounded-2xl bg-slate-900 overflow-hidden" style={{ minHeight: 100 }}>
            <div className="absolute inset-0 pointer-events-none">
              {STAR_DOTS.map((s, i) => (
                <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-40" style={s} />
              ))}
            </div>

            {/* Drop slots */}
            <div className="relative z-10 flex gap-2 justify-center p-4">
              {slots.map((slot) => {
                const isWrong = slot.planet && wrongIds.includes(slot.planet.id);
                return (
                  <motion.button
                    key={slot.index}
                    onClick={() => handleSlotTap(slot.index)}
                    animate={
                      flash === 'correct' && slot.planet
                        ? { scale: [1, 1.15, 1] }
                        : isWrong
                        ? { x: [-5, 5, -5, 5, 0] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.4 }}
                    className={`flex flex-col items-center gap-1 rounded-2xl p-2 min-w-[60px] border-2 transition-colors ${
                      held
                        ? 'border-yellow-400/70 bg-yellow-400/10'
                        : slot.planet
                        ? 'border-indigo-500/60 bg-slate-800/80'
                        : 'border-dashed border-indigo-700/60 bg-slate-800/40'
                    }`}
                  >
                    <span className="text-xs text-indigo-400 font-black">{SLOT_LABELS[slot.index]}</span>
                    {slot.planet ? (
                      <div
                        className={`${planetSize(slot.planet)} rounded-full flex items-center justify-center`}
                        style={{
                          backgroundColor: slot.planet.color,
                          boxShadow: `0 0 12px ${slot.planet.color}80`,
                        }}
                      >
                        {slot.planet.emoji}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-indigo-700/40" />
                    )}
                    {slot.planet && (
                      <span className="text-[9px] text-indigo-300 font-bold">{slot.planet.name}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback overlay */}
            <AnimatePresence>
              {flash && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <span className={`text-4xl font-black ${flash === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                    {flash === 'correct' ? '✓ YES!' : '✗ TRY AGAIN!'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tray */}
          <div className="px-3 pb-4">
            <div className="text-xs text-indigo-400 font-bold mb-2 text-center">TAP A PLANET, THEN TAP A SLOT</div>
            <div className="flex gap-3 justify-center flex-wrap">
              {trayPlanets.map((planet, idx) =>
                planet === null ? null : (
                  <motion.button
                    key={planet.id + idx}
                    onClick={() => handleTrayTap(planet, idx)}
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center gap-1 rounded-2xl p-2 border-2 transition-colors ${
                      held?.planet.id === planet.id
                        ? 'border-yellow-400 bg-yellow-400/20 scale-110'
                        : 'border-transparent bg-slate-800/60'
                    }`}
                  >
                    <div
                      className={`${planetSize(planet)} rounded-full flex items-center justify-center`}
                      style={{
                        backgroundColor: planet.color,
                        boxShadow: `0 0 10px ${planet.color}60`,
                      }}
                    >
                      {planet.emoji}
                    </div>
                    <span className="text-[9px] text-indigo-300 font-bold">{planet.name}</span>
                  </motion.button>
                )
              )}
              {trayPlanets.every((p) => p === null) && (
                <div className="text-indigo-500 text-sm font-bold py-4">All placed!</div>
              )}
            </div>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-col items-center gap-6 p-8">
          <div className="text-7xl">🏆</div>
          <p className="text-2xl font-black text-white text-center">
            You scored {score} / {TOTAL_ROUNDS}!
          </p>
          <p className="text-3xl font-black text-yellow-300 text-center">
            {score === TOTAL_ROUNDS ? 'PERFECT! 🌟' : score >= 3 ? 'GREAT JOB! 🚀' : 'KEEP GOING! 💪'}
          </p>
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-black py-4 px-8 rounded-2xl shadow-xl"
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
