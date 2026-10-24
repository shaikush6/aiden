'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn } from '@/lib/profile/client';

/** The front door: type the code once on each device. The code is what keeps strangers out. */
export default function SignIn() {
  const [typed, setTyped] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const result = await signIn(typed);
    // On success the app takes over, so this screen disappears; only a failure needs showing.
    if (!result.ok) { setMessage(result.message); setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-200 via-orange-200 to-pink-200 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <motion.form
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={e => { e.preventDefault(); void submit(); }}
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-5 text-center"
      >
        <motion.span className="text-8xl" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1 }} aria-hidden>🦊</motion.span>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">Who is playing?</h1>
        <p className="font-bold text-slate-500 dark:text-slate-300">Type your secret code. A grown-up can help.</p>
        <input
          value={typed}
          onChange={e => setTyped(e.target.value.toUpperCase().slice(0, 40))}
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          aria-label="Secret code"
          placeholder="CODE"
          className="w-full text-center text-3xl font-black tracking-widest rounded-2xl border-4 border-orange-300 focus:border-orange-500 outline-none px-4 py-4 bg-orange-50 dark:bg-slate-900 dark:text-white"
        />
        {message && <p role="alert" className="font-black text-rose-600">{message}</p>}
        <button
          type="submit"
          disabled={busy || !typed.trim()}
          className="w-full bg-emerald-500 border-b-8 border-emerald-700 text-white font-black text-3xl rounded-3xl py-4 shadow-lg disabled:opacity-40"
        >
          {busy ? '…' : 'GO ▶'}
        </button>
      </motion.form>
    </div>
  );
}
