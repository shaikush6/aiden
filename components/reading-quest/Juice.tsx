'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sfx } from '@/lib/sfx';

/**
 * Game feel shared by the Quest and Block Buddy Land: a first-try streak (creature power),
 * stars that fly to a counter, and a COMBO burst. Call celebrate() after each scored step.
 */
export function useJuice() {
  const [streak, setStreak] = useState(0);
  const [starCount, setStarCount] = useState(0);
  const [flying, setFlying] = useState<{ id: number; x: number; y: number }[]>([]);
  const [combo, setCombo] = useState<{ id: number; n: number } | null>(null);
  const nextId = useRef(0);
  const starTarget = useRef<HTMLSpanElement | null>(null);

  const celebrate = (firstTry: boolean) => {
    const n = firstTry ? streak + 1 : 0;
    setStreak(n);
    if (!firstTry) return;
    setStarCount(c => c + 1);
    const box = starTarget.current?.getBoundingClientRect();
    const id = nextId.current++;
    if (box) setFlying(f => [...f, { id, x: box.left + box.width / 2, y: box.top + box.height / 2 }]);
    if (n >= 3 && n % 2 === 1) {
      sfx.combo();
      setCombo({ id, n });
    }
  };

  /** The streak meter and star counter row. */
  const bar = (
    <div className="flex items-center justify-between gap-3 -mt-2 mb-3">
      <span className="w-10" aria-hidden />
      <div className="flex items-center gap-2" aria-label={`Creature power ${Math.min(streak, 3)} of 3`}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ scale: streak > i ? [1.4, 1] : 1, opacity: streak > i ? 1 : 0.25 }}
            className="text-2xl"
          >
            ⚡
          </motion.span>
        ))}
        {streak >= 3 && <span className="font-black text-amber-600 dark:text-amber-300 text-xl">x{streak}</span>}
      </div>
      <span ref={starTarget} className="bg-white/85 dark:bg-slate-800/85 rounded-2xl px-3 py-1 font-black text-xl shadow text-slate-800 dark:text-white">
        ⭐ {starCount}
      </span>
    </div>
  );

  /** Flying stars and the combo burst (fixed-position overlays). */
  const overlay = (
    <>
      {flying.map(f => (
        <motion.span
          key={f.id}
          className="fixed z-50 text-5xl pointer-events-none"
          initial={{ left: '50vw', top: '55vh', scale: 1.8, opacity: 1 }}
          animate={{ left: f.x - 20, top: f.y - 24, scale: 0.6, opacity: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeIn' }}
          onAnimationComplete={() => setFlying(list => list.filter(x => x.id !== f.id))}
          aria-hidden
        >
          ⭐
        </motion.span>
      ))}
      <AnimatePresence>
        {combo && (
          <motion.div
            key={combo.id}
            className="fixed inset-x-0 top-1/3 z-50 flex justify-center pointer-events-none"
            initial={{ scale: 0, rotate: -12, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], rotate: 0, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={() => setTimeout(() => setCombo(c => (c?.id === combo.id ? null : c)), 700)}
          >
            <span className="font-black text-5xl sm:text-6xl text-white bg-gradient-to-r from-orange-500 to-amber-400 border-4 border-white rounded-full px-8 py-3 shadow-2xl">
              ⚡ COMBO x{combo.n}! ⚡
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return { celebrate, bar, overlay };
}
