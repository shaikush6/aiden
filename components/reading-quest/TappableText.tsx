'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { lookupWord, tokenize, type LevelInfo } from '@/lib/reading-quest/catalog';
import { sayWord } from '@/lib/reading-quest/audio';
import type { ParsedWord } from '@/lib/reading-quest/types';
import { WordView } from './ui';

/**
 * A sentence where every word can be tapped for help.
 * Tapping a regular word shows its sound buttons so the child sounds it out (instead of just hearing it).
 * Tapping a heart word says it, because heart words cannot be sounded out.
 */
export default function TappableText({
  text, level, lookup, size = 'text-4xl sm:text-5xl', extra = [],
}: {
  text: string;
  level?: LevelInfo;
  /** Use instead of `level` to look words up in another lexicon. */
  lookup?: (key: string) => { word: ParsedWord; heart: number[] } | null;
  size?: string;
  extra?: ParsedWord[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  const tokens = tokenize(text);
  const findWord = (key: string): { word: ParsedWord; heart: number[] } | null => {
    if (lookup) return lookup(key);
    const f = level ? lookupWord(level, key) : null;
    return f ? { word: f.word, heart: f.heart?.heart ?? [] } : null;
  };

  return (
    <div className="flex flex-wrap justify-center items-end gap-x-4 gap-y-3">
      {tokens.map((tok, i) => {
        const own = extra.find(w => w.text.toLowerCase() === tok.key);
        const found = own ? { word: own, heart: [] as number[] } : findWord(tok.key);
        const isOpen = open === i && found;
        const punct = tok.display.match(/[.,!?;:]+$/)?.[0] ?? '';
        return (
          <motion.span key={i} layout className="inline-flex items-end">
            {isOpen ? (
              <span className="bg-yellow-100 dark:bg-yellow-500/20 rounded-2xl px-2 py-1 inline-flex items-end">
                <WordView word={found.word} size="md" buttons heart={found.heart} />
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="ml-1 text-base text-slate-400 min-h-0 min-w-0 w-7 h-7"
                  aria-label="Close"
                >
                  ✕
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!found) return;
                  if (found.heart.length) sayWord(found.word);
                  setOpen(i);
                }}
                className={`${size} font-black text-slate-800 dark:text-slate-100 rounded-xl px-1 min-h-0 min-w-0
                  hover:bg-sky-100 dark:hover:bg-slate-700 ${found?.heart.length ? 'decoration-rose-300 underline decoration-4 underline-offset-8' : ''}`}
              >
                {tok.display.replace(/[.,!?;:]+$/, '')}
              </button>
            )}
            {punct && <span className={`${size} font-black text-slate-800 dark:text-slate-100`}>{punct}</span>}
          </motion.span>
        );
      })}
    </div>
  );
}
