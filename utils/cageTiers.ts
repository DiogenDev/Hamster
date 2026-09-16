/**
 * ============================================================================
 * МОДУЛЬ: cageTiers.ts (Вертикальный Рост Клетки, Диагональные Туннели и Цвета)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ВЕРТИКАЛЬНО РАСТУЩАЯ КЛЕТКА В ФИКСИРОВАННОМ ОКНЕ 480x180:
 *    - Окно отображения фиксировано: 480 x 180 px.
 *    - Клетка растет в высоту этажами по 180px:
 *        * 1-й этаж (дно): walking y = 110, cameraY = 0
 *        * 2-й этаж (мезонин): walking y = -70, cameraY = 180
 *        * 3-й этаж (пентхаус): walking y = -250, cameraY = 360
 *    - Плавная камера (cameraY) интерполируется и центрирует текущий этаж.
 * 
 * 2. ДИАГОНАЛЬНЫЕ ТУННЕЛИ (1 на 2-м уровне, 2 на 3-м уровне):
 *    - Туннель 1 (1Ф <-> 2Ф): (x: 390, y: 110) -> (x: 90, y: -70)
 *    - Туннель 2 (2Ф <-> 3Ф): (x: 390, y: -70) -> (x: 90, y: -250)
 * 
 * 3. ДИНАМИЧЕСКАЯ ВИДИМОСТЬ (DYNAMIC VISIBILITY):
 *    - В покое туннели скрыты (opacity = 0), открывая чистый обзор клетки.
 *    - При переходе хомячка между этажами туннель плавно проявляется,
 *      хомячок пробегает внутри по диагонали, а после выхода туннель растворяется.
 * 
 * 4. КАСТОМИЗАЦИЯ ЦВЕТОВ:
 *    - CageColorId (8 стилей каркаса и прутьев клетки)
 *    - TunnelColorId (8 акриловых прозрачных оттенков с бликами и муфтами)
 * ============================================================================
 */

import {
  CageTier,
  CageColorId,
  TunnelColorId,
  TunnelTextureId,
  FloorStyleId,
  Floor2ToyId,
  Floor3ToyId,
  TierToysConfig,
} from '@/types/hamster';

export const SECONDS_PER_DAY = 86400;
export const DAYS_PER_LEVEL = 3;
export const SECONDS_PER_LEVEL = DAYS_PER_LEVEL * SECONDS_PER_DAY; // 259 200 сек

export interface CageTierConfig {
  tier: CageTier;
  minDays: number;
  name: string;
  nameEn: string;
  desc: string;
  features: string[];
}

export const CAGE_TIERS: Record<CageTier, CageTierConfig> = {
  1: {
    tier: 1,
    minDays: 0,
    name: '1-ярусная клетка',
    nameEn: 'Cozy Ground Tier',
    desc: 'Классическая уютная клетка с мягким древесным наполнителем.',
    features: ['Поддон с опилками', 'Просторный 1-й этаж', 'Колесо, домик и кормушка'],
  },
  2: {
    tier: 2,
    minDays: 3,
    name: '2-ярусная клетка',
    nameEn: '2-Story Deluxe',
    desc: 'Двухэтажный особняк с деревянным мезонином и диагональным туннелем.',
    features: ['Второй этаж-мезонин', '1 диагональный туннель', 'Подвесной гамачок', 'Безопасные перила'],
  },
  3: {
    tier: 3,
    minDays: 6,
    name: '3-ярусный пентхаус',
    nameEn: '3-Story Habitrail',
    desc: 'Эпический 3-этажный комплекс со смотровым куполом и 2 диагональными туннелями!',
    features: ['3 полноценных этажа', '2 диагональных туннеля', 'Смотровой стеклянный купол', 'Панорамный пентхаус'],
  },
};

/**
 * Вычисление возраста хомячка в днях
 */
export function calculateHamsterAgeDays(totalAgeSeconds: number): number {
  return Math.max(0, totalAgeSeconds / SECONDS_PER_DAY);
}

/**
 * Вычисление уровня хомячка (3 дня = 1 уровень)
 */
export function calculateHamsterLevel(totalAgeSeconds: number): number {
  const days = calculateHamsterAgeDays(totalAgeSeconds);
  return Math.max(1, Math.floor(days / DAYS_PER_LEVEL) + 1);
}

/**
 * Определение текущего яруса клетки с учетом Admin-оверрайда
 */
export function getEffectiveCageTier(
  totalAgeSeconds: number,
  adminOverride?: CageTier | null
): CageTier {
  if (adminOverride && (adminOverride === 1 || adminOverride === 2 || adminOverride === 3)) {
    return adminOverride;
  }
  const lvl = calculateHamsterLevel(totalAgeSeconds);
  return Math.min(3, lvl) as CageTier;
}

/**
 * Форматирование возраста хомячка
 */
export function formatHamsterAgeDetailed(totalAgeSeconds: number): string {
  const days = Math.floor(totalAgeSeconds / SECONDS_PER_DAY);
  const remainingSecAfterDays = totalAgeSeconds % SECONDS_PER_DAY;
  const hours = Math.floor(remainingSecAfterDays / 3600);
  const remainingSecAfterHours = remainingSecAfterDays % 3600;
  const mins = Math.floor(remainingSecAfterHours / 60);
  const secs = remainingSecAfterHours % 60;

  if (days > 0) {
    return `${days}д ${hours}ч ${mins}м`;
  }
  if (hours > 0) {
    return `${hours}ч ${mins}м ${secs}с`;
  }
  return `${mins}м ${secs}с`;
}

/**
 * Расчет прогресса до следующего уровня
 */
export function getLevelProgress(totalAgeSeconds: number): {
  currentLevel: number;
  daysToNextLevel: number;
  progressPercent: number;
  isMaxTier: boolean;
} {
  const days = calculateHamsterAgeDays(totalAgeSeconds);
  const currentLevel = Math.max(1, Math.floor(days / DAYS_PER_LEVEL) + 1);
  const daysIntoCurrentLevel = days % DAYS_PER_LEVEL;
  const daysToNextLevel = Math.max(0, DAYS_PER_LEVEL - daysIntoCurrentLevel);
  const progressPercent = Math.min(100, Math.floor((daysIntoCurrentLevel / DAYS_PER_LEVEL) * 100));
  const isMaxTier = currentLevel >= 3;

  return {
    currentLevel,
    daysToNextLevel: Number(daysToNextLevel.toFixed(1)),
    progressPercent,
    isMaxTier,
  };
}

// ----------------------------------------------------------------------------
// ПАЛИТРЫ ЦВЕТОВ КЛЕТКИ (CAGE COLORS)
// ----------------------------------------------------------------------------
export interface CageColorPalette {
  id: CageColorId;
  name: string;
  nameEn: string;
  icon: string;
  wire: string;
  wireHighlight: string;
  wireShadow: string;
  frame: string;
  frameHighlight: string;
  trayBase: string;
  trayRim: string;
}

export const CAGE_COLOR_PALETTES: Record<CageColorId, CageColorPalette> = {
  silver: {
    id: 'silver',
    name: 'Классический Хром',
    nameEn: 'Classic Chrome',
    icon: '🥈',
    wire: '#718096',
    wireHighlight: '#a0aec0',
    wireShadow: '#2d3748',
    frame: '#4a5568',
    frameHighlight: '#cbd5e1',
    trayBase: '#8a4b12',
    trayRim: '#693508',
  },
  gold: {
    id: 'gold',
    name: 'Золотая Латунь',
    nameEn: 'Golden Brass',
    icon: '🥇',
    wire: '#d97706',
    wireHighlight: '#fde047',
    wireShadow: '#78350f',
    frame: '#b45309',
    frameHighlight: '#fef08a',
    trayBase: '#78350f',
    trayRim: '#451a03',
  },
  cyber_cyan: {
    id: 'cyber_cyan',
    name: 'Кибер Неон',
    nameEn: 'Cyber Cyan',
    icon: '⚡',
    wire: '#06b6d4',
    wireHighlight: '#67e8f9',
    wireShadow: '#0e7490',
    frame: '#0891b2',
    frameHighlight: '#a5f3fc',
    trayBase: '#164e63',
    trayRim: '#083344',
  },
  midnight_black: {
    id: 'midnight_black',
    name: 'Ночной Графит',
    nameEn: 'Midnight Gunmetal',
    icon: '🖤',
    wire: '#475569',
    wireHighlight: '#64748b',
    wireShadow: '#1e293b',
    frame: '#334155',
    frameHighlight: '#94a3b8',
    trayBase: '#1e293b',
    trayRim: '#0f172a',
  },
  rose_pastel: {
    id: 'rose_pastel',
    name: 'Нежный Розовый',
    nameEn: 'Pastel Rose',
    icon: '🌸',
    wire: '#f472b6',
    wireHighlight: '#fbcfe8',
    wireShadow: '#db2777',
    frame: '#ec4899',
    frameHighlight: '#fce7f3',
    trayBase: '#831843',
    trayRim: '#500724',
  },
  emerald: {
    id: 'emerald',
    name: 'Изумрудная Сталь',
    nameEn: 'Emerald Steel',
    icon: '🌿',
    wire: '#10b981',
    wireHighlight: '#6ee7b7',
    wireShadow: '#047857',
    frame: '#059669',
    frameHighlight: '#a7f3d0',
    trayBase: '#064e3b',
    trayRim: '#022c22',
  },
  violet: {
    id: 'violet',
    name: 'Аметистовый Неон',
    nameEn: 'Violet Amethyst',
    icon: '🔮',
    wire: '#a855f7',
    wireHighlight: '#d8b4fe',
    wireShadow: '#7e22ce',
    frame: '#9333ea',
    frameHighlight: '#f3e8ff',
    trayBase: '#581c87',
    trayRim: '#3b0764',
  },
  pure_white: {
    id: 'pure_white',
    name: 'Белоснежный Сканди',
    nameEn: 'Nordic White',
    icon: '🤍',
    wire: '#e2e8f0',
    wireHighlight: '#ffffff',
    wireShadow: '#94a3b8',
    frame: '#cbd5e1',
    frameHighlight: '#ffffff',
    trayBase: '#475569',
    trayRim: '#334155',
  },
};

