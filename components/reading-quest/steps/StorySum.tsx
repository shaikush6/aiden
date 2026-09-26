'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LevelInfo } from '@/lib/reading-quest/catalog';
import { say } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import BlockBuddy from '../BlockBuddy';
import Scene from '../Scene';
import TappableText from '../TappableText';
import { ChoiceCard, Guide, SpeakerButton, useAnswer, useSayOnMount, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'storySum' }>; level: LevelInfo; onDone: (r: StepResult) => void };

/** A decodable number story ("5 cats sit on the log. 2 cats run off."), answered with Block Buddies. */
export default function StorySum({ step, level, onDone }: Props) {
  const { sum, options } = step;
  const question = sum.question === 'now' ? LINES.sumNow : LINES.sumLeft;
  const { right, wrong, busy, stateFor, status, misses } = useAnswer(onDone);
  const [solved, setSolved] = useState(false);
  useSayOnMount(LINES.storySum);

  const equation = `${sum.a} ${sum.question === 'now' ? '+' : '−'} ${sum.b} = ${sum.answer}`;

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={`${LINES.storySum} ${question}`} onReplay={() => say(LINES.storySum, question)} />
      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-5 w-full max-w-3xl flex flex-col items-center gap-4">
        <Scene scene={sum.scene} size={3.2} />
        <TappableText text={sum.text} level={level} extra={sum.extra} size="text-3xl sm:text-4xl" />
        {(misses > 0 || status !== 'asking') && <SpeakerButton onClick={() => say(sum.text)} label="Read it to me" />}
      </div>
      <p className="font-black text-xl text-slate-700 dark:text-slate-200">{question}</p>

      <div className="flex flex-wrap justify-center gap-5 items-end">
        {options.map(o => (
          <ChoiceCard
            key={o}
            label={`${o}`}
            state={stateFor(String(o), String(sum.answer))}
            disabled={busy}
            onClick={() => (o === sum.answer
              ? right(async () => { setSolved(true); await say(sum.text); })
              : wrong(String(o), async () => { setSolved(true); await say(sum.text); }))}
          >
            <BlockBuddy n={o} size={30} showNumber />
          </ChoiceCard>
        ))}
      </div>

      <AnimatePresence>
        {solved && (
          <motion.p
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            className="font-black text-5xl text-emerald-600 dark:text-emerald-300 bg-white/90 dark:bg-slate-800/90 rounded-3xl px-6 py-2 shadow"
          >
            {equation}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
