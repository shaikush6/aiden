// Where profiles are kept. In production this is the free Upstash Redis store from the Vercel Marketplace,
// reached over plain HTTPS (no extra package). While developing without one, profiles live in memory.
import type { ProfileData } from '../profile/merge.ts'

const URL_VARS = ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL'] as const
const TOKEN_VARS = ['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN'] as const

function firstEnv(names: readonly string[]): string | undefined {
  for (const n of names) if (process.env[n]) return process.env[n]
  return undefined
}

const memory = new Map<string, string>()
const key = (name: string): string => `aiden:profile:${name}`

/** True when a place to keep profiles exists. Without one, the gate stays open so nobody is locked out. */
export function storeAvailable(): boolean {
  return Boolean(firstEnv(URL_VARS) && firstEnv(TOKEN_VARS)) || process.env.NODE_ENV !== 'production'
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const url = firstEnv(URL_VARS)
  const token = firstEnv(TOKEN_VARS)
  if (!url || !token) throw new Error('No store')
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Store answered ${res.status}`)
  return ((await res.json()) as { result: unknown }).result
}

const remote = (): boolean => Boolean(firstEnv(URL_VARS) && firstEnv(TOKEN_VARS))

export async function readProfile(name: string): Promise<unknown | null> {
  const text = remote() ? ((await redis(['GET', key(name)])) as string | null) : (memory.get(key(name)) ?? null)
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

export async function writeProfile(name: string, data: ProfileData): Promise<void> {
  const text = JSON.stringify(data)
  if (remote()) await redis(['SET', key(name), text])
  else memory.set(key(name), text)
}
