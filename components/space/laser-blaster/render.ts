// Canvas renderer — reads engine state, draws one frame. No game logic here.
import { W, H, type Enemy, type Boss } from './types';
import { getWeapon } from './weapons';
import { ZONES, type ZoneDef } from './levels';
import { rainbowColor, type EngineState } from './engine';

export function render(ctx: CanvasRenderingContext2D, s: EngineState) {
  ctx.save();
  if (s.shake > 0) {
    ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
  }

  drawBackground(ctx, s);
  drawPowerups(ctx, s);
  for (const e of s.enemies) drawEnemy(ctx, e, s.t);
  if (s.boss) drawBoss(ctx, s.boss);
  drawBullets(ctx, s);
  if (s.beamOn && s.mode !== 'cleared' && s.mode !== 'gameover') drawBeam(ctx, s);
  if (s.mode !== 'gameover') drawShip(ctx, s);
  drawParticles(ctx, s);
  drawPopups(ctx, s);
  if (s.banner) drawBanner(ctx, s);

  ctx.restore();
}

// ---------- background ----------

function drawBackground(ctx: CanvasRenderingContext2D, s: EngineState) {
  const z = s.zone;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, z.bgTop);
  grad.addColorStop(1, z.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(-10, -10, W + 20, H + 20);

  // soft nebula blobs
  for (let i = 0; i < 3; i++) {
    const nx = ((i * 313 + s.t * 6) % (W + 300)) - 150;
    const ny = 80 + i * 140;
    const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, 170);
    ng.addColorStop(0, z.nebula);
    ng.addColorStop(1, 'transparent');
    ctx.fillStyle = ng;
    ctx.fillRect(nx - 170, ny - 170, 340, 340);
  }

  drawPlanet(ctx, z, s.t);

  // parallax stars with twinkle
  const alphas = [0.4, 0.65, 1];
  s.starLayers.forEach((layer, i) => {
    for (const st of layer) {
      const tw = 0.6 + 0.4 * Math.sin(s.t * 2 + st.tw);
      ctx.globalAlpha = alphas[i] * tw;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
}

function drawPlanet(ctx: CanvasRenderingContext2D, z: ZoneDef, t: number) {
  const x = W - 130;
  const y = 92;
  ctx.save();
  ctx.globalAlpha = 0.9;
  switch (z.planet) {
    case 'earth': {
      circle(ctx, x, y, 46, '#2563eb');
      ctx.globalAlpha = 0.7;
      circle(ctx, x - 14, y - 8, 15, '#4ade80');
      circle(ctx, x + 16, y + 14, 11, '#4ade80');
      ctx.globalAlpha = 0.5;
      circle(ctx, x + 6, y - 18, 13, '#f8fafc');
      break;
    }
    case 'moon': {
      circle(ctx, x, y, 40, '#cbd5e1');
      ctx.globalAlpha = 0.4;
      circle(ctx, x - 12, y - 6, 9, '#94a3b8');
      circle(ctx, x + 14, y + 10, 6, '#94a3b8');
      circle(ctx, x + 4, y - 20, 5, '#94a3b8');
      break;
    }
    case 'mars': {
      circle(ctx, x, y, 44, '#ea580c');
      ctx.globalAlpha = 0.5;
      circle(ctx, x - 10, y + 8, 10, '#c2410c');
      circle(ctx, x + 16, y - 10, 7, '#c2410c');
      break;
    }
    case 'belt': {
      for (let i = 0; i < 6; i++) {
        const a = t * 0.1 + (i / 6) * Math.PI * 2;
        circle(ctx, x + Math.cos(a) * 55, y + Math.sin(a) * 22, 6 + (i % 3) * 3, '#78716c');
      }
      break;
    }
    case 'jupiter': {
      circle(ctx, x, y, 52, '#d97706');
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x - 50, y - 12, 100, 9);
      ctx.fillRect(x - 46, y + 8, 92, 7);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 49, y - 2, 98, 6);
      circle(ctx, x + 18, y + 18, 9, '#dc2626');
      break;
    }
    case 'galaxy': {
      for (let i = 0; i < 26; i++) {
        const a = i * 0.5 + t * 0.15;
        const r = 5 + i * 2.4;
        ctx.globalAlpha = 0.7 - i * 0.02;
        circle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.5, 2.4, i % 2 ? '#e9d5ff' : '#a78bfa');
      }
      break;
    }
  }
  ctx.restore();
}

