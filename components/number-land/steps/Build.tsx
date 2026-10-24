'use client';

import { useState } from 'react';
import { lineClip, say, sayWord } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { NUMBER_ENTRIES, NUMBER_TEXT, numberWord } from '@/lib/number-land/words';
import { TowerControls } from '@/components/reading-quest/BlockBuddy';
import { BigButton, Guide, SpeakerButton, WordView, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import { NumeralTile } from '../Terms';
import ReadItButton from '../ReadItButton';
import type { StepProps } from '../types';
import { useCounting } from '../useCounting';

/** Build a Block Buddy that matches a numeral (the name is shown too, with sound buttons to read it). */
export default function Build({ step, onDone }: StepProps<'build'>) {
  const target = step.n;
  const word = numberWord(target);
  const [count, setCount] = useState(0);
  const { lit, run } = useCounting();
  const { right, wrong, busy } = useAnswer(onDone);
  useSayOnMount(NL.build);

  const celebrate = async () => {
    await run(target);
    await sayWord(word);
  };
  const check = () => {
    if (count === target) right(celebrate);
    else wrong(String(count), async () => { setCount(target); await celebrate(); });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Guide text={NL.build} onReplay={() => say(NL.build)} />
      <div className="flex flex-wrap items-end justify-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <NumeralTile n={target} scale="lg" />
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-[1.5rem] shadow-md px-4 py-2 flex items-center gap-3">
            <WordView word={word} size="md" buttons heart={NUMBER_ENTRIES[target].heart} />
            <SpeakerButton onClick={() => say(lineClip(NUMBER_TEXT[target], 'word'))} label="Hear its name" />
          </div>
        </div>
        <div className="min-h-[230px] min-w-[120px] flex items-end justify-center">
          <NumberBuddy n={count} size={count > 10 ? 24 : 34} lit={lit} />
        </div>
      </div>
      <ReadItButton onClick={() => { void say(NL.build, lineClip(NUMBER_TEXT[target], 'word')); }} />
      <div className="flex flex-wrap items-center justify-center gap-6">
        <TowerControls n={count} max={target > 10 ? 20 : 10} onChange={setCount} disabled={busy} />
        <BigButton onClick={check} disabled={busy || count === 0} label="Check my Block Buddy">CHECK ✓</BigButton>
      </div>
    </div>
  );
}
