'use client';

import { useState } from 'react';
import { say, sayWord } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { NUMBER_ENTRIES, numberWord } from '@/lib/number-land/words';
import { ChoiceCard, Guide, HelpButton, WordView, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import { cardSize, type StepProps } from '../types';
import { useCounting } from '../useCounting';

/** Read a number name (no audio), then wake the sleeping Block Buddy that is exactly that big. */
export default function Wake({ step, onDone }: StepProps<'wake'>) {
  const { n, options } = step;
  const word = numberWord(n);
  const [help, setHelp] = useState(false);
  const [awake, setAwake] = useState(false);
  const { lit, run } = useCounting();
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  useSayOnMount(NL.wake);

  const wakeUp = async () => {
    setAwake(true);
    await run(n);
    await sayWord(word);
  };
  const size = cardSize(Math.max(...options));

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={NL.wake} onReplay={() => say(NL.wake)} />
      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-8 py-5 min-h-[130px] flex items-center">
        <WordView word={word} size="xl" buttons={help} heart={help ? NUMBER_ENTRIES[n].heart : []} />
      </div>
      {!help && <HelpButton onClick={() => { setHelp(true); say(NL.tapSounds); }} />}
      <div className="flex flex-wrap justify-center gap-5 items-end">
        {options.map(o => (
          <ChoiceCard
            key={o}
            label={`Block Buddy ${o}`}
            state={stateFor(String(o), String(n))}
            disabled={busy}
            onClick={() => (o === n ? right(wakeUp) : wrong(String(o), wakeUp))}
          >
            <NumberBuddy n={o} size={size} asleep={!(awake && o === n)} lit={o === n ? lit : null} />
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
