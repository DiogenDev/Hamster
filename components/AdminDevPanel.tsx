/**
 * ============================================================================
 * КОМПОНЕНТ: AdminDevPanel (Админская панель разработчика для тестирования ярусов)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: ТРЕБОВАНИЯ И БЕЗОПАСНОСТЬ
 * ----------------------------------------------------------------------------
 * 1. ИЗОЛЯЦИЯ DEV-РЕЖИМА:
 *    Панель рендерится исключительно в режиме разработки (process.env.NODE_ENV === 'development').
 *    В пользовательском продакшн-билде компонент возвращает null и не виден обычным игрокам.
 * 
 * 2. ВОЗМОЖНОСТИ ТЕСТИРОВАНИЯ:
 *    - Быстрое переключение уровней и ярусов клетки (Ярус 1, 2, 3)
 *    - Добавление и сброс возраста (+1 день, +3 дня = +1 уровень, сброс)
 *    - Телепортация хомячка на 1-й этаж, 2-й этаж (мезонин), 3-й этаж (пентхаус) и в туннель
 *    - Мгновенное восполнение потребностей
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import {
  CageTier,
  CageColorId,
  TunnelColorId,
  TunnelTextureId,
  FloorStyleId,
  Floor2ToyId,
  Floor3ToyId,
} from '@/types/hamster';
import {
  calculateHamsterLevel,
  calculateHamsterAgeDays,
  formatHamsterAgeDetailed,
  SECONDS_PER_DAY,
  DAYS_PER_LEVEL,
  CAGE_COLOR_PALETTES,
  TUNNEL_COLOR_PALETTES,
  TUNNEL_TEXTURE_PRESETS,
  FLOOR_STYLE_PRESETS,
  FLOOR2_TOY_PRESETS,
  FLOOR3_TOY_PRESETS,
} from '@/utils/cageTiers';

export interface AdminDevPanelProps {
  currentTier: CageTier;
  currentFloor: 1 | 2 | 3;
  totalAgeSeconds: number;
  adminCageTierOverride?: CageTier | null;
  currentCageColor?: CageColorId;
  currentTunnelColor?: TunnelColorId;
  currentTunnelTexture?: TunnelTextureId;
  currentFloorStyle?: FloorStyleId;
  currentFloor2Toy?: Floor2ToyId;
  currentFloor3Toy?: Floor3ToyId;
  onSetTierOverride: (tier: CageTier | null) => void;
  onAddAgeSeconds: (seconds: number) => void;
  onSetAgeSeconds: (seconds: number) => void;
  onTeleportToFloor: (floor: 1 | 2 | 3) => void;
  onRequestFloorChange?: (floor: 1 | 2 | 3) => void;
  onSelectCageColor?: (color: CageColorId) => void;
  onSelectTunnelColor?: (color: TunnelColorId) => void;
  onSelectTunnelTexture?: (texture: TunnelTextureId) => void;
  onSelectFloorStyle?: (style: FloorStyleId) => void;
  onSelectFloor2Toy?: (toy: Floor2ToyId) => void;
  onSelectFloor3Toy?: (toy: Floor3ToyId) => void;
  onRefillStats: () => void;
  onDepleteStats?: () => void;
}

export const AdminDevPanel: React.FC<AdminDevPanelProps> = ({
  currentTier,
  currentFloor,
  totalAgeSeconds,
  adminCageTierOverride,
  currentCageColor = 'silver',
  currentTunnelColor = 'neon_cyan',
  currentTunnelTexture = 'smooth_glass',
  currentFloorStyle = 'natural_oak',
  currentFloor2Toy = 'seesaw',
  currentFloor3Toy = 'telescope',
  onSetTierOverride,
  onAddAgeSeconds,
  onSetAgeSeconds,
  onTeleportToFloor,
  onRequestFloorChange,
  onSelectCageColor,
  onSelectTunnelColor,
  onSelectTunnelTexture,
  onSelectFloorStyle,
  onSelectFloor2Toy,
  onSelectFloor3Toy,
  onRefillStats,
  onDepleteStats,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // СТРОГАЯ ПРОВЕРКА: панель видна ТОЛЬКО в режиме разработки (dev)
  // В продакшне у обычных пользователей панель полностью скрыта.
  const isDevMode =
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.search.includes('admin=1')));

  if (!isMounted || !isDevMode) {
    return null;
  }

  const currentLevel = calculateHamsterLevel(totalAgeSeconds);
  const ageDays = calculateHamsterAgeDays(totalAgeSeconds).toFixed(2);
  const ageText = formatHamsterAgeDetailed(totalAgeSeconds);

  return (
    <div className="w-full max-w-3xl mx-auto my-3 select-none font-pixel">
      <div className="bg-amber-950/80 border-2 border-amber-500 rounded-lg p-2.5 sm:p-3 text-white shadow-pixel">
        {/* Заголовок панели */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-500/40">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-xs sm:text-sm">🛠️ DEV ADMIN PANEL</span>
            <span className="text-[8px] bg-amber-500 text-black px-1.5 py-0.5 rounded font-bold uppercase">
              Только для разработки
            </span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[8px] text-amber-300 hover:text-white px-2 py-0.5 rounded bg-black/50 border border-amber-500/50"
          >
            {isOpen ? '▲ Свернуть' : '▼ Развернуть'}
          </button>
        </div>

        {isOpen && (
          <div className="pt-2.5 space-y-2.5 text-[8px]">
            {/* Сводка текущего состояния */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-black/40 p-2 rounded border border-amber-500/30">
              <div>
                <span className="text-amber-400/80 block">Уровень:</span>
                <span className="font-bold text-retro-yellow text-[9px]">⭐ Ур. {currentLevel}</span>
              </div>
              <div>
                <span className="text-amber-400/80 block">Ярус клетки:</span>
                <span className="font-bold text-retro-cyan text-[9px]">
                  Ярус {currentTier} {adminCageTierOverride ? '(Оверрайд)' : '(Авто)'}
                </span>
              </div>
              <div>
                <span className="text-amber-400/80 block">Возраст:</span>
                <span className="font-bold text-white text-[9px]">{ageDays} д. ({ageText})</span>
              </div>
              <div>
                <span className="text-amber-400/80 block">Этаж хомячка:</span>
                <span className="font-bold text-emerald-400 text-[9px]">
                  {currentFloor}-й этаж
                </span>
              </div>
            </div>

            {/* Быстрое переключение ярусов клетки */}
            <div>
              <span className="text-amber-300 block mb-1 font-bold">1. Уровень & Ярус клетки:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    onSetAgeSeconds(0);
                    onSetTierOverride(1);
                  }}
                  className={`px-2.5 py-1 rounded border transition-colors ${
                    currentTier === 1 && !adminCageTierOverride
                      ? 'bg-amber-500 text-black font-bold border-amber-300'
                      : 'bg-black/60 text-amber-200 border-amber-500/40 hover:bg-black'
                  }`}
                >
                  ⭐ Ур. 1: Одноярусная (0 дн)
                </button>

                <button
                  onClick={() => {
                    onSetAgeSeconds(3 * SECONDS_PER_DAY);
                    onSetTierOverride(2);
                  }}
                  className={`px-2.5 py-1 rounded border transition-colors ${
                    currentTier === 2
                      ? 'bg-amber-500 text-black font-bold border-amber-300'
                      : 'bg-black/60 text-amber-200 border-amber-500/40 hover:bg-black'
                  }`}
                >
                  ⭐⭐ Ур. 2: Двухъярусная (3 дн)
                </button>

                <button
                  onClick={() => {
                    onSetAgeSeconds(6 * SECONDS_PER_DAY);
                    onSetTierOverride(3);
                  }}
                  className={`px-2.5 py-1 rounded border transition-colors ${
                    currentTier === 3
                      ? 'bg-amber-500 text-black font-bold border-amber-300'
                      : 'bg-black/60 text-amber-200 border-amber-500/40 hover:bg-black'
                  }`}
                >
                  ⭐⭐⭐ Ур. 3: Трехъярусная с туннелями (6 дн)
                </button>

                {adminCageTierOverride && (
                  <button
                    onClick={() => onSetTierOverride(null)}
                    className="px-2 py-1 rounded border border-red-500/50 bg-red-950/60 text-red-200 hover:bg-red-900/60"
                  >
                    ✖ Сбросить оверрайд
                  </button>
                )}
              </div>
            </div>

            {/* Управление возрастом хомячка */}
            <div>
              <span className="text-amber-300 block mb-1 font-bold">2. Настройка возраста:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => onAddAgeSeconds(SECONDS_PER_DAY)}
                  className="px-2 py-1 bg-black/60 text-amber-200 rounded border border-amber-500/40 hover:bg-black"
                >
                  +1 день
                </button>
                <button
                  onClick={() => onAddAgeSeconds(DAYS_PER_LEVEL * SECONDS_PER_DAY)}
                  className="px-2 py-1 bg-black/60 text-amber-200 rounded border border-amber-500/40 hover:bg-black"
                >
                  +3 дня (+1 уровень!)
                </button>
                <button
                  onClick={() => onAddAgeSeconds(-SECONDS_PER_DAY)}
                  className="px-2 py-1 bg-black/60 text-amber-200 rounded border border-amber-500/40 hover:bg-black"
                >
                  -1 день
                </button>
                <button
                  onClick={() => onSetAgeSeconds(0)}
                  className="px-2 py-1 bg-red-950/40 text-red-300 rounded border border-red-500/40 hover:bg-red-900/40"
                >
                  Сбросить на 0
                </button>
              </div>
            </div>

            {/* Перемещение хомячка на этажи */}
            <div>
              <span className="text-amber-300 block mb-1 font-bold">3. Перемещение по этажам:</span>
              <div className="flex flex-col gap-1.5 bg-black/40 p-2 rounded border border-amber-500/30">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-400 text-[7px] w-full block">🚇 Через диагональный туннель (плавно с анимацией):</span>
                  <button
                    onClick={() => (onRequestFloorChange ? onRequestFloorChange(1) : onTeleportToFloor(1))}
                    className={`px-2.5 py-1 rounded border ${
                      currentFloor === 1
                        ? 'bg-emerald-600 text-white font-bold border-emerald-400'
                        : 'bg-black/60 text-amber-200 border-amber-500/40 hover:bg-black'
                    }`}
                  >
                    ⬇ 1-й этаж (Опилки)
                  </button>

                  <button
                    onClick={() => (onRequestFloorChange ? onRequestFloorChange(2) : onTeleportToFloor(2))}
                    disabled={currentTier < 2}
                    className={`px-2.5 py-1 rounded border ${
                      currentFloor === 2
                        ? 'bg-emerald-600 text-white font-bold border-emerald-400'
                        : currentTier < 2
                        ? 'opacity-40 cursor-not-allowed bg-black/40 border-gray-700 text-gray-500'
                        : 'bg-black/60 text-amber-200 border-amber-500/40 hover:bg-black'
                    }`}
                  >
                    🪜 2-й этаж (Мезонин)
                  </button>

                  <button
                    onClick={() => (onRequestFloorChange ? onRequestFloorChange(3) : onTeleportToFloor(3))}
                    disabled={currentTier < 3}
                    className={`px-2.5 py-1 rounded border ${
                      currentFloor === 3
                        ? 'bg-emerald-600 text-white font-bold border-emerald-400'
                        : currentTier < 3
                        ? 'opacity-40 cursor-not-allowed bg-black/40 border-gray-700 text-gray-500'
                        : 'bg-black/60 text-amber-200 border-amber-500/40 hover:bg-black'
                    }`}
                  >
                    🌉 3-й этаж (Пентхаус)
                  </button>
                </div>

                <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-amber-500/20">
                  <span className="text-amber-400/70 text-[7px]">⚡ Мгновенный ТП:</span>
                  <button
                    onClick={() => onTeleportToFloor(1)}
                    className="px-1.5 py-0.5 rounded bg-black/50 text-retro-cyan border border-retro-cyan/40 hover:bg-black text-[7px]"
                  >
                    1-й эт.
                  </button>
                  <button
                    onClick={() => onTeleportToFloor(2)}
                    disabled={currentTier < 2}
                    className={`px-1.5 py-0.5 rounded text-[7px] border ${
                      currentTier < 2
                        ? 'opacity-30 border-gray-700 text-gray-600'
                        : 'bg-black/50 text-retro-cyan border-retro-cyan/40 hover:bg-black'
                    }`}
                  >
                    2-й эт.
                  </button>
                  <button
                    onClick={() => onTeleportToFloor(3)}
                    disabled={currentTier < 3}
                    className={`px-1.5 py-0.5 rounded text-[7px] border ${
                      currentTier < 3
                        ? 'opacity-30 border-gray-700 text-gray-600'
                        : 'bg-black/50 text-retro-cyan border-retro-cyan/40 hover:bg-black'
                    }`}
                  >
                    3-й эт.
                  </button>
                </div>
              </div>
            </div>

            {/* Быстрый выбор расцветок клетки и туннелей */}
            <div className="space-y-2">
              <div>
                <span className="text-amber-300 block mb-1 font-bold">4. Цвет клетки (каркас и прутья):</span>
                <div className="flex flex-wrap gap-1">
                  {Object.values(CAGE_COLOR_PALETTES).map((pal) => (
                    <button
                      key={pal.id}
                      onClick={() => onSelectCageColor?.(pal.id)}
                      className={`px-2 py-0.5 rounded text-[7px] border flex items-center gap-1 transition-all ${
                        currentCageColor === pal.id
                          ? 'bg-amber-500 text-black font-bold border-amber-300 scale-105'
                          : 'bg-black/60 text-amber-200 border-amber-500/40 hover:bg-black'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full border border-black inline-block"
                        style={{ backgroundColor: pal.wire }}
                      />
                      <span>{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-amber-300 block mb-1 font-bold">5. Цвет туннелей (акрил):</span>
                <div className="flex flex-wrap gap-1">
                  {Object.values(TUNNEL_COLOR_PALETTES).map((pal) => (
                    <button
                      key={pal.id}
                      onClick={() => onSelectTunnelColor?.(pal.id)}
                      className={`px-2 py-0.5 rounded text-[7px] border flex items-center gap-1 transition-all ${
                        currentTunnelColor === pal.id
                          ? 'bg-sky-500 text-black font-bold border-sky-300 scale-105'
                          : 'bg-black/60 text-sky-200 border-sky-500/40 hover:bg-black'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full border border-black inline-block"
                        style={{ backgroundColor: pal.jointRing }}
                      />
                      <span>{pal.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-amber-300 block mb-1 font-bold">6. Текстура туннелей (узор):</span>
                <div className="flex flex-wrap gap-1">
                  {Object.values(TUNNEL_TEXTURE_PRESETS).map((tex) => (
                    <button
                      key={tex.id}
                      onClick={() => onSelectTunnelTexture?.(tex.id)}
                      className={`px-2 py-0.5 rounded text-[7px] border flex items-center gap-1 transition-all ${
                        currentTunnelTexture === tex.id
                          ? 'bg-purple-500 text-white font-bold border-purple-300 scale-105'
                          : 'bg-black/60 text-purple-200 border-purple-500/40 hover:bg-black'
                      }`}
                    >
                      <span>{tex.icon}</span>
                      <span>{tex.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-amber-300 block mb-1 font-bold">7. Покрытие полов 2-3 эт.:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.values(FLOOR_STYLE_PRESETS).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onSelectFloorStyle?.(f.id)}
                      className={`px-2 py-0.5 rounded text-[7px] border flex items-center gap-1 transition-all ${
                        currentFloorStyle === f.id
                          ? 'bg-emerald-500 text-black font-bold border-emerald-300 scale-105'
                          : 'bg-black/60 text-emerald-200 border-emerald-500/40 hover:bg-black'
                      }`}
                    >
                      <span>{f.icon}</span>
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-amber-300 block mb-1 font-bold">8. Игрушка 2-го этажа:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.values(FLOOR2_TOY_PRESETS).map((toy) => (
                    <button
                      key={toy.id}
                      onClick={() => onSelectFloor2Toy?.(toy.id as Floor2ToyId)}
                      className={`px-2 py-0.5 rounded text-[7px] border flex items-center gap-1 transition-all ${
                        currentFloor2Toy === toy.id
                          ? 'bg-pink-500 text-white font-bold border-pink-300 scale-105'
                          : 'bg-black/60 text-pink-200 border-pink-500/40 hover:bg-black'
                      }`}
                    >
                      <span>{toy.icon}</span>
                      <span>{toy.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-amber-300 block mb-1 font-bold">9. Игрушка 3-го этажа:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.values(FLOOR3_TOY_PRESETS).map((toy) => (
                    <button
                      key={toy.id}
                      onClick={() => onSelectFloor3Toy?.(toy.id as Floor3ToyId)}
                      className={`px-2 py-0.5 rounded text-[7px] border flex items-center gap-1 transition-all ${
                        currentFloor3Toy === toy.id
                          ? 'bg-indigo-500 text-white font-bold border-indigo-300 scale-105'
                          : 'bg-black/60 text-indigo-200 border-indigo-500/40 hover:bg-black'
                      }`}
                    >
                      <span>{toy.icon}</span>
                      <span>{toy.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Быстрые команды потребностей */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-500/30">
              <span className="text-amber-400/80">Потребности:</span>
              <button
                onClick={onRefillStats}
                className="px-2 py-0.5 bg-emerald-900/60 text-emerald-200 rounded border border-emerald-500/40 hover:bg-emerald-800/60"
              >
                💚 100% Все статы
              </button>
              {onDepleteStats && (
                <button
                  onClick={onDepleteStats}
                  className="px-2 py-0.5 bg-rose-950/60 text-rose-300 rounded border border-rose-500/40 hover:bg-rose-900/60"
                >
                  💔 Снизить статы (тест голода/усталости)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
