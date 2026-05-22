'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation, { type TabId } from '@/components/Navigation';
import PhonicsTab from '@/components/PhonicsTab';
import PatternsTab from '@/components/PatternsTab';
import MathTab from '@/components/MathTab';
import SolarTab from '@/components/SolarTab';

const TAB_BACKGROUNDS: Record<TabId, string> = {
  phonics: 'from-sky-300 via-sky-200 to-cyan-200',
  patterns: 'from-purple-300 via-violet-200 to-fuchsia-200',
  math: 'from-orange-300 via-amber-200 to-yellow-200',
  solar: 'from-slate-900 via-indigo-950 to-slate-900',
};

const TAB_HEADERS: Record<TabId, { title: string; subtitle: string; icon: string; textColor: string }> = {
  phonics: { title: 'READ WITH ME', subtitle: 'Tap words and letters to hear them!', icon: '🔤', textColor: 'text-sky-800' },
  patterns: { title: 'SPOT THE PATTERN', subtitle: 'What comes next?', icon: '🔷', textColor: 'text-purple-800' },
  math: { title: 'NUMBER TIME', subtitle: 'Count, add, and explore!', icon: '🔢', textColor: 'text-orange-800' },
  solar: { title: 'SPACE EXPLORER', subtitle: 'Discover our solar system!', icon: '🪐', textColor: 'text-indigo-200' },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('phonics');

  const header = TAB_HEADERS[activeTab];
  const bg = TAB_BACKGROUNDS[activeTab];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bg} transition-all duration-500`}>
      {/* App header */}
      <header className="pt-4 pb-2 px-4 flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-black leading-none ${header.textColor} drop-shadow`}>
            {header.icon} {header.title}
          </h1>
          <p className={`text-sm font-bold mt-0.5 ${activeTab === 'solar' ? 'text-indigo-300' : 'text-gray-500'}`}>
            {header.subtitle}
          </p>
        </div>
        {/* Aiden badge */}
        <div className="bg-white/80 rounded-2xl px-3 py-2 shadow text-center">
          <p className="text-xs font-black text-gray-400 leading-none">FOR</p>
          <p className="text-xl font-black text-indigo-600 leading-none">AIDEN</p>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <main className="mt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'phonics' && <PhonicsTab />}
            {activeTab === 'patterns' && <PatternsTab />}
            {activeTab === 'math' && <MathTab />}
            {activeTab === 'solar' && <SolarTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
