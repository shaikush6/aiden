'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LEVELS, type LevelInfo } from '@/lib/reading-quest/catalog';
import { WORLDS } from '@/lib/reading-quest/curriculum';
import { say } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import { isCompleted, isUnlocked, nextLevelIndex, type QuestProgress } from '@/lib/reading-quest/progress';
import SoundSwitches from './SoundSwitches';
import { Guide, useSayOnMount } from './ui';

interface Props {
  progress: QuestProgress;
  onPlay: (level: LevelInfo) => void;
  onCards: () => void;
  onParent: () => void;
}

// Zigzag offsets for the level path.
const OFFSETS = ['-translate-x-16 sm:-translate-x-28', 'translate-x-0', 'translate-x-16 sm:translate-x-28', 'translate-x-0', '-translate-x-16 sm:-translate-x-28'];

export default function QuestMap({ progress, onPlay, onCards, onParent }: Props) {
  const nextIdx = nextLevelIndex(progress);
  const firstVisit = Object.keys(progress.levels).length === 0;
  const currentRef = useRef<HTMLButtonElement | null>(null);
  useSayOnMount(firstVisit ? LINES.welcome : LINES.mapHint);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  const stars = Object.values(progress.levels).reduce((n, l) => n + l.stars, 0);
  const cards = Object.keys(progress.levels).length;

  return (
    <div className="flex flex-col gap-5">
      <Guide text={firstVisit ? LINES.welcome : LINES.mapHint} onReplay={() => say(firstVisit ? LINES.welcome : LINES.mapHint)} />

      {/* Stats bar — he loves numbers */}
      <div className="flex flex-wrap justify-center gap-3">
        <Stat icon="⭐" value={stars} label="stars" />
        <Stat icon="📚" value={progress.wordsRead} label="words read" />
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={onCards}
          className="bg-amber-400 border-b-4 border-amber-600 rounded-2xl px-4 py-2 shadow font-black text-amber-950 text-xl flex items-center gap-2"
        >
          🃏 {cards} <span className="text-sm">CARDS</span>
        </motion.button>
        <SoundSwitches />
      </div>

      {WORLDS.map((world, w) => {
        const levels = LEVELS.filter(l => l.worldIndex === w);
        const open = levels.some(l => isUnlocked(progress, l.index));
        return (
          <section
            key={world.id}
            className={`rounded-[2rem] bg-gradient-to-br ${world.theme} shadow-lg p-4 sm:p-6 ${open ? '' : 'opacity-60 grayscale-[40%]'}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl" aria-hidden>{world.emoji}</span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight">
                  {w + 1}. {world.name}
                </h2>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{world.habitat}</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              {levels.map((level, i) => {
                const done = isCompleted(progress, level.def.id);
                const unlocked = isUnlocked(progress, level.index);
                const isNext = level.index === nextIdx && !done;
                const lp = progress.levels[level.def.id];
                return (
                  <div key={level.def.id} className={`flex items-center gap-3 ${OFFSETS[i % OFFSETS.length]}`}>
                    <motion.button
                      ref={isNext ? currentRef : undefined}
                      type="button"
                      onClick={() => (unlocked ? onPlay(level) : say(LINES.locked))}
                      whileHover={unlocked ? { scale: 1.08 } : undefined}
                      whileTap={{ scale: 0.92 }}
                      animate={isNext ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(250,204,21,.8)', '0 0 0 18px rgba(250,204,21,0)', '0 0 0 0 rgba(250,204,21,0)'] } : {}}
                      transition={isNext ? { duration: 1.6, repeat: Infinity } : undefined}
                      className={`relative w-24 h-24 rounded-full border-b-8 shadow-xl flex items-center justify-center text-5xl
                        ${level.isBoss ? 'w-28 h-28' : ''}
                        ${done ? 'bg-emerald-400 border-emerald-600' : unlocked ? 'bg-yellow-300 border-yellow-500' : 'bg-slate-300 border-slate-400 dark:bg-slate-600 dark:border-slate-700'}`}
                      aria-label={`${level.def.title}${unlocked ? '' : ' (locked)'}`}
                    >
                      {done ? level.def.animal.emoji : unlocked ? (level.isBoss ? '📖' : level.index + 1) : '🔒'}
                      {level.isBoss && <span className="absolute -top-4 text-3xl" aria-hidden>👑</span>}
                    </motion.button>
                    <div className="w-32 sm:w-40">
                      <p className="font-black text-slate-800 dark:text-white leading-tight">{level.def.title}</p>
                      {lp && <p className="text-lg leading-none">{'⭐'.repeat(lp.stars)}<span className="opacity-25">{'⭐'.repeat(3 - lp.stars)}</span></p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="flex justify-center pb-6">
        <button
          type="button"
          onClick={onParent}
          className="text-sm font-bold text-slate-500 dark:text-slate-400 underline underline-offset-4"
        >
          👪 For grown-ups
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="bg-white/85 dark:bg-slate-800/85 rounded-2xl px-4 py-2 shadow font-black text-xl text-slate-800 dark:text-white flex items-center gap-2">
      {icon} {value.toLocaleString()} <span className="text-sm text-slate-500 dark:text-slate-400">{label.toUpperCase()}</span>
    </div>
  );
}

