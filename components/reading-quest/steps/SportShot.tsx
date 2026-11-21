'use client';

import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, type TargetAndTransition } from 'framer-motion';
import { say, sayWord, wordClip } from '@/lib/reading-quest/audio';
import { goalLine, sportAsk } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import type { Sport } from '@/lib/reading-quest/types';
import { Guide, SpeakerButton, useAnswer, useSayOnMount, WordView, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'goal' }>; onDone: (r: StepResult) => void };

/**
 * Where the target is, measured from the ball when it is tapped (screens differ, so fixed distances miss).
 * dx, dy: from the centre of the ball to the centre of the target. oy: the ball's centre inside its button,
 * used as the point the button scales and spins around, so the ball itself lands on the target.
 */
interface Aim { dx: number; dy: number; oy: number }

/** `i` is the ball's slot (0, 1, 2); the left ball bounces off to the left when it misses, the others to the right. */
interface SportLook {
  ball: string;
  cheer: string;
  field: string;
  target: ReactNode;
  score: (aim: Aim) => TargetAndTransition;
  miss: (aim: Aim, i: number) => TargetAndTransition;
  duration: number;
}

const away = (i: number) => (i === 0 ? -1 : 1);

const SOCCER_GOAL = (
  <div data-aim className="mx-auto w-2/3 h-28 border-8 border-b-0 border-white rounded-t-lg relative
    bg-[linear-gradient(45deg,rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(-45deg,rgba(255,255,255,.35)_1px,transparent_1px)] bg-[size:14px_14px]">
    <motion.div
      className="absolute left-1/2 bottom-0 -translate-x-1/2 text-5xl"
      animate={{ x: ['-60%', '-40%', '-60%'] }}
      transition={{ duration: 2.2, repeat: Infinity }}
      aria-hidden
    >
      🧤
    </motion.div>
  </div>
);

const BASKETBALL_HOOP = (
  <div className="mx-auto w-44 sm:w-52 h-28 relative" aria-hidden>
    {/* Backboard with its little square */}
    <div className="absolute inset-x-0 top-0 h-20 bg-white/95 rounded-lg border-4 border-slate-300 shadow">
      <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-16 h-10 border-4 border-orange-500 rounded-sm" />
    </div>
    {/* Rim and net */}
    <div data-aim className="absolute left-1/2 -translate-x-1/2 top-[4.6rem] w-24 h-2.5 bg-orange-500 rounded-full shadow z-10" />
    <div className="absolute left-1/2 -translate-x-1/2 top-[5.1rem] w-20 h-9 [clip-path:polygon(0_0,100%_0,82%_100%,18%_100%)]
      bg-[linear-gradient(60deg,rgba(255,255,255,.9)_1.5px,transparent_1.5px),linear-gradient(-60deg,rgba(255,255,255,.9)_1.5px,transparent_1.5px)] bg-[size:10px_10px]" />
  </div>
);

const VOLLEYBALL_NET = (
  <div className="mx-auto w-[90%] h-28 relative" aria-hidden>
    {/* The far side of the court, where the ball lands */}
    <div data-aim className="absolute inset-x-6 top-1 h-14 border-4 border-white/80 border-b-0 rounded-t-md" />
    {/* Posts and net */}
    <div className="absolute left-0 bottom-0 w-2.5 h-16 bg-slate-500 rounded-t" />
    <div className="absolute right-0 bottom-0 w-2.5 h-16 bg-slate-500 rounded-t" />
    <div className="absolute left-2 right-2 bottom-4 h-10 border-t-[6px] border-white
      bg-[linear-gradient(90deg,rgba(255,255,255,.8)_1.5px,transparent_1.5px),linear-gradient(0deg,rgba(255,255,255,.8)_1.5px,transparent_1.5px)] bg-[size:12px_12px]" />
  </div>
);

const SPORTS: Record<Sport, SportLook> = {
  soccer: {
    ball: '⚽',
    cheer: 'GOAL!',
    field: 'bg-[repeating-linear-gradient(90deg,#4ade80_0,#4ade80_60px,#22c55e_60px,#22c55e_120px)]',
    target: SOCCER_GOAL,
    score: a => ({ x: a.dx, y: a.dy + 20, scale: 0.55, rotate: 540 }),
    // Wide of the goal.
    miss: (a, i) => ({ x: a.dx + 230 * away(i), y: a.dy, scale: 0.7, rotate: 360, opacity: 0.4 }),
    duration: 0.6,
  },
  basketball: {
    ball: '🏀',
    cheer: 'SWISH!',
    field: 'bg-[repeating-linear-gradient(90deg,#f59e0b_0,#f59e0b_46px,#d97706_46px,#d97706_50px,#fbbf24_50px,#fbbf24_96px,#d97706_96px,#d97706_100px)]',
    target: BASKETBALL_HOOP,
    // Up in an arc above the hoop, down onto the rim, and through the net.
    score: a => ({
      x: [0, a.dx * 0.7, a.dx, a.dx],
      y: [0, a.dy - 110, a.dy - 12, a.dy + 40],
      scale: [1, 0.7, 0.45, 0.42],
      rotate: [0, 300, 480, 540],
      transition: { duration: 1.1, times: [0, 0.45, 0.75, 1], ease: 'easeInOut' },
    }),
    // Hits the edge of the rim and bounces away to the side.
    miss: (a, i) => ({
      x: [0, a.dx * 0.7, a.dx + 34 * away(i), a.dx + 170 * away(i)],
      y: [0, a.dy - 110, a.dy - 8, a.dy + 90],
      scale: [1, 0.7, 0.5, 0.6],
      rotate: [0, 300, 420, 560],
      opacity: [1, 1, 1, 0.4],
      transition: { duration: 1.1, times: [0, 0.45, 0.7, 1], ease: 'easeInOut' },
    }),
    duration: 1.1,
  },
  volleyball: {
    ball: '🏐',
    cheer: 'POINT!',
    field: 'bg-[linear-gradient(180deg,#fde68a_0%,#fcd34d_55%,#fbbf24_100%)]',
    target: VOLLEYBALL_NET,
    // High over the net and down on the far side.
    score: a => ({ x: [0, a.dx * 0.5, a.dx], y: [0, a.dy - 70, a.dy], scale: [1, 0.8, 0.55], rotate: [0, 270, 400] }),
    // Into the net (just below the far court), then it drops back down.
    miss: a => ({ x: [0, a.dx * 0.4, a.dx * 0.5, a.dx * 0.5], y: [0, a.dy + 20, a.dy + 55, a.dy + 140], scale: [1, 0.85, 0.8, 0.9], rotate: [0, 120, 160, 200], opacity: [1, 1, 1, 0.4] }),
    duration: 0.9,
  },
};

/** Soccer, basketball or volleyball: hear a word, then send the ball labelled with that word into the goal, through the hoop, or over the net. */
export default function SportShot({ step, onDone }: Props) {
  const { word, options, sport } = step;
  const look = SPORTS[sport] ?? SPORTS.soccer;
  const ask = sportAsk(sport);
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  const [kicked, setKicked] = useState<string | null>(null);
  const [aim, setAim] = useState<Aim>({ dx: 0, dy: -170, oy: 36 });
  const court = useRef<HTMLDivElement>(null);
  useSayOnMount(ask, wordClip(word));

  const shoot = (text: string, button: HTMLElement) => {
    if (busy) return;
    const ball = button.firstElementChild?.getBoundingClientRect();
    const target = court.current?.querySelector('[data-aim]')?.getBoundingClientRect();
    const box = button.getBoundingClientRect();
    if (ball && target) {
      setAim({
        dx: target.left + target.width / 2 - (ball.left + ball.width / 2),
        dy: target.top + target.height / 2 - (ball.top + ball.height / 2),
        oy: ball.top + ball.height / 2 - box.top,
      });
    }
    setKicked(text);
    if (text === word.text) right(() => say(goalLine(sport)));
    else wrong(text, () => sayWord(word)).then(() => setKicked(null));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Guide text={`${ask}…`} onReplay={() => say(ask, wordClip(word))} />

      <div className={`relative w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/70 pt-4 pb-6 ${look.field}`}>
        <div className="relative" ref={court}>
          {look.target}
          <AnimatePresence>
            {kicked === word.text && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: look.duration * 0.6 }}
                className="absolute inset-0 flex items-center justify-center text-5xl font-black text-yellow-300 drop-shadow-[0_3px_0_rgba(0,0,0,.4)] z-20 pointer-events-none"
              >
                {look.cheer}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-around items-end mt-10 px-2">
          {options.map((o, i) => {
            const state = stateFor(o.text, word.text);
            const flying = kicked === o.text;
            return (
              <motion.button
                key={o.text}
                type="button"
                onClick={e => shoot(o.text, e.currentTarget)}
                disabled={busy}
                animate={flying ? (o.text === word.text ? look.score(aim) : look.miss(aim, i)) : { y: 0, x: 0, scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: look.duration, ease: 'easeOut' }}
                style={{ transformOrigin: `50% ${aim.oy}px` }}
                className="flex flex-col items-center gap-1 z-10"
                aria-label={`ball ${o.text}`}
              >
                <span className="text-6xl sm:text-7xl leading-none">{look.ball}</span>
                <span className={`rounded-2xl px-3 py-1 border-4 ${state === 'reveal' || state === 'right' ? 'bg-emerald-100 border-emerald-400' : state === 'wrong' ? 'bg-rose-100 border-rose-400' : 'bg-white border-white'}`}>
                  <WordView word={o} size="md" />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
      <SpeakerButton onClick={() => sayWord(word)} label="Hear the word" big />
    </div>
  );
}
