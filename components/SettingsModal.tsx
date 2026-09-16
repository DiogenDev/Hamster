/**
 * ============================================================================
 * КОМПОНЕНТ: SettingsModal (Единый Центр Настроек и Кастомизации)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ОЧИСТКА ГЛАВНОГО ЭКРАНА:
 *    Все второстепенные и конфигурационные функции собраны здесь во вкладках:
 *    - 🎨 Темы оформления (6 стилей консоли и фона)
 *    - 🎵 Музыкальный центр (16 треков по 45 секунд, режимы Зациклить/Микс/По порядку)
 *    - 🏠 Интерьер клетки (миски, поилки, домики)
 *    - 🖌️ Скин хомячка (пиксельная мастерская)
 *    - ✨ Дзен & Тонкая настройка потребностей
 *    - 🐹 Питомец (кличка, 20 пород)
 *    - 🔊 Звук & Сброс прогресса
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { HAMSTER_PALETTES } from '@/utils/hamsterSprites';
import { APP_THEMES } from '@/utils/themePresets';
import { musicPlayer, TRACK_LIST, TRACK_DURATION_SEC } from '@/utils/musicEngine';
import {
  DisabledStatsConfig,
  AppThemeId,
  FurnitureConfig,
  BowlType,
  WaterBottleType,
  HouseType,
  WheelType,
  PlaybackMode,
  CageTier,
  CageColorId,
  TunnelColorId,
  TunnelTextureId,
  FloorStyleId,
  Floor2ToyId,
  Floor3ToyId,
  TierToysConfig,
} from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';
import {
  HOUSE_PRESETS,
  drawHousePreview,
  normalizeHouseId,
} from '@/utils/housePresets';
import {
  BOWL_PRESETS,
  BOTTLE_PRESETS,
  drawBowlPreview,
  drawBottlePreview,
} from '@/utils/furniturePresets';
import {
  WHEEL_PRESETS,
  drawWheelPreview,
} from '@/utils/wheelPresets';
import {
  CAGE_TIERS,
  CAGE_COLOR_PALETTES,
  TUNNEL_COLOR_PALETTES,
  TUNNEL_TEXTURE_PRESETS,
  FLOOR_STYLE_PRESETS,
  FLOOR2_TOY_PRESETS,
  FLOOR3_TOY_PRESETS,
} from '@/utils/cageTiers';
import {
  areNotificationsEnabled,
  setNotificationsEnabled,
  requestNotificationPermission,
  notifyHamsterNeed,
} from '@/utils/notificationService';

export type SettingsTab =
  | 'tiers'
  | 'cage'
  | 'tunnels'
  | 'corrugation'
  | 'floors'
  | 'toys'
  | 'furniture'
  | 'themes'
  | 'music'
  | 'skin'
  | 'zen'
  | 'pet'
  | 'audio';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPetName: string;
  currentPaletteId: string;
  currentThemeId: AppThemeId;
  soundEnabled: boolean;
  soundVolume: number;
  zenMode: boolean;
  disabledStats: DisabledStatsConfig;
  currentFurniture: FurnitureConfig;
  hasCustomSkin: boolean;
  initialTab?: SettingsTab;
  cageTier?: CageTier;
  adminCageTierOverride?: CageTier | null;
  currentCageColor?: CageColorId;
  currentTunnelColor?: TunnelColorId;
  currentTunnelTexture?: TunnelTextureId;
  currentFloorStyle?: FloorStyleId;
  currentTierToys?: TierToysConfig;
  onUpdateSettings: (params: {
    petName: string;
    paletteId: string;
    themeId: AppThemeId;
    soundEnabled: boolean;
    soundVolume: number;
    zenMode: boolean;
    disabledStats: DisabledStatsConfig;
    tierOverride?: CageTier | null;
    cageColor?: CageColorId;
    tunnelColor?: TunnelColorId;
    tunnelTexture?: TunnelTextureId;
    floorStyle?: FloorStyleId;
    tierToys?: TierToysConfig;
  }) => void;
  onSaveFurniture: (furniture: FurnitureConfig) => void;
  onOpenPixelEditor: () => void;
  onResetToDefaultSkin: () => void;
  onResetProgress: () => void;
}

/**
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: СПРАЙТ ПРЕДПРОСМОТРА КОРМУШКИ
 */
