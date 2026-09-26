// Background music for the quest, made in Suno. Files in /public/music are loudness-normalized
// to about -27 LUFS (well under the voice) with soft fades at both ends so they loop gently.
// Set MUSIC_READY to false to switch all quest music off and hide the music switch.

export const MUSIC_READY = true

export type MusicScene = 'map' | `w${number}`

export interface Track { src: string; loop: boolean }

const ADVENTURE_A: Track = { src: '/music/adventure-a.m4a', loop: true }
const ADVENTURE_B: Track = { src: '/music/adventure-b.m4a', loop: true }

/** The two themes alternate world by world, so the music changes as the child travels the map. */
export const TRACKS: Record<MusicScene, Track> = {
  map: ADVENTURE_A,
  w1: ADVENTURE_A,
  w2: ADVENTURE_B,
  w3: ADVENTURE_A,
  w4: ADVENTURE_B,
  w5: ADVENTURE_A,
  w6: ADVENTURE_B,
  w7: ADVENTURE_A,
  w8: ADVENTURE_B,
  w9: ADVENTURE_A,
  w10: ADVENTURE_B,
}
