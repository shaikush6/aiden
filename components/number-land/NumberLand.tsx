'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { stopAudio } from '@/lib/audio-player';
import { playMusic, setMusicEnabled, stopMusic } from '@/lib/music-player';
import { prefetchLines } from '@/lib/reading-quest/audio';
import { LEVELS } from '@/lib/reading-quest/catalog';
import { MUSIC_READY, TRACKS, type MusicScene } from '@/lib/reading-quest/music-tracks';
import { getProgress, getServerProgress, nextLevelIndex, subscribeProgress } from '@/lib/reading-quest/progress';
import { NUMBER_LEVELS, type NLevel } from '@/lib/number-land/curriculum';
import { planNumberLevel, type NStep } from '@/lib/number-land/plan';
import { levelPrefetchItems } from '@/lib/number-land/prefetch';
import { getNL, getServerNL, isNLUnlocked, subscribeNL } from '@/lib/number-land/progress';
import { levelScript, type NLScript } from '@/lib/number-land/script';
import BuddyBook from './BuddyBook';
import NumberLevelPlayer from './NumberLevelPlayer';
import NumberMap from './NumberMap';

type View =
  | { name: 'map' }
  | { name: 'book' }
  | { name: 'level'; level: NLevel; steps: NStep[]; script: NLScript; run: number };

/** The words the Word Gym uses: everything he has met in the Reading Quest so far (at least the first levels). */
function questBank() {
  const next = Math.max(2, nextLevelIndex(getProgress()));
  return [...LEVELS[Math.min(next, LEVELS.length - 1)].bank.values()];
}

/** Block Buddy Land: read the number names to wake Block Buddies, then use words to do math. */
export default function NumberLand() {
  const progress = useSyncExternalStore(subscribeNL, getNL, getServerNL);
  const quest = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  const [view, setView] = useState<View>({ name: 'map' });

  // Background music follows the quest's music switch; each town borrows a world's theme.
  const musicOn = MUSIC_READY && quest.settings.music;
  const scene: MusicScene = view.name === 'level' ? (`w${view.level.town + 1}` as MusicScene) : 'map';
  const sceneKey = view.name === 'level' ? `${view.level.id}#${view.run}` : 'map';
  useEffect(() => { setMusicEnabled(musicOn); }, [musicOn]);
  useEffect(() => { if (MUSIC_READY) void playMusic(TRACKS[scene]); }, [scene, sceneKey]);
  useEffect(() => () => { stopMusic(); stopAudio(); }, []);

  const play = (level: NLevel) => {
    stopAudio();
    const steps = planNumberLevel(level, questBank());
    const script = levelScript(level, getProgress().settings.narrator);
    // Warm the audio caches in the background so each clip is ready before it is needed.
    prefetchLines(levelPrefetchItems(steps)).catch(() => {});
    setView(v => ({ name: 'level', level, steps, script, run: v.name === 'level' ? v.run + 1 : 0 }));
  };

  const toMap = () => { stopAudio(); setView({ name: 'map' }); };

  if (view.name === 'level') {
    const idx = NUMBER_LEVELS.indexOf(view.level);
    const next = NUMBER_LEVELS[idx + 1];
    return (
      <NumberLevelPlayer
        key={`${view.level.id}-${view.run}`}
        level={view.level}
        steps={view.steps}
        script={view.script}
        onExit={toMap}
        onReplay={() => play(view.level)}
        onNext={next && isNLUnlocked(progress, idx + 1) ? () => play(next) : null}
      />
    );
  }
  if (view.name === 'book') return <BuddyBook progress={progress} onBack={toMap} />;
  return <NumberMap progress={progress} onPlay={play} onBook={() => { stopAudio(); setView({ name: 'book' }); }} />;
}
