// The admin's app-wide settings, kept in the store under one key.
import { parseConfig, type AppConfig } from '../app-config.ts'
import { kvGetJson, kvSet } from './kv.ts'

const KEY = 'aiden:config'
// Every page load reads this, so keep it for a few seconds instead of asking the store each time.
const FRESH_MS = 15_000
let cached: { value: AppConfig; at: number } | null = null

export async function getConfig(): Promise<AppConfig> {
  if (cached && Date.now() - cached.at < FRESH_MS) return cached.value
  let value: AppConfig
  try { value = parseConfig(await kvGetJson(KEY)) } catch { value = parseConfig(null) }
  cached = { value, at: Date.now() }
  return value
}

export async function saveConfig(next: unknown): Promise<AppConfig> {
  const value = parseConfig(next)
  await kvSet(KEY, JSON.stringify(value))
  cached = { value, at: Date.now() }
  return value
}
