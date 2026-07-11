// Pure game logic — no React, no canvas. The component drives update(), the
// renderer reads the state. All entity arrays are bounded (see MAX_PARTICLES).
import {
  W, H, MAX_LIVES, MAX_PARTICLES,
  type Bullet, type Enemy, type Boss, type Powerup, type Particle, type Popup,
  type Star, type Banner, type Ship, type InputState, type GameMode,
  type WeaponId, type EnemyKind, type PowerKind, type HudSnapshot, type ZoneResult,
} from './types';
import { getWeapon } from './weapons';
import { ZONES, ENEMY_STATS, type ZoneDef } from './levels';
import type { SoundFX } from './audio';

const SHIP_R = 20;
const SHIP_SPEED = 300;
const SHIP_MAX_X = W * 0.55;

export interface EngineCallbacks {
  onHud: (hud: HudSnapshot) => void;
  onZoneCleared: (result: ZoneResult) => void;
  onGameOver: (score: number) => void;
  onUnlock: (weapon: WeaponId) => void;
}

export interface EngineState {
  mode: GameMode;
  t: number;
  zoneIndex: number;
  zone: ZoneDef;
  wave: number;           // 0-based
  toSpawn: number;        // enemies left to spawn this wave
  spawnCooldown: number;
  ship: Ship;
  weapon: WeaponId;
  unlocked: WeaponId[];
  bullets: Bullet[];
  enemies: Enemy[];
  boss: Boss | null;
  powerups: Powerup[];
  particles: Particle[];
  popups: Popup[];
  starLayers: Star[][];
  banner: Banner | null;
  score: number;
  lives: number;
  streak: number;
  damageTaken: number;    // this zone — determines star rating
  fireCooldown: number;
  rapidUntil: number;
  beamOn: boolean;
  shake: number;
  clearedTimer: number;   // celebration countdown before the callback fires
  pendingResult: ZoneResult | null;
  idSeq: number;
}

export class Engine {
  state: EngineState;
  input: InputState = { keys: new Set(), firing: false, pointer: null };
  paused = false;
  private cb: EngineCallbacks;
  private fx: SoundFX;
  private hudDirty = true;

  constructor(zoneIndex: number, weapon: WeaponId, unlocked: WeaponId[], fx: SoundFX, cb: EngineCallbacks) {
    this.fx = fx;
    this.cb = cb;
    this.state = {
      mode: 'flying',
      t: 0,
      zoneIndex,
      zone: ZONES[zoneIndex],
      wave: 0,
      toSpawn: ZONES[zoneIndex].enemiesPerWave,
      spawnCooldown: 1.2,
      ship: { x: 110, y: H / 2, tilt: 0, invuln: 0, shield: false },
      weapon,
      unlocked,
      bullets: [],
      enemies: [],
      boss: null,
      powerups: [],
      particles: [],
      popups: [],
      starLayers: makeStars(),
      banner: { text: ZONES[zoneIndex].name, sub: ZONES[zoneIndex].sub, t: 2.4, max: 2.4 },
      score: 0,
      lives: MAX_LIVES,
      streak: 0,
      damageTaken: 0,
      fireCooldown: 0,
      rapidUntil: 0,
      beamOn: false,
      shake: 0,
      clearedTimer: 0,
      pendingResult: null,
      idSeq: 0,
    };
  }

  /** Start the next zone, carrying score and weapons over. Hearts refill. */
  startZone(zoneIndex: number) {
    const s = this.state;
    s.mode = 'flying';
    s.zoneIndex = zoneIndex;
    s.zone = ZONES[zoneIndex];
    s.wave = 0;
    s.toSpawn = s.zone.enemiesPerWave;
    s.spawnCooldown = 1.2;
    s.ship = { x: 110, y: H / 2, tilt: 0, invuln: 0, shield: false };
    s.bullets = [];
    s.enemies = [];
    s.boss = null;
    s.powerups = [];
    s.particles = [];
    s.popups = [];
    s.banner = { text: s.zone.name, sub: s.zone.sub, t: 2.4, max: 2.4 };
    s.lives = MAX_LIVES;
    s.streak = 0;
    s.damageTaken = 0;
    s.fireCooldown = 0;
    s.rapidUntil = 0;
    s.beamOn = false;
    s.shake = 0;
    s.clearedTimer = 0;
    s.pendingResult = null;
    this.hudDirty = true;
  }

