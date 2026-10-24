'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { NUMBER_TEXT } from '@/lib/number-land/words';
import { NL } from '@/lib/number-land/lines';
import { optionKey } from '@/lib/number-land/terms';
import { ChoiceCard, Guide, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import { useExplain } from '../ExplainContext';
import ReadItButton from '../ReadItButton';
import { OptionFace, TermRow, optionBlock, optionLabel } from '../Terms';
import type { StepProps } from '../types';

/**
 * The workhorse activity: a picture of a problem, a spoken question, and answer cards.
 * 💡 explains the idea again (the lesson plays in a pop-up), and 👀 shows a picture that makes it easier.
 * Either one means the answer no longer counts as first try.
 */
export default function Choose({ step, onDone }: StepProps<'choose'>) {
  const { prompt, hint, options, answer, solved: solvedTerms, told, topic } = step;
  const [peek, setPeek] = useState(false);
  const [solved, setSolved] = useState(false);
  const [nudge, setNudge] = useState(false);
  const helped = useRef(false);
  const { open } = useExplain();
  const { right, wrong, busy, stateFor } = useAnswer(r => onDone({ firstTry: r.firstTry && !helped.current }));
  useSayOnMount(...step.say);

  const finish = async () => { setSolved(true); await say(told); };
  // Everything on the screen, out loud: the question, then each answer card.
  const readAll = () => say(
    ...step.say,
    ...options.flatMap(o => (o.t === 'num' || o.t === 'buddy' ? [lineClip(NUMBER_TEXT[o.n], 'word')] : o.t === 'word' ? [lineClip(o.text, 'word')] : [])),
  );
  const correct = optionKey(options[answer]);
  const block = optionBlock(options);
  const wide = options.length > 3;

  return (
    <div className="flex flex-col items-center gap-4">
      <Guide text={step.ask} onReplay={() => say(...step.say)} />

      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-5 py-5 w-full max-w-3xl flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          <motion.div key={solved ? 'solved' : 'ask'} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <TermRow terms={solved ? solvedTerms : prompt} scale="lg" />
          </motion.div>
        </AnimatePresence>
        {peek && !solved && hint && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2 border-t-4 border-dashed border-slate-200 dark:border-slate-600">
            <TermRow terms={hint} scale="md" />
          </motion.div>
        )}
      </div>

      {!solved && (
        <div className="flex flex-wrap justify-center gap-3">
          <ReadItButton onClick={readAll} />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            animate={nudge ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={nudge ? { duration: 1.1, repeat: Infinity } : undefined}
            onClick={() => { helped.current = true; setNudge(false); open(topic); }}
            className="bg-yellow-300 border-b-4 border-yellow-500 rounded-2xl px-5 py-2 font-black text-lg text-yellow-900 shadow"
            aria-label="Explain this to me"
          >
            💡 EXPLAIN
          </motion.button>
          {hint && !peek && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => { helped.current = true; setPeek(true); say(NL.showMe); }}
              className="bg-sky-300 border-b-4 border-sky-500 rounded-2xl px-5 py-2 font-black text-lg text-sky-900 shadow"
              aria-label="Show me a picture"
            >
              👀 SHOW ME
            </motion.button>
          )}
        </div>
      )}

      {!solved && (
        <div className={`flex flex-wrap justify-center items-end ${wide ? 'gap-3' : 'gap-5'}`}>
          {options.map(o => (
            <ChoiceCard
              key={optionKey(o)}
              label={optionLabel(o)}
              state={stateFor(optionKey(o), correct)}
              disabled={busy}
              onClick={() => {
                if (optionKey(o) === correct) right(finish);
                else { setNudge(true); wrong(optionKey(o), finish); }
              }}
            >
              <OptionFace option={o} block={block} />
            </ChoiceCard>
          ))}
        </div>
      )}
    </div>
  );
}
