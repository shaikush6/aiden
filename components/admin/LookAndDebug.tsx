'use client';

import { useState } from 'react';
import { saveAppConfig } from '@/lib/admin-client';
import { THEMES, type AppConfig } from '@/lib/app-config';
import { getAudioLog } from '@/lib/audio-player';
import { clearVoiceCache } from '@/lib/speech';
import { Btn, Card, Note } from './ui';

// Vercel fills these in at build time.
const COMMIT = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local';
const MESSAGE = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE?.split('\n')[0] ?? 'running on this computer';

const RESULT_STYLE = { played: 'text-emerald-600', 'device voice': 'text-amber-600', skipped: 'text-rose-600' } as const;

/** The app-wide colour theme, and what is going on under the hood on this device. */
export default function LookAndDebug({ config, onSaved }: { config: AppConfig; onSaved: (c: AppConfig) => void }) {
  const [log, setLog] = useState(getAudioLog);
  const [note, setNote] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);

  const pickTheme = async (theme: AppConfig['theme']) => {
    const r = await saveAppConfig({ theme });
    if (!r.ok) { setNote({ text: r.message, tone: 'error' }); return; }
    onSaved(r.value);
    setNote({ text: 'Theme saved for everyone.', tone: 'ok' });
  };

  const clearCache = async () => {
    await clearVoiceCache();
    setNote({ text: 'Voice clips cleared on this device. They download again as they play.', tone: 'ok' });
  };

  return (
    <div className="flex flex-col gap-4">
      <Card title="Colour theme" hint="The page background for everyone. Saved as soon as you tap one.">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {THEMES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => void pickTheme(t.id)}
              aria-pressed={config.theme === t.id}
              className={`rounded-xl p-2 border-2 text-left ${config.theme === t.id ? 'border-indigo-500' : 'border-transparent'}`}
            >
              <span className={`block h-12 rounded-lg bg-gradient-to-br ${t.swatch}`} />
              <span className="block mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">{config.theme === t.id ? '● ' : ''}{t.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="This version" hint="What is running right now.">
        <p className="text-sm font-mono text-slate-700 dark:text-slate-200">{COMMIT} · {MESSAGE}</p>
      </Card>

      <Card title="Voice log" hint="The last things the voice tried to say on this device. 'device voice' means the clip did not load and the robotic built-in voice read it instead.">
        <div className="flex gap-2">
          <Btn onClick={() => setLog(getAudioLog())}>Refresh</Btn>
          <Btn onClick={() => void clearCache()}>Clear saved voice clips</Btn>
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing yet. Play something, then refresh.</p>
        ) : (
          <ol className="text-xs font-mono flex flex-col gap-1 max-h-64 overflow-y-auto">
            {[...log].reverse().map((e, i) => (
              <li key={`${e.at}-${i}`} className="flex gap-2">
                <span className="text-slate-400 shrink-0">{new Date(e.at).toLocaleTimeString()}</span>
                <span className={`shrink-0 ${RESULT_STYLE[e.result]}`}>{e.result}</span>
                <span className="text-slate-700 dark:text-slate-200 truncate">{e.what}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
      <Note text={note?.text ?? null} tone={note?.tone} />
    </div>
  );
}