  setWeapon(id: WeaponId) {
    if (this.state.unlocked.includes(id) && this.state.weapon !== id) {
      this.state.weapon = id;
      this.fx.play('click');
      this.hudDirty = true;
    }
  }

  get mult() {
    return Math.min(5, 1 + Math.floor(this.state.streak / 5));
  }

  update(dt: number) {
    if (this.paused) return;
    const s = this.state;
    dt = Math.max(0, Math.min(dt, 0.033)); // clamp: huge frame gaps and clock jumps both break physics
    s.t += dt;

    if (s.banner && (s.banner.t -= dt) <= 0) s.banner = null;
    if (s.shake > 0) s.shake = Math.max(0, s.shake - dt * 18);

    this.updateStars(dt);
    this.updateParticles(dt);
    this.updatePopups(dt);

    if (s.mode === 'cleared' || s.mode === 'gameover') {
      // celebration fireworks keep running, gameplay is frozen
      if (s.mode === 'cleared') {
        if (Math.random() < dt * 3) this.firework();
        if ((s.clearedTimer -= dt) <= 0 && s.pendingResult) {
          const r = s.pendingResult;
          s.pendingResult = null;
          this.cb.onZoneCleared(r);
        }
      }
      return;
    }

    this.updateShip(dt);
    this.updateFiring(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updateSpawning(dt);
    if (s.boss) this.updateBoss(dt);
    this.updatePowerups(dt);
    this.collide();

    if (this.hudDirty) {
      this.hudDirty = false;
      this.cb.onHud(this.hud());
    }
  }

  hud(): HudSnapshot {
    const s = this.state;
    return {
      score: s.score,
      lives: s.lives,
      mult: this.mult,
      zone: s.zoneIndex,
      weapon: s.weapon,
      unlocked: [...s.unlocked],
      rapid: s.t < s.rapidUntil,
      shield: s.ship.shield,
      bossHp: s.boss ? s.boss.hp : -1,
      bossMax: s.boss ? s.boss.maxHp : 0,
    };
  }

  // ---------- ship & input ----------

  private updateShip(dt: number) {
    const s = this.state;
    const keys = this.input.keys;
    let dx = 0;
    let dy = 0;
    if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;

    if (this.input.pointer) {
      // trackpad/touch drag — ease toward the pointer
      const p = this.input.pointer;
      s.ship.x += (Math.min(p.x, SHIP_MAX_X) - s.ship.x) * Math.min(1, dt * 10);
      s.ship.y += (p.y - s.ship.y) * Math.min(1, dt * 10);
      s.ship.tilt += ((p.y - s.ship.y) * 0.004 - s.ship.tilt) * Math.min(1, dt * 8);
    } else {
      s.ship.x += dx * SHIP_SPEED * dt;
      s.ship.y += dy * SHIP_SPEED * dt;
      s.ship.tilt += (dy * 0.35 - s.ship.tilt) * Math.min(1, dt * 8);
    }
    s.ship.x = clamp(s.ship.x, 50, SHIP_MAX_X);
    s.ship.y = clamp(s.ship.y, 44, H - 44);
    if (s.ship.invuln > 0) s.ship.invuln -= dt;

    // engine exhaust trail
    if (Math.random() < dt * 40) {
      this.spawnParticle(
        s.ship.x - 26, s.ship.y + rand(-4, 4),
        rand(-160, -90), rand(-15, 15),
        rand(0.25, 0.5), rand(2.5, 5),
        Math.random() < 0.5 ? '#fb923c' : '#facc15', false
      );
    }
  }

  private updateFiring(dt: number) {
    const s = this.state;
    const w = getWeapon(s.weapon);
    const firing = this.input.firing || this.input.keys.has('Space');

    if (w.kind === 'beam') {
      if (firing !== s.beamOn) {
        s.beamOn = firing;
        if (firing) this.fx.startBeam();
        else this.fx.stopBeam();
      }
      if (s.beamOn) this.applyBeam(dt);
      return;
    }
    if (s.beamOn) { s.beamOn = false; this.fx.stopBeam(); }

    s.fireCooldown -= dt;
    if (firing && s.fireCooldown <= 0) {
      const rapid = s.t < s.rapidUntil;
      s.fireCooldown = w.fireRate * (rapid ? 0.5 : 1);
      this.fireBolt(w.kind === 'spread' ? [-0.24, 0, 0.24] : [0]);
      this.fx.fire(s.weapon);
      // muzzle flash
      for (let i = 0; i < 4; i++) {
        this.spawnParticle(
          s.ship.x + 30, s.ship.y,
          rand(60, 220), rand(-60, 60),
          rand(0.06, 0.14), rand(2, 4), w.color, true
        );
      }
    }
  }

  private fireBolt(angles: number[]) {
    const s = this.state;
    const w = getWeapon(s.weapon);
    for (const a of angles) {
      s.bullets.push({
        x: s.ship.x + 28,
        y: s.ship.y,
        vx: Math.cos(a) * w.speed,
        vy: Math.sin(a) * w.speed,
        damage: w.damage,
        r: w.kind === 'orb' ? 13 : 5,
        weapon: s.weapon,
        splash: w.splash,
      });
    }
  }

  /** Rainbow beam: continuous damage to the first enemy (or boss) in its path. */
  private applyBeam(dt: number) {
    const s = this.state;
    const w = getWeapon('rainbow');
    const sy = s.ship.y;
    const sx = s.ship.x + 28;
    let target: Enemy | null = null;
    for (const e of s.enemies) {
      if (e.x > sx && Math.abs(e.y - sy) < e.r + 10) {
        if (!target || e.x < target.x) target = e;
      }
    }
    const bossHit = s.boss && s.boss.x > sx && Math.abs(s.boss.y - sy) < s.boss.r + 10;
    const impactX = target && (!bossHit || target.x < s.boss!.x) ? target.x : bossHit ? s.boss!.x : W;

    // sparkles at the impact point
    if (impactX < W && Math.random() < dt * 30) {
      this.spawnParticle(impactX, sy + rand(-10, 10), rand(-60, 60), rand(-90, 90),
        rand(0.15, 0.35), rand(2, 4), rainbowColor(s.t * 4 + Math.random()), true);
    }

    if (target && (!bossHit || target.x < s.boss!.x)) {
      this.damageEnemy(target, w.damage * dt, false);
    } else if (bossHit) {
      this.damageBoss(w.damage * dt);
    }
  }

  // ---------- bullets ----------

  private updateBullets(dt: number) {
    const s = this.state;
    s.bullets = s.bullets.filter((b) => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      return b.x < W + 30 && b.y > -20 && b.y < H + 20;
    });
  }

