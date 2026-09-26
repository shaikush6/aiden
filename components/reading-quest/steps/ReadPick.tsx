'use client';

import { useState } from 'react';
import { say, sayWord } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import { ChoiceCard, Emoji, Guide, HelpButton, useAnswer, useSayOnMount, WordView, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'readPick' }>; onDone: (r: StepResult) => void };

/** Independent reading: the word is shown with no audio until the child has picked a picture. */
export default function ReadPick({ step, onDone }: Props) {
  const { word, choices } = step;
  const [help, setHelp] = useState(false);
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  useSayOnMount(LINES.readPick);

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={LINES.readPick} onReplay={() => say(LINES.readPick)} />

      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-8 py-5 min-h-[150px] flex items-center">
        <WordView word={word} size="xl" buttons={help} />
      </div>
      {!help && <HelpButton onClick={() => { setHelp(true); say(LINES.help); }} />}

      <div className="flex flex-wrap justify-center gap-5">
        {choices.map(c => (
          <ChoiceCard
            key={c.text}
            label={`picture ${c.text}`}
            state={stateFor(c.text, word.text)}
            disabled={busy}
            onClick={() => (c.text === word.text ? right(() => sayWord(word)) : wrong(c.text, () => sayWord(word)))}
          >
            <Emoji size="text-7xl">{c.emoji!}</Emoji>
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
