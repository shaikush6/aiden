'use client';

import type { LevelInfo } from '@/lib/reading-quest/catalog';
import { say } from '@/lib/reading-quest/audio';
import { LINES } from '@/lib/reading-quest/lines';
import type { Step } from '@/lib/reading-quest/plan';
import TappableText from '../TappableText';
import { ChoiceCard, Emoji, Guide, SpeakerButton, useAnswer, useSayOnMount, type StepResult } from '../ui';

type Props = { step: Extract<Step, { kind: 'sentence' }>; level: LevelInfo; onDone: (r: StepResult) => void };

/** Read a sentence, then show understanding: answer a silly yes/no question or pick the matching picture. */
export default function SentenceCheck({ step, level, onDone }: Props) {
  const { sentence, pics } = step;
  const isYesNo = 'yes' in sentence;
  const instruction = isYesNo ? LINES.sentenceYesNo : LINES.sentencePic;
  const { right, wrong, busy, stateFor, misses, status } = useAnswer(onDone);
  useSayOnMount(instruction);

  const readAloud = () => say(sentence.t);
  // Reading the whole sentence aloud is a last resort: it unlocks after one miss.
  const canHear = misses > 0 || status !== 'asking';

  return (
    <div className="flex flex-col items-center gap-6">
      <Guide text={instruction} onReplay={() => say(instruction)} />

      <div className="bg-white/90 dark:bg-slate-800/90 rounded-[2rem] shadow-xl px-6 py-6 w-full max-w-3xl flex flex-col items-center gap-3">
        <TappableText text={sentence.t} level={level} />
        {canHear && <SpeakerButton onClick={readAloud} label="Read it to me" />}
      </div>

      {isYesNo ? (
        <div className="flex gap-6">
          {[true, false].map(v => (
            <ChoiceCard
              key={String(v)}
              label={v ? 'yes' : 'no'}
              state={stateFor(String(v), String(sentence.yes))}
              disabled={busy}
              onClick={() => (v === sentence.yes ? right(readAloud) : wrong(String(v), readAloud))}
            >
              <div className="flex flex-col items-center gap-1 px-6">
                <Emoji size="text-7xl">{v ? '👍' : '👎'}</Emoji>
                <span className={`font-black text-3xl ${v ? 'text-emerald-600' : 'text-rose-500'}`}>{v ? 'YES' : 'NO'}</span>
              </div>
            </ChoiceCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-5">
          {(pics ?? []).map(p => (
            <ChoiceCard
              key={p}
              label={`picture ${p}`}
              state={stateFor(p, 'pic' in sentence ? sentence.pic : '')}
              disabled={busy}
              onClick={() => ('pic' in sentence && p === sentence.pic ? right(readAloud) : wrong(p, readAloud))}
            >
              <Emoji size="text-6xl">{p}</Emoji>
            </ChoiceCard>
          ))}
        </div>
      )}
    </div>
  );
}
