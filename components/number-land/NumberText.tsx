'use client';

import TappableText from '@/components/reading-quest/TappableText';
import { lookupLexicon } from '@/lib/number-land/words';

/** A sentence made of number words and math words. Tap any word to see its sound buttons. */
export default function NumberText({ text, size = 'text-3xl sm:text-4xl' }: { text: string; size?: string }) {
  return <TappableText text={text} lookup={lookupLexicon} size={size} />;
}
