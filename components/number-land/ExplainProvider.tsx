'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { stopAudio } from '@/lib/audio-player';
import type { Topic } from '@/lib/number-land/terms';
import { ExplainContext } from './ExplainContext';
import LessonPlayer from './LessonPlayer';

/** Gives every screen a way to say "explain this": the lesson plays in a pop-up over whatever he was doing. */
export default function ExplainProvider({ children }: { children: ReactNode }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const open = useCallback((t: Topic) => { stopAudio(); setTopic(t); }, []);
  const close = useCallback(() => { stopAudio(); setTopic(null); }, []);
  const api = useMemo(() => ({ open }), [open]);

  return (
    <ExplainContext.Provider value={api}>
      {children}
      <AnimatePresence>
        {topic && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-gradient-to-br from-sky-100 to-violet-100 dark:from-slate-800 dark:to-slate-900 rounded-[2.5rem] shadow-2xl p-5 sm:p-7 w-full max-w-3xl max-h-[94vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={close}
                className="absolute top-3 right-3 w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-700 shadow text-2xl"
                aria-label="Close"
              >
                ✖
              </button>
              <LessonPlayer key={topic} topic={topic} onFinish={close} finishLabel="OK ✓" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ExplainContext.Provider>
  );
}
