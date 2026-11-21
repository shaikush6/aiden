'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AdminData } from '@/lib/admin-types';
import { loadAdminData } from '@/lib/admin-client';
import Accounts from './Accounts';
import AppSettings from './AppSettings';
import LookAndDebug from './LookAndDebug';
import TestingTools from './TestingTools';

const SECTIONS = [
  { id: 'testing', label: '🧪 Testing' },
  { id: 'accounts', label: '👥 Accounts' },
  { id: 'settings', label: '⚙️ App settings' },
  { id: 'look', label: '🎨 Look & debug' },
] as const;
type Section = (typeof SECTIONS)[number]['id'];

/** The admin's control room. Only accounts listed as admins can open it (the server checks every request too). */
export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<Section>('testing');
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void loadAdminData().then(r => {
      if (!alive) return;
      if (r.ok) setData(r.value);
      else setError(r.message);
    });
    return () => { alive = false; };
  }, []);

  const needsData = section !== 'testing';

  return (
    <motion.div className="fixed inset-0 z-[60] bg-slate-100 dark:bg-slate-900 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <header className="sticky top-0 z-10 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur pt-4 pb-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">🛠️ Admin</h2>
            <button type="button" onClick={onClose} className="font-black rounded-xl px-4 py-2 bg-slate-800 text-white dark:bg-white dark:text-slate-900">Done</button>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`shrink-0 font-bold text-sm rounded-xl px-3 py-2 ${section === s.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </header>

        {section === 'testing' && <TestingTools onClose={onClose} />}
        {needsData && !data && <p className="font-bold text-slate-500 py-8 text-center">{error ?? 'Loading…'}</p>}
        {data && section === 'accounts' && <Accounts accounts={data.accounts} me={data.me} onChange={accounts => setData({ ...data, accounts })} />}
        {data && section === 'settings' && <AppSettings config={data.config} onSaved={config => setData({ ...data, config })} />}
        {data && section === 'look' && <LookAndDebug config={data.config} onSaved={config => setData({ ...data, config })} />}
      </div>
    </motion.div>
  );
}
