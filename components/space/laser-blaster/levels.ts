import type { EnemyKind } from './types';

export interface ZoneDef {
  name: string;
  sub: string;
  bgTop: string;
  bgBottom: string;
  nebula: string;
  planet: 'earth' | 'moon' | 'mars' | 'belt' | 'jupiter' | 'galaxy';
  waves: number;
  enemiesPerWave: number;
  spawnEvery: number; // seconds between spawns
  speed: number;      // enemy speed multiplier
  mix: [EnemyKind, number][]; // kind + weight
  bossHp: number;
}

export const ZONES: ZoneDef[] = [
  {
    name: 'EARTH ORBIT',
    sub: 'Blast off, Captain! 🚀',
    bgTop: '#0b1437',
    bgBottom: '#1e1b4b',
    nebula: 'rgba(99,102,241,0.16)',
    planet: 'earth',
    waves: 2,
    enemiesPerWave: 6,
    spawnEvery: 2.1,
    speed: 0.8,
    mix: [['rocky', 5], ['jelly', 2]],
    bossHp: 12,
  },
  {
    name: 'MOON BASE',
    sub: 'Watch for space jellies! 👾',
    bgTop: '#111827',
    bgBottom: '#312e81',
    nebula: 'rgba(148,163,184,0.14)',
    planet: 'moon',
    waves: 2,
    enemiesPerWave: 8,
    spawnEvery: 1.9,
    speed: 0.95,
    mix: [['rocky', 4], ['jelly', 3], ['ufo', 1]],
    bossHp: 16,
  },
  {
    name: 'MARS ZONE',
    sub: 'The red planet! 🔴',
    bgTop: '#1c1017',
    bgBottom: '#451a03',
    nebula: 'rgba(239,68,68,0.13)',
    planet: 'mars',
    waves: 3,
    enemiesPerWave: 8,
    spawnEvery: 1.7,
    speed: 1.1,
    mix: [['rocky', 4], ['icy', 3], ['ufo', 2]],
    bossHp: 22,
  },
  {
    name: 'ASTEROID BELT',
    sub: 'Rocks everywhere! ⚠️',
    bgTop: '#0c0a09',
    bgBottom: '#292524',
    nebula: 'rgba(245,158,11,0.12)',
    planet: 'belt',
    waves: 3,
    enemiesPerWave: 10,
    spawnEvery: 1.45,
    speed: 1.25,
    mix: [['rocky', 4], ['icy', 4], ['metal', 2], ['jelly', 1]],
    bossHp: 30,
  },
  {
    name: 'JUPITER STORM',
    sub: 'The giant planet! 🟠',
    bgTop: '#170a02',
    bgBottom: '#7c2d12',
    nebula: 'rgba(251,146,60,0.14)',
    planet: 'jupiter',
    waves: 3,
    enemiesPerWave: 11,
    spawnEvery: 1.3,
    speed: 1.45,
    mix: [['icy', 3], ['metal', 3], ['ufo', 3]],
    bossHp: 40,
  },
  {
    name: 'DEEP SPACE',
    sub: 'The final frontier! 🌌',
    bgTop: '#09090b',
    bgBottom: '#2e1065',
    nebula: 'rgba(168,85,247,0.18)',
    planet: 'galaxy',
    waves: 4,
    enemiesPerWave: 12,
    spawnEvery: 1.15,
    speed: 1.65,
    mix: [['icy', 2], ['metal', 4], ['ufo', 4], ['jelly', 1]],
    bossHp: 55,
  },
];

export const ENEMY_STATS: Record<
  EnemyKind,
  { hp: number; r: number; worth: number; speed: number; wobbleAmp: number; wobbleSpd: number }
> = {
  rocky: { hp: 1, r: 22, worth: 10, speed: 62, wobbleAmp: 8, wobbleSpd: 1.2 },
  icy:   { hp: 2, r: 25, worth: 20, speed: 55, wobbleAmp: 12, wobbleSpd: 1.6 },
  metal: { hp: 3, r: 19, worth: 30, speed: 70, wobbleAmp: 6, wobbleSpd: 1.0 },
  ufo:   { hp: 2, r: 26, worth: 50, speed: 78, wobbleAmp: 65, wobbleSpd: 2.2 },
  jelly: { hp: 1, r: 27, worth: 15, speed: 42, wobbleAmp: 26, wobbleSpd: 3.0 },
};
