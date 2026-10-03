'use client';

import { useState } from 'react';
import { say, sayWord } from '@/lib/reading-quest/audio';
import { NL } from '@/lib/number-land/lines';
import { displayGrapheme } from '@/lib/reading-quest/plan';
import BlockBuddy from '@/components/reading-quest/BlockBuddy';
import { ChoiceCard, Guide, HelpButton, WordView, useAnswer, useSayOnMount } from '@/components/reading-quest/ui';
import type { StepProps } from '../types';

/** "Which word has more sounds?" Counting sounds (not letters) is the whole point: ship has 4 letters but 3 sounds. */
export default function SoundCompare({ step, onDone }: StepProps<'soundCompare'>) {
  const { a, b } = step;
  const answer = a.units.length > b.units.length ? a : b;
  const [help, setHelp] = useState(false);
  const [solved, setSolved] = useState(false);
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  useSayOnMount(NL.soundCompare);

  const reveal = async () => {
    setSolved(true);
    await sayWord(a);
    await sayWord(b);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={NL.soundCompare} onReplay={() => say(NL.soundCompare)} />
      {!help && !solved && <HelpButton onClick={() => { setHelp(true); say(NL.tapSounds); }} />}

      <div className="flex flex-wrap justify-center gap-6 items-start">
        {[a, b].map(w => (
          <div key={w.text} className="flex flex-col items-center gap-3">
            <ChoiceCard
              label={`word ${w.text}`}
              state={stateFor(w.text, answer.text)}
              disabled={busy || solved}
              onClick={() => (w.text === answer.text ? right(reveal) : wrong(w.text, reveal))}
            >
              <div className="px-3 py-2"><WordView word={w} size="lg" buttons={help} /></div>
            </ChoiceCard>
            {solved && (
              <div className="flex flex-col items-center gap-1">
                <BlockBuddy n={w.units.length} size={30} horizontal labels={w.units.map(u => displayGrapheme(u.grapheme))} />
                <span className="font-black text-2xl text-slate-700 dark:text-slate-200">{w.units.length} sounds · {w.text.length} letters</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
