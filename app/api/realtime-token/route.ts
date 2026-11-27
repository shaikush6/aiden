import { NextRequest, NextResponse } from 'next/server'
import { isSameOrigin, jsonError, rateLimited } from '@/lib/server/api-guard'
import { aiGate } from '@/lib/server/ai-gate'
import { ELEVEN_VOICES, MIMI_DEFAULT_VOICE, mimiConversationToken } from '@/lib/server/elevenlabs'
import { MIMI_START_USD, charge } from '@/lib/server/quota'

/**
 * Opens a voice chat with Mimi (an ElevenLabs agent). The browser gets a one-time token and the
 * ElevenLabs voice id it asked for (Todd or Frankie); the API key itself never leaves the server.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError('Forbidden', 403)
  // Each token opens a paid voice session, so keep this tight.
  if (rateLimited(req, 'realtime-token', 6, 10 * 60_000)) return jsonError('Too many requests', 429)
  if (!process.env.ELEVENLABS_API_KEY) return jsonError('Voice chat is not configured', 503)
  // A voice chat costs a few cents a minute, so it needs a little credit left to start.
  const gate = await aiGate(req, 0.25)
  if ('error' in gate) return gate.error

  let body: { voice?: unknown } = {}
  try { body = (await req.json()) as { voice?: unknown } } catch { /* no body: default voice */ }
  const voice = typeof body.voice === 'string' && ELEVEN_VOICES[body.voice] ? body.voice : MIMI_DEFAULT_VOICE

  const result = await mimiConversationToken()
  if ('error' in result) {
    return jsonError(result.error === 'not-allowed' ? 'Mimi is not switched on for this voice key' : 'Could not start voice chat', 502)
  }
  if (gate.user) await charge(gate.user, MIMI_START_USD).catch(() => {})
  return NextResponse.json({ token: result.token, voiceId: ELEVEN_VOICES[voice] }, { headers: { 'Cache-Control': 'no-store' } })
}
