/**
 * ============================================================================
 * МОДУЛЬ ТИПИЗАЦИИ: ПИКСЕЛЬНЫЙ 2D ТАМАГОЧИ "ХОМЯЧОК" (V3 ТЕМЫ И МУЗЫКА)
 * ============================================================================
 */

export enum HamsterBehavior {
  IDLE = 'IDLE',
  WALK = 'WALK',
  LAYING = 'LAYING',
  SLEEP = 'SLEEP',
  EATING = 'EATING',
  DRINKING = 'DRINKING',
  POOPING = 'POOPING',
  WHEEL = 'WHEEL',
  GROOM = 'GROOM',
  SNIFF = 'SNIFF',
  PLAYING_TOY = 'PLAYING_TOY',
}

export interface HamsterNeeds {
  hunger: number;
  energy: number;
  hygiene: number;
  happiness: number;
  health: number;
}

export interface DisabledStatsConfig {
  hunger: boolean;
  energy: boolean;
  hygiene: boolean;
  happiness: boolean;
  health: boolean;
}

export type BowlType =
  | 'clay'
  | 'wood'
  | 'neon'
  | 'royal'
  | 'coconut_shell'
  | 'watermelon'
  | 'leaf_plate'
  | 'space_tray'
  | 'heart_ceramic'
  | 'golden_acorn'
  | 'cat_dish'
  | 'crystal_geode'
  | 'vintage_tea_saucer'
  | 'bamboo_trough'
  | 'cookie_bowl'
  | 'pumpkin_bowl'
  | 'lava_stone'
  | 'ice_chalice'
  | 'magic_cauldron'
  | 'cheese_plate';

export type WaterBottleType =
  | 'ball'
  | 'flask'
  | 'fountain'
  | 'bamboo_drip'
  | 'cyber_tube'
  | 'honey_drop'
  | 'potion_bottle'
  | 'dew_leaf'
  | 'cloud_rain'
  | 'space_hydration'
  | 'crystal_stalactite'
  | 'vintage_teapot'
  | 'baby_bottle'
  | 'soda_dispenser'
  | 'rainbow_flask'
  | 'acorn_canteen'
  | 'plasma_cooler'
  | 'magic_chalice'
  | 'spring_well'
  | 'zen_bamboo_stream';
export type HouseType =
  | 'log_cabin'
  | 'mushroom_cottage'
  | 'coconut_hut'
  | 'cardboard_fort'
  | 'stone_castle'
  | 'gingerbread_house'
  | 'teapot_manor'
  | 'swiss_cheese'
  | 'acorn_villa'
  | 'japanese_pagoda'
  | 'cyber_bunker'
  | 'strawberry_loft'
  | 'pumpkin_shack'
  | 'ice_igloo'
  | 'cactus_ranch'
  | 'retro_tv'
  | 'flower_pot'
  | 'honeycomb_hive'
  | 'space_capsule'
  | 'crystal_cave'
  | 'coconut'
  | 'mushroom'
  | 'box';

export type WheelType =
  | 'classic'
  | 'wood_spoke'
  | 'cyber_neon'
  | 'golden_sun'
  | 'donut'
  | 'rainbow'
  | 'flower_daisy'
  | 'space_gyro'
  | 'racing_tire'
  | 'crystal_spinner'
  | 'candy_peppermint'
  | 'bubble_aqua'
  | 'steampunk_gear'
  | 'galaxy_spiral'
  | 'watermelon_spin'
  | 'clockwork'
  | 'cheese_wheel'
  | 'lava_vortex'
  | 'acorn_spinner'
  | 'zen_bamboo';

export interface FurniturePositions {
  houseX: number;
  houseY: number;
  wheelX: number;
  wheelY: number;
  bowlX: number;
  bowlY: number;
  bottleX: number;
  bottleY: number;
  floor2ToyX?: number;
  floor2ToyY?: number;
  floor3ToyX?: number;
  floor3ToyY?: number;
}

export interface FurnitureConfig {
  bowl: BowlType;
  waterBottle: WaterBottleType;
  house: HouseType;
  wheel?: WheelType;
  positions?: Partial<FurniturePositions>;
  bowlFoodLevel: number;
  currentFoodId: string | null;
  bottleWaterLevel?: number; // 0..100%
  currentDrinkId?: string | null;
  drinkColor?: string; // hex color of current drink/juice/water
}

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

export interface DrinkItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  liquidColor: string;
  hungerGain: number;
  energyGain: number;
  happinessGain: number;
  healthGain: number;
  drinkingDurationSec: number;
}

export interface HamsterPalette {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  fur: string;
  furDark: string;
  furLight?: string;
  belly: string;
  pink: string;
  eyes: string;
  eyeHighlight: string;
  cheeks: string;
  paws: string;
}

export type PixelGrid = (string | null)[][];

export interface CustomSpriteData {
  id: string;
  name: string;
  width: number;
  height: number;
  frames: PixelGrid[];
  fps: number;
  createdAt: number;
}

export interface PoopItem {
  id: string;
  x: number;
  y: number;
  createdAt: number;
}

