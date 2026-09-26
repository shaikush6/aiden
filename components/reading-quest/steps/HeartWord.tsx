'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { say, sayWord, wordClip } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import { displayScript } from '@/lib/reading-quest/script';
import type { Step } from '@/lib/reading-quest/plan';
import { BigButton, ChoiceCard, Guide, SpeakerButton, useAnswer, useSayOnMount, WordView, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'heart' }>; onDone: (r: StepResult) => void };

/**
 * Heart words (the "heart word" method): sound out the regular parts, and learn the tricky part
 * (shown in red with a heart) by heart. Then find the word among look-alikes.
 */
export default function HeartWord({ step, onDone }: Props) {
  const { heart, options } = step;
  const [phase, setPhase] = useState<'learn' | 'find'>('learn');
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  useSayOnMount(LINES.heartWord, wordClip(heart.word), heart.tip);

  const toFind = () => {
    setPhase('find');
    say(LINES.findWord, wordClip(heart.word));
  };

  if (phase === 'learn') {
    return (
      <div className="flex flex-col items-center gap-6">
        <Guide text={`${LINES.heartWord} ${displayScript(heart.tip)}`} onReplay={() => say(LINES.heartWord, wordClip(heart.word), heart.tip)} />
        <motion.div
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          className="relative bg-white dark:bg-slate-800 rounded-[2.5rem] border-4 border-b-[12px] border-rose-300 shadow-xl px-10 py-6"
        >
          <motion.span
            className="absolute -top-7 -left-6 text-6xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            aria-hidden
          >
            ❤️
          </motion.span>
          <WordView word={heart.word} size="xl" buttons heart={heart.heart} />
        </motion.div>
        <div className="flex items-center gap-4">
          <SpeakerButton onClick={() => sayWord(heart.word)} label="Hear the word" big />
          <BigButton onClick={toFind} color="bg-rose-500 border-rose-700">GOT IT ❤️</BigButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <Guide text={`${LINES.findWord}…`} onReplay={() => say(LINES.findWord, wordClip(heart.word))} />
      <SpeakerButton onClick={() => sayWord(heart.word)} label="Hear the word" big />
      <div className="flex flex-wrap justify-center gap-5">
        {options.map(o => (
          <ChoiceCard
            key={o.text}
            label={o.text}
            state={stateFor(o.text, heart.word.text)}
            disabled={busy}
            onClick={() => (o.text === heart.word.text ? right(() => sayWord(heart.word)) : wrong(o.text, () => sayWord(heart.word)))}
          >
            <WordView word={o} size="lg" />
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
