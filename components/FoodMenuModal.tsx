/**
 * ============================================================================
 * КОМПОНЕНТ: FoodMenuModal (Меню Кормления Хомячка)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Питание — базовый цикл ухода в играх жанра тамагочи.
 *    Разные типы корма имеют разные эффекты: быстрые семечки, сбалансированное зерно,
 *    витаминное яблочко или целебные дропсы.
 * ============================================================================
 */

'use client';

import React from 'react';
import { FoodItem } from '@/types/hamster';
import { FOOD_ITEMS } from '@/utils/spritePresets';
import { soundManager } from '@/utils/soundEffects';

export interface FoodMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

export const FoodMenuModal: React.FC<FoodMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectFood,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-yellow rounded-lg max-w-lg w-full p-6 shadow-pixel-lg text-white font-pixel">
        {/* Заголовок */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-retro-purple mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <h2 className="text-sm text-retro-yellow">МЕНЮ КОРМЛЕНИЯ</h2>
          </div>
          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="text-retro-grey hover:text-white px-2 py-1 bg-retro-purple border-2 border-black rounded text-xs"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {FOOD_ITEMS.map((food) => (
            <div
              key={food.id}
              className="bg-retro-purple p-3 rounded border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-retro-yellow transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{food.icon}</span>
                <div>
                  <h3 className="text-xs text-retro-yellow">{food.name}</h3>
                  <p className="text-[9px] text-retro-white mt-0.5 leading-relaxed">
                    {food.description}
                  </p>
                  <div className="flex gap-2 mt-1.5 text-[8px]">
                    <span className="text-retro-green">+{food.hungerGain}% Сытость</span>
                    <span className="text-pink-400">+{food.happinessGain}% Счастье</span>
                    {food.healthGain > 0 && (
                      <span className="text-red-400">+{food.healthGain}% ХП</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectFood(food);
                  onClose();
                }}
                className="w-full sm:w-auto px-3 py-2 bg-retro-green hover:brightness-110 text-black font-bold text-[9px] border-2 border-black rounded shadow-pixel-sm"
              >
                Покормить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
