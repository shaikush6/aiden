'use client';

import { useCallback, useState } from 'react';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { NUMBER_TEXT } from '@/lib/number-land/words';
import { sfx } from '@/lib/sfx';
import { useAlive } from '@/components/reading-quest/ui';

/** The blocks to count aloud for n: 1 to n, or for teens "ten" and then on from eleven. */
export function countingOrder(n: number): number[] {
  if (n <= 0) return [];
  return n <= 10 ? Array.from({ length: n }, (_, i) => i) : [9, ...Array.from({ length: n - 10 }, (_, i) => 10 + i)];
}

/**
 * Count a Block Buddy out loud, lighting each block as its number is spoken.
 * `lit` is the block to highlight; run(n) resolves true when the whole count finished.
 */
export function useCounting() {
  const alive = useAlive();
  const [lit, setLit] = useState<number | null>(null);

  const run = useCallback(async (n: number): Promise<boolean> => {
    for (const i of countingOrder(n)) {
      if (!alive.current) return false;
      setLit(i);
      sfx.count(i);
      const finished = await say(lineClip(NUMBER_TEXT[i + 1], 'word'));
      if (!finished) {
        if (alive.current) setLit(null);
        return false;
      }
    }
    if (alive.current) setLit(null);
    return true;
  }, [alive]);

  return { lit, run };
}