// ----------------------------------------------------------------------------
// ПАЛИТРЫ ЦВЕТОВ ТУННЕЛЕЙ (TUNNEL COLORS)
// ----------------------------------------------------------------------------
export interface TunnelColorPalette {
  id: TunnelColorId;
  name: string;
  nameEn: string;
  icon: string;
  glassFill: string;
  glassStroke: string;
  glassHighlight: string;
  jointRing: string;
  jointRingAccent: string;
  glowColor: string;
}

export const TUNNEL_COLOR_PALETTES: Record<TunnelColorId, TunnelColorPalette> = {
  neon_cyan: {
    id: 'neon_cyan',
    name: 'Неоновый Аквамарин',
    nameEn: 'Neon Cyan',
    icon: '💎',
    glassFill: 'rgba(56, 189, 248, 0.32)',
    glassStroke: 'rgba(2, 132, 199, 0.75)',
    glassHighlight: 'rgba(255, 255, 255, 0.85)',
    jointRing: '#0284c7',
    jointRingAccent: '#38bdf8',
    glowColor: '#38bdf8',
  },
  hot_pink: {
    id: 'hot_pink',
    name: 'Яркая Фуксия',
    nameEn: 'Hot Pink',
    icon: '💖',
    glassFill: 'rgba(244, 114, 182, 0.35)',
    glassStroke: 'rgba(219, 39, 119, 0.75)',
    glassHighlight: 'rgba(255, 255, 255, 0.85)',
    jointRing: '#db2777',
    jointRingAccent: '#f472b6',
    glowColor: '#ec4899',
  },
  solar_orange: {
    id: 'solar_orange',
    name: 'Солнечный Янтарь',
    nameEn: 'Solar Amber',
    icon: '☀️',
    glassFill: 'rgba(251, 146, 60, 0.35)',
    glassStroke: 'rgba(234, 88, 12, 0.75)',
    glassHighlight: 'rgba(255, 255, 255, 0.85)',
    jointRing: '#ea580c',
    jointRingAccent: '#fb923c',
    glowColor: '#f97316',
  },
  emerald_lime: {
    id: 'emerald_lime',
    name: 'Изумрудный Лайм',
    nameEn: 'Emerald Lime',
    icon: '🍏',
    glassFill: 'rgba(52, 211, 153, 0.35)',
    glassStroke: 'rgba(5, 150, 105, 0.75)',
    glassHighlight: 'rgba(255, 255, 255, 0.85)',
    jointRing: '#059669',
    jointRingAccent: '#34d399',
    glowColor: '#10b981',
  },
  cosmic_purple: {
    id: 'cosmic_purple',
    name: 'Космический Фиолетовый',
    nameEn: 'Cosmic Purple',
    icon: '🌌',
    glassFill: 'rgba(168, 85, 247, 0.35)',
    glassStroke: 'rgba(126, 34, 206, 0.75)',
    glassHighlight: 'rgba(255, 255, 255, 0.85)',
    jointRing: '#7e22ce',
    jointRingAccent: '#c084fc',
    glowColor: '#a855f7',
  },
  crystal_clear: {
    id: 'crystal_clear',
    name: 'Кристально Прозрачный',
    nameEn: 'Crystal Clear',
    icon: '🧊',
    glassFill: 'rgba(241, 245, 249, 0.22)',
    glassStroke: 'rgba(148, 163, 184, 0.7)',
    glassHighlight: 'rgba(255, 255, 255, 0.95)',
    jointRing: '#64748b',
    jointRingAccent: '#cbd5e1',
    glowColor: '#e2e8f0',
  },
  ruby_red: {
    id: 'ruby_red',
    name: 'Рубиновый Огонь',
    nameEn: 'Ruby Fire',
    icon: '🔥',
    glassFill: 'rgba(248, 113, 113, 0.35)',
    glassStroke: 'rgba(220, 38, 38, 0.75)',
    glassHighlight: 'rgba(255, 255, 255, 0.85)',
    jointRing: '#dc2626',
    jointRingAccent: '#f87171',
    glowColor: '#ef4444',
  },
  electric_yellow: {
    id: 'electric_yellow',
    name: 'Электрик Желтый',
    nameEn: 'Electric Yellow',
    icon: '⭐',
    glassFill: 'rgba(250, 204, 21, 0.35)',
    glassStroke: 'rgba(202, 138, 4, 0.75)',
    glassHighlight: 'rgba(255, 255, 255, 0.85)',
    jointRing: '#ca8a04',
    jointRingAccent: '#fde047',
    glowColor: '#eab308',
  },
};

// ----------------------------------------------------------------------------
// ТЕКСТУРЫ И ДЕКОРАТИВНЫЕ УЗОРЫ ДЛЯ ТУННЕЛЕЙ (TUNNEL TEXTURES)
// ----------------------------------------------------------------------------
export interface TunnelTextureConfig {
  id: TunnelTextureId;
  name: string;
  nameEn: string;
  icon: string;
  desc: string;
}

export const TUNNEL_TEXTURE_PRESETS: Record<TunnelTextureId, TunnelTextureConfig> = {
  smooth_glass: {
    id: 'smooth_glass',
    name: 'Гладкий Кристалл',
    nameEn: 'Smooth Crystal',
    icon: '🧊',
    desc: 'Классическое прозрачное акриловое стекло с продольными бликами.',
  },
  spiral_candy: {
    id: 'spiral_candy',
    name: 'Спиральная Карамель',
    nameEn: 'Candy Cane Spiral',
    icon: '🍭',
    desc: 'Яркие спиральные витые полосы, закручивающиеся вдоль трубы.',
  },
  ribbed_rings: {
    id: 'ribbed_rings',
    name: 'Ребристая Гофра',
    nameEn: 'Ribbed Flex Rings',
    icon: '🔄',
    desc: 'Рельефные гибкие кольца гофры с объемными тенями и насечками.',
  },
  star_glitter: {
    id: 'star_glitter',
    name: 'Звездная Пыль',
    nameEn: 'Cosmic Glitter',
    icon: '✨',
    desc: 'Мерцающие пиксельные звездочки и космические искры в акриле.',
  },
  honeycomb_cyber: {
    id: 'honeycomb_cyber',
    name: 'Кибер Соты',
    nameEn: 'Cyber Honeycomb',
    icon: '⬡',
    desc: 'Футуристическая шестиугольная сетка с неоновыми узлами питания.',
  },
  hazard_chevrons: {
    id: 'hazard_chevrons',
    name: 'Спортивный Трек',
    nameEn: 'Speed Chevrons',
    icon: '⏩',
    desc: 'Динамичные стрелки-шевроны, указывающие направление скоростного забега.',
  },
  bubble_plastic: {
    id: 'bubble_plastic',
    name: 'Пузырьковый Акрил',
    nameEn: 'Bubble Glass',
    icon: '🫧',
    desc: 'Игривые воздушные пузырьки разного размера, застывшие в пластике.',
  },
  circuit_board: {
    id: 'circuit_board',
    name: 'Электронная Плата',
    nameEn: 'Tech Circuit',
    icon: '👾',
    desc: 'Технологичные дорожки печатной платы с контактными площадками микросхем.',
  },
};

// ----------------------------------------------------------------------------
// СТИЛИ И МАТЕРИАЛЫ ПОКРЫТИЯ ЭТАЖЕЙ (FLOOR STYLES)
// ----------------------------------------------------------------------------
export interface FloorStyleConfig {
  id: FloorStyleId;
  name: string;
  nameEn: string;
  icon: string;
  desc: string;
  mainColor: string;
  highlightColor: string;
  shadowColor: string;
  accentColor: string;
}

