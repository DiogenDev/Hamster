/**
 * ============================================================================
 * КОМПОНЕНТ: StatsOverlay (Ретро HUD с поддержкой Дзен-Режима)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ПОДДЕРЖКА ДЗЕН-РЕЖИМА (Zen / Ambient Companion Mode):
 *    Если включен режим "Дзен" или отключены конкретные показатели, HUD отображает
 *    символ бесконечности `∞` и золотисто-бирюзовый бейдж, информируя игрока
 *    о том, что за питомцем не требуется ухаживать, и он живет в полном комфорте.
 * ============================================================================
 */

'use client';

import React from 'react';
import {
  HamsterNeeds,
  HamsterBehavior,
  DisabledStatsConfig,
} from '@/types/hamster';

export interface StatsOverlayProps {
  petName: string;
  needs: HamsterNeeds;
  behavior: HamsterBehavior;
  ageSeconds: number;
  zenMode?: boolean;
  disabledStats?: DisabledStatsConfig;
  onToggleZenMode?: () => void;
}

export const StatsOverlay: React.FC<StatsOverlayProps> = ({
  petName,
  needs,
  behavior,
  ageSeconds,
  zenMode = false,
  disabledStats,
  onToggleZenMode,
}) => {
  const formatAge = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}ч ${mins % 60}м`;
    return `${mins}м ${totalSec % 60}с`;
  };

  const getBehaviorBadge = (b: HamsterBehavior) => {
    switch (b) {
      case HamsterBehavior.IDLE:
        return { text: 'Бодрствует', color: 'bg-retro-blue text-white' };
      case HamsterBehavior.WALK:
        return { text: 'Гуляет по клетке', color: 'bg-retro-cyan text-black' };
      case HamsterBehavior.WHEEL:
        return { text: 'Крутит колесо 🎡', color: 'bg-sky-500 text-black font-bold animate-pulse' };
      case HamsterBehavior.GROOM:
        return { text: 'Умывается ✨', color: 'bg-pink-500 text-white' };
      case HamsterBehavior.SNIFF:
        return { text: 'Ищет вкусняшки 🌾', color: 'bg-amber-600 text-white' };
      case HamsterBehavior.LAYING:
        return { text: 'Отдыхает', color: 'bg-retro-purple text-retro-white' };
      case HamsterBehavior.SLEEP:
        return { text: 'Спит 💤', color: 'bg-indigo-900 text-yellow-300 animate-pulse' };
      case HamsterBehavior.EATING:
        return { text: 'Кушает 🌾', color: 'bg-amber-600 text-white animate-bounce' };
      case HamsterBehavior.POOPING:
        return { text: 'В туалете 💩', color: 'bg-yellow-800 text-white' };
    }
  };

  const badge = getBehaviorBadge(behavior);

  return (
    <div className="w-full max-w-3xl mx-auto bg-retro-dark border-4 border-black p-3 sm:p-4 rounded-lg shadow-pixel text-white font-pixel select-none mb-3">
      {/* Верхняя строка: Имя, статус, возраст и быстрый переключатель Дзен */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b-2 border-retro-purple">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base text-retro-yellow">🐹 {petName}</span>
          <span className="text-[8px] text-retro-grey">
            ({formatAge(ageSeconds)})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[8px] sm:text-[9px] px-2 py-1 rounded border border-black font-bold uppercase ${badge.color}`}
          >
            {badge.text}
          </span>

          {onToggleZenMode && (
            <button
              onClick={onToggleZenMode}
              className={`text-[8px] px-2 py-1 rounded border border-black transition-all ${
                zenMode
                  ? 'bg-retro-yellow text-black font-bold shadow-pixel-sm'
                  : 'bg-retro-purple text-retro-grey hover:text-white'
              }`}
            >
              {zenMode ? '✨ ДЗЕН: ВКЛ' : '🧘 ДЗЕН: ВЫКЛ'}
            </button>
          )}
        </div>
      </div>

      {/* Сетка показателей */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <StatBar
          label="Сытость"
          value={needs.hunger}
          icon="🌾"
          isLocked={zenMode || Boolean(disabledStats?.hunger)}
        />
        <StatBar
          label="Энергия"
          value={needs.energy}
          icon="⚡"
          isLocked={zenMode || Boolean(disabledStats?.energy)}
        />
        <StatBar
          label="Чистота"
          value={needs.hygiene}
          icon="🧼"
          isLocked={zenMode || Boolean(disabledStats?.hygiene)}
        />
        <StatBar
          label="Счастье"
          value={needs.happiness}
          icon="💖"
          isLocked={zenMode || Boolean(disabledStats?.happiness)}
        />
        <StatBar
          label="Здоровье"
          value={needs.health}
          icon="❤️"
          isLocked={zenMode || Boolean(disabledStats?.health)}
        />
      </div>
    </div>
  );
};

interface StatBarProps {
  label: string;
  value: number;
  icon: string;
  isLocked?: boolean;
}

function StatBar({ label, value, icon, isLocked }: StatBarProps) {
  const rounded = Math.round(Math.max(0, Math.min(100, value)));

  let barColor = 'bg-retro-green';
  let isDanger = false;

  if (isLocked) {
    barColor = 'bg-retro-yellow';
  } else if (rounded < 25) {
    barColor = 'bg-retro-red animate-pulse';
    isDanger = true;
  } else if (rounded < 60) {
    barColor = 'bg-retro-yellow';
  }

  return (
    <div className="bg-retro-purple/60 p-1.5 sm:p-2 rounded border border-black flex flex-col gap-1">
      <div className="flex justify-between items-center text-[8px]">
        <span className="text-retro-grey flex items-center gap-1">
          <span>{icon}</span> {label}
        </span>
        <span
          className={`font-bold ${
            isLocked
              ? 'text-retro-yellow'
              : isDanger
              ? 'text-retro-red'
              : 'text-retro-white'
          }`}
        >
          {isLocked ? '∞' : `${rounded}%`}
        </span>
      </div>

      <div className="w-full h-2.5 bg-black border border-retro-blue rounded-sm p-[1px] overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: isLocked ? '100%' : `${rounded}%` }}
        />
      </div>
    </div>
  );
}
