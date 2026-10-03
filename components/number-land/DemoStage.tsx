'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Demo } from '@/lib/number-land/words';
import NumberBuddy from './NumberBuddy';

const Caption = ({ children }: { children: string }) => (
  <p className="font-black text-2xl text-slate-700 dark:text-slate-200">{children}</p>
);

/**
 * A tiny animation showing what a math word means. Mount it with a fresh `key` to replay it.
 * plus puts two buddies together, minus takes some away, more and less compare, odd and even show pairs.
 */
export default function DemoStage({ demo }: { demo: Demo }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setStage(1), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-[230px] flex flex-col items-center justify-end gap-3">
      {demo === 'plus' && (
        <AnimatePresence mode="wait">
          {stage === 0 ? (
            <motion.div key="parts" exit={{ opacity: 0, scale: 0.6 }} className="flex items-end gap-6">
              <NumberBuddy n={2} size={38} />
              <span className="text-5xl font-black text-emerald-500 pb-8">+</span>
              <NumberBuddy n={3} size={38} />
            </motion.div>
          ) : (
            <motion.div key="whole" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 12 }} className="flex flex-col items-center gap-2">
              <NumberBuddy n={5} size={38} />
              <Caption>2 + 3 = 5</Caption>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {demo === 'minus' && (
        <div className="flex items-end gap-6">
          <NumberBuddy n={stage === 0 ? 5 : 3} size={38} />
          <motion.div animate={stage === 1 ? { x: 70, opacity: 0.15, rotate: 12 } : { x: 0, opacity: 0, rotate: 0 }} transition={{ duration: 0.9 }}>
            <NumberBuddy n={2} size={38} />
          </motion.div>
          {stage === 1 && <Caption>5 − 2 = 3</Caption>}
        </div>
      )}

      {(demo === 'more' || demo === 'less') && (
        <div className="flex items-end gap-10">
          {[3, 5].map(n => {
            const winner = demo === 'more' ? n === 5 : n === 3;
            return (
              <motion.div
                key={n}
                animate={stage === 1 && winner ? { scale: 1.12 } : { scale: 1 }}
                className={`rounded-2xl p-3 flex flex-col items-center gap-1 ${stage === 1 && winner ? 'bg-yellow-200/70 dark:bg-yellow-400/20 ring-4 ring-yellow-300' : ''}`}
              >
                <NumberBuddy n={n} size={34} />
                <span className="font-black text-xl text-slate-700 dark:text-slate-200">{stage === 1 && winner ? demo : ''}&nbsp;</span>
              </motion.div>
            );
          })}
        </div>
      )}

      {demo === 'odd' && (
        <>
          <NumberBuddy n={5} size={40} leftover />
          <Caption>one block is left over!</Caption>
        </>
      )}

      {demo === 'even' && (
        <>
          <NumberBuddy key={stage} n={6} size={40} pairs />
          <Caption>everyone has a partner!</Caption>
        </>
      )}
    </div>
  );
}
