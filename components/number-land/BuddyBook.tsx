'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import type { NLProgress } from '@/lib/number-land/progress';
import { NUMBER_LEVELS } from '@/lib/number-land/curriculum';
import { LESSONS } from '@/lib/number-land/lessons';
import { oddEvenTold, teenFact } from '@/lib/number-land/speech';
import { SIGN_NAME, SIGN_TOPIC, type Sign, type Topic } from '@/lib/number-land/terms';
import { MAX_NUMBER, NUMBER_ENTRIES, NUMBER_TEXT } from '@/lib/number-land/words';
import { BigButton, Guide, SpeakerButton, WordView, useSayOnMount } from '@/components/reading-quest/ui';
import { useExplain } from './ExplainContext';
import NumberBuddy from './NumberBuddy';
import NumberText from './NumberText';
import { NumeralTile } from './Terms';
import { useCounting } from './useCounting';

const SIGNS: { s: Sign; meaning: string }[] = [
  { s: '+', meaning: 'put together' },
  { s: '−', meaning: 'take away' },
  { s: '=', meaning: 'the same as' },
  { s: '>', meaning: 'more than' },
  { s: '<', meaning: 'less than' },
];

/** Everything he has met: the Block Buddies (tap to count and hear a fact) and the signs (tap to be taught again). */
export default function BuddyBook({ progress, onBack }: { progress: NLProgress; onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const [tab, setTab] = useState<'numbers' | 'signs' | 'lessons'>('numbers');
  const { lit, run } = useCounting();
  const explain = useExplain();
  useSayOnMount(NL.bookWelcome);
  const met = new Set(progress.buddies);
  const signsMet = new Set(progress.signs);
  // A lesson is in the book once he has finished the level that teaches it.
  const lessons = NUMBER_LEVELS.flatMap(l => l.learn.map(topic => ({ topic, done: progress.unlockAll || Boolean(progress.levels[l.id]) })));

  const hello = async (n: number) => {
    setOpen(n);
    await say(lineClip(NUMBER_TEXT[n], 'word'));
    await run(n);
  };

  return (
    <div className="flex flex-col gap-5 px-1">
      <div className="flex items-center justify-between gap-3">
        <BigButton onClick={onBack} color="bg-sky-500 border-sky-700" label="Back to map">◀ MAP</BigButton>
        <p className="font-black text-2xl text-slate-800 dark:text-white">📖 {met.size} / {MAX_NUMBER + 1} · {signsMet.size} / {SIGNS.length} signs</p>
      </div>
      <Guide text={NL.bookWelcome} onReplay={() => say(NL.bookWelcome)} />

      <div className="flex justify-center gap-3">
        {(['numbers', 'signs', 'lessons'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`font-black text-xl rounded-2xl px-6 py-3 shadow ${tab === t ? 'bg-orange-500 text-white' : 'bg-white/85 dark:bg-slate-800/85 text-orange-700 dark:text-orange-300'}`}
          >
            {t === 'numbers' ? '🧱 NUMBERS' : t === 'signs' ? '➕ SIGNS' : '💡 LESSONS'}
          </button>
        ))}
      </div>

      {tab === 'lessons' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {lessons.map(({ topic, done }: { topic: Topic; done: boolean }) => (
            <motion.button
              key={topic}
              type="button"
              whileHover={done ? { scale: 1.05 } : undefined}
              whileTap={{ scale: 0.95 }}
              onClick={() => (done ? explain.open(topic) : say(NL.bookLocked))}
              className={`rounded-3xl border-4 border-white shadow-lg p-4 min-h-[150px] flex flex-col items-center justify-center gap-2
                ${done ? 'bg-gradient-to-b from-yellow-100 to-amber-200 dark:from-slate-700 dark:to-slate-800' : 'bg-slate-200 dark:bg-slate-700'}`}
              aria-label={done ? `Lesson: ${LESSONS[topic].title}` : 'Not learned yet'}
            >
              {done ? (
                <>
                  <span className="text-6xl" aria-hidden>{LESSONS[topic].icon}</span>
                  <span className="font-black text-lg text-slate-800 dark:text-white text-center leading-tight">{LESSONS[topic].title}</span>
                </>
              ) : (
                <span className="font-black text-slate-500 text-6xl">?</span>
              )}
            </motion.button>
          ))}
        </div>
      ) : tab === 'numbers' ? (
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
                    <span className="font-black text-3xl text-slate-800 dark:text-white leading-none">{n}</span>
                    <span className="font-black text-base capitalize text-slate-600 dark:text-slate-300">{e.word.text}</span>
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
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SIGNS.map(({ s, meaning }) => {
            const have = signsMet.has(s);
            return (
              <motion.button
                key={s}
                type="button"
                whileHover={have ? { scale: 1.05 } : undefined}
                whileTap={{ scale: 0.95 }}
                onClick={() => (have ? explain.open(SIGN_TOPIC[s]) : say(NL.bookLocked))}
                className={`rounded-3xl border-4 border-white shadow-lg p-4 min-h-[170px] flex flex-col items-center justify-center gap-2
                  ${have ? 'bg-gradient-to-b from-yellow-100 to-amber-200 dark:from-slate-700 dark:to-slate-800' : 'bg-slate-200 dark:bg-slate-700'}`}
                aria-label={have ? `The ${SIGN_NAME[s]} sign` : 'Not met yet'}
              >
                {have ? (
                  <>
                    <span className="text-7xl font-black leading-none text-slate-800 dark:text-white">{s}</span>
                    <span className="font-black text-xl text-slate-700 dark:text-slate-200">{SIGN_NAME[s]}</span>
                    <span className="font-bold text-slate-500 dark:text-slate-400">{meaning}</span>
                  </>
                ) : (
                  <span className="font-black text-slate-500 text-6xl">?</span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {open !== null && (
          <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-6 flex flex-col items-center gap-4 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="min-h-[190px] flex items-end gap-6">
                <NumberBuddy n={open} size={open > 10 ? 22 : 34} lit={lit} />
                <NumeralTile n={open} scale="lg" />
              </div>
              <div className="flex items-center gap-3">
                <WordView word={NUMBER_ENTRIES[open].word} size="lg" buttons heart={NUMBER_ENTRIES[open].heart} />
                <SpeakerButton onClick={() => hello(open)} label="Count it" />
              </div>
              <NumberText text={oddEvenTold(open)} size="text-2xl sm:text-3xl" />
              {open > 10 && <NumberText text={teenFact(open)} size="text-2xl sm:text-3xl" />}
              <BigButton onClick={() => setOpen(null)} color="bg-sky-500 border-sky-700" label="Close">OK ✓</BigButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
