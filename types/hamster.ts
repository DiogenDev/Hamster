/**
 * ============================================================================
 * МОДУЛЬ ТИПИЗАЦИИ: ПИКСЕЛЬНЫЙ 2D ТАМАГОЧИ "ХОМЯЧОК" (V2 ПАНОРАМНЫЙ И ДЗЕН)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Расширение конечного автомата (FSM) новыми состояниями (WHEEL, GROOM, SNIFF)
 *    и добавление режима "Дзен / Браузерный компаньон" требует строгой типизации
 *    конфигурации отключения статов.
 *    Это позволяет игроку настраивать геймплей под себя:
 *    от классического хардкорного тамагочи до расслабляющего живого виджета в углу экрана.
 * 
 * 2. НОВЫЕ ПОВЕДЕНИЯ:
 *    - `WHEEL`: Хомячок запрыгивает в беговое колесо и накручивает круги (колесо вращается).
 *    - `GROOM`: Хомячок садится на задние лапки и протирает мордочку и ушки передними лапками.
 *    - `SNIFF`: Принюхивается к опилкам, ищет зарытые семечки.
 * ============================================================================
 */

/**
 * Конечное множество поведений хомячка (Finite State Machine).
 */
export enum HamsterBehavior {
  /** Спокойно сидит или стоит, шевелит носиком, ушками и моргает */
  IDLE = 'IDLE',
  /** Блуждает по дну клетки влево/вправо с поворотом спрайта по ходу движения */
  WALK = 'WALK',
  /** Расслабленно лежит на брюшке, восстанавливает дыхание */
  LAYING = 'LAYING',
  /** Спит клубочком, над головой поднимаются пиксельные 'Zzz', восстанавливает энергию */
  SLEEP = 'SLEEP',
  /** Держит лапками еду из кормушки, активно жует, надувает щечки */
  EATING = 'EATING',
  /** Присаживается в уголок клетки, оставляет спрайт какашки (требует уборки) */
  POOPING = 'POOPING',
  /** Бежит внутри вращающегося колеса */
  WHEEL = 'WHEEL',
  /** Мило умывает мордочку и ушки передними лапками */
  GROOM = 'GROOM',
  /** Принюхивается к опилкам и исследует пол */
  SNIFF = 'SNIFF',
}

/**
 * Физиологические показатели хомяка (Диапазон: 0 .. 100).
 */
export interface HamsterNeeds {
  hunger: number;
  energy: number;
  hygiene: number;
  happiness: number;
  health: number;
}

/**
 * Конфигурация отключения статов для режима "Без забот"
 */
export interface DisabledStatsConfig {
  /** Отключить голод (всегда 100%, кормить можно только ради удовольствия) */
  hunger: boolean;
  /** Отключить усталость (энергия не падает) */
  energy: boolean;
  /** Отключить загрязнение (гигиена всегда 100%, какашки не появляются) */
  hygiene: boolean;
  /** Отключить падение настроения */
  happiness: boolean;
  /** Отключить болезни и урон здоровью */
  health: boolean;
}

/**
 * Доступные виды кормушек в клетке
 */
export type BowlType = 'clay' | 'wood' | 'neon' | 'royal';

/**
 * Доступные виды поилок
 */
export type WaterBottleType = 'ball' | 'flask' | 'fountain';

/**
 * Доступные виды домиков
 */
export type HouseType = 'log_cabin' | 'coconut' | 'mushroom' | 'box';

/**
 * Конфигурация мебели и окружения в клетке
 */
export interface FurnitureConfig {
  bowl: BowlType;
  waterBottle: WaterBottleType;
  house: HouseType;
  bowlFoodLevel: number;
  currentFoodId: string | null;
}

/**
 * Описание вида корма в рационе питания
 */
export interface FoodItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  hungerGain: number;
  happinessGain: number;
  healthGain: number;
  eatingDurationSec: number;
}

/**
 * Цветовая дизайнерская палитра хомяка с поддержкой 2x детализации
 */
export interface HamsterPalette {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  /** Основной цвет шерсти */
  fur: string;
  /** Теневой контур шерсти для объема */
  furDark: string;
  /** Светлый блик шерсти для объемного 2x меха */
  furLight?: string;
  /** Цвет животика и грудки */
  belly: string;
  /** Внутренняя часть ушек и носик */
  pink: string;
  /** Цвет глаз */
  eyes: string;
  /** Блик на глазах */
  eyeHighlight: string;
  /** Румянец на щечках */
  cheeks: string;
  /** Цвет лапок */
  paws: string;
}

/**
 * Двумерная сетка пикселей для редактора спрайтов.
 */
export type PixelGrid = (string | null)[][];

/**
 * Структура кастомного спрайта
 */
export interface CustomSpriteData {
  id: string;
  name: string;
  width: number;
  height: number;
  frames: PixelGrid[];
  fps: number;
  createdAt: number;
}

/**
 * Спрайт какашки на дне клетки
 */
export interface PoopItem {
  id: string;
  x: number;
  y: number;
  createdAt: number;
}

/**
 * Всплывающее эмоциональное облачко
 */
export interface EmoteBubble {
  id: string;
  emoji: '💖' | '💤' | '🌾' | '💩' | '⚡' | '⚠️' | '💧' | '✨' | '🎡' | '🧼' | '🌸';
  createdAt: number;
  durationMs: number;
  offsetY: number;
  opacity: number;
}

/**
 * Пиксельная частица
 */
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  char?: string;
}

/**
 * Полное состояние игры Тамагочи, сохраняемое в localStorage.
 */
export interface TamagotchiSaveData {
  petName: string;
  paletteId: string;
  customSprite: CustomSpriteData | null;
  needs: HamsterNeeds;
  behavior: HamsterBehavior;
  furniture: FurnitureConfig;
  poops: PoopItem[];
  lastSavedTimestamp: number;
  totalAgeSeconds: number;
  isOnboarded: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  /** Режим «Дзен» (все заботы отключены, чистый компаньон) */
  zenMode: boolean;
  /** Точечное отключение статов */
  disabledStats: DisabledStatsConfig;
}

export type PixelEditorTool = 'pencil' | 'eraser' | 'fill' | 'dropper';
