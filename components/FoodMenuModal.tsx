/**
 * ============================================================================
 * КОМПОНЕНТ: FoodMenuModal (Меню Кормления и Напитков: 21 Корм + 16 Соков)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. УХОД ЗА ПИТОМЦЕМ:
 *    Две полноценные категории:
 *    - 🌾 Вкусный корм: 21 разнообразное лакомство (зерно, овощи, орехи, фрукты, белок).
 *    - 🧃 Вода и соки: 16 напитков (артезианская вода, морковный фреш, смузи, чаи).
 *    Подача сока заливает жидкость нужного цвета в поилку и хомячок пьет ее с пользой для сил!
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FoodItem, DrinkItem } from '@/types/hamster';
import { FOOD_ITEMS, DRINK_ITEMS } from '@/utils/foodAndDrinkPresets';
import { soundManager } from '@/utils/soundEffects';

export type FoodMenuTab = 'food' | 'drinks';

export interface FoodMenuModalProps {
  isOpen: boolean;
  initialTab?: FoodMenuTab;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
  onSelectDrink: (drink: DrinkItem) => void;
  bottleWaterLevel?: number;
  currentDrinkId?: string | null;
  drinkColor?: string;
}

export const FoodMenuModal: React.FC<FoodMenuModalProps> = ({
  isOpen,
  initialTab = 'food',
  onClose,
  onSelectFood,
  onSelectDrink,
  bottleWaterLevel = 100,
  currentDrinkId = 'fresh_water',
  drinkColor = '#38bdf8',
}) => {
  const [activeTab, setActiveTab] = useState<FoodMenuTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handlePourFreshWater = () => {
    const freshWater = DRINK_ITEMS.find((d) => d.id === 'fresh_water') || DRINK_ITEMS[0];
    soundManager.playPourSound();
    onSelectDrink(freshWater);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-yellow rounded-lg max-w-xl w-full p-4 sm:p-6 shadow-pixel-lg text-white font-pixel flex flex-col max-h-[90vh]">
        {/* Шапка модального окна */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-retro-purple mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeTab === 'food' ? '🌾' : '🧃'}</span>
            <h2 className="text-xs sm:text-sm text-retro-yellow">
              {activeTab === 'food' ? 'ЛАКОМСТВА И КОРМ' : 'ВОДА И СВЕЖИЕ СОКИ'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="text-retro-grey hover:text-white px-2 py-1 bg-retro-purple border-2 border-black rounded text-xs"
          >
            ✕
          </button>
        </div>

        {/* Переключатель вкладок: Корм / Напитки */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setActiveTab('food');
            }}
            className={`py-2 px-3 rounded border-2 border-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'food'
                ? 'bg-retro-yellow text-black shadow-pixel-sm'
                : 'bg-retro-purple text-retro-white hover:bg-retro-blue'
            }`}
          >
            <span>🌾</span>
            <span>Корм ({FOOD_ITEMS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setActiveTab('drinks');
            }}
            className={`py-2 px-3 rounded border-2 border-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'drinks'
                ? 'bg-cyan-400 text-black shadow-pixel-sm'
                : 'bg-retro-purple text-retro-white hover:bg-retro-blue'
            }`}
          >
            <span>🧃</span>
            <span>Соки и вода ({DRINK_ITEMS.length})</span>
          </button>
        </div>

        {/* Виджет уровня воды в поилке (только на вкладке напитков) */}
        {activeTab === 'drinks' && (
          <div className="bg-black/50 border-2 border-cyan-800 p-2.5 rounded mb-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div
                className="w-4 h-4 rounded-full border border-black shrink-0"
                style={{ backgroundColor: drinkColor }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between text-[9px] text-cyan-300">
                  <span>Уровень в поилке:</span>
                  <span className="font-bold">{bottleWaterLevel}%</span>
                </div>
                <div className="w-full sm:w-36 h-2 bg-slate-800 rounded overflow-hidden border border-black mt-1">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${bottleWaterLevel}%`,
                      backgroundColor: drinkColor,
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePourFreshWater}
              className="w-full sm:w-auto px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 active:translate-y-0.5 text-black font-bold text-[9px] border-2 border-black rounded shadow-pixel-sm flex items-center justify-center gap-1 shrink-0"
            >
              <span>💧</span>
              <span>Налить воду (100%)</span>
            </button>
          </div>
        )}

        {/* Список элементов (скроллируемый) */}
        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {activeTab === 'food' ? (
            FOOD_ITEMS.map((food) => (
              <div
                key={food.id}
                className="bg-retro-purple p-2.5 sm:p-3 rounded border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 hover:border-retro-yellow transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl shrink-0">{food.icon}</span>
                  <div>
                    <h3 className="text-xs text-retro-yellow font-bold">{food.name}</h3>
                    <p className="text-[9px] text-retro-white mt-0.5 leading-relaxed">
                      {food.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-[8px]">
                      <span className="text-retro-green font-bold">+{food.hungerGain}% Сытость</span>
                      <span className="text-pink-400 font-bold">+{food.happinessGain}% Счастье</span>
                      {food.healthGain > 0 && (
                        <span className="text-red-400 font-bold">+{food.healthGain}% Здоровье</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playEatSound();
                    onSelectFood(food);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-3 py-2 bg-retro-green hover:brightness-110 active:translate-y-0.5 text-black font-bold text-[9px] border-2 border-black rounded shadow-pixel-sm shrink-0 whitespace-nowrap"
                >
                  Покормить 🌾
                </button>
              </div>
            ))
          ) : (
            DRINK_ITEMS.map((drink) => {
              const isCurrent = currentDrinkId === drink.id && bottleWaterLevel > 0;
              return (
                <div
                  key={drink.id}
                  className={`p-2.5 sm:p-3 rounded border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all ${
                    isCurrent
                      ? 'bg-slate-800 border-cyan-400'
                      : 'bg-retro-purple border-black hover:border-cyan-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <span className="text-2xl sm:text-3xl">{drink.icon}</span>
                      <div
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black shadow-sm"
                        style={{ backgroundColor: drink.liquidColor }}
                        title="Цвет напитка в поилке"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs text-cyan-300 font-bold">{drink.name}</h3>
                        {isCurrent && (
                          <span className="text-[7px] bg-cyan-900 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-600">
                            В поилке
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-retro-white mt-0.5 leading-relaxed">
                        {drink.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1.5 text-[8px]">
                        <span className="text-yellow-300 font-bold">+{drink.energyGain}% Энергия</span>
                        <span className="text-pink-400 font-bold">+{drink.happinessGain}% Счастье</span>
                        <span className="text-red-400 font-bold">+{drink.healthGain}% Здоровье</span>
                        {drink.hungerGain > 0 && (
                          <span className="text-retro-green font-bold">+{drink.hungerGain}% Сытость</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playPourSound();
                      onSelectDrink(drink);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-3 py-2 bg-cyan-400 hover:bg-cyan-300 active:translate-y-0.5 text-black font-bold text-[9px] border-2 border-black rounded shadow-pixel-sm shrink-0 whitespace-nowrap"
                  >
                    Налить в поилку 🧃
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
