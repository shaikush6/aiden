// A tiny event channel so the level screen can react the moment an answer is given
// (Kit's face, sound effects) without every activity knowing about the top bar.
export type QuestEvent = 'right' | 'wrong'

const listeners = new Set<(e: QuestEvent) => void>()

export function emitQuestEvent(e: QuestEvent) {
  listeners.forEach(fn => fn(e))
}

export function onQuestEvent(fn: (e: QuestEvent) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
