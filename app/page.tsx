'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation, { type TabId } from '@/components/Navigation';
import AudioSettingsBridge from '@/components/AudioSettingsBridge';
import ProfileBadge from '@/components/profile/ProfileBadge';
import SignIn from '@/components/profile/SignIn';
import StartingPoint from '@/components/profile/StartingPoint';
import { getProfileState, getServerProfileState, initProfile, subscribeProfile } from '@/lib/profile/client';
import PhonicsTab from '@/components/PhonicsTab';
import PatternsTab from '@/components/PatternsTab';
import MathTab from '@/components/MathTab';
import SolarTab from '@/components/SolarTab';
import HebrewTab from '@/components/HebrewTab';
import ExamPrepTab from '@/components/ExamPrepTab';
import ReadingQuest from '@/components/reading-quest/ReadingQuest';
import { setVoiceEnabled } from '@/lib/speech';
const TeacherTab = dynamic(() => import('@/components/TeacherTab'), { ssr: false });

const TAB_BACKGROUNDS: Record<TabId, string> = {
  quest:    'from-lime-200 via-emerald-100 to-sky-200 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950',
  phonics:  'from-sky-300 via-sky-200 to-cyan-200 dark:from-sky-950 dark:via-slate-900 dark:to-slate-950',
  patterns: 'from-purple-300 via-violet-200 to-fuchsia-200 dark:from-violet-950 dark:via-slate-900 dark:to-slate-950',
  math:     'from-orange-300 via-amber-200 to-yellow-200 dark:from-orange-950 dark:via-slate-900 dark:to-slate-950',
  solar:    'from-slate-900 via-indigo-950 to-slate-900',
  teacher:  'from-emerald-300 via-green-200 to-teal-200 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950',
  hebrew:   'from-blue-400 via-blue-200 to-sky-100 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950',
  prep:     'from-rose-300 via-pink-200 to-fuchsia-200 dark:from-rose-950 dark:via-slate-900 dark:to-slate-950',
};

const TAB_HEADERS: Record<TabId, { title: string; subtitle: string; icon: string; textColor: string }> = {
  quest:    { title: 'READING QUEST',   subtitle: 'Read words, rescue animals!',        icon: '🦊', textColor: 'text-emerald-800' },
  phonics:  { title: 'READ WITH ME',    subtitle: 'Tap words and letters to hear them!', icon: '🔤', textColor: 'text-sky-800' },
  patterns: { title: 'SPOT THE PATTERN',subtitle: 'What comes next?',                    icon: '🔷', textColor: 'text-purple-800' },
  math:     { title: 'NUMBER TIME',     subtitle: 'Meet the Block Buddies!',             icon: '🔢', textColor: 'text-orange-800' },
  solar:    { title: 'SPACE EXPLORER',  subtitle: 'Discover our solar system!',          icon: '🪐', textColor: 'text-indigo-200' },
  teacher:  { title: 'TALK TO MIMI',    subtitle: 'Your AI teacher is here!',            icon: '🎓', textColor: 'text-emerald-800' },
  hebrew:   { title: 'עברית',           subtitle: 'Learn Hebrew letters and words!',     icon: '🇮🇱', textColor: 'text-blue-900' },
  prep:     { title: 'BRAIN GAMES',    subtitle: 'Think like a champion!',              icon: '🧠', textColor: 'text-rose-800' },
};

/** The front door: shows the sign-in screen when this device is not signed in, otherwise the app. */
export default function Home() {
  const profile = useSyncExternalStore(subscribeProfile, getProfileState, getServerProfileState);
  useEffect(() => initProfile(), []);

  if (profile.phase === 'checking') {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-200 to-pink-200 dark:from-slate-900 dark:to-indigo-950 text-8xl" aria-label="Loading">🦊</div>;
  }
  if (profile.phase === 'gate') return <SignIn />;
  // Once per account: a returning player can say where they got to, so they do not start over.
  if (profile.phase === 'in' && profile.synced && !profile.prefs.placed) return <StartingPoint />;
  return <App />;
}

function readFlag(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('quest');
  // App only renders in the browser (after the sign-in check), so saved switches can be read straight away.
  const [voiceOn, setVoiceOn] = useState(() => readFlag('aiden-voice') !== 'false');
  const [isDark, setIsDark] = useState(() => readFlag('aiden-dark') === 'true');

  // Apply the saved switches to the audio player and the page.
  useEffect(() => { setVoiceEnabled(voiceOn); }, [voiceOn]);
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    setVoiceEnabled(next);
    localStorage.setItem('aiden-voice', String(next));
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('aiden-dark', String(next));
  };

  const header = TAB_HEADERS[activeTab];
  const bg = TAB_BACKGROUNDS[activeTab];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bg} transition-all duration-500`}>
      <AudioSettingsBridge />
      {/* App header */}
      <header className="pt-4 pb-2 px-4 flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-black leading-none ${header.textColor} drop-shadow`}>
            {header.icon} {header.title}
          </h1>
          <p className={`text-sm font-bold mt-0.5 dark:text-slate-400 ${activeTab === 'solar' ? 'text-indigo-300' : 'text-gray-500'}`}>
            {header.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice toggle */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={toggleVoice}
            className="bg-white/80 dark:bg-slate-700 rounded-2xl w-12 h-12 flex items-center justify-center shadow text-2xl">
            {voiceOn ? '🔊' : '🔇'}
          </motion.button>
          {/* Dark mode toggle */}
          <motion.button whileTap={{ scale: 0.88 }} onClick={toggleDark}
            className="bg-white/80 dark:bg-slate-700 rounded-2xl w-12 h-12 flex items-center justify-center shadow text-2xl">
            {isDark ? '☀️' : '🌙'}
          </motion.button>
          <ProfileBadge />
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
            {activeTab === 'quest' && <div className="px-4 pb-8"><ReadingQuest /></div>}
            {activeTab === 'phonics' && <PhonicsTab />}
            {activeTab === 'patterns' && <PatternsTab />}
            {activeTab === 'math' && <MathTab />}
            {activeTab === 'solar' && <SolarTab />}
            {activeTab === 'teacher' && <TeacherTab />}
            {activeTab === 'hebrew'  && <HebrewTab />}
            {activeTab === 'prep'    && <ExamPrepTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
