// Each account gets $15 to spend on the paid AI features (the voice, Mimi, and story writing).
// Costs are worked out on the server from what each request actually used, at OpenAI's list prices.
// Spending is kept in millionths of a dollar so it adds up exactly.
import { kvDel, kvGet, kvIncr, kvSet } from './kv.ts'

export const QUOTA_USD = 15
const MICRO = 1_000_000

/** OpenAI list prices in dollars per million tokens (checked November 2026). */
export const PRICES = {
  tts: { textIn: 0.6, audioOut: 12 },                         // gpt-4o-mini-tts
  chat: { in: 2.5, out: 10 },                                 // gpt-4o
  realtime: { audioIn: 32, cachedIn: 0.4, audioOut: 64, textIn: 4, textOut: 16 }, // gpt-realtime-2
}

const spentKey = (u: string) => `aiden:spent:${u}`
const quotaKey = (u: string) => `aiden:quota:${u}`

/** This account's budget: $15, unless the admin topped it up. */
export async function quotaUsd(username: string): Promise<number> {
  const custom = Number(await kvGet(quotaKey(username)))
  return custom > 0 ? custom : QUOTA_USD
}

/** Admin: set this account's budget (in dollars). */
export async function setQuotaUsd(username: string, usd: number): Promise<void> {
  const value = Math.round(Math.min(1000, Math.max(0, usd)) * 100) / 100
  if (value === QUOTA_USD) await kvDel(quotaKey(username))
  else await kvSet(quotaKey(username), String(value))
}

/** Admin: forget what this account has spent, so the whole budget is available again. */
export async function resetSpent(username: string): Promise<void> {
  await kvDel(spentKey(username))
}

/** Admin: remove every money record of an account that is being deleted. */
export async function forgetMoney(username: string): Promise<void> {
  await Promise.all([kvDel(spentKey(username)), kvDel(quotaKey(username))])
}

export async function spentUsd(username: string): Promise<number> {
  return Number((await kvGet(spentKey(username))) ?? 0) / MICRO
}

export async function remainingUsd(username: string): Promise<number> {
  const [quota, spent] = await Promise.all([quotaUsd(username), spentUsd(username)])
  return Math.max(0, quota - spent)
}

/** Add a cost to this account. Returns what is left. */
export async function charge(username: string, usd: number): Promise<number> {
  if (!(usd > 0)) return remainingUsd(username)
  const [total, quota] = await Promise.all([kvIncr(spentKey(username), usd * MICRO), quotaUsd(username)])
  return Math.max(0, quota - total / MICRO)
}

// ---------- what each kind of request costs ----------

/**
 * Speech: OpenAI returns 128 kbps MP3, so the file size tells us how long the audio is. About 1,250 audio
 * tokens make a minute of speech. Text in: the words plus the voice instructions, about 4 characters a token.
 */
export function ttsCost(audioBytes: number, textChars: number): number {
  const seconds = audioBytes / 16_000
  const audioTokens = (seconds / 60) * 1250
  const textTokens = textChars / 4
  return (audioTokens * PRICES.tts.audioOut + textTokens * PRICES.tts.textIn) / MICRO
}

/**
 * ElevenLabs: one credit per character. Credits come with the monthly plan (Creator: about 131,000 for $22),
 * so a character costs about $0.00017.
 */
export const ELEVEN_USD_PER_CHAR = 0.00017
export function elevenCost(chars: number): number {
  return chars * ELEVEN_USD_PER_CHAR
}

export function chatCost(promptTokens: number, completionTokens: number): number {
  return (promptTokens * PRICES.chat.in + completionTokens * PRICES.chat.out) / MICRO
}

export interface RealtimeUsage {
  input_token_details?: { audio_tokens?: number; text_tokens?: number; cached_tokens?: number }
  output_token_details?: { audio_tokens?: number; text_tokens?: number }
}

const n = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.min(v, 2_000_000) : 0)

/** Mimi's usage, from the totals OpenAI sends at the end of each reply. */
export function realtimeCost(u: RealtimeUsage): number {
  const inp = u.input_token_details ?? {}
  const out = u.output_token_details ?? {}
  const cached = n(inp.cached_tokens)
  const audioIn = Math.max(0, n(inp.audio_tokens) - cached)
  const p = PRICES.realtime
  return (audioIn * p.audioIn + cached * p.cachedIn + n(inp.text_tokens) * p.textIn + n(out.audio_tokens) * p.audioOut + n(out.text_tokens) * p.textOut) / MICRO
}

/** Charged when a Mimi session starts, so a session is never free even if the usage reports never arrive. */
export const REALTIME_START_USD = 0.03
