'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { emitQuestEvent } from '@/lib/reading-quest/events';
import { phonemeClips, say, sayPhoneme } from '@/lib/reading-quest/audio';
import { LINES, randomPraise } from '@/lib/reading-quest/lines';
import { defaultPhoneme } from '@/lib/reading-quest/phonemes';
import { displayGrapheme, type Step } from '@/lib/reading-quest/plan';
import { sfx } from '@/lib/sfx';
import { Guide, useAlive, useSayOnMount, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'bubblePop' }>; onDone: (r: StepResult) => void };

/**
 * Bubble Pop: pop every bubble whose spelling makes the target sound.
 * Later levels include every spelling of that sound (ai, ay, a‑e), so the game teaches alternatives.
 */
export default function BubblePop({ step, onDone }: Props) {
  const { phoneme, bubbles } = step;
  const alive = useAlive();
  const [popped, setPopped] = useState<Set<number>>(() => new Set());
  const [wobble, setWobble] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const remaining = bubbles.filter((b, i) => b.correct && !popped.has(i)).length;
  useSayOnMount(LINES.bubblePop, phonemeClips(phoneme));

  const pop = async (i: number) => {
    const b = bubbles[i];
    if (popped.has(i) || remaining === 0) return;
    if (!b.correct) {
      sfx.wrong();
      emitQuestEvent('wrong');
      setMisses(m => m + 1);
      setWobble(i);
      // Let the child hear why it was wrong: this bubble makes a different sound.
      sayPhoneme(defaultPhoneme(b.label));
      setTimeout(() => { if (alive.current) setWobble(null); }, 500);
      return;
    }
    sfx.pop();
    const next = new Set(popped).add(i);
    setPopped(next);
    const left = bubbles.filter((x, j) => x.correct && !next.has(j)).length
    if (left > 0) { sayPhoneme(phoneme); return; }
    sfx.correct();
    emitQuestEvent('right');
    await say(randomPraise());
    if (alive.current) onDone({ firstTry: misses === 0 });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={`${LINES.bubblePop} /${phoneme}/`} onReplay={() => say(LINES.bubblePop, phonemeClips(phoneme))} />
      <motion.button
        type="button"
        onClick={() => sayPhoneme(phoneme)}
        whileTap={{ scale: 0.9 }}
        className="w-24 h-24 rounded-full bg-sky-500 border-b-8 border-sky-700 shadow-xl text-5xl"
        aria-label="Hear the sound again"
      >
        👂
      </motion.button>
      <div className="relative w-full max-w-3xl rounded-[2rem] bg-gradient-to-b from-cyan-100 to-sky-300 dark:from-sky-900 dark:to-slate-900 p-6 grid grid-cols-3 sm:grid-cols-5 gap-4 place-items-center min-h-[320px]">
        <AnimatePresence>
          {bubbles.map((b, i) => !popped.has(i) && (
            <motion.button
              key={i}
              type="button"
              onClick={() => pop(i)}
              initial={{ scale: 0 }}
              animate={wobble === i ? { x: [0, -10, 10, -6, 6, 0], scale: 1 } : { y: [0, -14, 0], scale: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={wobble === i ? { duration: 0.4 } : { y: { duration: 2 + (i % 4) * 0.4, repeat: Infinity, ease: 'easeInOut' }, scale: { type: 'spring' } }}
              className="w-24 h-24 rounded-full border-4 border-white/80 bg-white/40 dark:bg-white/15 shadow-[inset_-8px_-8px_16px_rgba(255,255,255,.6),inset_6px_6px_12px_rgba(56,189,248,.35)]
                flex items-center justify-center text-4xl font-black text-slate-800 dark:text-white"
              aria-label={`bubble ${b.label}`}
            >
              {displayGrapheme(b.label)}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <p className="font-black text-2xl text-slate-700 dark:text-slate-200">🫧 {remaining} left to pop!</p>
    </div>
  );
}
