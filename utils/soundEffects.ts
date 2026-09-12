/**
 * ============================================================================
 * МОДУЛЬ: 8-БИТНЫЙ АУДИОСИНТЕЗАТОР (Web Audio API Chiptune Engine)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Вместо скачивания десятков внешних MP3/WAV-файлов (которые долго грузятся,
 *    могут отдавать 404 на сервере и увеличивают размер бандла), мы синтезируем
 *    звуки прямо в браузере с помощью Web Audio API.
 *    Это обеспечивает:
 *    - 0 килобайт сетевого трафика.
 *    - 0 задержек (ноль лагов при воспроизведении).
 *    - Аутентичный 8-битный звук приставок GameBoy/NES (квадратные и треугольные волны).
 * 
 * 2. КАК ЭТО РАБОТАЕТ (Algorithmic Essence):
 *    Мы строим граф аудио-нод:
 *    [OscillatorNode (генератор волны)] ---> [GainNode (огибающая громкости ADSR)] ---> [AudioDestination (динамики)]
 *    - Square (прямоугольная волна): резкий, характерный звук NES/Chiptune (еда, прыжки, клики).
 *    - Sine (синусоида): мягкий чистый тон для мурлыканья и поглаживания.
 *    - Triangle (треугольная волна): басовитый мягкий тембр для зевка и сна.
 *    - White Noise (белый шум через AudioBuffer): шуршание опилок и уборка клетки.
 * 
 * 3. ПОДВОДНЫЕ КАМНИ (Pitfalls & Browser Autoplay Policy):
 *    - Все современные браузеры (Chrome, Safari, Firefox) запрещают воспроизведение звука
 *      до первого клика пользователя на странице (`audioContext.state === 'suspended'`).
 *    - Решение: Ленивая инициализация `AudioContext` и вызов `audioCtx.resume()`
 *      при первом действии игрока.
 *    - Утечки памяти: узлы OscillatorNode одноразовые. После `stop()` их обязательно
 *      нужно отключать (`disconnect()`), иначе они висят в памяти Web Audio.
 * ============================================================================
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;

  /**
   * Ленивое получение или создание AudioContext при первом жесте игрока
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Игнорируем ошибку, если пользователь еще не кликнул
      });
    }

    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * 8-битный звук поедания корма (серия быстрых хрустящих щелчков)
   */
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

  /**
   * Нежный звук поглаживания хомячка (восходящее синусоидальное глиссандо)
   */
  public playPetSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Плавный подъем высоты тона от 400Hz до 800Hz
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.18);

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

  /**
   * Звук сна / засыпания (убаюкивающее сопение на треугольной волне)
   */
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

  /**
   * Забавный пиксельный шлепок дефекации
   */
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

  /**
   * Звук уборки клетки / волшебного блеска (чирикающий перелив)
   */
  public playCleanSound() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // До-Ми-Соль-До

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

  /**
   * Звук нажатия на пиксельную кнопку меню
   */
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

  /**
   * Радостный джингл выполнения действия или полного насыщения
   */
  public playSuccessJingle() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.08 }, // C5
      { f: 659.25, d: 0.08 }, // E5
      { f: 783.99, d: 0.08 }, // G5
      { f: 1046.5, d: 0.22 }, // C6
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
}

// Экспортируем единственный синглтон-экземпляр
export const soundManager = new SoundEngine();