export const FLOOR_STYLE_PRESETS: Record<FloorStyleId, FloorStyleConfig> = {
  natural_oak: {
    id: 'natural_oak',
    name: 'Натуральный Дуб',
    nameEn: 'Natural Oak',
    icon: '🪵',
    desc: 'Классические теплые деревянные половицы из массива дуба с золотистыми волокнами.',
    mainColor: '#8b5a2b',
    highlightColor: '#d49b58',
    shadowColor: '#522f12',
    accentColor: '#b87d42',
  },
  soft_fleece: {
    id: 'soft_fleece',
    name: 'Мягкий Флис',
    nameEn: 'Cozy Fleece',
    icon: '🧶',
    desc: 'Пушистый плюшевый коврик пастельно-лавандового цвета, бережно согревающий лапки.',
    mainColor: '#818cf8',
    highlightColor: '#c7d2fe',
    shadowColor: '#4338ca',
    accentColor: '#f472b6',
  },
  ceramic_mosaic: {
    id: 'ceramic_mosaic',
    name: 'Керамическая Плитка',
    nameEn: 'Ceramic Mosaic',
    icon: '🟦',
    desc: 'Глянцевая освежающая бирюзовая плитка с белой затиркой для прохлады в жаркие дни.',
    mainColor: '#0891b2',
    highlightColor: '#67e8f9',
    shadowColor: '#164e63',
    accentColor: '#ffffff',
  },
  bamboo_tatami: {
    id: 'bamboo_tatami',
    name: 'Бамбуковое Татами',
    nameEn: 'Bamboo Tatami',
    icon: '🎋',
    desc: 'Экологичные плетеные бамбуковые циновки с темной тканевой кромкой в дзен-стиле.',
    mainColor: '#65a30d',
    highlightColor: '#bef264',
    shadowColor: '#365314',
    accentColor: '#27272a',
  },
  cyber_circuit: {
    id: 'cyber_circuit',
    name: 'Кибер-Неон Панель',
    nameEn: 'Cyber Matrix',
    icon: '⚡',
    desc: 'Высокотехнологичный графитовый композит с неоновыми светящимися шинами питания.',
    mainColor: '#1e293b',
    highlightColor: '#38bdf8',
    shadowColor: '#0f172a',
    accentColor: '#ec4899',
  },
  royal_marble: {
    id: 'royal_marble',
    name: 'Королевский Мрамор',
    nameEn: 'Royal Marble',
    icon: '🏛️',
    desc: 'Белоснежный каррарский мрамор с благородными золотисто-серыми прожилками.',
    mainColor: '#e2e8f0',
    highlightColor: '#ffffff',
    shadowColor: '#94a3b8',
    accentColor: '#f59e0b',
  },
  candy_pastels: {
    id: 'candy_pastels',
    name: 'Карамельный Пластик',
    nameEn: 'Candy Pastels',
    icon: '🍭',
    desc: 'Глянцевый розово-мятный акриловый полимер со сладкими декоративными искорками.',
    mainColor: '#f472b6',
    highlightColor: '#fce7f3',
    shadowColor: '#be185d',
    accentColor: '#34d399',
  },
  cheese_board: {
    id: 'cheese_board',
    name: 'Сырный Паркет',
    nameEn: 'Cheese Floor',
    icon: '🧀',
    desc: 'Ароматная сырная полочка с круглыми дырочками, мечта каждого хомячка!',
    mainColor: '#f59e0b',
    highlightColor: '#fef08a',
    shadowColor: '#b45309',
    accentColor: '#d97706',
  },
};

// ----------------------------------------------------------------------------
// ИНТЕРАКТИВНЫЕ ИГРУШКИ ДЛЯ ВЕРХНИХ ЭТАЖЕЙ (TIER TOYS)
// ----------------------------------------------------------------------------
export interface FloorToyConfig {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  desc: string;
  effects: {
    happinessGain?: number;
    energyGain?: number;
    hygieneGain?: number;
    healthGain?: number;
  };
  durationSec: number;
  soundType: 'play' | 'eat' | 'wheel' | 'clean' | 'sleep';
  particleChar?: string;
  actionEmote: string;
  buffLabel: string;
}

export const FLOOR2_TOY_PRESETS: Record<Floor2ToyId, FloorToyConfig> = {
  seesaw: {
    id: 'seesaw',
    name: 'Качели-Балансир',
    nameEn: 'Wood Seesaw',
    icon: '🪵',
    desc: 'Деревянные качели на треугольной опоре. Развивают координацию и дарят радость!',
    effects: { happinessGain: 20, energyGain: -5 },
    durationSec: 5,
    soundType: 'play',
    particleChar: '🎵',
    actionEmote: '🪵',
    buffLabel: '+20% Счастье, -5% Энергия',
  },
  hammock: {
    id: 'hammock',
    name: 'Подвесной Гамачок',
    nameEn: 'Plush Hammock',
    icon: '🛏️',
    desc: 'Уютный флисовый гамак для комфортного отдыха и быстрого восстановления сил.',
    effects: { energyGain: 18, happinessGain: 15 },
    durationSec: 6,
    soundType: 'sleep',
    particleChar: '💤',
    actionEmote: '🛏️',
    buffLabel: '+18% Энергия, +15% Счастье',
  },
  wood_chew: {
    id: 'wood_chew',
    name: 'Морковка-Грызунок',
    nameEn: 'Chew Carrot',
    icon: '🥕',
    desc: 'Полезная минерально-деревянная игрушка для бережного стачивания резцов.',
    effects: { healthGain: 18, happinessGain: 10 },
    durationSec: 5,
    soundType: 'eat',
    particleChar: '🥕',
    actionEmote: '🥕',
    buffLabel: '+18% Здоровье, +10% Счастье',
  },
  cardboard_tunnel: {
    id: 'cardboard_tunnel',
    name: 'Картонный Лабиринт',
    nameEn: 'Cardboard Maze',
    icon: '📦',
    desc: 'Игровая крафтовая коробка-норка с круглыми окошками для веселых пряток.',
    effects: { happinessGain: 25 },
    durationSec: 5,
    soundType: 'play',
    particleChar: '✨',
    actionEmote: '📦',
    buffLabel: '+25% Счастье (Прятки)',
  },
};

export const FLOOR3_TOY_PRESETS: Record<Floor3ToyId, FloorToyConfig> = {
  telescope: {
    id: 'telescope',
    name: 'Мини-Телескоп',
    nameEn: 'Mini Telescope',
    icon: '🔭',
    desc: 'Астрономический латунный телескоп для наблюдения за созвездиями и галактиками!',
    effects: { happinessGain: 28 },
    durationSec: 6,
    soundType: 'play',
    particleChar: '🌟',
    actionEmote: '🔭',
    buffLabel: '+28% Счастье (Звезды)',
  },
  sand_bath: {
    id: 'sand_bath',
    name: 'Песочная Купалка',
    nameEn: 'Sand Bath Basin',
    icon: '🏖️',
    desc: 'Керамическая ванночка с вулканическим песком для шелковистой и чистой шерстки.',
    effects: { hygieneGain: 32, happinessGain: 15 },
    durationSec: 6,
    soundType: 'clean',
    particleChar: '✨',
    actionEmote: '🏖️',
    buffLabel: '+32% Чистота, +15% Счастье',
  },
  saucer_spinner: {
    id: 'saucer_spinner',
    name: 'Тарелка-Спиннер',
    nameEn: 'Flying Saucer',
    icon: '🛸',
    desc: 'Горизонтальный наклонный диск для скоростного бесшумного бега и фитнеса.',
    effects: { happinessGain: 22, energyGain: -8 },
    durationSec: 6,
    soundType: 'wheel',
    particleChar: '⚡',
    actionEmote: '🛸',
    buffLabel: '+22% Счастье, -8% Энергия',
  },
  plush_throne: {
    id: 'plush_throne',
    name: 'Королевский Трон',
    nameEn: 'Royal Throne',
    icon: '👑',
    desc: 'Миниатюрное велюровое кресло с короной. Почувствуй себя владыкой клетки!',
    effects: { happinessGain: 35, healthGain: 10 },
    durationSec: 6,
    soundType: 'play',
    particleChar: '👑',
    actionEmote: '👑',
    buffLabel: '+35% Счастье, +10% Здоровье',
  },
};

// ----------------------------------------------------------------------------
// КООРДИНАТЫ ЭТАЖЕЙ И ДИАГОНАЛЬНЫХ ТУННЕЛЕЙ
// ----------------------------------------------------------------------------
export const VERTICAL_FLOORS = {
  1: {
    floorIndex: 1 as const,
    y: 110, // линия ходьбы хомячка
    cameraY: 0, // сдвиг камеры
    minX: 30,
    maxX: 440,
    trayY: 126,
  },
  2: {
    floorIndex: 2 as const,
    y: -70, // линия ходьбы на полочке 2-го этажа
    cameraY: 180, // сдвиг камеры (y + cameraY = 110 в окне)
    minX: 30,
    maxX: 440,
    platformY: -28,
  },
  3: {
    floorIndex: 3 as const,
    y: -250, // линия ходьбы в пентхаусе 3-го этажа
    cameraY: 360, // сдвиг камеры (y + cameraY = 110 в окне)
    minX: 30,
    maxX: 440,
    platformY: -208,
  },
};

/**
 * Диагональные туннели для перехода:
 * Туннель 1: 1-й этаж (низ право) <-> 2-й этаж (верх лево)
 * Туннель 2: 2-й этаж (низ право) <-> 3-й этаж (верх лево)
 * 
 * Радиус r = 25px (диаметр 50px) комфортно вмещает хомячка высотой 28-30px,
 * оставляя прозрачный зазор акрила и исключая выпирание спрайта!
 */
export const DIAGONAL_TUNNELS = {
  1: {
    index: 1 as const,
    name: 'Туннель 1-2',
    // 1-й этаж -> 2-й этаж (координаты осевой линии)
    startX: 380,
    startY: 136,
    endX: 90,
    endY: -44,
    radius: 25,
  },
  2: {
    index: 2 as const,
    name: 'Туннель 2-3',
    // 2-й этаж -> 3-й этаж (координаты осевой линии)
    startX: 380,
    startY: -44,
    endX: 90,
    endY: -224,
    radius: 25,
  },
};

/**
 * Вспомогательная пиксельная заливка прямоугольника
 */
function pRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

/**
 * 1.0 Отрисовка массивной архитектурной 24px-платформы с выбранным покрытием пола
 */
