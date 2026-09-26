'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { stopAudio } from '@/lib/audio-player';
import { say, sayPhoneme, sayWord } from '@/lib/reading-quest/audio';
import { LINES, PRAISE, RETRY } from '@/lib/reading-quest/lines';
import type { ParsedWord } from '@/lib/reading-quest/types';

export interface StepResult { firstTry: boolean }

/** Ref that is false once the component unmounts, so async handlers can bail out. */
export function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);
  return alive;
}

/** Speak a line when the step appears; stop speaking when it goes away. */
export function useSayOnMount(...parts: Parameters<typeof say>) {
  const partsRef = useRef(parts);
  useEffect(() => {
    say(...partsRef.current);
    return () => stopAudio();
  }, []);
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export type ChoiceState = 'idle' | 'right' | 'wrong' | 'reveal';

/**
 * Standard answer flow for every activity:
 * right → praise → done. First miss → "try again". Second miss → show the answer → done.
 */
export function useAnswer(onDone: (r: StepResult) => void) {
  const alive = useAlive();
  const [misses, setMisses] = useState(0);
  const [busy, setBusy] = useState(false);
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  const [status, setStatus] = useState<'asking' | 'right' | 'reveal'>('asking');
  // Refs, not state, guard against double taps: two taps can land before React re-renders.
  const locked = useRef(false);
  const missCount = useRef(0);

  const right = useCallback(async (after?: () => Promise<unknown>) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setStatus('right');
    if (after) await after();
    if (!alive.current) return;
    await Promise.all([say(pick(PRAISE)), wait(700)]);
    if (alive.current) onDone({ firstTry: missCount.current === 0 });
  }, [onDone, alive]);

  const wrong = useCallback(async (choiceKey: string, reveal?: () => Promise<unknown>) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    const n = ++missCount.current;
    setMisses(n);
    setWrongPick(choiceKey);
    if (n < 2) {
      await Promise.all([say(pick(RETRY)), wait(900)]);
      if (!alive.current) return;
      setWrongPick(null);
      setBusy(false);
      locked.current = false;
      return;
    }
    setStatus('reveal');
    await Promise.all([say(LINES.reveal), wait(600)]);
    if (!alive.current) return;
    if (reveal) await reveal();
    await wait(1200);
    if (alive.current) onDone({ firstTry: false });
  }, [onDone, alive]);

  const stateFor = (key: string, correctKey: string): ChoiceState => {
    if (status !== 'asking' && key === correctKey) return status === 'right' ? 'right' : 'reveal';
    if (wrongPick === key) return 'wrong';
    return 'idle';
  };

  return { right, wrong, busy, misses, status, stateFor };
}

// ---------- visual building blocks ----------

const STATE_CLASSES: Record<ChoiceState, string> = {
  idle: 'bg-white dark:bg-slate-800 border-sky-200 dark:border-slate-600 hover:border-sky-400',
  right: 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500 ring-4 ring-emerald-300',
  wrong: 'bg-rose-100 dark:bg-rose-900/50 border-rose-400',
  reveal: 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400 ring-4 ring-emerald-300 animate-pulse',
};

export function ChoiceCard({
  state, onClick, children, disabled, label,
}: { state: ChoiceState; onClick: () => void; children: ReactNode; disabled?: boolean; label: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.04, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      animate={state === 'wrong' ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-3xl border-4 border-b-8 shadow-lg flex items-center justify-center select-none transition-colors
        min-h-[120px] min-w-[120px] p-4 ${STATE_CLASSES[state]} ${disabled && state === 'idle' ? 'opacity-60' : ''}`}
    >
      {children}
    </motion.button>
  );
}

export function BigButton({
  onClick, children, color = 'bg-emerald-500 border-emerald-700', disabled, label,
}: { onClick: () => void; children: ReactNode; color?: string; disabled?: boolean; label?: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      className={`${color} text-white font-black text-2xl rounded-3xl border-b-8 px-8 py-4 shadow-lg select-none
        disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </motion.button>
  );
}

export function SpeakerButton({ onClick, label = 'Hear it again', big }: { onClick: () => void; label?: string; big?: boolean }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      className={`${big ? 'w-20 h-20 text-4xl' : 'w-14 h-14 text-2xl'} rounded-full bg-sky-500 border-b-4 border-sky-700
        text-white shadow-lg flex items-center justify-center shrink-0`}
    >
      🔊
    </motion.button>
  );
}

