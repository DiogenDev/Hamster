/**
 * ============================================================================
 * КОМПОНЕНТ: WindowsTutorialModal.tsx
 * ============================================================================
 * Обучающий гид по возможностям Windows-версии игры "Хомячок Диоген":
 * 1. Режим питомца на рабочем столе (Desktop Pet).
 * 2. Режим живых обоев (Desktop Wallpaper).
 * 3. Автозагрузка вместе с Windows.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { soundManager } from '@/utils/soundEffects';

interface WindowsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode?: (mode: 'normal' | 'pet' | 'wallpaper') => void;
}

export const WindowsTutorialModal: React.FC<WindowsTutorialModalProps> = ({
  isOpen,
  onClose,
  onSwitchMode,
}) => {
  const [autostart, setAutostart] = useState<boolean>(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAutostart().then((val) => setAutostart(val));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleAutostart = async () => {
    soundManager.playClickSound();
    if (window.electronAPI) {
      const next = !autostart;
      const res = await window.electronAPI.setAutostart(next);
      setAutostart(res);
    } else {
      setAutostart(!autostart);
    }
  };

  const handleClose = () => {
    soundManager.playSuccessJingle();
    if (typeof window !== 'undefined') {
      localStorage.setItem('hamster_win_tutorial_seen', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-cyan rounded-xl max-w-xl w-full p-4 sm:p-5 shadow-pixel-lg text-white font-pixel flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center pb-2.5 border-b-2 border-retro-cyan mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💻</span>
            <h2 className="text-xs sm:text-sm text-retro-cyan tracking-wide">
              ВОЗМОЖНОСТИ WINDOWS ВЕРСИИ
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-retro-grey hover:text-white text-xs px-2 py-1 bg-black/50 border border-retro-grey rounded"
          >
            ✕
          </button>
        </div>

        {/* Карточки возможностей */}
        <div className="space-y-3 text-[7.5px] leading-relaxed">
          {/* 1. Питомец на рабочем столе */}
          <div className="bg-retro-purple/60 border border-retro-yellow/40 rounded p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-retro-yellow font-bold flex items-center gap-1">
                <span>🐾</span> РЕЖИМ «ХОМЯЧОК НА РАБОЧЕМ СТОЛЕ»:
              </span>
              {onSwitchMode && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSwitchMode('pet');
                  }}
                  className="px-2 py-0.5 bg-retro-yellow text-black font-bold rounded text-[6.5px] border border-black"
                >
                  Включить сейчас ➔
                </button>
              )}
            </div>
            <ul className="list-disc list-inside space-y-1 text-retro-grey pl-1">
              <li>
                <strong className="text-white">Зажатая ЛКМ:</strong> таскайте хомячка мышкой в любую точку монитора.
              </li>
              <li>
                <strong className="text-white">Зажатая ПКМ (поглаживание):</strong> хомячок замирает на месте, довольно щурится и пускает сердечки.
              </li>
              <li>
                <strong className="text-white">Облачка мыслей:</strong> если хомяк проголодается или захочет пить, над ним всплывёт мысль.
              </li>
              <li>
                <strong className="text-white">Двойной клик ЛКМ:</strong> мгновенный возврат в полноценное окно игры.
              </li>
            </ul>
          </div>

          {/* 2. Живые интерактивные обои */}
          <div className="bg-retro-purple/60 border border-retro-cyan/40 rounded p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-retro-cyan font-bold flex items-center gap-1">
                <span>🖼️</span> РЕЖИМ «ЖИВЫЕ ОБОИ РАБОЧЕГО СТОЛА»:
              </span>
              {onSwitchMode && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSwitchMode('wallpaper');
                  }}
                  className="px-2 py-0.5 bg-retro-cyan text-black font-bold rounded text-[6.5px] border border-black"
                >
                  Включить сейчас ➔
                </button>
              )}
            </div>
            <p className="text-retro-grey">
              Клетка работает прямо на рабочем столе позади всех ваших иконок и папок!
            </p>
            <ul className="list-disc list-inside space-y-1 text-retro-grey pl-1">
              <li>
                <strong className="text-white">Камера:</strong> показ всей клетки сразу или одного активного этажа с плавной слежкой за хомячком.
              </li>
              <li>
                <strong className="text-white">Кастомизация:</strong> настраивайте масштаб клетки и прозрачность кнопок от 10% до 100%.
              </li>
            </ul>
          </div>

          {/* 3. Автозагрузка и системный трей */}
          <div className="bg-retro-purple/60 border border-retro-green/40 rounded p-2.5 flex items-center justify-between">
            <div>
              <span className="text-retro-green font-bold block">
                ⚡ АВТОЗАГРУЗКА ВМЕСТЕ С WINDOWS
              </span>
              <span className="text-retro-grey text-[6.5px] block mt-0.5">
                Хомячок будет автоматически просыпаться при включении компьютера
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAutostart}
              className={`px-2.5 py-1 text-[7.5px] border border-black rounded ${
                autostart ? 'bg-retro-green text-black font-bold' : 'bg-retro-dark text-retro-grey'
              }`}
            >
              {autostart ? 'ВКЛЮЧЕНО ✓' : 'ВЫКЛЮЧЕНО'}
            </button>
          </div>
        </div>

        {/* Кнопка закрытия */}
        <div className="mt-4 pt-2 border-t border-retro-blue flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2 bg-retro-green hover:bg-emerald-400 text-black font-bold text-[8px] border-2 border-black rounded shadow-pixel-sm active:scale-95 transition-transform"
          >
            ВСЁ ПОНЯТНО, ВПЕРЁД! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
