/**
 * Zero-404 Procedural Web Audio Synthesizer for BAR-250 Pneumatic Systems
 */

class PneumaticSoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Hammerless Forward Plug Valve discharge + Dual Power Jet indexing roller click
   */
  public playPneumaticShot(pressureBar: number, acousticDb: number, isShotgun: boolean = false) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. High-pressure air snap (filtered white noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * (isShotgun ? 0.16 : 0.095));
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const baseFreq = isShotgun ? 480 : 850 + (pressureBar - 100) * 3;
    // Baffle moderator lowers high-frequency bark
    const modFactor = Math.max(0.45, (acousticDb - 65) / 35);
    filter.frequency.setValueAtTime(baseFreq * modFactor, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    const peakGain = Math.min(0.42, (isShotgun ? 0.38 : 0.24) * modFactor);
    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isShotgun ? 0.15 : 0.09));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    // 2. OTB Shroud metallic ping + Pneumatic Indexing Roller click-clack
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    const pitchVar = 0.94 + Math.random() * 0.12;
    osc.frequency.setValueAtTime((isShotgun ? 140 : 220) * pitchVar, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.065);
    oscGain.gain.setValueAtTime(0.18, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);

    // Delayed Rotary Cartridge Indexing Roller metallic click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(1950 * pitchVar, now + 0.045);
    clickGain.gain.setValueAtTime(0.001, now);
    clickGain.gain.setValueAtTime(0.09, now + 0.045);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now + 0.045);
    clickOsc.stop(now + 0.08);
  }

  /**
   * 3-Stage Hand Pump Pull/Push compression stroke + Discharge Check Valve pop
   */
  public playPumpStroke(direction: 'PULL' | 'PUSH') {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    if (direction === 'PULL') {
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(290, now + 0.11);
    } else {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
    }

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Interrupted-Lug Cam Collar 90-degree rotation lock/unlock clunk
   */
  public playCamLockToggle(locked: boolean) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(locked ? 340 : 240, now);
    osc.frequency.setValueAtTime(locked ? 520 : 170, now + 0.035);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playHitConfirm(isKill: boolean) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isKill ? 880 : 620, now);
    if (isKill) {
      osc.frequency.setValueAtTime(1320, now + 0.045);
    }
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isKill ? 0.14 : 0.06));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (isKill ? 0.15 : 0.07));
  }

  public playTelegraphAlert() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.linearRampToValueAtTime(760, now + 0.18);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const soundEngine = new PneumaticSoundEngine();
