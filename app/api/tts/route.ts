import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 })
  }

  const { text, speed = 1.0 } = await req.json()

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'shimmer',
      input: text,
      speed,
      instructions:
        'Speak in a warm, friendly, encouraging tone suitable for a 4-year-old child. Speak clearly and not too fast.',
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
