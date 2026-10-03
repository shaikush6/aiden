'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { say } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { RIDDLE_QUESTION, fitsAll } from '@/lib/number-land/riddles';
import { MAX_NUMBER, numberWord } from '@/lib/number-land/words';
import { sayWord } from '@/lib/reading-quest/audio';
import { ChoiceCard, Guide, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import NumberText from '../NumberText';
import PeekButton from '../PeekButton';
import { cardSize, type StepProps } from '../types';
import { useCounting } from '../useCounting';

/** Number Detective: read every clue, then find the one Block Buddy who fits them all. */
export default function Riddle({ step, onDone }: StepProps<'riddle'>) {
  const { clues, answer, options } = step;
  const [strip, setStrip] = useState(false);
  const [awake, setAwake] = useState(false);
  const helped = useRef(false);
  const { lit, run } = useCounting();
  const { right, wrong, busy, stateFor } = useAnswer(r => onDone({ firstTry: r.firstTry && !helped.current }));
  useSayOnMount(NL.riddle);

  const reveal = async () => { setAwake(true); await run(answer); await sayWord(numberWord(answer)); };
  const top = Math.min(MAX_NUMBER, Math.max(10, answer, ...options));
  const size = cardSize(Math.max(...options));

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={NL.riddle} onReplay={() => say(NL.riddle)} />

      <div className="bg-amber-50 dark:bg-slate-800 border-4 border-amber-200 dark:border-slate-600 rounded-[2rem] shadow-xl px-6 py-5 w-full max-w-3xl flex flex-col items-center gap-3">
        <span className="font-black tracking-widest text-sm text-amber-700 dark:text-amber-300">🗂️ CASE FILE</span>
        {clues.map((c, i) => <NumberText key={i} text={c.text} size="text-3xl sm:text-4xl" />)}
        <NumberText text={RIDDLE_QUESTION} size="text-3xl sm:text-4xl" />
      </div>

      {!strip ? (
        <PeekButton label="🔦 SHOW ME THE NUMBERS" onClick={() => { helped.current = true; setStrip(true); say(NL.riddleHelp); }} />
      ) : (
        <div className="flex flex-wrap justify-center gap-1.5 max-w-xl" aria-label="Numbers that still fit">
          {Array.from({ length: top }, (_, i) => i + 1).map(k => {
            const fits = fitsAll(clues, k);
            return (
              <motion.span
                key={k}
                initial={{ opacity: 1 }}
                animate={{ opacity: fits ? 1 : 0.2, scale: fits ? 1.15 : 0.9 }}
                transition={{ delay: 0.3 + k * 0.05 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${fits ? 'bg-emerald-400 text-white' : 'bg-white dark:bg-slate-700 text-slate-500'}`}
              >
                {k}
              </motion.span>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-5 items-end">
        {options.map(o => (
          <ChoiceCard
            key={o}
            label={`Block Buddy ${o}`}
            state={stateFor(String(o), String(answer))}
            disabled={busy}
            onClick={() => (o === answer ? right(reveal) : wrong(String(o), reveal))}
          >
            <NumberBuddy n={o} size={size} asleep={!(awake && o === answer)} lit={o === answer ? lit : null} />
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
