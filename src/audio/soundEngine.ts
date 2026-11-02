/**
 * 100% Procedural WebAudio Synthesizer for OVERCLOCKED
 * Generates warm ambient corporate synth pads, subtle office soundscapes
 * (distant keyboard clacks, soft ventilation hum, footsteps), and UI/gameplay SFX.
 * Separate controls for Music and Effects. Zero external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicVolume = 0.45;
  private sfxVolume = 0.7;
  private muted = false;
  private ambientInterval: number | null = null;
  private officeChatterInterval: number | null = null;
  private chordStep = 0;

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.syncGains();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private syncGains() {
    if (!this.ctx || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(this.muted ? 0 : this.musicVolume * 0.18, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.muted ? 0 : this.sfxVolume * 0.35, now, 0.05);
  }

  public setMusicVolume(v: number) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    this.syncGains();
  }

  public setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    this.syncGains();
  }

  public setMuted(m: boolean) {
    this.muted = m;
    this.syncGains();
  }

  public startAmbientMusic() {
    this.initContext();
    if (this.ambientInterval !== null) return;

    // Gentle warm Rhodes-style chord progression
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 349.23], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
    ];

    const playPadChord = () => {
      if (!this.ctx || !this.musicGain || this.muted || this.musicVolume <= 0.01) return;
      const now = this.ctx.currentTime;
      const notes = chords[this.chordStep % chords.length];
      this.chordStep++;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.08 / notes.length, now + 0.9);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);
        osc.start(now + idx * 0.06);
        osc.stop(now + 3.9);
      });
    };

    playPadChord();
    this.ambientInterval = window.setInterval(playPadChord, 4000);

    // Subtle office keyboard clack ambiance
    this.officeChatterInterval = window.setInterval(() => {
      if (!this.ctx || !this.sfxGain || this.muted || this.sfxVolume <= 0.01) return;
      if (Math.random() < 0.55) {
        this.playSubtleKeyClick();
      }
    }, 900);
  }

  public stopAmbientMusic() {
    if (this.ambientInterval !== null) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    if (this.officeChatterInterval !== null) {
      clearInterval(this.officeChatterInterval);
      this.officeChatterInterval = null;
    }
  }

  private playSubtleKeyClick() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900 + Math.random() * 450, now);
    g.gain.setValueAtTime(0.018, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playFootstep() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    const pitch = 105 + (Math.random() - 0.5) * 18;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.055);
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  public playNotification() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const now = this.ctx.currentTime;
    [587.33, 880.0].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.11);
      g.gain.setValueAtTime(0.18, now + i * 0.11);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.11 + 0.35);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now + i * 0.11);
      osc.stop(now + i * 0.11 + 0.36);
    });
  }

  public playInteract() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.08);
    g.gain.setValueAtTime(0.16, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  public playHardwareAction() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const now = this.ctx.currentTime;
    [320, 640].forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + idx * 0.045);
      g.gain.setValueAtTime(0.12, now + idx * 0.045);
      g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.045 + 0.06);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.065);
    });
  }

  public playSuccess() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.085);
      g.gain.setValueAtTime(0.22, now + i * 0.085);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.085 + 0.38);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now + i * 0.085);
      osc.stop(now + i * 0.085 + 0.4);
    });
  }

  public playError() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.muted) return;
    const now = this.ctx.currentTime;
    [220, 175].forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      g.gain.setValueAtTime(0.15, now + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.18);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.19);
    });
  }
}

export const soundEngine = new SoundEngine();
