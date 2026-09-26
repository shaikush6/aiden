'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { emitQuestEvent } from '@/lib/reading-quest/events';
import { say, sayPhoneme, sayWord, wordClip } from '@/lib/reading-quest/audio';
import { LINES, randomPraise, randomRetry } from '@/lib/reading-quest/lines';
import { defaultPhoneme } from '@/lib/reading-quest/phonemes';
import { displayGrapheme, type Step } from '@/lib/reading-quest/plan';
import { sfx } from '@/lib/sfx';
import { Guide, SpeakerButton, useAlive, useSayOnMount, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'wordChain' }>; onDone: (r: StepResult) => void };

/**
 * Word Chain Bridge: change ONE sound to turn each word into the next (cat → cot → dot → dog).
 * Tap the letter to change, then pick the new letter. Every right change adds a plank to the bridge.
 */
export default function WordChain({ step, onDone }: Props) {
  const { chain, palettes } = step;
  const alive = useAlive();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const [stepMisses, setStepMisses] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = chain[idx];
  const target = chain[Math.min(idx + 1, chain.length - 1)];
  const changeAt = current.units.findIndex((u, i) => u.grapheme !== target.units[i]?.grapheme);
  const correctLetter = target.units[changeAt]?.grapheme;
  const hint = stepMisses >= 2;

  const ask = () => say(LINES.wordChain, wordClip(target));
  useSayOnMount(LINES.wordChain, wordClip(chain[1]));

  const miss = (key: string) => {
    sfx.wrong();
    emitQuestEvent('wrong');
    setMisses(m => m + 1);
    setStepMisses(m => m + 1);
    setShake(key);
    say(randomRetry());
    setTimeout(() => { if (alive.current) setShake(null); }, 450);
  };

  const pickLetter = async (g: string) => {
    if (selected === null || done) return;
    if (selected !== changeAt || g !== correctLetter) { miss(`${selected}:${g}`); return; }
    sfx.correct();
    emitQuestEvent('right');
    const next = idx + 1;
    setIdx(next);
    setSelected(null);
    setStepMisses(0);
    await sayWord(chain[next]);
    if (!alive.current) return;
    if (next >= chain.length - 1) {
      setDone(true);
      await say(randomPraise());
      if (alive.current) onDone({ firstTry: misses === 0 });
    } else {
      await say(LINES.wordChain, wordClip(chain[next + 1]));
    }
  };

  const planks = chain.length - 1;
  return (
    <div className="flex flex-col items-center gap-5">
      {/* The target word is only spoken, never shown: working out its spelling is the exercise. */}
      <Guide text={`${LINES.wordChain}… 🔊`} onReplay={ask} />

      {/* The bridge */}
      <div className="relative w-full max-w-2xl h-28 rounded-3xl overflow-hidden bg-gradient-to-b from-sky-200 to-sky-400 dark:from-sky-800 dark:to-sky-950">
        <div className="absolute bottom-0 inset-x-0 h-8 bg-[repeating-linear-gradient(90deg,#38bdf8_0,#38bdf8_20px,#0ea5e9_20px,#0ea5e9_40px)] opacity-70" />
        <div className="absolute bottom-8 left-0 w-16 h-6 bg-lime-600 rounded-r-lg" />
        <div className="absolute bottom-8 right-0 w-16 h-6 bg-lime-600 rounded-l-lg" />
        <div className="absolute bottom-8 left-16 right-16 flex gap-1">
          {Array.from({ length: planks }, (_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ opacity: i < idx ? 1 : 0.15, y: i < idx ? 0 : -6 }}
              className="flex-1 h-6 rounded bg-amber-700 border-2 border-amber-900"
            />
          ))}
        </div>
        <motion.span
          className="absolute bottom-12 text-4xl"
          animate={{ left: done ? 'calc(100% - 3.5rem)' : `calc(${(idx / planks) * 70}% + 0.5rem)` }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
          aria-hidden
        >
          🦊
        </motion.span>
      </div>

      {/* Current word: tap the letter to change */}
      <div className="flex gap-2 items-center">
        {current.chunks.map((c, i) => (
          <motion.button
            key={`${idx}-${i}`}
            type="button"
            onClick={() => { if (!done) { setSelected(i); sayPhoneme(current.units[c.unit].phoneme); } }}
            animate={shake?.startsWith(`${i}:`) ? { x: [0, -8, 8, -5, 5, 0] } : hint && i === changeAt ? { scale: [1, 1.1, 1] } : {}}
            transition={hint && i === changeAt ? { duration: 0.9, repeat: Infinity } : { duration: 0.4 }}
            className={`w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-4 border-b-8 text-6xl font-black shadow-lg
              ${selected === i ? 'bg-yellow-200 border-yellow-500 text-yellow-900' : 'bg-white dark:bg-slate-800 border-sky-300 text-slate-800 dark:text-slate-100'}
              ${hint && i === changeAt ? 'ring-4 ring-emerald-400' : ''}`}
            aria-label={`change ${c.text}`}
          >
            {c.text}
          </motion.button>
        ))}
        <SpeakerButton onClick={() => sayWord(target)} label="Hear the new word" />
      </div>

      {/* Letter palette */}
      <div className={`flex gap-3 transition-opacity ${selected === null ? 'opacity-30 pointer-events-none' : ''}`}>
        {palettes[Math.min(idx, palettes.length - 1)].map(g => (
          <motion.button
            key={g}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => pickLetter(g)}
            animate={shake?.endsWith(`:${g}`) ? { x: [0, -8, 8, -5, 5, 0] } : {}}
            className={`w-20 h-20 rounded-2xl border-4 border-b-8 text-5xl font-black shadow
              bg-amber-100 dark:bg-amber-900/40 border-amber-300 text-amber-900 dark:text-amber-100
              ${hint && g === correctLetter ? 'ring-4 ring-emerald-400' : ''}`}
            aria-label={`letter ${g}, says ${defaultPhoneme(g)}`}
          >
            {displayGrapheme(g)}
          </motion.button>
        ))}
      </div>
      <p className="font-bold text-slate-600 dark:text-slate-300">
        {selected === null ? '👆 Tap the letter to change' : '👇 Now pick the new letter'}
      </p>
    </div>
  );
}
