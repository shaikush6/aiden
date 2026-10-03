'use client';

import { useCallback, useEffect, useRef } from 'react';
import { stopAudio } from '@/lib/audio-player';

export interface CancelToken { cancelled: boolean }

/**
 * Run an async task (an animation that speaks) when the screen appears, and again whenever restart() is called.
 * Leaving the screen, or restarting, cancels the old run: the task checks `token.cancelled` between steps.
 */
export function useRunOnMount(task: (token: CancelToken) => Promise<void>): () => void {
  const latest = useRef(task);
  const current = useRef<CancelToken | null>(null);

  useEffect(() => { latest.current = task; });

  useEffect(() => {
    const token: CancelToken = { cancelled: false };
    current.current = token;
    void latest.current(token);
    return () => { token.cancelled = true; stopAudio(); };
  }, []);

  return useCallback(() => {
    if (current.current) current.current.cancelled = true;
    const token: CancelToken = { cancelled: false };
    current.current = token;
    void latest.current(token);
  }, []);
}
