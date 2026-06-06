'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { PLANETS, FUN_FACTS, type Planet } from '@/lib/solar-data';
import { speakText } from '@/lib/speech';

// Dynamic import with SSR disabled — Three.js requires browser APIs
const SolarSystem3D = dynamic(() => import('@/components/SolarSystem3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] flex items-center justify-center">
      <div className="text-indigo-300 font-black text-lg animate-pulse">LOADING SOLAR SYSTEM...</div>
    </div>
  ),
});

// New game components (browser-only)
const LaserBlasterGame = dynamic(() => import('@/components/space/LaserBlaster'), { ssr: false });
const OrbitBuilderGame = dynamic(() => import('@/components/space/OrbitBuilder'), { ssr: false });
const ConstellationGame = dynamic(() => import('@/components/space/ConstellationConnect'), { ssr: false });
const DayNightLab = dynamic(() => import('@/components/space/DayNightLab'), { ssr: false });

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
// SECTION NAV
// ============================================================================

type SpaceSection = 'LOOK' | 'BUILD' | 'PLAY' | 'FLY';
type SpaceGame = 'laser' | 'orbit' | 'constellation' | 'daynight' | null;

interface SectionDef {
  id: SpaceSection;
  emoji: string;
  activeBg: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'LOOK', emoji: '🔭', activeBg: 'bg-indigo-600' },
  { id: 'BUILD', emoji: '🏗️', activeBg: 'bg-emerald-600' },
  { id: 'PLAY', emoji: '🎮', activeBg: 'bg-purple-600' },
  { id: 'FLY', emoji: '🚀', activeBg: 'bg-orange-600' },
];

// Reusable game-launch card
function GameCard({
  emoji,
  title,
  subtitle,
  subtitleColor,
  className,
  onClick,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  subtitleColor: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-2 cursor-pointer ${className}`}
    >
      <span className="text-5xl">{emoji}</span>
      <span className="font-black text-white">{title}</span>
      <span className={`text-xs text-center ${subtitleColor}`}>{subtitle}</span>
    </motion.button>
  );
}

export default function SolarTab() {
  const [activeSection, setActiveSection] = useState<SpaceSection>('LOOK');
  const [activeGame, setActiveGame] = useState<SpaceGame>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [funFact, setFunFact] = useState<string | null>(null);

  const handlePlanetSelect = useCallback((id: string) => {
    const planet = PLANETS.find(p => p.id === id);
    if (planet) {
      setSelectedPlanet(planet);
      speakText(planet.name);
    }
  }, []);

  const handleFunFact = useCallback(() => {
    const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
    setFunFact(fact);
    speakText(fact);
  }, []);

  const handleSection = useCallback((section: SpaceSection) => {
    setActiveSection(section);
    setActiveGame(null);
    speakText(section);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 pb-24 min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
      {/* Section navigation */}
      <div className="grid grid-cols-4 gap-2 mx-4 mt-4">
        {SECTIONS.map(section => {
          const isActive = activeSection === section.id;
          return (
            <motion.button
              key={section.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSection(section.id)}
              className={`py-3 rounded-xl font-black text-sm flex flex-col items-center gap-1 shadow ${
                isActive ? `${section.activeBg} text-white` : 'bg-white/10 text-indigo-300'
              }`}
            >
              <span className="text-xl">{section.emoji}</span>
              {section.id}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection + (activeGame || '')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          {/* ============================ LOOK ============================ */}
          {activeSection === 'LOOK' && (
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

          {/* ============================ BUILD ============================ */}
          {activeSection === 'BUILD' && (
            activeGame === null ? (
              <>
                <h2 className="text-2xl font-black text-white text-center">BUILD THE SOLAR SYSTEM 🏗️</h2>
                <div className="grid grid-cols-2 gap-4 mx-4">
                  <GameCard
                    emoji="🪐"
                    title="ORBIT BUILDER"
                    subtitle="Place planets in order!"
                    subtitleColor="text-emerald-300"
                    className="bg-emerald-900/60 border border-emerald-500/40 rounded-2xl p-5"
                    onClick={() => { setActiveGame('orbit'); speakText('Orbit builder!'); }}
                  />
                  <GameCard
                    emoji="⭐"
                    title="STAR CONNECT"
                    subtitle="Draw constellations!"
                    subtitleColor="text-indigo-300"
                    className="bg-indigo-900/60 border border-indigo-500/40 rounded-2xl p-5"
                    onClick={() => { setActiveGame('constellation'); speakText('Connect the stars!'); }}
                  />
                </div>
              </>
            ) : (
              <>
                {activeGame === 'orbit' && <OrbitBuilderGame onBack={() => setActiveGame(null)} />}
                {activeGame === 'constellation' && <ConstellationGame onBack={() => setActiveGame(null)} />}
              </>
            )
          )}

          {/* ============================ PLAY ============================ */}
          {activeSection === 'PLAY' && (
            activeGame === null ? (
              <>
                <h2 className="text-2xl font-black text-white text-center">SPACE GAMES 🎮</h2>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setActiveGame('laser'); speakText('Laser blaster! Shoot the asteroids!'); }}
                  animate={{ borderColor: ['#a855f7', '#ef4444', '#a855f7'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mx-4 flex flex-col items-center gap-2 cursor-pointer bg-gradient-to-br from-purple-900/80 to-red-900/60 border border-purple-500/50 rounded-2xl p-6"
                >
                  <span className="text-6xl" style={{ filter: 'drop-shadow(0 0 12px #a855f7)' }}>🔫</span>
                  <span className="text-3xl font-black text-white">LASER BLASTER</span>
                  <span className="text-purple-300 text-sm">Shoot the asteroids!</span>
                  <span className="bg-purple-600 text-white rounded-xl py-2 px-4 font-black mt-2">PLAY NOW →</span>
                </motion.button>
              </>
            ) : (
              <>
                {activeGame === 'laser' && <LaserBlasterGame onBack={() => setActiveGame(null)} />}
              </>
            )
          )}

          {/* ============================ FLY ============================ */}
          {activeSection === 'FLY' && (
            activeGame === null ? (
              <>
                <h2 className="text-2xl font-black text-white text-center">SPACE LAB 🚀</h2>
                <div className="grid grid-cols-2 gap-4 mx-4">
                  <GameCard
                    emoji="🌍"
                    title="DAY & NIGHT"
                    subtitle="Spin the Earth!"
                    subtitleColor="text-orange-300"
                    className="bg-orange-900/60 border border-orange-500/40 rounded-2xl p-5"
                    onClick={() => { setActiveGame('daynight'); speakText('Day and night lab!'); }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFunFact}
                    className="flex flex-col items-center gap-2 cursor-pointer bg-indigo-900/60 border border-indigo-500/40 rounded-2xl p-5"
                  >
                    <span className="text-5xl">🤩</span>
                    <span className="font-black text-white">DID YOU KNOW?</span>
                    <span className="text-xs text-center text-indigo-300">
                      {funFact ? funFact : 'Tap for a space fact!'}
                    </span>
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                {activeGame === 'daynight' && <DayNightLab onBack={() => setActiveGame(null)} />}
              </>
            )
          )}
        </motion.div>
      </AnimatePresence>

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
