'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { storyTold } from '@/lib/number-land/speech';
import { NUMBER_TEXT } from '@/lib/number-land/words';
import type { Term } from '@/lib/number-land/terms';
import { ChoiceCard, Guide, useAlive, useAnswer } from '@/components/reading-quest/ui';
import { useExplain } from '../ExplainContext';
import ReadItButton from '../ReadItButton';
import NumberText from '../NumberText';
import { TermRow } from '../Terms';
import { useRunOnMount } from '../useRunOnMount';
import type { StepProps } from '../types';

/** A number story: Kit tells it while the animals act it out, then he picks the answer. */
export default function Story({ step, onDone }: StepProps<'story'>) {
  const { story, options } = step;
  const alive = useAlive();
  const [stage, setStage] = useState(0);
  const [solved, setSolved] = useState(false);
  const helped = useRef(false);
  const { open } = useExplain();
  const { right, wrong, busy, stateFor } = useAnswer(r => onDone({ firstTry: r.firstTry && !helped.current }));
  const { animal, place, a, b, op, answer, sentences } = story;

  const restart = useRunOnMount(async token => {
    const stale = () => !alive.current || token.cancelled;
    setStage(0);
    for (let i = 0; i < sentences.length; i++) {
      if (stale()) return;
      setStage(i + 1);
      const said = await say(sentences[i]);
      if (stale()) return;
      // Interrupted (he tapped a word): show the whole story so he can still answer.
      if (!said) { setStage(sentences.length); return; }
    }
  });

  const finish = async () => { setSolved(true); await say(storyTold(animal, answer)); };

  const terms: Term[] = [{ t: 'text', text: place.emoji }];
  if (solved) terms.push({ t: 'items', emoji: animal.emoji, n: answer }, { t: 'num', n: answer, fx: 'glow' });
  else if (stage >= 2 && op === 'plus') terms.push({ t: 'items', emoji: animal.emoji, n: a }, { t: 'sign', s: '+' }, { t: 'items', emoji: animal.emoji, n: b });
  else if (stage >= 2) terms.push({ t: 'items', emoji: animal.emoji, n: a, faded: b });
  else if (stage >= 1) terms.push({ t: 'items', emoji: animal.emoji, n: a });

  return (
    <div className="flex flex-col items-center gap-4">
      <Guide text={sentences[Math.max(0, stage - 1)]} onReplay={restart} />

      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-5 py-5 w-full max-w-3xl flex flex-col items-center gap-3 min-h-[170px] justify-center">
        <TermRow terms={terms} scale="md" />
      </div>

      <div className="bg-white/70 dark:bg-slate-800/70 rounded-3xl px-5 py-3 w-full max-w-3xl flex flex-col items-center gap-1">
        {sentences.map((t, i) => <NumberText key={i} text={t} size="text-2xl sm:text-3xl" />)}
      </div>

      {!solved && (
        <div className="flex flex-wrap justify-center gap-3">
        <ReadItButton
          label="READ THE STORY"
          onClick={() => { void say(...sentences, ...options.map(o => lineClip(NUMBER_TEXT[o], 'word'))); }}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => { helped.current = true; open('story'); }}
          className="bg-yellow-300 border-b-4 border-yellow-500 rounded-2xl px-5 py-2 font-black text-lg text-yellow-900 shadow"
          aria-label="Explain this to me"
        >
          💡 EXPLAIN
        </motion.button>
        </div>
      )}

      {!solved && (
        <div className="flex flex-wrap justify-center gap-5 items-end">
          {options.map(o => (
            <ChoiceCard
              key={o}
              label={NUMBER_TEXT[o]}
              state={stateFor(String(o), String(answer))}
              disabled={busy}
              onClick={() => (o === answer ? right(finish) : wrong(String(o), finish))}
            >
              <span className="text-7xl font-black leading-none text-slate-700 dark:text-slate-100">{o}</span>
            </ChoiceCard>
          ))}
        </div>
      )}
    </div>
  );
}
