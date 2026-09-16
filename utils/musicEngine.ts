/**
 * ============================================================================
 * МОДУЛЬ: 8-БИТНЫЙ МУЗЫКАЛЬНЫЙ ЧИПТЮН-ТРЕКЕР (16 Треков по 45 секунд)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ТОЧНЫЙ ХРОНОМЕТРАЖ (45 Секунд на каждую песню):
 *    - Каждая из 16 песен длится ровно 45 секунд.
 *    - Время отсчитывается по системным часам (Date.now()), что гарантирует
 *      защиту от троттлинга браузера и просадок FPS.
 *    - По истечении 45 секунд:
 *      * 'loop': песня бесшовно перезапускается с начала (зацикливание).
 *      * 'shuffle': случайно выбирается следующий трек из 16.
 *      * 'sequential': включается следующий трек по порядку (1..16).
 * 
 * 2. МНОГОФРАЗОВАЯ СТРУКТУРА (Куплет - Припев - Вариация):
 *    - Каждая песня содержит до 4 чередующихся музыкальных фраз (Lead + Bass),
 *      благодаря чему музыка не звучит как 4-секундный однообразный луп,
 *      а развивается на протяжении всех 45 секунд.
 * 
 * 3. 100% ВЕБ-АУДИО СИНТЕЗ:
 *    - Нулевой вес ассетов (0 Мб MP3), мгновенный старт без задержек сети.
 * ============================================================================
 */

import { MusicTrack, PlaybackMode } from '@/types/hamster';

export const TRACK_DURATION_SEC = 45;

/**
 * Хроматическая таблица частот нот в Герцах (Hz) от C2 до G6
 */
const NOTE_FREQS: Record<string, number> = {
  C2: 65.41, 'C#2': 69.30, D2: 73.42, 'D#2': 77.78, E2: 82.41, F2: 87.31, 'F#2': 92.50, G2: 98.00, 'G#2': 103.83, A2: 110.00, 'A#2': 116.54, B2: 123.47,
  C3: 130.81, 'C#3': 138.59, D3: 146.83, 'D#3': 155.56, E3: 164.81, F3: 174.61, 'F#3': 185.00, G3: 196.00, 'G#3': 207.65, A3: 220.00, 'A#3': 233.08, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00, 'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25, F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00, 'A#5': 932.33, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98,
};

export interface TrackPhrase {
  lead: (string | null)[];
  bass: (string | null)[];
}

export interface TrackScore {
  bpm: number;
  phrases: TrackPhrase[];
}

/**
 * Каталог 16 оригинальных 8-битных композиций
 */
export const TRACK_LIST: MusicTrack[] = [
  { id: 0, title: 'Солнечные семечки', titleEn: 'Sunny Sunflower', mood: 'Радостная и теплая', tempo: 120, durationSec: 45 },
  { id: 1, title: 'Уютное гнездышко', titleEn: 'Cozy Burrow', mood: 'Нежная колыбельная', tempo: 84, durationSec: 45 },
  { id: 2, title: 'Марафон в колесе', titleEn: 'Wheel Runner', mood: 'Энергичный чиптюн', tempo: 136, durationSec: 45 },
  { id: 3, title: 'Сон в опилках', titleEn: 'Sawdust Dreams', mood: 'Мечтательный эмбиент', tempo: 74, durationSec: 45 },
  { id: 4, title: 'Хрустящий перекус', titleEn: 'Crunchy Treat', mood: 'Прыгучая и озорная', tempo: 116, durationSec: 45 },
  { id: 5, title: 'Прогулка на цыпочках', titleEn: 'Tiptoe Wander', mood: 'Любознательная тема', tempo: 104, durationSec: 45 },
  { id: 6, title: 'Ромашковый луг', titleEn: 'Chamomile Meadow', mood: 'Пасторальное умиротворение', tempo: 92, durationSec: 45 },
  { id: 7, title: 'Звездная полночь', titleEn: 'Starlight Sky', mood: 'Мерцающие арпеджио', tempo: 86, durationSec: 45 },
  { id: 8, title: 'Ягодный праздник', titleEn: 'Berry Fiesta', mood: 'Задорный танец', tempo: 128, durationSec: 45 },
  { id: 9, title: 'Хомячий Дзен', titleEn: 'Hamster Nirvana', mood: 'Медитативный релакс', tempo: 68, durationSec: 45 },
  { id: 10, title: 'Золотой колосок', titleEn: 'Golden Grain', mood: 'Теплый кантри-чип', tempo: 114, durationSec: 45 },
  { id: 11, title: 'Вечерний чай', titleEn: 'Evening Tea', mood: 'Спокойный лоуфай-чип', tempo: 88, durationSec: 45 },
  { id: 12, title: 'Побег из клетки', titleEn: 'The Great Escape', mood: 'Озорной детектив', tempo: 124, durationSec: 45 },
  { id: 13, title: 'Тропический банан', titleEn: 'Banana Calypso', mood: 'Солнечный островной ритм', tempo: 122, durationSec: 45 },
  { id: 14, title: 'Лунный кролик', titleEn: 'Moonlit Whispers', mood: 'Японская пентатоника', tempo: 80, durationSec: 45 },
  { id: 15, title: 'Утренний душ', titleEn: 'Dewdrop Morning', mood: 'Бодрящий переливчатый вальс', tempo: 108, durationSec: 45 },
];

