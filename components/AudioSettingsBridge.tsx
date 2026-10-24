'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { setVoiceVolume } from '@/lib/audio-player';
import { setMusicDucking, setMusicVolume } from '@/lib/music-player';
import { getProgress, getServerProgress, subscribeProgress } from '@/lib/reading-quest/progress';

/** Applies the saved volume mix to the players, wherever in the app he is. Draws nothing. */
export default function AudioSettingsBridge() {
  const { settings } = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  useEffect(() => { setMusicVolume(settings.musicVolume); }, [settings.musicVolume]);
  useEffect(() => { setVoiceVolume(settings.voiceVolume); }, [settings.voiceVolume]);
  useEffect(() => { setMusicDucking(settings.duck); }, [settings.duck]);
  return null;
}
