/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API sound synthesizer
// Completely self-contained: zero external network audio assets required

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private ambientNoiseNode: AudioNode | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenTimer: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play building / defense placement thud
  public playPlaceDefense() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);

    // Subtle crisp tap click
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(800, t);
    clickGain.gain.setValueAtTime(0.2, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    click.connect(clickGain);
    clickGain.connect(this.masterGain);
    click.start(t);
    click.stop(t + 0.05);
  }

  // Play policy activated chime
  public playPolicyActivated() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  // Earthquake rumble effect
  public playEarthquakeRumble(duration: number = 3.5) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(42, t);
    osc.frequency.linearRampToValueAtTime(58, t + duration * 0.4);
    osc.frequency.linearRampToValueAtTime(35, t + duration);

    // Low pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, t);
    filter.frequency.linearRampToValueAtTime(180, t + duration * 0.3);
    filter.frequency.exponentialRampToValueAtTime(50, t + duration);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Tsunami surge sound
  public playTsunamiSurge(duration: number = 4) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const t = this.ctx.currentTime;
    filter.frequency.setValueAtTime(150, t);
    filter.frequency.exponentialRampToValueAtTime(650, t + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(120, t + duration);
    filter.Q.setValueAtTime(2.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.45, t + duration * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);
  }

  // Wildfire crackle & wind
  public playWildfireBurst() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Wood snap clicks
    for (let i = 0; i < 4; i++) {
      const snapTime = t + Math.random() * 0.5;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800 + Math.random() * 600, snapTime);
      gain.gain.setValueAtTime(0.12, snapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.03);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(snapTime);
      osc.stop(snapTime + 0.04);
    }
  }

  // Early warning siren toggle
  public startSiren() {
    if (this.sirenOsc || !this.ctx || this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Modulate pitch between 500 and 850 Hz
    let high = false;
    osc.frequency.setValueAtTime(550, this.ctx.currentTime);

    this.sirenTimer = window.setInterval(() => {
      if (!this.ctx || !osc) return;
      high = !high;
      osc.frequency.linearRampToValueAtTime(high ? 850 : 520, this.ctx.currentTime + 0.6);
    }, 700);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.sirenOsc = osc;
  }

  public stopSiren() {
    if (this.sirenTimer) {
      clearInterval(this.sirenTimer);
      this.sirenTimer = null;
    }
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {
        // Ignore if already stopped
      }
      this.sirenOsc = null;
    }
  }

  // Hitstop / structure collapse impact
  public playImpactThud() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Victory Fanfare
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { f: 523.25, d: 0.15, o: 0 },
      { f: 659.25, d: 0.15, o: 0.16 },
      { f: 783.99, d: 0.15, o: 0.32 },
      { f: 1046.5, d: 0.45, o: 0.48 },
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime + note.o;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + note.d + 0.05);
    });
  }

  // Button click tick
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }
}

export const soundManager = new SoundManager();
