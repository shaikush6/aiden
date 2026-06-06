'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PLANETS, type Planet } from '@/lib/solar-data';
import { speakText, speakEncouragement } from '@/lib/speech';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

const RING_RADII = [16, 22, 29, 37, 48, 60, 72, 85];
const ORBIT_DURATIONS = [5, 8, 12, 18, 28, 40, 55, 70];

const STAR_POSITIONS = [
  { left: '8%', top: '12%' },
  { left: '22%', top: '6%' },
  { left: '37%', top: '15%' },
  { left: '51%', top: '8%' },
  { left: '66%', top: '13%' },
  { left: '81%', top: '7%' },
  { left: '93%', top: '18%' },
  { left: '5%', top: '34%' },
  { left: '18%', top: '44%' },
  { left: '30%', top: '52%' },
  { left: '47%', top: '38%' },
  { left: '63%', top: '47%' },
  { left: '78%', top: '40%' },
  { left: '90%', top: '55%' },
  { left: '12%', top: '68%' },
  { left: '28%', top: '78%' },
  { left: '44%', top: '88%' },
  { left: '60%', top: '72%' },
  { left: '74%', top: '85%' },
  { left: '88%', top: '92%' },
];

export default function OrbitBuilderGame({ onBack }: { onBack: () => void }) {
  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [held, setHeld] = useState<Planet | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mode, setMode] = useState<'guided' | 'free'>('guided');
  const [winSize, setWinSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () =>
      setWinSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handlePlanetTap = useCallback(
    (planet: Planet) => {
      setHeld((cur) => {
        if (cur?.id === planet.id) return null;
        speakText('Where does ' + planet.name + ' go?');
        return planet;
      });
    },
    [],
  );

  const handleRingTap = useCallback(
    (slot: number) => {
      if (!held) return;
      const correctSlot = PLANETS.indexOf(held) + 1;
      if (slot === correctSlot) {
        const newPlaced = { ...placed, [held.id]: slot };
        setPlaced(newPlaced);
        speakText(held.name + ' found its orbit!');
        speakEncouragement(true);
        if (Object.keys(newPlaced).length === 8) {
          setCompleted(true);
          setShowConfetti(true);
          speakText('You built the whole solar system! Amazing!');
        }
        setHeld(null);
      } else {
        setWrongId(held.id);
        setTimeout(() => setWrongId(null), 800);
        speakText('Try again!');
        setHeld(null);
      }
    },
    [held, placed],
  );

  const handleNasaOrder = useCallback(() => {
    const full: Record<string, number> = {};
    PLANETS.forEach((p, i) => {
      full[p.id] = i + 1;
    });
    setPlaced(full);
    setHeld(null);
    setCompleted(true);
    setShowConfetti(true);
    speakText('You built the whole solar system! Amazing!');
  }, []);

  const handleReset = useCallback(() => {
    setPlaced({});
    setHeld(null);
    setCompleted(false);
    setShowConfetti(false);
  }, []);

  const placedCount = Object.keys(placed).length;
  const unplaced = PLANETS.filter((p) => !(p.id in placed));

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

      {/* TOP ROW */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="text-sm font-bold text-indigo-300"
        >
          ← BACK
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('guided')}
            className={`text-xs font-black px-3 py-1.5 rounded-full ${
              mode === 'guided'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-indigo-300'
            }`}
          >
            GUIDED 🧭
          </button>
          <button
            onClick={() => setMode('free')}
            className={`text-xs font-black px-3 py-1.5 rounded-full ${
              mode === 'free'
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-indigo-300'
            }`}
          >
            FREE 🎨
          </button>
          {mode === 'free' && (
            <button
              onClick={handleNasaOrder}
              className="text-xs font-black px-3 py-1.5 rounded-full bg-orange-500 text-white"
            >
              NASA ORDER 🔭
            </button>
          )}
        </div>
      </div>

      {/* CANVAS */}
      <div className="relative max-w-[340px] mx-auto aspect-square bg-slate-950 rounded-2xl overflow-hidden">
        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {STAR_POSITIONS.map((s, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{ left: s.left, top: s.top }}
            />
          ))}
        </div>

        {/* Orbit rings */}
        {RING_RADII.map((radius, i) => {
          const size = radius * 2;
          const slot = i + 1;
          const isPlanetPlaced = Object.values(placed).includes(slot);
          const isTargetSlot =
            held !== null && PLANETS.indexOf(held) + 1 === slot;

          const commonStyle = {
            width: size + '%',
            height: size + '%',
          };

          return (
            <motion.div
              key={`ring-${slot}`}
              onClick={() => handleRingTap(slot)}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full z-[5] pointer-events-auto cursor-pointer ${
                isTargetSlot
                  ? 'border'
                  : isPlanetPlaced
                    ? 'border border-indigo-500/70'
                    : 'border border-dashed border-indigo-800/50'
              }`}
              style={commonStyle}
              animate={
                isTargetSlot
                  ? { borderColor: ['#f97316', '#fbbf24', '#f97316'] }
                  : undefined
              }
              transition={
                isTargetSlot
                  ? { repeat: Infinity, duration: 0.8 }
                  : undefined
              }
            >
              {mode === 'guided' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-slate-800 border border-indigo-600 text-indigo-400 text-[10px] font-black flex items-center justify-center rounded-full">
                  {slot}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Sun */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-yellow-400 z-10"
          style={{ boxShadow: '0 0 20px #fbbf24, 0 0 40px #f59e0b80' }}
        />

        {/* Placed planets orbiting */}
        {Object.entries(placed).map(([planetId, slot]) => {
          const planet = PLANETS.find((p) => p.id === planetId);
          if (!planet) return null;
          const slotIdx = slot - 1;
          const radius = RING_RADII[slotIdx];
          const size = radius * 2;
          const duration = ORBIT_DURATIONS[slotIdx];

          return (
            <motion.div
              key={`orbit-${planetId}`}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-20"
              style={{ width: size + '%', height: size + '%' }}
              animate={{ rotate: 360 }}
              transition={{ duration, repeat: Infinity, ease: 'linear' }}
            >
              <div
                className="absolute"
                style={{
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%) translateY(-50%)',
                }}
              >
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: planet.color,
                    boxShadow: `0 0 8px ${planet.color}80`,
                  }}
                  animate={{ rotate: -360 }}
                  transition={{ duration, repeat: Infinity, ease: 'linear' }}
                >
                  {planet.emoji}
                </motion.div>
              </div>
            </motion.div>
          );
        })}

        {/* Completion screen */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50 gap-2 px-4 text-center"
            >
              <div className="text-6xl">🌟</div>
              <div className="text-3xl font-black text-white">YOU DID IT!</div>
              <div className="text-indigo-300">
                The solar system is complete!
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleReset}
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

      {/* TRAY */}
      <div className="mt-4">
        <div className="text-indigo-300 text-sm mb-2">
          {placedCount} / 8 planets placed
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 px-1">
          {unplaced.map((planet) => {
            const isHeld = held?.id === planet.id;
            const isWrong = wrongId === planet.id;
            const big = planet.id === 'jupiter' || planet.id === 'saturn';
            const sizeClass =
              planet.id === 'jupiter'
                ? 'w-16 h-16'
                : planet.id === 'saturn'
                  ? 'w-14 h-14'
                  : 'w-11 h-11';

            return (
              <motion.button
                key={planet.id}
                onClick={() => handlePlanetTap(planet)}
                className="flex-shrink-0 flex flex-col items-center gap-1"
                animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                transition={isWrong ? { duration: 0.4 } : { duration: 0.15 }}
              >
                <div
                  className={`${sizeClass} rounded-full flex items-center justify-center transition-transform ${
                    isHeld ? 'scale-125 ring-4 ring-orange-400' : ''
                  }`}
                  style={{
                    backgroundColor: planet.color,
                    boxShadow: `0 0 12px ${planet.color}60`,
                  }}
                >
                  <span className={big ? 'text-2xl' : 'text-xl'}>
                    {planet.emoji}
                  </span>
                </div>
                <span className="text-[10px] text-indigo-300 font-bold">
                  {planet.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
