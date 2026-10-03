'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { say } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { isOdd } from '@/lib/number-land/buddy';
import { parityFact } from '@/lib/number-land/riddles';
import { oddEvenQuestion } from '@/lib/number-land/sentences';
import { MATH_WORDS } from '@/lib/number-land/words';
import { ChoiceCard, Guide, WordView, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import NumberText from '../NumberText';
import type { StepProps } from '../types';

/** "Is five odd or even?" He reads, answers, and then the Block Buddy shows why: pairs, or one left over. */
export default function OddEven({ step, onDone }: StepProps<'oddEven'>) {
  const { n } = step;
  const answer = isOdd(n) ? 'odd' : 'even';
  const [solved, setSolved] = useState(false);
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  useSayOnMount(NL.oddEven);

  const reveal = async () => { setSolved(true); await say(parityFact(n)); };

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={NL.oddEven} onReplay={() => say(NL.oddEven)} />
      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-5 w-full max-w-3xl flex justify-center">
        <NumberText text={solved ? parityFact(n) : oddEvenQuestion(n)} />
      </div>

      {solved && (
        <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[200px] flex items-end">
          <NumberBuddy n={n} size={n > 10 ? 24 : 36} leftover={answer === 'odd'} pairs={answer === 'even'} />
        </motion.div>
      )}

      {!solved && (
        <div className="flex gap-6">
          {(['odd', 'even'] as const).map(k => (
            <ChoiceCard
              key={k}
              label={k}
              state={stateFor(k, answer)}
              disabled={busy}
              onClick={() => (k === answer ? right(reveal) : wrong(k, reveal))}
            >
              <div className="px-6 py-2"><WordView word={MATH_WORDS[k].word} size="lg" /></div>
            </ChoiceCard>
          ))}
        </div>
      )}
    </div>
  );
}