export interface EmoteBubble {
  id: string;
  emoji:
    | '💖'
    | '💤'
    | '🌾'
    | '💩'
    | '⚡'
    | '⚠️'
    | '💧'
    | '✨'
    | '🎡'
    | '🧼'
    | '🌸'
    | '🎵'
    | '☀️'
    | '🏠'
    | '🤤'
    | '🍔'
    | '😮'
    | '🚇'
    | '🌟'
    | '🧃'
    | '🥤'
    | '🥕'
    | '🍎'
    | '🍓'
    | '🥛'
    | '🍇'
    | '🥦'
    | '🥒'
    | '🫐'
    | '🍑'
    | '🌰'
    | '🧀'
    | '🥜'
    | '🍪'
    | '🍉'
    | '🍌'
    | '🌻'
    | string;
  createdAt: number;
  durationMs: number;
  offsetY: number;
  opacity: number;
}

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
 * Идентификаторы тем оформления приложения
 */
export type AppThemeId =
  | 'retro_arcade'
  | 'gameboy_classic'
  | 'cyberpunk_neon'
  | 'cozy_autumn'
  | 'pastel_dream'
  | 'midnight_synth';

/**
 * Конфигурация цветовой темы всего интерфейса
 */
export interface AppTheme {
  id: AppThemeId;
  name: string;
  nameEn: string;
  icon: string;
  bodyBg: string;
  consoleBg: string;
  consoleBorder: string;
  cardBg: string;
  headerColor: string;
  accentColor: string;
}

/**
 * Режим воспроизведения фоновой музыки
 */
export type PlaybackMode = 'loop' | 'shuffle' | 'sequential';

/**
 * Настройки 8-битной фоновой музыки
 */
export interface MusicConfig {
  isPlaying: boolean;
  currentTrackIndex: number;
  volume: number;
  mode: PlaybackMode;
}

/**
 * Описание музыкального трека
 */
export interface MusicTrack {
  id: number;
  title: string;
  titleEn: string;
  mood: string;
  tempo: number; // BPM
  durationSec: number;
}

/**
 * Полное состояние игры Тамагочи, сохраняемое в localStorage
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
  zenMode: boolean;
  disabledStats: DisabledStatsConfig;
  /** Выбранная тема оформления приложения */
  themeId: AppThemeId;
  /** Настройки музыки */
  musicConfig: MusicConfig;
  /** Принудительный выбор яруса клетки в Dev/Admin режиме (1, 2, 3) */
  adminCageTierOverride?: CageTier | null;
  /** Выбранный цвет прутьев и каркаса клетки */
  cageColor?: CageColorId;
  /** Выбранный цвет акриловых прозрачных туннелей */
  tunnelColor?: TunnelColorId;
  /** Выбранная текстура/узор акриловых туннелей */
  tunnelTexture?: TunnelTextureId;
  /** Выбранный стиль/материал покрытия пола 2 и 3 этажей */
  floorStyle?: FloorStyleId;
  /** Выбранные игрушки для 2-го и 3-го этажей */
  tierToys?: TierToysConfig;
}

export type CageTier = 1 | 2 | 3;

/**
 * Идентификаторы расцветок клетки (прутья, каркас, акценты поддона)
 */
export type CageColorId =
  | 'silver'
  | 'gold'
  | 'cyber_cyan'
  | 'midnight_black'
  | 'rose_pastel'
  | 'emerald'
  | 'violet'
  | 'pure_white';

/**
 * Идентификаторы расцветок акриловых прозрачных туннелей
 */
export type TunnelColorId =
  | 'neon_cyan'
  | 'hot_pink'
  | 'solar_orange'
  | 'emerald_lime'
  | 'cosmic_purple'
  | 'crystal_clear'
  | 'ruby_red'
  | 'electric_yellow';

/**
 * Идентификаторы текстур и визуальных узоров для диагональных туннелей
 */
export type TunnelTextureId =
  | 'smooth_glass'
  | 'spiral_candy'
  | 'ribbed_rings'
  | 'star_glitter'
  | 'honeycomb_cyber'
  | 'hazard_chevrons'
  | 'bubble_plastic'
  | 'circuit_board';

/**
 * Идентификаторы отделочных материалов/покрытий полов 2-го и 3-го этажей
 */
export type FloorStyleId =
  | 'natural_oak'
  | 'soft_fleece'
  | 'ceramic_mosaic'
  | 'bamboo_tatami'
  | 'cyber_circuit'
  | 'royal_marble'
  | 'candy_pastels'
  | 'cheese_board';

/**
 * Идентификаторы игрушек для 2-го этажа (Мезонин)
 */
export type Floor2ToyId =
  | 'seesaw'
  | 'hammock'
  | 'wood_chew'
  | 'cardboard_tunnel';

/**
 * Идентификаторы игрушек для 3-го этажа (Пентхаус)
 */
export type Floor3ToyId =
  | 'telescope'
  | 'sand_bath'
  | 'saucer_spinner'
  | 'plush_throne';

export interface TierToysConfig {
  floor2Toy: Floor2ToyId;
  floor3Toy: Floor3ToyId;
}

export interface TunnelTransitionState {
  active: boolean;
  fromFloor: 1 | 2 | 3;
  toFloor: 1 | 2 | 3;
  progress: number; // 0..1
  opacity: number; // 0..1 (fading in / fading out)
  tunnelIndex: 1 | 2; // 1: floor 1 <-> 2, 2: floor 2 <-> 3
}

export type PixelEditorTool = 'pencil' | 'eraser' | 'fill' | 'dropper';

