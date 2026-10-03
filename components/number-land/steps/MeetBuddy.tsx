'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { displayScript } from '@/lib/reading-quest/script';
import { buddyLayout } from '@/lib/number-land/buddy';
import { NL } from '@/lib/number-land/lines';
import { meetBuddy } from '@/lib/number-land/progress';
import { teenFact } from '@/lib/number-land/sentences';
import { NUMBER_ENTRIES, NUMBER_TEXT } from '@/lib/number-land/words';
import { sfx } from '@/lib/sfx';
import { BigButton, Guide, SpeakerButton, WordView, useAlive } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import NumberText from '../NumberText';
import { countingOrder } from '../useCounting';
import { useRunOnMount } from '../useRunOnMount';
import type { StepProps } from '../types';

/** Meet a Block Buddy: it builds block by block while we count, then its name appears to sound out. */
export default function MeetBuddy({ step, onDone }: StepProps<'meet'>) {
  const { n } = step;
  const entry = NUMBER_ENTRIES[n];
  const alive = useAlive();
  const total = buddyLayout(n).cells.length;
  const [shown, setShown] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [named, setNamed] = useState(false);

  /** Build the buddy while counting aloud, then reveal its name. */
  const restart = useRunOnMount(async token => {
    const stale = () => !alive.current || token.cancelled;
    if (!(await say(NL.meetBuddy)) || stale()) return;
    for (const i of countingOrder(n)) {
      if (stale()) return;
      setShown(i + 1);
      setLit(i);
      sfx.count(i);
      if (!(await say(lineClip(NUMBER_TEXT[i + 1], 'word')))) return;
    }
    if (stale()) return;
    setLit(null);
    setShown(total);
    setNamed(true);
    await say(lineClip(NUMBER_TEXT[n], 'word'), entry.tip);
  });

  const replay = () => {
    setNamed(false);
    setLit(null);
    setShown(0);
    restart();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={named ? displayScript(entry.tip) : NL.meetBuddy} onReplay={replay} />

      <div className="min-h-[270px] flex items-end justify-center">
        <NumberBuddy n={n} size={n > 10 ? 34 : 50} shown={shown} lit={lit} />
      </div>

      <AnimatePresence>
        {named && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-4">
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-8 py-4 flex items-center gap-4">
              <WordView word={entry.word} size="xl" buttons heart={entry.heart} />
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
