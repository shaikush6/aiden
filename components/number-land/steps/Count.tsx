'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { countAsk, countTold } from '@/lib/number-land/speech';
import { NUMBER_TEXT } from '@/lib/number-land/words';
import { sfx } from '@/lib/sfx';
import { ChoiceCard, Guide, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import { useExplain } from '../ExplainContext';
import ReadItButton from '../ReadItButton';
import { NumeralTile } from '../Terms';
import type { StepProps } from '../types';

/** Count the animals by tapping each one (Kit counts out loud as he taps), then tap the numeral. */
export default function Count({ step, onDone }: StepProps<'count'>) {
  const { animal, n, options } = step;
  const [counted, setCounted] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const helped = useRef(false);
  const { open } = useExplain();
  const { right, wrong, busy, stateFor } = useAnswer(r => onDone({ firstTry: r.firstTry && !helped.current }));
  const ask = countAsk(animal);
  useSayOnMount(ask);

  const tap = (i: number) => {
    if (counted.includes(i)) return;
    const k = counted.length + 1;
    setCounted([...counted, i]);
    sfx.count(k - 1);
    void say(lineClip(NUMBER_TEXT[k], 'word'));
  };
  const finish = async () => { setSolved(true); await say(countTold(animal, n)); };

  const rows: number[][] = [];
  for (let i = 0; i < n; i += 5) rows.push(Array.from({ length: Math.min(5, n - i) }, (_, j) => i + j));

  return (
    <div className="flex flex-col items-center gap-4">
      <Guide text={ask} onReplay={() => say(ask)} />

      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-5 py-5 w-full max-w-3xl min-h-[170px] flex flex-col items-center justify-center gap-2">
        {n === 0 ? (
          <p className="font-black text-3xl text-slate-400">nothing here! 🕳️</p>
        ) : rows.map((row, r) => (
          <div key={r} className="flex gap-2">
            {row.map(i => (
              <motion.button
                key={i}
                type="button"
                onClick={() => tap(i)}
                whileTap={{ scale: 0.8 }}
                animate={counted.includes(i) ? { scale: 1.1 } : { scale: 1 }}
                className={`relative text-6xl leading-none rounded-2xl p-1 ${counted.includes(i) ? 'bg-emerald-100 dark:bg-emerald-900/50' : ''}`}
                aria-label={`${animal.key} ${i + 1}`}
              >
                {animal.emoji}
                {counted.includes(i) && (
                  <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-lg font-black rounded-full w-8 h-8 flex items-center justify-center">
                    {counted.indexOf(i) + 1}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        ))}
        {solved && <NumeralTile n={n} scale="md" />}
      </div>

      {!solved && (
        <div className="flex flex-wrap justify-center gap-3">
        <ReadItButton onClick={() => { void say(ask, ...options.map(o => lineClip(NUMBER_TEXT[o], 'word'))); }} />
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => { helped.current = true; open('numerals'); }}
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
              state={stateFor(String(o), String(n))}
              disabled={busy}
              onClick={() => (o === n ? right(finish) : wrong(String(o), finish))}
            >
              <span className="text-7xl font-black leading-none text-slate-700 dark:text-slate-100">{o}</span>
            </ChoiceCard>
          ))}
        </div>
      )}
    </div>
  );
}
