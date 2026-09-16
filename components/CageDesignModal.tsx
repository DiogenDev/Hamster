/**
 * ============================================================================
 * КОМПОНЕНТ: CageDesignModal (Обустройство и Полный Дизайн Клетки)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ДРУЖЕЛЮБНЫЙ ЦЕНТР ОБУСТРОЙСТВА (All-in-One Cage Atelier):
 *    Централизует все аспекты кастомизации клетки питомца в понятных вкладках:
 *    - 🪜 Этажи: Прямой выбор 1, 2 или 3 этажей (с переключателем авто-роста)
 *    - 🏰 Каркас: Цвет рамы и прутьев клетки (8 палитр)
 *    - 🚇 Трубы: Цвет акрилового стекла туннелей (8 неоновых оттенков)
 *    - 🔄 Гофра: Фактура и рельефный узор гофры (8 фактур)
 *    - 🪵 Полы: Покрытия полочек 2 и 3 этажей (8 материалов)
 *    - 🎪 Игрушки 2 эт.: Интерактивные аттракционы мезонина (со свойствами и игрой)
 *    - 👑 Игрушки 3 эт.: Интерактивные аттракционы пентхауса (со свойствами и игрой)
 *    - 🏠 1-й этаж: Домики, кормушки, поилки и беговые колеса
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  CageTier,
  CageColorId,
  TunnelColorId,
  TunnelTextureId,
  FloorStyleId,
  TierToysConfig,
  Floor2ToyId,
  Floor3ToyId,
  FurnitureConfig,
  BowlType,
  WaterBottleType,
  HouseType,
  WheelType,
} from '@/types/hamster';
import {
  CAGE_COLOR_PALETTES,
  TUNNEL_COLOR_PALETTES,
  TUNNEL_TEXTURE_PRESETS,
  FLOOR_STYLE_PRESETS,
  FLOOR2_TOY_PRESETS,
  FLOOR3_TOY_PRESETS,
} from '@/utils/cageTiers';
import { WHEEL_PRESETS } from '@/utils/wheelPresets';
import { soundManager } from '@/utils/soundEffects';

export interface CageDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  cageTier: number;
  adminCageTierOverride?: CageTier | null;
  currentCageColor?: CageColorId;
  currentTunnelColor?: TunnelColorId;
  currentTunnelTexture?: TunnelTextureId;
  currentFloorStyle?: FloorStyleId;
  currentTierToys?: TierToysConfig;
  currentFurniture: FurnitureConfig;
  onSave: (params: {
    tierOverride?: CageTier | null;
    cageColor: CageColorId;
    tunnelColor: TunnelColorId;
    tunnelTexture: TunnelTextureId;
    floorStyle: FloorStyleId;
    tierToys: TierToysConfig;
    furniture: FurnitureConfig;
  }) => void;
  onPlayWithToy?: (floor: 2 | 3) => void;
}

export type TabKey =
  | 'tiers'
  | 'cage'
  | 'tunnels'
  | 'corrugation'
  | 'floors'
  | 'floor2_toys'
  | 'floor3_toys'
  | 'furniture';

const BOWLS: { id: BowlType; name: string; desc: string; icon: string }[] = [
  { id: 'clay', name: 'Глиняная плошка', desc: 'Теплый традиционный терракот', icon: '🥣' },
  { id: 'wood', name: 'Деревянное корытце', desc: 'Натуральная выдолбленная древесина', icon: '🪵' },
  { id: 'neon', name: 'Неоновая миска', desc: 'Киберпанковский светящийся пластик', icon: '✨' },
  { id: 'royal', name: 'Царский кубок', desc: 'Сверкающий золотой сервиз для султана', icon: '👑' },
];

const BOTTLES: { id: WaterBottleType; name: string; desc: string; icon: string }[] = [
  { id: 'ball', name: 'Шариковая поилка', desc: 'Надежная капельная система с шариком', icon: '💧' },
  { id: 'flask', name: 'Стеклянная колба', desc: 'Химическая мензурка для чистой воды', icon: '🧪' },
  { id: 'fountain', name: 'Авто-фонтанчик', desc: 'Освежающий мини-гейзер', icon: '⛲' },
];

const HOUSES: { id: HouseType; name: string; desc: string; icon: string }[] = [
  { id: 'log_cabin', name: 'Бревенчатый сруб', desc: 'Уютная теплая лесная изба из сосны', icon: '🛖' },
  { id: 'coconut', name: 'Половинка кокоса', desc: 'Прочная экзотическая скорлупа', icon: '🥥' },
  { id: 'mushroom', name: 'Керамический грибок', desc: 'Сказочный красный мухомор с белыми точками', icon: '🍄' },
  { id: 'box', name: 'Картонная коробка', desc: 'Уютная коробочка с вырезанным окошком', icon: '📦' },
];

export const CageDesignModal: React.FC<CageDesignModalProps> = ({
  isOpen,
  onClose,
  cageTier,
  adminCageTierOverride,
  currentCageColor = 'silver',
  currentTunnelColor = 'neon_cyan',
  currentTunnelTexture = 'smooth_glass',
  currentFloorStyle = 'natural_oak',
  currentTierToys = { floor2Toy: 'seesaw', floor3Toy: 'telescope' },
  currentFurniture,
  onSave,
  onPlayWithToy,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('tiers');

  // Локальные состояния настроек
  const [selectedTier, setSelectedTier] = useState<CageTier>(
    (adminCageTierOverride ?? cageTier ?? 1) as CageTier
  );
  const [isAutoProgress, setIsAutoProgress] = useState<boolean>(
    adminCageTierOverride === null || adminCageTierOverride === undefined
  );
  const [cageColor, setCageColor] = useState<CageColorId>(currentCageColor);
  const [tunnelColor, setTunnelColor] = useState<TunnelColorId>(currentTunnelColor);
  const [tunnelTexture, setTunnelTexture] = useState<TunnelTextureId>(currentTunnelTexture);
  const [floorStyle, setFloorStyle] = useState<FloorStyleId>(currentFloorStyle);
  const [floor2Toy, setFloor2Toy] = useState<Floor2ToyId>(currentTierToys.floor2Toy);
  const [floor3Toy, setFloor3Toy] = useState<Floor3ToyId>(currentTierToys.floor3Toy);

  // Мебель 1-го этажа
  const [selectedHouse, setSelectedHouse] = useState<HouseType>(currentFurniture.house);
  const [selectedBowl, setSelectedBowl] = useState<BowlType>(currentFurniture.bowl);
  const [selectedBottle, setSelectedBottle] = useState<WaterBottleType>(currentFurniture.waterBottle);
  const [selectedWheel, setSelectedWheel] = useState<WheelType>(currentFurniture.wheel || 'classic');

  useEffect(() => {
    if (isOpen) {
      setSelectedTier((adminCageTierOverride ?? cageTier ?? 1) as CageTier);
      setIsAutoProgress(adminCageTierOverride === null || adminCageTierOverride === undefined);
      setCageColor(currentCageColor);
      setTunnelColor(currentTunnelColor);
      setTunnelTexture(currentTunnelTexture);
      setFloorStyle(currentFloorStyle);
      setFloor2Toy(currentTierToys.floor2Toy);
      setFloor3Toy(currentTierToys.floor3Toy);
      setSelectedHouse(currentFurniture.house);
      setSelectedBowl(currentFurniture.bowl);
      setSelectedBottle(currentFurniture.waterBottle);
      setSelectedWheel(currentFurniture.wheel || 'classic');
    }
  }, [
    isOpen,
    cageTier,
    adminCageTierOverride,
    currentCageColor,
    currentTunnelColor,
    currentTunnelTexture,
    currentFloorStyle,
    currentTierToys,
    currentFurniture,
  ]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave({
      tierOverride: isAutoProgress ? null : selectedTier,
      cageColor,
      tunnelColor,
      tunnelTexture,
      floorStyle,
      tierToys: {
        floor2Toy,
        floor3Toy,
      },
      furniture: {
        ...currentFurniture,
        house: selectedHouse,
        bowl: selectedBowl,
        waterBottle: selectedBottle,
        wheel: selectedWheel,
      },
    });
    soundManager.playSuccessJingle();
    onClose();
  };

  const effectiveTier = selectedTier;

  const tabs: { key: TabKey; label: string; icon: string; badge?: string }[] = [
    { key: 'tiers', label: 'Этажи', icon: '🪜' },
    { key: 'cage', label: 'Каркас', icon: '🏰' },
    { key: 'tunnels', label: 'Трубы', icon: '🚇', badge: effectiveTier < 2 ? 'от 2 эт.' : undefined },
    { key: 'corrugation', label: 'Гофра', icon: '🔄', badge: effectiveTier < 2 ? 'от 2 эт.' : undefined },
    { key: 'floors', label: 'Полы', icon: '🪵', badge: effectiveTier < 2 ? 'от 2 эт.' : undefined },
    { key: 'floor2_toys', label: 'Игрушка 2 эт.', icon: '🎪', badge: effectiveTier < 2 ? '🔒 2 эт.' : undefined },
    { key: 'floor3_toys', label: 'Игрушка 3 эт.', icon: '👑', badge: effectiveTier < 3 ? '🔒 3 эт.' : undefined },
    { key: 'furniture', label: '1-й этаж', icon: '🏠' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-cyan rounded-xl max-w-2xl w-full p-4 sm:p-6 shadow-pixel-lg text-white font-pixel max-h-[92vh] flex flex-col">
        {/* Заголовок модального окна */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-retro-purple mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏗️</span>
            <div>
              <h2 className="text-xs sm:text-sm text-retro-yellow">ОБУСТРОЙСТВО И ДИЗАЙН КЛЕТКИ</h2>
              <div className="text-[8px] text-retro-white/70">
                Этажи, каркас, диагональные туннели, гофра, полы и игрушки
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="text-retro-grey hover:text-white px-2.5 py-1 bg-retro-purple border-2 border-black rounded text-xs active:translate-y-0.5"
          >
            ✕
          </button>
        </div>

        {/* Навигационные табы */}
        <div className="flex flex-wrap gap-1.5 border-b-2 border-retro-purple/60 pb-2.5 mb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  soundManager.playClickSound();
                }}
                className={`px-2.5 py-1.5 rounded text-[8px] sm:text-[9px] border-2 flex items-center gap-1.5 transition-all active:translate-y-0.5 ${
                  isActive
                    ? 'border-retro-yellow bg-retro-blue text-retro-yellow shadow-pixel-sm'
                    : 'border-black bg-retro-purple/80 text-retro-white/90 hover:bg-retro-purple'
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
            );
          })}
        </div>

        {/* Контент активного таба */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* ================================================================ */}
          {/* ТАБ 1: ВЫБОР КОЛИЧЕСТВА ЭТАЖЕЙ ДОМИКА */}
          {/* ================================================================ */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="bg-retro-blue/30 border border-retro-blue/50 p-2.5 rounded text-[8px] sm:text-[9px] text-retro-cyan leading-relaxed">
                🪜 <b>Количество этажей клетки:</b> выберите желаемый размер домика для хомячка.
                При увеличении этажности клетка вырастает в высоту, добавляются диагональные туннели и площадки для новых игрушек!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1 Этаж */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier(1);
                    setIsAutoProgress(false);
                    soundManager.playClickSound();
                  }}
                  className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                    selectedTier === 1 && !isAutoProgress
                      ? 'border-retro-yellow bg-retro-blue shadow-pixel-sm scale-[1.03]'
                      : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🏡</span>
                      <span className="text-[7px] px-1.5 py-0.5 bg-black/60 text-retro-cyan rounded font-bold">
                        1 ЭТАЖ
                      </span>
                    </div>
                    <div className="text-[10px] text-retro-yellow font-bold mb-1">Одноярусная клетка</div>
                    <div className="text-[8px] text-retro-white/80 leading-relaxed mb-2">
                      Уютный классический нижний ярус с опилками. Просторный домик, колесо, кормушка и поилка.
                    </div>
                  </div>
                  <div className="pt-2 border-t border-black/40 text-[7px] text-retro-cyan leading-tight">
                    • 1 этаж (дно)<br />
                    • Без туннелей<br />
                    • Базовое оборудование
                  </div>
                </button>

                {/* 2 Этажа */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier(2);
                    setIsAutoProgress(false);
                    soundManager.playClickSound();
                  }}
                  className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                    selectedTier === 2 && !isAutoProgress
                      ? 'border-retro-yellow bg-retro-blue shadow-pixel-sm scale-[1.03]'
                      : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🪜</span>
                      <span className="text-[7px] px-1.5 py-0.5 bg-black/60 text-green-400 rounded font-bold">
                        2 ЭТАЖА
                      </span>
                    </div>
                    <div className="text-[10px] text-retro-yellow font-bold mb-1">Двухъярусная с мезонином</div>
                    <div className="text-[8px] text-retro-white/80 leading-relaxed mb-2">
                      Появляется второй этаж и диагональная акриловая труба! Хомяк взбирается наверх и играет с новыми игрушками.
                    </div>
                  </div>
                  <div className="pt-2 border-t border-black/40 text-[7px] text-green-300 leading-tight">
                    • 2 этажа (мезонин)<br />
                    • 1 диагональный туннель<br />
                    • Игрушки 2-го яруса
                  </div>
                </button>

                {/* 3 Этажа */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier(3);
                    setIsAutoProgress(false);
                    soundManager.playClickSound();
                  }}
                  className={`p-3 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                    selectedTier === 3 && !isAutoProgress
                      ? 'border-retro-yellow bg-retro-blue shadow-pixel-sm scale-[1.03]'
                      : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🏰</span>
                      <span className="text-[7px] px-1.5 py-0.5 bg-black/60 text-yellow-300 rounded font-bold">
                        3 ЭТАЖА
                      </span>
                    </div>
                    <div className="text-[10px] text-retro-yellow font-bold mb-1">Трехъярусный пентхаус</div>
                    <div className="text-[8px] text-retro-white/80 leading-relaxed mb-2">
                      Максимальный простор! 3 полноценных этажа, 2 скоростных диагональных туннеля, мезонин и королевский пентхаус.
                    </div>
                  </div>
                  <div className="pt-2 border-t border-black/40 text-[7px] text-yellow-300 leading-tight">
                    • 3 этажа (пентхаус)<br />
                    • 2 диагональных туннеля<br />
                    • Все аттракционы и локации
                  </div>
                </button>
              </div>

              {/* Переключатель авто-роста по возрасту */}
              <div className="p-3 bg-black/40 border border-retro-purple/60 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[9px] text-retro-yellow font-bold flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Автоматический рост клетки по возрасту хомячка</span>
                  </div>
                  <div className="text-[7px] text-retro-white/70 mt-0.5">
                    1-й ярус: от рождения • 2-й ярус: с 3-го дня • 3-й ярус: с 6-го дня
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoProgress(!isAutoProgress);
                    soundManager.playClickSound();
                  }}
                  className={`px-3 py-1.5 rounded text-[8px] font-bold border transition-all whitespace-nowrap ${
                    isAutoProgress
                      ? 'bg-retro-green text-black border-black shadow-pixel-sm'
                      : 'bg-retro-purple text-retro-white border-black hover:bg-retro-purple/80'
                  }`}
                >
                  {isAutoProgress ? '✓ Включен (По возрасту)' : 'Ручной выбор'}
                </button>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ТАБ 2: КАРКАС И ПРУТЬЯ КЛЕТКИ */}
          {/* ================================================================ */}
          {activeTab === 'cage' && (
            <div className="space-y-3">
              <div className="bg-retro-blue/30 border border-retro-blue/50 p-2.5 rounded text-[8px] text-retro-cyan">
                💡 Окрашивает внешнюю раму, вертикальные прутья и горизонтальные ребра жесткости клетки на всех этажах.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      className={`p-2.5 rounded-lg border-2 text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-retro-yellow bg-retro-blue scale-[1.02] shadow-pixel-sm'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded border-2 border-black flex flex-col justify-around p-1"
                          style={{ backgroundColor: pal.frame }}
                        >
                          <div className="w-full h-1 rounded-sm" style={{ backgroundColor: pal.wire }} />
                          <div className="w-full h-1 rounded-sm" style={{ backgroundColor: pal.wireHighlight }} />
                          <div className="w-full h-1 rounded-sm" style={{ backgroundColor: pal.trayRim }} />
                        </div>
                        <div>
                          <div className="text-[9px] text-retro-yellow font-bold flex items-center gap-1">
                            <span>{pal.icon}</span>
                            <span>{pal.name}</span>
                          </div>
                          <div className="text-[7px] text-retro-white/70">{pal.nameEn}</div>
                        </div>
                      </div>
                      {isSelected && <span className="text-retro-yellow text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ТАБ 3: ЦВЕТ АКТИВНЫХ ТУННЕЛЕЙ */}
          {/* ================================================================ */}
          {activeTab === 'tunnels' && (
            <div className="space-y-4">
              <div className="bg-retro-blue/30 border border-retro-blue/50 p-2.5 rounded text-[8px] text-retro-cyan">
                ✨ Диагональные трубы соединяют этажи. Труба плавно проявляется в момент перехода хомячка.
                Здесь настраивается оттенок прозрачного акрилового стекла и неоновых муфт.
              </div>

              <div>
                <h3 className="text-[9px] text-retro-yellow mb-2 uppercase tracking-wide">
                  Цвет акрилового стекла и неоновых муфт (8 расцветок)
                </h3>
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
                        className={`p-2.5 rounded border-2 text-center flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-retro-yellow bg-retro-blue scale-105 shadow-pixel-sm'
                            : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center"
                          style={{
                            backgroundColor: pal.glassFill,
                            borderColor: pal.glassStroke,
                            boxShadow: `0 0 10px ${pal.jointRingAccent}`,
                          }}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: pal.jointRingAccent }}
                          />
                        </div>
                        <div className="text-[8px] text-retro-yellow font-bold">{pal.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ТАБ 4: ГОФРА И РЕЛЬЕФ ТУННЕЛЕЙ (ОТДЕЛЬНЫЙ ПУНКТ) */}
          {/* ================================================================ */}
          {activeTab === 'corrugation' && (
            <div className="space-y-4">
              <div className="bg-retro-blue/30 border border-retro-blue/50 p-2.5 rounded text-[8px] text-retro-cyan">
                🔄 <b>Фактура и рельеф гофры:</b> задает внутренний и внешний рельефный узор туннеля (кольца гофры, спирали, соты или кристальную прозрачность).
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      className={`p-3 rounded-lg border-2 text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-retro-yellow bg-retro-blue scale-[1.02] shadow-pixel-sm'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{tex.icon}</span>
                        <div>
                          <div className="text-[9px] text-retro-yellow font-bold">{tex.name}</div>
                          <div className="text-[7px] text-retro-white/70">{tex.desc}</div>
                        </div>
                      </div>
                      {isSelected && <span className="text-retro-yellow text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ТАБ 5: ПОКРЫТИЯ ПОЛОВ 2-ГО И 3-ГО ЭТАЖЕЙ */}
          {/* ================================================================ */}
          {activeTab === 'floors' && (
            <div className="space-y-3">
              <div className="bg-retro-blue/30 border border-retro-blue/50 p-2.5 rounded text-[8px] text-retro-cyan">
                🪵 Меняет покрытие массивных полочек 2-го и 3-го ярусов клетки.
                Платформы имеют утолщенный профиль 24px, чтобы хомячок уверенно топал лапками!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      className={`p-2.5 rounded border-2 text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-retro-yellow bg-retro-blue scale-[1.02] shadow-pixel-sm'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded border-2 border-black flex items-center justify-center text-lg"
                          style={{ backgroundColor: f.mainColor }}
                        >
                          <span>{f.icon}</span>
                        </div>
                        <div>
                          <div className="text-[9px] text-retro-yellow font-bold">{f.name}</div>
                          <div className="text-[7px] text-retro-white/70">{f.desc}</div>
                        </div>
                      </div>
                      {isSelected && <span className="text-retro-yellow text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ТАБ 6: ИГРУШКА 2-ГО ЭТАЖА (СВОЙСТВА И БАФФЫ) */}
          {/* ================================================================ */}
          {activeTab === 'floor2_toys' && (
            <div className="space-y-3">
              <div className="bg-retro-blue/30 border border-retro-blue/50 p-2.5 rounded text-[8px] text-retro-cyan flex justify-between items-center">
                <span>
                  🎪 Игрушка устанавливается на мезонин-платформе 2-го этажа.
                  Хомяк играет автономно или по клику мыши! Также игрушку можно двигать мышью.
                </span>
                {onPlayWithToy && effectiveTier >= 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      onPlayWithToy(2);
                      onClose();
                    }}
                    className="ml-2 shrink-0 px-2 py-1 bg-retro-yellow text-black font-bold rounded text-[8px] hover:bg-yellow-300"
                  >
                    ▶ Играть сейчас
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {Object.values(FLOOR2_TOY_PRESETS).map((toy) => {
                  const isSelected = floor2Toy === toy.id;
                  const eff = toy.effects;

                  return (
                    <div
                      key={toy.id}
                      onClick={() => {
                        setFloor2Toy(toy.id as Floor2ToyId);
                        soundManager.playClickSound();
                      }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-retro-yellow bg-retro-blue shadow-pixel-sm'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{toy.icon}</span>
                          <div>
                            <div className="text-[10px] text-retro-yellow font-bold">{toy.name}</div>
                            <div className="text-[7px] text-retro-white/80">{toy.desc}</div>
                          </div>
                        </div>
                        {isSelected && <span className="text-retro-yellow text-xs font-bold">✓ Выбрано</span>}
                      </div>

                      {/* Свойства игрушки */}
                      <div className="bg-black/40 p-2 rounded flex flex-wrap gap-2 text-[7px]">
                        {eff.happinessGain && (
                          <span className="text-pink-400 font-bold">❤️ +{eff.happinessGain} Радость</span>
                        )}
                        {eff.energyGain && (
                          <span className="text-yellow-400 font-bold">⚡ {eff.energyGain > 0 ? '+' : ''}{eff.energyGain} Энергия</span>
                        )}
                        {eff.hygieneGain && (
                          <span className="text-cyan-400 font-bold">🧼 +{eff.hygieneGain} Чистота</span>
                        )}
                        {eff.healthGain && (
                          <span className="text-green-400 font-bold">💖 +{eff.healthGain} Здоровье</span>
                        )}
                        <span className="text-retro-grey">⏱️ {toy.durationSec}с анимации</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ТАБ 7: ИГРУШКА 3-ГО ЭТАЖА (СВОЙСТВА И БАФФЫ) */}
          {/* ================================================================ */}
          {activeTab === 'floor3_toys' && (
            <div className="space-y-3">
              <div className="bg-retro-blue/30 border border-retro-blue/50 p-2.5 rounded text-[8px] text-retro-cyan flex justify-between items-center">
                <span>
                  👑 Премиальный аттракцион на 3-м этаже (Пентхаус).
                  Дает мощные баффы здоровья и счастья хомячка!
                </span>
                {onPlayWithToy && effectiveTier >= 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      onPlayWithToy(3);
                      onClose();
                    }}
                    className="ml-2 shrink-0 px-2 py-1 bg-retro-yellow text-black font-bold rounded text-[8px] hover:bg-yellow-300"
                  >
                    ▶ Играть сейчас
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {Object.values(FLOOR3_TOY_PRESETS).map((toy) => {
                  const isSelected = floor3Toy === toy.id;
                  const eff = toy.effects;

                  return (
                    <div
                      key={toy.id}
                      onClick={() => {
                        setFloor3Toy(toy.id as Floor3ToyId);
                        soundManager.playClickSound();
                      }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-retro-yellow bg-retro-blue shadow-pixel-sm'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{toy.icon}</span>
                          <div>
                            <div className="text-[10px] text-retro-yellow font-bold">{toy.name}</div>
                            <div className="text-[7px] text-retro-white/80">{toy.desc}</div>
                          </div>
                        </div>
                        {isSelected && <span className="text-retro-yellow text-xs font-bold">✓ Выбрано</span>}
                      </div>

                      {/* Свойства игрушки */}
                      <div className="bg-black/40 p-2 rounded flex flex-wrap gap-2 text-[7px]">
                        {eff.happinessGain && (
                          <span className="text-pink-400 font-bold">❤️ +{eff.happinessGain} Радость</span>
                        )}
                        {eff.energyGain && (
                          <span className="text-yellow-400 font-bold">⚡ {eff.energyGain > 0 ? '+' : ''}{eff.energyGain} Энергия</span>
                        )}
                        {eff.hygieneGain && (
                          <span className="text-cyan-400 font-bold">🧼 +{eff.hygieneGain} Чистота</span>
                        )}
                        {eff.healthGain && (
                          <span className="text-green-400 font-bold">💖 +{eff.healthGain} Здоровье</span>
                        )}
                        <span className="text-retro-grey">⏱️ {toy.durationSec}с анимации</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ТАБ 8: МЕБЕЛЬ И ОБОРУДОВАНИЕ 1-ГО ЭТАЖА */}
          {/* ================================================================ */}
          {activeTab === 'furniture' && (
            <div className="space-y-4">
              <div className="bg-retro-blue/30 border border-retro-blue/50 p-2 rounded text-[8px] text-retro-cyan">
                🏠 Базовое оборудование нижнего этажа на опилках. Всю мебель можно двигать мышью прямо в клетке!
              </div>

              {/* Домики */}
              <div>
                <h4 className="text-[9px] text-retro-yellow mb-2 uppercase">1. Уютный домик</h4>
                <div className="grid grid-cols-2 gap-2">
                  {HOUSES.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setSelectedHouse(h.id);
                        soundManager.playClickSound();
                      }}
                      className={`p-2 rounded border-2 text-left flex items-center gap-2 transition-all ${
                        selectedHouse === h.id
                          ? 'border-retro-yellow bg-retro-blue'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <span className="text-2xl">{h.icon}</span>
                      <div>
                        <div className="text-[8px] text-retro-yellow font-bold">{h.name}</div>
                        <div className="text-[7px] text-retro-white/70">{h.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Беговые колеса */}
              <div>
                <h4 className="text-[9px] text-retro-yellow mb-2 uppercase">2. Беговое колесо</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.values(WHEEL_PRESETS).slice(0, 8).map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setSelectedWheel(w.id);
                        soundManager.playClickSound();
                      }}
                      className={`p-2 rounded border-2 text-center flex flex-col items-center gap-1 transition-all ${
                        selectedWheel === w.id
                          ? 'border-retro-yellow bg-retro-blue'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <span className="text-xl">{w.icon}</span>
                      <div className="text-[7px] text-retro-yellow truncate w-full">{w.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Кормушки */}
              <div>
                <h4 className="text-[9px] text-retro-yellow mb-2 uppercase">3. Кормушка для зерна</h4>
                <div className="grid grid-cols-2 gap-2">
                  {BOWLS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBowl(b.id);
                        soundManager.playClickSound();
                      }}
                      className={`p-2 rounded border-2 text-left flex items-center gap-2 transition-all ${
                        selectedBowl === b.id
                          ? 'border-retro-yellow bg-retro-blue'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <span className="text-2xl">{b.icon}</span>
                      <div>
                        <div className="text-[8px] text-retro-yellow font-bold">{b.name}</div>
                        <div className="text-[7px] text-retro-white/70">{b.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Поилки */}
              <div>
                <h4 className="text-[9px] text-retro-yellow mb-2 uppercase">4. Автопоилка для воды</h4>
                <div className="grid grid-cols-3 gap-2">
                  {BOTTLES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBottle(b.id);
                        soundManager.playClickSound();
                      }}
                      className={`p-2 rounded border-2 text-left flex items-center gap-2 transition-all ${
                        selectedBottle === b.id
                          ? 'border-retro-yellow bg-retro-blue'
                          : 'border-black bg-retro-purple/70 hover:bg-retro-purple'
                      }`}
                    >
                      <span className="text-xl">{b.icon}</span>
                      <div>
                        <div className="text-[8px] text-retro-yellow font-bold">{b.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Подвал модального окна с кнопкой сохранения */}
        <div className="pt-3 border-t-2 border-retro-purple/60 flex items-center justify-between mt-3">
          <div className="text-[8px] text-retro-white/70">
            {selectedTier === 1 && 'Клетка: 1 этаж'}
            {selectedTier === 2 && 'Клетка: 2 этажа (1 туннель)'}
            {selectedTier === 3 && 'Клетка: 3 этажа (2 туннеля)'}
            {isAutoProgress && ' • Авто-рост'}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClickSound();
                onClose();
              }}
              className="px-3 py-1.5 bg-retro-purple border-2 border-black rounded text-[9px] hover:bg-retro-purple/80"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 bg-retro-green text-black font-bold border-2 border-black rounded text-[9px] hover:brightness-110 shadow-pixel-sm active:translate-y-0.5"
            >
              ✓ Сохранить обустройство
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