export function drawPlatformWithFloorStyle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  styleId: FloorStyleId,
  cPal: CageColorPalette,
  timeSec: number = 0
) {
  const fStyle = FLOOR_STYLE_PRESETS[styleId] || FLOOR_STYLE_PRESETS.natural_oak;
  const height = 24;

  ctx.save();

  // 1. Мягкая глубинная тень под платформой (ambient drop-shadow)
  ctx.fillStyle = 'rgba(5, 7, 15, 0.45)';
  ctx.fillRect(x + 4, y + height, width - 8, 8);
  ctx.fillStyle = 'rgba(5, 7, 15, 0.2)';
  ctx.fillRect(x + 8, y + height + 8, width - 16, 4);

  // 2. Мощные консольные фермы-кронштейны (Cantilever Brackets)
  // Левый кронштейн
  ctx.fillStyle = cPal.wireShadow;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + height);
  ctx.lineTo(x + 36, y + height);
  ctx.lineTo(x + 12, y + height + 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = cPal.frame;
  ctx.beginPath();
  ctx.moveTo(x + 10, y + height);
  ctx.lineTo(x + 32, y + height);
  ctx.lineTo(x + 10, y + height + 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = cPal.frameHighlight;
  ctx.fillRect(x + 10, y + height, 2, 22);

  // Правый кронштейн
  ctx.fillStyle = cPal.wireShadow;
  ctx.beginPath();
  ctx.moveTo(x + width - 12, y + height);
  ctx.lineTo(x + width - 36, y + height);
  ctx.lineTo(x + width - 12, y + height + 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = cPal.frame;
  ctx.beginPath();
  ctx.moveTo(x + width - 10, y + height);
  ctx.lineTo(x + width - 32, y + height);
  ctx.lineTo(x + width - 10, y + height + 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = cPal.frameHighlight;
  ctx.fillRect(x + width - 12, y + height, 2, 22);

  // Центральный кронштейн жесткости для широкого пролета (x = 240)
  ctx.fillStyle = cPal.frame;
  ctx.fillRect(x + width / 2 - 4, y + height, 8, 14);
  ctx.fillStyle = cPal.frameHighlight;
  ctx.fillRect(x + width / 2 - 4, y + height, 2, 14);

  // 3. Основное массивное тело платформы (Slab Core) - 24px толщина
  ctx.fillStyle = fStyle.mainColor;
  ctx.fillRect(x, y, width, height);

  // 4. Верхняя несущая ходовая фаска/кант (y .. y + 4)
  ctx.fillStyle = fStyle.highlightColor;
  ctx.fillRect(x, y, width, 4);

  // 5. Нижний архитектурный плинтус / карниз (y + 18 .. y + 24)
  ctx.fillStyle = fStyle.shadowColor;
  ctx.fillRect(x, y + 18, width, 6);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(x, y + 22, width, 2);

  // 6. Текстурный узор в зависимости от выбранного floorStyle
  switch (styleId) {
    case 'natural_oak': {
      // Массив дуба: вертикальные стыки половиц каждые 32px + волокна древесины
      for (let bx = x + 24; bx < x + width - 10; bx += 32) {
        ctx.fillStyle = fStyle.shadowColor;
        ctx.fillRect(bx, y, 2, height - 6);
        ctx.fillStyle = fStyle.accentColor;
        ctx.fillRect(bx + 2, y + 2, 1, height - 8);

        // Деревянные сучки и волокна
        ctx.fillStyle = fStyle.accentColor;
        ctx.fillRect(bx + 10, y + 6, 8, 2);
        ctx.fillRect(bx + 18, y + 12, 6, 2);
        ctx.fillRect(bx + 8, y + 14, 5, 2);

        // Шляпки гвоздей
        ctx.fillStyle = '#27272a';
        ctx.fillRect(bx + 6, y + 2, 2, 2);
        ctx.fillRect(bx + 26, y + 2, 2, 2);
      }
      break;
    }

    case 'soft_fleece': {
      // Мягкий плюшевый флис: стеганые строчки и пушистые петельки
      for (let fx = x + 16; fx < x + width; fx += 24) {
        ctx.fillStyle = fStyle.accentColor;
        ctx.fillRect(fx, y + 8, 3, 3);
        ctx.fillRect(fx + 12, y + 14, 3, 3);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx + 2, y, 2, 2);
        ctx.fillRect(fx + 10, y + 1, 2, 2);
        ctx.fillRect(fx + 18, y, 2, 2);
      }
      ctx.fillStyle = fStyle.accentColor;
      for (let fx = x + 8; fx < x + width - 8; fx += 16) {
        ctx.fillRect(fx, y + 19, 8, 2);
      }
      break;
    }

    case 'ceramic_mosaic': {
      // Керамическая бирюзовая мозаика: плитки с затиркой и глянцевыми бликами
      ctx.fillStyle = fStyle.accentColor;
      for (let mx = x + 16; mx < x + width - 8; mx += 20) {
        ctx.fillRect(mx, y + 3, 2, 16);
      }
      ctx.fillRect(x, y + 11, width, 1.5);

      for (let mx = x + 2; mx < x + width - 10; mx += 20) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(mx + 2, y + 5, 4, 2);
        ctx.fillRect(mx + 2, y + 13, 3, 1.5);
      }
      break;
    }

    case 'bamboo_tatami': {
      // Бамбуковое татами: плетеные стебли и тканевая тесьма
      for (let ty = y + 4; ty < y + 18; ty += 3) {
        ctx.fillStyle = ty % 6 === 1 ? fStyle.highlightColor : fStyle.shadowColor;
        ctx.fillRect(x, ty, width, 1);
      }
      for (let tx = x + 30; tx < x + width - 10; tx += 48) {
        ctx.fillStyle = fStyle.accentColor;
        ctx.fillRect(tx, y, 8, height - 6);
        ctx.fillStyle = '#52525b';
        ctx.fillRect(tx + 2, y, 4, height - 6);
      }
      break;
    }

    case 'cyber_circuit': {
      // Кибер-неон: дорожки микросхем, светящиеся импульсы
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y + 4, width, 14);

      ctx.fillStyle = fStyle.highlightColor;
      ctx.fillRect(x, y + 9, width, 2);

      for (let cx = x + 20; cx < x + width - 16; cx += 36) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx, y + 6, 12, 8);
        ctx.fillStyle = fStyle.accentColor;
        ctx.fillRect(cx + 3, y + 8, 6, 4);

        ctx.fillStyle = fStyle.highlightColor;
        ctx.fillRect(cx - 6, y + 7, 6, 2);
        ctx.fillRect(cx + 12, y + 11, 8, 2);

        const ledOn = Math.floor(timeSec * 3 + cx) % 2 === 0;
        ctx.fillStyle = ledOn ? '#22c55e' : '#14532d';
        ctx.fillRect(cx + 14, y + 6, 2, 2);
      }
      break;
    }

    case 'royal_marble': {
      // Королевский мрамор: золотистые и серые прожилки
      for (let rx = x + 16; rx < x + width - 20; rx += 40) {
        ctx.strokeStyle = fStyle.accentColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, y + 4);
        ctx.lineTo(rx + 14, y + 10);
        ctx.lineTo(rx + 28, y + 17);
        ctx.stroke();

        ctx.strokeStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(rx + 18, y + 4);
        ctx.lineTo(rx + 8, y + 12);
        ctx.lineTo(rx + 2, y + 18);
        ctx.stroke();
      }
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x, y + 18, width, 2);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x, y + 18, width, 1);
      break;
    }

    case 'candy_pastels': {
      // Карамельный пластик: мятные вставки и кондитерская посыпка
      for (let px = x + 12; px < x + width - 10; px += 28) {
        ctx.fillStyle = fStyle.accentColor;
        ctx.fillRect(px, y + 4, 12, 14);

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(px + 2, y + 7, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 7, y + 12, 3, 2);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(px + 16, y + 8, 3, 2);
      }
      break;
    }

    case 'cheese_board': {
      // Сырный паркет: объемные сырные лунки
      const cheeseHoles = [
        { dx: 24, dy: 9, r: 4 },
        { dx: 58, dy: 13, r: 3 },
        { dx: 92, dy: 7, r: 5 },
        { dx: 134, dy: 11, r: 4 },
        { dx: 172, dy: 8, r: 3 },
        { dx: 215, dy: 12, r: 5 },
        { dx: 260, dy: 7, r: 4 },
        { dx: 300, dy: 13, r: 3 },
        { dx: 345, dy: 9, r: 5 },
        { dx: 390, dy: 12, r: 4 },
        { dx: 420, dy: 8, r: 3 },
      ];
      cheeseHoles.forEach((h) => {
        const hx = x + h.dx;
        const hy = y + h.dy;
        if (hx < x + width - 12) {
          ctx.fillStyle = fStyle.shadowColor;
          ctx.beginPath();
          ctx.arc(hx, hy, h.r, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = fStyle.highlightColor;
          ctx.beginPath();
          ctx.arc(hx - 1, hy - 1, h.r * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      break;
    }
  }

  // 7. Металлические зажимы крепления платформы к стойкам
  ctx.fillStyle = cPal.frame;
  ctx.fillRect(x - 4, y - 2, 8, height + 4);
  ctx.fillRect(x + width - 4, y - 2, 8, height + 4);

  ctx.fillStyle = cPal.frameHighlight;
  ctx.fillRect(x - 3, y - 2, 2, height + 4);
  ctx.fillRect(x + width - 3, y - 2, 2, height + 4);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2, y + 4, 2, 2);
  ctx.fillRect(x - 2, y + 16, 2, 2);
  ctx.fillRect(x + width - 2, y + 4, 2, 2);
  ctx.fillRect(x + width - 2, y + 16, 2, 2);

  // 8. Передние защитные перила (Safety Railing)
  // Верхний поручень
  ctx.fillStyle = fStyle.highlightColor;
  ctx.fillRect(x + 10, y - 14, width - 20, 3);
  ctx.fillStyle = fStyle.shadowColor;
  ctx.fillRect(x + 10, y - 11, width - 20, 1.5);

  // Вертикальные балясины
  for (let rx = x + 16; rx <= x + width - 20; rx += 18) {
    ctx.fillStyle = fStyle.shadowColor;
    ctx.fillRect(rx, y - 11, 2, 11);
    ctx.fillStyle = fStyle.accentColor;
    ctx.fillRect(rx, y - 6, 2, 2);
  }

  ctx.restore();
}

/**
 * 1.1 Отрисовка интерактивной игрушки 2-го этажа (Мезонин)
 * (x, y) = (235, -28)
 */
export function drawFloor2Toy(
  ctx: CanvasRenderingContext2D,
  toyId: Floor2ToyId,
  x: number,
  y: number,
  timeSec: number = 0,
  isInteracting: boolean = false
) {
  ctx.save();

  switch (toyId) {
    case 'seesaw': {
      // Качели-балансир: треугольная опора + наклонная доска
      const tilt = Math.sin(timeSec * 2.2) * (isInteracting ? 0.22 : 0.1);
      // Опора качелей (ступенчатая пиксельная деревянная пирамидка)
      pRect(ctx, x - 13, y - 2, 26, 2, '#3f2008');
      pRect(ctx, x - 10, y - 5, 20, 3, '#623512');
      pRect(ctx, x - 7, y - 8, 14, 3, '#7d451b');
      pRect(ctx, x - 4, y - 11, 8, 3, '#9c5a27');
      pRect(ctx, x - 2, y - 14, 4, 3, '#b87333');

      // Доска качелей
      ctx.save();
      ctx.translate(x, y - 14);
      ctx.rotate(tilt);

      // Деревянная доска длиной 68px с выразительной текстурой
      pRect(ctx, -34, -3, 68, 6, '#b87d42');
      pRect(ctx, -34, -3, 68, 2, '#d49b58');
      pRect(ctx, -34, 1, 68, 2, '#522f12');

      // Красные резиновые упоры на концах
      pRect(ctx, -34, -4, 6, 8, '#ef4444');
      pRect(ctx, -33, -4, 2, 8, '#fca5a5');
      pRect(ctx, 28, -4, 6, 8, '#ef4444');
      pRect(ctx, 29, -4, 2, 8, '#fca5a5');

      // Центральный пиксельный шарнир
      pRect(ctx, -3, -3, 6, 6, '#1e293b');
      pRect(ctx, -1, -1, 2, 2, '#94a3b8');

      ctx.restore();
      break;
    }

    case 'hammock': {
      // Подвесной плюшевый гамачок
      const swing = Math.sin(timeSec * 1.6) * (isInteracting ? 3.5 : 1.5);
      // Боковые деревянные стойки
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x - 30, y - 26, 4, 26);
      ctx.fillRect(x + 26, y - 26, 4, 26);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x - 30, y - 26, 4, 3);
      ctx.fillRect(x + 26, y - 26, 4, 3);

      // Цепочки подвеса
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 28, y - 24);
      ctx.lineTo(x - 20 + swing, y - 10);
      ctx.moveTo(x + 28, y - 24);
      ctx.lineTo(x + 20 + swing, y - 10);
      ctx.stroke();

      // Тело гамачка (провисающий мягкий флис)
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.ellipse(x + swing, y - 8, 22, 9, 0, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.ellipse(x + swing, y - 8, 19, 7, 0, 0, Math.PI);
      ctx.fill();

      // Мягкая подушечка со звездочкой внутри
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(x - 8 + swing, y - 9, 16, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 1 + swing, y - 8, 3, 3);
      break;
    }

    case 'wood_chew': {
      // Игрушка: Деревянная морковка-грызунок (Пиксельная резная графика)
      // 1. Деревянная подставка-брусок с фаской и фактурой дуба
      pRect(ctx, x - 13, y - 4, 26, 4, '#451a03');
      pRect(ctx, x - 12, y - 5, 24, 2, '#78350f');
      pRect(ctx, x - 10, y - 5, 20, 1, '#b45309');
      // Металлические штифты крепления
      pRect(ctx, x - 9, y - 4, 2, 2, '#d4d4d8');
      pRect(ctx, x + 7, y - 4, 2, 2, '#d4d4d8');

      // 2. Тело морковки: ступенчатый пиксельный силуэт (Pixel Stepped Art)
      // Кончик морковки
      pRect(ctx, x - 2, y - 8, 4, 3, '#7c2d12');
      pRect(ctx, x - 2, y - 8, 3, 3, '#ea580c');
      pRect(ctx, x - 2, y - 8, 1, 3, '#fb923c');

      // Нижняя треть
      pRect(ctx, x - 3, y - 12, 7, 4, '#7c2d12');
      pRect(ctx, x - 3, y - 12, 6, 4, '#ea580c');
      pRect(ctx, x - 3, y - 12, 2, 4, '#fb923c');

      // Средняя часть
      pRect(ctx, x - 5, y - 18, 11, 6, '#7c2d12');
      pRect(ctx, x - 5, y - 18, 9, 6, '#ea580c');
      pRect(ctx, x - 5, y - 18, 3, 6, '#fb923c');

      // Верхняя широкая часть
      pRect(ctx, x - 7, y - 24, 15, 6, '#7c2d12');
      pRect(ctx, x - 7, y - 24, 13, 6, '#ea580c');
      pRect(ctx, x - 7, y - 24, 4, 6, '#fb923c');

      // Плечики морковки
      pRect(ctx, x - 6, y - 28, 13, 4, '#7c2d12');
      pRect(ctx, x - 6, y - 28, 11, 4, '#ea580c');
      pRect(ctx, x - 6, y - 28, 3, 4, '#fb923c');

      // Скругленная верхушка
      pRect(ctx, x - 4, y - 30, 9, 2, '#7c2d12');
      pRect(ctx, x - 4, y - 30, 7, 2, '#ea580c');

      // 3. Рельефные бороздки коры/дерева
      pRect(ctx, x - 5, y - 23, 8, 1, '#9a3412');
      pRect(ctx, x - 3, y - 17, 6, 1, '#9a3412');
      pRect(ctx, x - 2, y - 11, 4, 1, '#9a3412');

      // 4. Следы зубок хомячка (грыз деревянную морковку!)
      pRect(ctx, x + 3, y - 21, 3, 2, '#fef08a');
      pRect(ctx, x + 4, y - 20, 2, 1, '#ffffff');
      pRect(ctx, x - 4, y - 15, 3, 2, '#fef08a');
      pRect(ctx, x - 4, y - 15, 2, 1, '#ffffff');

      // 5. Пышная пиксельная зеленая ботва
      // Центральный стебель
      pRect(ctx, x - 1, y - 34, 3, 4, '#15803d');
      pRect(ctx, x - 1, y - 38, 3, 4, '#22c55e');
      pRect(ctx, x - 1, y - 41, 3, 3, '#4ade80');
      pRect(ctx, x, y - 42, 1, 1, '#bbf7d0');

      // Левый лепесток ботвы
      pRect(ctx, x - 4, y - 34, 3, 3, '#15803d');
      pRect(ctx, x - 6, y - 37, 3, 3, '#22c55e');
      pRect(ctx, x - 7, y - 39, 3, 2, '#4ade80');

      // Правый лепесток ботвы
      pRect(ctx, x + 2, y - 34, 3, 3, '#15803d');
      pRect(ctx, x + 4, y - 37, 3, 3, '#22c55e');
      pRect(ctx, x + 5, y - 39, 3, 2, '#4ade80');

      // Маленький колокольчик на шнурке сбоку
      pRect(ctx, x + 7, y - 26, 1, 4, '#78350f');
      pRect(ctx, x + 6, y - 22, 3, 3, '#fbbf24');
      pRect(ctx, x + 7, y - 21, 1, 1, '#fef08a');
      break;
    }

    case 'cardboard_tunnel': {
      // Картонный лабиринт-домик (Ретро-пиксельный крафт)
      const w = 58;
      const h = 34;
      const bx = x - w / 2;
      const by = y - h;

      // Основной крафтовый картон
      pRect(ctx, bx, by, w, h, '#b45309');
      pRect(ctx, bx + 2, by + 2, w - 4, h - 4, '#d97706');

      // Клейкая крафтовая лента на стыках
      pRect(ctx, bx, by, w, 3, '#f59e0b');
      pRect(ctx, bx + w / 2 - 2, by, 4, h, '#f59e0b');

      // Круглый входной туннель в центре (ступенчатый пиксельный круг)
      pRect(ctx, x - 6, y - 26, 12, 24, '#451a03');
      pRect(ctx, x - 10, y - 24, 20, 20, '#451a03');
      pRect(ctx, x - 12, y - 22, 24, 16, '#451a03');

      // Пиксельная окантовка входа
      pRect(ctx, x - 7, y - 27, 14, 2, '#92400e');
      pRect(ctx, x - 11, y - 25, 4, 2, '#92400e');
      pRect(ctx, x + 7, y - 25, 4, 2, '#92400e');
      pRect(ctx, x - 13, y - 23, 2, 18, '#92400e');
      pRect(ctx, x + 11, y - 23, 2, 18, '#92400e');
      pRect(ctx, x - 11, y - 5, 4, 2, '#92400e');
      pRect(ctx, x + 7, y - 5, 4, 2, '#92400e');
      pRect(ctx, x - 7, y - 3, 14, 2, '#92400e');

      // Внутренняя тень свода входа
      pRect(ctx, x - 8, y - 24, 16, 4, '#260e02');

      // Маленькие вентиляционные смотровые окошки
      pRect(ctx, bx + 6, by + 6, 6, 6, '#451a03');
      pRect(ctx, bx + w - 12, by + 6, 6, 6, '#451a03');

      // Симпатичный пиксельный штамп лапки на картоне
      pRect(ctx, bx + 7, by + 20, 3, 3, '#78350f');
      pRect(ctx, bx + 6, by + 18, 2, 2, '#78350f');
      pRect(ctx, bx + 9, by + 18, 2, 2, '#78350f');
      break;
    }
  }

  ctx.restore();
}