// ---------- player ship ----------

function drawShip(ctx: CanvasRenderingContext2D, s: EngineState) {
  const { x, y, tilt, invuln, shield } = s.ship;
  if (invuln > 0 && Math.floor(invuln * 10) % 2 === 0) return; // blink while invulnerable

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt * 0.4);

  // engine flame (flickers)
  const flame = 14 + Math.random() * 8;
  const fg = ctx.createLinearGradient(-24 - flame, 0, -20, 0);
  fg.addColorStop(0, 'rgba(251,146,60,0)');
  fg.addColorStop(0.6, '#fb923c');
  fg.addColorStop(1, '#fef08a');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(-22, -6);
  ctx.quadraticCurveTo(-24 - flame, 0, -22, 6);
  ctx.closePath();
  ctx.fill();

  // fins
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-14, -8); ctx.lineTo(-24, -20); ctx.lineTo(-6, -12); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-14, 8); ctx.lineTo(-24, 20); ctx.lineTo(-6, 12); ctx.closePath();
  ctx.fill();

  // body
  const bg = ctx.createLinearGradient(0, -14, 0, 14);
  bg.addColorStop(0, '#f8fafc');
  bg.addColorStop(0.5, '#cbd5e1');
  bg.addColorStop(1, '#64748b');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.quadraticCurveTo(24, -13, 2, -13);
  ctx.quadraticCurveTo(-20, -13, -22, -7);
  ctx.lineTo(-22, 7);
  ctx.quadraticCurveTo(-20, 13, 2, 13);
  ctx.quadraticCurveTo(24, 13, 30, 0);
  ctx.closePath();
  ctx.fill();

  // nose cone
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.quadraticCurveTo(26, -9, 16, -11);
  ctx.quadraticCurveTo(22, -4, 22, 0);
  ctx.quadraticCurveTo(22, 4, 16, 11);
  ctx.quadraticCurveTo(26, 9, 30, 0);
  ctx.closePath();
  ctx.fill();

  // cockpit bubble
  const cg = ctx.createRadialGradient(4, -3, 1, 4, 0, 9);
  cg.addColorStop(0, '#e0f2fe');
  cg.addColorStop(1, '#0ea5e9');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(4, -1, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(2, -4, 2.4, 0, Math.PI * 2);
  ctx.fill();

  // weapon barrel — colored by equipped gun
  const w = getWeapon(s.weapon);
  ctx.fillStyle = w.color;
  ctx.fillRect(18, -3, 14, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(18, -3, 14, 2);

  ctx.restore();

  // shield bubble
  if (shield) {
    ctx.save();
    ctx.globalAlpha = 0.5 + 0.2 * Math.sin(s.t * 6);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#22d3ee';
    ctx.fill();
    ctx.restore();
  }
}

// ---------- bullets & beam ----------

function drawBullets(ctx: CanvasRenderingContext2D, s: EngineState) {
  for (const b of s.bullets) {
    const w = getWeapon(b.weapon);
    ctx.save();
    if (w.kind === 'orb') {
      const pulse = 1 + 0.15 * Math.sin(s.t * 18);
      const g = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.r * 1.6 * pulse);
      g.addColorStop(0, '#f3e8ff');
      g.addColorStop(0.4, w.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 1.6 * pulse, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.shadowColor = w.glow;
      ctx.shadowBlur = 8;
      ctx.fillStyle = w.color;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx));
      roundRect(ctx, -10, -2.5, 20, 5, 2.5);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

function drawBeam(ctx: CanvasRenderingContext2D, s: EngineState) {
  const sx = s.ship.x + 28;
  const sy = s.ship.y;
  // find the impact point the engine used (first enemy/boss in path)
  let endX = W;
  for (const e of s.enemies) {
    if (e.x > sx && Math.abs(e.y - sy) < e.r + 10 && e.x < endX) endX = e.x;
  }
  if (s.boss && s.boss.x > sx && Math.abs(s.boss.y - sy) < s.boss.r + 10 && s.boss.x < endX) endX = s.boss.x;

  const stripes = 5;
  ctx.save();
  ctx.globalAlpha = 0.9;
  for (let i = 0; i < stripes; i++) {
    const off = (i - (stripes - 1) / 2) * 3;
    ctx.strokeStyle = rainbowColor(s.t * 3 + i * 1.1);
    ctx.lineWidth = 3;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(sx, sy + off);
    const wob = Math.sin(s.t * 20 + i) * 2;
    ctx.quadraticCurveTo((sx + endX) / 2, sy + off * 2 + wob, endX, sy + off * 0.5);
    ctx.stroke();
  }
  // impact glow
  if (endX < W) {
    const g = ctx.createRadialGradient(endX, sy, 1, endX, sy, 22);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, rainbowColor(s.t * 5));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(endX, sy, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- enemies ----------

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, t: number) {
  ctx.save();
  ctx.translate(e.x, e.y);

  switch (e.kind) {
    case 'rocky': drawRock(ctx, e, '#78716c', '#57534e', '#a8a29e'); break;
    case 'icy': drawIce(ctx, e); break;
    case 'metal': drawMetal(ctx, e, t); break;
    case 'ufo': drawUfo(ctx, e, t); break;
    case 'jelly': drawJelly(ctx, e, t); break;
  }

  // white hit flash
  if (e.flash > 0) {
    ctx.globalAlpha = Math.min(1, e.flash * 8);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, e.r + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // hp pips for tougher enemies
  if (e.maxHp > 1 && e.hp > 0 && e.hp < e.maxHp) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundRect(ctx, -14, -e.r - 12, 28, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#4ade80';
    roundRect(ctx, -13, -e.r - 11, 26 * (e.hp / e.maxHp), 4, 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawRock(ctx: CanvasRenderingContext2D, e: Enemy, base: string, dark: string, light: string) {
  ctx.rotate(e.rot);
  ctx.fillStyle = base;
  lumpyCircle(ctx, e.r, e.seed);
  ctx.fill();
  ctx.strokeStyle = light;
  ctx.lineWidth = 2;
  ctx.stroke();
  // craters
  ctx.fillStyle = dark;
  circle(ctx, -e.r * 0.3, -e.r * 0.2, e.r * 0.22, dark);
  circle(ctx, e.r * 0.3, e.r * 0.25, e.r * 0.16, dark);
  circle(ctx, e.r * 0.1, -e.r * 0.45, e.r * 0.12, dark);
}

function drawIce(ctx: CanvasRenderingContext2D, e: Enemy) {
  ctx.rotate(e.rot);
  ctx.globalAlpha = 0.9;
  const g = ctx.createLinearGradient(-e.r, -e.r, e.r, e.r);
  g.addColorStop(0, '#e0f2fe');
  g.addColorStop(0.5, '#7dd3fc');
  g.addColorStop(1, '#38bdf8');
  ctx.fillStyle = g;
  polygon(ctx, e.r, 6);
  ctx.fill();
  ctx.strokeStyle = '#f0f9ff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // inner crystal lines
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * e.r * 0.7, Math.sin(a) * e.r * 0.7);
    ctx.lineTo(-Math.cos(a) * e.r * 0.7, -Math.sin(a) * e.r * 0.7);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawMetal(ctx: CanvasRenderingContext2D, e: Enemy, t: number) {
  ctx.rotate(e.rot * 0.5);
  const g = ctx.createLinearGradient(0, -e.r, 0, e.r);
  g.addColorStop(0, '#a8a29e');
  g.addColorStop(0.5, '#57534e');
  g.addColorStop(1, '#292524');
  ctx.fillStyle = g;
  polygon(ctx, e.r, 8);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.stroke();
  // rivets
  ctx.fillStyle = '#fbbf24';
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    circle(ctx, Math.cos(a) * e.r * 0.55, Math.sin(a) * e.r * 0.55, 2.5, '#fbbf24');
  }
  // blinking core
  const blink = 0.5 + 0.5 * Math.sin(t * 5 + e.phase);
  circle(ctx, 0, 0, 4 + blink * 2, '#ef4444');
}

function drawUfo(ctx: CanvasRenderingContext2D, e: Enemy, t: number) {
  // dome with alien
  const dg = ctx.createRadialGradient(0, -10, 2, 0, -8, 16);
  dg.addColorStop(0, 'rgba(224,242,254,0.95)');
  dg.addColorStop(1, 'rgba(125,211,252,0.5)');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(0, -6, 14, Math.PI, 0);
  ctx.fill();
  // little alien peeking out
  circle(ctx, 0, -9, 6, '#4ade80');
  circle(ctx, -2.2, -10, 1.6, '#052e16');
  circle(ctx, 2.2, -10, 1.6, '#052e16');
  // saucer body
  const bg = ctx.createLinearGradient(0, -6, 0, 10);
  bg.addColorStop(0, '#94a3b8');
  bg.addColorStop(1, '#475569');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.r, e.r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  // running lights
  for (let i = 0; i < 5; i++) {
    const lx = -e.r * 0.7 + (i / 4) * e.r * 1.4;
    const on = Math.floor(t * 4 + i) % 5 === 0;
    circle(ctx, lx, 2, 3, on ? '#fde047' : '#854d0e');
  }
}

function drawJelly(ctx: CanvasRenderingContext2D, e: Enemy, t: number) {
  const squish = 1 + 0.08 * Math.sin(t * 6 + e.phase);
  ctx.scale(squish, 2 - squish);
  // body
  const g = ctx.createRadialGradient(0, -4, 2, 0, 0, e.r);
  g.addColorStop(0, '#f5d0fe');
  g.addColorStop(1, '#d946ef');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -2, e.r * 0.85, Math.PI, 0);
  // wavy bottom
  const n = 5;
  for (let i = 0; i <= n; i++) {
    const px = e.r * 0.85 - (i / n) * e.r * 1.7;
    const py = -2 + (i % 2 === 0 ? 8 : 2) + Math.sin(t * 8 + i + e.phase) * 2.5;
    ctx.quadraticCurveTo(px + e.r * 0.12, py + 5, px, py);
  }
  ctx.closePath();
  ctx.fill();
  // face
  circle(ctx, -7, -8, 3.4, '#581c87');
  circle(ctx, 7, -8, 3.4, '#581c87');
  circle(ctx, -6, -9, 1.2, '#ffffff');
  circle(ctx, 8, -9, 1.2, '#ffffff');
  ctx.strokeStyle = '#581c87';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -3, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

// ---------- boss ----------

function drawBoss(ctx: CanvasRenderingContext2D, b: Boss) {
  ctx.save();
  ctx.translate(b.x, b.y);
  const wob = Math.sin(b.t * 3) * 3;
  ctx.translate(0, wob);

  // glow aura
  const aura = ctx.createRadialGradient(0, 0, b.r * 0.5, 0, 0, b.r * 1.5);
  aura.addColorStop(0, 'rgba(163,230,53,0.25)');
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, b.r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // dome
  const dg = ctx.createRadialGradient(0, -24, 4, 0, -20, 34);
  dg.addColorStop(0, 'rgba(224,242,254,0.95)');
  dg.addColorStop(1, 'rgba(56,189,248,0.45)');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.arc(0, -14, 30, Math.PI, 0);
  ctx.fill();
  // boss alien — big cute-grumpy face
  circle(ctx, 0, -22, 14, '#84cc16');
  circle(ctx, -5, -25, 3.6, '#1a2e05');
  circle(ctx, 5, -25, 3.6, '#1a2e05');
  circle(ctx, -4, -26, 1.3, '#ffffff');
  circle(ctx, 6, -26, 1.3, '#ffffff');
  ctx.strokeStyle = '#1a2e05';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -16, 5, 0.3, Math.PI - 0.3);
  ctx.stroke();
  // antenna
  ctx.strokeStyle = '#84cc16';
  ctx.beginPath();
  ctx.moveTo(0, -36); ctx.lineTo(0, -46);
  ctx.stroke();
  circle(ctx, 0, -49, 4, '#fde047');

  // saucer body
  const bg = ctx.createLinearGradient(0, -12, 0, 26);
  bg.addColorStop(0, '#a1a1aa');
  bg.addColorStop(0.5, '#52525b');
  bg.addColorStop(1, '#27272a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(0, 0, b.r, b.r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#71717a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // rotating rim lights
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + b.t * 2;
    const lx = Math.cos(a) * b.r * 0.82;
    circle(ctx, lx, 6, 4.5, i % 2 ? '#f472b6' : '#fde047');
  }

  // hit flash
  if (b.flash > 0) {
    ctx.globalAlpha = Math.min(1, b.flash * 7);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -4, b.r + 4, b.r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- pickups, particles, popups, banner ----------

function drawPowerups(ctx: CanvasRenderingContext2D, s: EngineState) {
  const emoji = { rapid: '⚡', shield: '🛡️', heart: '❤️', star: '🌟' } as const;
  for (const p of s.powerups) {
    const bob = Math.sin(p.t * 3) * 6;
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    const pulse = 1 + 0.1 * Math.sin(p.t * 5);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 30 * pulse);
    g.addColorStop(0, 'rgba(253,224,71,0.5)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 30 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(88,28,135,0.85)';
    roundRect(ctx, -19, -19, 38, 38, 11);
    ctx.fill();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji[p.kind], 0, 2);
    ctx.restore();
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, s: EngineState) {
  for (const p of s.particles) {
    const k = p.life / p.maxLife;
    ctx.globalAlpha = k;
    ctx.fillStyle = p.color;
    if (p.spark) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx));
      ctx.fillRect(-p.size * 1.6, -p.size * 0.4, p.size * 3.2, p.size * 0.8);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * k, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawPopups(ctx: CanvasRenderingContext2D, s: EngineState) {
  ctx.textAlign = 'center';
  ctx.font = '900 20px system-ui, sans-serif';
  for (const p of s.popups) {
    const k = 1 - p.age;
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.fillStyle = p.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 4;
    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}

function drawBanner(ctx: CanvasRenderingContext2D, s: EngineState) {
  const b = s.banner!;
  const k = b.t / b.max;
  const appear = Math.min(1, (1 - k) * 6);       // pop in
  const fade = Math.min(1, k * 4);                // fade out
  ctx.save();
  ctx.globalAlpha = Math.min(appear, fade);
  ctx.translate(W / 2, H / 2 - 40);
  ctx.scale(0.7 + appear * 0.3, 0.7 + appear * 0.3);
  ctx.textAlign = 'center';
  ctx.font = '900 44px system-ui, sans-serif';
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 8;
  ctx.strokeText(b.text, 0, 0);
  ctx.fillStyle = '#fde047';
  ctx.fillText(b.text, 0, 0);
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 5;
  ctx.strokeText(b.sub, 0, 32);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(b.sub, 0, 32);
  ctx.restore();
}

// ---------- primitives ----------

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function polygon(ctx: CanvasRenderingContext2D, r: number, sides: number) {
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function lumpyCircle(ctx: CanvasRenderingContext2D, r: number, seed: number) {
  const lobes = 9;
  ctx.beginPath();
  for (let i = 0; i <= lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const wob = 0.82 + 0.18 * Math.abs(Math.sin(seed + i * 2.7));
    const px = Math.cos(a) * r * wob;
    const py = Math.sin(a) * r * wob;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export { ZONES };