/**
 * Партитуры композиций: каждая содержит набор фраз для интересного развития за 45 секунд
 */
export const TRACK_SCORES: TrackScore[] = [
  // 0. Солнечные семечки (C Major)
  {
    bpm: 120,
    phrases: [
      {
        lead: ['C5', 'E5', 'G5', 'E5', 'C5', 'G5', 'A5', 'G5', 'F5', 'E5', 'D5', 'F5', 'E5', 'D5', 'C5', null],
        bass: ['C3', null, 'G3', null, 'C3', null, 'F3', null, 'G3', null, 'G3', null, 'C3', null, 'C3', null],
      },
      {
        lead: ['E5', 'G5', 'C6', 'G5', 'A5', 'F5', 'D5', 'F5', 'G5', 'E5', 'C5', 'E5', 'D5', 'C5', 'B4', 'C5'],
        bass: ['C3', 'G3', 'C3', 'G3', 'F3', 'C3', 'F3', 'C3', 'C3', 'G3', 'C3', 'G3', 'G3', 'D3', 'C3', null],
      },
    ],
  },
  // 1. Уютное гнездышко (F Major)
  {
    bpm: 84,
    phrases: [
      {
        lead: ['F4', 'A4', 'C5', 'A4', 'G4', 'B4', 'D5', 'B4', 'A4', 'C5', 'E5', 'C5', 'F5', 'E5', 'D5', 'C5'],
        bass: ['F3', null, 'C3', null, 'G3', null, 'D3', null, 'A3', null, 'E3', null, 'F3', null, 'C3', null],
      },
      {
        lead: ['C5', 'A4', 'F4', 'A4', 'D5', 'B4', 'G4', 'B4', 'E5', 'C5', 'G4', 'C5', 'F4', null, null, null],
        bass: ['F3', null, null, null, 'G3', null, null, null, 'C3', null, null, null, 'F3', null, null, null],
      },
    ],
  },
  // 2. Марафон в колесе (G Major - энергичный бег)
  {
    bpm: 136,
    phrases: [
      {
        lead: ['G4', 'B4', 'D5', 'G5', 'F#5', 'D5', 'B4', 'D5', 'E5', 'G5', 'A5', 'G5', 'F#5', 'D5', 'B4', 'G4'],
        bass: ['G3', 'D3', 'G3', 'D3', 'E3', 'B3', 'E3', 'B3', 'C3', 'G3', 'C3', 'G3', 'D3', 'A3', 'D3', 'A3'],
      },
      {
        lead: ['B4', 'D5', 'G5', 'B5', 'A5', 'G5', 'E5', 'G5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G5', 'F#5', 'D5'],
        bass: ['G3', 'D3', 'G3', 'D3', 'C3', 'G3', 'C3', 'G3', 'D3', 'A3', 'D3', 'A3', 'G3', 'D3', 'G3', null],
      },
    ],
  },
  // 3. Сон в опилках (A Minor / C Major)
  {
    bpm: 74,
    phrases: [
      {
        lead: ['A4', null, 'C5', null, 'E5', null, 'D5', null, 'C5', null, 'B4', null, 'A4', null, 'E4', null],
        bass: ['A3', null, null, null, 'F3', null, null, null, 'C3', null, null, null, 'E3', null, null, null],
      },
      {
        lead: ['C5', null, 'E5', null, 'G5', null, 'F5', null, 'E5', null, 'D5', null, 'C5', null, null, null],
        bass: ['C3', null, null, null, 'G3', null, null, null, 'A3', null, null, null, 'E3', null, null, null],
      },
    ],
  },
  // 4. Хрустящий перекус (D Major)
  {
    bpm: 116,
    phrases: [
      {
        lead: ['D5', 'D5', 'F#5', 'A5', 'G5', 'F#5', 'E5', 'F#5', 'G5', 'A5', 'F#5', 'D5', 'E5', 'F#5', 'D5', null],
        bass: ['D3', null, 'A3', null, 'G3', null, 'D3', null, 'A3', null, 'A3', null, 'D3', null, 'D3', null],
      },
      {
        lead: ['A5', 'F#5', 'D5', 'F#5', 'B5', 'G5', 'E5', 'G5', 'A5', 'F#5', 'D5', 'F#5', 'E5', 'D5', 'C#5', 'D5'],
        bass: ['D3', 'A3', 'D3', 'A3', 'G3', 'D3', 'G3', 'D3', 'D3', 'A3', 'D3', 'A3', 'A3', 'E3', 'D3', null],
      },
    ],
  },
  // 5. Прогулка на цыпочках (Пентатоника)
  {
    bpm: 104,
    phrases: [
      {
        lead: ['C5', 'D5', 'E5', null, 'G5', 'A5', 'G5', null, 'E5', 'D5', 'C5', 'D5', 'E5', 'D5', 'C5', null],
        bass: ['C3', null, 'G3', null, 'A3', null, 'E3', null, 'F3', null, 'C3', null, 'G3', null, 'C3', null],
      },
      {
        lead: ['A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'E5', null, 'G5', 'E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'C5'],
        bass: ['F3', null, 'C3', null, 'C3', null, 'G3', null, 'A3', null, 'E3', null, 'F3', null, 'C3', null],
      },
    ],
  },
  // 6. Ромашковый луг (E Minor / G Major)
  {
    bpm: 92,
    phrases: [
      {
        lead: ['E4', 'G4', 'B4', 'G4', 'A4', 'C5', 'E5', 'C5', 'B4', 'D5', 'G5', 'D5', 'C5', 'B4', 'A4', 'G4'],
        bass: ['E3', null, 'B3', null, 'A3', null, 'E3', null, 'G3', null, 'D3', null, 'C3', null, 'G3', null],
      },
      {
        lead: ['G4', 'B4', 'D5', 'G5', 'F#5', 'D5', 'B4', 'D5', 'E5', 'C5', 'A4', 'C5', 'B4', 'G4', 'E4', null],
        bass: ['G3', null, 'D3', null, 'B3', null, 'G3', null, 'C3', null, 'G3', null, 'E3', null, null, null],
      },
    ],
  },
  // 7. Звездная полночь (Мерцающие переливы)
  {
    bpm: 86,
    phrases: [
      {
        lead: ['C5', 'G4', 'E4', 'G4', 'D5', 'A4', 'F4', 'A4', 'E5', 'B4', 'G4', 'B4', 'D5', 'G4', 'B4', 'G4'],
        bass: ['C3', null, null, null, 'D3', null, null, null, 'E3', null, null, null, 'G3', null, null, null],
      },
      {
        lead: ['F5', 'C5', 'A4', 'C5', 'E5', 'B4', 'G4', 'B4', 'D5', 'A4', 'F4', 'A4', 'C5', 'G4', 'E4', 'C4'],
        bass: ['F3', null, null, null, 'E3', null, null, null, 'D3', null, null, null, 'C3', null, null, null],
      },
    ],
  },
  // 8. Ягодный праздник (Танец)
  {
    bpm: 128,
    phrases: [
      {
        lead: ['C5', 'E5', 'G5', 'C6', 'B5', 'G5', 'E5', 'G5', 'A5', 'F5', 'D5', 'F5', 'G5', 'E5', 'C5', null],
        bass: ['C3', 'G3', 'C3', 'G3', 'G3', 'D3', 'G3', 'D3', 'F3', 'C3', 'F3', 'C3', 'G3', 'D3', 'C3', 'G3'],
      },
      {
        lead: ['E5', 'G5', 'C6', 'E6', 'D6', 'B5', 'G5', 'B5', 'C6', 'A5', 'F5', 'A5', 'G5', 'F5', 'E5', 'D5'],
        bass: ['C3', 'G3', 'C3', 'G3', 'G3', 'D3', 'G3', 'D3', 'F3', 'C3', 'F3', 'C3', 'G3', null, 'C3', null],
      },
    ],
  },
  // 9. Хомячий Дзен (Медитация)
  {
    bpm: 68,
    phrases: [
      {
        lead: ['G4', null, 'C5', null, 'D5', null, 'E5', null, 'D5', null, 'C5', null, 'G4', null, null, null],
        bass: ['C3', null, null, null, 'G3', null, null, null, 'A3', null, null, null, 'F3', null, null, null],
      },
      {
        lead: ['E5', null, 'G5', null, 'A5', null, 'G5', null, 'E5', null, 'D5', null, 'C5', null, null, null],
        bass: ['C3', null, null, null, 'E3', null, null, null, 'F3', null, null, null, 'C3', null, null, null],
      },
    ],
  },
  // 10. Золотой колосок (Кантри-чип)
  {
    bpm: 114,
    phrases: [
      {
        lead: ['D4', 'F#4', 'A4', 'D5', 'C#5', 'A4', 'F#4', 'A4', 'B4', 'G4', 'E4', 'G4', 'A4', 'F#4', 'D4', null],
        bass: ['D3', 'A2', 'D3', 'A2', 'D3', 'A2', 'D3', 'A2', 'G2', 'D3', 'G2', 'D3', 'A2', 'E3', 'D3', null],
      },
      {
        lead: ['F#4', 'A4', 'D5', 'F#5', 'E5', 'C#5', 'A4', 'C#5', 'D5', 'B4', 'G4', 'B4', 'A4', 'F#4', 'E4', 'D4'],
        bass: ['D3', 'A2', 'D3', 'A2', 'A2', 'E3', 'A2', 'E3', 'G2', 'D3', 'G2', 'D3', 'D3', null, 'D3', null],
      },
    ],
  },
  // 11. Вечерний чай (Лоуфай)
  {
    bpm: 88,
    phrases: [
      {
        lead: ['F4', 'A4', 'C5', 'E5', 'D5', 'A4', 'F4', 'A4', 'G4', 'Bb4', 'D5', 'F5', 'E5', 'C5', 'G4', 'A4'],
        bass: ['F3', null, 'C3', null, 'D3', null, 'A2', null, 'G2', null, 'D3', null, 'C3', null, 'G2', null],
      },
      {
        lead: ['A4', 'C5', 'F5', 'A5', 'G5', 'E5', 'C5', 'E5', 'D5', 'Bb4', 'G4', 'Bb4', 'C5', 'A4', 'F4', null],
        bass: ['F3', null, 'C3', null, 'C3', null, 'G2', null, 'G2', null, 'D3', null, 'F3', null, null, null],
      },
    ],
  },
  // 12. Побег из клетки (Озорной детектив в D Minor)
  {
    bpm: 124,
    phrases: [
      {
        lead: ['D4', 'F4', 'A4', 'D5', 'C#5', 'D5', 'C#5', 'D5', 'E5', 'D5', 'C5', 'A4', 'G4', 'F4', 'E4', 'D4'],
        bass: ['D3', 'A2', 'D3', 'A2', 'A2', 'E3', 'A2', 'E3', 'C3', 'G2', 'C3', 'G2', 'D3', null, 'D3', null],
      },
      {
        lead: ['F4', 'A4', 'D5', 'F5', 'E5', 'F5', 'E5', 'D5', 'Bb4', 'D5', 'F5', 'E5', 'C#5', 'A4', 'E4', 'D4'],
        bass: ['D3', 'A2', 'D3', 'A2', 'Bb2', 'F2', 'Bb2', 'F2', 'G2', 'D3', 'G2', 'D3', 'A2', null, 'D3', null],
      },
    ],
  },
  // 13. Тропический банан (Калипсо)
  {
    bpm: 122,
    phrases: [
      {
        lead: ['C5', 'E5', 'G5', 'G5', 'A5', 'G5', 'E5', 'C5', 'D5', 'F5', 'A5', 'A5', 'G5', 'F5', 'D5', 'B4'],
        bass: ['C3', null, 'G3', 'C3', null, 'G3', 'C3', null, 'G3', null, 'D3', 'G3', null, 'D3', 'G3', null],
      },
      {
        lead: ['E5', 'G5', 'C6', 'C6', 'B5', 'G5', 'A5', 'B5', 'C6', 'G5', 'E5', 'F5', 'G5', 'D5', 'C5', null],
        bass: ['C3', null, 'G3', 'C3', null, 'E3', 'F3', null, 'C3', null, 'G3', 'C3', null, 'G3', 'C3', null],
      },
    ],
  },
  // 14. Лунный кролик (Японская пентатоника)
  {
    bpm: 80,
    phrases: [
      {
        lead: ['A4', 'B4', 'C5', 'E5', 'F5', 'E5', 'C5', 'B4', 'A4', 'C5', 'B4', 'A4', 'F4', 'E4', 'F4', 'A4'],
        bass: ['A3', null, 'E3', null, 'F3', null, 'C3', null, 'D3', null, 'A2', null, 'E3', null, 'A3', null],
      },
      {
        lead: ['E5', 'F5', 'A5', 'B5', 'A5', 'F5', 'E5', 'C5', 'B4', 'A4', 'B4', 'C5', 'B4', 'A4', 'E4', 'A4'],
        bass: ['A3', null, 'E3', null, 'D3', null, 'A2', null, 'E3', null, 'B2', null, 'A2', null, 'A3', null],
      },
    ],
  },
  // 15. Утренний душ (Бодрящий вальс в G Major)
  {
    bpm: 108,
    phrases: [
      {
        lead: ['G4', 'B4', 'D5', 'G5', 'F#5', 'D5', 'E5', 'G5', 'C6', 'B5', 'G5', 'D5', 'C5', 'B4', 'A4', 'G4'],
        bass: ['G3', 'D3', 'D3', 'G3', 'D3', 'D3', 'C3', 'G3', 'G3', 'G3', 'D3', 'D3', 'D3', 'A2', 'G3', null],
      },
      {
        lead: ['B4', 'D5', 'G5', 'B5', 'A5', 'F#5', 'D5', 'F#5', 'G5', 'E5', 'C5', 'E5', 'D5', 'C5', 'B4', 'A4'],
        bass: ['G3', 'D3', 'D3', 'D3', 'A2', 'A2', 'C3', 'G3', 'G3', 'G3', null, null, 'D3', null, 'G3', null],
      },
    ],
  },
];

