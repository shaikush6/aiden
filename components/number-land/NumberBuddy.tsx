'use client';

import { motion } from 'framer-motion';
import { buddyLayout, cellColor, isOdd } from '@/lib/number-land/buddy';

interface Props {
  n: number;
  /** Block size in px. */
  size?: number;
  /** How many blocks are showing (counting animations raise this one by one). Defaults to all. */
  shown?: number;
  /** Block to light up while counting aloud (0-based). */
  lit?: number | null;
  asleep?: boolean;
  showNumber?: boolean;
  /** Make the left-over block of an odd number pulse. */
  leftover?: boolean;
  /** Ripple through the pairs of an even number. */
  pairs?: boolean;
}

function Face({ size, asleep }: { size: number; asleep: boolean }) {
  const eye = Math.max(3, Math.round(size * 0.13));
  return (
    <span className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: size * 0.05 }} aria-hidden>
      <span className="flex" style={{ gap: size * 0.22 }}>
        {[0, 1].map(i => asleep
          ? <span key={i} className="bg-slate-800 rounded-full" style={{ width: eye * 1.6, height: Math.max(2, eye * 0.35) }} />
          : <span key={i} className="bg-slate-900 rounded-full" style={{ width: eye, height: eye }} />)}
      </span>
      <span
        className="border-slate-900 rounded-b-full"
        style={{ width: size * (asleep ? 0.18 : 0.34), height: size * (asleep ? 0.1 : 0.17), borderBottomWidth: Math.max(2, size * 0.06) }}
      />
    </span>
  );
}

/**
 * A Block Buddy: a number you can see and count. Even numbers stand in pairs, odd numbers have one
 * block left over on top, and numbers above ten show a gold ten-block with the ones beside it.
 */
export default function NumberBuddy({
  n, size = 40, shown, lit = null, asleep = false, showNumber = false, leftover = false, pairs = false,
}: Props) {
  const { cells, cols, rows } = buddyLayout(n);
  const gap = Math.max(2, Math.round(size * 0.07));
  const step = size + gap;
  const visible = Math.min(shown ?? cells.length, cells.length);
  const faceAt = Math.max(0, visible - 1);

  return (
    <div className="flex flex-col items-center gap-1">
      {n === 0 ? (
        // Zero is an empty outline with a face: nothing there, but still a friend.
        <div className="relative border-4 border-dashed border-slate-400 rounded-xl" style={{ width: size * 1.5, height: size * 1.5 }}>
          <Face size={size * 1.5} asleep={asleep} />
        </div>
      ) : (
        <div className="relative" style={{ width: cols * step - gap, height: rows * step - gap }}>
          {cells.map((c, i) => {
            const isShown = i < visible;
            const isLeftover = leftover && isOdd(n) && i === cells.length - 1;
            return (
              <motion.div
                key={i}
                initial={false}
                animate={
                  pairs && isShown
                    ? { scale: [1, 1.14, 1], opacity: 1 }
                    : { scale: isShown ? (lit === i ? 1.18 : 1) : 0, opacity: isShown ? 1 : 0 }
                }
                transition={pairs ? { duration: 0.5, delay: c.y * 0.15 } : { type: 'spring', stiffness: 420, damping: 18 }}
                className={`absolute border-4 rounded-lg ${cellColor(n, c.group)}
                  ${lit === i ? 'ring-4 ring-yellow-300 brightness-125 z-10' : ''}
                  ${isLeftover ? 'ring-4 ring-rose-400 animate-pulse z-10' : ''}`}
                style={{ width: size, height: size, left: c.x * step, bottom: c.y * step }}
              >
                {i === faceAt && <Face size={size} asleep={asleep} />}
              </motion.div>
            );
          })}
        </div>
      )}
      {asleep && <span className="text-lg leading-none text-slate-500 dark:text-slate-300 font-black" aria-hidden>z z z</span>}
      {showNumber && <span className="font-black text-3xl text-slate-800 dark:text-white leading-none">{n}</span>}
    </div>
  );
}
