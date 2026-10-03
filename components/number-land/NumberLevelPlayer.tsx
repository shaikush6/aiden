'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { stopAudio } from '@/lib/audio-player';
import { say } from '@/lib/reading-quest/audio';
import { NUMBER_LEVELS, TOWNS, type NLevel } from '@/lib/number-land/curriculum';
import { NL } from '@/lib/number-land/lines';
import type { NLScript } from '@/lib/number-land/script';
import { isNScored, nStepNumbers, nWordsInStep, type NStep } from '@/lib/number-land/plan';
import { recordNLLevel, type NumberStat } from '@/lib/number-land/progress';
import { BigButton, useSayOnMount, type StepResult } from '@/components/reading-quest/ui';
import { useJuice } from '@/components/reading-quest/Juice';
import SoundSwitches from '@/components/reading-quest/SoundSwitches';
import NumberBuddy from './NumberBuddy';
import { fitSize } from './types';
import MeetBuddy from './steps/MeetBuddy';
import MeetWord from './steps/MeetWord';
import Wake from './steps/Wake';
import Build from './steps/Build';
import Equation from './steps/Equation';
import Riddle from './steps/Riddle';
import OddEven from './steps/OddEven';
import Compare from './steps/Compare';
import Story from './steps/Story';
import WordBond from './steps/WordBond';
import SoundCompare from './steps/SoundCompare';
import NumberRocket from './steps/NumberRocket';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

interface Props {
  level: NLevel;
  steps: NStep[];
  script: NLScript;
  onExit: () => void;
  onReplay: () => void;
  onNext: (() => void) | null;
}

interface Tally { scored: number; firstTry: number; words: number; numbers: Record<string, NumberStat> }

function starsFor(t: Tally): number {
  if (!t.scored) return 3;
  const ratio = t.firstTry / t.scored;
  return ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1;
}

