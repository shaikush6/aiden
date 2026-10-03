'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { say } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { ChoiceCard, Guide, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import Scene from '@/components/reading-quest/Scene';
import NumberBuddy from '../NumberBuddy';
import NumberText from '../NumberText';
import PeekButton from '../PeekButton';
import { cardSize, type StepProps } from '../types';

/** A number story written in number words. The picture appears once he has worked out the answer. */
export default function Story({ step, onDone }: StepProps<'story'>) {
  const { story, options } = step;
  const [solved, setSolved] = useState(false);
  const [peek, setPeek] = useState(false);
  const helped = useRef(false);
  const { right, wrong, busy, stateFor } = useAnswer(r => onDone({ firstTry: r.firstTry && !helped.current }));
  useSayOnMount(NL.story);

  const finish = async () => { setSolved(true); await say(story.sentences[0], story.sentences[1]); };
  const equation = `${story.a} ${story.op === 'plus' ? '+' : '−'} ${story.b} = ${story.answer}`;
  const size = cardSize(Math.max(...options));

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={NL.story} onReplay={() => say(NL.story)} />

      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-5 w-full max-w-3xl flex flex-col items-center gap-2">
        {story.sentences.map((t, i) => <NumberText key={i} text={t} size="text-3xl sm:text-4xl" />)}
      </div>

      {!solved && !peek && <PeekButton onClick={() => { helped.current = true; setPeek(true); say(NL.showMe); }} />}
      {(peek || solved) && (
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2">
          {peek && !solved ? (
            <div className="flex items-end gap-5">
              <NumberBuddy n={story.a} size={22} />
              <span className="text-4xl font-black text-violet-500 pb-4">{story.op === 'plus' ? '+' : '−'}</span>
              <NumberBuddy n={story.b} size={22} />
            </div>
          ) : (
            <>
              <Scene scene={story.scene} size={3} />
              <span className="font-black text-4xl text-emerald-600 dark:text-emerald-300">{equation}</span>
            </>
          )}
        </motion.div>
      )}

      {!solved && (
        <div className="flex flex-wrap justify-center gap-5 items-end">
          {options.map(o => (
            <ChoiceCard
              key={o}
              label={`Block Buddy ${o}`}
              state={stateFor(String(o), String(story.answer))}
              disabled={busy}
              onClick={() => (o === story.answer ? right(finish) : wrong(String(o), finish))}
            >
              <NumberBuddy n={o} size={size} />
            </ChoiceCard>
          ))}
        </div>
      )}
    </div>
  );
}
