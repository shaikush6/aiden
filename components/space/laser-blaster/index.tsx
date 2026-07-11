'use client';
// Laser Blaster: Galaxy Command — React shell.
// Menus, HUD and input live here; game logic is in engine.ts, drawing in render.ts.
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { speakText } from '@/lib/speech';
import {
  W, H, MAX_LIVES,
  loadSave, persistSave,
  type HudSnapshot, type SaveData, type WeaponId, type ZoneResult,
} from './types';
import { WEAPONS, getWeapon } from './weapons';
import { ZONES } from './levels';
import { Engine } from './engine';
import { render } from './render';
import { SoundFX } from './audio';

type Phase = 'menu' | 'playing' | 'cleared' | 'gameover' | 'victory';

const ZONE_EMOJI = ['🌍', '🌕', '🔴', '🪨', '🟠', '🌌'];

export default function LaserBlasterGame({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>('menu');
  // Rendered client-only (ssr: false), so localStorage is safe in lazy initializers.
  const [save, setSave] = useState<SaveData>(loadSave);
  const [selWeapon, setSelWeapon] = useState<WeaponId>('blaster');
  const [selZone, setSelZone] = useState(() => {
    const beaten = loadSave().zoneStars.filter((s) => s > 0).length;
    return Math.min(beaten, ZONES.length - 1);
  });
  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [result, setResult] = useState<ZoneResult | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);

  const engineRef = useRef<Engine | null>(null);
  const fxRef = useRef<SoundFX | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const saveRef = useRef(save);

  // One SoundFX per mount; closed on unmount.
  useEffect(() => {
    fxRef.current = new SoundFX();
    return () => {
      fxRef.current?.dispose();
      fxRef.current = null;
    };
  }, []);

  const updateSave = useCallback((mut: (d: SaveData) => SaveData) => {
    const next = mut(saveRef.current);
    saveRef.current = next;
    setSave(next);
    persistSave(next);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const handleZoneCleared = useCallback((r: ZoneResult) => {
    updateSave((d) => {
      const zoneStars = [...d.zoneStars];
      zoneStars[r.zoneIndex] = Math.max(zoneStars[r.zoneIndex] || 0, r.stars);
      const unlocked = engineRef.current ? [...engineRef.current.state.unlocked] : d.unlocked;
      return { ...d, zoneStars, unlocked, highScore: Math.max(d.highScore, r.score) };
    });
    setResult(r);
    if (r.finalZone) {
      setPhase('victory');
      speakText('You saved the whole galaxy! Amazing!');
    } else {
      setPhase('cleared');
      speakText(r.unlockedWeapon ? 'Zone clear! New blaster unlocked!' : 'Zone clear! Great flying!');
    }
  }, [updateSave]);

  const handleGameOver = useCallback((score: number) => {
    updateSave((d) => ({ ...d, highScore: Math.max(d.highScore, score) }));
    setPhase('gameover');
    speakText('Great flying, Captain! Try again!');
  }, [updateSave]);

  const launch = useCallback((zoneIndex: number) => {
    const fx = fxRef.current!;
    fx.init(); // must happen inside a user gesture
    fx.muted = muted;
    const engine = new Engine(zoneIndex, selWeapon, [...saveRef.current.unlocked], fx, {
      onHud: setHud,
      onZoneCleared: handleZoneCleared,
      onGameOver: handleGameOver,
      onUnlock: () => {},
    });
    engineRef.current = engine;
    setHud(engine.hud());
    setPaused(false);
    setResult(null);
    setPhase('playing');
    speakText('Blast off, Captain!');
  }, [muted, selWeapon, handleZoneCleared, handleGameOver]);

  const continueRun = useCallback((zoneIndex: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.startZone(zoneIndex);
    setHud(engine.hud());
    setPaused(false);
    setResult(null);
    setPhase('playing');
  }, []);

  const backToMenu = useCallback(() => {
    stopLoop();
    fxRef.current?.stopBeam();
    engineRef.current = null;
    setPaused(false);
    setPhase('menu');
  }, [stopLoop]);

  // Game loop + canvas sizing — runs while the engine is alive.
  const engineAlive = phase === 'playing' || phase === 'cleared' || phase === 'gameover' || phase === 'victory';
  useEffect(() => {
    if (!engineAlive) return;
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform((cssW * dpr) / W, 0, 0, (cssH * dpr) / H, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    lastTimeRef.current = performance.now();
    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      engine.update(dt);
      render(ctx, engine.state);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      stopLoop();
    };
  }, [engineAlive, stopLoop]);

  // Keyboard controls.
  useEffect(() => {
    if (phase !== 'playing') return;
    const engine = engineRef.current;
    if (!engine) return;

    const GAME_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
    const onKeyDown = (e: KeyboardEvent) => {
      if (GAME_KEYS.includes(e.code)) {
        e.preventDefault();
        engine.input.keys.add(e.code);
      } else if (e.code.startsWith('Digit')) {
        const n = Number(e.code.slice(5)) - 1;
        if (WEAPONS[n]) engine.setWeapon(WEAPONS[n].id);
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        setPaused((p) => {
          engine.paused = !p;
          if (!p) fxRef.current?.stopBeam();
          return !p;
        });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => engine.input.keys.delete(e.code);
    const onBlur = () => engine.input.keys.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      engine.input.keys.clear();
    };
  }, [phase]);

  // Pointer steering (trackpad drag / touch).
  const pointerToLogical = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine || phase !== 'playing') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    engine.input.pointer = pointerToLogical(e);
    engine.input.firing = true;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const engine = engineRef.current;
    if (!engine || !engine.input.firing) return;
    engine.input.pointer = pointerToLogical(e);
  };
  const onPointerEnd = () => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.input.firing = false;
    engine.input.pointer = null;
  };

  const toggleMute = () => {
    setMuted((m) => {
      if (fxRef.current) {
        fxRef.current.muted = !m;
        if (!m) fxRef.current.stopBeam();
      }
      return !m;
    });
  };

  const togglePause = () => {
    const engine = engineRef.current;
    if (!engine) return;
    setPaused((p) => {
      engine.paused = !p;
      if (!p) fxRef.current?.stopBeam();
      return !p;
    });
  };

  const beatenCount = save.zoneStars.filter((s) => s > 0).length;
  const maxZone = Math.min(beatenCount, ZONES.length - 1);

  // ---------- MENU ----------
  if (phase === 'menu') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-slate-950 to-indigo-950 rounded-2xl p-6 flex flex-col items-center gap-5 border border-indigo-900">
        <motion.div
          className="text-7xl"
          animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🚀
        </motion.div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tight">LASER BLASTER</h1>
          <p className="text-lg font-black text-yellow-300 tracking-widest">GALAXY COMMAND</p>
        </div>
        {save.highScore > 0 && (
          <div className="text-indigo-300 font-bold">🏆 Best score: {save.highScore}</div>
        )}

        {/* Weapon hangar */}
        <div className="w-full">
          <p className="text-indigo-300 font-black text-sm mb-2 text-center">PICK YOUR BLASTER</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {WEAPONS.map((w) => {
              const locked = !save.unlocked.includes(w.id);
              const sel = selWeapon === w.id;
              return (
                <button
                  key={w.id}
                  disabled={locked}
                  onClick={() => { setSelWeapon(w.id); fxRef.current?.init(); fxRef.current?.play('click'); }}
                  className={`rounded-xl p-3 flex flex-col items-center gap-1 border-2 transition-transform ${
                    sel
                      ? 'border-yellow-400 bg-indigo-800 scale-105'
                      : locked
                      ? 'border-slate-800 bg-slate-900 opacity-50'
                      : 'border-indigo-700 bg-indigo-900 hover:scale-105'
                  }`}
                >
                  <span className="text-3xl">{locked ? '🔒' : w.emoji}</span>
                  <span className="text-white font-black text-xs text-center leading-tight">{w.name}</span>
                  <span className="text-indigo-300 text-[10px] text-center leading-tight">
                    {locked ? `Beat ${ZONES[w.unlockAfterZone].name}!` : w.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Zone map */}
        <div className="w-full">
          <p className="text-indigo-300 font-black text-sm mb-2 text-center">CHOOSE YOUR MISSION</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ZONES.map((z, i) => {
              const locked = i > maxZone;
              const stars = save.zoneStars[i] || 0;
              const sel = selZone === i;
              return (
                <button
                  key={z.name}
                  disabled={locked}
                  onClick={() => setSelZone(i)}
                  className={`rounded-xl p-2 flex flex-col items-center gap-0.5 border-2 ${
                    sel
                      ? 'border-yellow-400 bg-indigo-800'
                      : locked
                      ? 'border-slate-800 bg-slate-900 opacity-40'
                      : 'border-indigo-700 bg-indigo-900'
                  }`}
                >
                  <span className="text-2xl">{locked ? '🔒' : ZONE_EMOJI[i]}</span>
                  <span className="text-white font-bold text-[9px] text-center leading-tight">{z.name}</span>
                  <span className="text-[10px] tracking-tighter">
                    {'⭐'.repeat(stars)}
                    <span className="opacity-30">{'⭐'.repeat(Math.max(0, 3 - stars))}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-slate-400 text-xs text-center leading-relaxed">
          ⌨️ <span className="text-white font-bold">arrow keys</span> to fly · <span className="text-white font-bold">SPACE</span> to shoot · <span className="text-white font-bold">1 2 3 4</span> to change blasters
        </div>

        <motion.button
          onClick={() => launch(selZone)}
          whileTap={{ scale: 0.94 }}
          className="bg-gradient-to-b from-purple-500 to-purple-700 text-white text-3xl font-black py-4 px-14 rounded-2xl shadow-xl shadow-purple-900/50"
        >
          LAUNCH! 🚀
        </motion.button>
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
      </div>
    );
  }

  // ---------- GAME (canvas + overlays) ----------
  const weapon = hud ? getWeapon(hud.weapon) : WEAPONS[0];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          className="w-full block touch-none select-none"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        />

        {/* HUD overlay */}
        {hud && (
          <div className="absolute inset-x-0 top-0 p-2 flex items-start justify-between pointer-events-none">
            <div className="text-lg leading-none drop-shadow">
              {'❤️'.repeat(hud.lives) + '🖤'.repeat(Math.max(0, MAX_LIVES - hud.lives))}
              {hud.shield && <span className="ml-1">🛡️</span>}
              {hud.rapid && <span className="ml-1">⚡</span>}
            </div>
            {hud.bossHp >= 0 && (
              <div className="flex-1 mx-3 mt-1 max-w-[45%]">
                <div className="text-center text-[10px] font-black text-lime-300 mb-0.5">👾 MOTHERSHIP</div>
                <div className="h-3 bg-black/50 rounded-full border border-lime-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-150"
                    style={{ width: `${Math.max(0, (hud.bossHp / hud.bossMax) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <div className="text-right">
              <div className="text-white font-black text-lg leading-none drop-shadow">⭐ {hud.score}</div>
              {hud.mult > 1 && (
                <div className="text-yellow-300 font-black text-sm animate-pulse">x{hud.mult} COMBO!</div>
              )}
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {paused && phase === 'playing' && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">⏸️</div>
            <button
              onClick={togglePause}
              className="bg-purple-600 hover:bg-purple-500 text-white text-2xl font-black py-3 px-10 rounded-2xl"
            >
              KEEP FLYING!
            </button>
            <button onClick={backToMenu} className="text-slate-300 hover:text-white font-bold">← Menu</button>
          </div>
        )}

        {/* Zone cleared overlay */}
        {phase === 'cleared' && result && (
          <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3 p-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">🎉</motion.div>
            <div className="text-3xl font-black text-white text-center">ZONE CLEAR!</div>
            <div className="flex gap-1 text-4xl">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.25, type: 'spring' }}
                  className={i < result.stars ? '' : 'opacity-25 grayscale'}
                >
                  ⭐
                </motion.span>
              ))}
            </div>
            {result.unlockedWeapon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
                className="bg-indigo-900 border-2 border-yellow-400 rounded-xl px-4 py-2 flex items-center gap-2"
              >
                <span className="text-3xl">{getWeapon(result.unlockedWeapon).emoji}</span>
                <div>
                  <div className="text-yellow-300 font-black text-sm">NEW BLASTER UNLOCKED!</div>
                  <div className="text-white font-bold text-xs">{getWeapon(result.unlockedWeapon).name}</div>
                </div>
              </motion.div>
            )}
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => continueRun(result.zoneIndex + 1)}
                className="bg-gradient-to-b from-green-500 to-green-700 text-white text-xl font-black py-3 px-8 rounded-2xl"
              >
                NEXT ZONE →
              </button>
              <button
                onClick={backToMenu}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xl font-black py-3 px-6 rounded-2xl"
              >
                MENU
              </button>
            </div>
          </div>
        )}

        {/* Victory overlay */}
        {phase === 'victory' && result && (
          <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3 p-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-6xl"
            >
              🏆
            </motion.div>
            <div className="text-3xl font-black text-yellow-300 text-center">YOU SAVED THE GALAXY!</div>
            <div className="text-white font-black text-xl">⭐ {result.score} points</div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={backToMenu}
                className="bg-gradient-to-b from-purple-500 to-purple-700 text-white text-xl font-black py-3 px-8 rounded-2xl"
              >
                MISSION CENTER
              </button>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {phase === 'gameover' && (
          <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3 p-4">
            <div className="text-5xl">💫</div>
            <div className="text-3xl font-black text-white text-center">GREAT FLYING, CAPTAIN!</div>
            <div className="text-yellow-300 font-black text-xl">⭐ {hud?.score ?? 0} points</div>
            {hud && hud.score >= save.highScore && hud.score > 0 && (
              <div className="text-lime-300 font-black animate-pulse">🏆 NEW BEST SCORE!</div>
            )}
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => continueRun(hud?.zone ?? 0)}
                className="bg-gradient-to-b from-purple-500 to-purple-700 text-white text-xl font-black py-3 px-8 rounded-2xl"
              >
                TRY AGAIN!
              </button>
              <button
                onClick={backToMenu}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xl font-black py-3 px-6 rounded-2xl"
              >
                MENU
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Weapon bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {WEAPONS.map((w, i) => {
            const unlocked = save.unlocked.includes(w.id) || (hud?.unlocked.includes(w.id) ?? false);
            const sel = hud?.weapon === w.id;
            return (
              <button
                key={w.id}
                disabled={!unlocked || phase !== 'playing'}
                onClick={() => engineRef.current?.setWeapon(w.id)}
                className={`relative min-w-12 min-h-12 rounded-xl text-xl border-2 ${
                  sel
                    ? 'border-yellow-400 bg-indigo-700'
                    : unlocked
                    ? 'border-indigo-800 bg-slate-800 hover:bg-slate-700'
                    : 'border-slate-800 bg-slate-900 opacity-40'
                }`}
                style={sel ? { boxShadow: `0 0 12px ${w.glow}` } : undefined}
              >
                {unlocked ? w.emoji : '🔒'}
                <span className="absolute -top-1.5 -right-1.5 bg-slate-700 text-slate-200 text-[9px] font-black rounded-md px-1">
                  {i + 1}
                </span>
              </button>
            );
          })}
          <div className="ml-1 flex flex-col justify-center">
            <span className="text-white font-black text-xs leading-tight">{weapon.name}</span>
            <span className="text-slate-400 text-[10px] leading-tight">{weapon.desc}</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={toggleMute}
            className="min-w-11 min-h-11 rounded-xl bg-slate-800 border-2 border-slate-700 text-lg"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={togglePause}
            disabled={phase !== 'playing'}
            className="min-w-11 min-h-11 rounded-xl bg-slate-800 border-2 border-slate-700 text-lg disabled:opacity-40"
            aria-label="Pause"
          >
            ⏸️
          </button>
        </div>
      </div>
    </div>
  );
}
