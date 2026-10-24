// A signal that gives up after a while, so a stalled connection cannot hold the app hostage.
// (AbortSignal.timeout is missing on older iPads, so build it by hand.)
export function timeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof AbortController === 'undefined') return undefined
  const controller = new AbortController()
  setTimeout(() => controller.abort(), ms)
  return controller.signal
}
