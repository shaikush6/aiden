'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { NUMBER_LEVELS, TOWNS, type NLevel } from '@/lib/number-land/curriculum';
import { NL } from '@/lib/number-land/lines';
import { townIntro } from '@/lib/number-land/script';
import { getProgress } from '@/lib/reading-quest/progress';
import { isNLCompleted, isNLUnlocked, markTownCelebrated, nextNLIndex, type NLProgress } from '@/lib/number-land/progress';
import { buddyLayout } from '@/lib/number-land/buddy';
import { MAX_NUMBER, NUMBER_TEXT } from '@/lib/number-land/words';
import SoundSwitches from '@/components/reading-quest/SoundSwitches';
import { Guide, useSayOnMount } from '@/components/reading-quest/ui';
import NumberBuddy from './NumberBuddy';
import { useCounting } from './useCounting';

interface Props {
  progress: NLProgress;
  onPlay: (level: NLevel) => void;
  onBook: () => void;
}

const OFFSETS = ['-translate-x-16 sm:-translate-x-28', 'translate-x-0', 'translate-x-16 sm:translate-x-28', 'translate-x-0', '-translate-x-16 sm:-translate-x-28'];

/** Block size so a buddy fills (but fits inside) a level circle. */
function miniSize(n: number): number {
  const { rows, cols } = buddyLayout(n);
  return Math.max(5, Math.min(22, Math.floor(58 / rows) - 2, Math.floor(62 / cols) - 2));
}

/** A number that changes once a day, so the "Buddy of the day" is a small reason to come back. */
function dayNumber(): number {
  return Math.floor(Date.now() / 86_400_000);
}

