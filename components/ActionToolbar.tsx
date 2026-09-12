/**
 * ============================================================================
 * КОМПОНЕНТ: ActionToolbar (Ретро-Панель Действий Игрока)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Кнопки панели действий связывают команды пользователя с конечным автоматом (FSM)
 *    и звуковым синтезатором.
 *    Интерфейс оформлен в стиле ретро-консоли GameBoy/NES:
 *    выпуклые пиксельные кнопки с эффектом вдавливания при нажатии (`active:translate-y-0.5`).
 * ============================================================================
 */

'use client';

import React from 'react';
import { HamsterBehavior } from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export interface ActionToolbarProps {
  behavior: HamsterBehavior;
  poopCount: number;
  onOpenFeedModal: () => void;
  onPet: () => void;
  onToggleSleep: () => void;
  onCleanAllPoops: () => void;
  onOpenFurnitureModal: () => void;
  onOpenPixelEditor: () => void;
  onOpenSettingsModal: () => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  behavior,
  poopCount,
  onOpenFeedModal,
  onPet,
  onToggleSleep,
  onCleanAllPoops,
  onOpenFurnitureModal,
  onOpenPixelEditor,
  onOpenSettingsModal,
}) => {
  const isSleeping = behavior === HamsterBehavior.SLEEP;

  return (
    <div className="w-full max-w-2xl mx-auto bg-retro-dark border-4 border-black p-3 rounded-lg shadow-pixel text-white font-pixel select-none mt-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {/* Кнопка: Покормить */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onOpenFeedModal();
          }}
          className="p-2.5 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-base">🌾</span>
          <span className="text-[8px] sm:text-[9px]">Корм</span>
        </button>

        {/* Кнопка: Погладить */}
        <button
          onClick={() => {
            onPet();
          }}
          className="p-2.5 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-base">💖</span>
          <span className="text-[8px] sm:text-[9px]">Гладить</span>
        </button>

        {/* Кнопка: Сон / Подъем */}
        <button
          onClick={() => {
            onToggleSleep();
          }}
          className={`p-2.5 active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm ${
            isSleeping
              ? 'bg-retro-yellow text-black font-bold'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-base">{isSleeping ? '⏰' : '💤'}</span>
          <span className="text-[8px] sm:text-[9px]">
            {isSleeping ? 'Будить' : 'Спать'}
          </span>
        </button>

        {/* Кнопка: Уборка */}
        <button
          onClick={() => {
            onCleanAllPoops();
          }}
          className={`p-2.5 active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm relative ${
            poopCount > 0
              ? 'bg-retro-red/80 hover:bg-retro-red animate-pulse'
              : 'bg-retro-purple hover:bg-retro-blue'
          }`}
        >
          <span className="text-base">🧼</span>
          <span className="text-[8px] sm:text-[9px]">Уборка</span>
          {poopCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-black text-[8px] px-1 rounded-full border border-black font-bold">
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
          className="p-2.5 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-base">🏠</span>
          <span className="text-[8px] sm:text-[9px]">Клетка</span>
        </button>

        {/* Кнопка: Пиксельный редактор */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onOpenPixelEditor();
          }}
          className="p-2.5 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-base">🎨</span>
          <span className="text-[8px] sm:text-[9px]">Скин</span>
        </button>

        {/* Кнопка: Настройки */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onOpenSettingsModal();
          }}
          className="p-2.5 bg-retro-purple hover:bg-retro-blue active:translate-y-0.5 border-2 border-black rounded flex flex-col items-center gap-1 shadow-pixel-sm"
        >
          <span className="text-base">⚙️</span>
          <span className="text-[8px] sm:text-[9px]">Опции</span>
        </button>
      </div>
    </div>
  );
};
