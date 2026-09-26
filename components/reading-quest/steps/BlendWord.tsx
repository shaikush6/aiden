'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { say, sayPhoneme, sayWord } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import { ChoiceCard, Emoji, Guide, useAnswer, useSayOnMount, useSoundOut, WordView, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'blend' }>; onDone: (r: StepResult) => void };

/**
 * "I do, we do": the child taps each sound button (hearing each sound), then the blend arrow plays
 * the sounds closer and closer together — but not the word itself. The child blends in their head
 * and picks the picture. Only then is the whole word spoken.
 */
export default function BlendWord({ step, onDone }: Props) {
  const { word, choices } = step;
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [phase, setPhase] = useState<'sounds' | 'pick'>('sounds');
  const { active, run } = useSoundOut(word);
  const [blending, setBlending] = useState(false);
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  useSayOnMount(LINES.blend);

  const allTapped = tapped.size >= word.units.length;

  const tapUnit = (i: number) => {
    sayPhoneme(word.units[i].phoneme);
    setTapped(prev => new Set(prev).add(i));
  };

  const blend = async () => {
    setBlending(true);
    const slow = await run(450);
    const fast = slow && (await run(90));
    setBlending(false);
    if (!fast) return;
    setPhase('pick');
    say(LINES.blendPick);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide
        text={phase === 'sounds' ? LINES.blend : LINES.blendPick}
        onReplay={() => say(phase === 'sounds' ? LINES.blend : LINES.blendPick)}
      />

      <div className="flex items-center gap-4">
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-4">
          <WordView word={word} size="xl" buttons active={active} onUnit={tapUnit} />
        </div>
        <motion.button
          type="button"
          onClick={blend}
          disabled={!allTapped || blending || busy}
          animate={allTapped && phase === 'sounds' && !blending ? { x: [0, 10, 0] } : {}}
          transition={{ duration: 0.9, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-amber-400 border-b-8 border-amber-600 text-5xl shadow-xl disabled:opacity-30 flex items-center justify-center"
          aria-label="Blend the sounds"
        >
          ➡️
        </motion.button>
      </div>

      {!allTapped && (
        <p className="font-extrabold text-sky-700 dark:text-sky-300 text-lg">
          Sound buttons tapped: {tapped.size} / {word.units.length}
        </p>
      )}

      <AnimatePresence>
        {phase === 'pick' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-5"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