  // ---------- enemies & waves ----------

  private updateSpawning(dt: number) {
    const s = this.state;
    if (s.mode !== 'flying') return;

    if (s.toSpawn > 0) {
      s.spawnCooldown -= dt;
      if (s.spawnCooldown <= 0) {
        s.spawnCooldown = s.zone.spawnEvery * rand(0.75, 1.25);
        s.toSpawn--;
        this.spawnEnemy();
      }
    } else if (s.enemies.length === 0) {
      // wave cleared
      s.wave++;
      if (s.wave >= s.zone.waves) {
        s.mode = 'boss';
        s.banner = { text: 'BOSS TIME! 👾', sub: 'The mothership is here!', t: 2.2, max: 2.2 };
        s.boss = {
          x: W + 90, y: H / 2, hp: s.zone.bossHp, maxHp: s.zone.bossHp,
          r: 58, t: 0, flash: 0, lungeT: 0, nextLunge: 5,
        };
        this.fx.play('levelup');
        this.hudDirty = true;
      } else {
        s.toSpawn = s.zone.enemiesPerWave;
        s.spawnCooldown = 1.6;
        s.banner = { text: `WAVE ${s.wave + 1}`, sub: 'Here they come!', t: 1.6, max: 1.6 };
        // mid-zone gift
        if (s.powerups.length === 0) this.spawnPowerup();
      }
    }
  }

