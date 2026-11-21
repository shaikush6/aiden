'use client';

import type { ReactNode } from 'react';

/** Building blocks for the admin panel: plain, compact, grown-up styling (this is not a screen for the kids). */

export function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
      <div>
        <h3 className="font-black text-slate-800 dark:text-slate-100">{title}</h3>
        {hint && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function Toggle({ label, hint, on, onChange, disabled = false }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center justify-between gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span>
        <span className="block font-bold text-slate-700 dark:text-slate-200">{label}</span>
        {hint && <span className="block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={() => onChange(!on)}
        className={`shrink-0 w-12 h-7 rounded-full p-1 transition-colors ${on ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}

const TONES = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  plain: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
} as const;

export function Btn({ tone = 'plain', onClick, disabled = false, children }: { tone?: keyof typeof TONES; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`font-bold text-sm rounded-xl px-3 py-2 disabled:opacity-40 ${TONES[tone]}`}>
      {children}
    </button>
  );
}

export function Note({ text, tone = 'ok' }: { text: string | null; tone?: 'ok' | 'error' }) {
  if (!text) return null;
  return <p role="status" className={`text-sm font-bold ${tone === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{text}</p>;
}

export const inputClass = 'rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100';

/** "5 min ago", "3 days ago". */
export function ago(ms: number): string {
  if (!ms) return 'never';
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 90) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86_400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86_400)} days ago`;
}
