'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LEVELS } from '@/lib/reading-quest/catalog';
import { WORLDS } from '@/lib/reading-quest/curriculum';
import { say } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import { isCompleted, type QuestProgress } from '@/lib/reading-quest/progress';
import { BigButton, Guide, useSayOnMount } from './ui';

/** Scenery for each world's habitat zone (decoration only). */
const DECOR: Record<string, string[]> = {
  w1: ['🌾', '🌳', '🌾'], w2: ['🌴', '🌿', '🍌'], w3: ['🪸', '🐚', '🌊'], w4: ['🌲', '⛺', '🔥'], w5: ['🌵', '🏜️', '🌵'],
  w6: ['🧊', '❄️', '🏔️'], w7: ['🌺', '🌴', '🍄'], w8: ['🌽', '🏡', '🌾'], w9: ['🪷', '🌿', '🪵'], w10: ['🪐', '✨', '🌙'],
}
const SWIMMERS = new Set(['🦈', '🐬', '🐳', '🐙', '🦦', '🦭', '🐋', '🦑'])

/** A calm back-and-forth stroll, different for every animal so they never march in step. */
function stroll(i: number) {
  const span = 30 + (i * 17) % 40;
  const dur = 6 + (i * 7) % 6;
  return { x: [0, span, -span / 2, 0], transition: { duration: dur, repeat: Infinity, ease: 'easeInOut' as const, delay: (i % 5) * 0.4 } };
}

/** The animal reserve: every rescued animal lives here. Tap one to hear its fact. */
export default function Reserve({ progress, onBack }: { progress: QuestProgress; onBack: () => void }) {
  const [talking, setTalking] = useState<string | null>(null);
  const rescued = LEVELS.filter(l => isCompleted(progress, l.def.id));
  useSayOnMount(LINES.reserve);

  const hello = (id: string, fact: string) => {
    setTalking(id);
    // Keep the name bubble up while the fact plays (and at least a few seconds).
    Promise.all([say(fact), new Promise(r => setTimeout(r, 3000))]).then(() => setTalking(t => (t === id ? null : t)));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <BigButton onClick={onBack} color="bg-sky-500 border-sky-700" label="Back to map">◀ MAP</BigButton>
        <p className="font-black text-2xl text-slate-800 dark:text-white">🐾 {rescued.length} / {LEVELS.length} rescued</p>
      </div>
      <Guide text={LINES.reserve} onReplay={() => say(LINES.reserve)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {WORLDS.map((world, w) => {
          const levels = LEVELS.filter(l => l.worldIndex === w);
          const here = levels.filter(l => isCompleted(progress, l.def.id));
          return (
            <section key={world.id} className={`relative rounded-[2rem] bg-gradient-to-br ${world.theme} shadow-lg p-4 min-h-[210px] overflow-hidden`}>
              <p className="font-black text-lg text-slate-800 dark:text-white">{world.emoji} {world.habitat}</p>
              <div className="absolute bottom-2 inset-x-3 flex justify-between text-4xl opacity-70 pointer-events-none" aria-hidden>
                {(DECOR[world.id] ?? []).map((d, i) => <span key={i}>{d}</span>)}
              </div>
              {here.length === 0 ? (
                <p className="mt-10 text-center font-bold text-slate-600 dark:text-slate-300">🔒 {levels.length} animals are waiting for you!</p>
              ) : (
                <div className="relative mt-3 flex flex-wrap gap-x-6 gap-y-2 justify-center pb-10">
                  {here.map((l, i) => {
                    const { animal } = l.def;
                    const move = stroll(l.index + i);
                    const swims = SWIMMERS.has(animal.emoji);
                    return (
                      <motion.button
                        key={l.def.id}
                        type="button"
                        onClick={() => hello(l.def.id, animal.fact)}
                        animate={{ x: move.x, y: swims ? [0, -8, 4, 0] : [0, -3, 0, 0] }}
                        transition={move.transition}
                        whileTap={{ scale: 1.4, y: -20 }}
                        className="relative text-6xl leading-none"
                        aria-label={`${animal.name}. Tap to hear a fact.`}
                      >
                        {animal.emoji}
                        <AnimatePresence>
                          {talking === l.def.id && (
                            <motion.span
                              initial={{ scale: 0, y: 10 }}
                              animate={{ scale: 1, y: 0 }}
                              exit={{ scale: 0 }}
                              className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-slate-800 rounded-2xl px-3 py-1 text-base font-black text-slate-800 dark:text-white shadow"
                            >
                              {animal.name}!
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
