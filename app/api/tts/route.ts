import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { findQuestLine, type LineKind } from '@/lib/reading-quest/allowlist'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'

const MODEL = 'gpt-4o-mini-tts-2025-12-15'
const MAX_TEXT = 400

const CHILD_VOICE =
  'You are reading aloud for a 5-year-old child who is learning to read and count. Use a warm, gentle, enthusiastic tone — like a kind American teacher who loves children. Pronounce every word clearly and naturally, including individual letters and numbers. Never sound robotic or flat. Be encouraging and fun.'

const PHONICS_VOICE =
  'You are a synthetic phonics teacher producing an isolated phoneme sound for a young child. Rules: (1) Produce ONLY the single phoneme sound — no extra words, no context, nothing before or after. (2) Stop consonants (b d g k p t): make the briefest possible plosive release with ZERO vowel following — not "buh" but a pure silent lip-pop for b; not "tuh" but a crisp tongue-tap for t. (3) Fricatives (f v s z sh th): sustain only the friction — "fff" not "fuh", "sss" not "suh". (4) Nasals (m n ng): sustain the nasal hum — "mmm" not "muh". (5) Approximants (l r w y): the pure glide only. (6) Short vowels: a = the sound in cat (never "ay"), e = the sound in bed (never "ee"), i = the sound in sit (never "eye"), o = the sound in hot (never "oh"), u = the sound in cup (never "you"). Be extremely precise and brief. You are demonstrating the phoneme, not reading.'

/** Narrator mode: a bursting-with-energy kids' TV adventure host. */
const NARRATOR_VOICE =
  "You are the super excited host of a kids' TV animal-adventure show, talking to a 5-year-old explorer who adores animals. Your energy is HIGH: big smile in your voice, bouncy rhythm, playful and a little silly, genuinely thrilled about everything. Swing your pitch up and down a lot, punch the exclamation marks, speed up with excitement and slow down only for a quick dramatic whisper before a reveal. Never flat, never monotone, never deep or serious, never sleepy. Stay kind and never scary. Say every word clearly, because the child is learning to read. If you see a single capital letter or capitals separated by spaces, say the letter names."

const QUEST_VOICE: Record<LineKind, { instructions: string; speed: number }> = {
  line: { instructions: CHILD_VOICE, speed: 1.0 },
  // The voice itself comes from the allowlisted line (a grown-up picks it in the parent panel).
  narration: { instructions: NARRATOR_VOICE, speed: 1.08 },
  word: {
    instructions: 'Say only this single word, once, clearly and naturally, in a warm American accent, the way a kind teacher says a word to a 5-year-old learning to read. Nothing before or after it.',
    speed: 0.9,
  },
  alien: {
    instructions: 'This is a made-up nonsense word used in phonics lessons. Say it once, exactly as it is spelled using simple American phonics rules, as if it were a real word. Nothing before or after it.',
    speed: 0.85,
  },
  sound: {
    instructions: 'Say only this short speech sound, once, clearly, in an American accent. Nothing before or after it.',
    speed: 0.85,
  },
}

async function synthesize(input: string, instructions: string, speed: number, voice = 'nova'): Promise<Buffer | null> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const response = await openai.audio.speech.create({ model: MODEL, voice, input, speed, instructions })
    return Buffer.from(await response.arrayBuffer())
  } catch {
    return null
  }
}

/** Quest audio: only pre-approved lines, cached for a year by the CDN and the browser. */
export async function GET(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (rateLimited(req, 'tts-get', 300, 60_000)) return jsonError('Too many requests', 429)
  if (!process.env.OPENAI_API_KEY) return jsonError('Speech is not configured', 503)

  const id = req.nextUrl.searchParams.get('id') ?? ''
  const line = /^[a-z0-9]{1,16}$/.test(id) ? findQuestLine(id) : undefined
  if (!line) return jsonError('Unknown line', 404)

  const voice = QUEST_VOICE[line.kind]
  const audio = await synthesize(line.text, voice.instructions, voice.speed, line.voice)
  if (!audio) return jsonError('Speech failed', 502)
  return new NextResponse(new Uint8Array(audio), {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    },
  })
}

/** Free-form speech for the rest of the app. Length-capped, same-site only, and rate limited. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (rateLimited(req, 'tts-post', 60, 60_000)) return jsonError('Too many requests', 429)
  if (!process.env.OPENAI_API_KEY) return jsonError('Speech is not configured', 503)

  let body: unknown
  try { body = await req.json() } catch { return jsonError('Bad request', 400) }
  const { text, speed, phonics } = (body ?? {}) as Record<string, unknown>

  if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT) return jsonError('Bad text', 400)
  const safeSpeed = typeof speed === 'number' && Number.isFinite(speed) ? Math.min(1.5, Math.max(0.5, speed)) : 1.0
  const instructions = phonics === true ? PHONICS_VOICE : CHILD_VOICE

  const audio = await synthesize(text, instructions, safeSpeed)
  if (!audio) return jsonError('Speech failed', 502)
  return new NextResponse(new Uint8Array(audio), {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=86400' },
  })
}
