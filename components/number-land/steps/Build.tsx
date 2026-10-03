'use client';

import { useState } from 'react';
import { say, sayWord } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { NUMBER_ENTRIES, numberWord } from '@/lib/number-land/words';
import { TowerControls } from '@/components/reading-quest/BlockBuddy';
import { BigButton, Guide, HelpButton, WordView, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import type { StepProps } from '../types';
import { useCounting } from '../useCounting';

/** Read a number name, then build a Block Buddy that big. The blocks arrange themselves into its shape. */
export default function Build({ step, onDone }: StepProps<'build'>) {
  const target = step.n;
  const word = numberWord(target);
  const [count, setCount] = useState(0);
  const [help, setHelp] = useState(false);
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
    <div className="flex flex-col items-center gap-5">
      <Guide text={NL.build} onReplay={() => say(NL.build)} />
      <div className="flex flex-wrap items-end justify-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-8 py-4">
            <WordView word={word} size="xl" buttons={help} heart={help ? NUMBER_ENTRIES[target].heart : []} />
          </div>
          {!help && <HelpButton onClick={() => { setHelp(true); say(NL.tapSounds); }} />}
        </div>
        <div className="min-h-[250px] min-w-[120px] flex items-end justify-center">
          <NumberBuddy n={count} size={count > 10 ? 28 : 40} lit={lit} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <TowerControls n={count} max={target > 10 ? 20 : 10} onChange={setCount} disabled={busy} />
        <BigButton onClick={check} disabled={busy || count === 0} label="Check my Block Buddy">CHECK ✓</BigButton>
      </div>
    </div>
  );
}
