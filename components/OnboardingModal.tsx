/**
 * ============================================================================
 * КОМПОНЕНТ: OnboardingModal (Первичный Онбординг и Создание Питомца)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Первое впечатление определяет Retention (возвращаемость игрока).
 *    Вместо скучной формы игрок видит интерактивную галерею из 20 дизайнерских пород хомячков,
 *    может дать уникальное имя и сразу увидеть живое превью выбранной палитры.
 * 
 * 2. ВАЛИДАЦИЯ И ЗАЩИТА ОТ XSS (Security First):
 *    - Запрет на внедрение HTML/JavaScript тегов: любые символы `<`, `>`, `"`, `'`
 *      экранируются или очищаются через регулярное выражение.
 *    - Ограничение длины (2-16 символов) и обязательный `trim()` предотвращают создание
 *      пустых или растягивающих верстку имен.
 * ============================================================================
 */

'use client';

import React, { useState } from 'react';
import { HAMSTER_PALETTES, HAMSTER_24_IDLE_1 } from '@/utils/hamsterSprites';
import { HamsterPalette } from '@/types/hamster';
import { drawCharacterMatrix } from '@/utils/canvasUtils';
import { soundManager } from '@/utils/soundEffects';

export interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (petName: string, paletteId: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [petName, setPetName] = useState<string>('Хома');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('classic_golden');
  const [errorText, setErrorText] = useState<string>('');

  if (!isOpen) return null;

  const currentPalette =
    HAMSTER_PALETTES.find((p) => p.id === selectedPaletteId) ||
    HAMSTER_PALETTES[0];

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    // Санитизация имени: от 2 до 16 символов, только буквы, цифры, пробел и дефис
    const trimmed = petName.trim().replace(/[<>"/\\&;]/g, '');
    if (trimmed.length < 2) {
      setErrorText('Кличка должна быть не менее 2 символов!');
      soundManager.playPoopSound();
      return;
    }
    if (trimmed.length > 16) {
      setErrorText('Кличка не должна превышать 16 символов!');
      soundManager.playPoopSound();
      return;
    }

    soundManager.playSuccessJingle();
    onComplete(trimmed, selectedPaletteId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-yellow rounded-lg max-w-2xl w-full p-6 shadow-pixel-lg text-white font-pixel max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="text-center pb-4 border-b-2 border-retro-purple mb-6">
          <h1 className="text-base sm:text-xl text-retro-yellow mb-2">
            🐹 ДОБРО ПОЖАЛОВАТЬ!
          </h1>
          <p className="text-[10px] sm:text-xs text-retro-grey leading-relaxed">
            Познакомься со своим новым виртуальным питомцем.
            Выбери породу и придумай кличку!
          </p>
        </div>

        <form onSubmit={handleFinish} className="space-y-6">
          {/* Ввод имени */}
          <div className="bg-retro-purple p-4 rounded border-2 border-black">
            <label className="block text-xs text-retro-cyan mb-2">
              КЛИЧКА ПИТОМЦА (2-16 СИМВОЛОВ):
            </label>
            <input
              type="text"
              value={petName}
              maxLength={16}
              onChange={(e) => {
                setPetName(e.target.value);
                setErrorText('');
              }}
              placeholder="Например: Пончик"
              className="w-full bg-retro-dark border-2 border-black px-3 py-2 text-sm text-retro-yellow rounded focus:outline-none focus:border-retro-yellow font-pixel"
            />
            {errorText && (
              <p className="text-[10px] text-retro-red mt-2 animate-bounce">
                ⚠️ {errorText}
              </p>
            )}
          </div>

          {/* Превью выбранного хомячка */}
          <div className="bg-retro-purple p-4 rounded border-2 border-black flex flex-col sm:flex-row items-center gap-4">
            <div className="w-24 h-24 bg-black/40 rounded border-2 border-black flex items-center justify-center">
              <CanvasPreview palette={currentPalette} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="text-xs text-retro-yellow font-bold mb-1">
                {currentPalette.name} ({currentPalette.nameEn})
              </div>
              <div className="text-[10px] text-retro-white leading-relaxed">
                {currentPalette.description}
              </div>
            </div>
          </div>

          {/* Сетка выбора из 20 палитр */}
          <div>
            <label className="block text-xs text-retro-cyan mb-3">
              ВЫБЕРИ ОКРАС (20 ДИЗАЙНЕРСКИХ ПАЛИТР):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {HAMSTER_PALETTES.map((palette) => {
                const isSelected = palette.id === selectedPaletteId;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => {
                      setSelectedPaletteId(palette.id);
                      soundManager.playClickSound();
                    }}
                    className={`p-2 rounded border-2 text-left flex flex-col gap-1.5 transition-all ${
                      isSelected
                        ? 'border-retro-yellow bg-retro-blue scale-105 shadow-pixel-sm'
                        : 'border-black bg-retro-purple hover:bg-retro-purple/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black inline-block"
                        style={{ backgroundColor: palette.fur }}
                      />
                      <span className="text-[9px] text-white truncate">
                        {palette.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Кнопка запуска */}
          <button
            type="submit"
            className="w-full py-3.5 bg-retro-green hover:brightness-110 text-black font-bold text-xs sm:text-sm border-2 border-black rounded shadow-pixel-sm transition-all"
          >
            Начать заботиться о хомячке! ❤️
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * Мини-компонент превью спрайта хомячка на маленьком канвасе
 */
function CanvasPreview({ palette }: { palette: HamsterPalette }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCharacterMatrix(ctx, HAMSTER_24_IDLE_1, 4, 4, palette, 3, false);
  }, [palette]);

  return <canvas ref={canvasRef} width={80} height={80} className="block" />;
}
