'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { stopAudio } from '@/lib/audio-player';
import { playMusic, setMusicEnabled, stopMusic } from '@/lib/music-player';
import { LEVELS, type LevelInfo } from '@/lib/reading-quest/catalog';
import { levelLines, sharedLines } from '@/lib/reading-quest/allowlist';
import { prefetchLines } from '@/lib/reading-quest/audio';
import { LINES, rescuedLine } from '@/lib/reading-quest/lines';
import { MUSIC_READY, TRACKS, type MusicScene } from '@/lib/reading-quest/music-tracks';
import { MISSION_DONE, MISSION_START, pickLine, STORY_START, WORLD_NARRATION } from '@/lib/reading-quest/narration';
import { planLevel, type Step } from '@/lib/reading-quest/plan';
import { getProgress, getServerProgress, isUnlocked, subscribeProgress } from '@/lib/reading-quest/progress';
import CardAlbum from './CardAlbum';
import LevelPlayer from './LevelPlayer';
import ParentPanel from './ParentPanel';
import QuestMap from './QuestMap';
import Reserve from './Reserve';

type View =
  | { name: 'map' }
  | { name: 'cards' }
  | { name: 'reserve' }
  | { name: 'parent'; gate: { a: number; b: number } }
  | { name: 'level'; level: LevelInfo; steps: Step[]; run: number; script: LevelScript };

/** What is spoken when a level opens, when its story starts (extra lines before the usual intro), and when it is won. */
export interface LevelScript { intro: string[]; outro: string[]; storyIntro: string[] }

/** Picked once per play (in an event handler), so the narrator varies but rendering stays pure. */
function scriptFor(level: LevelInfo, narrator: boolean): LevelScript {
  const { animal } = level.def;
  const firstOfWorld = level.world.levels[0].id === level.def.id;
  const world = WORLD_NARRATION[level.world.id];
  if (!narrator) {
    return {
      intro: firstOfWorld ? [level.world.intro, animal.rescue] : [animal.rescue],
      outro: [LINES.levelDone, rescuedLine(animal.name)],
      storyIntro: [],
    };
  }
  return {
    intro: [firstOfWorld && world ? world.arrive : pickLine(MISSION_START), animal.rescue],
    outro: level.isBoss && world
      ? [rescuedLine(animal.name), world.complete]
      : [pickLine(MISSION_DONE), rescuedLine(animal.name)],
    storyIntro: [STORY_START],
  };
}

/** Reading Quest: a phonics adventure from single sounds to fluent reading. */
export default function ReadingQuest() {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  const [view, setView] = useState<View>({ name: 'map' });

  // Background music follows the scene: the map theme, or the current world's theme.
  const musicOn = MUSIC_READY && progress.settings.music;
  const scene: MusicScene = view.name === 'level' ? (view.level.world.id as MusicScene) : 'map';
  const sceneKey = view.name === 'level' ? `${view.level.def.id}#${view.run}` : 'map';
  useEffect(() => { setMusicEnabled(musicOn); }, [musicOn]);
  useEffect(() => { if (MUSIC_READY) void playMusic(TRACKS[scene]); }, [scene, sceneKey]);
  useEffect(() => () => stopMusic(), []);

  const play = (level: LevelInfo) => {
    stopAudio();
    const current = getProgress();
    const script = scriptFor(level, current.settings.narrator);
    const steps = planLevel(level, current);
    // Warm the audio caches in the background so each clip is ready before it is needed.
    prefetchLines([...levelLines(level), ...sharedLines()]).catch(() => {});
    setView(v => ({ name: 'level', level, steps, script, run: v.name === 'level' ? v.run + 1 : 0 }));
  };

  const toMap = () => { stopAudio(); setView({ name: 'map' }); };

  if (view.name === 'level') {
    const next = LEVELS[view.level.index + 1];
    return (
      <LevelPlayer
        key={`${view.level.def.id}-${view.run}`}
        level={view.level}
        steps={view.steps}
        script={view.script}
        onExit={toMap}
        onReplay={() => play(view.level)}
        onNext={next && isUnlocked(progress, next.index) ? () => play(next) : null}
      />
    );
  }
  if (view.name === 'cards') return <CardAlbum progress={progress} onBack={toMap} />;
  if (view.name === 'reserve') return <Reserve progress={progress} onBack={toMap} />;
  if (view.name === 'parent') return <ParentPanel progress={progress} gate={view.gate} onClose={toMap} />;

  return (
    <QuestMap
      progress={progress}
      onPlay={play}
      onCards={() => { stopAudio(); setView({ name: 'cards' }); }}
      onReserve={() => { stopAudio(); setView({ name: 'reserve' }); }}
      onParent={() => {
        stopAudio();
        const n = () => 6 + Math.floor(Math.random() * 4);
        setView({ name: 'parent', gate: { a: n(), b: n() } });
      }}
    />
  );
}
