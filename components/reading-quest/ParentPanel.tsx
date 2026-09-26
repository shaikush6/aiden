'use client';

import { useState } from 'react';
import { LEVELS } from '@/lib/reading-quest/catalog';
import { WORLDS } from '@/lib/reading-quest/curriculum';
import { displayGrapheme } from '@/lib/reading-quest/plan';
import {
  isCompleted, nextLevelIndex, resetProgress, setUnlockAll, weakSounds, type QuestProgress,
} from '@/lib/reading-quest/progress';

interface Props {
  progress: QuestProgress;
  gate: { a: number; b: number };
  onClose: () => void;
}

/** Grown-up view: progress, tricky sounds, the teaching sequence, and controls. Behind a simple math gate. */
export default function ParentPanel({ progress, gate, onClose }: Props) {
  const [answer, setAnswer] = useState('');
  const [passed, setPassed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!passed) {
    const check = () => { if (Number(answer) === gate.a * gate.b) setPassed(true); else setAnswer(''); };
    return (
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 flex flex-col gap-4 text-slate-800 dark:text-slate-100">
        <h2 className="text-2xl font-black">👪 Grown-ups only</h2>
        <label className="font-bold" htmlFor="parent-gate">What is {gate.a} × {gate.b}?</label>
        <input
          id="parent-gate"
          inputMode="numeric"
          autoComplete="off"
          value={answer}
          onChange={e => setAnswer(e.target.value.replace(/\D/g, '').slice(0, 3))}
          onKeyDown={e => { if (e.key === 'Enter') check(); }}
          className="border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900 rounded-xl px-4 py-3 text-2xl font-black"
        />
        <div className="flex gap-3">
          <button type="button" onClick={check} className="flex-1 bg-emerald-500 text-white font-black rounded-xl py-3">OK</button>
          <button type="button" onClick={onClose} className="flex-1 bg-slate-200 dark:bg-slate-700 font-black rounded-xl py-3">Back</button>
        </div>
      </div>
    );
  }

  const done = LEVELS.filter(l => isCompleted(progress, l.def.id)).length;
  const stars = Object.values(progress.levels).reduce((n, l) => n + l.stars, 0);
  const next = LEVELS[nextLevelIndex(progress)];
  const tricky = weakSounds(progress);

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 sm:p-8 flex flex-col gap-6 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">👪 Reading Quest — parent view</h2>
        <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-700 font-black rounded-xl px-4 py-2">Close</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <Box label="Levels done" value={`${done} / ${LEVELS.length}`} />
        <Box label="Stars" value={`${stars} / ${LEVELS.length * 3}`} />
        <Box label="Words read" value={progress.wordsRead.toLocaleString()} />
        <Box label="Up next" value={next ? next.def.title : '—'} />
      </div>

      <section>
        <h3 className="font-black text-lg mb-2">Sounds to practice together</h3>
        {tricky.length ? (
          <div className="flex flex-wrap gap-2">
            {tricky.map(t => (
              <span key={t.gpc} className="bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-xl px-3 py-1 font-bold">
                <span className="text-xl font-black">{displayGrapheme(t.gpc.split('=')[0])}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400"> missed {t.wrong} of {t.right + t.wrong}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">Nothing yet. Sounds he misses will show up here.</p>
        )}
      </section>

      <section>
        <h3 className="font-black text-lg mb-2">The teaching sequence</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          Systematic synthetic phonics, following the order used by Letters and Sounds and UFLI Foundations.
          Every word, sentence and story only uses sounds and heart words he has already been taught.
          Heart words are common words with a tricky part: he sounds out the regular letters and learns the tricky part by heart.
        </p>
        <ol className="flex flex-col gap-2">
          {WORLDS.map((w, i) => {
            const lv = LEVELS.filter(l => l.worldIndex === i);
            const wDone = lv.filter(l => isCompleted(progress, l.def.id)).length;
            return (
              <li key={w.id} className="flex gap-3 items-start">
                <span className="text-2xl" aria-hidden>{w.emoji}</span>
                <div className="flex-1">
                  <p className="font-black">{i + 1}. {w.name} <span className="text-xs font-bold text-slate-500">({wDone}/{lv.length} levels)</span></p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{w.skill}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="text-sm text-slate-600 dark:text-slate-300 bg-sky-50 dark:bg-slate-900/60 rounded-2xl p-4">
        <p className="font-black text-slate-800 dark:text-slate-100 mb-1">Tips</p>
        <p>10 to 15 minutes a day beats one long session. Ask him to say the sounds out loud as he taps them, and to read each sentence to you. Replaying a level is great practice. Progress is saved on this device only, so the laptop and the iPad each keep their own.</p>
      </section>

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setUnlockAll(!progress.unlockAll)}
          className={`font-black rounded-xl px-4 py-3 ${progress.unlockAll ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          {progress.unlockAll ? '🔓 All levels unlocked (tap to lock)' : '🔒 Unlock all levels'}
        </button>
        {confirmReset ? (
          <button type="button" onClick={() => { resetProgress(); setConfirmReset(false); }} className="font-black rounded-xl px-4 py-3 bg-rose-600 text-white">
            Tap again to erase all progress
          </button>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="font-black rounded-xl px-4 py-3 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
            Reset progress
          </button>
        )}
      </section>
    </div>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</p>
      <p className="font-black text-lg leading-tight">{value}</p>
    </div>
  );
}