/**
 * 1.2 Отрисовка интерактивной игрушки 3-го этажа (Пентхаус)
 * (x, y) = (145, -208)
 */
export function drawFloor3Toy(
  ctx: CanvasRenderingContext2D,
  toyId: Floor3ToyId,
  x: number,
  y: number,
  timeSec: number = 0,
  isInteracting: boolean = false
) {
  ctx.save();

  switch (toyId) {
    case 'telescope': {
      // Астрономический латунный телескоп на деревянном штативе (Пиксельная графика)
      // 3 ножки штатива (пиксельные ступеньки)
      // Центральная ножка
      pRect(ctx, x - 1, y - 26, 2, 26, '#78350f');
      pRect(ctx, x, y - 26, 1, 26, '#92400e');
      // Левая и правая ножки
      for (let s = 0; s < 13; s++) {
        const py = y - 26 + s * 2;
        const lx = x - Math.round(s * 1.2);
        const rx = x + Math.round(s * 1.2);
        pRect(ctx, lx - 1, py, 2, 2, '#78350f');
        pRect(ctx, rx - 1, py, 2, 2, '#78350f');
      }
      // Распорка штатива
      pRect(ctx, x - 9, y - 12, 18, 2, '#b45309');

      // Латунная муфта крепления
      pRect(ctx, x - 4, y - 28, 8, 4, '#d97706');
      pRect(ctx, x - 3, y - 28, 6, 1, '#fef08a');

      // Корпус телескопа, направленный в небо под углом 35 градусов
      ctx.save();
      ctx.translate(x, y - 28);
      ctx.rotate(-0.55);

      // Основная труба телескопа
      pRect(ctx, -8, -4, 38, 8, '#f59e0b');
      pRect(ctx, -8, -4, 38, 2, '#fef08a');
      pRect(ctx, -8, 2, 38, 2, '#b45309');

      // Объектив спереди
      pRect(ctx, 30, -5, 4, 10, '#ca8a04');
      // Линза объектива с небесно-голубым стеклом
      pRect(ctx, 33, -4, 2, 8, '#38bdf8');
      pRect(ctx, 33, -3, 2, 2, '#ffffff');

      // Окуляр сзади
      pRect(ctx, -14, -2, 6, 4, '#78350f');

      ctx.restore();

      // Мерцающая звездочка над объективом
      const starGlint = Math.floor(timeSec * 3) % 2 === 0;
      if (starGlint) {
        pRect(ctx, x + 24, y - 48, 3, 3, '#ffffff');
        pRect(ctx, x + 25, y - 50, 1, 7, '#38bdf8');
        pRect(ctx, x + 22, y - 47, 7, 1, '#38bdf8');
      }
      break;
    }

    case 'sand_bath': {
      // Керамическая ванночка с вулканическим песком (Пиксельный бортик)
      const bw = 60;
      const bh = 22;
      const bx = x - bw / 2;
      const by = y - bh;

      // Керамическая чаша со ступенчатыми пиксельными углами
      pRect(ctx, bx + 3, by, bw - 6, bh, '#0284c7');
      pRect(ctx, bx, by + 3, bw, bh - 6, '#0284c7');
      pRect(ctx, bx + 1, by + 1, bw - 2, bh - 2, '#0284c7');

      pRect(ctx, bx + 4, by + 2, bw - 8, bh - 4, '#38bdf8');
      pRect(ctx, bx + 2, by + 4, bw - 4, bh - 8, '#38bdf8');
      pRect(ctx, bx + 3, by + 3, bw - 6, bh - 6, '#38bdf8');

      // Песок внутри ванночки
      pRect(ctx, bx + 4, by + 6, bw - 8, bh - 9, '#fde68a');
      pRect(ctx, bx + 4, by + 13, bw - 8, bh - 16, '#f59e0b');

      // Песчаные крупинки и блестки
      ctx.fillStyle = '#ffffff';
      for (let px = bx + 8; px < bx + bw - 8; px += 8) {
        const py = by + 8 + ((px * 3) % 5);
        ctx.fillRect(px, py, 2, 2);
      }

      // Маленький деревянный совок на бортике
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(bx + bw - 14, by - 6, 12, 4);
      ctx.fillStyle = '#d49b58';
      ctx.fillRect(bx + bw - 10, by - 4, 4, 8);
      break;
    }

    case 'saucer_spinner': {
      // Горизонтальное беговое колесо-тарелка (Flying Saucer)
      const sw = 60;
      const sh = 20;

      // Наклонная подставка-основание
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + 8, y);
      ctx.lineTo(x + 4, y - 12);
      ctx.lineTo(x - 4, y - 12);
      ctx.closePath();
      ctx.fill();

      // Диск тарелки (эллипс в перспективе)
      ctx.save();
      ctx.translate(x, y - 12);
      ctx.rotate(-0.12);

      // Внешний диск
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.ellipse(0, 0, sw / 2, sh / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Неоновый светящийся обод
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, sw / 2 - 2, sh / 2 - 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Беговые спицы диска, вращающиеся при движении
      const spinAngle = timeSec * (isInteracting ? 12 : 3);
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const a = spinAngle + (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * (sw / 2 - 4), Math.sin(a) * (sh / 2 - 3));
        ctx.stroke();
      }

      // Центральный колпачок подшипника
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      break;
    }

    case 'plush_throne': {
      // Королевский велюровый трон
      const tw = 44;
      const th = 46;
      const tx = x - tw / 2;
      const ty = y - th;

      // Деревянный золоченый каркас спинки
      ctx.fillStyle = '#b45309';
      ctx.fillRect(tx + 4, ty, tw - 8, th - 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(tx + 6, ty + 2, tw - 12, th - 14);

      // Королевская золотая корона на верхушке
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(x - 8, ty);
      ctx.lineTo(x - 12, ty - 6);
      ctx.lineTo(x - 4, ty - 3);
      ctx.lineTo(x, ty - 8);
      ctx.lineTo(x + 4, ty - 3);
      ctx.lineTo(x + 12, ty - 6);
      ctx.lineTo(x + 8, ty);
      ctx.closePath();
      ctx.fill();

      // Мягкая бархатная пурпурная спинка трона
      ctx.fillStyle = '#831843';
      ctx.fillRect(tx + 8, ty + 6, tw - 16, th - 20);

      // Стеганые золотые пуговицы-каретная стяжка
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 6, ty + 12, 2, 2);
      ctx.fillRect(x + 4, ty + 12, 2, 2);
      ctx.fillRect(x - 1, ty + 18, 2, 2);

      // Пышное бархатное сиденье
      ctx.fillStyle = '#9d174d';
      ctx.fillRect(tx + 2, y - 16, tw - 4, 12);
      ctx.fillStyle = '#db2777';
      ctx.fillRect(tx + 4, y - 16, tw - 8, 4);

      // Золотые подлокотники
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(tx, y - 20, 6, 10);
      ctx.fillRect(tx + tw - 6, y - 20, 6, 10);

      // Золотые ножки трона
      ctx.fillStyle = '#b45309';
      ctx.fillRect(tx + 2, y - 4, 4, 4);
      ctx.fillRect(tx + tw - 6, y - 4, 4, 4);
      break;
    }
  }

  ctx.restore();
}

