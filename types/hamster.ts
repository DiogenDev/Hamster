/**
 * ============================================================================
 * МОДУЛЬ ТИПИЗАЦИИ: ПИКСЕЛЬНЫЙ 2D ТАМАГОЧИ "ХОМЯЧОК"
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    В играх со сложной стейт-машиной (Finite State Machine, FSM), физиологическими
 *    показателями и множеством предметов кастомизации критически важно иметь
 *    ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ (Single Source of Truth) для типов данных.
 *    Мы используем строгий TypeScript (strict: true) с абсолютным запретом на
 *    нетипизированные `any`. Это исключает runtime-ошибки вида "undefined is not a function"
 *    и опечатки в названиях состояний ('idle' vs 'IDLE').
 * 
 * 2. КАК ЭТО РАБОТАЕТ (Algorithmic Essence):
 *    Мы разделяем данные на 4 логических слоя:
 *    - Физиология (HamsterNeeds) — числовые показатели 0..100.
 *    - Поведение (HamsterBehavior) — конечное множество состояний автомата (FSM).
 *    - Окружение (FurnitureConfig, FoodItem, PoopItem) — координаты и типы инвентаря.
 *    - Графика (HamsterPalette, PixelGrid, CustomSpriteData) — матрицы пикселей и палитры.
 * 
 * 3. ПОДВОДНЫЕ КАМНИ (Pitfalls & Gotchas):
 *    - Сериализация в localStorage: Date объекты при JSON.stringify превращаются в ISO-строки.
 *      Поэтому временные метки мы храним исключительно в миллисекундах (`number`),
 *      чтобы избежать дорогого парсинга `new Date()` на каждом тике игрового цикла.
 *    - Мутации стейта: В React компонентах мутация вложенных объектов (needs.hunger = 50)
 *      не вызывает ререндер. Все обновления должны быть иммутабельными ({ ...prev, needs: { ... } }).
 * ============================================================================
 */

/**
 * Конечное множество поведений хомячка (Finite State Machine).
 * 
 * 💡 Почему Enum, а не string union?
 * TypeScript enums позволяют безопасно перебирать все доступные состояния,
 * использовать строгую проверку полноты в switch-case (exhaustive checking)
 * и централизованно документировать логику каждого состояния.
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
}

/**
 * Физиологические показатели хомяка (Диапазон: 0 .. 100).
 */
export interface HamsterNeeds {
  /** Сытость (100 = полон сил, 0 = умирает от голода). Падает на 1 ед. каждые 25 сек */
  hunger: number;
  /** Энергия и бодрость (100 = полон энергии, 0 = валится с ног). Падает при бодрствовании, растет во сне */
  energy: number;
  /** Гигиена клетки и шерстки (100 = стерильно). При падении ниже 35 хомяк оставляет какашку */
  hygiene: number;
  /** Уровень счастья (100 = безгранично счастлив). Растет от поглаживаний, уборки и лакомств */
  happiness: number;
  /** Общее здоровье (100 = полностью здоров). Падает, если голод или гигиена на 0 */
  health: number;
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
  /** Наличие корма в миске (0..100% заполнения) */
  bowlFoodLevel: number;
  /** Текущий тип насыпанного корма в миске (или null, если миска пуста) */
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
  /** Сколько единиц сытости восстанавливает */
  hungerGain: number;
  /** Сколько единиц настроения добавляет */
  happinessGain: number;
  /** Сколько единиц здоровья восстанавливает (лакомства могут лечить) */
  healthGain: number;
  /** Длительность анимации поедания в секундах */
  eatingDurationSec: number;
}

/**
 * Цветовая дизайнерская палитра хомяка (всего 20 заготовок).
 * Используется процедурным генератором для раскрашивания базовых спрайтов.
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
 * null означает прозрачный пиксель (alpha = 0), строка — HEX-код цвета (#RRGGBB).
 */
export type PixelGrid = (string | null)[][];

/**
 * Структура кастомного спрайта, созданного в Pixel Art Studio.
 */
export interface CustomSpriteData {
  id: string;
  name: string;
  width: number;
  height: number;
  /** Кадры анимации (обычно 3 кадра: idle1, idle2, action) */
  frames: PixelGrid[];
  /** Скорость воспроизведения анимации (кадров в секунду: 1..12) */
  fps: number;
  createdAt: number;
}

/**
 * Спрайт какашки на дне клетки, требующий интерактивной уборки игроком.
 */
export interface PoopItem {
  id: string;
  /** Позиция X в координатах виртуального Canvas (0 .. 320) */
  x: number;
  /** Позиция Y на полу клетки */
  y: number;
  /** Временная метка создания */
  createdAt: number;
}

/**
 * Всплывающее эмоциональное облачко (Speech Bubble) над головой хомяка.
 */
export interface EmoteBubble {
  id: string;
  emoji: '💖' | '💤' | '🌾' | '💩' | '⚡' | '⚠️' | '💧' | '✨';
  /** Временная метка появления */
  createdAt: number;
  /** Продолжительность отображения в миллисекундах */
  durationMs: number;
  /** Смещение по Y для эффекта плавного всплывания */
  offsetY: number;
  opacity: number;
}

/**
 * Пиксельная частица (для эффектов сердечек при поглаживании, искр уборки, крошек еды)
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
  /** Кличка хомяка (2..16 символов) */
  petName: string;
  /** ID выбранной цветовой палитры (из 20 доступных) */
  paletteId: string;
  /** Кастомный спрайт из пиксельного редактора (если применен) */
  customSprite: CustomSpriteData | null;
  /** Физиологические показатели */
  needs: HamsterNeeds;
  /** Текущее поведение */
  behavior: HamsterBehavior;
  /** Конфигурация мебели в клетке */
  furniture: FurnitureConfig;
  /** Накопившиеся какашки в клетке */
  poops: PoopItem[];
  /** Метка времени последнего сохранения для расчета оффлайн-дельты (Date.now()) */
  lastSavedTimestamp: number;
  /** Возраст хомяка в секундах реального времени */
  totalAgeSeconds: number;
  /** Флаг прохождения первого онбординга */
  isOnboarded: boolean;
  /** Настройки звука */
  soundEnabled: boolean;
  soundVolume: number;
}

/**
 * Типы инструментов в пиксельном редакторе (Pixel Art Studio)
 */
export type PixelEditorTool = 'pencil' | 'eraser' | 'fill' | 'dropper';
