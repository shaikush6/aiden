'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { stopAudio } from '@/lib/audio-player';
import type { LevelInfo } from '@/lib/reading-quest/catalog';
import { say } from '@/lib/reading-quest/audio';
import type { LevelScript } from './ReadingQuest';
import { gpcsInStep, isScored, wordsInStep, type Step } from '@/lib/reading-quest/plan';
import { recordLevel, type SoundStat } from '@/lib/reading-quest/progress';
import { BigButton, Emoji, useSayOnMount, type StepResult } from './ui';
import MeetSound from './steps/MeetSound';
import HearPick from './steps/HearPick';
import BlendWord from './steps/BlendWord';
import ReadPick from './steps/ReadPick';
import BuildWord from './steps/BuildWord';
import GoalKick from './steps/GoalKick';
import RealOrAlien from './steps/RealOrAlien';
import HeartWord from './steps/HeartWord';
import SentenceCheck from './steps/SentenceCheck';
import StoryReader from './steps/StoryReader';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

interface Props {
  level: LevelInfo;
  steps: Step[];
  script: LevelScript;
  onExit: () => void;
  onReplay: () => void;
  onNext: (() => void) | null;
}

interface Tally { scored: number; firstTry: number; words: number; sounds: Record<string, SoundStat> }

function starsFor(t: Tally): number {
  if (!t.scored) return 3;
  const ratio = t.firstTry / t.scored;
  return ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1;
}