/**
 * 1. ОТРИСОВКА ВЕРТИКАЛЬНОЙ КЛЕТКИ (СЕТКА, КАРКАС, ПОЛОЧКИ ЭТАЖЕЙ И ИГРУШКИ)
 * Рисуется по всей доступной высоте клетки (в зависимости от tier).
 */
export function drawVerticalCageScenery(
  ctx: CanvasRenderingContext2D,
  tier: CageTier,
  cageColorId: CageColorId = 'silver',
  timeSec: number = 0,
  floorStyleId: FloorStyleId = 'natural_oak',
  tierToys: TierToysConfig = { floor2Toy: 'seesaw', floor3Toy: 'telescope' },
  activeToyFloor?: 2 | 3 | null,
  toyPositions?: {
    floor2ToyX?: number;
    floor2ToyY?: number;
    floor3ToyX?: number;
    floor3ToyY?: number;
  }
) {
  const cPal = CAGE_COLOR_PALETTES[cageColorId] || CAGE_COLOR_PALETTES.silver;

  // Верхняя и нижняя границы клетки в координатах мира
  const topY = tier === 1 ? 0 : tier === 2 ? -180 : -360;
  const bottomY = 180;
  const totalH = bottomY - topY;

  // 1. Задний фон комнаты за клеткой
  ctx.fillStyle = '#181528';
  ctx.fillRect(0, topY, 480, totalH);

  // Вертикальные декоративные деревянные рейки стены
  ctx.fillStyle = '#221e35';
  for (let x = 0; x < 480; x += 16) {
    ctx.fillRect(x, topY, 8, totalH);
  }

  // 2. Металлическая решетка клетки
  ctx.fillStyle = cPal.wire;
  for (let x = 12; x < 480 - 12; x += 12) {
    ctx.fillRect(x, topY + 12, 2, totalH - 24);
  }

  // Горизонтальные ребра жесткости сетки
  const hBars = [
    topY + 14,
    topY + 70,
    topY + 125,
    ...(tier >= 2 ? [-110, -55, 0] : []),
    ...(tier === 3 ? [-290, -235, -180] : []),
    16,
    70,
    125,
  ];

  hBars.forEach((by) => {
    ctx.fillStyle = cPal.wireShadow;
    ctx.fillRect(12, by + 1, 480 - 24, 2);
    ctx.fillStyle = cPal.wire;
    ctx.fillRect(12, by, 480 - 24, 2);
    ctx.fillStyle = cPal.wireHighlight;
    ctx.fillRect(12, by, 480 - 24, 1);
  });

  // Внешний несущий каркас клетки (боковые стойки)
  ctx.fillStyle = cPal.frame;
  ctx.fillRect(6, topY + 4, 6, totalH - 8);
  ctx.fillRect(480 - 12, topY + 4, 6, totalH - 8);

  ctx.fillStyle = cPal.frameHighlight;
  ctx.fillRect(7, topY + 4, 2, totalH - 8);
  ctx.fillRect(480 - 11, topY + 4, 2, totalH - 8);

  // Крыша клетки
  if (tier === 1) {
    pRect(ctx, 6, 8, 468, 6, cPal.frame);
    pRect(ctx, 6, 8, 468, 2, cPal.frameHighlight);
  } else if (tier === 2) {
    pRect(ctx, 6, -174, 468, 6, cPal.frame);
    pRect(ctx, 6, -174, 468, 2, cPal.frameHighlight);
  } else if (tier === 3) {
    // Арочная крыша со смотровой ручкой для переноски на 3-м этаже
    pRect(ctx, 6, -354, 468, 6, cPal.frame);
    pRect(ctx, 6, -354, 468, 2, cPal.frameHighlight);
    pRect(ctx, 200, -370, 80, 5, cPal.frame);
    pRect(ctx, 200, -370, 80, 2, cPal.frameHighlight);
    pRect(ctx, 200, -366, 6, 14, cPal.frame);
    pRect(ctx, 274, -366, 6, 14, cPal.frame);
  }

  // ==========================================================================
  // ПОЛЫ И ПЛАТФОРМЫ ЭТАЖЕЙ
  // ==========================================================================

  // ЭТАЖ 2: Массивная мезонин-платформа толщиной 24px + игрушка
  if (tier >= 2) {
    const f2Y = VERTICAL_FLOORS[2].platformY; // -28
    // Отрисовка платформы с выбранным стилем пола
    drawPlatformWithFloorStyle(ctx, 20, f2Y, 440, floorStyleId, cPal, timeSec);

    // Отрисовка выбранной игрушки 2-го этажа в игровой зоне (позиция настраивается)
    const t2X = toyPositions?.floor2ToyX ?? 235;
    const t2Y = toyPositions?.floor2ToyY ?? f2Y;
    drawFloor2Toy(
      ctx,
      tierToys.floor2Toy,
      t2X,
      t2Y,
      timeSec,
      activeToyFloor === 2
    );
  }

  // ЭТАЖ 3: Массивная пентхаус-платформа толщиной 24px + игрушка + обсерватория
  if (tier === 3) {
    const f3Y = VERTICAL_FLOORS[3].platformY; // -208
    // Отрисовка платформы с выбранным стилем пола
    drawPlatformWithFloorStyle(ctx, 20, f3Y, 440, floorStyleId, cPal, timeSec);

    // Отрисовка выбранной игрушки 3-го этажа на террасе (позиция настраивается)
    const t3X = toyPositions?.floor3ToyX ?? 145;
    const t3Y = toyPositions?.floor3ToyY ?? f3Y;
    drawFloor3Toy(
      ctx,
      tierToys.floor3Toy,
      t3X,
      t3Y,
      timeSec,
      activeToyFloor === 3
    );

    // Смотровой купол / обсерватория на 3-м этаже (x: 230 .. 290)
    pRect(ctx, 230, f3Y - 96, 60, 96, '#1e1035');
    pRect(ctx, 232, f3Y - 98, 56, 4, '#6d28d9');
    pRect(ctx, 238, f3Y - 102, 44, 4, '#8b5cf6');
    pRect(ctx, 256, f3Y - 108, 8, 6, '#fbbf24'); // Золотистый шпиль
    // Панорамное окно обсерватории
    pRect(ctx, 238, f3Y - 86, 44, 36, '#38bdf8');
    pRect(ctx, 242, f3Y - 82, 36, 28, '#e0f2fe');
    pRect(ctx, 259, f3Y - 86, 2, 36, '#0284c7');
    pRect(ctx, 238, f3Y - 68, 44, 2, '#0284c7');
  }
}

