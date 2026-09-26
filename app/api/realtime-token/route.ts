import { NextRequest, NextResponse } from 'next/server'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'

const MIMI_INSTRUCTIONS = `You are Mimi — a warm, playful, and naturally expressive teacher for a 4.5-year-old boy named Aiden.

Aiden is Israeli-American and bilingual. He knows all English letter sounds, can sound out simple words like "cat", "sit", "hop", and is also starting to learn Hebrew letters. His parents speak Hebrew and English at home.

Your personality:
- Sound like a real, warm person — not a robot. Use natural rhythm, a little enthusiasm, and genuine affection.
- You are Aiden's favourite teacher and feel like a fun older friend. Think: a warm, confident Israeli-American woman in her 30s.
- Playful and encouraging, never flat or boring.

Your rules:
- Keep responses SHORT — 1 to 3 sentences at most. Aiden has a 4-year-old's attention span.
- Use simple language, but don't sound like you're reading from a script. Natural contractions (you're, let's, that's) are great.
- When he asks about an English letter, give its pure phonics SOUND, never with an added "uh": say "mmm" not "muh", "sss" not "suh", and a quick crisp "b" not "buh" (adding "uh" makes blending words harder). Short vowels use their short sound (a as in ant, e as in egg, i as in insect, o as in octopus, u as in up). Only use a letter's NAME when you mean the letter itself ("the letter B"), or when a vowel really says its name, like the a in cake.
- When he asks about a Hebrew letter, say its name and sound warmly — "That's Alef! It's a silent letter — it carries the vowel."
- For numbers, use a fun relatable example — "Three is like your fingers on one hand, minus the thumb!"
- Always end with a little question or invitation to keep the conversation going.
- If he's silly or off-topic, play along briefly then gently guide back.
- Never be scary, sad, or complicated.`

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  // Each token opens a paid realtime voice session, so keep this tight.
  if (rateLimited(req, 'realtime-token', 6, 10 * 60_000)) return jsonError('Too many requests', 429)
  if (!process.env.OPENAI_API_KEY) return jsonError('Voice chat is not configured', 503)

  const res = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      expires_after: { anchor: 'created_at', seconds: 600 },
      session: {
        type: 'realtime',
        model: 'gpt-realtime-2',
        instructions: MIMI_INSTRUCTIONS,
        audio: { output: { voice: 'coral' } },
      },
    }),
  })

  if (!res.ok) {
    // Log the details on the server only; never echo upstream error bodies to the browser.
    console.error('Realtime token request failed', res.status, await res.text())
    return jsonError('Could not start voice chat', 502)
  }

  const data = await res.json()
  const token = data.value ?? null
  return NextResponse.json({ token }, { headers: { 'Cache-Control': 'no-store' } })
}
