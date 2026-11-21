'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn, signUp } from '@/lib/profile/client';
import { SIGN_IN_LINES } from '@/lib/profile/welcome-lines';
import HearMe from './HearMe';
import { useGuide } from './useGuide';

/** The front door: sign in with a username and password, or make a new account with the family's invite code. */
export default function SignIn() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const intro = mode === 'login' ? SIGN_IN_LINES.login : SIGN_IN_LINES.signup;
  const guide = useGuide(intro);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const result = mode === 'login' ? await signIn(username, password) : await signUp(username, password, invite);
    // On success the app takes over, so this screen disappears; only a failure needs showing.
    if (!result.ok) { setMessage(result.message); setBusy(false); guide.say(SIGN_IN_LINES.oops); }
  };

  const field = 'w-full text-2xl font-black rounded-2xl border-4 border-orange-300 focus:border-orange-500 outline-none px-4 py-3 bg-orange-50 dark:bg-slate-900 dark:text-white';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-200 via-orange-200 to-pink-200 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
      <motion.form
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={e => { e.preventDefault(); void submit(); }}
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md flex flex-col items-center gap-4 text-center"
      >
        <HearMe emoji="🦊" speaking={guide.speaking} onTap={() => guide.say(intro)} />
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">{mode === 'login' ? 'Who is playing?' : 'New player'}</h1>
        <p className="font-bold text-slate-500 dark:text-slate-300">
          {mode === 'login' ? 'Sign in so your progress is saved. A grown-up can help.' : 'Pick a username and a password. You need the family invite code.'}
        </p>

        <label className="w-full text-left">
          <span className="font-black text-sm text-slate-500 dark:text-slate-400">USERNAME</span>
          <input value={username} onChange={e => setUsername(e.target.value.slice(0, 24))} autoCapitalize="none" autoCorrect="off" autoComplete="username" spellCheck={false} onPointerDown={() => guide.sayOnce(SIGN_IN_LINES.username)} className={field} />
        </label>
        <label className="w-full text-left">
          <span className="font-black text-sm text-slate-500 dark:text-slate-400">PASSWORD</span>
          <input type="password" value={password} onChange={e => setPassword(e.target.value.slice(0, 200))} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} onPointerDown={() => guide.sayOnce(SIGN_IN_LINES.password)} className={field} />
        </label>
        {mode === 'signup' && (
          <label className="w-full text-left">
            <span className="font-black text-sm text-slate-500 dark:text-slate-400">INVITE CODE</span>
            <input value={invite} onChange={e => setInvite(e.target.value.toUpperCase().slice(0, 40))} autoCapitalize="characters" autoCorrect="off" autoComplete="off" spellCheck={false} onPointerDown={() => guide.sayOnce(SIGN_IN_LINES.invite)} className={`${field} tracking-widest`} />
          </label>
        )}

        {message && <p role="alert" className="font-black text-rose-600">{message}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-emerald-500 border-b-8 border-emerald-700 text-white font-black text-3xl rounded-3xl py-4 shadow-lg disabled:opacity-40"
        >
          {busy ? '…' : mode === 'login' ? 'GO ▶' : 'MAKE MY ACCOUNT ▶'}
        </button>
        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); }}
          className="font-black text-orange-600 dark:text-orange-300 underline"
        >
          {mode === 'login' ? 'New here? Make an account' : 'I already have an account'}
        </button>
      </motion.form>
    </div>
  );
}