// ----------------------------------------------------------------------------
// 2. ОТРИСОВКА ДИАГОНАЛЬНЫХ ТУННЕЛЕЙ (2 СЛОЯ: ЗАДНИЙ И ПЕРЕДНИЙ)
// ----------------------------------------------------------------------------

/**
 * Вычисление геометрии и угла наклона диагонального цилиндра
 */
export function getTunnelGeometry(tunnelIndex: 1 | 2) {
  const cfg = DIAGONAL_TUNNELS[tunnelIndex];
  const x1 = cfg.startX;
  const y1 = cfg.startY;
  const x2 = cfg.endX;
  const y2 = cfg.endY;
  const r = cfg.radius;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const nx = -dy / len;
  const ny = dx / len;

  return {
    x1,
    y1,
    x2,
    y2,
    dx,
    dy,
    len,
    angle,
    nx,
    ny,
    r,
    p1: { x: x1 + r * nx, y: y1 + r * ny },
    p2: { x: x2 + r * nx, y: y2 + r * ny },
    p3: { x: x2 - r * nx, y: y2 - r * ny },
    p4: { x: x1 - r * nx, y: y1 - r * ny },
  };
}

/**
 * 2.1 ЗАДНИЙ СЛОЙ ТУННЕЛЯ (ВНУТРЕННЕЕ ПРОСТРАНСТВО ТРУБЫ)
 * Рисуется ДО хомячка, строго когда opacity > 0!
 */
export function drawDiagonalTunnelBack(
  ctx: CanvasRenderingContext2D,
  tunnelIndex: 1 | 2,
  tunnelColorId: TunnelColorId = 'neon_cyan',
  opacity: number = 1.0
) {
  if (opacity <= 0.01) return;

  const geom = getTunnelGeometry(tunnelIndex);
  const tPal = TUNNEL_COLOR_PALETTES[tunnelColorId] || TUNNEL_COLOR_PALETTES.neon_cyan;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  // Темный внутренний канал трубы (фон за хомяком)
  ctx.fillStyle = '#080c18';
  ctx.beginPath();
  ctx.moveTo(geom.p1.x, geom.p1.y);
  ctx.lineTo(geom.p2.x, geom.p2.y);
  ctx.lineTo(geom.p3.x, geom.p3.y);
  ctx.lineTo(geom.p4.x, geom.p4.y);
  ctx.closePath();
  ctx.fill();

  // Глубокое фоновое свечение внутри трубы выбранного оттенка
  ctx.fillStyle = tPal.glassFill;
  ctx.fill();

  // Входной раструб снизу (на стартовом этаже)
  pRect(ctx, geom.x1 - 22, geom.y1 - 18, 44, 36, '#1e293b');
  pRect(ctx, geom.x1 - 18, geom.y1 - 14, 36, 28, '#0f172a');

  // Выходной раструб сверху (на целевом этаже)
  pRect(ctx, geom.x2 - 22, geom.y2 - 18, 44, 36, '#1e293b');
  pRect(ctx, geom.x2 - 18, geom.y2 - 14, 36, 28, '#0f172a');

  ctx.restore();
}

/**
 * 2.2 ПЕРЕДНИЙ СЛОЙ ТУННЕЛЯ (АКРИЛОВЫЙ ФАСАД, ВЫБРАННАЯ ТЕКСТУРА, БЛИКИ, МУФТЫ)
 * Рисуется ПОСЛЕ хомячка! Хомяк виден ВНУТРИ полупрозрачной трубы!
 */
