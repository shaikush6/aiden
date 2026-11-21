'use client';

import { useSyncExternalStore } from 'react';
import { getAdminPrefs, getServerAdminPrefs, subscribeAdminPrefs } from '@/lib/admin-prefs';
import { stopAudio } from '@/lib/audio-player';
import { getProfileState, subscribeProfile } from '@/lib/profile/client';

/** Admin testing: move past the current question as if it were answered right. Nobody else ever sees it. */
export default function SkipButton({ onSkip }: { onSkip: () => void }) {
  const admin = useSyncExternalStore(subscribeProfile, () => getProfileState().admin, () => false);
  const { skip } = useSyncExternalStore(subscribeAdminPrefs, getAdminPrefs, getServerAdminPrefs);
  if (!admin || !skip) return null;
  return (
    <div className="flex justify-center mt-4">
      <button
        type="button"
        onClick={() => { stopAudio(); onSkip(); }}
        className="text-xs font-bold rounded-full px-3 py-1.5 bg-slate-800/70 text-white"
        title="Admin only"
      >
        ⏭ Skip (admin)
      </button>
    </div>
  );
}
