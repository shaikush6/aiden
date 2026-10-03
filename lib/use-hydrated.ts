import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False on the server and during hydration, true afterwards.
 * Use it to render settings-dependent text only in the browser, so the server HTML can never disagree.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
