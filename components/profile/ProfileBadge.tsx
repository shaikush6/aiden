'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AVATARS } from '@/lib/profile/merge';
import { getProfileState, getServerProfileState, refreshCredit, setAvatar, signOut, subscribeProfile, syncNow } from '@/lib/profile/client';

const SYNC_TEXT = {
  idle: '☁️ Ready',
  saving: '⏳ Saving…',
  saved: '☁️ Saved',
  offline: '📴 Offline. It will save when the internet is back.',
} as const;

/** Top-right badge. Signed in: his avatar and name, and tapping opens his profile. Otherwise the plain "FOR AIDEN" tag. */
export default function ProfileBadge() {
  const profile = useSyncExternalStore(subscribeProfile, getProfileState, getServerProfileState);
  const [open, setOpen] = useState(false);

  if (profile.phase !== 'in' || !profile.name) {
    return (
      <div className="bg-white/80 dark:bg-slate-700 rounded-2xl px-3 py-2 shadow text-center">
        <p className="text-xs font-black text-gray-400 dark:text-slate-400 leading-none">FOR</p>
        <p className="text-xl font-black text-indigo-600 leading-none">AIDEN</p>
      </div>
    );
  }

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        className="bg-white/80 dark:bg-slate-700 rounded-2xl px-3 py-1.5 shadow flex items-center gap-2"
        aria-label={`${profile.name}'s profile`}
      >
        <span className="text-3xl leading-none" aria-hidden>{profile.prefs.avatar}</span>
        <span className="text-left">
          <span className="block text-xl font-black text-indigo-600 dark:text-indigo-300 leading-none uppercase">{profile.displayName ?? profile.name}</span>
          <span className="block text-[11px] font-black text-gray-400 dark:text-slate-400 leading-none mt-1">
            {profile.sync === 'offline' ? '📴 offline' : profile.sync === 'saving' ? '⏳ saving' : '☁️ saved'}
          </span>
        </span>
      </motion.button>
      <AnimatePresence>{open && <Sheet onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function Sheet({ onClose }: { onClose: () => void }) {
  const profile = useSyncExternalStore(subscribeProfile, getProfileState, getServerProfileState);
  const [confirming, setConfirming] = useState(false);
  const [gate] = useState(() => ({ a: 3 + Math.floor(Math.random() * 6), b: 3 + Math.floor(Math.random() * 6) }));
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  // The credit changes as he plays, so fetch a fresh figure whenever the sheet opens.
  useEffect(() => { void refreshCredit(); }, []);

  const leave = async () => {
    if (Number(answer) !== gate.a * gate.b) { setAnswer(''); return; }
    const result = await signOut();
    if (!result.ok) setError(result.message ?? 'Could not sign out.');
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-6 w-full max-w-md flex flex-col items-center gap-4 text-slate-800 dark:text-slate-100"
      >
        <span className="text-7xl" aria-hidden>{profile.prefs.avatar}</span>
        <h2 className="text-3xl font-black uppercase">{profile.displayName ?? profile.name}</h2>
        <p className="font-bold text-slate-500 dark:text-slate-300">{SYNC_TEXT[profile.sync]}</p>
        {profile.credit && <Credit quota={profile.credit.quota} remaining={profile.credit.remaining} />}

        <div>
          <p className="font-black text-center mb-2">Pick your buddy</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                aria-pressed={profile.prefs.avatar === a}
                className={`text-3xl rounded-xl p-1 ${profile.prefs.avatar === a ? 'bg-amber-200 ring-4 ring-amber-400' : 'bg-slate-100 dark:bg-slate-700'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => { void syncNow(); }} className="font-black rounded-xl px-4 py-3 bg-sky-500 text-white">☁️ Save now</button>
          <button type="button" onClick={onClose} className="font-black rounded-xl px-4 py-3 bg-emerald-500 text-white">OK ✓</button>
        </div>

        <div className="border-t-2 border-slate-100 dark:border-slate-700 pt-3 w-full flex flex-col items-center gap-2">
          {confirming ? (
            <>
              <p className="font-bold text-sm text-center">Grown-ups only. What is {gate.a} × {gate.b}?</p>
              <div className="flex gap-2">
                <input
                  inputMode="numeric"
                  value={answer}
                  onChange={e => setAnswer(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className="w-24 text-center text-2xl font-black rounded-xl border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  aria-label="Answer"
                />
                <button type="button" onClick={() => { void leave(); }} className="font-black rounded-xl px-4 py-2 bg-rose-600 text-white">Sign out</button>
              </div>
              {error && <p role="alert" className="text-sm font-bold text-rose-600 text-center">{error}</p>}
            </>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="text-sm font-bold text-slate-400 underline">Sign out of this device</button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** How much of the account's AI money is left, for the grown-ups. */
function Credit({ quota, remaining }: { quota: number; remaining: number }) {
  const pct = Math.max(0, Math.min(100, (remaining / quota) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm font-black text-slate-500 dark:text-slate-300 mb-1">
        <span>🤖 AI credit left</span>
        <span>${remaining.toFixed(2)} of ${quota.toFixed(0)}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className={`h-full rounded-full ${pct > 20 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
      </div>
      {remaining <= 0 && <p className="text-xs font-bold text-rose-600 mt-1">Used up: the built-in device voice reads instead, and Mimi is paused.</p>}
    </div>
  );
}
