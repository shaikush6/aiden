'use client';

import { useState } from 'react';
import { say, sayPhoneme, sayWord, wordClip } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import { displayGrapheme, type Step } from '@/lib/reading-quest/plan';
import BlockBuddy, { TowerControls } from '../BlockBuddy';
import { BigButton, Emoji, Guide, SpeakerButton, useAlive, useAnswer, useSayOnMount, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'soundBlocks' }>; onDone: (r: StepResult) => void };

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Sound Blocks: hear a word, build a Block Buddy with one block per SOUND (not per letter), then check.
 * Each block lights up with its spelling as its sound plays — "ship" is sh-i-p: 3 sounds, 4 letters.
 */
export default function SoundBlocks({ step, onDone }: Props) {
  const { word } = step;
  const alive = useAlive();
  const [n, setN] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [labels, setLabels] = useState<string[] | undefined>(undefined);
  const { right, wrong, busy } = useAnswer(onDone);
  useSayOnMount(LINES.soundBlocks, wordClip(word));
  const sounds = word.units.length;

  /** Light each block in turn with its spelling while its sound plays. */
  const soundOut = async () => {
    setLabels(word.units.map(u => displayGrapheme(u.grapheme)));
    for (let i = 0; i < sounds; i++) {
      if (!alive.current) return;
      setLit(i);
      await sayPhoneme(word.units[i].phoneme);
      await wait(250);
    }
    if (!alive.current) return;
    setLit(null);
    await sayWord(word);
  };

  const check = () => {
    if (n === sounds) right(soundOut);
    else wrong(String(n), async () => { setN(sounds); await soundOut(); });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={LINES.soundBlocks} onReplay={() => say(LINES.soundBlocks, wordClip(word))} />
      <div className="flex items-center gap-4">
        <Emoji size="text-8xl">{word.emoji ?? '❓'}</Emoji>
        <SpeakerButton onClick={() => sayWord(word)} label="Hear the word" big />
      </div>
      <div className="min-h-[90px] flex items-center justify-center">
        <BlockBuddy n={n} size={64} lit={lit} horizontal labels={labels && labels.length === n ? labels : undefined} />
      </div>
      <TowerControls n={n} max={6} onChange={v => { setLabels(undefined); setN(v); }} disabled={busy} />
      <BigButton onClick={check} disabled={busy || n === 0} label="Check my tower">CHECK ✓</BigButton>
    </div>
  );
}