export default function NumberLevelPlayer({ level, steps, script, onExit, onReplay, onNext }: Props) {
  const town = TOWNS[level.town];
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ stars: number; words: number } | null>(null);
  const tally = useRef<Tally>({ scored: 0, firstTry: 0, words: 0, numbers: {} });
  const juice = useJuice();

  const finishStep = (r: StepResult) => {
    const step = steps[index];
    const t = tally.current;
    if (isNScored(step)) {
      juice.celebrate(r.firstTry);
      t.scored++;
      if (r.firstTry) t.firstTry++;
      for (const n of nStepNumbers(step)) {
        const s = t.numbers[n] ?? { right: 0, wrong: 0 };
        if (r.firstTry) s.right++; else s.wrong++;
        t.numbers[n] = s;
      }
    }
    t.words += nWordsInStep(step);

    if (index + 1 < steps.length) {
      setIndex(index + 1);
      return;
    }
    const stars = starsFor(t);
    recordNLLevel({ levelId: level.id, stars, wordsRead: t.words, buddies: level.buddies, words: level.words, numbers: t.numbers });
    setResult({ stars, words: t.words });
    setPhase('done');
  };

  const exit = () => { stopAudio(); onExit(); };

  return (
    <div className={`min-h-[70vh] rounded-[2rem] bg-gradient-to-br ${town.theme} p-4 sm:p-6 shadow-inner`}>
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
        <span className="text-3xl shrink-0" aria-hidden>{town.emoji}</span>
        <SoundSwitches compact />
      </div>

      {phase === 'play' && juice.bar}
      {juice.overlay}

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" exit={{ opacity: 0, scale: 0.9 }}>
            <Intro level={level} lines={script.intro} onStart={() => setPhase('play')} />
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
            <StepView step={steps[index]} onDone={finishStep} />
          </motion.div>
        )}
        {phase === 'done' && result && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Complete level={level} lines={script.outro} stars={result.stars} words={result.words} onExit={exit} onReplay={onReplay} onNext={onNext} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepView({ step, onDone }: { step: NStep; onDone: (r: StepResult) => void }) {
  switch (step.kind) {
    case 'meet': return <MeetBuddy step={step} onDone={onDone} />;
    case 'meetWord': return <MeetWord step={step} onDone={onDone} />;
    case 'wake': return <Wake step={step} onDone={onDone} />;
    case 'build': return <Build step={step} onDone={onDone} />;
    case 'equation': return <Equation step={step} onDone={onDone} />;
    case 'riddle': return <Riddle step={step} onDone={onDone} />;
    case 'oddEven': return <OddEven step={step} onDone={onDone} />;
    case 'compare': return <Compare step={step} onDone={onDone} />;
    case 'story': return <Story step={step} onDone={onDone} />;
    case 'wordBond': return <WordBond step={step} onDone={onDone} />;
    case 'soundCompare': return <SoundCompare step={step} onDone={onDone} />;
    case 'rocket': return <NumberRocket step={step} onDone={onDone} />;
  }
}

function Intro({ level, lines, onStart }: { level: NLevel; lines: string[]; onStart: () => void }) {
  const town = TOWNS[level.town];
  useSayOnMount(...lines);
  return (
    <div className="flex flex-col items-center gap-6 text-center py-6">
      <p className="font-black text-slate-600 dark:text-slate-300 text-xl">{town.emoji} {town.name} · {level.title}</p>
      {level.buddies.length > 0 ? (
        <div className="flex items-end justify-center gap-6 min-h-[170px]">
          {level.buddies.map(n => (
            <motion.div key={n} animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, delay: n * 0.2 }}>
              <NumberBuddy n={n} size={fitSize(level.buddies, 170)} asleep />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.span className="text-[8rem] leading-none" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity }} aria-hidden>
          {level.icon}
        </motion.span>
      )}
      <button
        type="button"
        onClick={() => say(...lines)}
        className="max-w-xl bg-white/85 dark:bg-slate-800/85 rounded-3xl px-5 py-4 font-extrabold text-xl text-slate-700 dark:text-slate-100 shadow"
      >
        🔊 {lines.join(' ')}
      </button>
      <BigButton onClick={onStart} label="Start">LET’S GO ▶</BigButton>
    </div>
  );
}

function Complete({
  level, lines, stars, words, onExit, onReplay, onNext,
}: { level: NLevel; lines: string[]; stars: number; words: number; onExit: () => void; onReplay: () => void; onNext: (() => void) | null }) {
  useSayOnMount(...lines);
  const size = typeof window === 'undefined' ? { w: 800, h: 600 } : { w: window.innerWidth, h: window.innerHeight };
  const isLast = level.id === NUMBER_LEVELS[NUMBER_LEVELS.length - 1].id;
  return (
    <div className="flex flex-col items-center gap-5 text-center py-4">
      <ReactConfetti width={size.w} height={size.h} recycle={false} numberOfPieces={350} style={{ position: 'fixed', inset: 0 }} />
      <h2 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white drop-shadow">{isLast ? 'CHAMPION!' : 'BUDDIES AWAKE!'}</h2>
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
      {level.buddies.length > 0 && (
        <div className="flex items-end justify-center gap-6 min-h-[150px]">
          {level.buddies.map(n => (
            <motion.div key={n} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 + n * 0.05, type: 'spring' }}>
              <NumberBuddy n={n} size={fitSize(level.buddies, 150)} />
            </motion.div>
          ))}
        </div>
      )}
      <p className="font-black text-xl text-slate-700 dark:text-slate-200">📚 You read {words} words!</p>
      <p className="font-bold text-slate-600 dark:text-slate-300">{NL.levelDone}</p>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <BigButton onClick={onExit} color="bg-sky-500 border-sky-700" label="Back to map">🗺️ MAP</BigButton>
        <BigButton onClick={onReplay} color="bg-violet-500 border-violet-700" label="Play again">🔁 AGAIN</BigButton>
        {onNext && <BigButton onClick={onNext} label="Next level">NEXT ▶</BigButton>}
      </div>
    </div>
  );
}
