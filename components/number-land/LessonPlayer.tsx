'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { say } from '@/lib/reading-quest/audio';
import { LESSONS } from '@/lib/number-land/lessons';
import type { Topic } from '@/lib/number-land/terms';
import { BigButton, Guide, useAlive } from '@/components/reading-quest/ui';
import { ExplainContext } from './ExplainContext';
import { TermRow } from './Terms';
import { useRunOnMount } from './useRunOnMount';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const NOT_NESTED = { open: () => {} };

/**
 * Plays a lesson: Kit says each beat while the picture on the stage changes.
 * `onFinish` is called when the child taps the button at the end.
 */
export default function LessonPlayer({ topic, onFinish, finishLabel = 'GOT IT ▶' }: { topic: Topic; onFinish: () => void; finishLabel?: string }) {
  const lesson = LESSONS[topic];
  const alive = useAlive();
  const [beat, setBeat] = useState(0);
  const [done, setDone] = useState(false);

  const restart = useRunOnMount(async token => {
    const stale = () => !alive.current || token.cancelled;
    setDone(false);
    for (let i = 0; i < lesson.beats.length; i++) {
      if (stale()) return;
      setBeat(i);
      // He may move on as soon as the last sentence starts.
      if (i === lesson.beats.length - 1) setDone(true);
      const finished = await say(lesson.beats[i].say);
      if (stale()) return;
      // If he tapped a number or a sign, that sound spoke over the lesson. Let it play, then carry on.
      await wait(finished ? 450 : 1400);
    }
    if (!stale()) setDone(true);
  });

  const current = lesson.beats[beat];
  return (
    <ExplainContext.Provider value={NOT_NESTED}>
      <div className="flex flex-col items-center gap-5">
        <p className="font-black text-slate-600 dark:text-slate-300 text-xl">{lesson.icon} {lesson.title}</p>
        <Guide text={current.say} onReplay={restart} />
        <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-6 w-full max-w-3xl min-h-[250px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={beat} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
              <TermRow terms={current.terms} scale="lg" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2" aria-hidden>
          {lesson.beats.map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full ${i <= beat ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
          ))}
        </div>
        <BigButton onClick={onFinish} disabled={!done} label={finishLabel}>{finishLabel}</BigButton>
      </div>
    </ExplainContext.Provider>
  );
}
