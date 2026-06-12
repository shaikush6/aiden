'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { speakText } from '@/lib/speech';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

const EMOJIS = ['🪐', '🌙', '⭐', '🚀', '👽', '☄️'];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  pairs.sort(() => Math.random() - 0.5);
  return pairs.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

const STAR_DOTS = Array.from({ length: 25 }, (_, i) => ({
  left: `${(i * 41 + 7) % 96}%`,
  top: `${(i * 59 + 11) % 93}%`,
}));

export default function SpaceMemory({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [flipCount, setFlipCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winSize, setWinSize] = useState({ width: 0, height: 0 });
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => setWinSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    return () => { if (lockTimer.current) clearTimeout(lockTimer.current); };
  }, []);

  const startGame = useCallback(() => {
    if (lockTimer.current) clearTimeout(lockTimer.current);
    setCards(buildDeck());
    setFlippedIds([]);
    setMatchCount(0);
    setFlipCount(0);
    setLocked(false);
    setShowConfetti(false);
    setPhase('playing');
    speakText('Find all the matching pairs!');
  }, []);

  const handleCardTap = useCallback((id: number) => {
    if (locked) return;
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      return prev;
    });

    setFlippedIds((prev) => {
      const card = cards.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      if (prev.length === 2) return prev;
      if (prev.includes(id)) return prev;

      const next = [...prev, id];
      setCards((c) => c.map((card) => (card.id === id ? { ...card, flipped: true } : card)));
      setFlipCount((f) => f + 1);

      if (next.length === 2) {
        const [a, b] = next.map((fid) => cards.find((c) => c.id === fid)!);
        if (a && b && a.emoji === b.emoji) {
          setMatchCount((m) => {
            const newMatch = m + 1;
            if (newMatch === 6) {
              setTimeout(() => {
                setShowConfetti(true);
                setPhase('done');
                speakText('Amazing! You found them all!');
              }, 500);
            }
            return newMatch;
          });
          setCards((c) =>
            c.map((card) =>
              card.id === a.id || card.id === b.id ? { ...card, matched: true } : card
            )
          );
          return [];
        } else {
          setLocked(true);
          lockTimer.current = setTimeout(() => {
            setCards((c) =>
              c.map((card) =>
                card.id === a?.id || card.id === b?.id
                  ? { ...card, flipped: false }
                  : card
              )
            );
            setLocked(false);
          }, 1000);
          return [];
        }
      }
      return next;
    });
  }, [locked, cards]);

  const heroMsg =
    flipCount <= 14 ? 'MEMORY MASTER! 🧠' : flipCount <= 20 ? 'GREAT JOB! 🌟' : 'YOU DID IT! 🚀';

  return (
    <div className="bg-slate-950 rounded-2xl text-white overflow-hidden">
      {showConfetti && winSize.width > 0 && (
        <ReactConfetti width={winSize.width} height={winSize.height} recycle={false} numberOfPieces={300} />
      )}

      {phase === 'ready' && (
        <div className="flex flex-col items-center gap-6 p-8">
          <motion.div
            className="text-7xl"
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🚀
          </motion.div>
          <h1 className="text-4xl font-black text-white text-center">SPACE MEMORY</h1>
          <p className="text-indigo-300 text-center text-lg">
            Flip cards and find all 6 matching pairs!
          </p>
          <div className="grid grid-cols-3 gap-3">
            {EMOJIS.map((e) => (
              <div key={e} className="w-14 h-14 bg-indigo-900/60 border border-indigo-500/40 rounded-xl flex items-center justify-center text-3xl">
                {e}
              </div>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-2xl font-black py-5 px-10 rounded-2xl shadow-xl"
          >
            PLAY! 🧠
          </motion.button>
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">
            ← Back
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <div>
          {/* HUD */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <button onClick={onBack} className="text-indigo-300 text-sm font-bold">
              ← BACK
            </button>
            <div className="flex gap-4 text-sm font-black">
              <span className="text-indigo-300">PAIRS: <span className="text-yellow-300">{matchCount}/6</span></span>
              <span className="text-indigo-300">FLIPS: <span className="text-white">{flipCount}</span></span>
            </div>
          </div>

          {/* Star background + grid */}
          <div className="relative mx-3 mb-3 rounded-2xl bg-slate-900 overflow-hidden p-3">
            <div className="absolute inset-0 pointer-events-none">
              {STAR_DOTS.map((s, i) => (
                <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-40" style={s} />
              ))}
            </div>
            <div className="relative z-10 grid grid-cols-4 gap-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="aspect-square cursor-pointer"
                  style={{ perspective: 600 }}
                  onClick={() => handleCardTap(card.id)}
                >
                  <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Back face */}
                    <div
                      className="absolute inset-0 rounded-xl bg-indigo-900 border-2 border-indigo-700 flex items-center justify-center"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <span className="text-2xl opacity-60">🌌</span>
                    </div>
                    {/* Front face */}
                    <motion.div
                      className={`absolute inset-0 rounded-xl flex items-center justify-center border-2 ${
                        card.matched
                          ? 'bg-emerald-900/80 border-emerald-400'
                          : 'bg-slate-700 border-indigo-500'
                      }`}
                      style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
                      animate={card.matched ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={card.matched ? { duration: 0.3 } : {}}
                    >
                      <span className="text-3xl">{card.emoji}</span>
                    </motion.div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pb-3 text-indigo-400 text-sm font-bold">
            {matchCount === 6 ? 'ALL FOUND!' : `${6 - matchCount} pairs left`}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-col items-center gap-6 p-8">
          <div className="text-7xl">🧠</div>
          <p className="text-2xl font-black text-white text-center">
            You found them all in {flipCount} flips!
          </p>
          <p className="text-3xl font-black text-yellow-300 text-center">{heroMsg}</p>
          <div className="flex gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xl font-black py-4 px-8 rounded-2xl shadow-xl"
            >
              PLAY AGAIN
            </motion.button>
            <button
              onClick={onBack}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xl font-black py-4 px-8 rounded-2xl"
            >
              BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
