/**
 * ============================================================================
 * КОМПОНЕНТ: ActionToolbar (Минималистичная Ретро-Панель Действий)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЧИСТОТА ИНТЕРФЕЙСА:
 *    На главной странице оставлены исключительно прямые интерактивные действия
 *    с хомячком (Корм, Ласка, Колесо, Сон, Уборка) и кнопка Настроек.
 *    Все кастомизации (мебель клетки, пиксельный редактор скинов, темы, музыка)
 *    вынесены в единый центр управления — Настройки.
 * ============================================================================
 */

'use client';

import React from 'react';
import { HamsterBehavior } from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export interface ActionToolbarProps {
  behavior: HamsterBehavior;
  poopCount: number;
  zenMode: boolean;
  onOpenFeedModal: () => void;
  onOpenDrinkModal: () => void;
  onPet: () => void;
  onGoToWheel: () => void;
  onToggleSleep: () => void;
  onCleanAllPoops: () => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  behavior,
  poopCount,
  zenMode,
  onOpenFeedModal,
  onOpenDrinkModal,
  onPet,
  onGoToWheel,
  onToggleSleep,
  onCleanAllPoops,
}) => {
  const isSleeping = behavior === HamsterBehavior.SLEEP;
  const isWheeling = behavior === HamsterBehavior.WHEEL;
  const isDrinking = behavior === HamsterBehavior.DRINKING;
  const isEating = behavior === HamsterBehavior.EATING;

  return (
    <div className="w-full max-w-3xl mx-auto bg-retro-dark border-2 sm:border-4 border-black p-1 sm:p-2 rounded-lg shadow-pixel text-white font-pixel select-none mt-0 sm:mt-1.5">
      <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
        {/* Кнопка 1: Покормить */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClickSound();
            onOpenFeedModal();
          }}
          className={`py-1.5 px-2 active:translate-y-0.5 border-2 border-black rounded flex items-center justify-center gap-1.5 shadow-pixel-sm transition-all ${
            isEating
              ? 'bg-amber-500 text-black font-bold animate-pulse'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-xs sm:text-sm">🌾</span>
          <span className="text-[7px] sm:text-[8px] font-bold">Корм</span>
        </button>

        {/* Кнопка 2: Поить / Сок */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClickSound();
            onOpenDrinkModal();
          }}
          className={`py-1.5 px-2 active:translate-y-0.5 border-2 border-black rounded flex items-center justify-center gap-1.5 shadow-pixel-sm transition-all ${
            isDrinking
              ? 'bg-cyan-500 text-black font-bold animate-pulse'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-xs sm:text-sm">🧃</span>
          <span className="text-[7px] sm:text-[8px] font-bold">Поить</span>
        </button>

        {/* Кнопка 3: Погладить */}
        <button
          type="button"
          onClick={onPet}
          className="py-1.5 px-2 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex items-center justify-center gap-1.5 shadow-pixel-sm transition-all"
        >
          <span className="text-xs sm:text-sm">💖</span>
          <span className="text-[7px] sm:text-[8px] font-bold">Гладить</span>
        </button>

        {/* Кнопка 4: Колесо */}
        <button
          type="button"
          onClick={onGoToWheel}
          className={`py-1.5 px-2 active:translate-y-0.5 border-2 border-black rounded flex items-center justify-center gap-1.5 shadow-pixel-sm transition-all ${
            isWheeling
              ? 'bg-sky-500 text-black font-bold animate-pulse'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-xs sm:text-sm">🎡</span>
          <span className="text-[7px] sm:text-[8px] font-bold">Колесо</span>
        </button>

        {/* Кнопка 5: Сон / Подъем */}
        <button
          type="button"
          onClick={onToggleSleep}
          className={`py-1.5 px-2 active:translate-y-0.5 border-2 border-black rounded flex items-center justify-center gap-1.5 shadow-pixel-sm transition-all ${
            isSleeping
              ? 'bg-retro-yellow text-black font-bold'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-xs sm:text-sm">{isSleeping ? '⏰' : '💤'}</span>
          <span className="text-[7px] sm:text-[8px] font-bold">
            {isSleeping ? 'Будить' : 'Спать'}
          </span>
        </button>

        {/* Кнопка 6: Уборка */}
        <button
          type="button"
          onClick={onCleanAllPoops}
          className={`py-1.5 px-2 active:translate-y-0.5 border-2 border-black rounded flex items-center justify-center gap-1.5 shadow-pixel-sm relative transition-all ${
            poopCount > 0 && !zenMode
              ? 'bg-retro-red/80 hover:bg-retro-red animate-pulse'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-xs sm:text-sm">🧼</span>
          <span className="text-[7px] sm:text-[8px] font-bold">Уборка</span>
          {poopCount > 0 && !zenMode && (
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[7px] px-1 rounded-full border border-black font-bold">
              {poopCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
