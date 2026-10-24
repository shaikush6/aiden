'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { stopAudio } from '@/lib/audio-player';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { MUSIC_READY } from '@/lib/reading-quest/music-tracks';
import { getProgress, getServerProgress, setSettings, subscribeProgress } from '@/lib/reading-quest/progress';

/** Independent on/off switches for background music and the narrator voice, and a mixer for how loud each one is. */
export default function SoundSwitches({ compact = false }: { compact?: boolean }) {
  const { settings } = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  const [mixing, setMixing] = useState(false);
  return (
    <div className="flex gap-2 relative">
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
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => setMixing(m => !m)}
        aria-pressed={mixing}
        aria-label="Volume mixer"
        className={`rounded-2xl shadow font-black flex items-center gap-2 border-b-4
          ${compact ? 'w-12 h-12 justify-center text-2xl' : 'px-4 py-2 text-xl'}
          ${mixing ? 'bg-amber-400 border-amber-600 text-amber-950' : 'bg-white/85 dark:bg-slate-800/85 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'}`}
      >
        <span>🎚️</span>
        {!compact && <span className="text-sm">VOLUME</span>}
      </motion.button>
      {mixing && <Mixer onClose={() => setMixing(false)} />}
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

/** Two sliders, so the music can sit behind the voice exactly where he (or a grown-up) wants it. */
function Mixer({ onClose }: { onClose: () => void }) {
  const { settings } = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label="Volume mixer"
        className="absolute right-0 top-full mt-2 z-40 w-72 max-w-[85vw] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-4 flex flex-col gap-4 text-slate-800 dark:text-slate-100"
      >
        <Slider
          icon="🎵"
          label="Music"
          value={settings.musicVolume}
          onChange={v => setSettings({ musicVolume: v })}
        />
        <Slider
          icon="🎙️"
          label="Voice"
          value={settings.voiceVolume}
          onChange={v => setSettings({ voiceVolume: v })}
          // Let him hear the new loudness when he lets go.
          onDone={() => { void say(lineClip('one', 'word')); }}
        />
        <label className="flex items-center gap-3 font-bold text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={settings.duck}
            onChange={e => setSettings({ duck: e.target.checked })}
            className="w-6 h-6 accent-violet-500"
          />
          Lower the music while the voice talks
        </label>
        <button type="button" onClick={onClose} className="self-end font-black rounded-xl px-4 py-2 bg-emerald-500 text-white">OK ✓</button>
      </div>
    </>
  );
}

function Slider({ icon, label, value, onChange, onDone }: { icon: string; label: string; value: number; onChange: (v: number) => void; onDone?: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between font-black mb-1">
        <span>{icon} {label}</span>
        <span className="text-slate-500 dark:text-slate-400">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(value * 100)}
        onChange={e => onChange(Number(e.target.value) / 100)}
        onPointerUp={onDone}
        onKeyUp={onDone}
        aria-label={`${label} volume`}
        className="w-full h-10 accent-violet-500"
      />
    </div>
  );
}
