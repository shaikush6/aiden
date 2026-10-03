'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { say } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import { emitQuestEvent } from '@/lib/reading-quest/events';
import { NL } from '@/lib/number-land/lines';
import { recordNumberRocket } from '@/lib/number-land/progress';
import { numberWord } from '@/lib/number-land/words';
import { sfx } from '@/lib/sfx';
import { BigButton, ChoiceCard, Emoji, Guide, WordView, useAlive, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from '../NumberBuddy';
import type { StepProps } from '../types';

function secondsSince(startMs: number): number {
  return Math.max(1, Math.round((performance.now() - startMs) / 1000));
}

function now(): number {
  return performance.now();
}

/** Number Rocket (reading speed): read six number names and tap each Block Buddy, as fast as possible. */
export default function NumberRocket({ step, onDone }: StepProps<'rocket'>) {
  const { rounds } = step;
  const alive = useAlive();
  const start = useRef(0);
  const [round, setRound] = useState(0);
  const [misses, setMisses] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const [result, setResult] = useState<{ seconds: number; best: boolean } | null>(null);
  useSayOnMount(NL.rocket);
  useEffect(() => { start.current = now(); }, []);

  const tap = async (n: number) => {
    if (result) return;
    const target = rounds[round].n;
    if (n !== target) {
      sfx.wrong();
      emitQuestEvent('wrong');
      setMisses(m => m + 1);
      setShake(n);
      setTimeout(() => { if (alive.current) setShake(null); }, 400);
      return;
    }
    sfx.pop();
    if (round + 1 < rounds.length) { setRound(round + 1); return; }
    const seconds = secondsSince(start.current);
    const best = recordNumberRocket(seconds);
    setResult({ seconds, best });
    sfx.fanfare();
    emitQuestEvent('right');
    await say(LINES.blastOff, ...(best ? [LINES.newRecord] : []));
  };

  const fuel = result ? 1 : round / rounds.length;
  const current = rounds[round];
  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={NL.rocket} onReplay={() => say(NL.rocket)} />
      <div className="flex items-end gap-6">
        <div className="flex items-end gap-2 h-56">
          <div className="w-6 h-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex flex-col-reverse">
            <motion.div className="w-full bg-gradient-to-t from-orange-500 to-yellow-300" animate={{ height: `${fuel * 100}%` }} />
          </div>
          <motion.div
            animate={result ? { y: -420, rotate: [0, -4, 4, 0] } : { y: [0, -4, 0] }}
            transition={result ? { duration: 1.6, ease: 'easeIn' } : { duration: 1.2, repeat: Infinity }}
          >
            <Emoji size="text-8xl">🚀</Emoji>
          </motion.div>
        </div>

        {!result && (
          <div className="flex flex-col items-center gap-4">
            <p className="font-black text-slate-500 dark:text-slate-400">{round + 1} / {rounds.length}</p>
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-8 py-4">
              <WordView word={numberWord(current.n)} size="xl" />
            </div>
            <div className="flex gap-4">
              {current.options.map(o => (
                <ChoiceCard key={`${round}-${o}`} label={`Block Buddy ${o}`} state={shake === o ? 'wrong' : 'idle'} onClick={() => tap(o)}>
                  <NumberBuddy n={o} size={o > 10 ? 15 : 22} />
                </ChoiceCard>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3 text-center">
            <p className="font-black text-4xl text-slate-800 dark:text-white">
              {rounds.length} number names in <span className="text-orange-500">{result.seconds}</span> seconds!
            </p>
            {result.best && <p className="font-black text-3xl text-emerald-600">🏆 NEW RECORD!</p>}
            <BigButton onClick={() => onDone({ firstTry: misses === 0 })} label="Next">NEXT ▶</BigButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
