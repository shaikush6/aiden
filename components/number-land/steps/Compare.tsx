'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { say } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { compareAnswer, compareFact, compareQuestion } from '@/lib/number-land/sentences';
import { numberWord } from '@/lib/number-land/words';
import { ChoiceCard, Guide, WordView, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import NumberText from '../NumberText';
import type { StepProps } from '../types';

/** "Which is more, five or three?" He reads the question and both number names, then taps a name. */
export default function Compare({ step, onDone }: StepProps<'compare'>) {
  const { a, b, ask } = step;
  const answer = compareAnswer(a, b, ask);
  const [solved, setSolved] = useState(false);
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  useSayOnMount(NL.compare);

  const fact = compareFact(a, b, ask);
  const reveal = async () => { setSolved(true); await say(fact); };
  const size = Math.max(a, b) > 10 ? 20 : 30;

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={NL.compare} onReplay={() => say(NL.compare)} />
      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-5 w-full max-w-3xl flex justify-center">
        <NumberText text={solved ? fact : compareQuestion(a, b, ask)} />
      </div>

      {solved ? (
        <div className="flex items-end gap-10 min-h-[170px]">
          {[a, b].map(n => (
            <motion.div
              key={n}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: n === answer ? 1.1 : 1, opacity: 1 }}
              className={`rounded-2xl p-3 ${n === answer ? 'bg-yellow-200/70 dark:bg-yellow-400/20 ring-4 ring-yellow-300' : ''}`}
            >
              <NumberBuddy n={n} size={size} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6">
          {[a, b].map(n => (
            <ChoiceCard
              key={n}
              label={`name ${n}`}
              state={stateFor(String(n), String(answer))}
              disabled={busy}
              onClick={() => (n === answer ? right(reveal) : wrong(String(n), reveal))}
            >
              <div className="px-4 py-3"><WordView word={numberWord(n)} size="lg" /></div>
            </ChoiceCard>
          ))}
        </div>
      )}
    </div>
  );
}
