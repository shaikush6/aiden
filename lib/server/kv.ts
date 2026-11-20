// The app's database: the free Upstash Redis store connected to this project in Vercel, reached over plain HTTPS.
// While developing without one, everything lives in memory (and is lost on restart).
const URL_VARS = ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL'] as const
const TOKEN_VARS = ['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN'] as const

function firstEnv(names: readonly string[]): string | undefined {
  for (const n of names) if (process.env[n]) return process.env[n]
  return undefined
}

const remote = (): boolean => Boolean(firstEnv(URL_VARS) && firstEnv(TOKEN_VARS))

/** True when there is somewhere to keep accounts. In production that means the Upstash store. */
export function kvAvailable(): boolean {
  return remote() || process.env.NODE_ENV !== 'production'
}

// ---------- in-memory stand-in for local development ----------

const memory = new Map<string, { value: string; expiresAt: number | null }>()

function memGet(key: string): string | null {
  const hit = memory.get(key)
  if (!hit) return null
  if (hit.expiresAt !== null && hit.expiresAt <= Date.now()) { memory.delete(key); return null }
  return hit.value
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(firstEnv(URL_VARS) as string, {
    method: 'POST',
    headers: { Authorization: `Bearer ${firstEnv(TOKEN_VARS)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Store answered ${res.status}`)
  return ((await res.json()) as { result: unknown }).result
}

// ---------- the few commands the app needs ----------

export async function kvGet(key: string): Promise<string | null> {
  return remote() ? ((await redis(['GET', key])) as string | null) : memGet(key)
}

export async function kvGetJson<T = unknown>(key: string): Promise<T | null> {
  const text = await kvGet(key)
  if (!text) return null
  try { return JSON.parse(text) as T } catch { return null }
}

/** Save a value. With `ttlSeconds` it disappears on its own after that long. */
export async function kvSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (remote()) {
    await redis(ttlSeconds ? ['SET', key, value, 'EX', ttlSeconds] : ['SET', key, value])
    return
  }
  memory.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null })
}

/** Save only if nothing is there yet (used to claim a username). Returns true when it was saved. */
export async function kvSetNew(key: string, value: string): Promise<boolean> {
  if (remote()) return (await redis(['SET', key, value, 'NX'])) === 'OK'
  if (memGet(key) !== null) return false
  memory.set(key, { value, expiresAt: null })
  return true
}

export async function kvDel(key: string): Promise<void> {
  if (remote()) await redis(['DEL', key])
  else memory.delete(key)
}

/** Add to a whole-number counter and return the new total. */
export async function kvIncr(key: string, by: number): Promise<number> {
  if (remote()) return Number(await redis(['INCRBY', key, Math.round(by)]))
  const next = Number(memGet(key) ?? 0) + Math.round(by)
  memory.set(key, { value: String(next), expiresAt: null })
  return next
}
