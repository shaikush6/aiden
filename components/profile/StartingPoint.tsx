'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { LEVELS } from '@/lib/reading-quest/catalog';
import { WORLDS } from '@/lib/reading-quest/curriculum';
import { completeUpTo, getProgress, getServerProgress, nextLevelIndex, subscribeProgress } from '@/lib/reading-quest/progress';
import { NUMBER_LEVELS, TOWNS } from '@/lib/number-land/curriculum';
import { completeNLUpTo, getNL, getServerNL, nextNLIndex, subscribeNL } from '@/lib/number-land/progress';
import { getProfileState, getServerProfileState, markPlaced, subscribeProfile } from '@/lib/profile/client';
import { STARTING_POINT_LINES } from '@/lib/profile/welcome-lines';
import HearMe from './HearMe';
import { useGuide } from './useGuide';

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

/**
 * Shown once, right after a new account is made: "Have you played before? Show us where you got to."
 * Tapping a level means "this is the one I play next", so every level before it is marked done.
 * It only ever adds progress, so picking an earlier level than the one already reached changes nothing.
 */
export default function StartingPoint() {
  const profile = useSyncExternalStore(subscribeProfile, getProfileState, getServerProfileState);
  const quest = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  const land = useSyncExternalStore(subscribeNL, getNL, getServerNL);
  const [step, setStep] = useState<'ask' | 'pick'>('ask');
  const [tab, setTab] = useState<'quest' | 'land'>('quest');
  const [questNext, setQuestNext] = useState(() => nextLevelIndex(getProgress()));
  const [landNext, setLandNext] = useState(() => nextNLIndex(getNL()));
  const guide = useGuide(step === 'ask' ? STARTING_POINT_LINES.ask : STARTING_POINT_LINES.pick);

  const questDone = Object.keys(quest.levels).length;
  const landDone = Object.keys(land.levels).length;
  const name = profile.displayName ?? profile.name ?? '';

  const save = () => {
    completeUpTo(questNext);
    completeNLUpTo(landNext);
    markPlaced();
  };

  if (step === 'ask') {
    return (
      <Shell>
        <HearMe emoji="👋" speaking={guide.speaking} onTap={() => guide.say(STARTING_POINT_LINES.ask)} />
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Welcome, {name}!</h1>
        <p className="font-bold text-slate-600 dark:text-slate-300 text-lg">
          Have you played before? Show us where you got to, so you do not have to start again.
        </p>
        {(questDone > 0 || landDone > 0) && (
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl px-4 py-2">
            ✓ This device already has {questDone} Reading Quest {questDone === 1 ? 'level' : 'levels'} and {landDone} Block Buddy Land {landDone === 1 ? 'level' : 'levels'} done. They are saved to your account.
          </p>
        )}
        <div className="flex flex-col gap-3 w-full">
          <BigChoice color="bg-violet-500 border-violet-700" onClick={() => setStep('pick')}>📍 PICK WHERE I WAS</BigChoice>
          <BigChoice color="bg-emerald-500 border-emerald-700" onClick={markPlaced}>
            {questDone > 0 || landDone > 0 ? '▶ KEEP GOING FROM HERE' : '🆕 START FROM THE BEGINNING'}
          </BigChoice>
        </div>
      </Shell>
    );
  }

  const groups = tab === 'quest' ? QUEST_GROUPS : LAND_GROUPS;
  const next = tab === 'quest' ? questNext : landNext;
  const setNext = tab === 'quest' ? setQuestNext : setLandNext;
  const all = tab === 'quest' ? LEVELS.length : NUMBER_LEVELS.length;
  const nextTitle = tab === 'quest' ? LEVELS[Math.min(next, all - 1)].def.title : NUMBER_LEVELS[Math.min(next, all - 1)].title;

  return (
    <Shell wide>
      <HearMe emoji="🦊" small speaking={guide.speaking} onTap={() => guide.say(STARTING_POINT_LINES.pick)} />
      <h1 className="text-3xl font-black text-slate-800 dark:text-white">Where were you?</h1>
      <p className="font-bold text-slate-600 dark:text-slate-300">Tap the level to play next. Everything before it counts as done.</p>

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
      <div className="flex flex-wrap gap-3 justify-center">
        <button type="button" onClick={() => setNext(0)} className="font-black rounded-2xl px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
          ↺ From the start
        </button>
        <BigChoice color="bg-emerald-500 border-emerald-700" onClick={save}>✓ SAVE AND PLAY</BigChoice>
      </div>
      <button type="button" onClick={() => setStep('ask')} className="text-sm font-bold text-slate-500 underline">Back</button>
    </Shell>
  );
}

function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-200 via-orange-200 to-pink-200 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 w-full ${wide ? 'max-w-3xl' : 'max-w-md'} flex flex-col items-center gap-4 text-center`}
      >
        {children}
      </motion.div>
    </div>
  );
}

function BigChoice({ color, onClick, children }: { color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${color} border-b-8 text-white font-black text-xl rounded-3xl px-6 py-4 shadow-lg`}
    >
      {children}
    </motion.button>
  );
}