/**
 * Синглтон движка 8-битной музыки
 */
class ChiptuneMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrackIndex: number = 0;
  private volume: number = 0.35;
  private mode: PlaybackMode = 'loop';

  private stepTimerId: number | null = null;
  private tickerTimerId: number | null = null;
  private trackStartTimeMs: number = 0;
  private currentPhraseIndex: number = 0;
  private currentStep: number = 0;
  private onStateChangeCallbacks: Set<() => void> = new Set();

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public subscribe(cb: () => void) {
    this.onStateChangeCallbacks.add(cb);
    return () => {
      this.onStateChangeCallbacks.delete(cb);
    };
  }

  private notify() {
    this.onStateChangeCallbacks.forEach((cb) => cb());
  }

  public getElapsedSeconds(): number {
    if (!this.isPlaying || this.trackStartTimeMs === 0) return 0;
    const elapsed = Math.floor((Date.now() - this.trackStartTimeMs) / 1000);
    return Math.min(TRACK_DURATION_SEC, Math.max(0, elapsed));
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTrackIndex: this.currentTrackIndex,
      currentTrack: TRACK_LIST[this.currentTrackIndex] || TRACK_LIST[0],
      volume: this.volume,
      mode: this.mode,
      elapsedSeconds: this.getElapsedSeconds(),
      durationSeconds: TRACK_DURATION_SEC,
    };
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    this.notify();
  }

  public setMode(mode: PlaybackMode) {
    this.mode = mode;
    this.notify();
  }

  public selectTrack(index: number) {
    const validIndex = Math.max(0, Math.min(TRACK_LIST.length - 1, index));
    this.currentTrackIndex = validIndex;
    this.currentPhraseIndex = 0;
    this.currentStep = 0;
    this.trackStartTimeMs = Date.now();
    this.notify();
    if (this.isPlaying) {
      this.restartLoop();
    }
  }

  public nextTrack() {
    if (this.mode === 'shuffle') {
      let nextIdx = Math.floor(Math.random() * TRACK_LIST.length);
      if (nextIdx === this.currentTrackIndex) {
        nextIdx = (nextIdx + 1) % TRACK_LIST.length;
      }
      this.selectTrack(nextIdx);
    } else {
      this.selectTrack((this.currentTrackIndex + 1) % TRACK_LIST.length);
    }
  }

  public prevTrack() {
    this.selectTrack((this.currentTrackIndex - 1 + TRACK_LIST.length) % TRACK_LIST.length);
  }

  public play() {
    if (this.isPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.trackStartTimeMs = Date.now();
    this.currentPhraseIndex = 0;
    this.currentStep = 0;
    this.restartLoop();
    this.startTicker();
    this.notify();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopTimers();
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private stopTimers() {
    if (this.stepTimerId !== null) {
      clearTimeout(this.stepTimerId);
      this.stepTimerId = null;
    }
    if (this.tickerTimerId !== null) {
      clearInterval(this.tickerTimerId);
      this.tickerTimerId = null;
    }
  }

  private startTicker() {
    if (this.tickerTimerId !== null) {
      clearInterval(this.tickerTimerId);
    }
    // Тикер для плавного обновления секунд 0:00 / 0:45 в UI
    this.tickerTimerId = window.setInterval(() => {
      if (this.isPlaying) {
        this.notify();
      }
    }, 500);
  }

  private restartLoop() {
    if (this.stepTimerId !== null) {
      clearTimeout(this.stepTimerId);
      this.stepTimerId = null;
    }
    this.step();
  }

  /**
   * Шаг генерации ноты в Web Audio API
   */
  private step = () => {
    if (!this.isPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Проверка лимита 45 секунд
    const elapsedSec = (Date.now() - this.trackStartTimeMs) / 1000;
    if (elapsedSec >= TRACK_DURATION_SEC) {
      if (this.mode === 'loop') {
        // Зацикливание текущей песни: сбрасываем время и начинаем сначала
        this.trackStartTimeMs = Date.now();
        this.currentPhraseIndex = 0;
        this.currentStep = 0;
        this.notify();
      } else if (this.mode === 'shuffle') {
        this.nextTrack();
        return;
      } else {
        // 'sequential'
        this.selectTrack((this.currentTrackIndex + 1) % TRACK_LIST.length);
        return;
      }
    }

    const trackScore = TRACK_SCORES[this.currentTrackIndex] || TRACK_SCORES[0];
    const phrase =
      trackScore.phrases[this.currentPhraseIndex % trackScore.phrases.length];

    const stepDurationSec = 60 / trackScore.bpm / 2; // 8-е доли
    const stepDurationMs = stepDurationSec * 1000;

    const leadNote = phrase.lead[this.currentStep % phrase.lead.length];
    const bassNote = phrase.bass[this.currentStep % phrase.bass.length];

    const now = ctx.currentTime;

    // 1. Канал мелодии (Lead Square Wave)
    if (leadNote && NOTE_FREQS[leadNote]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(NOTE_FREQS[leadNote], now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepDurationSec * 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + stepDurationSec * 0.85);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, stepDurationMs);
    }

    // 2. Канал баса (Bass Triangle Wave)
    if (bassNote && NOTE_FREQS[bassNote]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(NOTE_FREQS[bassNote], now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.28, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + stepDurationSec * 0.95);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + stepDurationSec * 0.95);

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, stepDurationMs);
    }

    // Шаг вперед
    this.currentStep++;
    if (this.currentStep >= phrase.lead.length) {
      this.currentStep = 0;
      this.currentPhraseIndex =
        (this.currentPhraseIndex + 1) % trackScore.phrases.length;
    }

    this.stepTimerId = window.setTimeout(this.step, stepDurationMs);
  };
}

export const musicPlayer = new ChiptuneMusicEngine();
