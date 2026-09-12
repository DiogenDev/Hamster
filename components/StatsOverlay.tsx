/**
 * ============================================================================
 * КОМПОНЕНТ: StatsOverlay (Ретро HUD Статус-Баров Питомца)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Разделение рендеринга слоев (Layered Rendering):
 *    - Сложная динамическая графика хомячка рисуется на Canvas 2D.
 *    - Текстовый HUD и интерактивные полоски статов верстаются через Tailwind CSS.
 *    Это обеспечивает полную доступность (a11y), правильное масштабирование шрифтов
 *    и четкие границы пиксельных рамок без размытия текста на дисплеях с разной плотностью DPI.
 * 
 * 2. ЦВЕТОВАЯ КОДИРОВКА СТАТУСОВ:
 *    - Зеленый (>= 60%): Все в полном порядке, питомец счастлив.
 *    - Желтый (25% .. 59%): Требует внимания игрока.
 *    - Мигающий красный (< 25%): Критическое состояние, питомец страдает!
 * ============================================================================
 */

'use client';

import React from 'react';
import { HamsterNeeds, HamsterBehavior } from '@/types/hamster';

export interface StatsOverlayProps {
  petName: string;
  needs: HamsterNeeds;
  behavior: HamsterBehavior;
  ageSeconds: number;
}

export const StatsOverlay: React.FC<StatsOverlayProps> = ({
  petName,
  needs,
  behavior,
  ageSeconds,
}) => {
  // Форматирование возраста питомца (минуты и часы)
  const formatAge = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}ч ${mins % 60}м`;
    return `${mins}м ${totalSec % 60}с`;
  };

  // Текстовый бейдж поведения
  const getBehaviorBadge = (b: HamsterBehavior) => {
    switch (b) {
      case HamsterBehavior.IDLE:
        return { text: 'Бодрствует', color: 'bg-retro-blue text-white' };
      case HamsterBehavior.WALK:
        return { text: 'Исследует клетку', color: 'bg-retro-cyan text-black' };
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
    <div className="w-full max-w-2xl mx-auto bg-retro-dark border-4 border-black p-4 rounded-lg shadow-pixel text-white font-pixel select-none mb-3">
      {/* Верхняя строка: Имя, возраст и бейдж статуса */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-retro-purple">
        <div className="flex items-center gap-2">
          <span className="text-base text-retro-yellow">🐹 {petName}</span>
          <span className="text-[9px] text-retro-grey">
            (Возраст: {formatAge(ageSeconds)})
          </span>
        </div>
        <span
          className={`text-[9px] px-2 py-1 rounded border border-black font-bold uppercase ${badge.color}`}
        >
          {badge.text}
        </span>
      </div>

      {/* Сетка 5 показателей */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        <StatBar label="Сытость" value={needs.hunger} icon="🌾" />
        <StatBar label="Энергия" value={needs.energy} icon="⚡" />
        <StatBar label="Чистота" value={needs.hygiene} icon="🧼" />
        <StatBar label="Счастье" value={needs.happiness} icon="💖" />
        <StatBar label="Здоровье" value={needs.health} icon="❤️" />
      </div>
    </div>
  );
};

interface StatBarProps {
  label: string;
  value: number;
  icon: string;
}

function StatBar({ label, value, icon }: StatBarProps) {
  const rounded = Math.round(Math.max(0, Math.min(100, value)));

  // Определение цвета полоски
  let barColor = 'bg-retro-green';
  let isDanger = false;

  if (rounded < 25) {
    barColor = 'bg-retro-red animate-pulse';
    isDanger = true;
  } else if (rounded < 60) {
    barColor = 'bg-retro-yellow';
  }

  return (
    <div className="bg-retro-purple/60 p-2 rounded border border-black flex flex-col gap-1">
      <div className="flex justify-between items-center text-[9px]">
        <span className="text-retro-grey flex items-center gap-1">
          <span>{icon}</span> {label}
        </span>
        <span
          className={`font-bold ${
            isDanger ? 'text-retro-red' : 'text-retro-white'
          }`}
        >
          {rounded}%
        </span>
      </div>

      {/* Пиксельная полоска прогресса */}
      <div className="w-full h-3 bg-black border border-retro-blue rounded-sm p-[1px] overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${rounded}%` }}
        />
      </div>
    </div>
  );
}
