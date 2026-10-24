'use client';

import { motion } from 'framer-motion';

/** A big, obvious way to hear everything on the screen, for when reading it is too much. */
export default function ReadItButton({ onClick, label = 'READ IT TO ME' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className="bg-sky-500 border-b-4 border-sky-700 text-white rounded-2xl px-5 py-2 font-black text-lg shadow flex items-center gap-2"
      aria-label="Read everything on the screen to me"
    >
      <span aria-hidden>🔊</span> {label}
    </motion.button>
  );
}
