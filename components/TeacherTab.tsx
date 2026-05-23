'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error'

export default function TeacherTab() {
  const [connState, setConnState] = useState<ConnectionState>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)        // AI is speaking
  const [isListening, setIsListening] = useState(false)      // mic is active
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<{ role: 'user' | 'mimi'; text: string }[]>([])

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const disconnect = useCallback(() => {
    dcRef.current?.close()
    pcRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (audioRef.current) { audioRef.current.srcObject = null }
    pcRef.current = null
    dcRef.current = null
    streamRef.current = null
    setConnState('idle')
    setIsSpeaking(false)
    setIsListening(false)
  }, [])

  useEffect(() => () => disconnect(), [disconnect])

  const connect = useCallback(async () => {
    try {
      setConnState('connecting')
      setErrorMsg(null)

      // 1. Get ephemeral token from our server
      const tokenRes = await fetch('/api/realtime-token', { method: 'POST' })
      if (!tokenRes.ok) throw new Error('Could not get session token')
      const { token, error: tokenErr } = await tokenRes.json() as { token: string | null; error?: string }
      if (tokenErr || !token) throw new Error(tokenErr ?? 'No token returned')

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      // 3. Play incoming audio
      const audio = new Audio()
      audio.autoplay = true
      audioRef.current = audio
      pc.ontrack = (e) => {
        audio.srcObject = e.streams[0]
        audio.play().catch(() => {})
      }

      // 4. Add microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      stream.getTracks().forEach(track => pc.addTrack(track, stream))
      setIsListening(true)

      // 5. Data channel for events
      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc
      dc.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data as string) as {
            type: string
            item?: {
              role?: string
              content?: { transcript?: string }[]
            }
          }
          // Track speaking state
          if (event.type === 'response.audio.delta') setIsSpeaking(true)
          if (event.type === 'response.audio.done') setIsSpeaking(false)
          // Capture transcripts
          if (event.type === 'conversation.item.created' && event.item?.role === 'user') {
            const text = event.item?.content?.[0]?.transcript ?? ''
            if (text) setTranscript(t => [...t.slice(-6), { role: 'user', text }])
          }
          if (event.type === 'response.output_item.done' && event.item?.role === 'assistant') {
            const text = event.item?.content?.[0]?.transcript ?? ''
            if (text) setTranscript(t => [...t.slice(-6), { role: 'mimi', text }])
          }
        } catch { /* ignore parse errors */ }
      }
      dc.onerror = () => setErrorMsg('Connection error — try again')

      // 6. SDP offer/answer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sdpRes = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/sdp',
        },
      })
      if (!sdpRes.ok) throw new Error('WebRTC handshake failed')
      const answerSdp = await sdpRes.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setConnState('connected')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Connection failed')
      setConnState('error')
      disconnect()
    }
  }, [disconnect])

  return (
    <div className="flex flex-col items-center gap-6 p-4 pb-10 min-h-[70vh]">

      {/* Teacher avatar */}
      <motion.div
        animate={isSpeaking ? { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.6 } } : { scale: 1 }}
        className="relative"
      >
        <div className={`w-36 h-36 rounded-full flex items-center justify-center text-7xl shadow-2xl border-4 transition-colors
          ${connState === 'connected' ? 'bg-emerald-100 border-emerald-400' : 'bg-white border-gray-200'}`}>
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
        {isListening && !isSpeaking && connState === 'connected' && (
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

      {/* Error message */}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 text-red-600 rounded-2xl px-5 py-3 text-sm font-bold text-center max-w-xs">
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
        <p className="text-gray-400 text-xs text-center max-w-xs">
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
                    ? 'bg-white text-gray-700 self-end ml-8'
                    : 'bg-emerald-100 text-emerald-800 self-start mr-8'}`}>
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
        <div className="w-full max-w-sm">
          <p className="text-emerald-600 font-black text-sm text-center mb-2">ASK MIMI ABOUT:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['THE LETTER S', 'THE SUN', 'HOW TO COUNT', 'THE WORD CAT', 'PLANETS'].map(topic => (
              <div key={topic} className="bg-white rounded-xl px-3 py-1 text-xs font-black text-emerald-600 shadow">
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
