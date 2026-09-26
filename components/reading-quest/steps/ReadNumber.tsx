'use client';

import { useState } from 'react';
import { COUNTING_WORDS } from '@/lib/reading-quest/catalog';
import { lineClip, say, sayWord } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import BlockBuddy, { TowerControls } from '../BlockBuddy';
import { BigButton, Guide, HelpButton, useAlive, useAnswer, useSayOnMount, WordView, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'readNumber' }>; onDone: (r: StepResult) => void };

/** Read a number word ("six"), build a Block Buddy that big, then count the blocks together. */
export default function ReadNumber({ step, onDone }: Props) {
  const { word, value } = step;
  const alive = useAlive();
  const [n, setN] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [help, setHelp] = useState(false);
  const { right, wrong, busy } = useAnswer(onDone);
  useSayOnMount(LINES.readNumber);

  /** Count the tower out loud: one, two, three… lighting each block. */
  const countUp = async (to: number) => {
    for (let i = 0; i < to; i++) {
      if (!alive.current) return;
      setLit(i);
      await say(lineClip(COUNTING_WORDS[i], 'word'));
    }
    if (alive.current) setLit(null);
  };

  const check = () => {
    if (n === value) right(async () => { await countUp(value); await sayWord(word); });
    else wrong(String(n), async () => { setN(value); await countUp(value); });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={LINES.readNumber} onReplay={() => say(LINES.readNumber)} />
      <div className="flex flex-wrap items-end justify-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-8 py-4">
            <WordView word={word} size="xl" buttons={help} />
          </div>
          {!help && <HelpButton onClick={() => { setHelp(true); say(LINES.help); }} />}
        </div>
        <div className="min-h-[240px] min-w-[110px] flex items-end justify-center">
          <BlockBuddy n={n} size={42} lit={lit} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <TowerControls n={n} max={10} onChange={setN} disabled={busy} />
        <BigButton onClick={check} disabled={busy || n === 0} label="Check my Block Buddy">CHECK ✓</BigButton>
      </div>
    </div>
  );
}
