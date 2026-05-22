'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PLANETS, FUN_FACTS, type Planet } from '@/lib/solar-data';
import { speakText } from '@/lib/speech';

function PlanetOrbit({ planet, onClick }: { planet: Planet; onClick: (p: Planet) => void }) {
  return (
    <>
      {/* Orbit ring */}
      <div
        className="absolute rounded-full border border-white/10 pointer-events-none"
        style={{
          width: planet.orbitRadius * 2,
          height: planet.orbitRadius * 2,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Orbiting planet */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: planet.orbitDuration, repeat: Infinity, ease: 'linear' }}
        className="absolute pointer-events-none"
        style={{
          width: planet.orbitRadius * 2,
          height: planet.orbitRadius * 2,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Planet dot at top of orbit */}
        <motion.button
          whileHover={{ scale: 1.4 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onClick(planet)}
          className="absolute cursor-pointer pointer-events-auto group"
          style={{
            width: planet.size,
            height: planet.size,
            left: '50%',
            top: 0,
            marginLeft: -planet.size / 2,
            marginTop: -planet.size / 2,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${planet.glowColor}, ${planet.color})`,
            boxShadow: `0 0 ${planet.size}px ${planet.color}80`,
          }}
        >
          {/* Saturn rings */}
          {planet.id === 'saturn' && (
            <div
              className="absolute"
              style={{
                width: planet.size * 2.2,
                height: planet.size * 0.4,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotateX(70deg)',
                border: `3px solid #EAB30880`,
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
          )}
          {/* Planet name tooltip */}
          <span
            className="absolute left-1/2 -translate-x-1/2 -top-6 text-white text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-0.5 rounded pointer-events-none"
          >
            {planet.name}
          </span>
        </motion.button>
      </motion.div>
    </>
  );
}

function Orrery({ onPlanetClick }: { onPlanetClick: (p: Planet) => void }) {
  // Show only inner planets in compact view, all in full
  const [showAll, setShowAll] = useState(false);
  const visiblePlanets = showAll ? PLANETS : PLANETS.slice(0, 5);
  const orrerySize = showAll ? 1020 : 620;
  const containerSize = Math.min(orrerySize, typeof window !== 'undefined' ? window.innerWidth - 32 : 380);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ width: containerSize, height: containerSize, maxWidth: '100%' }}
      >
        {/* Stars background */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() > 0.7 ? 2 : 1,
                height: Math.random() > 0.7 ? 2 : 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </div>

        {/* Sun */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute rounded-full cursor-pointer z-10"
          style={{
            width: 56,
            height: 56,
            background: 'radial-gradient(circle at 40% 40%, #FEF08A, #F59E0B, #DC2626)',
            boxShadow: '0 0 40px #F59E0B, 0 0 80px #F59E0B40',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => speakText('The Sun! Our giant star at the center of our solar system! It gives us light and warmth!', 0.8, 1.1)}
        />
        <div
          className="absolute text-xs font-black text-yellow-300 z-10"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, 36px)' }}
        >
          ☀️
        </div>

        {/* Planets */}
        {visiblePlanets.map(planet => (
          <PlanetOrbit key={planet.id} planet={planet} onClick={onPlanetClick} />
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowAll(v => !v)}
        className="text-indigo-300 font-black text-sm bg-white/10 px-4 py-2 rounded-xl"
      >
        {showAll ? 'SHOW LESS ←' : 'SEE ALL 8 PLANETS →'}
      </motion.button>
    </div>
  );
}

function PlanetCard({ planet, onClose }: { planet: Planet; onClose: () => void }) {
  const handleRead = () => {
    speakText(`${planet.name}! ${planet.facts.join(' ')}`, 0.8, 1.1);
  };

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto"
    >
      <div
        className="rounded-t-3xl p-6 shadow-2xl border-t-4"
        style={{
          background: `linear-gradient(135deg, #0f172a, #1e1b4b)`,
          borderColor: planet.color,
        }}
      >
        {/* Handle */}
        <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4" />

        {/* Planet header */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-20 h-20 rounded-full flex-shrink-0 shadow-lg"
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

        {/* Stats grid */}
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
              transition={{ delay: i * 0.1 }}
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
            className="flex-1 py-3 rounded-xl font-black text-white text-lg"
            style={{ background: planet.color }}
          >
            🔊 READ TO ME
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            className="py-3 px-5 bg-white/20 rounded-xl font-black text-white text-lg"
          >
            ✕
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function SizeComparison({ onPlanetClick }: { onPlanetClick: (p: Planet) => void }) {
  // Scale sizes relative to Jupiter
  const maxDiam = 139820;
  const minSize = 14;
  const maxSize = 60;

  return (
    <div className="bg-white/5 rounded-2xl p-4">
      <p className="text-indigo-300 font-black text-sm text-center mb-4 tracking-widest">PLANET SIZE COMPARISON</p>
      <div className="flex items-end justify-around gap-2">
        {PLANETS.map(p => {
          const size = Math.max(minSize, (p.diameterKm / maxDiam) * maxSize);
          return (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPlanetClick(p)}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <div
                className="rounded-full"
                style={{
                  width: size,
                  height: size,
                  background: `radial-gradient(circle at 35% 35%, ${p.glowColor}, ${p.color})`,
                  boxShadow: `0 0 ${size / 2}px ${p.color}50`,
                }}
              />
              <span className="text-white/60 text-xs font-bold" style={{ fontSize: '9px' }}>
                {p.name.slice(0, 3)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function SolarTab() {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);

  const handlePlanetClick = useCallback((planet: Planet) => {
    setSelectedPlanet(planet);
    speakText(planet.name, 0.8, 1.2);
  }, []);

  const handleFunFact = () => {
    const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
    setFunFact(fact);
    speakText(fact, 0.8, 1.1);
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-white">SPACE EXPLORER 🚀</h2>
        <p className="text-indigo-300 text-sm font-bold mt-1">TAP A PLANET TO EXPLORE!</p>
      </div>

      {/* Orrery */}
      <div className="flex justify-center overflow-x-auto">
        <Orrery onPlanetClick={handlePlanetClick} />
      </div>

      {/* Size comparison */}
      <SizeComparison onPlanetClick={handlePlanetClick} />

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

      {/* Planet list */}
      <div className="grid grid-cols-2 gap-3">
        {PLANETS.map(p => (
          <motion.button
            key={p.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePlanetClick(p)}
            className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 text-left border border-white/10"
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

      {/* Planet detail card */}
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
            <PlanetCard planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
