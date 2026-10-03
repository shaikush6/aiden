'use client';

import { motion } from 'framer-motion';

/** "Show me": reveals the Block Buddies as a hint. Using it means the step no longer counts as first try. */
export default function PeekButton({ onClick, label = '👀 SHOW ME' }: { onClick: () => void; label?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="bg-yellow-300 border-b-4 border-yellow-500 rounded-2xl px-5 py-2 font-black text-lg text-yellow-900 shadow"
      aria-label="Show me the Block Buddies"
    >
      {label}
    </motion.button>
  );
}