  private spawnEnemy() {
    const s = this.state;
    const kind = pickWeighted(s.zone.mix);
    const st = ENEMY_STATS[kind];
    const baseY = rand(60, H - 60);
    s.enemies.push({
      id: ++s.idSeq,
      kind,
      x: W + 40,
      y: baseY,
      baseY,
      speed: st.speed * s.zone.speed,
      hp: st.hp,
      maxHp: st.hp,
      r: st.r,
      rot: rand(0, Math.PI * 2),
      rotSpd: rand(-1.2, 1.2),
      wobbleAmp: st.wobbleAmp,
      wobbleSpd: st.wobbleSpd,
      phase: rand(0, Math.PI * 2),
      seed: Math.random() * 1000,
      flash: 0,
      worth: st.worth,
    });
  }

  private updateEnemies(dt: number) {
    const s = this.state;
    s.enemies = s.enemies.filter((e) => {
      e.x -= e.speed * dt;
      e.rot += e.rotSpd * dt;
      e.y = e.baseY + Math.sin(s.t * e.wobbleSpd + e.phase) * e.wobbleAmp;
      e.y = clamp(e.y, 40, H - 40);
      if (e.flash > 0) e.flash -= dt;
      if (e.x < -50) {
        // escaped — no penalty for a young pilot, but the combo streak resets
        s.streak = 0;
        this.hudDirty = true;
        return false;
      }
      return true;
    });
  }

  private updateBoss(dt: number) {
    const s = this.state;
    const b = s.boss!;
    b.t += dt;
    if (b.flash > 0) b.flash -= dt;

    const homeX = W - 130;
    if (b.x > homeX && b.lungeT <= 0) {
      b.x -= 120 * dt; // entrance glide
    }

    b.y = H / 2 + Math.sin(b.t * 0.9) * (H / 2 - 90);

    // periodic playful lunge toward the player side
    if (b.lungeT > 0) {
      b.lungeT -= dt;
      const k = b.lungeT / 1.6; // 1 → 0
      b.x = homeX - Math.sin((1 - k) * Math.PI) * 240;
      if (b.lungeT <= 0) b.x = homeX;
    } else {
      b.nextLunge -= dt;
      if (b.nextLunge <= 0) {
        b.nextLunge = rand(4.5, 7);
        b.lungeT = 1.6;
      }
    }
  }

  private spawnPowerup() {
    const s = this.state;
    const kinds: PowerKind[] = ['rapid', 'shield', 'heart', 'star'];
    const kind = s.lives < 3 && Math.random() < 0.5 ? 'heart' : kinds[Math.floor(Math.random() * kinds.length)];
    s.powerups.push({ kind, x: W + 30, y: rand(80, H - 80), t: rand(0, Math.PI * 2) });
  }

  private updatePowerups(dt: number) {
    const s = this.state;
    s.powerups = s.powerups.filter((p) => {
      p.x -= 55 * dt;
      p.t += dt;
      return p.x > -40;
    });
  }

  // ---------- collisions & damage ----------

  private collide() {
    const s = this.state;

    // bullets vs enemies / boss
    s.bullets = s.bullets.filter((b) => {
      for (const e of s.enemies) {
        if (e.hp > 0 && dist2(b.x, b.y, e.x, e.y) < sq(b.r + e.r)) {
          this.impact(b, e.x, e.y);
          this.damageEnemy(e, b.damage, true);
          if (b.splash > 0) this.splash(e.x, e.y, b.splash, b.damage);
          return false;
        }
      }
      if (s.boss && dist2(b.x, b.y, s.boss.x, s.boss.y) < sq(b.r + s.boss.r)) {
        this.impact(b, b.x, b.y);
        this.damageBoss(b.damage);
        if (b.splash > 0) this.splash(b.x, b.y, b.splash, b.damage);
        return false;
      }
      return true;
    });
    s.enemies = s.enemies.filter((e) => e.hp > 0);

    // ship vs enemies
    const ship = s.ship;
    if (ship.invuln <= 0) {
      for (const e of s.enemies) {
        if (dist2(ship.x, ship.y, e.x, e.y) < sq(SHIP_R + e.r - 6)) {
          this.explodeAt(e.x, e.y, e.kind);
          e.hp = 0;
          this.hurtShip();
          break;
        }
      }
      s.enemies = s.enemies.filter((e) => e.hp > 0);
      if (s.boss && ship.invuln <= 0 && dist2(ship.x, ship.y, s.boss.x, s.boss.y) < sq(SHIP_R + s.boss.r - 10)) {
        this.hurtShip();
      }
    }

    // ship vs powerups
    s.powerups = s.powerups.filter((p) => {
      if (dist2(ship.x, ship.y, p.x, p.y) < sq(SHIP_R + 26)) {
        this.collectPowerup(p.kind, p.x, p.y);
        return false;
      }
      return true;
    });
  }

