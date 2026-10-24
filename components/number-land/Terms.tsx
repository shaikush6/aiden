'use client';

import { useMemo, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { lineClip, say } from '@/lib/reading-quest/audio';
import { buddyLayout, numeralColor } from '@/lib/number-land/buddy';
import { NL } from '@/lib/number-land/lines';
import { SIGN_TOPIC, type Option, type Sign, type Term } from '@/lib/number-land/terms';
import { lookupLexicon, NUMBER_TEXT } from '@/lib/number-land/words';
import { WordView } from '@/components/reading-quest/ui';
import NumberBuddy from './NumberBuddy';
import { useExplain } from './ExplainContext';
import { useCounting } from './useCounting';

export type Scale = 'sm' | 'md' | 'lg';

const NUM_TEXT: Record<Scale, string> = { sm: 'text-4xl w-14 h-14', md: 'text-5xl w-20 h-20', lg: 'text-7xl w-28 h-28' };
const SIGN_TEXT: Record<Scale, string> = { sm: 'text-4xl w-10 h-14', md: 'text-6xl w-14 h-20', lg: 'text-8xl w-20 h-28' };
const LABEL_TEXT: Record<Scale, string> = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

/** Block size so the tallest buddy in a row fits, scaled by how much room the row has. */
function blockSize(terms: Term[], scale: Scale): number {
  const rows = Math.max(1, ...terms.map(t => (t.t === 'buddy' ? buddyLayout(t.n).rows : 1)));
  const maxHeight = scale === 'lg' ? 190 : scale === 'md' ? 130 : 90;
  const wide = terms.filter(t => t.t === 'buddy').length > 2 ? 0.8 : 1;
  return Math.max(9, Math.min(scale === 'lg' ? 50 : 34, Math.floor((maxHeight * wide) / rows) - 3));
}

/** A numeral on a coloured tile. Tap it to hear its name. */
export function NumeralTile({ n, scale = 'md', glow = false, onClick }: { n: number; scale?: Scale; glow?: boolean; onClick?: () => void }) {
  const wide = n >= 10 ? 'px-3 min-w-[1.4em]' : '';
  return (
    <motion.button
      type="button"
      onClick={onClick ?? (() => { say(lineClip(NUMBER_TEXT[n], 'word')); })}
      whileTap={{ scale: 0.9 }}
      animate={glow ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={glow ? { duration: 1.2, repeat: Infinity } : undefined}
      className={`${NUM_TEXT[scale]} ${wide} ${numeralColor(n)} bg-white dark:bg-slate-800 border-4 border-b-8 rounded-2xl font-black leading-none
        flex items-center justify-center shadow-md select-none ${glow ? 'ring-4 ring-yellow-300' : ''}`}
      aria-label={`The number ${NUMBER_TEXT[n]}`}
    >
      {n}
    </motion.button>
  );
}

/** A + − = < > sign. Tap it and Kit explains what it means. */
export function SignTile({ s, scale = 'md', glow = false, onClick }: { s: Sign; scale?: Scale; glow?: boolean; onClick?: () => void }) {
  const { open } = useExplain();
  return (
    <motion.button
      type="button"
      onClick={onClick ?? (() => open(SIGN_TOPIC[s]))}
      whileTap={{ scale: 0.88 }}
      animate={glow ? { scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] } : { scale: 1 }}
      transition={glow ? { duration: 1.3, repeat: Infinity } : undefined}
      className={`${SIGN_TEXT[scale]} font-black leading-none flex items-center justify-center select-none rounded-2xl
        ${s === '+' ? 'text-emerald-500' : s === '−' ? 'text-rose-500' : s === '=' ? 'text-violet-500' : 'text-orange-500'}
        ${glow ? 'bg-yellow-100/70 dark:bg-yellow-400/10 ring-4 ring-yellow-300' : ''}`}
      aria-label={`The ${s} sign. Tap to hear what it means.`}
    >
      {s}
    </motion.button>
  );
}

function TappableBuddy({ n, size, fx, asleep }: { n: number; size: number; fx?: 'pairs' | 'leftover' | 'glow'; asleep?: boolean }) {
  const { lit, run } = useCounting();
  return (
    <motion.button
      type="button"
      onClick={() => { void run(n); }}
      whileTap={{ scale: 0.94 }}
      animate={fx === 'glow' ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={fx === 'glow' ? { duration: 1.2, repeat: Infinity } : undefined}
      className={`rounded-2xl p-1 ${fx === 'glow' ? 'bg-yellow-100/70 dark:bg-yellow-400/10 ring-4 ring-yellow-300' : ''}`}
      aria-label={`Block Buddy ${n}. Tap to count it.`}
    >
      <NumberBuddy n={n} size={size} lit={lit} asleep={asleep} leftover={fx === 'leftover'} pairs={fx === 'pairs'} />
    </motion.button>
  );
}

function Items({ emoji, n, faded = 0, scale }: { emoji: string; n: number; faded?: number; scale: Scale }) {
  const size = scale === 'lg' ? 'text-6xl' : scale === 'md' ? 'text-5xl' : 'text-3xl';
  const rows = n > 5 ? [Math.ceil(n / 2), Math.floor(n / 2)] : [n];
  let index = 0;
  return (
    <div className="flex flex-col items-center gap-1" aria-label={`${n} ${emoji}`}>
      {rows.map((count, r) => (
        <div key={r} className="flex gap-1">
          {Array.from({ length: count }, () => {
            const i = index++;
            return (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1, opacity: i >= n - faded ? 0.25 : 1 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300 }}
                className={`${size} leading-none`}
                aria-hidden
              >
                {emoji}
              </motion.span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ClueCard({ term, scale }: { term: Extract<Term, { t: 'clue' }>; scale: Scale }) {
  const big = scale === 'lg' ? 'text-6xl' : 'text-5xl';
  const Q = <span className={`${big} font-black text-violet-500`}>?</span>;
  let body: ReactNode;
  switch (term.kind) {
    case 'more': body = <>{Q}<span className={`${big} font-black text-orange-500`}>&gt;</span><span className={`${big} font-black ${numeralColor(term.n).split(' ')[0]}`}>{term.n}</span></>; break;
    case 'less': body = <>{Q}<span className={`${big} font-black text-orange-500`}>&lt;</span><span className={`${big} font-black ${numeralColor(term.n).split(' ')[0]}`}>{term.n}</span></>; break;
    case 'onemore': body = <>{Q}<span className={`${big} font-black text-violet-500`}>=</span><span className={`${big} font-black ${numeralColor(term.n).split(' ')[0]}`}>{term.n}</span><span className={`${big} font-black text-emerald-500`}>+1</span></>; break;
    case 'odd': body = <><span className={big} aria-hidden>☝️</span><span className="font-black text-3xl text-sky-600">odd</span></>; break;
    case 'even': body = <><span className={big} aria-hidden>✌️</span><span className="font-black text-3xl text-pink-600">even</span></>; break;
  }
  return (
    <motion.button
      type="button"
      onClick={() => { say(term.text); }}
      whileTap={{ scale: 0.94 }}
      className="bg-amber-50 dark:bg-slate-800 border-4 border-b-8 border-amber-300 rounded-3xl px-5 py-3 flex flex-col items-center gap-1 shadow-md"
      aria-label={term.text}
    >
      <span className="flex items-center gap-2">{body}</span>
      <span className="font-extrabold text-base text-slate-500 dark:text-slate-300">{term.text}</span>
    </motion.button>
  );
}

function Strip({ term, scale }: { term: Extract<Term, { t: 'strip' }>; scale: Scale }) {
  const nums = Array.from({ length: term.to - term.from + 1 }, (_, i) => term.from + i);
  const size = scale === 'sm' ? 'w-9 h-11 text-2xl' : 'w-12 h-14 text-3xl';
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {nums.map(n => {
        const out = term.out.includes(n);
        const glow = term.glow?.includes(n);
        return (
          <motion.span
            key={n}
            animate={out ? { opacity: 0.25, scale: 0.85 } : glow ? { scale: [1, 1.2, 1] } : { opacity: 1, scale: 1 }}
            transition={glow ? { duration: 1, repeat: Infinity } : { duration: 0.5 }}
            className={`${size} ${numeralColor(n)} bg-white dark:bg-slate-800 border-4 rounded-xl font-black flex items-center justify-center relative
              ${glow ? 'ring-4 ring-yellow-300' : ''}`}
          >
            {n}
            {out && <span className="absolute inset-0 flex items-center justify-center text-rose-500 text-4xl" aria-hidden>✕</span>}
          </motion.span>
        );
      })}
    </div>
  );
}

function WordTerm({ text, scale }: { text: string; scale: Scale }) {
  const found = lookupLexicon(text);
  if (!found) return <span className={`${LABEL_TEXT[scale]} font-black`}>{text}</span>;
  return (
    <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-md px-5 py-3">
      <WordView word={found.word} size={scale === 'lg' ? 'xl' : 'lg'} buttons heart={found.heart} />
    </div>
  );
}

function Blank({ scale }: { scale: Scale }) {
  return (
    <motion.button
      type="button"
      onClick={() => { say(NL.blankHelp); }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1.6, repeat: Infinity }}
      className={`${NUM_TEXT[scale]} border-4 border-dashed border-violet-300 rounded-2xl font-black text-violet-500 flex items-center justify-center bg-violet-50/60 dark:bg-violet-900/20`}
      aria-label="The mystery spot"
    >
      ?
    </motion.button>
  );
}

/** One term, drawn. */
export function TermView({ term, scale, block }: { term: Term; scale: Scale; block: number }) {
  switch (term.t) {
    case 'buddy': return <TappableBuddy n={term.n} size={block} fx={term.fx} asleep={term.asleep} />;
    case 'num': return <NumeralTile n={term.n} scale={scale} glow={term.fx === 'glow'} />;
    case 'sign': return <SignTile s={term.s} scale={scale} glow={term.fx === 'glow'} />;
    case 'blank': return <Blank scale={scale} />;
    case 'items': return <Items emoji={term.emoji} n={term.n} faded={term.faded} scale={scale} />;
    case 'word': return <WordTerm text={term.text} scale={scale} />;
    case 'text': return /^\p{Extended_Pictographic}/u.test(term.text)
      ? <span className={scale === 'sm' ? 'text-4xl' : 'text-6xl'} aria-hidden>{term.text}</span>
      : <span className={`${LABEL_TEXT[scale]} font-black text-slate-500 dark:text-slate-300`}>{term.text}</span>;
    case 'clue': return <ClueCard term={term} scale={scale} />;
    case 'strip': return <Strip term={term} scale={scale} />;
  }
}

const termKey = (t: Term, i: number): string => `${i}:${t.t}:${'n' in t ? t.n : 's' in t ? t.s : 'text' in t ? t.text : ''}`;

/** A row of terms: the picture of a problem, an equation, a riddle. Everything in it can be tapped. */
export function TermRow({ terms, scale = 'md' }: { terms: Term[]; scale?: Scale }) {
  const block = useMemo(() => blockSize(terms, scale), [terms, scale]);
  return (
    <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-4">
      {terms.map((t, i) => (
        <motion.div
          key={termKey(t, i)}
          initial={{ scale: 0.4, opacity: 0, y: 14 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: Math.min(i * 0.05, 0.3) }}
          className="flex items-end"
        >
          <TermView term={t} scale={scale} block={block} />
        </motion.div>
      ))}
    </div>
  );
}

// ---------- answer cards ----------

/** The face of an answer card. */
export function OptionFace({ option, block }: { option: Option; block: number }) {
  switch (option.t) {
    case 'num':
      return <span className={`text-7xl font-black leading-none ${numeralColor(option.n).split(' ')[0]}`}>{option.n}</span>;
    case 'buddy':
      return <NumberBuddy n={option.n} size={block} />;
    case 'sign':
      return (
        <span className={`text-8xl font-black leading-none ${option.s === '+' ? 'text-emerald-500' : option.s === '−' ? 'text-rose-500' : option.s === '=' ? 'text-violet-500' : 'text-orange-500'}`}>
          {option.s}
        </span>
      );
    case 'word':
      return (
        <span className="flex flex-col items-center gap-1">
          <span className="text-5xl leading-none" aria-hidden>{option.icon}</span>
          <span className="text-3xl font-black text-slate-700 dark:text-slate-100">{option.text}</span>
        </span>
      );
  }
}

export function optionLabel(o: Option): string {
  switch (o.t) {
    case 'num': return `${NUMBER_TEXT[o.n]}`;
    case 'buddy': return `Block Buddy ${o.n}`;
    case 'sign': return `The ${o.s} sign`;
    case 'word': return o.text;
  }
}

/** Blocks sized so the biggest buddy among the answer cards still fits. */
export function optionBlock(options: Option[]): number {
  const rows = Math.max(1, ...options.map(o => (o.t === 'buddy' ? buddyLayout(o.n).rows : 1)));
  return Math.max(9, Math.min(30, Math.floor(135 / rows) - 3));
}
