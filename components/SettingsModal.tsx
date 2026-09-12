/**
 * ============================================================================
 * КОМПОНЕНТ: SettingsModal (Настройки, Дзен-Режим и Отключение Статов)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. УПРАВЛЕНИЕ СЛОЖНОСТЬЮ И РЕЖИМ КОМПАНЬОНА:
 *    Игрок может превратить приложение в фоновый эстетичный релакс-виджет:
 *    - Включить "Режим Дзен" (все потребности заморожены на 100%).
 *    - Либо выборочно отключить голод, загрязнение или сон.
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import { HAMSTER_PALETTES } from '@/utils/spritePresets';
import { DisabledStatsConfig } from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPetName: string;
  currentPaletteId: string;
  soundEnabled: boolean;
  soundVolume: number;
  zenMode: boolean;
  disabledStats: DisabledStatsConfig;
  onUpdateSettings: (params: {
    petName: string;
    paletteId: string;
    soundEnabled: boolean;
    soundVolume: number;
    zenMode: boolean;
    disabledStats: DisabledStatsConfig;
  }) => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentPetName,
  currentPaletteId,
  soundEnabled,
  soundVolume,
  zenMode,
  disabledStats,
  onUpdateSettings,
  onResetProgress,
}) => {
  const [petName, setPetName] = useState<string>(currentPetName);
  const [paletteId, setPaletteId] = useState<string>(currentPaletteId);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(soundEnabled);
  const [volume, setVolume] = useState<number>(soundVolume);
  const [isZen, setIsZen] = useState<boolean>(zenMode);
  const [statsConfig, setStatsConfig] = useState<DisabledStatsConfig>(disabledStats);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = petName.trim().replace(/[<>"/\\&;]/g, '');
    if (trimmed.length < 2) return;

    soundManager.setEnabled(isSoundOn);
    soundManager.setVolume(volume);

    onUpdateSettings({
      petName: trimmed,
      paletteId,
      soundEnabled: isSoundOn,
      soundVolume: volume,
      zenMode: isZen,
      disabledStats: statsConfig,
    });

    soundManager.playSuccessJingle();
    onClose();
  };

  const toggleStat = (key: keyof DisabledStatsConfig) => {
    setStatsConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    soundManager.playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-purple rounded-lg max-w-xl w-full p-5 sm:p-6 shadow-pixel-lg text-white font-pixel max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-retro-blue mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="text-sm text-retro-yellow">НАСТРОЙКИ</h2>
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

        <div className="space-y-4">
          {/* Секция: Режим Дзен (Без забот) */}
          <div className="bg-retro-purple/90 p-3 rounded border-2 border-retro-yellow">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xs text-retro-yellow">✨ РЕЖИМ ДЗЕН (КОМПАНЬОН)</h3>
                <p className="text-[8px] text-retro-white/80 mt-1 leading-relaxed">
                  Хомячок не голодает, не пачкает клетку и не болеет. Фоновый питомец для релакса!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !isZen;
                  setIsZen(next);
                  soundManager.playClickSound();
                }}
                className={`px-3 py-1.5 text-[9px] border-2 border-black rounded font-bold shadow-pixel-sm ${
                  isZen ? 'bg-retro-yellow text-black' : 'bg-retro-dark text-retro-grey'
                }`}
              >
                {isZen ? 'ВКЛЮЧЕН' : 'ВЫКЛ'}
              </button>
            </div>

            {/* Выборочное отключение статов (если Дзен выключен) */}
            {!isZen && (
              <div className="mt-3 pt-2 border-t border-black/40 space-y-1.5">
                <span className="text-[8px] text-retro-cyan block mb-1">
                  ТОЧЕЧНОЕ ОТКЛЮЧЕНИЕ СТАТОВ:
                </span>
                <label className="flex items-center gap-2 text-[8px] text-retro-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statsConfig.hunger}
                    onChange={() => toggleStat('hunger')}
                    className="cursor-pointer"
                  />
                  <span>Отключить голод (всегда сыт)</span>
                </label>
                <label className="flex items-center gap-2 text-[8px] text-retro-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statsConfig.hygiene}
                    onChange={() => toggleStat('hygiene')}
                    className="cursor-pointer"
                  />
                  <span>Отключить загрязнение (нет какашек)</span>
                </label>
                <label className="flex items-center gap-2 text-[8px] text-retro-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statsConfig.energy}
                    onChange={() => toggleStat('energy')}
                    className="cursor-pointer"
                  />
                  <span>Отключить усталость (всегда бодр)</span>
                </label>
                <label className="flex items-center gap-2 text-[8px] text-retro-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={statsConfig.health}
                    onChange={() => toggleStat('health')}
                    className="cursor-pointer"
                  />
                  <span>Отключить урон здоровью (бессмертие)</span>
                </label>
              </div>
            )}
          </div>

          {/* Смена имени */}
          <div className="bg-retro-purple p-3 rounded border-2 border-black">
            <label className="block text-xs text-retro-cyan mb-2">
              КЛИЧКА ХОМЯЧКА:
            </label>
            <input
              type="text"
              value={petName}
              maxLength={16}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full bg-retro-dark border-2 border-black px-3 py-2 text-xs text-retro-yellow rounded focus:outline-none font-pixel"
            />
          </div>

          {/* Смена окраса (20 палитр) */}
          <div className="bg-retro-purple p-3 rounded border-2 border-black">
            <label className="block text-xs text-retro-cyan mb-2">
              ПОРОДА / ОКРАС (20 ДИЗАЙНЕРСКИХ ПАЛИТР):
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {HAMSTER_PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPaletteId(p.id);
                    soundManager.playClickSound();
                  }}
                  className={`p-2 rounded border-2 text-left flex items-center gap-2 text-[8px] ${
                    paletteId === p.id
                      ? 'border-retro-yellow bg-retro-blue font-bold shadow-pixel-sm'
                      : 'border-black bg-retro-dark hover:bg-retro-dark/80'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black inline-block"
                    style={{ backgroundColor: p.fur }}
                  />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Звук */}
          <div className="bg-retro-purple p-3 rounded border-2 border-black space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-retro-cyan">8-БИТНЫЙ ЗВУК:</span>
              <button
                type="button"
                onClick={() => {
                  const next = !isSoundOn;
                  setIsSoundOn(next);
                  soundManager.setEnabled(next);
                  if (next) soundManager.playClickSound();
                }}
                className={`px-3 py-1 text-xs border-2 border-black rounded ${
                  isSoundOn ? 'bg-retro-green text-black font-bold' : 'bg-retro-red'
                }`}
              >
                {isSoundOn ? 'ВКЛ 🔊' : 'ВЫКЛ 🔇'}
              </button>
            </div>

            {isSoundOn && (
              <div>
                <div className="flex justify-between text-[8px] text-retro-grey mb-1">
                  <span>ГРОМКОСТЬ:</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVolume(v);
                    soundManager.setVolume(v);
                  }}
                  className="w-full h-1.5 bg-retro-dark rounded cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Сброс */}
          <div className="bg-retro-purple/40 p-3 rounded border-2 border-retro-red/50">
            <div className="text-xs text-retro-red font-bold mb-1">СБРОС ПРОГРЕССА</div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="py-1.5 px-3 bg-retro-red/70 hover:bg-retro-red text-white text-[8px] border-2 border-black rounded"
              >
                Начать заново с чистого листа
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    onClose();
                  }}
                  className="py-1.5 px-3 bg-retro-red text-white text-[8px] font-bold border-2 border-black rounded animate-pulse"
                >
                  Да, сбросить!
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="py-1.5 px-3 bg-retro-blue text-white text-[8px] border-2 border-black rounded"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Футер */}
        <div className="mt-5 pt-3 border-t-2 border-retro-blue flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="py-2 px-4 bg-retro-blue hover:bg-retro-cyan border-2 border-black rounded text-xs"
          >
            Закрыть
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2 px-6 bg-retro-green hover:brightness-110 text-black font-bold border-2 border-black rounded text-xs shadow-pixel-sm"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
