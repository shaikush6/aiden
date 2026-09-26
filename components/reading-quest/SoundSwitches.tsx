'use client';

import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { stopAudio } from '@/lib/audio-player';
import { MUSIC_READY } from '@/lib/reading-quest/music-tracks';
import { getProgress, getServerProgress, setSettings, subscribeProgress } from '@/lib/reading-quest/progress';

/** Independent on/off switches for background music and the narrator voice. */
export default function SoundSwitches({ compact = false }: { compact?: boolean }) {
  const { settings } = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  return (
    <div className="flex gap-2">
      {MUSIC_READY && (
        <Switch
          on={settings.music}
          icon="🎵"
          label="MUSIC"
          compact={compact}
          onClick={() => setSettings({ music: !settings.music })}
        />
      )}
      <Switch
        on={settings.narrator}
        icon="🎙️"
        label="NARRATOR"
        compact={compact}
        // Switching voices mid-sentence would sound odd, so stop the current line.
        onClick={() => { stopAudio(); setSettings({ narrator: !settings.narrator }); }}
      />
    </div>
  );
}

function Switch({ on, icon, label, compact, onClick }: { on: boolean; icon: string; label: string; compact: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-pressed={on}
      aria-label={`${label.toLowerCase()} ${on ? 'on' : 'off'}`}
      className={`relative rounded-2xl shadow font-black flex items-center gap-2 border-b-4
        ${compact ? 'w-12 h-12 justify-center text-2xl' : 'px-4 py-2 text-xl'}
        ${on ? 'bg-violet-500 border-violet-700 text-white' : 'bg-white/85 dark:bg-slate-800/85 border-slate-300 dark:border-slate-600 text-slate-400'}`}
    >
      <span className={on ? '' : 'grayscale opacity-50'}>{icon}</span>
      {!compact && <span className="text-sm">{label} {on ? 'ON' : 'OFF'}</span>}
      {compact && !on && <span className="absolute inset-0 flex items-center justify-center text-rose-500 text-3xl" aria-hidden>⁄</span>}
    </motion.button>
  );
}
