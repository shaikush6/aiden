'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { say, wordClip } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import { ChoiceCard, Emoji, Guide, HelpButton, useAnswer, useSayOnMount, WordView, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'alien' }>; onDone: (r: StepResult) => void };

/** Pure decoding check: made-up words can only be read by sounding them out, never by guessing. */
export default function RealOrAlien({ step, onDone }: Props) {
  const { word, real } = step;
  const [help, setHelp] = useState(false);
  const { right, wrong, busy, stateFor, status } = useAnswer(onDone);
  useSayOnMount(LINES.alien);

  const reveal = () => say(wordClip(word, !real), real ? LINES.realWord : LINES.alienWord);
  const choose = (saysReal: boolean) => {
    const key = saysReal ? 'real' : 'alien';
    if (saysReal === real) right(reveal);
    else wrong(key, reveal);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={LINES.alien} onReplay={() => say(LINES.alien)} />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="relative bg-gradient-to-b from-indigo-900 to-slate-900 rounded-[2rem] shadow-xl px-10 pt-10 pb-6 border-4 border-indigo-400"
      >
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl" aria-hidden>🛸</span>
        <div className="bg-white rounded-2xl px-6 py-3">
          <WordView word={word} size="xl" buttons={help} alienWord={!real} />
        </div>
        {status !== 'asking' && real && word.emoji && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-6 -bottom-6">
            <Emoji size="text-6xl">{word.emoji}</Emoji>
          </motion.div>
        )}
      </motion.div>
      {!help && <HelpButton onClick={() => { setHelp(true); say(LINES.help); }} />}

      <div className="flex gap-6">
        <ChoiceCard label="Real word" state={stateFor('real', real ? 'real' : 'alien')} disabled={busy} onClick={() => choose(true)}>
          <div className="flex flex-col items-center gap-1 px-4">
            <Emoji size="text-7xl">🌍</Emoji>
            <span className="font-black text-2xl text-emerald-700 dark:text-emerald-300">REAL</span>
          </div>
        </ChoiceCard>
        <ChoiceCard label="Alien word" state={stateFor('alien', real ? 'real' : 'alien')} disabled={busy} onClick={() => choose(false)}>
          <div className="flex flex-col items-center gap-1 px-4">
            <Emoji size="text-7xl">👽</Emoji>
            <span className="font-black text-2xl text-purple-700 dark:text-purple-300">ALIEN</span>
          </div>
        </ChoiceCard>
      </div>
    </div>
  );
}
