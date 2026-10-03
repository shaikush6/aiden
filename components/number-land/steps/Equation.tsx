'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { say } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { equationFull, equationLead } from '@/lib/number-land/sentences';
import { ChoiceCard, Guide, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import NumberText from '../NumberText';
import PeekButton from '../PeekButton';
import { cardSize, type StepProps } from '../types';

/**
 * Read a number sentence ("Two plus three is"), then pick the Block Buddy that finishes it.
 * The Block Buddies stay hidden until he asks to see them, or until the answer is in.
 */
export default function Equation({ step, onDone }: StepProps<'equation'>) {
  const { op, a, b, answer, options } = step;
  const [peek, setPeek] = useState(false);
  const [solved, setSolved] = useState(false);
  const helped = useRef(false);
  const { right, wrong, busy, stateFor } = useAnswer(r => onDone({ firstTry: r.firstTry && !helped.current }));
  useSayOnMount(NL.equation);

  const full = equationFull(op, a, b, answer);
  const finish = async () => { setSolved(true); await say(full); };
  const symbol = op === 'plus' ? '+' : '−';
  const size = cardSize(Math.max(...options, a, b));

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={NL.equation} onReplay={() => say(NL.equation)} />

      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-5 w-full max-w-3xl flex flex-col items-center gap-3">
        <NumberText text={solved ? full : equationLead(op, a, b)} />
        {!solved && <span className="text-5xl font-black text-violet-500 border-4 border-dashed border-violet-300 rounded-2xl w-20 h-20 flex items-center justify-center">?</span>}
      </div>

      {!solved && !peek && <PeekButton onClick={() => { helped.current = true; setPeek(true); say(NL.showMe); }} />}

      <AnimatePresence mode="wait">
        {(peek || solved) && (
          <motion.div
            key={solved ? 'whole' : 'parts'}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="flex items-end gap-5"
          >
            {solved ? (
              <>
                <NumberBuddy n={answer} size={size + 8} />
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-300 pb-2">{a} {symbol} {b} = {answer}</span>
              </>
            ) : (
              <>
                <NumberBuddy n={a} size={size} />
                <span className="text-5xl font-black text-violet-500 pb-6">{symbol}</span>
                <NumberBuddy n={b} size={size} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!solved && (
        <div className="flex flex-wrap justify-center gap-5 items-end">
          {options.map(o => (
            <ChoiceCard
              key={o}
              label={`Block Buddy ${o}`}
              state={stateFor(String(o), String(answer))}
              disabled={busy}
              onClick={() => (o === answer ? right(finish) : wrong(String(o), finish))}
            >
              <NumberBuddy n={o} size={size} />
            </ChoiceCard>
          ))}
        </div>
      )}
    </div>
  );
}

