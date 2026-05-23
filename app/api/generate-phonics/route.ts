import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'No API key' }, { status: 500 })
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const { mode, vowels, consonants, theme } = await req.json() as {
    mode: 'sentence' | 'story'
    vowels: string[]
    consonants: string[]
    theme?: string
  }

  const sounds = [...vowels, ...consonants].join(', ')
  const themes = ['animals', 'food', 'adventure', 'the sea', 'the farm', 'space', 'a funny dog']
  const chosenTheme = theme ?? themes[Math.floor(Math.random() * themes.length)]

  const prompt = mode === 'story'
    ? `Write a short decodable story for a 4-year-old child learning to read.
Rules:
- The story must be 60-80 words long, 8-12 sentences
- Use ONLY simple 3-letter CVC words that use these letter sounds: ${sounds}
- You may also use these sight words freely: THE, A, AN, ON, IN, IS, ARE, HE, SHE, WE, I, IT, TO, AND, HAS, HAD, CAN, NOT, DID, WAS
- Theme: ${chosenTheme}
- Make it funny with a surprise ending
- Write EVERYTHING IN CAPITAL LETTERS
- Do NOT use any word that requires a letter sound not in the list above (except sight words)
- Include simple punctuation only (. ! ?)
Output only the story text, nothing else.`
    : `Write 3 fun short sentences for a 4-year-old child learning to read.
Rules:
- Each sentence must be 4-7 words long
- Use ONLY simple 3-letter CVC words that use these letter sounds: ${sounds}
- You may also use sight words: THE, A, AN, ON, IN, IS, HE, SHE, IT, AND, NOT, CAN, HAD, DID
- Theme: ${chosenTheme}
- Write EVERYTHING IN CAPITAL LETTERS
- After each sentence, add one relevant emoji on the same line
- Separate sentences with a blank line
Output only the 3 sentences with emojis, nothing else.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 300,
    })
    const content = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
