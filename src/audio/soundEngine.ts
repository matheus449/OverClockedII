/**
 * 100% Procedural WebAudio Synthesizer for OVERCLOCKED
 * Generates warm ambient corporate synth pads, subtle office soundscapes
 * (distant keyboard clacks, soft ventilation hum, footsteps), and UI/gameplay SFX.
 * Separate controls for Music and Effects. Zero external audio files.
 */

export const BACKGROUND_AUDIO_SRC = '/assets/aistudio/background_17bc5615.mp3';
export const MALE_YAWN_AUDIO_SRC = '/assets/aistudio/bocejomasculino_f62e6679.mp3';
export const FEMALE_YAWN_AUDIO_SRC = '/assets/aistudio/bocejofeminino_fae03598.mp3';

export function getYawnAudioSrcForGender(genero: 'masculino' | 'feminino'): string {
  return genero === 'feminino' ? FEMALE_YAWN_AUDIO_SRC : MALE_YAWN_AUDIO_SRC;
}

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
  private bgAudio: HTMLAudioElement | null = null;
  private yawnAudio: HTMLAudioElement | null = null;

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
    if (this.bgAudio) {
      this.bgAudio.muted = this.muted;
      this.bgAudio.volume = this.muted ? 0 : Math.max(0, Math.min(1, this.musicVolume));
    }
    if (this.yawnAudio) {
      this.yawnAudio.muted = this.muted;
      this.yawnAudio.volume = this.muted ? 0 : Math.max(0, Math.min(1, this.sfxVolume));
    }
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

  /**
   * Starts playing the background.mp3 audio track in loop after the player finishes
   * talking with Helena and starts the shift.
   */
  public startBackgroundTrack() {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
    // Stop procedural chord synth so background.mp3 is the clean background music
    if (this.ambientInterval !== null) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    if (!this.bgAudio) {
      this.bgAudio = new Audio(BACKGROUND_AUDIO_SRC);
      this.bgAudio.loop = true;
      this.bgAudio.preload = 'auto';
    }
    this.bgAudio.muted = this.muted;
    this.bgAudio.volume = this.muted ? 0 : Math.max(0, Math.min(1, this.musicVolume));
    if (this.bgAudio.paused) {
      this.bgAudio.play().catch(() => {});
    }
  }

  public stopBackgroundTrack() {
    if (this.bgAudio) {
      this.bgAudio.pause();
      try {
        this.bgAudio.currentTime = 0;
      } catch {
        // Ignore if not seekable yet
      }
    }
  }

  /**
   * Plays bocejomasculino.mp3 or bocejofeminino.mp3 when the character falls asleep (0% energy).
   */
  public playYawnSleepSound(genero: 'masculino' | 'feminino') {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
    const src = getYawnAudioSrcForGender(genero);
    try {
      if (this.yawnAudio) {
        this.yawnAudio.pause();
      }
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.muted = this.muted;
      audio.volume = this.muted ? 0 : Math.max(0, Math.min(1, this.sfxVolume));
      this.yawnAudio = audio;
      audio.play().catch(() => {});
    } catch {
      // Ignore audio errors in headless environments
    }
  }

  public startAmbientMusic() {
    this.initContext();
    if (this.ambientInterval !== null) return;

    // Gentle warm Rhodes-style chord progression during story intro before background.mp3 starts
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 349.23], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G6
    ];

    const playPadChord = () => {
      if (!this.ctx || !this.musicGain || this.muted || this.musicVolume <= 0.01) return;
      if (this.bgAudio && !this.bgAudio.paused) return;
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
    if (this.officeChatterInterval === null) {
      this.officeChatterInterval = window.setInterval(() => {
        if (!this.ctx || !this.sfxGain || this.muted || this.sfxVolume <= 0.01) return;
        if (Math.random() < 0.55) {
          this.playSubtleKeyClick();
        }
      }, 900);
    }
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
    this.stopBackgroundTrack();
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
