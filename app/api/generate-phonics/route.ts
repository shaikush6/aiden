import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'
import { aiGate } from '@/lib/server/ai-gate'
import { charge, chatCost } from '@/lib/server/quota'

const THEMES = ['animals', 'food', 'adventure', 'the sea', 'the farm', 'space', 'a funny dog']
const SOUND = /^[A-Z]{1,3}$/

/** Keep only short uppercase letter-sound codes like "A" or "SH", so nothing else reaches the prompt. */
function cleanSounds(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 30) return null
  const out = value.filter((v): v is string => typeof v === 'string' && SOUND.test(v))
  return out.length === value.length ? out : null
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  if (rateLimited(req, 'generate-phonics', 10, 60_000)) return jsonError('Too many requests', 429)
  if (!process.env.OPENAI_API_KEY) return jsonError('Generation is not configured', 503)
  const gate = await aiGate(req)
  if ('error' in gate) return gate.error

  let body: Record<string, unknown>
  try { body = (await req.json()) ?? {} } catch { return jsonError('Bad request', 400) }

  const mode = body.mode === 'story' ? 'story' : 'sentence'
  const vowels = cleanSounds(body.vowels)
  const consonants = cleanSounds(body.consonants)
  if (!vowels || !consonants || vowels.length + consonants.length === 0) return jsonError('Bad sounds', 400)

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const sounds = [...vowels, ...consonants].join(', ')
  const chosenTheme = typeof body.theme === 'string' && THEMES.includes(body.theme)
    ? body.theme
    : THEMES[Math.floor(Math.random() * THEMES.length)]

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
    const used = completion.usage
    if (gate.user && used) await charge(gate.user, chatCost(used.prompt_tokens, used.completion_tokens)).catch(() => {})
    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
