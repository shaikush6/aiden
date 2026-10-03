'use client';

import { useState, useSyncExternalStore } from 'react';
import { NUMBER_LEVELS } from '@/lib/number-land/curriculum';
import { NUMBER_TEXT, MAX_NUMBER } from '@/lib/number-land/words';
import {
  getNL, getServerNL, resetNL, setNLUnlockAll, subscribeNL, weakNumbers,
} from '@/lib/number-land/progress';

/** Grown-up view of Block Buddy Land: how far he got, which numbers he misses, and the unlock / reset controls. */
export default function NumberLandParentSection() {
  const nl = useSyncExternalStore(subscribeNL, getNL, getServerNL);
  const [confirmReset, setConfirmReset] = useState(false);

  const done = NUMBER_LEVELS.filter(l => nl.levels[l.id]).length;
  const weak = weakNumbers(nl);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-black text-lg">🏘️ Block Buddy Land (numbers and reading)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <Stat label="Levels done" value={`${done} / ${NUMBER_LEVELS.length}`} />
        <Stat label="Buddies met" value={`${nl.buddies.length} / ${MAX_NUMBER + 1}`} />
        <Stat label="Words read" value={nl.wordsRead.toLocaleString()} />
        <Stat label="Rocket best" value={nl.rocketBest === null ? '—' : `${nl.rocketBest}s`} />
      </div>

      <div>
        <p className="font-bold mb-2">Numbers to practice together</p>
        {weak.length ? (
          <div className="flex flex-wrap gap-2">
            {weak.map(w => (
              <span key={w.n} className="bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-1 font-bold">
                <span className="text-xl font-black">{w.n}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> {NUMBER_TEXT[w.n]}, missed {w.wrong} of {w.right + w.wrong}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Nothing yet. Numbers he misses will show up here.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setNLUnlockAll(!nl.unlockAll)}
          className={`font-black rounded-xl px-4 py-3 ${nl.unlockAll ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          {nl.unlockAll ? '🔓 All houses unlocked (tap to lock)' : '🔒 Unlock all houses'}
        </button>
        {confirmReset ? (
          <button type="button" onClick={() => { resetNL(); setConfirmReset(false); }} className="font-black rounded-xl px-4 py-3 bg-rose-600 text-white">
            Tap again to erase Block Buddy Land progress
          </button>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="font-black rounded-xl px-4 py-3 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
            Reset Block Buddy Land
          </button>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</p>
      <p className="font-black text-lg leading-tight">{value}</p>
    </div>
  );
}
