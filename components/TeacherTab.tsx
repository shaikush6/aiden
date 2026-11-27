'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Conversation } from '@elevenlabs/client'

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error'
type Line = { role: 'user' | 'mimi'; text: string }
type MimiSession = Awaited<ReturnType<typeof Conversation.startSession>>

/** Mimi's two voices. Todd is the default; the choice is remembered on this device. */
const VOICES = [
  { id: 'todd', label: 'Todd', emoji: '👨' },
  { id: 'frankie', label: 'Frankie', emoji: '👩' },
] as const
type VoiceId = (typeof VOICES)[number]['id']
const VOICE_KEY = 'aiden:mimi-voice'
const CREDIT_GONE = 'The AI credit for this account is used up, so Mimi is resting.'

function savedVoice(): VoiceId {
  if (typeof window === 'undefined') return 'todd'
  try {
    const v = localStorage.getItem(VOICE_KEY)
    return v === 'frankie' ? 'frankie' : 'todd'
  } catch { return 'todd' }
}

export default function TeacherTab() {
  const [connState, setConnState] = useState<ConnectionState>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<Line[]>([])
  // The tab only renders after sign-in (in the browser), so reading the saved voice here is safe.
  const [voice, setVoice] = useState<VoiceId>(savedVoice)

  const sessionRef = useRef<MimiSession | null>(null)
  const minuteTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const alive = useRef(true)

  const stopTimer = () => {
    if (minuteTimer.current) clearInterval(minuteTimer.current)
    minuteTimer.current = null
  }

  const disconnect = useCallback(() => {
    stopTimer()
    const session = sessionRef.current
    sessionRef.current = null
    void session?.endSession().catch(() => {})
    if (!alive.current) return
    setConnState(s => (s === 'error' ? s : 'idle'))
    setIsSpeaking(false)
  }, [])

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; disconnect() }
  }, [disconnect])

  const pickVoice = (id: VoiceId) => {
    setVoice(id)
    try { localStorage.setItem(VOICE_KEY, id) } catch { /* private window: just not remembered */ }
  }

  /** Ask Mimi about a topic as if Aiden said it. */
  const ask = useCallback((topic: string) => {
    const session = sessionRef.current
    if (!session) return
    const text = `Tell me about ${topic.toLowerCase()}, in a fun way for a five year old.`
    session.sendUserMessage(text)
    setTranscript(t => [...t.slice(-6), { role: 'user', text }])
  }, [])

  /** One ping a minute while Mimi is on, so her time counts against the account's AI credit. */
  const countMinutes = useCallback(() => {
    stopTimer()
    minuteTimer.current = setInterval(() => {
      void fetch('/api/usage', { method: 'POST' })
        .then(r => (r.ok ? r.json() : null))
        .then((j: { stop?: boolean } | null) => {
          if (j?.stop && alive.current) { setErrorMsg(CREDIT_GONE); disconnect() }
        })
        .catch(() => {})
    }, 60_000)
  }, [disconnect])

  const connect = useCallback(async () => {
    try {
      setConnState('connecting')
      setErrorMsg(null)

      // 1. A one-time token from our server (the API key stays there), plus the chosen voice.
      const tokenRes = await fetch('/api/realtime-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice }),
      })
      if (tokenRes.status === 402) throw new Error(CREDIT_GONE)
      if (tokenRes.status === 401) throw new Error('Please sign in again.')
      const data = await tokenRes.json().catch(() => ({})) as { token?: string; voiceId?: string; error?: string }
      if (!tokenRes.ok || !data.token) throw new Error(data.error ?? 'Could not start voice chat')

      // 2. Open the voice chat. The SDK asks for the microphone and plays Mimi's voice.
      const session = await Conversation.startSession({
        conversationToken: data.token,
        connectionType: 'webrtc',
        overrides: data.voiceId ? { tts: { voiceId: data.voiceId } } : undefined,
        onModeChange: ({ mode }) => { if (alive.current) setIsSpeaking(mode === 'speaking') },
        onMessage: ({ message, role }) => {
          if (!alive.current || !message) return
          setTranscript(t => [...t.slice(-6), { role: role === 'agent' ? 'mimi' : 'user', text: message }])
        },
        onDisconnect: details => {
          stopTimer()
          sessionRef.current = null
          if (!alive.current) return
          setIsSpeaking(false)
          if (details.reason === 'error') { setErrorMsg('Connection error — try again'); setConnState('error') }
          else setConnState(s => (s === 'error' ? s : 'idle'))
        },
        onError: message => console.error('mimi error', message),
      })

      // The tab was closed while connecting: hang up straight away.
      if (!alive.current) { void session.endSession().catch(() => {}); return }
      sessionRef.current = session
      countMinutes()
      setConnState('connected')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      if (!alive.current) return
      setErrorMsg(/permission|notallowed|denied/i.test(msg) ? 'Mimi needs the microphone. Allow it and try again.' : msg)
      setConnState('error')
      disconnect()
    }
  }, [voice, countMinutes, disconnect])

  const isListening = connState === 'connected' && !isSpeaking

  return (
    <div className="flex flex-col items-center gap-6 p-4 pb-10 min-h-[70vh]">

      {/* Teacher avatar */}
      <motion.div
        animate={isSpeaking ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.6 } } : { scale: 1 }}
        className="relative"
      >
        <div className={`w-36 h-36 rounded-full flex items-center justify-center text-7xl shadow-2xl border-4 transition-colors
          ${connState === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600'}`}>
          🎓
        </div>
        {/* Speaking pulse rings */}
        {isSpeaking && (
          <>
            {[1, 2, 3].map(i => (
              <motion.div key={i} className="absolute inset-0 rounded-full border-4 border-emerald-400"
                animate={{ scale: 1 + i * 0.25, opacity: [0.6, 0] }}
                transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }} />
            ))}
          </>
        )}
        {/* Listening indicator */}
        {isListening && (
          <motion.div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg"
            animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            🎤
          </motion.div>
        )}
      </motion.div>

      {/* Name + status */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-emerald-700">MIMI</h2>
        <p className="text-emerald-500 font-bold text-sm mt-1">
          {connState === 'idle' ? 'Your AI Teacher' :
           connState === 'connecting' ? 'Connecting...' :
           connState === 'connected' ? (isSpeaking ? 'Speaking...' : 'Listening...') :
           'Try again!'}
        </p>
      </div>

      {/* Voice switch: picked before the chat starts */}
      {connState !== 'connected' && (
        <div className="flex gap-2" role="radiogroup" aria-label="Mimi's voice">
          {VOICES.map(v => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={voice === v.id}
              disabled={connState === 'connecting'}
              onClick={() => pickVoice(v.id)}
              className={`rounded-2xl px-4 py-2 font-black text-base shadow border-b-4 transition-colors
                ${voice === v.id
                  ? 'bg-emerald-500 text-white border-emerald-700'
                  : 'bg-white dark:bg-slate-700/60 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'}`}
            >
              {v.emoji} {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl px-5 py-3 text-sm font-bold text-center max-w-xs">
          ⚠️ {errorMsg}
        </motion.div>
      )}

      {/* Connect / Disconnect button */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.05 }}
        onClick={connState === 'connected' ? disconnect : connect}
        disabled={connState === 'connecting'}
        className={`px-10 py-5 rounded-3xl font-black text-2xl shadow-xl transition-all select-none
          ${connState === 'connected'
            ? 'bg-red-400 text-white'
            : connState === 'connecting'
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
      >
        {connState === 'connecting' ? '⏳ CONNECTING...' :
         connState === 'connected' ? '🔴 STOP TALKING' :
         '🎤 TALK TO MIMI!'}
      </motion.button>

      {/* Instruction for parent */}
      {connState === 'idle' && (
        <p className="text-gray-400 dark:text-slate-500 text-xs text-center max-w-xs">
          Tap the button and start talking! Mimi will listen and talk back. Your browser may ask for microphone permission.
        </p>
      )}

      {/* Conversation transcript */}
      <AnimatePresence>
        {transcript.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="w-full max-w-sm flex flex-col gap-2 mt-2">
            {transcript.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl px-4 py-3 text-sm font-bold shadow
                  ${msg.role === 'user'
                    ? 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 self-end ml-8'
                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 self-start mr-8'}`}>
                {msg.role === 'mimi' && <span className="text-lg mr-1">🎓</span>}
                {msg.text}
                {msg.role === 'user' && <span className="text-lg ml-1">👦</span>}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topic suggestions when connected */}
      {connState === 'connected' && (
        <div className="w-full max-w-md">
          <p className="text-emerald-600 font-black text-base text-center mb-2">TAP A TOPIC TO ASK MIMI:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['THE LETTER S', 'THE SUN', 'HOW TO COUNT', 'THE WORD CAT', 'PLANETS'].map(topic => (
              <motion.button
                key={topic}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => ask(topic)}
                className="bg-white dark:bg-slate-700/60 rounded-2xl px-4 py-2 text-sm font-black text-emerald-600 dark:text-emerald-300 shadow border-b-4 border-emerald-200 dark:border-emerald-900"
              >
                {topic}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