/** Kit the fox, our guide, with the current instruction and a replay button. */
export function Guide({ text, onReplay }: { text: string; onReplay: () => void }) {
  return (
    <div className="flex items-center gap-3 w-full max-w-3xl mx-auto">
      <motion.div
        className="text-5xl shrink-0"
        animate={{ rotate: [0, -6, 6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }}
        aria-hidden
      >
        🦊
      </motion.div>
      <div className="flex-1 bg-white/90 dark:bg-slate-800/90 rounded-3xl rounded-bl-md px-4 py-3 shadow font-extrabold text-lg text-slate-700 dark:text-slate-100 leading-snug">
        {text}
      </div>
      <SpeakerButton onClick={onReplay} label="Hear the instructions again" />
    </div>
  );
}

// ---------- the word with "sound buttons" ----------

const SIZE = {
  xl: { text: 'text-7xl sm:text-8xl', gap: 'gap-1', marker: 'h-3', dot: 'w-3.5 h-3.5' },
  lg: { text: 'text-5xl sm:text-6xl', gap: 'gap-1', marker: 'h-2.5', dot: 'w-3 h-3' },
  md: { text: 'text-3xl sm:text-4xl', gap: 'gap-0.5', marker: 'h-2', dot: 'w-2.5 h-2.5' },
};

/**
 * A word drawn letter by letter. With `buttons`, each sound gets a "sound button" underneath
 * (a dot for one letter, a bar for letters that team up); tapping it plays that sound.
 * Heart parts are red with a heart; magic-e partners are purple with a sparkle.
 */
export function WordView({
  word, size = 'lg', buttons = false, heart = [], active = null, onUnit, alienWord,
}: {
  word: ParsedWord;
  size?: keyof typeof SIZE;
  buttons?: boolean;
  heart?: number[];
  active?: number | null;
  onUnit?: (unit: number) => void;
  alienWord?: boolean;
}) {
  const s = SIZE[size];
  const tap = (unit: number) => {
    if (onUnit) return onUnit(unit);
    if (heart.includes(unit)) sayWord(word, alienWord);
    else sayPhoneme(word.units[unit].phoneme);
  };

  return (
    <div className={`flex items-end justify-center ${buttons ? s.gap : ''}`} aria-label={word.text}>
      {word.chunks.map((chunk, i) => {
        const unit = word.units[chunk.unit];
        const isHeart = heart.includes(chunk.unit);
        const isSplit = unit.chunks.length > 1;
        const isActive = active === chunk.unit;
        const newSyllable = i > 0 && chunk.syllable !== word.chunks[i - 1].syllable;
        const color = isHeart
          ? 'text-rose-500'
          : isSplit
            ? 'text-purple-600 dark:text-purple-400'
            : 'text-slate-800 dark:text-slate-100';
        const Letter = (
          <span className={`${s.text} font-black leading-none tracking-tight ${color}`}>{chunk.text}</span>
        );
        return (
          <div key={i} className={`flex flex-col items-center ${newSyllable ? 'ml-4 sm:ml-6' : ''}`}>
            <span className="text-lg h-6 leading-none" aria-hidden>
              {isHeart ? '❤️' : isSplit && chunk.text === 'e' && i === unit.chunks[1] ? '✨' : ''}
            </span>
            {buttons ? (
              <motion.button
                type="button"
                onClick={() => tap(chunk.unit)}
                animate={isActive ? { scale: 1.18, y: -6 } : { scale: 1, y: 0 }}
                className={`flex flex-col items-center gap-2 px-1 rounded-2xl ${isActive ? 'bg-yellow-200/80 dark:bg-yellow-500/30' : ''}`}
                aria-label={isHeart ? `heart part ${chunk.text}` : `sound ${unit.grapheme}`}
              >
                {Letter}
                <span className={`${s.marker} flex items-center justify-center w-full`}>
                  {isHeart ? (
                    <span className="text-rose-400 text-sm leading-none">♥</span>
                  ) : chunk.text.length > 1 ? (
                    <span className={`${s.marker} w-full rounded-full ${isActive ? 'bg-amber-500' : 'bg-sky-500'}`} />
                  ) : (
                    <span className={`${s.dot} rounded-full ${isSplit ? 'bg-purple-500' : isActive ? 'bg-amber-500' : 'bg-sky-500'}`} />
                  )}
                </span>
              </motion.button>
            ) : (
              <div>{Letter}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Play a word's sounds one by one with the matching sound button lit, like a finger under each sound. */
export function useSoundOut(word: ParsedWord, skip: number[] = []) {
  const alive = useAlive();
  const [active, setActive] = useState<number | null>(null);
  const run = useCallback(async (gapMs = 450) => {
    for (let i = 0; i < word.units.length; i++) {
      if (skip.includes(i)) continue;
      if (!alive.current) return false;
      setActive(i);
      const done = await sayPhoneme(word.units[i].phoneme);
      if (!done) { if (alive.current) setActive(null); return false; }
      await wait(gapMs);
    }
    if (alive.current) setActive(null);
    return true;
  }, [word, skip, alive]);
  return { active, run };
}

export function Emoji({ children, size = 'text-6xl' }: { children: string; size?: string }) {
  return <span className={`${size} leading-none`} role="img" aria-hidden>{children}</span>;
}

export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="bg-yellow-300 border-b-4 border-yellow-500 rounded-2xl px-5 py-2 font-black text-lg text-yellow-900 shadow"
      aria-label="Show sound buttons"
    >
      💡 HELP
    </motion.button>
  );
}
