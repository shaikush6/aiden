'use client';

import { motion } from 'framer-motion';

/** The guide's face as a big button: tap it to hear what this screen is about. Wiggles while talking. */
export default function HearMe({ emoji, speaking, onTap, small = false }: { emoji: string; speaking: boolean; onTap: () => void; small?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.92 }}
      aria-label="Tap to hear what to do"
      className="flex flex-col items-center gap-1"
    >
      <motion.span
        className={small ? 'text-6xl' : 'text-8xl'}
        animate={speaking ? { rotate: [0, -6, 6, 0], scale: [1, 1.06, 1] } : { rotate: [0, -8, 8, 0] }}
        transition={speaking ? { duration: 0.6, repeat: Infinity } : { duration: 2.4, repeat: Infinity, repeatDelay: 1 }}
        aria-hidden
      >
        {emoji}
      </motion.span>
      <span className={`font-black rounded-full px-4 py-1.5 shadow border-b-4 ${speaking ? 'bg-sky-100 text-sky-700 border-sky-300' : 'bg-sky-500 text-white border-sky-700'} ${small ? 'text-sm' : 'text-base'}`}>
        {speaking ? '🔊 Talking…' : '🔊 Tap me to hear'}
      </span>
    </motion.button>
  );
}
