'use client';

import { motion } from 'framer-motion';
import NumberBuddy from '../number-land/NumberBuddy';

// Our own Block Buddies: a number you can see and count. One cube per unit, a friendly face on top.
// Up to 5 is one tower; 6-10 stand as a 5-tower plus the rest, so the child sees 7 as 5 and 2.
const COLORS = [
  'bg-teal-400 border-teal-600', 'bg-pink-400 border-pink-600', 'bg-lime-400 border-lime-600',
  'bg-violet-400 border-violet-600', 'bg-orange-400 border-orange-600', 'bg-sky-400 border-sky-600',
  'bg-rose-400 border-rose-600', 'bg-amber-400 border-amber-600', 'bg-indigo-400 border-indigo-600',
  'bg-emerald-400 border-emerald-600',
];

export function buddyColor(n: number): string {
  return COLORS[(Math.max(1, n) - 1) % COLORS.length];
}

interface Props {
  n: number;
  /** Cube size in px. */
  size?: number;
  /** Index of the cube to light up (counting or sounding out), bottom cube is 0. */
  lit?: number | null;
  /** Optional label on each cube (e.g. the spelling of each sound). */
  labels?: string[];
  showNumber?: boolean;
  /** Lay the blocks out left to right, in reading order (for counting sounds in a word). */
  horizontal?: boolean;
}

export default function BlockBuddy({ n, size = 44, lit = null, labels, showNumber = false, horizontal = false }: Props) {
  // Plain numbers use the shared Block Buddy shapes (pairs, a left-over block, ten-blocks).
  if (!labels && !horizontal) return <NumberBuddy n={n} size={size} lit={lit} showNumber={showNumber} />;
  const color = buddyColor(n);
  const columns = horizontal ? [n] : n <= 5 ? [n] : [5, n - 5];
  let index = 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-1">
        {columns.map((count, c) => {
          const cubes = Array.from({ length: count }, () => index++);
          return (
            <div key={c} className={horizontal ? 'flex flex-row items-center' : 'flex flex-col-reverse items-center'}>
              {cubes.map((i, k) => {
                const isTop = horizontal ? k === 0 : c === 0 && k === count - 1;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: lit === i ? 1.15 : 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className={`relative border-4 rounded-lg flex items-center justify-center font-black text-slate-900
                      ${color} ${lit === i ? 'ring-4 ring-yellow-300 brightness-125' : ''}`}
                    style={{ width: size, height: size, fontSize: size * 0.42 }}
                  >
                    {labels?.[i]}
                    {isTop && !labels && (
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5" aria-hidden>
                        <span className="flex gap-2">
                          <span className="w-2 h-2 bg-slate-900 rounded-full" />
                          <span className="w-2 h-2 bg-slate-900 rounded-full" />
                        </span>
                        <span className="w-4 h-2 border-b-[3px] border-slate-900 rounded-b-full" />
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>
      {showNumber && <span className="font-black text-3xl text-slate-800 dark:text-white leading-none">{n}</span>}
    </div>
  );
}

/** Big + and − buttons for building a tower. */
export function TowerControls({ n, max, onChange, disabled }: { n: number; max: number; onChange: (n: number) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <motion.button
        type="button" whileTap={{ scale: 0.88 }} disabled={disabled || n <= 0}
        onClick={() => onChange(n - 1)}
        className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700 border-b-4 border-slate-400 text-4xl font-black disabled:opacity-30"
        aria-label="Take a block away"
      >
        −
      </motion.button>
      <span className="text-5xl font-black w-16 text-center text-slate-800 dark:text-white">{n}</span>
      <motion.button
        type="button" whileTap={{ scale: 0.88 }} disabled={disabled || n >= max}
        onClick={() => onChange(n + 1)}
        className="w-16 h-16 rounded-2xl bg-emerald-400 border-b-4 border-emerald-600 text-4xl font-black text-white disabled:opacity-30"
        aria-label="Add a block"
      >
        +
      </motion.button>
    </div>
  );
}
