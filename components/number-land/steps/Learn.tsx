'use client';

import { meetSign } from '@/lib/number-land/progress';
import { TOPIC_SIGNS } from '@/lib/number-land/terms';
import LessonPlayer from '../LessonPlayer';
import type { StepProps } from '../types';

/** A short animated lesson. The signs it teaches are added to the Buddy Book when he finishes it. */
export default function Learn({ step, onDone }: StepProps<'learn'>) {
  return (
    <LessonPlayer
      topic={step.topic}
      finishLabel="GOT IT ▶"
      onFinish={() => {
        (TOPIC_SIGNS[step.topic] ?? []).forEach(meetSign);
        onDone({ firstTry: true });
      }}
    />
  );
}
