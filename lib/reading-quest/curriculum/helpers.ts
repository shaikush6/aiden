import type { WordDef } from '../types.ts'

/** Word shorthand: w('sh.i.p', '🚢') */
export function w(seg: string, emoji?: string, say?: string): WordDef {
  return say ? { seg, emoji, say } : { seg, emoji }
}

/** Many plain words (no picture) at once: ws('a.n.d', 'i.s=z') */
export function ws(...segs: string[]): WordDef[] {
  return segs.map(seg => ({ seg }))
}
