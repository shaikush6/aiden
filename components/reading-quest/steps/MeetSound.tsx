'use client';

import { motion } from 'framer-motion';
import { say, sayPhoneme, sayWord } from '@/lib/reading-quest/audio';
import { displayScript } from '@/lib/reading-quest/script';
import { LINES } from '@/lib/reading-quest/lines';
import { displayGrapheme, type Step } from '@/lib/reading-quest/plan';
import { BigButton, Emoji, Guide, useSayOnMount, WordView, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'meet' }>; onDone: (r: StepResult) => void };

export default function MeetSound({ step, onDone }: Props) {
  const { sound, phoneme, examples } = step;
  const intro = () => say(LINES.newSound, sound.tip);
  useSayOnMount(LINES.newSound, sound.tip);
  const gpc = sound.p ? `${sound.g}=${sound.p}` : sound.g;

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={`${LINES.newSound} ${displayScript(sound.tip)}`} onReplay={intro} />

      <motion.button
        type="button"
        onClick={() => sayPhoneme(phoneme)}
        initial={{ scale: 0.3, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        whileTap={{ scale: 0.92 }}
        className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] border-4 border-b-[12px] border-amber-300 shadow-xl px-12 py-6 flex flex-col items-center gap-2"
        aria-label="Hear the sound"
      >
        <span className="absolute -top-5 -right-5 text-5xl" aria-hidden>{sound.emoji}</span>
        <span className="text-[7rem] sm:text-[9rem] font-black leading-none text-amber-600 dark:text-amber-400">
          {displayGrapheme(sound.g)}
        </span>
        <span className="text-lg font-black text-sky-600">🔊 TAP TO HEAR</span>
      </motion.button>

      {examples.length > 0 && (
        <>
          <p className="font-extrabold text-slate-600 dark:text-slate-300 text-lg">{LINES.meetExamples}</p>
          <div className="flex flex-wrap justify-center gap-4">
            {examples.map(w => (
              <motion.button
                key={w.text}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sayWord(w)}
                className="bg-white dark:bg-slate-800 rounded-3xl border-4 border-b-8 border-sky-200 dark:border-slate-600 shadow-lg px-5 py-3 flex flex-col items-center gap-1"
              >
                <Emoji size="text-5xl">{w.emoji!}</Emoji>
                <WordView word={w} size="md" active={w.units.findIndex(u => u.gpc === gpc)} />
              </motion.button>
            ))}
          </div>
        </>
      )}

      <BigButton onClick={() => onDone({ firstTry: true })} label="Next">NEXT ▶</BigButton>
    </div>
  );
}
