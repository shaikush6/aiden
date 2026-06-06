import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 })
  }

  const { text, speed = 1.0, phonics = false } = await req.json()

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const instructions = phonics
    ? 'You are a synthetic phonics teacher producing an isolated phoneme sound for a young child. Rules: (1) Produce ONLY the single phoneme sound — no extra words, no context, nothing before or after. (2) Stop consonants (b d g k p t): make the briefest possible plosive release with ZERO vowel following — not "buh" but a pure silent lip-pop for b; not "tuh" but a crisp tongue-tap for t. (3) Fricatives (f v s z sh th): sustain only the friction — "fff" not "fuh", "sss" not "suh". (4) Nasals (m n ng): sustain the nasal hum — "mmm" not "muh". (5) Approximants (l r w y): the pure glide only. (6) Short vowels: a = the sound in cat (never "ay"), e = the sound in bed (never "ee"), i = the sound in sit (never "eye"), o = the sound in hot (never "oh"), u = the sound in cup (never "you"). Be extremely precise and brief. You are demonstrating the phoneme, not reading.'
    : 'You are reading aloud for a 4-year-old child who is learning to read and count. Use a warm, gentle, enthusiastic tone — like a kind teacher who loves children. Pronounce every word clearly and naturally, including individual letters and numbers. Never sound robotic or flat. Be encouraging and fun.'

  try {
    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts-2025-12-15',
      voice: 'nova',
      input: text,
      speed,
      instructions,
    })
    const buffer = Buffer.from(await response.arrayBuffer())
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    // fallback silently — client will use Web Speech API
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
