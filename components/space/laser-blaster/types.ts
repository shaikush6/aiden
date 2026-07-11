// Shared types and constants for the Laser Blaster game.
// Logical coordinate space — the renderer scales this to the actual canvas size.
export const W = 800;
export const H = 480;

export type WeaponId = 'blaster' | 'spread' | 'plasma' | 'rainbow';
export type EnemyKind = 'rocky' | 'icy' | 'metal' | 'ufo' | 'jelly';
export type PowerKind = 'rapid' | 'shield' | 'heart' | 'star';
export type GameMode = 'flying' | 'boss' | 'cleared' | 'gameover';

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  r: number;
  weapon: WeaponId;
  splash: number; // splash radius, 0 = none
}

export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  baseY: number;
  speed: number;
  hp: number;
  maxHp: number;
  r: number;
  rot: number;
  rotSpd: number;
  wobbleAmp: number;
  wobbleSpd: number;
  phase: number;
  seed: number;
  flash: number; // white flash timer after being hit
  worth: number; // score value
}

export interface Boss {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  r: number;
  t: number;
  flash: number;
  lungeT: number;    // 0 = idle; >0 = mid-lunge
  nextLunge: number; // countdown to next lunge
}

export interface Powerup {
  kind: PowerKind;
  x: number;
  y: number;
  t: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  spark: boolean;
}

export interface Popup {
  x: number;
  y: number;
  text: string;
  color: string;
  age: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  tw: number; // twinkle phase
}

export interface Banner {
  text: string;
  sub: string;
  t: number; // remaining seconds
  max: number;
}

export interface Ship {
  x: number;
  y: number;
  tilt: number;
  invuln: number; // seconds of invulnerability after a hit
  shield: boolean;
}

export interface InputState {
  keys: Set<string>;
  firing: boolean;
  pointer: { x: number; y: number } | null; // logical coords, when dragging
}

export interface HudSnapshot {
  score: number;
  lives: number;
  mult: number;
  zone: number;
  weapon: WeaponId;
  unlocked: WeaponId[];
  rapid: boolean;
  shield: boolean;
  bossHp: number; // -1 when no boss
  bossMax: number;
}

export interface ZoneResult {
  zoneIndex: number;
  stars: number; // 1-3
  score: number;
  unlockedWeapon: WeaponId | null;
  finalZone: boolean;
}

export interface SaveData {
  highScore: number;
  unlocked: WeaponId[];
  zoneStars: number[]; // best stars per zone
}

export const MAX_LIVES = 5;
export const MAX_PARTICLES = 350;

const SAVE_KEY = 'aiden-laser-blaster-v2';

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const d = JSON.parse(raw) as SaveData;
      return {
        highScore: d.highScore || 0,
        unlocked: Array.isArray(d.unlocked) && d.unlocked.length ? d.unlocked : ['blaster'],
        zoneStars: Array.isArray(d.zoneStars) ? d.zoneStars : [],
      };
    }
  } catch { /* storage unavailable — fall through to defaults */ }
  return { highScore: 0, unlocked: ['blaster'], zoneStars: [] };
}

export function persistSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch { /* storage unavailable — high scores just won't persist */ }
}
