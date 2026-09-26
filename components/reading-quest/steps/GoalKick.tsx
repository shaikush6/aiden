'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { say, sayWord, wordClip } from '@/lib/reading-quest/audio';
import { goalLine, LINES } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import { Guide, SpeakerButton, useAnswer, useSayOnMount, WordView, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'goal' }>; onDone: (r: StepResult) => void };

/** Soccer! Hear a word, then kick the ball labelled with that word into the goal. */
export default function GoalKick({ step, onDone }: Props) {
  const { word, options } = step;
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  const [kicked, setKicked] = useState<string | null>(null);
  useSayOnMount(LINES.goal, wordClip(word));

  const kick = (text: string) => {
    if (busy) return;
    setKicked(text);
    if (text === word.text) right(() => say(goalLine()));
    else wrong(text, () => sayWord(word)).then(() => setKicked(null));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Guide text={`${LINES.goal}…`} onReplay={() => say(LINES.goal, wordClip(word))} />

      <div className="relative w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/70
        bg-[repeating-linear-gradient(90deg,#4ade80_0,#4ade80_60px,#22c55e_60px,#22c55e_120px)] pt-4 pb-6">
        {/* Goal */}
        <div className="mx-auto w-2/3 h-28 border-8 border-b-0 border-white rounded-t-lg relative
          bg-[linear-gradient(45deg,rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,.35)_1px,transparent_1px)] bg-[size:14px_14px]">
          <motion.div
            className="absolute left-1/2 bottom-0 -translate-x-1/2 text-5xl"
            animate={{ x: ['-60%', '-40%', '-60%'] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            aria-hidden
          >
            🧤
          </motion.div>
          <AnimatePresence>
            {kicked === word.text && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute inset-0 flex items-center justify-center text-5xl font-black text-yellow-300 drop-shadow-[0_3px_0_rgba(0,0,0,.4)]"
              >
                GOAL!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Balls */}
        <div className="flex justify-around items-end mt-10 px-2">
          {options.map((o, i) => {
            const state = stateFor(o.text, word.text);
            const flying = kicked === o.text;
            const toGoal = o.text === word.text;
            return (
              <motion.button
                key={o.text}
                type="button"
                onClick={() => kick(o.text)}
                disabled={busy}
                animate={
                  flying
                    ? toGoal
                      ? { y: -170, x: (1 - i) * 90, scale: 0.55, rotate: 540 }
                      : { y: -120, x: (i - 1) * 160 + (i === 1 ? 140 : 0), scale: 0.7, rotate: 360, opacity: 0.4 }
                    : { y: 0, x: 0, scale: 1, rotate: 0, opacity: 1 }
                }
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex flex-col items-center gap-1"
                aria-label={`ball ${o.text}`}
              >
                <span className="text-6xl sm:text-7xl leading-none">⚽</span>
                <span className={`rounded-2xl px-3 py-1 border-4 ${state === 'reveal' || state === 'right' ? 'bg-emerald-100 border-emerald-400' : state === 'wrong' ? 'bg-rose-100 border-rose-400' : 'bg-white border-white'}`}>
                  <WordView word={o} size="md" />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
      <SpeakerButton onClick={() => sayWord(word)} label="Hear the word" big />
    </div>
  );
}
