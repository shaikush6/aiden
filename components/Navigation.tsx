'use client';

import { motion } from 'framer-motion';
import { speakText } from '@/lib/speech';

export type TabId = 'phonics' | 'patterns' | 'math' | 'solar' | 'teacher' | 'hebrew';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  spokenName: string;
  activeColor: string;
  inactiveColor: string;
}

const TABS: Tab[] = [
  { id: 'phonics', label: 'READ', icon: '🔤', spokenName: 'Read with me!', activeColor: 'bg-sky-500 text-white', inactiveColor: 'bg-white/80 text-sky-600' },
  { id: 'patterns', label: 'PATTERNS', icon: '🔷', spokenName: 'Spot the Pattern!', activeColor: 'bg-purple-500 text-white', inactiveColor: 'bg-white/80 text-purple-600' },
  { id: 'math', label: 'NUMBERS', icon: '🔢', spokenName: 'Number Time!', activeColor: 'bg-orange-500 text-white', inactiveColor: 'bg-white/80 text-orange-600' },
  { id: 'solar', label: 'SPACE', icon: '🪐', spokenName: 'Space Explorer!', activeColor: 'bg-indigo-600 text-white', inactiveColor: 'bg-white/80 text-indigo-600' },
  { id: 'teacher', label: 'TEACHER', icon: '🎓', spokenName: 'Talk to Mimi!', activeColor: 'bg-emerald-500 text-white', inactiveColor: 'bg-white/80 text-emerald-600' },
  { id: 'hebrew',  label: 'עברית',   icon: '🇮🇱', spokenName: 'עברית!',        activeColor: 'bg-blue-600 text-white',   inactiveColor: 'bg-white/80 text-blue-600' },
];

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const handleTabClick = (tab: Tab) => {
    onTabChange(tab.id);
    speakText(tab.spokenName);
  };

  return (
    <nav className="flex gap-2 p-3 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg mx-4 mt-4">
      {TABS.map(tab => (
        <motion.button
          key={tab.id}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleTabClick(tab)}
          className={`
            flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl
            font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-sm
            min-h-[64px] select-none
            ${activeTab === tab.id ? tab.activeColor + ' shadow-md' : tab.inactiveColor}
          `}
        >
          <span className="text-2xl leading-none">{tab.icon}</span>
          <span className="leading-none tracking-wide">{tab.label}</span>
        </motion.button>
      ))}
    </nav>
  );
}
