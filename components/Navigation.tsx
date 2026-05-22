'use client';

import { motion } from 'framer-motion';

export type TabId = 'phonics' | 'patterns' | 'math' | 'solar';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  activeColor: string;
  inactiveColor: string;
}

const TABS: Tab[] = [
  { id: 'phonics', label: 'READ', icon: '🔤', activeColor: 'bg-sky-500 text-white', inactiveColor: 'bg-white/80 text-sky-600' },
  { id: 'patterns', label: 'PATTERNS', icon: '🔷', activeColor: 'bg-purple-500 text-white', inactiveColor: 'bg-white/80 text-purple-600' },
  { id: 'math', label: 'NUMBERS', icon: '🔢', activeColor: 'bg-orange-500 text-white', inactiveColor: 'bg-white/80 text-orange-600' },
  { id: 'solar', label: 'SPACE', icon: '🪐', activeColor: 'bg-indigo-600 text-white', inactiveColor: 'bg-white/80 text-indigo-600' },
];

interface NavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="flex gap-2 p-3 bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg mx-4 mt-4">
      {TABS.map(tab => (
        <motion.button
          key={tab.id}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => onTabChange(tab.id)}
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
