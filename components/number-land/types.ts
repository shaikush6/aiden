import type { NStep } from '@/lib/number-land/plan';
import type { StepResult } from '@/components/reading-quest/ui';
import { buddyLayout } from '@/lib/number-land/buddy';

/** Props every Number Land activity receives. */
export type StepProps<K extends NStep['kind']> = {
  step: Extract<NStep, { kind: K }>;
  onDone: (r: StepResult) => void;
};

/** Block size for a row of Block Buddy choice cards, so the biggest buddy still fits. */
export function cardSize(maxN: number): number {
  return maxN <= 5 ? 30 : maxN <= 10 ? 24 : 15;
}

/** Block size so a row of buddies is as big as it can be while the tallest still fits in `maxHeight` px. */
export function fitSize(numbers: number[], maxHeight = 150, maxSize = 60): number {
  const rows = Math.max(1, ...numbers.map(n => buddyLayout(n).rows));
  return Math.max(10, Math.min(maxSize, Math.floor(maxHeight / rows) - 3));
}
