'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { phonemeClips, say, sayWord } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { onsetSize } from '@/lib/number-land/word-bonds';
import { displayGrapheme } from '@/lib/reading-quest/plan';
import { BigButton, Emoji, Guide, useAnswer, useAlive } from '@/components/reading-quest/ui';
import type { StepProps } from '../types';
import { useRunOnMount } from '../useRunOnMount';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Word bond: split a word into its first sound(s) and the rest, like splitting a number into two parts.
 * Each sound is one car (so "sh" can never be torn apart). Tap the gap where the word splits.
 */
export default function WordBond({ step, onDone }: StepProps<'wordBond'>) {
  const { word, demo } = step;
  const split = onsetSize(word) ?? 1;
  const alive = useAlive();
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState<number | null>(null);
  const { right, wrong, busy, misses } = useAnswer(onDone);

  /** Say the first part, then the rest, then blend the whole word back together. */
  const speakSplit = async () => {
    setSolved(true);
    await say(word.units.slice(0, split).flatMap(u => phonemeClips(u.phoneme)));
    await wait(350);
    if (!alive.current) return;
    await say(word.units.slice(split).flatMap(u => phonemeClips(u.phoneme)));
    await wait(250);
    if (!alive.current) return;
    await say(NL.blendBack);
    await sayWord(word);
  };

  useRunOnMount(async () => {
    if (!demo) { await say(NL.wordBond); return; }
    await say(NL.bondDemo);
    await speakSplit();
  });

  const pick = (gap: number) => {
    if (gap === split) {
      right(speakSplit);
    } else {
      setShake(gap);
      setTimeout(() => { if (alive.current) setShake(null); }, 450);
      wrong(String(gap), speakSplit);
    }
  };

  const cars = word.chunks;
  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={demo ? NL.bondDemo : NL.wordBond} onReplay={() => say(demo ? NL.bondDemo : NL.wordBond)} />

      <div className="flex items-center justify-center bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-4 py-6 flex-wrap">
        {cars.map((c, i) => {
          const firstPart = i < split;
          const hint = misses >= 1 && !solved;
          return (
            <div key={i} className="flex items-center">
              {i > 0 && (
                solved || demo ? (
                  <span className={`${i === split ? 'w-8' : 'w-1'} transition-all`} />
                ) : (
                  <motion.button
                    type="button"
                    onClick={() => pick(i)}
                    disabled={busy}
                    animate={shake === i ? { x: [0, -6, 6, -4, 4, 0] } : hint && i === split ? { scale: [1, 1.3, 1] } : {}}
                    transition={hint && i === split ? { duration: 0.9, repeat: Infinity } : { duration: 0.4 }}
                    className={`mx-0.5 w-9 h-20 rounded-xl flex items-center justify-center text-2xl text-slate-400 hover:bg-yellow-100 dark:hover:bg-slate-700
                      ${hint && i === split ? 'bg-emerald-100 ring-4 ring-emerald-300' : ''}`}
                    aria-label={`split after sound ${i}`}
                  >
                    ✂️
                  </motion.button>
                )
              )}
              <motion.div
                animate={solved ? { y: firstPart ? -8 : 8 } : { y: 0 }}
                className={`min-w-[64px] h-24 px-3 rounded-2xl border-4 border-b-8 shadow flex items-center justify-center text-5xl font-black
                  ${solved ? (firstPart ? 'bg-sky-200 border-sky-400 text-sky-900' : 'bg-emerald-200 border-emerald-400 text-emerald-900')
                           : 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 text-amber-900 dark:text-amber-100'}`}
              >
                {displayGrapheme(c.text)}
              </motion.div>
            </div>
          );
        })}
      </div>

      {solved && word.emoji && <Emoji size="text-7xl">{word.emoji}</Emoji>}
      {demo && solved && <BigButton onClick={() => onDone({ firstTry: true })} label="Next">NEXT ▶</BigButton>}
    </div>
  );
}
