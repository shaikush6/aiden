'use client';

import { useState } from 'react';
import { TABS } from '@/components/Navigation';
import { saveAppConfig } from '@/lib/admin-client';
import type { AppConfig, AppTab } from '@/lib/app-config';
import { previewVoice } from '@/lib/reading-quest/audio';
import { NARRATOR_VOICES } from '@/lib/reading-quest/narration';
import { Btn, Card, Note, Toggle, inputClass } from './ui';

const SAMPLE = 'Hi explorer! Tap the glowing circle to start your next rescue!';

/** Settings for everyone who uses the app. Nothing changes until "Save for everyone". */
export default function AppSettings({ config, onSaved }: { config: AppConfig; onSaved: (c: AppConfig) => void }) {
  const [draft, setDraft] = useState(config);
  const [note, setNote] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const [busy, setBusy] = useState(false);
  const changed = JSON.stringify(draft) !== JSON.stringify(config);
  const set = (patch: Partial<AppConfig>) => { setDraft(d => ({ ...d, ...patch })); setNote(null); };

  const toggleTab = (id: AppTab, visible: boolean) =>
    set({ hiddenTabs: visible ? draft.hiddenTabs.filter(t => t !== id) : [...draft.hiddenTabs, id] });

  const save = async () => {
    setBusy(true);
    const r = await saveAppConfig(draft);
    setBusy(false);
    if (!r.ok) { setNote({ text: r.message, tone: 'error' }); return; }
    onSaved(r.value);
    setDraft(r.value);
    setNote({ text: 'Saved. Other devices pick it up the next time the app opens.', tone: 'ok' });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card title="Guide voice" hint="For everyone who has not picked a voice themselves in the grown-ups panel.">
        <div className="flex flex-wrap gap-2">
          {NARRATOR_VOICES.map(v => (
            <span key={v.id} className={`flex items-center rounded-xl border ${draft.voice === v.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-600'}`}>
              <button type="button" onClick={() => set({ voice: v.id })} className="px-3 py-2 font-bold text-sm text-slate-700 dark:text-slate-200" aria-pressed={draft.voice === v.id}>
                {draft.voice === v.id ? '● ' : '○ '}{v.label}
              </button>
              <button type="button" onClick={() => void previewVoice(v.id, SAMPLE)} className="px-2 py-2 text-sm" aria-label={`Hear ${v.label}`}>🔊</button>
            </span>
          ))}
        </div>
        <Toggle label="Music on by default" hint="For everyone who has not switched music on or off themselves." on={draft.music} onChange={music => set({ music })} />
      </Card>

      <Card title="Tabs" hint="Hidden tabs disappear for everyone. You still see them, marked as hidden.">
        <div className="grid sm:grid-cols-2 gap-2">
          {TABS.map(t => (
            <Toggle key={t.id} label={`${t.icon} ${t.label}`} on={!draft.hiddenTabs.includes(t.id)} disabled={t.id === 'quest'} onChange={v => toggleTab(t.id, v)} />
          ))}
        </div>
      </Card>

      <Card title="Who can join">
        <Toggle label="New accounts allowed" hint="Off: the invite code stops working until you switch this back on." on={draft.signupsOpen} onChange={signupsOpen => set({ signupsOpen })} />
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Invite code</span>
          <input
            value={draft.inviteCode}
            onChange={e => set({ inviteCode: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 40) })}
            placeholder="Empty: use the code set in Vercel"
            className={`${inputClass} tracking-widest`}
          />
        </label>
      </Card>

      <div className="flex items-center gap-3 sticky bottom-0 bg-slate-100/90 dark:bg-slate-900/90 py-2">
        <Btn tone="primary" disabled={!changed || busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save for everyone'}</Btn>
        {changed && <Btn onClick={() => setDraft(config)}>Undo changes</Btn>}
        <Note text={note?.text ?? null} tone={note?.tone} />
      </div>
    </div>
  );
}
