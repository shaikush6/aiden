'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { say, sayPhoneme, sayWord, wordClip } from '@/lib/reading-quest/audio';
import { LINES, randomPraise, randomRetry } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import { Emoji, Guide, SpeakerButton, useAlive, useSayOnMount, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'build' }>; onDone: (r: StepResult) => void };

/** Spelling (segmenting): hear a word, then tap the sound tiles in order to build it. */
export default function BuildWord({ step, onDone }: Props) {
  const { word, tiles } = step;
  const alive = useAlive();
  const [placed, setPlaced] = useState<number[]>([]);   // tile indexes, in slot order
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  useSayOnMount(LINES.build, wordClip(word));

  const nextChunk = word.chunks[placed.length];
  const hintTile = misses >= 2 && nextChunk
    ? tiles.findIndex((t, i) => t === nextChunk.text && !placed.includes(i))
    : -1;

  const tapTile = async (i: number) => {
    if (finished || placed.includes(i) || !nextChunk) return;
    if (tiles[i] !== nextChunk.text) {
      setMisses(m => m + 1);
      setShake(i);
      say(randomRetry());
      setTimeout(() => { if (alive.current) setShake(null); }, 450);
      return;
    }
    const nowPlaced = [...placed, i];
    setPlaced(nowPlaced);
    if (nowPlaced.length < word.chunks.length) {
      sayPhoneme(word.units[nextChunk.unit].phoneme);
      return;
    }
    setFinished(true);
    await sayWord(word);
    if (!alive.current) return;
    await say(randomPraise());
    if (alive.current) onDone({ firstTry: misses === 0 });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={LINES.build} onReplay={() => say(LINES.build, wordClip(word))} />

      <div className="flex items-center gap-4">
        <motion.div animate={finished ? { scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] } : {}} transition={{ duration: 0.8 }}>
          <Emoji size="text-8xl">{word.emoji ?? '❓'}</Emoji>
        </motion.div>
        <SpeakerButton onClick={() => sayWord(word)} label="Hear the word" big />
      </div>

      {/* Slots */}
      <div className="flex gap-2 sm:gap-3">
        {word.chunks.map((chunk, i) => {
          const filled = i < placed.length;
          const newSyllable = i > 0 && chunk.syllable !== word.chunks[i - 1].syllable;
          return (
            <div
              key={i}
              className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-4 flex items-center justify-center ${newSyllable ? 'ml-3' : ''}
                ${filled ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-400' : 'bg-white/60 dark:bg-slate-800/60 border-dashed border-sky-300'}
                ${!filled && i === placed.length && !finished ? 'ring-4 ring-amber-300' : ''}`}
            >
              {filled && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl font-black text-slate-800 dark:text-slate-100">
                  {chunk.text}
                </motion.span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tiles */}
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
        {tiles.map((t, i) => {
          const used = placed.includes(i);
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => tapTile(i)}
              disabled={used || finished}
              animate={shake === i ? { x: [0, -8, 8, -5, 5, 0] } : hintTile === i ? { scale: [1, 1.12, 1] } : {}}
              transition={hintTile === i ? { duration: 0.9, repeat: Infinity } : { duration: 0.4 }}
              whileTap={{ scale: 0.9 }}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-b-8 text-5xl font-black shadow-lg
                ${used ? 'opacity-20 bg-slate-200 border-slate-300' : 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 text-amber-900 dark:text-amber-100'}
                ${shake === i ? 'bg-rose-100 border-rose-400' : ''} ${hintTile === i ? 'ring-4 ring-emerald-400' : ''}`}
              aria-label={`tile ${t}`}
            >
              {t}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
