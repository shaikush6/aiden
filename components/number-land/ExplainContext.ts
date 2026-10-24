'use client';

import { createContext, useContext } from 'react';
import type { Topic } from '@/lib/number-land/terms';

export interface ExplainApi {
  /** Play the lesson for a topic in an overlay ("Kit, explain this to me"). */
  open: (topic: Topic) => void;
}

export const ExplainContext = createContext<ExplainApi>({ open: () => {} });

export const useExplain = (): ExplainApi => useContext(ExplainContext);
