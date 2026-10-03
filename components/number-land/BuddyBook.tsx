'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import type { NLProgress } from '@/lib/number-land/progress';
import { parityFact } from '@/lib/number-land/riddles';
import { teenFact } from '@/lib/number-land/sentences';
import { MAX_NUMBER, NUMBER_ENTRIES, NUMBER_TEXT } from '@/lib/number-land/words';
import { BigButton, Guide, SpeakerButton, WordView, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from './NumberBuddy';
import NumberText from './NumberText';
import { useCounting } from './useCounting';

/** Every Block Buddy he has met. Tap one to count it, hear its name, and read a fact about it. */
export default function BuddyBook({ progress, onBack }: { progress: NLProgress; onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const { lit, run } = useCounting();
  useSayOnMount(NL.bookWelcome);
  const met = new Set(progress.buddies);
  const words = new Set(progress.words);

  const hello = async (n: number) => {
    setOpen(n);
    await say(lineClip(NUMBER_TEXT[n], 'word'));
    await run(n);
  };

  return (
    <div className="flex flex-col gap-5 px-1">
      <div className="flex items-center justify-between gap-3">
        <BigButton onClick={onBack} color="bg-sky-500 border-sky-700" label="Back to map">◀ MAP</BigButton>
        <p className="font-black text-2xl text-slate-800 dark:text-white">📖 {met.size} / {MAX_NUMBER + 1}</p>
      </div>
      <Guide text={NL.bookWelcome} onReplay={() => say(NL.bookWelcome)} />

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {NUMBER_ENTRIES.map((e, n) => {
          const have = met.has(n);
          return (
            <motion.button
              key={n}
              type="button"
              whileHover={have ? { scale: 1.05 } : undefined}
              whileTap={{ scale: 0.95 }}
              onClick={() => (have ? hello(n) : say(NL.bookLocked))}
              className={`rounded-3xl border-4 border-white shadow-lg p-3 min-h-[170px] flex flex-col items-center justify-end gap-2
                ${have ? 'bg-gradient-to-b from-yellow-100 to-amber-200 dark:from-slate-700 dark:to-slate-800' : 'bg-slate-200 dark:bg-slate-700'}`}
              aria-label={have ? `Block Buddy ${n}` : 'Not met yet'}
            >
              {have ? (
                <>
                  <NumberBuddy n={n} size={n > 10 ? 9 : 14} />
                  <span className="font-black text-xl capitalize text-slate-800 dark:text-white">{e.word.text}</span>
                </>
              ) : (
                <>
                  <span className="text-5xl opacity-30 grayscale" aria-hidden>🧱</span>
                  <span className="font-black text-slate-500 text-3xl">?</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-6 flex flex-col items-center gap-4 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="min-h-[200px] flex items-end">
                <NumberBuddy n={open} size={open > 10 ? 24 : 38} lit={lit} />
              </div>
              <div className="flex items-center gap-3">
                <WordView word={NUMBER_ENTRIES[open].word} size="lg" buttons heart={NUMBER_ENTRIES[open].heart} />
                <SpeakerButton onClick={() => hello(open)} label="Count it" />
              </div>
              {words.has('is') && words.has('odd') && words.has('even') && <NumberText text={parityFact(open)} size="text-2xl sm:text-3xl" />}
              {open > 10 && words.has('and') && words.has('is') && <NumberText text={teenFact(open)} size="text-2xl sm:text-3xl" />}
              <BigButton onClick={() => setOpen(null)} color="bg-sky-500 border-sky-700" label="Close">OK ✓</BigButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
