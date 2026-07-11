import type { WeaponId } from './types';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  emoji: string;
  color: string;
  glow: string;
  desc: string;
  fireRate: number;  // seconds between shots (ignored by beam)
  damage: number;    // per bolt, or per second for beam
  speed: number;     // bolt speed, units/s
  splash: number;    // splash radius on impact
  kind: 'bolt' | 'spread' | 'orb' | 'beam';
  unlockAfterZone: number; // -1 = always unlocked
}

export const WEAPONS: WeaponDef[] = [
  {
    id: 'blaster',
    name: 'Zap Blaster',
    emoji: '🔫',
    color: '#fde047',
    glow: '#facc15',
    desc: 'Fast zappy bolts!',
    fireRate: 0.22,
    damage: 1,
    speed: 620,
    splash: 0,
    kind: 'bolt',
    unlockAfterZone: -1,
  },
  {
    id: 'spread',
    name: 'Triple Splitter',
    emoji: '🎇',
    color: '#4ade80',
    glow: '#22c55e',
    desc: 'Three shots at once!',
    fireRate: 0.34,
    damage: 1,
    speed: 540,
    splash: 0,
    kind: 'spread',
    unlockAfterZone: 0,
  },
  {
    id: 'plasma',
    name: 'Mega Plasma',
    emoji: '🟣',
    color: '#c084fc',
    glow: '#a855f7',
    desc: 'BIG boom ball!',
    fireRate: 0.62,
    damage: 3,
    speed: 320,
    splash: 95,
    kind: 'orb',
    unlockAfterZone: 1,
  },
  {
    id: 'rainbow',
    name: 'Rainbow Beam',
    emoji: '🌈',
    color: '#f472b6',
    glow: '#ec4899',
    desc: 'Hold to melt everything!',
    fireRate: 0,
    damage: 7, // per second
    speed: 0,
    splash: 0,
    kind: 'beam',
    unlockAfterZone: 2,
  },
];

export function getWeapon(id: WeaponId): WeaponDef {
  return WEAPONS.find((w) => w.id === id) ?? WEAPONS[0];
}
