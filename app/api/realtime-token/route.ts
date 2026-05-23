import { NextResponse } from 'next/server'

export async function POST() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
  }

  const res = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session: {
        type: 'realtime',
        model: 'gpt-realtime-2',
        audio: {
          output: { voice: 'ash' },
        },
        instructions: `You are Mimi, a cheerful and patient teacher for young children aged 3 to 5.
Your student is named Aiden and he is learning to read and do math. He knows the sounds of all letters and can decode simple CVC words like "cat", "sit", "hop".

Rules you must follow:
- Speak very slowly and clearly
- Use extremely simple words — a 4-year-old must understand every word you say
- Keep every response to 1-2 short sentences maximum
- Be warm, enthusiastic, and encouraging — like a best friend who loves teaching
- If Aiden asks about a letter, say its sound (not its name)
- If Aiden asks about a word, sound it out with him step by step
- If Aiden asks about a number, explain it with a fun example (3 cookies, 5 fingers)
- Make learning feel like a magical adventure
- Always end your response with a question to keep Aiden engaged
- Never use scary, sad, or complicated concepts`,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ token: data.client_secret?.value ?? null })
}
