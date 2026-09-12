/**
 * ============================================================================
 * КОМПОНЕНТ: ActionToolbar (Ретро-Панель Действий V2)
 * ============================================================================
 */

'use client';

import React from 'react';
import { HamsterBehavior } from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export interface ActionToolbarProps {
  behavior: HamsterBehavior;
  poopCount: number;
  zenMode?: boolean;
  onOpenFeedModal: () => void;
  onPet: () => void;
  onGoToWheel: () => void;
  onToggleSleep: () => void;
  onCleanAllPoops: () => void;
  onOpenFurnitureModal: () => void;
  onOpenPixelEditor: () => void;
  onOpenSettingsModal: () => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  behavior,
  poopCount,
  zenMode = false,
  onOpenFeedModal,
  onPet,
  onGoToWheel,
  onToggleSleep,
  onCleanAllPoops,
  onOpenFurnitureModal,
  onOpenPixelEditor,
  onOpenSettingsModal,
}) => {
  const isSleeping = behavior === HamsterBehavior.SLEEP;
  const isWheeling = behavior === HamsterBehavior.WHEEL;

  return (
    <div className="w-full max-w-3xl mx-auto bg-retro-dark border-4 border-black p-2.5 sm:p-3 rounded-lg shadow-pixel text-white font-pixel select-none mt-3">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
        {/* Кнопка: Покормить */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onOpenFeedModal();
          }}
          className="p-2 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-sm sm:text-base">🌾</span>
          <span className="text-[7px] sm:text-[8px]">Корм</span>
        </button>

        {/* Кнопка: Погладить */}
        <button
          onClick={onPet}
          className="p-2 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-sm sm:text-base">💖</span>
          <span className="text-[7px] sm:text-[8px]">Гладить</span>
        </button>

        {/* Кнопка: Колесо */}
        <button
          onClick={onGoToWheel}
          className={`p-2 active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm ${
            isWheeling
              ? 'bg-sky-500 text-black font-bold animate-pulse'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-sm sm:text-base">🎡</span>
          <span className="text-[7px] sm:text-[8px]">Колесо</span>
        </button>

        {/* Кнопка: Сон / Подъем */}
        <button
          onClick={onToggleSleep}
          className={`p-2 active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm ${
            isSleeping
              ? 'bg-retro-yellow text-black font-bold'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-sm sm:text-base">{isSleeping ? '⏰' : '💤'}</span>
          <span className="text-[7px] sm:text-[8px]">
            {isSleeping ? 'Будить' : 'Спать'}
          </span>
        </button>

        {/* Кнопка: Уборка */}
        <button
          onClick={onCleanAllPoops}
          className={`p-2 active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm relative ${
            poopCount > 0 && !zenMode
              ? 'bg-retro-red/80 hover:bg-retro-red animate-pulse'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-sm sm:text-base">🧼</span>
          <span className="text-[7px] sm:text-[8px]">Уборка</span>
          {poopCount > 0 && !zenMode && (
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[7px] px-1 rounded-full border border-black font-bold">
              {poopCount}
            </span>
          )}
        </button>

        {/* Кнопка: Мебель */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onOpenFurnitureModal();
          }}
          className="p-2 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-sm sm:text-base">🏠</span>
          <span className="text-[7px] sm:text-[8px]">Клетка</span>
        </button>

        {/* Кнопка: Скин / Мастерская */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onOpenPixelEditor();
          }}
          className="p-2 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-sm sm:text-base">🎨</span>
          <span className="text-[7px] sm:text-[8px]">Скин</span>
        </button>

        {/* Кнопка: Настройки */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onOpenSettingsModal();
          }}
          className="p-2 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-sm sm:text-base">⚙️</span>
          <span className="text-[7px] sm:text-[8px]">Опции</span>
        </button>
      </div>
    </div>
  );
};
