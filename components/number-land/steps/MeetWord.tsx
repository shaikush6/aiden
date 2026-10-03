'use client';

import { useState } from 'react';
import { say, sayWord } from '@/lib/reading-quest/audio';
import { displayScript } from '@/lib/reading-quest/script';
import { NL } from '@/lib/number-land/lines';
import { MATH_WORDS } from '@/lib/number-land/words';
import { BigButton, Guide, SpeakerButton, WordView, useSayOnMount } from '@/components/reading-quest/ui';
import DemoStage from '../DemoStage';
import type { StepProps } from '../types';

/** Meet a math word: sound it out, then watch what it means. */
export default function MeetWord({ step, onDone }: StepProps<'meetWord'>) {
  const entry = MATH_WORDS[step.key];
  const [run, setRun] = useState(0);
  useSayOnMount(NL.meetWord, entry.tip);

  const showMe = () => {
    setRun(r => r + 1);
    say(entry.tip);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={`${NL.meetWord} ${displayScript(entry.tip)}`} onReplay={() => say(NL.meetWord, entry.tip)} />
      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-8 py-4 flex items-center gap-4">
        <WordView word={entry.word} size="xl" buttons heart={entry.heart} />
        <SpeakerButton onClick={() => sayWord(entry.word)} label="Hear the word" />
      </div>
      {entry.demo && <DemoStage key={run} demo={entry.demo} />}
      <div className="flex gap-4">
        <BigButton onClick={showMe} color="bg-violet-500 border-violet-700" label="Show me">▶ SHOW ME</BigButton>
        <BigButton onClick={() => onDone({ firstTry: true })} label="Next">NEXT ▶</BigButton>
      </div>
    </div>
  );
}
