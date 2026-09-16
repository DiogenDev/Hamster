/**
 * ============================================================================
 * КОМПОНЕНТ: StatsOverlay (Ретро HUD с поддержкой Дзен-Режима и Мобильной Адаптацией)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. МОБИЛЬНАЯ ЭРГОНОМИКА (Mobile First HUD):
 *    На смартфонах блок статов сжат с ~330px до ~54px:
 *    - 1-я строка: Имя питомца, уровень, статус, переключатель Дзен и кнопка раскрытия.
 *    - 2-я строка: Все 5 потребностей в одной горизонтальной полоске с микро-индикаторами.
 * 2. ПОЛНЫЙ ДЕСКТОПНЫЙ РЕЖИМ (sm:):
 *    На широких мониторах сохраняется просторный вид со всеми деталями.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  HamsterNeeds,
  HamsterBehavior,
  DisabledStatsConfig,
  CageTier,
} from '@/types/hamster';
import {
  calculateHamsterLevel,
  getEffectiveCageTier,
  getLevelProgress,
  formatHamsterAgeDetailed,
  CAGE_TIERS,
} from '@/utils/cageTiers';

export interface StatsOverlayProps {
  petName: string;
  needs: HamsterNeeds;
  behavior: HamsterBehavior;
  ageSeconds: number;
  zenMode?: boolean;
  disabledStats?: DisabledStatsConfig;
  adminCageTierOverride?: CageTier | null;
  onToggleZenMode?: () => void;
}

export const StatsOverlay: React.FC<StatsOverlayProps> = ({
  petName,
  needs,
  behavior,
  ageSeconds,
  zenMode = false,
  disabledStats,
  adminCageTierOverride,
  onToggleZenMode,
}) => {
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') return;
      setIsCompact(window.innerWidth < 640 || window.innerHeight < 550);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  const level = calculateHamsterLevel(ageSeconds);
  const effectiveTier = getEffectiveCageTier(ageSeconds, adminCageTierOverride);
  const tierConfig = CAGE_TIERS[effectiveTier];
  const progress = getLevelProgress(ageSeconds);
  const ageString = formatHamsterAgeDetailed(ageSeconds);

  const getBehaviorBadge = (b: HamsterBehavior) => {
    switch (b) {
      case HamsterBehavior.IDLE:
        return { text: 'Бодрствует', color: 'bg-retro-blue text-white' };
      case HamsterBehavior.WALK:
        return { text: 'Гуляет', color: 'bg-retro-cyan text-black' };
      case HamsterBehavior.WHEEL:
        return { text: 'Колесо 🎡', color: 'bg-sky-500 text-black font-bold animate-pulse' };
      case HamsterBehavior.GROOM:
        return { text: 'Умывается ✨', color: 'bg-pink-500 text-white' };
      case HamsterBehavior.SNIFF:
        return { text: 'Ищет корм 🌾', color: 'bg-amber-600 text-white' };
      case HamsterBehavior.LAYING:
        return { text: 'Отдыхает', color: 'bg-retro-purple text-retro-white' };
      case HamsterBehavior.SLEEP:
        return { text: 'Спит 💤', color: 'bg-indigo-900 text-yellow-300 animate-pulse' };
      case HamsterBehavior.EATING:
        return { text: 'Кушает 🌾', color: 'bg-amber-600 text-white animate-bounce' };
      case HamsterBehavior.DRINKING:
        return { text: 'Пьет сок 🧃', color: 'bg-cyan-600 text-white animate-pulse' };
      case HamsterBehavior.POOPING:
        return { text: 'В туалете 💩', color: 'bg-yellow-800 text-white' };
      default:
        return { text: 'Бодрствует', color: 'bg-retro-blue text-white' };
    }
  };

  const badge = getBehaviorBadge(behavior);

  const statsList = [
    { label: 'Сытость', shortLabel: 'Сыт', value: needs.hunger, icon: '🌾', isLocked: zenMode || Boolean(disabledStats?.hunger) },
    { label: 'Энергия', shortLabel: 'Сил', value: needs.energy, icon: '⚡', isLocked: zenMode || Boolean(disabledStats?.energy) },
    { label: 'Чистота', shortLabel: 'Чис', value: needs.hygiene, icon: '🧼', isLocked: zenMode || Boolean(disabledStats?.hygiene) },
    { label: 'Счастье', shortLabel: 'Рад', value: needs.happiness, icon: '💖', isLocked: zenMode || Boolean(disabledStats?.happiness) },
    { label: 'Здоровье', shortLabel: 'Здр', value: needs.health, icon: '❤️', isLocked: zenMode || Boolean(disabledStats?.health) },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-retro-dark border-2 sm:border-4 border-black p-1 sm:p-2.5 rounded-lg shadow-pixel text-white font-pixel select-none mb-0.5 sm:mb-2">
      {isCompact ? (
        /* ------------------------------------------------------------------ */
        /* МОБИЛЬНЫЙ УЛЬТРАКОМПАКТНЫЙ РЕЖИМ (< 640px или короткий экран)      */
        /* ------------------------------------------------------------------ */
        <div className="space-y-1">
          {/* Верхняя мобильная строка: Имя, уровень, статус, кнопка Дзен */}
          <div className="flex items-center justify-between gap-1 text-[8px]">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="text-retro-yellow font-bold truncate">🐹 {petName}</span>
              <span className="text-amber-300 text-[7px] bg-retro-purple/80 px-1 py-0.5 rounded border border-black shrink-0">
                ⭐ Ур.{level}
              </span>
              <button
                type="button"
                onClick={() => setShowDetailsMobile(!showDetailsMobile)}
                className="text-retro-grey hover:text-white text-[7px] px-1 py-0.5 rounded border border-retro-purple/40 bg-black/40"
                title="Показать / скрыть подробности"
              >
                {showDetailsMobile ? '▲' : '▼'}
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span
                className={`text-[7px] px-1.5 py-0.5 rounded border border-black font-bold uppercase ${badge.color}`}
              >
                {badge.text}
              </span>

              {onToggleZenMode && (
                <button
                  type="button"
                  onClick={onToggleZenMode}
                  className={`text-[7px] px-1.5 py-0.5 rounded border border-black transition-all ${
                    zenMode
                      ? 'bg-retro-yellow text-black font-bold'
                      : 'bg-retro-purple text-retro-grey hover:text-white'
                  }`}
                  title={zenMode ? 'Дзен активен (потребности заморожены)' : 'Включить режим Дзен'}
                >
                  {zenMode ? '✨ДЗЕН' : '🧘ДЗЕН'}
                </button>
              )}
            </div>
          </div>

          {/* Раскрывающийся блок подробностей по тапу на стрелочку */}
          {showDetailsMobile && (
            <div className="py-1 px-1.5 bg-black/50 rounded border border-retro-purple/40 text-[7px] text-retro-white/90 animate-fadeIn space-y-1">
              <div className="flex justify-between items-center text-retro-grey">
                <span>Возраст: {ageString}</span>
                <span className="text-retro-cyan font-bold">{tierConfig.name}</span>
              </div>
              {!progress.isMaxTier && (
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-300 shrink-0">До Яруса {effectiveTier + 1}:</span>
                  <div className="flex-1 h-1.5 bg-black rounded-sm border border-retro-purple overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-retro-yellow"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                  <span>{progress.progressPercent}% ({progress.daysToNextLevel} д.)</span>
                </div>
              )}
            </div>
          )}

          {/* Все 5 потребностей в ОДНУ аккуратную горизонтальную строку */}
          <div className="grid grid-cols-5 gap-1 pt-0.5">
            {statsList.map((stat, idx) => (
              <CompactMobileStat key={idx} {...stat} />
            ))}
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------------ */
        /* КЛАССИЧЕСКИЙ ДЕСКТОПНЫЙ РЕЖИМ (>= 640px и достаточная высота)       */
        /* ------------------------------------------------------------------ */
        <div className="space-y-2">
          {/* Верхняя строка: Имя, статус, возраст, уровень и переключатель Дзен */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-retro-purple">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base text-retro-yellow">🐹 {petName}</span>
              <span className="text-[8px] text-retro-grey">({ageString})</span>
              <div className="flex items-center gap-1 bg-retro-purple/80 px-2 py-0.5 rounded border border-black text-[8px] text-amber-300">
                <span>⭐ Ур. {level}</span>
                <span className="text-retro-grey">•</span>
                <span className="text-retro-cyan font-bold">{tierConfig.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[8px] sm:text-[9px] px-2 py-1 rounded border border-black font-bold uppercase ${badge.color}`}
              >
                {badge.text}
              </span>

              {onToggleZenMode && (
                <button
                  type="button"
                  onClick={onToggleZenMode}
                  className={`text-[8px] sm:text-[9px] px-2.5 py-1 rounded border-2 border-black font-pixel transition-all ${
                    zenMode
                      ? 'bg-retro-yellow text-black font-bold shadow-pixel-sm'
                      : 'bg-retro-purple text-retro-grey hover:text-white border-black'
                  }`}
                  title={
                    zenMode
                      ? 'Дзен активен (потребности заморожены)'
                      : 'Включить режим Дзен'
                  }
                >
                  {zenMode ? '✨ ДЗЕН' : '🧘 ДЗЕН'}
                </button>
              )}
            </div>
          </div>

          {/* Прогресс яруса */}
          {!progress.isMaxTier && (
            <div className="px-2 py-1 bg-black/40 rounded border border-retro-purple/40 flex items-center justify-between gap-2 text-[7px] text-retro-grey">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-amber-300 shrink-0">До Яруса {effectiveTier + 1}:</span>
                <div className="w-24 sm:w-36 h-1.5 bg-black rounded-sm border border-retro-purple overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-retro-yellow transition-all duration-300"
                    style={{ width: `${progress.progressPercent}%` }}
                  />
                </div>
                <span className="text-retro-white">{progress.progressPercent}%</span>
              </div>
              <span className="shrink-0 text-[7px] text-retro-grey">
                Осталось: {progress.daysToNextLevel} д.
              </span>
            </div>
          )}
          {progress.isMaxTier && (
            <div className="px-2 py-0.5 bg-amber-950/30 rounded border border-amber-500/30 flex items-center justify-between text-[7px] text-amber-300">
              <span>🏰 Максимальный 3-ярусный особняк с туннелями</span>
              <span>⭐ Уровень {level}</span>
            </div>
          )}

          {/* Сетка показателей 5 колонок на десктопе */}
          <div className="grid grid-cols-5 gap-2">
            {statsList.map((stat, idx) => (
              <StatBar key={idx} {...stat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Ультракомпактная колонка потребности для мобильного экрана
 */
function CompactMobileStat({
  icon,
  value,
  isLocked,
}: {
  icon: string;
  value: number;
  isLocked?: boolean;
}) {
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
    <div className="bg-retro-purple/70 p-1 rounded border border-black flex flex-col gap-0.5 items-center justify-center">
      <div className="flex items-center justify-center gap-0.5 text-[7px] leading-none">
        <span>{icon}</span>
        <span
          className={`font-bold ${
            isLocked
              ? 'text-retro-yellow'
              : isDanger
              ? 'text-retro-red animate-pulse'
              : 'text-retro-white'
          }`}
        >
          {isLocked ? '∞' : `${rounded}%`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-black border border-black rounded-sm overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: isLocked ? '100%' : `${rounded}%` }}
        />
      </div>
    </div>
  );
}

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
