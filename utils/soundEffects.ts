/**
 * ============================================================================
 * МОДУЛЬ: 8-БИТНЫЙ АУДИОСИНТЕЗАТОР (Web Audio API V2)
 * ============================================================================
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public playEatSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554, 659, 880];

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, startTime + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.05);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, (idx * 0.06 + 0.1) * 1000);
    });
  }

  public playPetSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.18);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);

    setTimeout(() => {
      osc.disconnect();
      gain.disconnect();
    }, 300);
  }

  public playSleepSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);

    setTimeout(() => {
      osc.disconnect();
      gain.disconnect();
    }, 500);
  }

  public playPoopSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);

    setTimeout(() => {
      osc.disconnect();
      gain.disconnect();
    }, 200);
  }

  public playCleanSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];

    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(this.volume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.12);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, 400);
    });
  }

  public playWheelSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(360, now + 0.08);
    osc.frequency.linearRampToValueAtTime(300, now + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);

    setTimeout(() => {
      osc.disconnect();
      gain.disconnect();
    }, 200);
  }

  public playClickSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);

    setTimeout(() => {
      osc.disconnect();
      gain.disconnect();
    }, 100);
  }

  public playSuccessJingle() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.08 },
      { f: 659.25, d: 0.08 },
      { f: 783.99, d: 0.08 },
      { f: 1046.5, d: 0.22 },
    ];

    let t = now;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(this.volume * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);

      t += note.d * 0.9;
    });
  }

  public playDrinkSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Два мягких звука капельки/глотка (bubble/sipping sound)
    [0, 0.1].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startF = idx === 0 ? 550 : 700;
      const endF = idx === 0 ? 880 : 1100;
      osc.frequency.setValueAtTime(startF, now + delay);
      osc.frequency.exponentialRampToValueAtTime(endF, now + delay + 0.08);

      gain.gain.setValueAtTime(0.01, now + delay);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.09);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, 250);
    });
  }

  public playPourSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Бульканье наливаемой жидкости (bubbly glug-glug)
    const pitches = [420, 490, 560, 640, 720];
    pitches.forEach((pitch, i) => {
      const t = now + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(pitch + 160, t + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, 400);
    });
  }

  /**
   * Торжественный 8-битный фанфар при повышении уровня и апгрейде клетки
   */
  public playLevelUpJingle() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Тетрахорд триумфа: C5 -> E5 -> G5 -> B5 -> C6 (с легким тремоло)
    const notes = [
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.1 },
      { f: 987.77, d: 0.12 },
      { f: 1046.5, d: 0.35 },
    ];

    let t = now;
    notes.forEach((note, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === notes.length - 1 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(this.volume * 0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);

      t += note.d * 0.85;
    });
  }

  /**
   * Забавный шелестящий звук пробежки хомяка в прозрачном пластиковом туннеле
   */
  public playTunnelSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Серия быстрых шуршащих кликов с эхо (whoosh scurry)
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const f = 600 + Math.random() * 400;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f + 200, t + 0.03);

      gain.gain.setValueAtTime(this.volume * 0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.035);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, 300);
    }
  }

  /**
   * Деревянный топот лапок по лесенке
   */
  public playClimbLadderSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // 3 легких щелчка деревянных ступенек (tap-tap-tap)
    [0, 0.07, 0.14].forEach((delay, idx) => {
      const t = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + idx * 40, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, 200);
    });
  }

  /**
   * Недовольный ворчливый звук хомячка ("Грр!") при отказе идти спать
   */
  public playGrrSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Два низких ворчливых импульса (хриплый пиксельный рык)
    [0, 0.11].forEach((delay, idx) => {
      const t = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const startFreq = idx === 0 ? 140 : 120;
      const endFreq = idx === 0 ? 80 : 65;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.linearRampToValueAtTime(endFreq, t + 0.09);

      gain.gain.setValueAtTime(this.volume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, 250);
    });
  }
}

export const soundManager = new SoundEngine();
