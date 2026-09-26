'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LEVELS } from '@/lib/reading-quest/catalog';
import { say } from '@/lib/reading-quest/audio';
import { isCompleted, type QuestProgress } from '@/lib/reading-quest/progress';
import { BigButton, Emoji } from './ui';

/** Every creature rescued so far. Tap a card to hear its science fact. */
export default function CardAlbum({ progress, onBack }: { progress: QuestProgress; onBack: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const owned = LEVELS.filter(l => isCompleted(progress, l.def.id)).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <BigButton onClick={onBack} color="bg-sky-500 border-sky-700" label="Back to map">◀ MAP</BigButton>
        <p className="font-black text-2xl text-slate-800 dark:text-white">🃏 {owned} / {LEVELS.length}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {LEVELS.map(level => {
          const { animal } = level.def;
          const have = isCompleted(progress, level.def.id);
          const showFact = open === level.def.id;
          return (
            <motion.button
              key={level.def.id}
              type="button"
              disabled={!have}
              whileHover={have ? { scale: 1.04, rotate: -1 } : undefined}
              whileTap={have ? { scale: 0.96 } : undefined}
              onClick={() => { setOpen(showFact ? null : level.def.id); if (!showFact) say(animal.fact); }}
              className={`rounded-3xl border-4 border-white shadow-lg p-3 min-h-[200px] flex flex-col items-center justify-center gap-2 text-center
                ${have ? (showFact ? 'bg-gradient-to-b from-sky-200 to-sky-400' : 'bg-gradient-to-b from-yellow-200 to-amber-400') : 'bg-slate-200 dark:bg-slate-700'}`}
              aria-label={have ? `${animal.name}. Tap to hear a fact.` : 'Not rescued yet'}
            >
              {have ? (
                showFact ? (
                  <p className="font-extrabold text-sm text-sky-950 leading-snug">{animal.fact}</p>
                ) : (
                  <>
                    <Emoji size="text-6xl">{animal.emoji}</Emoji>
                    <span className="font-black text-amber-900">{animal.name.toUpperCase()}</span>
                    <span className="font-bold text-xs text-amber-800">{animal.stat}</span>
                  </>
                )
              ) : (
                <>
                  <span className="text-6xl opacity-30 grayscale" aria-hidden>{animal.emoji}</span>
                  <span className="font-black text-slate-500 text-2xl">?</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
