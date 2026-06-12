'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { speakText } from '@/lib/speech';
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

const ALL_EMOJIS = [
  '🪐', '🌙', '⭐', '🚀', '👽', '☄️',
  '🌟', '🌍', '🌞', '🛸', '💫', '🔭',
  '🪨', '🌌', '🛰️', '🌛', '💥', '🌠',
];

type GridSize = 12 | 24 | 36;

const SIZE_CONFIG: Record<GridSize, { cols: number; emojiCls: string; pairs: number; difficulty: string }> = {
  12: { cols: 4, emojiCls: 'text-2xl', pairs: 6,  difficulty: 'EASY' },
  24: { cols: 6, emojiCls: 'text-xl',  pairs: 12, difficulty: 'MEDIUM' },
  36: { cols: 6, emojiCls: 'text-base', pairs: 18, difficulty: 'HARD' },
};

interface Card { id: number; emoji: string; flipped: boolean; matched: boolean; }

function buildDeck(size: GridSize): Card[] {
  const emojis = ALL_EMOJIS.slice(0, SIZE_CONFIG[size].pairs);
  const pairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  return pairs.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

const STAR_DOTS = Array.from({ length: 25 }, (_, i) => ({
  left: `${(i * 41 + 7) % 96}%`,
  top: `${(i * 59 + 11) % 93}%`,
}));

export default function SpaceMemory({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [gridSize, setGridSize] = useState<GridSize>(12);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [flipCount, setFlipCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winSize, setWinSize] = useState({ width: 0, height: 0 });
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gridSizeRef = useRef<GridSize>(gridSize);

  useEffect(() => { gridSizeRef.current = gridSize; }, [gridSize]);

  useEffect(() => {
    const update = () => setWinSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => () => { if (lockTimer.current) clearTimeout(lockTimer.current); }, []);

  const startGame = useCallback(() => {
    const size = gridSizeRef.current;
    if (lockTimer.current) clearTimeout(lockTimer.current);
    setCards(buildDeck(size));
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
    const totalPairs = SIZE_CONFIG[gridSizeRef.current].pairs;

    setFlippedIds((prev) => {
      const card = cards.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      if (prev.length === 2 || prev.includes(id)) return prev;

      const next = [...prev, id];
      setCards((c) => c.map((cd) => (cd.id === id ? { ...cd, flipped: true } : cd)));
      setFlipCount((f) => f + 1);

      if (next.length === 2) {
        const [a, b] = next.map((fid) => cards.find((c) => c.id === fid)!);
        if (a && b && a.emoji === b.emoji) {
          setMatchCount((m) => {
            const newMatch = m + 1;
            if (newMatch === totalPairs) {
              setTimeout(() => {
                setShowConfetti(true);
                setPhase('done');
                speakText('Amazing! You found them all!');
              }, 500);
            }
            return newMatch;
          });
          setCards((c) => c.map((cd) => cd.id === a.id || cd.id === b.id ? { ...cd, matched: true } : cd));
          return [];
        } else {
          setLocked(true);
          lockTimer.current = setTimeout(() => {
            setCards((c) => c.map((cd) => cd.id === a?.id || cd.id === b?.id ? { ...cd, flipped: false } : cd));
            setLocked(false);
          }, 1000);
          return [];
        }
      }
      return next;
    });
  }, [locked, cards]);

  const cfg = SIZE_CONFIG[gridSize];
  const totalPairs = cfg.pairs;
  const heroMsg = flipCount <= totalPairs * 2.5 ? 'MEMORY MASTER! 🧠' : flipCount <= totalPairs * 4 ? 'GREAT JOB! 🌟' : 'YOU DID IT! 🚀';

  return (
    <div className="bg-slate-950 rounded-2xl text-white overflow-hidden">
      {showConfetti && winSize.width > 0 && (
        <ReactConfetti width={winSize.width} height={winSize.height} recycle={false} numberOfPieces={300} />
      )}

      {/* READY */}
      {phase === 'ready' && (
        <div className="flex flex-col items-center gap-4 p-6">
          <motion.div
            className="text-5xl"
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >🚀</motion.div>
          <h1 className="text-3xl font-black text-white text-center">SPACE MEMORY</h1>
          <p className="text-indigo-300 text-sm text-center">Choose your challenge:</p>

          <div className="grid grid-cols-3 gap-2 w-full">
            {([12, 24, 36] as GridSize[]).map((size) => (
              <motion.button
                key={size}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGridSize(size)}
                className={`flex flex-col items-center gap-1 py-4 rounded-xl font-black border-2 transition-colors ${
                  gridSize === size
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-indigo-950/60 border-indigo-700/40 text-indigo-300'
                }`}
              >
                <span className="text-2xl">{size}</span>
                <span className="text-xs opacity-80">{SIZE_CONFIG[size].difficulty}</span>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="bg-indigo-600 text-white text-xl font-black py-4 px-10 rounded-2xl shadow-xl w-full"
          >
            PLAY! 🧠
          </motion.button>
          <button onClick={onBack} className="text-slate-400 text-sm">← Back</button>
        </div>
      )}

      {/* PLAYING */}
      {phase === 'playing' && (
        <div>
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <button onClick={onBack} className="text-indigo-300 text-sm font-bold">← BACK</button>
            <div className="flex gap-3 text-xs font-black">
              <span className="text-indigo-300">PAIRS: <span className="text-yellow-300">{matchCount}/{totalPairs}</span></span>
              <span className="text-indigo-300">FLIPS: <span className="text-white">{flipCount}</span></span>
            </div>
          </div>

          <div className="flex justify-center px-2 mb-2">
            <div className="relative w-full max-w-xs rounded-2xl bg-slate-900 overflow-hidden p-2">
              <div className="absolute inset-0 pointer-events-none">
                {STAR_DOTS.map((s, i) => (
                  <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-30" style={s} />
                ))}
              </div>
              <div
                className="relative z-10 grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))` }}
              >
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="aspect-square cursor-pointer"
                    style={{ perspective: 500 }}
                    onClick={() => handleCardTap(card.id)}
                  >
                    <motion.div
                      className="relative w-full h-full"
                      animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Back face — CSS only, no emoji */}
                      <div
                        className="absolute inset-0 rounded-lg bg-indigo-900 border border-indigo-600/50 flex items-center justify-center"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="w-3 h-3 rounded-full bg-indigo-500/40" />
                      </div>
                      {/* Front face */}
                      <motion.div
                        className={`absolute inset-0 rounded-lg flex items-center justify-center border ${
                          card.matched ? 'bg-emerald-900/80 border-emerald-400' : 'bg-slate-700 border-indigo-500'
                        }`}
                        style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
                        animate={card.matched ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                        transition={card.matched ? { duration: 0.25 } : {}}
                      >
                        <span className={cfg.emojiCls}>{card.emoji}</span>
                      </motion.div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center pb-2 text-indigo-400 text-xs font-bold">
            {matchCount === totalPairs ? 'ALL FOUND!' : `${totalPairs - matchCount} pairs left`}
          </div>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && (
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="text-6xl">🧠</div>
          <p className="text-xl font-black text-white text-center">
            You found all {totalPairs} pairs in {flipCount} flips!
          </p>
          <p className="text-2xl font-black text-yellow-300 text-center">{heroMsg}</p>
          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={startGame}
              className="bg-indigo-600 text-white text-lg font-black py-3 px-6 rounded-2xl shadow-xl">
              PLAY AGAIN
            </motion.button>
            <button onClick={onBack}
              className="bg-slate-700 text-white text-lg font-black py-3 px-6 rounded-2xl">
              BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