export function drawDiagonalTunnelFront(
  ctx: CanvasRenderingContext2D,
  tunnelIndex: 1 | 2,
  tunnelColorId: TunnelColorId = 'neon_cyan',
  opacity: number = 1.0,
  timeSec: number = 0,
  tunnelTextureId: TunnelTextureId = 'smooth_glass'
) {
  if (opacity <= 0.01) return;

  const geom = getTunnelGeometry(tunnelIndex);
  const tPal = TUNNEL_COLOR_PALETTES[tunnelColorId] || TUNNEL_COLOR_PALETTES.neon_cyan;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  // Переходим в локальную систему координат цилиндра трубы:
  // Начало (0, 0) в x1, y1; ось X направлена вдоль длины трубы; ось Y перпендикулярна.
  ctx.translate(geom.x1, geom.y1);
  ctx.rotate(geom.angle);

  // 1. Полупрозрачная тонированная акриловая стенка
  ctx.fillStyle = tPal.glassFill;
  ctx.fillRect(0, -geom.r, geom.len, 2 * geom.r);

  // 2. ОТРИСОВКА ВЫБРАННОЙ ТЕКСТУРЫ / ДЕКОРАТИВНОГО УЗОРА
  switch (tunnelTextureId) {
    case 'spiral_candy': {
      // Спиральные диагональные витые полосы (как в леденце / классическом Habitrail)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, -geom.r, geom.len, 2 * geom.r);
      ctx.clip();

      const stripeW = 9;
      const stripeGap = 20;
      const period = stripeW + stripeGap;
      const phase = (timeSec * 28) % period;

      for (let sx = -geom.r * 2 - period; sx < geom.len + geom.r * 2 + period; sx += period) {
        const curX = sx + phase;
        // Белая карамельная полоса
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = stripeW;
        ctx.beginPath();
        ctx.moveTo(curX, -geom.r - 2);
        ctx.lineTo(curX + 2.2 * geom.r, geom.r + 2);
        ctx.stroke();

        // Тонкая цветная кайма полосы
        ctx.strokeStyle = tPal.jointRingAccent;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(curX + 2, -geom.r - 2);
        ctx.lineTo(curX + 2.2 * geom.r + 2, geom.r + 2);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'ribbed_rings': {
      // Ребристая гофрированная гибкая труба (кольца гофры через каждые 12px)
      ctx.save();
      for (let rx = 10; rx < geom.len - 8; rx += 12) {
        // Тень желобка
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(rx, -geom.r, 2, 2 * geom.r);
        // Светлый валик ребра
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(rx + 2, -geom.r, 2, 2 * geom.r);
        // Неоновый блик в центре ребра
        ctx.fillStyle = tPal.jointRingAccent;
        ctx.fillRect(rx + 1, -geom.r + 3, 1, 2 * geom.r - 6);
      }
      ctx.restore();
      break;
    }

    case 'star_glitter': {
      // Звездная пыль: искрящиеся 4-лучевые пиксельные звезды и блестки в акриле
      ctx.save();
      const starCount = Math.floor(geom.len / 20);
      for (let i = 0; i < starCount; i++) {
        const sx = 12 + i * 20 + ((i * 7) % 8);
        const sy = -geom.r + 6 + ((i * 13) % (2 * geom.r - 12));
        const twinkle = Math.sin(timeSec * 3.5 + i * 1.8) > 0.15;
        const color = twinkle ? '#ffffff' : tPal.jointRingAccent;

        // 4-лучевая звезда
        ctx.fillStyle = color;
        ctx.fillRect(sx, sy, 2, 2);
        ctx.fillRect(sx - 2, sy, 6, 2);
        ctx.fillRect(sx, sy - 2, 2, 6);

        // Вспомогательная искорка
        if (i % 2 === 0) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(sx + 7, sy + (i % 3 === 0 ? -4 : 4), 2, 2);
        }
      }
      ctx.restore();
      break;
    }

    case 'honeycomb_cyber': {
      // Кибер-соты: футуристическая шестиугольная сетка с узлами питания
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, -geom.r, geom.len, 2 * geom.r);
      ctx.clip();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.5;
      const hStep = 18;
      for (let hx = 8; hx < geom.len + 12; hx += hStep) {
        for (let hy = -geom.r + 6; hy < geom.r; hy += 12) {
          const isRowAlt = Math.floor(hy / 12) % 2 === 0;
          const px = hx + (isRowAlt ? 9 : 0);
          ctx.strokeRect(px - 4, hy - 4, 8, 8);

          // Светящийся узел
          ctx.fillStyle = tPal.jointRingAccent;
          ctx.fillRect(px - 1, hy - 1, 2, 2);
        }
      }
      ctx.restore();
      break;
    }

    case 'hazard_chevrons': {
      // Спортивный трек: динамичные шевроны-стрелки >>> направления скорости
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, -geom.r, geom.len, 2 * geom.r);
      ctx.clip();

      const cStep = 32;
      const cPhase = (timeSec * 36) % cStep;

      for (let cx = -cStep; cx < geom.len + cStep; cx += cStep) {
        const xPos = cx + cPhase;
        // Толстая цветная стрелка
        ctx.strokeStyle = tPal.jointRingAccent;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(xPos - 8, -geom.r + 4);
        ctx.lineTo(xPos + 6, 0);
        ctx.lineTo(xPos - 8, geom.r - 4);
        ctx.stroke();

        // Белый острый блик
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(xPos - 11, -geom.r + 4);
        ctx.lineTo(xPos + 3, 0);
        ctx.lineTo(xPos - 11, geom.r - 4);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'bubble_plastic': {
      // Пузырьковый акрил: застывшие пузырьки воздуха с бликами
      ctx.save();
      const bCount = Math.floor(geom.len / 15);
      for (let b = 0; b < bCount; b++) {
        const bx = 10 + b * 15 + ((b * 9) % 7);
        const floatY = Math.sin(timeSec * 2.2 + b * 1.1) * 2;
        const by = -geom.r + 8 + ((b * 19) % (2 * geom.r - 16)) + floatY;
        const bRadius = 2.5 + (b % 4) * 0.8;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, by, bRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Блик на пузырьке
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - bRadius * 0.5, by - bRadius * 0.5, 1.5, 1.5);
      }
      ctx.restore();
      break;
    }

    case 'circuit_board': {
      // Электронная плата: дорожки микросхемы и контактные площадки
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, -geom.r, geom.len, 2 * geom.r);
      ctx.clip();

      ctx.strokeStyle = tPal.jointRingAccent;
      ctx.lineWidth = 2;
      const tStep = 26;
      for (let tx = 14; tx < geom.len - 12; tx += tStep) {
        const isAlt = (tx / tStep) % 2 === 0;
        const yTrace = isAlt ? -geom.r + 7 : geom.r - 7;
        ctx.beginPath();
        ctx.moveTo(tx, yTrace);
        ctx.lineTo(tx + 8, 0);
        ctx.lineTo(tx + 20, 0);
        ctx.stroke();

        // Контактные пины и чип
        ctx.fillStyle = '#fde047';
        ctx.fillRect(tx - 2, yTrace - 2, 4, 4);
        ctx.fillRect(tx + 20 - 2, -2, 4, 4);
      }
      ctx.restore();
      break;
    }

    case 'smooth_glass':
    default: {
      // Гладкий кристалл: тонкие продольные рефракционные нити
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, -0.25 * geom.r);
      ctx.lineTo(geom.len - 10, -0.25 * geom.r);
      ctx.moveTo(16, 0.35 * geom.r);
      ctx.lineTo(geom.len - 16, 0.35 * geom.r);
      ctx.stroke();
      break;
    }
  }

  // 3. Внешние контуры трубы (толстые акриловые стенки)
  ctx.strokeStyle = tPal.glassStroke;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -geom.r);
  ctx.lineTo(geom.len, -geom.r);
  ctx.moveTo(0, geom.r);
  ctx.lineTo(geom.len, geom.r);
  ctx.stroke();

  // 4. Яркий стеклянный блик вдоль верхней стенки
  ctx.strokeStyle = tPal.glassHighlight;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(4, -0.6 * geom.r);
  ctx.lineTo(geom.len - 4, -0.6 * geom.r);
  ctx.stroke();

  // Тонкий вторичный рефлекс снизу
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(10, 0.7 * geom.r);
  ctx.lineTo(geom.len - 10, 0.7 * geom.r);
  ctx.stroke();

  // 5. Мощные муфты-кольца жесткости (Connectors)
  const ringSteps = [0.18, 0.38, 0.58, 0.78, 0.94];
  ringSteps.forEach((t) => {
    const rx = geom.len * t;
    const wR = geom.r + 3;

    // Корпус муфты
    ctx.fillStyle = tPal.jointRing;
    ctx.fillRect(rx - 5, -wR, 10, 2 * wR);

    // Неоновый акцентный обод
    ctx.fillStyle = tPal.jointRingAccent;
    ctx.fillRect(rx - 1.5, -wR - 1, 3, 2 * wR + 2);

    // Заклепки / винты
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx - 1, -wR + 2, 2, 2);
    ctx.fillRect(rx - 1, wR - 4, 2, 2);
  });

  // 6. Вентиляционные прорези вдоль трубы для дыхания хомячка
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  for (let vx = 16; vx < geom.len - 16; vx += 18) {
    ctx.fillRect(vx - 2, -2, 4, 4);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let vx = 16; vx < geom.len - 16; vx += 18) {
    ctx.fillRect(vx - 2, 2, 4, 1);
  }

  // 7. Неоновые бегущие световые частицы воздуха внутри трубы
  const animPhase = (timeSec * 0.9) % 1;
  for (let k = 0; k < 5; k++) {
    const pt = (animPhase + k * 0.2) % 1;
    const px = pt * geom.len;
    const py = Math.sin(pt * 12 + timeSec * 2) * (geom.r * 0.35);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(px), Math.floor(py), 3, 3);
  }

  // 8. Декоративные порталы раструбов на концах трубы
  ctx.fillStyle = tPal.jointRing;
  ctx.fillRect(-6, -geom.r - 4, 8, 2 * geom.r + 8);
  ctx.fillStyle = tPal.jointRingAccent;
  ctx.fillRect(-2, -geom.r - 2, 4, 2 * geom.r + 4);

  ctx.fillStyle = tPal.jointRing;
  ctx.fillRect(geom.len - 2, -geom.r - 4, 8, 2 * geom.r + 8);
  ctx.fillStyle = tPal.jointRingAccent;
  ctx.fillRect(geom.len - 2, -geom.r - 2, 4, 2 * geom.r + 4);

  ctx.restore();
}

/**
 * Legacy-совместимость для старых вызовов
 */
export const FLOOR_COORDS = {
  floor1: { y: 110, minX: 30, maxX: 440 },
  floor2: { y: -70, minX: 30, maxX: 440, platformY: -62 },
  floor3: { y: -250, minX: 30, maxX: 440, platformY: -242 },
};

export function drawCageTiersBackground(
  ctx: CanvasRenderingContext2D,
  tier: CageTier,
  timeSec: number = 0
) {
  // Handled by drawVerticalCageScenery
}

export function drawCageTunnelsForeground(
  ctx: CanvasRenderingContext2D,
  tier: CageTier,
  timeSec: number = 0
) {
  // Handled by drawDiagonalTunnelFront
}
