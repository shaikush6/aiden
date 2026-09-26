'use client';

import { motion } from 'framer-motion';
import { phonemeClips, say, sayPhoneme } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import { displayGrapheme, type Step } from '@/lib/reading-quest/plan';
import { ChoiceCard, Guide, useAnswer, useSayOnMount, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'hearPick' }>; onDone: (r: StepResult) => void };

export default function HearPick({ step, onDone }: Props) {
  const { phoneme, answer, options } = step;
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  const ask = () => say(LINES.whichSound, phonemeClips(phoneme));
  useSayOnMount(LINES.whichSound, phonemeClips(phoneme));

  return (
    <div className="flex flex-col items-center gap-8">
      <Guide text={LINES.whichSound} onReplay={ask} />

      <motion.button
        type="button"
        onClick={() => sayPhoneme(phoneme)}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="w-36 h-36 rounded-full bg-sky-500 border-b-8 border-sky-700 shadow-xl text-7xl flex items-center justify-center"
        aria-label="Hear the sound again"
      >
        👂
      </motion.button>

      <div className="flex flex-wrap justify-center gap-5">
        {options.map(g => (
          <ChoiceCard
            key={g}
            label={displayGrapheme(g)}
            state={stateFor(g, answer)}
            disabled={busy}
            onClick={() => (g === answer ? right() : wrong(g, () => sayPhoneme(phoneme)))}
          >
            <span className="text-7xl font-black text-slate-800 dark:text-slate-100 px-4">{displayGrapheme(g)}</span>
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
