'use client';

import { useState } from 'react';
import type { AdminAccount } from '@/lib/admin-types';
import { deleteAccount, resetSpent, setPassword, setQuota, type Result } from '@/lib/admin-client';
import { Btn, Card, Note, ago, inputClass } from './ui';

/** Every account: how far they got, when they last played, and their AI credit. */
export default function Accounts({ accounts, me, onChange }: { accounts: AdminAccount[]; me: string; onChange: (next: AdminAccount[]) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const spent = accounts.reduce((sum, a) => sum + a.spent, 0);

  const replace = (a: AdminAccount) => onChange(accounts.map(x => (x.username === a.username ? a : x)));
  const remove = (username: string) => { onChange(accounts.filter(x => x.username !== username)); setOpen(null); };

  return (
    <div className="flex flex-col gap-4">
      <Card title={`${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`} hint={`AI spending so far, all accounts together: $${spent.toFixed(2)}`}>
        <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
          {accounts.map(a => (
            <li key={a.username} className="py-2">
              <button type="button" onClick={() => setOpen(open === a.username ? null : a.username)} className="w-full text-left flex items-center gap-3">
                <span className="flex-1 min-w-0">
                  <span className="block font-black text-slate-800 dark:text-slate-100 truncate">
                    {a.displayName} {a.admin && <span className="text-xs bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5 align-middle">admin</span>}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    @{a.username} · played {ago(a.lastSaved)} · 🦊 {a.quest.done}/{a.quest.of} · 🔢 {a.land.done}/{a.land.of}
                  </span>
                </span>
                <CreditBar spent={a.spent} quota={a.quota} />
                <span className="text-slate-400" aria-hidden>{open === a.username ? '▴' : '▾'}</span>
              </button>
              {open === a.username && <AccountActions account={a} isMe={a.username === me} onUpdate={replace} onDelete={() => remove(a.username)} />}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function CreditBar({ spent, quota }: { spent: number; quota: number }) {
  const pct = Math.min(100, (spent / quota) * 100);
  return (
    <span className="w-28 shrink-0 text-right">
      <span className="block text-xs font-bold text-slate-600 dark:text-slate-300">${spent.toFixed(2)} of ${quota.toFixed(0)}</span>
      <span className="block h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1">
        <span className={`block h-full ${pct < 80 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}

function AccountActions({ account, isMe, onUpdate, onDelete }: { account: AdminAccount; isMe: boolean; onUpdate: (a: AdminAccount) => void; onDelete: () => void }) {
  const [budget, setBudget] = useState(String(account.quota));
  const [password, setNewPassword] = useState('');
  const [confirmName, setConfirmName] = useState('');
  const [note, setNote] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (job: () => Promise<Result<{ account: AdminAccount }>>, done: string) => {
    setBusy(true);
    const r = await job();
    setBusy(false);
    if (!r.ok) { setNote({ text: r.message, tone: 'error' }); return; }
    onUpdate(r.value.account);
    setNote({ text: done, tone: 'ok' });
  };

  const remove = async () => {
    setBusy(true);
    const r = await deleteAccount(account.username);
    setBusy(false);
    if (!r.ok) { setNote({ text: r.message, tone: 'error' }); return; }
    onDelete();
  };

  return (
    <div className="mt-3 flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">AI budget $</span>
        <input inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value.replace(/[^\d.]/g, '').slice(0, 6))} className={`${inputClass} w-24`} aria-label="AI budget in dollars" />
        <Btn tone="primary" disabled={busy} onClick={() => void run(() => setQuota(account.username, Number(budget)), 'Budget saved.')}>Save budget</Btn>
        <Btn disabled={busy || account.spent === 0} onClick={() => void run(() => resetSpent(account.username), 'Spending reset to $0.')}>Reset spending to $0</Btn>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input type="text" autoComplete="off" placeholder="New password (6+ letters)" value={password} onChange={e => setNewPassword(e.target.value.slice(0, 200))} className={`${inputClass} flex-1 min-w-40`} aria-label="New password" />
        <Btn disabled={busy || password.length < 6} onClick={() => void run(() => setPassword(account.username, password), 'Password changed. Tell them the new one.').then(() => setNewPassword(''))}>Set new password</Btn>
      </div>

      {!isMe && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
          <input placeholder={`Type ${account.username} to delete`} value={confirmName} onChange={e => setConfirmName(e.target.value)} className={`${inputClass} flex-1 min-w-40`} aria-label="Type the username to confirm" />
          <Btn tone="danger" disabled={busy || confirmName.trim().toLowerCase() !== account.username} onClick={() => void remove()}>Delete account and progress</Btn>
        </div>
      )}
      <Note text={note?.text ?? null} tone={note?.tone} />
    </div>
  );
}