export default function LevelPlayer({ level, steps, script, onExit, onReplay, onNext }: Props) {
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ stars: number; words: number } | null>(null);
  const tally = useRef<Tally>({ scored: 0, firstTry: 0, words: 0, sounds: {} });

  const finishStep = (r: StepResult) => {
    const step = steps[index];
    const t = tally.current;
    if (isScored(step)) {
      t.scored++;
      if (r.firstTry) t.firstTry++;
      for (const g of gpcsInStep(step)) {
        const s = t.sounds[g] ?? { right: 0, wrong: 0 };
        if (r.firstTry) s.right++; else s.wrong++;
        t.sounds[g] = s;
      }
    }
    t.words += wordsInStep(step);

    if (index + 1 < steps.length) {
      setIndex(index + 1);
      return;
    }
    const stars = starsFor(t);
    recordLevel({ levelId: level.def.id, stars, wordsRead: t.words, sounds: t.sounds });
    setResult({ stars, words: t.words });
    setPhase('done');
  };

  const exit = () => { stopAudio(); onExit(); };

  return (
    <div className={`min-h-[70vh] rounded-[2rem] bg-gradient-to-br ${level.world.theme} p-4 sm:p-6 shadow-inner`}>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={exit}
          className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-700 shadow text-2xl flex items-center justify-center shrink-0"
          aria-label="Back to the map"
        >
          ✖
        </motion.button>
        <div className="flex-1 h-6 bg-white/60 dark:bg-slate-700/60 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-lime-400 rounded-full"
            animate={{ width: `${phase === 'done' ? 100 : phase === 'intro' ? 0 : (index / steps.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
        </div>
        <span className="text-3xl shrink-0" aria-hidden>{level.def.animal.emoji}</span>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" exit={{ opacity: 0, scale: 0.9 }}>
            <LevelIntro level={level} lines={script.intro} onStart={() => setPhase('play')} />
          </motion.div>
        )}
        {phase === 'play' && (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <StepView step={steps[index]} level={level} storyIntro={script.storyIntro} onDone={finishStep} />
          </motion.div>
        )}
        {phase === 'done' && result && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LevelComplete level={level} lines={script.outro} stars={result.stars} words={result.words} onExit={exit} onReplay={onReplay} onNext={onNext} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepView({ step, level, storyIntro, onDone }: { step: Step; level: LevelInfo; storyIntro: string[]; onDone: (r: StepResult) => void }) {
  switch (step.kind) {
    case 'meet': return <MeetSound step={step} onDone={onDone} />;
    case 'hearPick': return <HearPick step={step} onDone={onDone} />;
    case 'blend': return <BlendWord step={step} onDone={onDone} />;
    case 'readPick': return <ReadPick step={step} onDone={onDone} />;
    case 'build': return <BuildWord step={step} onDone={onDone} />;
    case 'goal': return <GoalKick step={step} onDone={onDone} />;
    case 'alien': return <RealOrAlien step={step} onDone={onDone} />;
    case 'heart': return <HeartWord step={step} onDone={onDone} />;
    case 'sentence': return <SentenceCheck step={step} level={level} onDone={onDone} />;
    case 'story': return <StoryReader step={step} level={level} intro={storyIntro} onDone={onDone} />;
  }
}

function LevelIntro({ level, lines, onStart }: { level: LevelInfo; lines: string[]; onStart: () => void }) {
  const { animal } = level.def;
  useSayOnMount(...lines);

  return (
    <div className="flex flex-col items-center gap-6 text-center py-6">
      <p className="font-black text-slate-600 dark:text-slate-300 text-xl">
        {level.world.emoji} {level.world.name} · {level.def.title}
      </p>
      <div className="relative">
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0], y: [0, -6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
        >
          <Emoji size="text-[9rem]">{animal.emoji}</Emoji>
        </motion.div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-16 bg-white dark:bg-slate-800 rounded-2xl px-3 py-1 font-black text-2xl text-rose-500 shadow"
        >
          HELP!
        </motion.span>
      </div>
      <button
        type="button"
        onClick={() => say(...lines)}
        className="max-w-xl bg-white/85 dark:bg-slate-800/85 rounded-3xl px-5 py-4 font-extrabold text-xl text-slate-700 dark:text-slate-100 shadow"
      >
        🔊 {animal.rescue}
      </button>
      <BigButton onClick={onStart} label="Start">
        START RESCUE ▶
      </BigButton>
    </div>
  );
}

function LevelComplete({
  level, lines, stars, words, onExit, onReplay, onNext,
}: { level: LevelInfo; lines: string[]; stars: number; words: number; onExit: () => void; onReplay: () => void; onNext: (() => void) | null }) {
  const { animal } = level.def;
  const [flipped, setFlipped] = useState(false);
  useSayOnMount(...lines);
  const size = typeof window === 'undefined' ? { w: 800, h: 600 } : { w: window.innerWidth, h: window.innerHeight };

  return (
    <div className="flex flex-col items-center gap-5 text-center py-4">
      <ReactConfetti width={size.w} height={size.h} recycle={false} numberOfPieces={350} style={{ position: 'fixed', inset: 0 }} />
      <h2 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white drop-shadow">RESCUED!</h2>
      <div className="flex gap-2" aria-label={`${stars} stars`}>
        {[1, 2, 3].map(n => (
          <motion.span
            key={n}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3 + n * 0.25, type: 'spring' }}
            className={`text-6xl ${n <= stars ? '' : 'grayscale opacity-30'}`}
          >
            ⭐
          </motion.span>
        ))}
      </div>
      <p className="font-black text-xl text-slate-700 dark:text-slate-200">📚 You read {words} words!</p>

      {/* Creature card: tap to flip and hear the fact */}
      <motion.button
        type="button"
        onClick={() => { setFlipped(true); say(animal.fact); }}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1, rotateY: flipped ? 180 : 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-72 h-96 [perspective:1000px]"
        aria-label={`Creature card: ${animal.name}. Tap to hear a fact.`}
      >
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-yellow-200 to-amber-400 border-8 border-white shadow-2xl flex flex-col items-center justify-center gap-3 [backface-visibility:hidden]">
          <span className="font-black text-amber-800 tracking-widest text-sm">CREATURE CARD</span>
          <Emoji size="text-9xl">{animal.emoji}</Emoji>
          <span className="font-black text-3xl text-amber-900">{animal.name.toUpperCase()}</span>
          <span className="font-extrabold text-amber-800 px-4">{animal.stat}</span>
          <span className="font-black text-sky-700 text-sm">TAP FOR A FACT!</span>
        </div>
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-sky-200 to-sky-400 border-8 border-white shadow-2xl flex flex-col items-center justify-center gap-3 p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Emoji size="text-6xl">{animal.emoji}</Emoji>
          <p className="font-extrabold text-lg text-sky-950 leading-snug">{animal.fact}</p>
          <span className="text-3xl" aria-hidden>🔊</span>
        </div>
      </motion.button>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <BigButton onClick={onExit} color="bg-sky-500 border-sky-700" label="Back to map">🗺️ MAP</BigButton>
        <BigButton onClick={onReplay} color="bg-violet-500 border-violet-700" label="Play again">🔁 AGAIN</BigButton>
        {onNext && <BigButton onClick={onNext} label="Next rescue">NEXT ▶</BigButton>}
      </div>
    </div>
  );
}
