'use client';

import { useState, useSyncExternalStore } from 'react';
import LevelPicker from '@/components/profile/LevelPicker';
import { getAdminPrefs, getServerAdminPrefs, setAdminPrefs, subscribeAdminPrefs } from '@/lib/admin-prefs';
import { askStartingPointAgain } from '@/lib/profile/client';
import { completeUpTo, getProgress, getServerProgress, nextLevelIndex, resetProgress, setUnlockAll, subscribeProgress } from '@/lib/reading-quest/progress';
import { completeNLUpTo, getNL, getServerNL, nextNLIndex, resetNL, setNLUnlockAll, subscribeNL } from '@/lib/number-land/progress';
import { Btn, Card, Note, Toggle } from './ui';

/** Tools for testing the games with the admin's own account. Everything here changes only this account. */
export default function TestingTools({ onClose }: { onClose: () => void }) {
  const quest = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  const land = useSyncExternalStore(subscribeNL, getNL, getServerNL);
  const prefs = useSyncExternalStore(subscribeAdminPrefs, getAdminPrefs, getServerAdminPrefs);
  const [questNext, setQuestNext] = useState(() => nextLevelIndex(getProgress()));
  const [landNext, setLandNext] = useState(() => nextNLIndex(getNL()));
  const [confirmReset, setConfirmReset] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const jump = () => {
    // Exactly the levels before the picked ones count as done; anything later is cleared.
    resetProgress();
    completeUpTo(questNext);
    resetNL();
    completeNLUpTo(landNext);
    setNote('Done. Your next levels are set.');
  };

  const resetAll = () => {
    resetProgress();
    resetNL();
    setQuestNext(0);
    setLandNext(0);
    setConfirmReset(false);
    setNote('Your progress is reset. Your sound settings are kept.');
  };

  return (
    <div className="flex flex-col gap-4">
      <Card title="Shortcuts while playing">
        <Toggle label="Unlock every Reading Quest level" on={quest.unlockAll} onChange={setUnlockAll} />
        <Toggle label="Unlock every Block Buddy Land level" on={land.unlockAll} onChange={setNLUnlockAll} />
        <Toggle label="⏭ Skip button on every question" hint="Only you see it. It counts the question as right." on={prefs.skip} onChange={skip => setAdminPrefs({ skip })} />
      </Card>

      <Card title="Jump to a level" hint="Pick the level to play next in each game. Everything before it becomes done, and anything after it is cleared.">
        <div className="flex flex-col items-center gap-3 text-center">
          <LevelPicker questNext={questNext} landNext={landNext} onQuest={setQuestNext} onLand={setLandNext} />
          <Btn tone="primary" onClick={jump}>Set my next levels</Btn>
        </div>
      </Card>

      <Card title="Start over">
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => { askStartingPointAgain(); onClose(); }}>Show the &ldquo;where were you?&rdquo; screen again</Btn>
          {confirmReset ? (
            <>
              <Btn tone="danger" onClick={resetAll}>Yes, reset my progress</Btn>
              <Btn onClick={() => setConfirmReset(false)}>Cancel</Btn>
            </>
          ) : (
            <Btn tone="danger" onClick={() => setConfirmReset(true)}>Reset my progress in both games</Btn>
          )}
        </div>
      </Card>
      <Note text={note} />
    </div>
  );
}