export default function NumberMap({ progress, onPlay, onBook }: Props) {
  const nextIdx = nextNLIndex(progress);
  const nextLevel = NUMBER_LEVELS[nextIdx];
  const firstVisit = Object.keys(progress.levels).length === 0;
  const currentRef = useRef<HTMLButtonElement | null>(null);
  const { lit, run } = useCounting();

  // A town opened by finishing the one before it gets a one-time celebration.
  const newTown = nextLevel && nextLevel.town > 0 && !progress.unlockAll
    && NUMBER_LEVELS.findIndex(l => l.town === nextLevel.town) === nextIdx
    && !isNLCompleted(progress, nextLevel.id) && isNLUnlocked(progress, nextIdx)
    && !progress.celebratedTowns.includes(TOWNS[nextLevel.town].id)
    ? TOWNS[nextLevel.town] : null;

  const greeting = newTown ? [NL.newTown, townIntro(newTown.id, getProgress().settings.narrator)] : [firstVisit ? NL.welcome : NL.mapHint];
  useSayOnMount(...greeting);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  const stars = Object.values(progress.levels).reduce((n, l) => n + l.stars, 0);
  const met = progress.buddies;
  const today = met.length ? met[dayNumber() % met.length] : null;

  return (
    <div className="flex flex-col gap-5 px-1">
      <Guide text={greeting.join(' ')} onReplay={() => say(...greeting)} />

      <div className="flex flex-wrap justify-center gap-3">
        <Stat icon="⭐" value={stars} label="stars" />
        <Stat icon="🧱" value={met.length} label={`of ${MAX_NUMBER + 1} buddies`} />
        <Stat icon="📚" value={progress.wordsRead} label="words read" />
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          onClick={onBook}
          className="bg-amber-400 border-b-4 border-amber-600 rounded-2xl px-4 py-2 shadow font-black text-amber-950 text-xl flex items-center gap-2"
        >
          📖 <span className="text-sm">BUDDY BOOK</span>
        </motion.button>
        <SoundSwitches />
      </div>

      {today !== null && (
        <motion.button
          type="button"
          onClick={async () => { say(lineClip(NUMBER_TEXT[today], 'word')); await run(today); }}
          whileTap={{ scale: 0.97 }}
          className="mx-auto flex items-end gap-4 bg-white/85 dark:bg-slate-800/85 rounded-3xl px-6 py-3 shadow-lg"
          aria-label="Buddy of the day. Tap to count it."
        >
          <NumberBuddy n={today} size={today > 10 ? 10 : 16} lit={lit} />
          <span className="text-left pb-1">
            <span className="block font-black text-xs tracking-widest text-slate-500 dark:text-slate-400">BUDDY OF THE DAY</span>
            <span className="block font-black text-3xl text-slate-800 dark:text-white capitalize">{NUMBER_TEXT[today]}</span>
          </span>
        </motion.button>
      )}

      {TOWNS.map((town, t) => {
        const levels = NUMBER_LEVELS.filter(l => l.town === t);
        const open = levels.some(l => isNLUnlocked(progress, NUMBER_LEVELS.indexOf(l)));
        return (
          <section key={town.id} className={`rounded-[2rem] bg-gradient-to-br ${town.theme} shadow-lg p-4 sm:p-6 ${open ? '' : 'opacity-60 grayscale-[40%]'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl" aria-hidden>{town.emoji}</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight">{t + 1}. {town.name}</h2>
            </div>
            <div className="flex flex-col items-center gap-3 py-2">
              {levels.map((level, i) => {
                const index = NUMBER_LEVELS.indexOf(level);
                const done = isNLCompleted(progress, level.id);
                const unlocked = isNLUnlocked(progress, index);
                const isNext = index === nextIdx && !done;
                const lp = progress.levels[level.id];
                const shape = level.buddies.length ? level.buddies[level.buddies.length - 1] : null;
                return (
                  <div key={level.id} className="flex flex-col items-center gap-3">
                    <div className={`relative flex items-center gap-3 ${OFFSETS[i % OFFSETS.length]}`}>
                      {isNext && (
                        <motion.span
                          className="absolute -left-14 top-1/2 -translate-y-1/2 text-5xl"
                          initial={{ y: -60, opacity: 0 }}
                          animate={{ y: [0, -10, 0], opacity: 1 }}
                          transition={{ y: { duration: 0.9, repeat: Infinity, repeatDelay: 0.6 }, opacity: { duration: 0.4 } }}
                          aria-hidden
                        >
                          🦊
                        </motion.span>
                      )}
                      <motion.button
                        ref={isNext ? currentRef : undefined}
                        type="button"
                        onClick={() => (unlocked ? onPlay(level) : say(NL.locked))}
                        whileHover={unlocked ? { scale: 1.08 } : undefined}
                        whileTap={{ scale: 0.92 }}
                        animate={isNext ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0 0 rgba(250,204,21,.8)', '0 0 0 18px rgba(250,204,21,0)', '0 0 0 0 rgba(250,204,21,0)'] } : {}}
                        transition={isNext ? { duration: 1.6, repeat: Infinity } : undefined}
                        className={`relative w-24 h-24 rounded-full border-b-8 shadow-xl flex items-center justify-center text-5xl
                          ${level.boss ? 'w-28 h-28' : ''}
                          ${done ? 'bg-emerald-400 border-emerald-600' : unlocked ? 'bg-yellow-300 border-yellow-500' : 'bg-slate-300 border-slate-400 dark:bg-slate-600 dark:border-slate-700'}`}
                        aria-label={`${level.title}${unlocked ? '' : ' (locked)'}`}
                      >
                        {!unlocked ? '🔒' : shape !== null ? <NumberBuddy n={shape} size={miniSize(shape)} /> : level.icon}
                        {level.boss && <span className="absolute -top-4 text-3xl" aria-hidden>👑</span>}
                      </motion.button>
                      <div className="w-32 sm:w-44">
                        <p className="font-black text-slate-800 dark:text-white leading-tight">{level.title}</p>
                        {lp && <p className="text-lg leading-none">{'⭐'.repeat(lp.stars)}<span className="opacity-25">{'⭐'.repeat(3 - lp.stars)}</span></p>}
                      </div>
                    </div>
                    {done && i < levels.length - 1 && <span className="text-xl opacity-60 tracking-[0.5em]" aria-hidden>🐾🐾</span>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <AnimatePresence>
        {newTown && (
          <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ scale: 0.3, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 12 }}
              className={`rounded-[2.5rem] bg-gradient-to-br ${newTown.theme} shadow-2xl p-8 flex flex-col items-center gap-4 text-center max-w-md`}
            >
              <motion.span className="text-8xl" animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 1.4, repeat: Infinity }} aria-hidden>
                {newTown.emoji}
              </motion.span>
              <p className="font-black text-lg tracking-widest text-slate-700 dark:text-slate-200">NEW TOWN UNLOCKED!</p>
              <h2 className="font-black text-4xl text-slate-900 dark:text-white">{newTown.name}</h2>
              <button
                type="button"
                onClick={() => markTownCelebrated(newTown.id)}
                className="bg-emerald-500 border-b-8 border-emerald-700 text-white font-black text-2xl rounded-3xl px-8 py-4 shadow-lg"
              >
                LET’S GO! ▶
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
