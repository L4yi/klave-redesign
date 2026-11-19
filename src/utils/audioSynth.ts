import { Beat } from '../types/klave';

export type StemChannel = 'drums' | 'bass' | 'melody' | 'hats';

const KEY_TO_HZ: Record<string, number> = {
  Cm: 65.41,
  'C#m': 69.3,
  Dm: 73.42,
  Eb: 77.78,
  Em: 82.41,
  Fm: 87.31,
  'F#m': 92.5,
  Gm: 98.0,
  Am: 110.0,
  Bbm: 116.54,
  Bm: 123.47,
};

/**
 * Web Audio API preview synthesizer with live 4-channel stem mute/unmute
 * (drums, 808/bass, melody, hi-hats) so buyers can audition isolated stems in real time.
 */
class BeatPreviewEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private stepTimer: number | null = null;
  private tickTimer: number | null = null;
  private isRunning = false;
  private elapsedSec = 0;
  private stepIndex = 0;
  private volume = 0.75;
  private readonly previewLength = 30;
  private onProgressCb: ((elapsed: number, ended?: boolean) => void) | null = null;

  private stemsState: Record<StemChannel, boolean> = {
    drums: true,
    bass: true,
    melody: true,
    hats: true,
  };

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public setOnProgress(cb: (elapsed: number, ended?: boolean) => void) {
    this.onProgressCb = cb;
  }

  public setStemsState(state: Record<StemChannel, boolean>) {
    this.stemsState = { ...state };
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public start(beat: Beat, startOffsetSec = 0) {
    this.stopTimers();
    this.elapsedSec = Math.max(0, Math.min(this.previewLength, startOffsetSec));
    this.stepIndex = Math.floor((this.elapsedSec * beat.bpm * 4) / 60);
    this.isRunning = true;

    this.ensureContext();
    this.scheduleLoop(beat);
  }

  public pause() {
    this.isRunning = false;
    this.stopTimers();
  }

  public seek(beat: Beat, targetSec: number) {
    const clamped = Math.max(0, Math.min(this.previewLength, targetSec));
    this.elapsedSec = clamped;
    this.stepIndex = Math.floor((clamped * beat.bpm * 4) / 60);
    this.onProgressCb?.(this.elapsedSec, false);
  }

  public stop() {
    this.isRunning = false;
    this.elapsedSec = 0;
    this.stepIndex = 0;
    this.stopTimers();
  }

  private stopTimers() {
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.tickTimer !== null) {
      window.clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  private scheduleLoop(beat: Beat) {
    const stepMs = (60 / beat.bpm / 4) * 1000;
    this.triggerStep(beat, this.stepIndex);
    this.stepIndex += 1;

    this.stepTimer = window.setInterval(() => {
      if (!this.isRunning) return;
      this.triggerStep(beat, this.stepIndex);
      this.stepIndex += 1;
    }, stepMs);

    this.tickTimer = window.setInterval(() => {
      if (!this.isRunning) return;
      this.elapsedSec += 0.1;
      if (this.elapsedSec >= this.previewLength) {
        this.elapsedSec = this.previewLength;
        this.pause();
        this.onProgressCb?.(this.previewLength, true);
        return;
      }
      this.onProgressCb?.(this.elapsedSec, false);
    }, 100);
  }

  private triggerStep(beat: Beat, step: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const pos = step % 16;
    const bar = Math.floor(step / 16) % 4;
    const rootHz = KEY_TO_HZ[beat.musicalKey] ?? 73.42;

    const isAfro = beat.genre === 'Afrobeats';
    const isDrill = beat.genre === 'Drill';
    const isBoomBap = beat.genre === 'Boom Bap';

    const kickSteps = isAfro
      ? [0, 6, 10]
      : isDrill
        ? [0, 5, 11]
        : isBoomBap
          ? [0, 2, 7, 10]
          : [0, 7, 10];

    const snareSteps = isAfro ? [3, 6, 12] : isDrill ? [4, 14] : [4, 12];

    // 1. DRUMS (Kick + Snare/Rim)
    if (this.stemsState.drums) {
      if (kickSteps.includes(pos)) {
        this.playKick(now);
      }
      if (snareSteps.includes(pos)) {
        this.playSnare(now, isAfro);
      }
    }

    // 2. 808 / SUB BASS
    if (this.stemsState.bass && (pos === 0 || pos === 6 || (isDrill && pos === 11) || (!isAfro && pos === 10))) {
      const bassMult = pos === 11 ? 1.12 : 1;
      this.playSubBass(now, rootHz * bassMult, isDrill ? 0.34 : 0.28);
    }

    // 3. HATS / SHAKERS
    if (
      this.stemsState.hats &&
      (isAfro ? pos % 2 === 0 : isBoomBap ? pos % 2 === 0 : pos % 2 === 0 || (pos === 11 && bar % 2 === 1))
    ) {
      this.playHat(now, pos % 4 === 2 ? 0.085 : 0.045);
    }

    // 4. MELODY / CHORDS
    const chordOffsets = [0, 3, 7, 10];
    if (
      this.stemsState.melody &&
      (pos === 0 || (isAfro && (pos === 3 || pos === 8)) || (!isAfro && (pos === 4 || pos === 8)))
    ) {
      const freq = rootHz * 2 * Math.pow(2, chordOffsets[(bar + (pos > 0 ? 1 : 0)) % 4] / 12);
      this.playTone(now, freq, isBoomBap ? 'triangle' : 'sine', pos === 0 ? 0.32 : 0.2);
    }
  }

  private playKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, time);
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.09);

    gain.gain.setValueAtTime(0.38, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.19);
  }

  private playSubBass(time: number, bassHz: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(Math.max(44, bassHz), time);

    gain.gain.setValueAtTime(0.24, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private playSnare(time: number, rimStyle: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(rimStyle ? 350 : 210, time);
    osc.frequency.exponentialRampToValueAtTime(rimStyle ? 190 : 95, time + 0.07);

    gain.gain.setValueAtTime(rimStyle ? 0.16 : 0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playHat(time: number, level: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.03);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
  }

  private playTone(time: number, freq: number, type: OscillatorType, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.095, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);
  }
}

export const audioEngine = new BeatPreviewEngine();
