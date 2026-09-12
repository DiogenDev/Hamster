/**
 * ============================================================================
 * КОМПОНЕНТ: FurnitureModal (Кастомизация Интерьера Клетки)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Возможность менять домик, поилку и кормушку придает жилищу питомца
 *    индивидуальность и обогащает геймплей декоративными целями.
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import {
  FurnitureConfig,
  BowlType,
  WaterBottleType,
  HouseType,
} from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export interface FurnitureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFurniture: FurnitureConfig;
  onSaveFurniture: (furniture: FurnitureConfig) => void;
}

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

export const FurnitureModal: React.FC<FurnitureModalProps> = ({
  isOpen,
  onClose,
  currentFurniture,
  onSaveFurniture,
}) => {
  const [selectedBowl, setSelectedBowl] = useState<BowlType>(currentFurniture.bowl);
  const [selectedBottle, setSelectedBottle] = useState<WaterBottleType>(currentFurniture.waterBottle);
  const [selectedHouse, setSelectedHouse] = useState<HouseType>(currentFurniture.house);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveFurniture({
      ...currentFurniture,
      bowl: selectedBowl,
      waterBottle: selectedBottle,
      house: selectedHouse,
    });
    soundManager.playSuccessJingle();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-cyan rounded-lg max-w-xl w-full p-6 shadow-pixel-lg text-white font-pixel max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-retro-purple mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <h2 className="text-sm text-retro-yellow">УЮТ И МЕБЕЛЬ В КЛЕТКЕ</h2>
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

        <div className="space-y-5">
          {/* Секция 1: Домики */}
          <div>
            <h3 className="text-xs text-retro-cyan mb-2">1. ДОМИК ДЛЯ СНА</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HOUSES.map((h) => {
                const isSelected = selectedHouse === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedHouse(h.id);
                      soundManager.playClickSound();
                    }}
                    className={`p-2.5 rounded border-2 text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-retro-yellow bg-retro-blue scale-105 shadow-pixel-sm'
                        : 'border-black bg-retro-purple hover:bg-retro-purple/80'
                    }`}
                  >
                    <span className="text-2xl">{h.icon}</span>
                    <div>
                      <div className="text-[10px] text-retro-yellow">{h.name}</div>
                      <div className="text-[8px] text-retro-white/80">{h.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Секция 2: Кормушки */}
          <div>
            <h3 className="text-xs text-retro-cyan mb-2">2. КОРМУШКА</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BOWLS.map((b) => {
                const isSelected = selectedBowl === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBowl(b.id);
                      soundManager.playClickSound();
                    }}
                    className={`p-2.5 rounded border-2 text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-retro-yellow bg-retro-blue scale-105 shadow-pixel-sm'
                        : 'border-black bg-retro-purple hover:bg-retro-purple/80'
                    }`}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <div className="text-[10px] text-retro-yellow">{b.name}</div>
                      <div className="text-[8px] text-retro-white/80">{b.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Секция 3: Поилки */}
          <div>
            <h3 className="text-xs text-retro-cyan mb-2">3. АВТОПОИЛКА</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {BOTTLES.map((bt) => {
                const isSelected = selectedBottle === bt.id;
                return (
                  <button
                    key={bt.id}
                    onClick={() => {
                      setSelectedBottle(bt.id);
                      soundManager.playClickSound();
                    }}
                    className={`p-2.5 rounded border-2 text-left flex flex-col items-center text-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-retro-yellow bg-retro-blue scale-105 shadow-pixel-sm'
                        : 'border-black bg-retro-purple hover:bg-retro-purple/80'
                    }`}
                  >
                    <span className="text-2xl">{bt.icon}</span>
                    <div className="text-[9px] text-retro-yellow">{bt.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Кнопка применения */}
        <div className="mt-6 pt-4 border-t-2 border-retro-purple flex justify-end gap-3">
          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="py-2 px-4 bg-retro-blue hover:bg-retro-cyan border-2 border-black rounded text-xs"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-6 bg-retro-green hover:brightness-110 text-black font-bold border-2 border-black rounded text-xs shadow-pixel-sm"
          >
            Установить в клетку
          </button>
        </div>
      </div>
    </div>
  );
};