  private impact(b: Bullet, x: number, y: number) {
    const w = getWeapon(b.weapon);
    for (let i = 0; i < 5; i++) {
      this.spawnParticle(x, y, rand(-140, 140), rand(-140, 140), rand(0.1, 0.3), rand(2, 4), w.color, true);
    }
  }

  private splash(x: number, y: number, radius: number, damage: number) {
    const s = this.state;
    for (const e of s.enemies) {
      if (e.hp > 0 && dist2(x, y, e.x, e.y) < sq(radius + e.r)) {
        this.damageEnemy(e, damage, true);
      }
    }
    if (s.boss && dist2(x, y, s.boss.x, s.boss.y) < sq(radius + s.boss.r)) {
      this.damageBoss(damage);
    }
    // shockwave ring
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.spawnParticle(x, y, Math.cos(a) * 260, Math.sin(a) * 260, 0.3, 3.5, '#c084fc', true);
    }
  }

  private damageEnemy(e: Enemy, damage: number, thump: boolean) {
    if (e.hp <= 0) return;
    e.hp -= damage;
    e.flash = 0.1;
    if (e.hp <= 0) {
      this.explodeAt(e.x, e.y, e.kind);
      this.state.streak++;
      const gained = e.worth * this.mult;
      this.state.score += gained;
      this.addPopup(e.x, e.y - e.r, `+${gained}`, '#fde047');
      this.fx.play('explode');
      this.hudDirty = true;
      if (Math.random() < 0.1 && this.state.powerups.length === 0) this.spawnPowerup();
    } else if (thump) {
      this.fx.play('hit');
    }
  }

  private damageBoss(damage: number) {
    const s = this.state;
    const b = s.boss;
    if (!b || b.hp <= 0) return;
    b.hp -= damage;
    b.flash = 0.12;
    this.hudDirty = true;
    if (b.hp <= 0) {
      const gained = 200 * this.mult;
      s.score += gained;
      this.addPopup(b.x, b.y, `+${gained}`, '#fde047');
      for (let i = 0; i < 3; i++) this.explodeAt(b.x + rand(-40, 40), b.y + rand(-30, 30), 'ufo');
      this.fx.play('fanfare');
      s.shake = 8;
      s.boss = null;
      this.finishZone();
    }
  }

  private hurtShip() {
    const s = this.state;
    if (s.ship.shield) {
      s.ship.shield = false;
      s.ship.invuln = 1.5;
      this.addPopup(s.ship.x, s.ship.y - 30, 'SHIELD! 🛡️', '#22d3ee');
      this.fx.play('hit');
      this.hudDirty = true;
      return;
    }
    s.lives--;
    s.streak = 0;
    s.damageTaken++;
    s.ship.invuln = 1.6;
    s.shake = 6;
    this.fx.play('hurt');
    this.hudDirty = true;
    if (s.lives <= 0) {
      s.lives = 0;
      s.mode = 'gameover';
      this.fx.stopBeam();
      this.cb.onGameOver(s.score);
    }
  }

  private collectPowerup(kind: PowerKind, x: number, y: number) {
    const s = this.state;
    this.fx.play('powerup');
    switch (kind) {
      case 'rapid':
        s.rapidUntil = s.t + 8;
        this.addPopup(x, y, 'SUPER SPEED! ⚡', '#fde047');
        break;
      case 'shield':
        s.ship.shield = true;
        this.addPopup(x, y, 'SHIELD ON! 🛡️', '#22d3ee');
        break;
      case 'heart':
        s.lives = Math.min(MAX_LIVES, s.lives + 1);
        this.addPopup(x, y, '+1 ❤️', '#f87171');
        break;
      case 'star': {
        const gained = 100 * this.mult;
        s.score += gained;
        this.addPopup(x, y, `+${gained} 🌟`, '#fde047');
        this.firework();
        break;
      }
    }
    this.hudDirty = true;
  }

  private finishZone() {
    const s = this.state;
    s.mode = 'cleared';
    s.beamOn = false;
    this.fx.stopBeam();
    s.clearedTimer = 2.2;
    const stars = s.damageTaken === 0 ? 3 : s.damageTaken <= 2 ? 2 : 1;
    const finalZone = s.zoneIndex >= ZONES.length - 1;
    let unlocked: WeaponId | null = null;
    for (const w of ['spread', 'plasma', 'rainbow'] as WeaponId[]) {
      if (getWeapon(w).unlockAfterZone === s.zoneIndex && !s.unlocked.includes(w)) {
        s.unlocked = [...s.unlocked, w];
        unlocked = w;
        this.cb.onUnlock(w);
      }
    }
    s.pendingResult = { zoneIndex: s.zoneIndex, stars, score: s.score, unlockedWeapon: unlocked, finalZone };
  }

  // ---------- visual bits ----------

  private explodeAt(x: number, y: number, kind: EnemyKind) {
    const colors: Record<EnemyKind, string[]> = {
      rocky: ['#94a3b8', '#64748b', '#fb923c'],
      icy: ['#bae6fd', '#7dd3fc', '#e0f2fe'],
      metal: ['#f59e0b', '#fbbf24', '#78716c'],
      ufo: ['#4ade80', '#a3e635', '#fde047'],
      jelly: ['#f0abfc', '#e879f9', '#f5d0fe'],
    };
    const palette = colors[kind];
    for (let i = 0; i < 18; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(40, 260);
      this.spawnParticle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.3, 0.7),
        rand(2, 6), palette[i % palette.length], i % 3 === 0);
    }
  }

  private firework() {
    const x = rand(W * 0.2, W * 0.8);
    const y = rand(H * 0.15, H * 0.6);
    const color = rainbowColor(Math.random() * 6);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const sp = rand(90, 220);
      this.spawnParticle(x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(0.5, 0.9), rand(2, 4), color, true);
    }
  }

  private spawnParticle(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, spark: boolean) {
    const arr = this.state.particles;
    if (arr.length >= MAX_PARTICLES) arr.splice(0, arr.length - MAX_PARTICLES + 1);
    arr.push({ x, y, vx, vy, life, maxLife: life, size, color, spark });
  }

  private updateParticles(dt: number) {
    this.state.particles = this.state.particles.filter((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - dt * 2;
      p.vy *= 1 - dt * 2;
      p.life -= dt;
      return p.life > 0;
    });
  }

  private addPopup(x: number, y: number, text: string, color: string) {
    const arr = this.state.popups;
    if (arr.length > 12) arr.shift();
    arr.push({ x, y, text, color, age: 0 });
  }

  private updatePopups(dt: number) {
    this.state.popups = this.state.popups.filter((p) => {
      p.age += dt;
      p.y -= 44 * dt;
      return p.age < 1;
    });
  }

  private updateStars(dt: number) {
    const speeds = [18, 42, 90];
    this.state.starLayers.forEach((layer, i) => {
      for (const st of layer) {
        st.x -= speeds[i] * dt * st.speed;
        if (st.x < -4) { st.x = W + 4; st.y = Math.random() * H; }
      }
    });
  }
}

// ---------- helpers ----------

function makeStars(): Star[][] {
  return [30, 22, 14].map((count) =>
    Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.6 + 0.6,
      speed: Math.random() * 0.5 + 0.75,
      tw: Math.random() * Math.PI * 2,
    }))
  );
}

function pickWeighted(mix: [EnemyKind, number][]): EnemyKind {
  const total = mix.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [kind, w] of mix) {
    roll -= w;
    if (roll <= 0) return kind;
  }
  return mix[0][0];
}

export function rainbowColor(t: number): string {
  return `hsl(${((t * 60) % 360 + 360) % 360}, 95%, 65%)`;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
const dist2 = (x1: number, y1: number, x2: number, y2: number) => sq(x1 - x2) + sq(y1 - y2);
const sq = (n: number) => n * n;
