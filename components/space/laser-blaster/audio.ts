// Synthesized sound effects via Web Audio — no audio files needed.
// AudioContext is created lazily on the first user gesture and closed on dispose().
import type { WeaponId } from './types';

type FxName =
  | 'explode'
  | 'bigExplode'
  | 'hit'
  | 'hurt'
  | 'powerup'
  | 'levelup'
  | 'fanfare'
  | 'click';

export class SoundFX {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private beamOsc: OscillatorNode | null = null;
  private beamGain: GainNode | null = null;
  muted = false;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  dispose() {
    this.stopBeam();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
      this.noiseBuf = null;
    }
  }

  private get ready() {
    return !this.muted && this.ctx !== null && this.master !== null;
  }

  private noise(): AudioBuffer {
    const ctx = this.ctx!;
    if (!this.noiseBuf) {
      const len = Math.floor(ctx.sampleRate * 0.4);
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    return this.noiseBuf;
  }

  private tone(
    type: OscillatorType,
    f0: number,
    f1: number,
    dur: number,
    vol: number,
    delay = 0
  ) {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    osc.onended = () => { osc.disconnect(); g.disconnect(); };
  }

  private boom(dur: number, vol: number, cutoff: number) {
    if (!this.ready) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise();
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(cutoff, t);
    filt.frequency.exponentialRampToValueAtTime(60, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filt).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur);
    src.onended = () => { src.disconnect(); filt.disconnect(); g.disconnect(); };
  }

  fire(weapon: WeaponId) {
    switch (weapon) {
      case 'blaster': this.tone('square', 900, 240, 0.11, 0.16); break;
      case 'spread':  this.tone('triangle', 700, 200, 0.13, 0.2); break;
      case 'plasma':
        this.tone('sine', 180, 55, 0.3, 0.3);
        this.tone('square', 420, 90, 0.2, 0.1);
        break;
      case 'rainbow': break; // continuous — handled by startBeam/stopBeam
    }
  }

  startBeam() {
    if (!this.ready || this.beamOsc) return;
    const ctx = this.ctx!;
    this.beamOsc = ctx.createOscillator();
    this.beamGain = ctx.createGain();
    this.beamOsc.type = 'sawtooth';
    this.beamOsc.frequency.value = 90;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 9;
    lfoGain.gain.value = 28;
    lfo.connect(lfoGain).connect(this.beamOsc.frequency);
    lfo.start();
    this.beamGain.gain.value = 0.07;
    this.beamOsc.connect(this.beamGain).connect(this.master!);
    this.beamOsc.start();
    this.beamOsc.onended = () => { lfo.stop(); lfo.disconnect(); lfoGain.disconnect(); };
  }

  stopBeam() {
    if (this.beamOsc) {
      try { this.beamOsc.stop(); } catch { /* already stopped */ }
      this.beamOsc.disconnect();
      this.beamGain?.disconnect();
      this.beamOsc = null;
      this.beamGain = null;
    }
  }

  play(name: FxName) {
    switch (name) {
      case 'hit':        this.tone('square', 300, 120, 0.07, 0.12); break;
      case 'explode':    this.boom(0.3, 0.35, 1400); this.tone('sine', 160, 40, 0.25, 0.25); break;
      case 'bigExplode': this.boom(0.6, 0.5, 900); this.tone('sine', 120, 30, 0.5, 0.35); break;
      case 'hurt':       this.tone('sine', 220, 90, 0.25, 0.3); break;
      case 'powerup':
        this.tone('sine', 523, 523, 0.09, 0.2);
        this.tone('sine', 659, 659, 0.09, 0.2, 0.08);
        this.tone('sine', 784, 784, 0.14, 0.2, 0.16);
        break;
      case 'levelup':
        [523, 659, 784, 1047].forEach((f, i) => this.tone('triangle', f, f, 0.15, 0.22, i * 0.11));
        break;
      case 'fanfare':
        [392, 523, 659, 784, 1047].forEach((f, i) => this.tone('triangle', f, f, 0.2, 0.25, i * 0.13));
        this.boom(0.5, 0.3, 1000);
        break;
      case 'click': this.tone('sine', 600, 500, 0.05, 0.1); break;
    }
  }
}
