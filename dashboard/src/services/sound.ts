class SoundService {
  private audioCtx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy AudioContext initialization on first user gesture
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // 1. Person Detected Chime
  public playPersonDetected() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  // 2. Lid Opening Servo Sound
  public playLidOpen() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  // 3. Evasive YES Button Pop
  public playButtonEscape() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // 4. Verification Prompt Warning Tone
  public playVerificationPrompt() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(660, now + 0.1);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.25);
  }

  // 5. Dramatic Rejection Siren Alarm (Angry Mode)
  public playAngryAlarm() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.linearRampToValueAtTime(300, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.4);
  }

  // 6. Rejection Completed Purge Tone
  public playRejectionDone() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.3); // G5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.6);
  }

  private lidCloseAudio: HTMLAudioElement | null = null;
  private catchMeAudio: HTMLAudioElement | null = null;

  // 7. Main Lid Closing Sound (angane_ang_pooyaalo.m4a)
  public playLidClose() {
    if (!this.enabled) return;
    try {
      if (!this.lidCloseAudio) {
        this.lidCloseAudio = new Audio('/sounds/angane_ang_pooyaalo.m4a');
      }
      this.lidCloseAudio.currentTime = 0;
      this.lidCloseAudio.play().catch((err) => {
        console.warn('[SoundService] playLidClose error:', err);
      });
    } catch (e) {
      console.warn('[SoundService] Exception playing lid close sound:', e);
    }
  }

  // 8. Evasive YES Challenge Audio (pidikk_avane.m4a)
  public playCatchMeAudio() {
    if (!this.enabled) return;
    try {
      if (!this.catchMeAudio) {
        this.catchMeAudio = new Audio('/sounds/pidikk_avane.m4a');
      }
      this.catchMeAudio.currentTime = 0;
      this.catchMeAudio.play().catch((err) => {
        console.warn('[SoundService] playCatchMeAudio error:', err);
      });
    } catch (e) {
      console.warn('[SoundService] Exception playing catch me audio:', e);
    }
  }
  // 9. Caress & Adore Sweet Sound (Purr & Chime)
  public playAdoreSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sweet harp/chime arpeggio
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }
}

export const soundService = new SoundService();

