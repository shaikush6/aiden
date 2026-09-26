'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LevelInfo } from '@/lib/reading-quest/catalog';
import { say } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import TappableText from '../TappableText';
import { BigButton, ChoiceCard, Emoji, Guide, SpeakerButton, useAnswer, useSayOnMount, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'story' }>; level: LevelInfo; intro: string[]; onDone: (r: StepResult) => void };

/** A decodable story, page by page, followed by spoken comprehension questions. */
export default function StoryReader({ step, level, intro, onDone }: Props) {
  const { story } = step;
  const [page, setPage] = useState(0);
  const [question, setQuestion] = useState<number | null>(null);
  const [anyMiss, setAnyMiss] = useState(false);
  useSayOnMount(...intro, LINES.story, story.title);

  const nextPage = () => {
    if (page < story.pages.length - 1) { setPage(page + 1); return; }
    setQuestion(0);
    say(LINES.storyQuestions, story.questions[0].ask);
  };

  const answered = (r: StepResult) => {
    const missed = anyMiss || !r.firstTry;
    setAnyMiss(missed);
    const next = (question ?? 0) + 1;
    if (next < story.questions.length) {
      setQuestion(next);
      say(story.questions[next].ask);
    } else {
      onDone({ firstTry: !missed });
    }
  };

  if (question !== null) {
    const q = story.questions[question];
    return <StoryQuestion key={question} ask={q.ask} options={q.options} answer={q.answer} onDone={answered} />;
  }

  const p = story.pages[page];
  return (
    <div className="flex flex-col items-center gap-5">
      <Guide text={`📖 ${story.title}`} onReplay={() => say(LINES.story, story.title)} />
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 60, rotateY: -20 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.35 }}
          className="bg-amber-50 dark:bg-slate-800 rounded-[2rem] shadow-2xl border-4 border-amber-200 dark:border-slate-600 w-full max-w-3xl px-6 py-6 flex flex-col items-center gap-5"
        >
          <Emoji size="text-8xl">{p.pic}</Emoji>
          <TappableText text={p.t} level={level} size="text-3xl sm:text-4xl" />
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center gap-4">
        <SpeakerButton onClick={() => say(p.t)} label="Read this page to me" />
        <span className="font-black text-slate-500 dark:text-slate-400 text-lg">{page + 1} / {story.pages.length}</span>
        <BigButton onClick={nextPage} color="bg-sky-500 border-sky-700" label="Next page">
          {page < story.pages.length - 1 ? 'NEXT PAGE ▶' : 'QUESTIONS ▶'}
        </BigButton>
      </div>
    </div>
  );
}

function StoryQuestion({ ask, options, answer, onDone }: { ask: string; options: string[]; answer: number; onDone: (r: StepResult) => void }) {
  const { right, wrong, busy, stateFor } = useAnswer(onDone);
  return (
    <div className="flex flex-col items-center gap-8">
      <Guide text={ask} onReplay={() => say(ask)} />
      <div className="flex flex-wrap justify-center gap-5">
        {options.map((o, i) => (
          <ChoiceCard
            key={o}
            label={o}
            state={stateFor(String(i), String(answer))}
            disabled={busy}
            onClick={() => (i === answer ? right() : wrong(String(i)))}
          >
            <Emoji size="text-7xl">{o}</Emoji>
          </ChoiceCard>
        ))}
      </div>
    </div>
  );
}
