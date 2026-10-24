'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { buddyLayout } from '@/lib/number-land/buddy';
import { NL } from '@/lib/number-land/lines';
import { meetBuddy } from '@/lib/number-land/progress';
import { meetName, teenFact } from '@/lib/number-land/speech';
import { NUMBER_ENTRIES, NUMBER_TEXT } from '@/lib/number-land/words';
import { sfx } from '@/lib/sfx';
import { BigButton, Guide, SpeakerButton, WordView, useAlive } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import NumberText from '../NumberText';
import { NumeralTile } from '../Terms';
import { countingOrder } from '../useCounting';
import { useRunOnMount } from '../useRunOnMount';
import type { StepProps } from '../types';

/**
 * Meet a number: its Block Buddy builds block by block while we count, then the numeral appears
 * with its name to read. Everything can be tapped: the buddy counts again, the numeral says its name.
 */
export default function MeetBuddy({ step, onDone }: StepProps<'meet'>) {
  const { n } = step;
  const entry = NUMBER_ENTRIES[n];
  const alive = useAlive();
  const total = buddyLayout(n).cells.length;
  const [shown, setShown] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [named, setNamed] = useState(false);
  const name = meetName(n);

  /** Show the finished buddy with its numeral and name (also the fallback if the narration gets interrupted). */
  const reveal = () => {
    setLit(null);
    setShown(total);
    setNamed(true);
  };

  /** Build the buddy while counting aloud, then reveal the numeral and its name. */
  const restart = useRunOnMount(async token => {
    const stale = () => !alive.current || token.cancelled;
    if (!(await say(NL.meetBuddy))) { if (!stale()) reveal(); return; }
    if (stale()) return;
    for (const i of countingOrder(n)) {
      if (stale()) return;
      setShown(i + 1);
      setLit(i);
      sfx.count(i);
      // If something spoke over the counting (a switch was tapped), skip ahead rather than leave him waiting.
      if (!(await say(lineClip(NUMBER_TEXT[i + 1], 'word')))) { if (!stale()) reveal(); return; }
    }
    if (stale()) return;
    reveal();
    await say(name);
    if (stale()) return;
    if (n > 10) await say(teenFact(n));
  });

  const replay = () => {
    setNamed(false);
    setLit(null);
    setShown(0);
    restart();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Guide text={named ? name : NL.meetBuddy} onReplay={replay} />

      <div className="min-h-[230px] flex items-end justify-center gap-8">
        <NumberBuddy n={n} size={n > 10 ? 24 : 40} shown={shown} lit={lit} />
        <AnimatePresence>
          {named && (
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}>
              <NumeralTile n={n} scale="lg" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {named && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-3 flex items-center gap-4">
              <WordView word={entry.word} size="lg" buttons heart={entry.heart} />
              <SpeakerButton onClick={() => say(lineClip(NUMBER_TEXT[n], 'word'))} label="Hear its name" />
            </div>
            {n > 10 && <NumberText text={teenFact(n)} size="text-2xl sm:text-3xl" />}
            <BigButton onClick={() => { meetBuddy(n); onDone({ firstTry: true }); }} label="Next">NEXT ▶</BigButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
