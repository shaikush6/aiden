'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LEVELS } from '@/lib/reading-quest/catalog';
import { WORLDS } from '@/lib/reading-quest/curriculum';
import { NUMBER_LEVELS, TOWNS } from '@/lib/number-land/curriculum';

interface Group { key: string; name: string; emoji: string; levels: { index: number; title: string; boss: boolean }[] }

const QUEST_GROUPS: Group[] = WORLDS.map((w, wi) => ({
  key: w.id,
  name: w.name,
  emoji: w.emoji,
  levels: LEVELS.filter(l => l.worldIndex === wi).map(l => ({ index: l.index, title: l.def.title, boss: l.isBoss })),
}));

const LAND_GROUPS: Group[] = TOWNS.map((t, ti) => ({
  key: t.id,
  name: t.name,
  emoji: t.emoji,
  levels: NUMBER_LEVELS.map((l, i) => ({ l, i })).filter(x => x.l.town === ti).map(x => ({ index: x.i, title: x.l.title, boss: Boolean(x.l.boss) })),
}));

export interface PickerProps {
  questNext: number;
  landNext: number;
  onQuest: (index: number) => void;
  onLand: (index: number) => void;
}

/** Pick "the level to play next" in the Reading Quest and in Block Buddy Land. Everything before it shows as done. */
export default function LevelPicker({ questNext, landNext, onQuest, onLand }: PickerProps) {
  const [tab, setTab] = useState<'quest' | 'land'>('quest');
  const groups = tab === 'quest' ? QUEST_GROUPS : LAND_GROUPS;
  const next = tab === 'quest' ? questNext : landNext;
  const setNext = tab === 'quest' ? onQuest : onLand;
  const all = tab === 'quest' ? LEVELS.length : NUMBER_LEVELS.length;
  const nextTitle = tab === 'quest' ? LEVELS[Math.min(next, all - 1)].def.title : NUMBER_LEVELS[Math.min(next, all - 1)].title;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 w-full">
        {(['quest', 'land'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`font-black text-lg rounded-2xl py-3 shadow border-b-4 ${tab === t ? 'bg-orange-500 text-white border-orange-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'}`}
          >
            {t === 'quest' ? '🦊 READING QUEST' : '🔢 BLOCK BUDDY LAND'}
          </button>
        ))}
      </div>

      <div className="w-full max-h-[52vh] overflow-y-auto flex flex-col gap-3 pr-1 text-left">
        {groups.map(g => (
          <section key={g.key} className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3">
            <p className="font-black text-slate-700 dark:text-slate-200 mb-2">{g.emoji} {g.name}</p>
            <div className="flex flex-wrap gap-2">
              {g.levels.map(l => {
                const done = l.index < next;
                const here = l.index === next;
                return (
                  <motion.button
                    key={l.index}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setNext(l.index)}
                    aria-pressed={here}
                    className={`rounded-xl px-3 py-2 font-black text-sm border-2 border-b-4 ${
                      here ? 'bg-yellow-300 border-yellow-500 text-yellow-950 ring-4 ring-yellow-200'
                        : done ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {done ? '✓ ' : here ? '▶ ' : ''}{l.boss ? '👑 ' : ''}{l.title}
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="font-black text-slate-700 dark:text-slate-200">
        {next === 0 ? 'Starting from the very beginning.' : `${next} of ${all} done · next up: ${nextTitle}`}
      </p>
      {next > 0 && (
        <button type="button" onClick={() => setNext(0)} className="font-black rounded-2xl px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
          ↺ From the start
        </button>
      )}
    </>
  );
}