const BowlPreviewCanvas: React.FC<{ bowlType: BowlType }> = ({ bowlType }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      drawBowlPreview(canvasRef.current, bowlType);
    }
  }, [bowlType]);

  return (
    <canvas
      ref={canvasRef}
      width={56}
      height={36}
      className="w-[56px] h-[36px] block bg-black/40 border border-black/80 rounded shadow-inner"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

/**
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: СПРАЙТ ПРЕДПРОСМОТРА ПОИЛКИ
 */
const BottlePreviewCanvas: React.FC<{ bottleType: WaterBottleType }> = ({ bottleType }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      drawBottlePreview(canvasRef.current, bottleType);
    }
  }, [bottleType]);

  return (
    <canvas
      ref={canvasRef}
      width={44}
      height={70}
      className="w-[44px] h-[70px] block bg-black/40 border border-black/80 rounded shadow-inner"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

/**
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: СПРАЙТ ПРЕДПРОСМОТРА ДОМИКА
 * ----------------------------------------------------------------------------
 * Рендерит индивидуальный 2-слойный пиксель-арт домика со спящим хомячком
 * внутри миниатюрного холста 88x76 с целочисленным скейлингом.
 */
const HousePreviewCanvas: React.FC<{ houseType: HouseType }> = ({ houseType }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      drawHousePreview(canvasRef.current, houseType);
    }
  }, [houseType]);

  return (
    <canvas
      ref={canvasRef}
      width={88}
      height={76}
      className="w-[88px] h-[76px] block bg-black/40 border border-black/80 rounded shadow-inner"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

/**
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: СПРАЙТ ПРЕДПРОСМОТРА БЕГОВОГО КОЛЕСА
 * ----------------------------------------------------------------------------
 * Рендерит индивидуальный 2-слойный пиксель-арт бегового колеса с ободом,
 * ступицей и спицами на миниатюрном холсте 72x72.
 */
const WheelPreviewCanvas: React.FC<{ wheelType: WheelType }> = ({ wheelType }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      drawWheelPreview(canvasRef.current, wheelType);
    }
  }, [wheelType]);

  return (
    <canvas
      ref={canvasRef}
      width={72}
      height={72}
      className="w-[72px] h-[72px] block bg-black/40 border border-black/80 rounded shadow-inner"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentPetName,
  currentPaletteId,
  currentThemeId,
  soundEnabled,
  soundVolume,
  zenMode,
  disabledStats,
  currentFurniture,
  hasCustomSkin,
  initialTab = 'tiers',
  cageTier = 1,
  adminCageTierOverride,
  currentCageColor = 'silver',
  currentTunnelColor = 'neon_cyan',
  currentTunnelTexture = 'smooth_glass',
  currentFloorStyle = 'natural_oak',
  currentTierToys = { floor2Toy: 'seesaw', floor3Toy: 'telescope' },
  onUpdateSettings,
  onSaveFurniture,
  onOpenPixelEditor,
  onResetToDefaultSkin,
  onResetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [petName, setPetName] = useState<string>(currentPetName);
  const [paletteId, setPaletteId] = useState<string>(currentPaletteId);
  const [themeId, setThemeId] = useState<AppThemeId>(currentThemeId || 'retro_arcade');
  const [isSoundOn, setIsSoundOn] = useState<boolean>(soundEnabled);
  const [volume, setVolume] = useState<number>(soundVolume);
  const [notifEnabled, setNotifEnabled] = useState<boolean>(areNotificationsEnabled());
  const [notifStatusMsg, setNotifStatusMsg] = useState<string>('');
  const [isZen, setIsZen] = useState<boolean>(zenMode);
  const [statsConfig, setStatsConfig] = useState<DisabledStatsConfig>(disabledStats);
  const [furniture, setFurniture] = useState<FurnitureConfig>(currentFurniture);
  const [selectedTier, setSelectedTier] = useState<CageTier>(
    (adminCageTierOverride ?? cageTier ?? 1) as CageTier
  );
  const [isAutoProgress, setIsAutoProgress] = useState<boolean>(
    adminCageTierOverride === null || adminCageTierOverride === undefined
  );
  const [cageColor, setCageColor] = useState<CageColorId>(currentCageColor || 'silver');
  const [tunnelColor, setTunnelColor] = useState<TunnelColorId>(currentTunnelColor || 'neon_cyan');
  const [tunnelTexture, setTunnelTexture] = useState<TunnelTextureId>(currentTunnelTexture || 'smooth_glass');
  const [floorStyle, setFloorStyle] = useState<FloorStyleId>(currentFloorStyle || 'natural_oak');
  const [floor2Toy, setFloor2Toy] = useState<Floor2ToyId>(currentTierToys?.floor2Toy || 'seesaw');
  const [floor3Toy, setFloor3Toy] = useState<Floor3ToyId>(currentTierToys?.floor3Toy || 'telescope');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // Состояние музыкального плеера для вкладки "Музыка"
  const [musicState, setMusicState] = useState(musicPlayer.getStatus());

  useEffect(() => {
    if (isOpen) {
      setPetName(currentPetName);
      setPaletteId(currentPaletteId);
      setThemeId(currentThemeId || 'retro_arcade');
      setIsSoundOn(soundEnabled);
      setVolume(soundVolume);
      setIsZen(zenMode);
      setStatsConfig(disabledStats);
      setFurniture(currentFurniture);
      setSelectedTier((adminCageTierOverride ?? cageTier ?? 1) as CageTier);
      setIsAutoProgress(adminCageTierOverride === null || adminCageTierOverride === undefined);
      setCageColor(currentCageColor || 'silver');
      setTunnelColor(currentTunnelColor || 'neon_cyan');
      setTunnelTexture(currentTunnelTexture || 'smooth_glass');
      setFloorStyle(currentFloorStyle || 'natural_oak');
      setFloor2Toy(currentTierToys?.floor2Toy || 'seesaw');
      setFloor3Toy(currentTierToys?.floor3Toy || 'telescope');
      setMusicState(musicPlayer.getStatus());
      const unsub = musicPlayer.subscribe(() => {
        setMusicState(musicPlayer.getStatus());
      });
      return unsub;
    }
  }, [
    isOpen,
    currentPetName,
    currentPaletteId,
    currentThemeId,
    soundEnabled,
    soundVolume,
    zenMode,
    disabledStats,
    currentFurniture,
    cageTier,
    adminCageTierOverride,
    currentCageColor,
    currentTunnelColor,
    currentTunnelTexture,
    currentFloorStyle,
    currentTierToys,
  ]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSaveAll = () => {
    const trimmed = petName.trim().replace(/[<>"/\\&;]/g, '');
    if (trimmed.length < 2) return;

    soundManager.setEnabled(isSoundOn);
    soundManager.setVolume(volume);

    onUpdateSettings({
      petName: trimmed,
      paletteId,
      themeId,
      soundEnabled: isSoundOn,
      soundVolume: volume,
      zenMode: isZen,
      disabledStats: statsConfig,
      tierOverride: isAutoProgress ? null : selectedTier,
      cageColor,
      tunnelColor,
      tunnelTexture,
      floorStyle,
      tierToys: {
        floor2Toy,
        floor3Toy,
      },
    });

    onSaveFurniture(furniture);
    setNotificationsEnabled(notifEnabled);
    soundManager.playSuccessJingle();
    onClose();
  };

  const toggleStat = (key: keyof DisabledStatsConfig) => {
    setStatsConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    soundManager.playClickSound();
  };

  const effectiveTier = selectedTier;

  const tabs: { id: SettingsTab; label: string; icon: string; badge?: string }[] = [
    { id: 'tiers', label: 'Этажи', icon: '🪜' },
    { id: 'cage', label: 'Каркас', icon: '🏰' },
    { id: 'tunnels', label: 'Трубы', icon: '🚇', badge: effectiveTier < 2 ? 'от 2 эт.' : undefined },
    { id: 'corrugation', label: 'Гофра', icon: '🔄', badge: effectiveTier < 2 ? 'от 2 эт.' : undefined },
    { id: 'floors', label: 'Полы', icon: '🪵', badge: effectiveTier < 2 ? 'от 2 эт.' : undefined },
    { id: 'toys', label: 'Игрушки', icon: '🎪', badge: effectiveTier < 2 ? 'от 2 эт.' : undefined },
    { id: 'furniture', label: 'Интерьер', icon: '🥣' },
    { id: 'themes', label: 'Темы', icon: '🎨' },
    { id: 'music', label: 'Музыка', icon: '🎵' },
    { id: 'skin', label: 'Скин', icon: '🖌️' },
    { id: 'zen', label: 'Дзен', icon: '✨' },
    { id: 'pet', label: 'Питомец', icon: '🐹' },
    { id: 'audio', label: 'Оповещения & Звук', icon: '🔔' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-purple rounded-xl max-w-2xl w-full p-4 sm:p-5 shadow-pixel-lg text-white font-pixel max-h-[92vh] flex flex-col">
        {/* Заголовок */}
        <div className="flex justify-between items-center pb-2.5 border-b-2 border-retro-blue mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <h2 className="text-xs sm:text-sm text-retro-yellow">
              НАСТРОЙКИ И КАСТОМИЗАЦИЯ
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="text-retro-grey hover:text-white px-2 py-1 bg-retro-purple border border-black rounded text-xs"
          >
            ✕
          </button>
        </div>

        {/* Навигационные вкладки */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 border-b border-retro-purple/40">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                soundManager.playClickSound();
              }}
              className={`px-2.5 py-1.5 rounded text-[8px] sm:text-[9px] flex items-center gap-1 whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-retro-yellow text-black font-bold shadow-pixel-sm scale-105'
                  : 'bg-retro-purple/60 hover:bg-retro-purple text-retro-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[6px] px-1 py-0.2 bg-black/50 text-retro-cyan rounded font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Содержимое активной вкладки */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[280px]">
          {/* 1. ВКЛАДКА: ТЕМЫ */}
          {activeTab === 'themes' && (
            <div className="space-y-2.5 animate-fadeIn">
              <div className="text-[9px] text-retro-cyan">
                ВЫБЕРИТЕ СТИЛЬ ОФОРМЛЕНИЯ ПРИЛОЖЕНИЯ:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(APP_THEMES).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setThemeId(t.id);
                      soundManager.playClickSound();
                    }}
                    className={`p-2 rounded-lg border-2 text-left flex flex-col gap-1 text-[8px] transition-all ${
                      themeId === t.id
                        ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.02]'
                        : 'border-black bg-retro-purple/60 hover:bg-retro-purple text-retro-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{t.icon}</span>
                      <span className="truncate">{t.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="w-3 h-3 rounded-full border border-black"
                        style={{ backgroundColor: t.consoleBg }}
                        title="Консоль"
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black"
                        style={{ backgroundColor: t.headerColor }}
                        title="Заголовок"
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-black"
                        style={{ backgroundColor: t.accentColor }}
                        title="Кнопки"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1.1. ВКЛАДКА: ЭТАЖИ И ВЫСОТА ДОМИКА */}
          {activeTab === 'tiers' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="text-[9px] text-retro-yellow font-bold flex items-center gap-1.5">
                  <span>🪜</span>
                  <span>КОЛИЧЕСТВО ЭТАЖЕЙ В ДОМИКЕ ХОМЯЧКА:</span>
                </div>
                <span className="text-[8px] text-retro-cyan font-bold">
                  Выбрано: {selectedTier} {selectedTier === 1 ? 'этаж' : 'этажа'} {isAutoProgress ? '(Авто-рост)' : '(Фиксировано)'}
                </span>
              </div>

              {/* Интерактивные карточки выбора этажей */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[1, 2, 3].map((t) => {
                  const tier = t as CageTier;
                  const info = CAGE_TIERS[tier];
                  const isSelected = selectedTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        setSelectedTier(tier);
                        setIsAutoProgress(false);
                        soundManager.playClickSound();
                      }}
                      className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all active:translate-y-0.5 ${
                        isSelected
                          ? 'border-retro-yellow bg-retro-blue text-white shadow-pixel-sm scale-[1.02]'
                          : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">
                            {tier === 1 ? '🏠' : tier === 2 ? '🏡' : '🏰'}
                          </span>
                          <span
                            className={`text-[8px] px-2 py-0.5 rounded font-bold ${
                              isSelected
                                ? 'bg-retro-yellow text-black'
                                : 'bg-black/40 text-retro-grey'
                            }`}
                          >
                            {tier === 1 && '⭐ 1 ЭТАЖ'}
                            {tier === 2 && '⭐⭐ 2 ЭТАЖА'}
                            {tier === 3 && '⭐⭐⭐ 3 ЭТАЖА'}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-retro-yellow">
                          {info.name}
                        </div>
                        <p className="text-[7.5px] text-retro-white/80 leading-relaxed">
                          {info.desc}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-black/40 space-y-1 text-[7px]">
                        {info.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-1 text-emerald-300">
                            <span>✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Переключатель авто-прогресса по возрасту */}
              <div className="p-3 bg-retro-purple/70 border-2 border-black rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏳</span>
                  <div>
                    <div className="text-[8px] text-retro-yellow font-bold">
                      АВТОМАТИЧЕСКИЙ РОСТ ПО ВОЗРАСТУ ХОМЯЧКА
                    </div>
                    <div className="text-[7px] text-retro-white/70">
                      Клетка сама открывает 2-й этаж на 3-й день и 3-й этаж на 6-й день жизни
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoProgress(!isAutoProgress);
                    soundManager.playClickSound();
                  }}
                  className={`px-3 py-1.5 rounded text-[8px] font-bold border-2 transition-all active:translate-y-0.5 ${
                    isAutoProgress
                      ? 'bg-retro-green text-black border-black shadow-pixel-sm'
                      : 'bg-retro-dark text-retro-grey border-black/60 hover:text-white'
                  }`}
                >
                  {isAutoProgress ? '✓ Включен (Авто)' : '○ Выключен (Ручной выбор)'}
                </button>
              </div>
            </div>
          )}

          {/* 1.2. ВКЛАДКА: КАРКАС КЛЕТКИ */}
          {activeTab === 'cage' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* 8 Расцветок клетки */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold flex items-center gap-1.5">
                    <span>🎨</span>
                    <span>РАСЦВЕТКА КЛЕТКИ (8 СТИЛЕЙ КАРКАСА И ПРУТЬЕВ):</span>
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    Прутья, рама и поддон
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(CAGE_COLOR_PALETTES).map((pal) => {
                    const isSelected = cageColor === pal.id;
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => {
                          setCageColor(pal.id);
                          soundManager.playClickSound();
                        }}
                        className={`p-2 rounded-lg border-2 text-left flex flex-col gap-1.5 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.03]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        {/* Мини-визуализатор прутьев и поддона */}
                        <div className="w-full h-8 bg-black/50 rounded border border-black/60 relative overflow-hidden flex items-end">
                          {/* Прутья */}
                          <div className="absolute inset-0 flex justify-around items-center px-1">
                            <span className="w-0.5 h-full opacity-90" style={{ backgroundColor: pal.wire }} />
                            <span className="w-0.5 h-full opacity-90" style={{ backgroundColor: pal.wireHighlight }} />
                            <span className="w-0.5 h-full opacity-90" style={{ backgroundColor: pal.wire }} />
                            <span className="w-0.5 h-full opacity-90" style={{ backgroundColor: pal.wireHighlight }} />
                            <span className="w-0.5 h-full opacity-90" style={{ backgroundColor: pal.wire }} />
                          </div>
                          {/* Горизонтальная балка каркаса */}
                          <div
                            className="absolute top-1 left-0 right-0 h-1 border-t border-b border-black/40"
                            style={{ backgroundColor: pal.frame }}
                          />
                          {/* Поддон */}
                          <div
                            className="w-full h-2.5 relative z-10 border-t"
                            style={{ backgroundColor: pal.trayBase, borderColor: pal.trayRim }}
                          />
                        </div>

                        <div className="w-full">
                          <div className="text-[8px] truncate text-retro-yellow flex items-center gap-1">
                            <span>{pal.icon}</span>
                            <span className="truncate">{pal.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey mt-0.5 truncate">
                            {pal.nameEn}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm text-center">
                            ✓ Выбрано
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 1.3. ВКЛАДКА: ЦВЕТ ТРУБ */}
          {activeTab === 'tunnels' && (
            <div className="space-y-3.5 animate-fadeIn">
              {effectiveTier < 2 && (
                <div className="text-[7.5px] text-amber-300 bg-black/50 p-2.5 rounded-lg border border-amber-500/40 flex items-center gap-2">
                  <span>💡</span>
                  <span><b>Диагональные трубы соединяют этажи</b> и отображаются при наличии 2 и более этажей. Вы можете выбрать цвет заранее или включить 2–3 этажа во вкладке 🪜 «Этажи»!</span>
                </div>
              )}
              {/* 8 Расцветок диагональных туннелей */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold flex items-center gap-1.5">
                    <span>🚇</span>
                    <span>ЦВЕТ ДИАГОНАЛЬНЫХ ТУННЕЛЕЙ (8 АКРИЛОВЫХ ОТТЕНКОВ):</span>
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    Прозрачный акрил + неон
                  </span>
                </div>

                <div className="text-[7px] text-retro-grey leading-tight">
                  ✨ <b>Динамическая видимость:</b> Туннели скрыты в покое и плавно проявляются только во время подъема или спуска хомячка!
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(TUNNEL_COLOR_PALETTES).map((pal) => {
                    const isSelected = tunnelColor === pal.id;
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => {
                          setTunnelColor(pal.id);
                          soundManager.playClickSound();
                        }}
                        className={`p-2 rounded-lg border-2 text-left flex flex-col gap-1.5 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.03]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        {/* Мини-визуализатор акриловой трубы */}
                        <div className="w-full h-8 bg-black/60 rounded border border-black/60 relative overflow-hidden flex items-center justify-center p-1">
                          <div
                            className="w-full h-4 rounded-full relative flex items-center justify-between px-1"
                            style={{
                              backgroundColor: pal.glassFill,
                              border: `1.5px solid ${pal.glassStroke}`,
                              boxShadow: `0 0 8px ${pal.glowColor}`,
                            }}
                          >
                            {/* Муфты крепления трубы */}
                            <span
                              className="w-1.5 h-full rounded-sm"
                              style={{ backgroundColor: pal.jointRing }}
                            />
                            <span
                              className="w-1.5 h-full rounded-sm"
                              style={{ backgroundColor: pal.jointRingAccent }}
                            />
                            <span
                              className="w-1.5 h-full rounded-sm"
                              style={{ backgroundColor: pal.jointRing }}
                            />
                          </div>
                        </div>

                        <div className="w-full">
                          <div className="text-[8px] truncate text-retro-yellow flex items-center gap-1">
                            <span>{pal.icon}</span>
                            <span className="truncate">{pal.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey mt-0.5 truncate">
                            {pal.nameEn}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm text-center">
                            ✓ Выбрано
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 1.4. ВКЛАДКА: ГОФРА И РЕЛЬЕФ ТРУБ (ОТДЕЛЬНЫЙ ПУНКТ) */}
          {activeTab === 'corrugation' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="text-[7.5px] text-retro-cyan bg-black/50 p-2.5 rounded-lg border border-retro-cyan/40 flex items-center gap-2">
                <span>🔄</span>
                <span><b>Гофра и узор диагональных туннелей:</b> Настройте рельеф акриловых труб — кольчатая гофра, спираль, алмазные грани, неоновые ребра или кибер-соты!</span>
              </div>
              {/* 8 Текстур и узоров диагональных туннелей */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold flex items-center gap-1.5">
                    <span>✨</span>
                    <span>ТЕКСТУРА И УЗОР ТУННЕЛЕЙ (8 СТИЛЕЙ ПОКРЫТИЯ):</span>
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    Текстура акриловых труб
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(TUNNEL_TEXTURE_PRESETS).map((tex) => {
                    const isSelected = tunnelTexture === tex.id;
                    return (
                      <button
                        key={tex.id}
                        type="button"
                        onClick={() => {
                          setTunnelTexture(tex.id);
                          soundManager.playClickSound();
                        }}
                        className={`p-2 rounded-lg border-2 text-left flex flex-col gap-1.5 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.03]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        {/* Мини-визуализатор текстуры трубы */}
                        <div className="w-full h-8 bg-black/60 rounded border border-black/60 relative overflow-hidden flex items-center justify-center p-1">
                          <div
                            className="w-full h-4 rounded-full relative flex items-center justify-around px-1 overflow-hidden"
                            style={{
                              backgroundColor: TUNNEL_COLOR_PALETTES[tunnelColor]?.glassFill || 'rgba(56, 189, 248, 0.35)',
                              border: `1.5px solid ${TUNNEL_COLOR_PALETTES[tunnelColor]?.glassStroke || '#0284c7'}`,
                            }}
                          >
                            {/* Стилизованный паттерн предпросмотра */}
                            {tex.id === 'smooth_glass' && (
                              <div className="w-full h-0.5 bg-white/70" />
                            )}
                            {tex.id === 'spiral_candy' && (
                              <div className="flex gap-1.5 w-full justify-center">
                                <span className="w-1 h-4 bg-white/80 -rotate-45" />
                                <span className="w-1 h-4 bg-white/80 -rotate-45" />
                                <span className="w-1 h-4 bg-white/80 -rotate-45" />
                              </div>
                            )}
                            {tex.id === 'ribbed_rings' && (
                              <div className="flex justify-between w-full px-1">
                                <span className="w-0.5 h-3 bg-white/90" />
                                <span className="w-0.5 h-3 bg-white/90" />
                                <span className="w-0.5 h-3 bg-white/90" />
                                <span className="w-0.5 h-3 bg-white/90" />
                              </div>
                            )}
                            {tex.id === 'star_glitter' && (
                              <div className="flex justify-around w-full text-[8px] text-yellow-300">
                                <span>✦</span>
                                <span>✧</span>
                                <span>✦</span>
                              </div>
                            )}
                            {tex.id === 'honeycomb_cyber' && (
                              <div className="flex justify-around w-full text-[8px] text-cyan-300 font-mono">
                                <span>⬡</span>
                                <span>⬡</span>
                                <span>⬡</span>
                              </div>
                            )}
                            {tex.id === 'hazard_chevrons' && (
                              <div className="flex justify-around w-full text-[7px] text-amber-300 font-bold">
                                <span>››</span>
                                <span>››</span>
                                <span>››</span>
                              </div>
                            )}
                            {tex.id === 'bubble_plastic' && (
                              <div className="flex justify-around items-center w-full">
                                <span className="w-1.5 h-1.5 rounded-full border border-white/90 bg-white/40" />
                                <span className="w-2.5 h-2.5 rounded-full border border-white/90 bg-white/40" />
                                <span className="w-1.5 h-1.5 rounded-full border border-white/90 bg-white/40" />
                              </div>
                            )}
                            {tex.id === 'circuit_board' && (
                              <div className="flex items-center justify-around w-full text-[7px] text-emerald-300 font-mono">
                                <span>▪─</span>
                                <span>─▪</span>
                                <span>▪─</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full">
                          <div className="text-[8px] truncate text-retro-yellow flex items-center gap-1">
                            <span>{tex.icon}</span>
                            <span className="truncate">{tex.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey mt-0.5 truncate">
                            {tex.nameEn}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm text-center">
                            ✓ Выбрано
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 1.5. ВКЛАДКА: ПОЛЫ 2 И 3 ЭТАЖЕЙ */}
          {activeTab === 'floors' && (
            <div className="space-y-3.5 animate-fadeIn">
              {effectiveTier < 2 && (
                <div className="text-[7.5px] text-amber-300 bg-black/50 p-2.5 rounded-lg border border-amber-500/40 flex items-center gap-2">
                  <span>💡</span>
                  <span><b>Покрытия полов</b> применяются к платформам 2-го и 3-го этажей. Переключите клетку на 2–3 этажа во вкладке 🪜 «Этажи», чтобы увидеть новые ярусы!</span>
                </div>
              )}
              {/* 8 Стилей и материалов покрытия полов 2-го и 3-го этажей */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold flex items-center gap-1.5">
                    <span>🪵</span>
                    <span>ПОКРЫТИЕ ПОЛОВ 2 И 3 ЭТАЖЕЙ (8 МАТЕРИАЛОВ):</span>
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    Массивные платформы
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(FLOOR_STYLE_PRESETS).map((f) => {
                    const isSelected = floorStyle === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setFloorStyle(f.id);
                          soundManager.playClickSound();
                        }}
                        className={`p-2 rounded-lg border-2 text-left flex flex-col gap-1.5 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.03]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        {/* Превью полочки этажа толщиной 24px */}
                        <div className="w-full h-7 bg-black/60 rounded border border-black/60 relative overflow-hidden flex flex-col justify-end p-1">
                          <div
                            className="w-full h-4 rounded-sm relative overflow-hidden flex flex-col justify-between"
                            style={{ backgroundColor: f.mainColor }}
                          >
                            {/* Верхний кант */}
                            <div
                              className="w-full h-1"
                              style={{ backgroundColor: f.highlightColor }}
                            />
                            {/* Текстурный акцент */}
                            <div className="flex justify-around items-center w-full px-1">
                              <span
                                className="w-2 h-1 rounded-sm"
                                style={{ backgroundColor: f.accentColor }}
                              />
                              <span
                                className="w-3 h-1 rounded-sm"
                                style={{ backgroundColor: f.accentColor }}
                              />
                            </div>
                            {/* Нижний плинтус */}
                            <div
                              className="w-full h-1"
                              style={{ backgroundColor: f.shadowColor }}
                            />
                          </div>
                        </div>

                        <div className="w-full">
                          <div className="text-[8px] truncate text-retro-yellow flex items-center gap-1">
                            <span>{f.icon}</span>
                            <span className="truncate">{f.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey mt-0.5 truncate">
                            {f.desc}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm text-center">
                            ✓ Выбрано
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 1.6. ВКЛАДКА: ИГРУШКИ ЭТАЖЕЙ */}
          {activeTab === 'toys' && (
            <div className="space-y-3.5 animate-fadeIn">
              {effectiveTier < 2 && (
                <div className="text-[7.5px] text-amber-300 bg-black/50 p-2.5 rounded-lg border border-amber-500/40 flex items-center gap-2">
                  <span>💡</span>
                  <span><b>Игрушки устанавливаются на 2-й и 3-й этажи</b> (мезонин и пентхаус). Хомячок играет с ними при подъеме на этаж! Переключите этажи во вкладке 🪜 «Этажи».</span>
                </div>
              )}
              {/* Игрушки для 2-го этажа (Мезонин) */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold flex items-center gap-1.5">
                    <span>🎪</span>
                    <span>ИГРУШКА ДЛЯ 2-ГО ЭТАЖА (МЕЗОНИН):</span>
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    Кликни в игре для трюка!
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(FLOOR2_TOY_PRESETS).map((toy) => {
                    const isSelected = floor2Toy === toy.id;
                    return (
                      <button
                        key={toy.id}
                        type="button"
                        onClick={() => {
                          setFloor2Toy(toy.id as Floor2ToyId);
                          soundManager.playClickSound();
                        }}
                        className={`p-2 rounded-lg border-2 text-left flex flex-col gap-1.5 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.03]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        <div className="w-full h-8 bg-black/60 rounded border border-black/60 flex items-center justify-center text-xl">
                          <span>{toy.icon}</span>
                        </div>

                        <div className="w-full">
                          <div className="text-[8px] truncate text-retro-yellow flex items-center gap-1">
                            <span className="truncate">{toy.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey mt-0.5 line-clamp-2">
                            {toy.desc}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm text-center">
                            ✓ Установлено
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Игрушки для 3-го этажа (Пентхаус) */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold flex items-center gap-1.5">
                    <span>🔭</span>
                    <span>ИГРУШКА ДЛЯ 3-ГО ЭТАЖА (ПЕНТХАУС):</span>
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    Премиум-терраса
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(FLOOR3_TOY_PRESETS).map((toy) => {
                    const isSelected = floor3Toy === toy.id;
                    return (
                      <button
                        key={toy.id}
                        type="button"
                        onClick={() => {
                          setFloor3Toy(toy.id as Floor3ToyId);
                          soundManager.playClickSound();
                        }}
                        className={`p-2 rounded-lg border-2 text-left flex flex-col gap-1.5 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.03]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        <div className="w-full h-8 bg-black/60 rounded border border-black/60 flex items-center justify-center text-xl">
                          <span>{toy.icon}</span>
                        </div>

                        <div className="w-full">
                          <div className="text-[8px] truncate text-retro-yellow flex items-center gap-1">
                            <span className="truncate">{toy.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey mt-0.5 line-clamp-2">
                            {toy.desc}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm text-center">
                            ✓ Установлено
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {/* 2. ВКЛАДКА: МУЗЫКА (16 треков по 45 секунд) */}
          {activeTab === 'music' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-retro-purple/80 p-2.5 rounded border border-black">
                <div>
                  <div className="text-[9px] text-retro-yellow font-bold">
                    8-БИТНЫЙ ЧИПТЮН-ЦЕНТР
                  </div>
                  <div className="text-[7px] text-retro-grey mt-0.5">
                    16 композиций по ровно 45 секунд • 3-канальный Web Audio
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClickSound();
                      const modes: PlaybackMode[] = ['loop', 'shuffle', 'sequential'];
                      const next = modes[(modes.indexOf(musicState.mode) + 1) % modes.length];
                      musicPlayer.setMode(next);
                    }}
                    className="px-2 py-1 bg-retro-dark border border-black text-[8px] rounded font-bold"
                  >
                    {musicState.mode === 'loop'
                      ? '🔁 Зациклить'
                      : musicState.mode === 'shuffle'
                      ? '🔀 Вперемешку'
                      : '⏩ По порядку'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClickSound();
                      musicPlayer.togglePlay();
                    }}
                    className={`px-3 py-1 rounded border border-black text-[8px] font-bold ${
                      musicState.isPlaying ? 'bg-retro-green text-black' : 'bg-retro-yellow text-black'
                    }`}
                  >
                    {musicState.isPlaying ? '⏸ Пауза' : '▶ Играть'}
                  </button>
                </div>
              </div>

              {/* Список всех 16 треков */}
              <div className="text-[8px] text-retro-cyan">
                ВЫБЕРИТЕ ТРЕК ДЛЯ ПРОСЛУШИВАНИЯ ИЛИ ЗАЦИКЛИВАНИЯ:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {TRACK_LIST.map((t) => {
                  const isCur = t.id === musicState.currentTrackIndex;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        soundManager.playClickSound();
                        musicPlayer.selectTrack(t.id);
                        if (!musicState.isPlaying) {
                          musicPlayer.play();
                        }
                      }}
                      className={`p-2 rounded border text-left flex items-center justify-between text-[8px] transition-all ${
                        isCur
                          ? 'border-retro-yellow bg-retro-blue font-bold text-retro-yellow shadow-pixel-sm'
                          : 'border-black bg-retro-purple/60 hover:bg-retro-purple text-retro-white'
                      }`}
                    >
                      <div className="truncate">
                        <span className="mr-1">{isCur ? '▶' : `${t.id + 1}.`}</span>
                        <span>{t.title}</span>
                        <div className="text-[7px] text-retro-grey mt-0.5 truncate">
                          {t.mood} • {t.tempo} BPM
                        </div>
                      </div>
                      <span className="text-[7px] bg-black/50 px-1.5 py-0.5 rounded border border-black shrink-0 ml-1">
                        45с
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ВКЛАДКА: МЕБЕЛЬ КЛЕТКИ */}
          {activeTab === 'furniture' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-[9px] text-retro-cyan">
                ИНТЕРЬЕР И УЮТ В КЛЕТКЕ ХОМЯЧКА:
              </div>

              {/* 20 Кормушек со спрайтами предпросмотра */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold">
                    🥣 КОРМУШКИ ДЛЯ ЕДЫ (20 ДИЗАЙНЕРСКИХ СПРАЙТОВ):
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    С динамическим уровнем корма
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {BOWL_PRESETS.map((b) => {
                    const isSelected = furniture.bowl === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setFurniture((prev) => ({ ...prev, bowl: b.id }));
                          soundManager.playClickSound();
                        }}
                        className={`p-1.5 rounded-lg border-2 text-left flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.02]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        {/* Спрайт предпросмотра кормушки */}
                        <div className="w-full flex justify-center py-1">
                          <BowlPreviewCanvas bowlType={b.id} />
                        </div>

                        <div className="w-full text-center">
                          <div className="text-[8px] truncate text-retro-yellow">
                            <span>{b.icon} </span>
                            <span>{b.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey/90 line-clamp-2 mt-0.5 leading-tight">
                            {b.desc}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm">
                            ✓ Выбрано
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 20 Поилок со спрайтами предпросмотра */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold">
                    💧 ПОИЛКИ С ВОДОЙ (20 ДИЗАЙНЕРСКИХ МОДЕЛЕЙ):
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    С анимацией капель и пузырьков
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {BOTTLE_PRESETS.map((b) => {
                    const isSelected = furniture.waterBottle === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setFurniture((prev) => ({ ...prev, waterBottle: b.id }));
                          soundManager.playClickSound();
                        }}
                        className={`p-1.5 rounded-lg border-2 text-left flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.02]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        {/* Спрайт предпросмотра поилки */}
                        <div className="w-full flex justify-center py-1">
                          <BottlePreviewCanvas bottleType={b.id} />
                        </div>

                        <div className="w-full text-center">
                          <div className="text-[8px] truncate text-retro-yellow">
                            <span>{b.icon} </span>
                            <span>{b.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey/90 line-clamp-2 mt-0.5 leading-tight">
                            {b.desc}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm">
                            ✓ Выбрано
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 20 Дизайнерских домиков со спрайтами предпросмотра */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold">
                    🛖 ДОМИКИ ДЛЯ СНА (20 ДИЗАЙНЕРСКИХ МОДЕЛЕЙ):
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    Хомячок сладко спит внутри!
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {HOUSE_PRESETS.map((h) => {
                    const isSelected =
                      normalizeHouseId(furniture.house) === h.id ||
                      furniture.house === h.id;

                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setFurniture((prev) => ({ ...prev, house: h.id }));
                          soundManager.playClickSound();
                        }}
                        className={`p-1.5 rounded-lg border-2 text-left flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.02]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        {/* Спрайт предпросмотра домика со спящим хомячком */}
                        <div className="w-full flex justify-center py-0.5">
                          <HousePreviewCanvas houseType={h.id} />
                        </div>

                        {/* Название и описание */}
                        <div className="w-full text-center">
                          <div className="text-[8px] truncate text-retro-yellow">
                            <span>{h.icon} </span>
                            <span>{h.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey/90 line-clamp-2 mt-0.5 leading-tight">
                            {h.desc}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm">
                            ✓ Выбрано
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 20 Беговых колес со спрайтами предпросмотра */}
              <div className="bg-retro-purple/70 p-2.5 rounded border border-black space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[8px] text-retro-yellow font-bold">
                    🎡 БЕГОВЫЕ КОЛЕСА (20 ДИЗАЙНЕРСКИХ МОДЕЛЕЙ):
                  </div>
                  <span className="text-[7px] text-retro-cyan">
                    2-слойная глубина: хомяк бежит внутри!
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {WHEEL_PRESETS.map((w) => {
                    const isSelected = (furniture.wheel || 'classic') === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setFurniture((prev) => ({ ...prev, wheel: w.id }));
                          soundManager.playClickSound();
                        }}
                        className={`p-1.5 rounded-lg border-2 text-left flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm scale-[1.02]'
                            : 'border-black bg-retro-dark hover:bg-retro-purple/60 text-retro-white'
                        }`}
                      >
                        {/* Спрайт предпросмотра бегового колеса */}
                        <div className="w-full flex justify-center py-1">
                          <WheelPreviewCanvas wheelType={w.id} />
                        </div>

                        <div className="w-full text-center">
                          <div className="text-[8px] truncate text-retro-yellow">
                            <span>{w.icon} </span>
                            <span>{w.name}</span>
                          </div>
                          <div className="text-[6px] text-retro-grey/90 line-clamp-2 mt-0.5 leading-tight">
                            {w.desc}
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[6px] bg-retro-yellow text-black font-bold px-1.5 py-0.5 rounded shadow-pixel-sm">
                            ✓ Выбрано
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Управление расстановкой предметов */}
              <div className="bg-retro-dark/80 p-2.5 rounded border border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[8px] text-retro-yellow font-bold">
                    🖐️ РАССТАНОВКА МЕБЕЛИ В КЛЕТКЕ
                  </div>
                  <div className="text-[7px] text-retro-grey mt-0.5">
                    Перетаскивайте домик, колесо, кормушку, поилку и хомячка мышкой прямо на игровом поле!
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClickSound();
                    setFurniture((prev) => ({ ...prev, positions: undefined }));
                  }}
                  className="px-2.5 py-1.5 bg-retro-blue hover:bg-retro-purple border border-black rounded text-[7px] text-retro-white font-bold shrink-0 transition-colors"
                >
                  🔄 Сбросить позиции
                </button>
              </div>
            </div>
          )}

          {/* 4. ВКЛАДКА: СКИН И МАСТЕРСКАЯ */}
          {activeTab === 'skin' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="text-[9px] text-retro-cyan">
                ПИКСЕЛЬНАЯ МАСТЕРСКАЯ ХОМЯЧКА:
              </div>
              <div className="bg-retro-purple/80 p-4 rounded-lg border-2 border-black space-y-3 text-center">
                <div className="text-2xl animate-bounce">🎨</div>
                <div className="text-xs text-retro-yellow font-bold">
                  СОЗДАЙТЕ СВОЙ СОБСТВЕННЫЙ СПРАЙТ
                </div>
                <p className="text-[8px] text-retro-white/80 leading-relaxed max-w-md mx-auto">
                  Встроенный пиксельный редактор 24x16 позволяет нарисовать уникального
                  хомячка покадрово карандашом, заливкой и ластиком!
                </p>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClickSound();
                      onOpenPixelEditor();
                    }}
                    className="py-2 px-4 bg-retro-green text-black font-bold border-2 border-black rounded text-[8px] shadow-pixel-sm hover:brightness-110"
                  >
                    🖌️ Открыть редактор пикселей
                  </button>

                  {hasCustomSkin && (
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClickSound();
                        onResetToDefaultSkin();
                      }}
                      className="py-2 px-3 bg-retro-red text-white border-2 border-black rounded text-[8px]"
                    >
                      Вернуть стандартный скин
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. ВКЛАДКА: ДЗЕН И СТАТЫ */}
          {activeTab === 'zen' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-retro-purple/90 p-3 rounded-lg border-2 border-retro-yellow">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-xs text-retro-yellow">✨ РЕЖИМ ДЗЕН (КОМПАНЬОН)</h3>
                    <p className="text-[8px] text-retro-white/80 mt-1 leading-relaxed">
                      Хомячок не голодает, не пачкает клетку и не болеет. Фоновый питомец для релакса!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsZen(!isZen);
                      soundManager.playClickSound();
                    }}
                    className={`px-3 py-1.5 text-[9px] border-2 border-black rounded font-bold shadow-pixel-sm ${
                      isZen ? 'bg-retro-yellow text-black' : 'bg-retro-dark text-retro-grey'
                    }`}
                  >
                    {isZen ? 'ВКЛЮЧЕН' : 'ВЫКЛ'}
                  </button>
                </div>

                {/* Выборочное отключение статов */}
                {!isZen && (
                  <div className="mt-3 pt-2 border-t border-black/40 space-y-1.5">
                    <span className="text-[8px] text-retro-cyan block mb-1">
                      ТОЧЕЧНОЕ ОТКЛЮЧЕНИЕ СТАТОВ:
                    </span>
                    <label className="flex items-center gap-2 text-[8px] text-retro-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statsConfig.hunger}
                        onChange={() => toggleStat('hunger')}
                        className="cursor-pointer"
                      />
                      <span>Отключить голод (всегда сыт)</span>
                    </label>
                    <label className="flex items-center gap-2 text-[8px] text-retro-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statsConfig.hygiene}
                        onChange={() => toggleStat('hygiene')}
                        className="cursor-pointer"
                      />
                      <span>Отключить загрязнение (нет какашек)</span>
                    </label>
                    <label className="flex items-center gap-2 text-[8px] text-retro-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statsConfig.energy}
                        onChange={() => toggleStat('energy')}
                        className="cursor-pointer"
                      />
                      <span>Отключить усталость (всегда бодр)</span>
                    </label>
                    <label className="flex items-center gap-2 text-[8px] text-retro-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={statsConfig.health}
                        onChange={() => toggleStat('health')}
                        className="cursor-pointer"
                      />
                      <span>Отключить урон здоровью (бессмертие)</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. ВКЛАДКА: ПИТОМЕЦ (Имя и 20 пород) */}
          {activeTab === 'pet' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Смена клички */}
              <div className="bg-retro-purple/80 p-3 rounded border border-black">
                <label className="block text-[8px] text-retro-cyan mb-1.5">
                  КЛИЧКА ХОМЯЧКА:
                </label>
                <input
                  type="text"
                  value={petName}
                  maxLength={16}
                  onChange={(e) => setPetName(e.target.value)}
                  className="w-full bg-retro-dark border-2 border-black px-3 py-1.5 text-xs text-retro-yellow rounded font-pixel focus:outline-none"
                />
              </div>

              {/* 20 дизайнерских палитр */}
              <div className="bg-retro-purple/80 p-3 rounded border border-black">
                <label className="block text-[8px] text-retro-cyan mb-2">
                  ПОРОДА / ОКРАС ШЕРСТКИ (20 ДИЗАЙНЕРСКИХ ПАЛИТР):
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {HAMSTER_PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPaletteId(p.id);
                        soundManager.playClickSound();
                      }}
                      className={`p-1.5 rounded border text-left flex items-center gap-2 text-[8px] ${
                        paletteId === p.id
                          ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm'
                          : 'border-black bg-retro-dark hover:bg-retro-dark/80'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black inline-block shrink-0"
                        style={{ backgroundColor: p.fur }}
                      />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. ВКЛАДКА: ЗВУК И СБРОС */}
          {activeTab === 'audio' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Локальные уведомления о потребностях */}
              <div className="bg-retro-purple/80 p-3 rounded border border-black space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <div>
                    <span className="text-[8px] text-retro-yellow font-bold block">
                      🔔 ОПОВЕЩЕНИЯ (1 РАЗ В СУТКИ):
                    </span>
                    <span className="text-[6.5px] text-retro-grey block mt-0.5 leading-relaxed">
                      Строго не чаще 1 раза за 24 часа при голоде, жажде или грязи в клетке
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const next = !notifEnabled;
                      setNotifEnabled(next);
                      setNotificationsEnabled(next);
                      soundManager.playClickSound();
                      if (next) {
                        const granted = await requestNotificationPermission();
                        if (!granted) {
                          setNotifStatusMsg('Разрешение отклонено');
                        } else {
                          setNotifStatusMsg('Уведомления включены!');
                        }
                      }
                    }}
                    className={`px-2.5 py-1 text-[8px] border border-black rounded flex-shrink-0 ${
                      notifEnabled ? 'bg-retro-green text-black font-bold' : 'bg-retro-red text-white'
                    }`}
                  >
                    {notifEnabled ? 'ВКЛ 🔔' : 'ВЫКЛ 🔕'}
                  </button>
                </div>

                {notifEnabled && (
                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-black/30">
                    <button
                      type="button"
                      onClick={async () => {
                        soundManager.playClickSound();
                        const granted = await requestNotificationPermission();
                        if (!granted) {
                          setNotifStatusMsg('Требуется разрешение в браузере');
                          return;
                        }
                        const sent = await notifyHamsterNeed(
                          {
                            petName,
                            paletteId: 'classic_golden',
                            customSprite: null,
                            needs: {
                              hunger: 20,
                              energy: 100,
                              hygiene: 100,
                              happiness: 100,
                              health: 100,
                            },
                            behavior: 'idle' as any,
                            furniture,
                            poops: [],
                            lastSavedTimestamp: Date.now(),
                            totalAgeSeconds: 100,
                            isOnboarded: true,
                            soundEnabled: isSoundOn,
                            soundVolume: volume,
                            zenMode: isZen,
                            disabledStats: statsConfig,
                            themeId,
                            musicConfig: {
                              isPlaying: false,
                              currentTrackIndex: 0,
                              mode: 'loop',
                              volume: 0.5,
                            },
                          },
                          true
                        );
                        if (sent) {
                          setNotifStatusMsg('Тестовое оповещение отправлено! 🐹');
                        } else {
                          setNotifStatusMsg('Не удалось отправить (проверьте права)');
                        }
                      }}
                      className="py-1 px-2.5 bg-retro-blue/70 hover:bg-retro-blue text-white text-[7px] border border-black rounded active:scale-95 flex-shrink-0"
                    >
                      Тестовый пуш 🧪
                    </button>
                    {notifStatusMsg && (
                      <span className="text-[6.5px] text-retro-cyan animate-fadeIn truncate">
                        {notifStatusMsg}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Звуковые эффекты */}
              <div className="bg-retro-purple/80 p-3 rounded border border-black space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-retro-cyan">8-БИТНЫЕ ЗВУКОВЫЕ ЭФФЕКТЫ:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isSoundOn;
                      setIsSoundOn(next);
                      soundManager.setEnabled(next);
                      if (next) soundManager.playClickSound();
                    }}
                    className={`px-2.5 py-1 text-[8px] border border-black rounded ${
                      isSoundOn ? 'bg-retro-green text-black font-bold' : 'bg-retro-red'
                    }`}
                  >
                    {isSoundOn ? 'ВКЛ 🔊' : 'ВЫКЛ 🔇'}
                  </button>
                </div>

                {isSoundOn && (
                  <div>
                    <div className="flex justify-between text-[7px] text-retro-grey mb-1">
                      <span>ГРОМКОСТЬ ЭФФЕКТОВ:</span>
                      <span>{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setVolume(v);
                        soundManager.setVolume(v);
                      }}
                      className="w-full h-1.5 bg-retro-dark rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Сброс прогресса */}
              <div className="bg-retro-purple/40 p-3 rounded border border-retro-red/50">
                <div className="text-[8px] text-retro-red font-bold mb-1">СБРОС ПРОГРЕССА</div>
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="py-1 px-2.5 bg-retro-red/70 hover:bg-retro-red text-white text-[7px] border border-black rounded"
                  >
                    Начать заново с чистого листа
                  </button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => {
                        onResetProgress();
                        onClose();
                      }}
                      className="py-1 px-2.5 bg-retro-red text-white text-[7px] font-bold border border-black rounded animate-pulse"
                    >
                      Да, сбросить!
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="py-1 px-2.5 bg-retro-blue text-white text-[7px] border border-black rounded"
                    >
                      Отмена
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Футер модального окна */}
        <div className="mt-3 pt-2.5 border-t-2 border-retro-blue flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="py-1.5 px-3 bg-retro-blue hover:bg-retro-cyan border border-black rounded text-[9px]"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="py-1.5 px-5 bg-retro-green hover:brightness-110 text-black font-bold border border-black rounded text-[9px] shadow-pixel-sm"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
