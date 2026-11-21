'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { onSpeechChange, stopAudio } from '@/lib/audio-player';
import { say } from '@/lib/reading-quest/audio';

/** Browsers only allow sound after the first tap on the page. True once that has happened. */
function canPlaySound(): boolean {
  if (typeof navigator === 'undefined') return false;
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  // Older browsers cannot tell us, so assume no: the child taps the speaker instead.
  return activation?.hasBeenActive ?? false;
}

/**
 * The guide's voice on the screens around signing in.
 * `say` reads a line now; `sayOnce` reads it only the first time (so tapping a box twice is not repeated; call it from a real tap, not focus, which autofill and password managers trigger);
 * `intro` reads the screen's opening line by itself when the browser already allows sound.
 * Stops talking when the screen goes away.
 */
export function useGuide(intro?: string) {
  const [speaking, setSpeaking] = useState(false);
  const said = useRef(new Set<string>());

  useEffect(() => onSpeechChange(setSpeaking), []);
  useEffect(() => () => stopAudio(), []);

  useEffect(() => {
    if (intro && canPlaySound()) void say(intro);
  }, [intro]);

  const speak = useCallback((text: string) => {
    said.current.add(text);
    void say(text);
  }, []);

  const speakOnce = useCallback((text: string) => {
    if (said.current.has(text)) return;
    said.current.add(text);
    void say(text);
  }, []);

  return { speaking, say: speak, sayOnce: speakOnce };
}
