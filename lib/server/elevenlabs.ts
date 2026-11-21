// ElevenLabs text to speech: the guide's two voices, Frankie and Todd.
// Server only: the key (ELEVENLABS_API_KEY, set in Vercel) must never reach the browser.

/** The app's voice names, mapped to ElevenLabs voice ids. */
export const ELEVEN_VOICES: Record<string, string> = {
  frankie: '7li2FesTkwg1glJviKzT', // Frankie, Friendly Instructor (American woman)
  todd: 'g14YnDYCsy3k7XLlcKlO',    // Todd, Clear, Engaging and Educational (American man)
}

const MODEL = 'eleven_multilingual_v2'
const OUTPUT = 'mp3_44100_128'

/** How each kind of line should sound: Kit's lines warm and steady, the narrator a little livelier. */
export const ELEVEN_STYLE = {
  line: { stability: 0.55, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true, speed: 0.95 },
  narration: { stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed: 1.0 },
  // A single word, said plainly and clearly, the way a teacher holds up a word card.
  word: { stability: 0.75, similarity_boost: 0.8, style: 0, use_speaker_boost: true, speed: 0.9 },
  alien: { stability: 0.75, similarity_boost: 0.8, style: 0, use_speaker_boost: true, speed: 0.85 },
} as const
export type ElevenKind = keyof typeof ELEVEN_STYLE

export const elevenEnabled = (): boolean => Boolean(process.env.ELEVENLABS_API_KEY)

/** Speak `text` in one of the app's voices. Returns MP3 bytes, or null (the caller then falls back to another voice). */
export async function elevenSpeak(voice: string, text: string, kind: ElevenKind, speed?: number): Promise<Buffer | null> {
  const voiceId = ELEVEN_VOICES[voice]
  const key = process.env.ELEVENLABS_API_KEY
  if (!voiceId || !key) return null
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        language_code: 'en',
        // ElevenLabs accepts speeds from 0.7 to 1.2.
        voice_settings: { ...ELEVEN_STYLE[kind], ...(speed ? { speed: Math.min(1.2, Math.max(0.7, speed)) } : {}) },
      }),
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    })
    if (!res.ok) {
      // 401: missing or wrong key. 404 / voice_not_found: a wrong voice id. 429 or quota_exceeded: out of credits.
      const detail = (await res.text().catch(() => '')).slice(0, 200)
      console.error('elevenlabs failed', res.status, voice, detail)
      return null
    }
    return Buffer.from(await res.arrayBuffer())
  } catch (err) {
    console.error('elevenlabs failed', 'network', voice, String((err as Error)?.message ?? err).slice(0, 120))
    return null
  }
}
