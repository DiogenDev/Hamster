/**
 * ============================================================================
 * КОМПОНЕНТ: DesktopPetOverlay.tsx
 * ============================================================================
 * Режим "Хомячок на рабочем столе" (Windows Desktop Pet / Shimeji).
 * Отображается в прозрачном окне без рамок.
 * ============================================================================
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSafeStorage } from '@/hooks/useSafeStorage';
import { drawCharacterMatrix } from '@/utils/canvasUtils';
import {
  HAMSTER_24_IDLE_1,
  HAMSTER_24_IDLE_2,
  HAMSTER_24_WALK_1,
  HAMSTER_24_WALK_2,
  HAMSTER_24_GROOM_1,
  HAMSTER_24_GROOM_2,
  HAMSTER_PALETTES,
} from '@/utils/hamsterSprites';
import { soundManager } from '@/utils/soundEffects';

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export const DesktopPetOverlay: React.FC = () => {
  const { data, setData, isHydrated } = useSafeStorage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Состояния движения и взаимодействия
  const [posX, setPosX] = useState<number>(40);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isWalking, setIsWalking] = useState<boolean>(true);
  const [isPetting, setIsPetting] = useState<boolean>(false);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  // Перетаскивание (Drag & Drop ЛКМ)
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ screenX: number; screenY: number }>({ screenX: 0, screenY: 0 });

  // Поглаживание (ПКМ)
  const isRightClickDownRef = useRef<boolean>(false);

  // Палитра хомячка
  const currentPalette =
    HAMSTER_PALETTES.find((p) => p.id === data?.paletteId) || HAMSTER_PALETTES[0];

  // Вычисление нужд хомячка для облачка мыслей
  const getThoughtEmoji = useCallback(() => {
    if (!data || !data.needs) return null;
    const foodLevel = data.furniture?.bowlFoodLevel ?? 100;
    const waterLevel = data.furniture?.bottleWaterLevel ?? 100;

    if (data.needs.hunger <= 30 || foodLevel <= 15) return '🌾';
    if (waterLevel <= 15) return '🧃';
    if (data.needs.hygiene <= 30 || (data.poops && data.poops.length >= 3)) return '🧼';
    if (data.needs.energy <= 20) return '💤';
    if (data.needs.happiness <= 30) return '💔';
    return null;
  }, [data]);

  const thoughtEmoji = getThoughtEmoji();

  // 1. Анимация движения хомячка
  useEffect(() => {
    if (isPetting || isDraggingRef.current) return;

    const moveInterval = setInterval(() => {
      setPosX((prev) => {
        let next = prev + direction * 1.5;
        if (next > 110) {
          setDirection(-1);
          return 110;
        }
        if (next < 20) {
          setDirection(1);
          return 20;
        }
        return next;
      });

      // Случайные паузы при ходьбе
      if (Math.random() < 0.05) {
        setIsWalking((w) => !w);
      }
    }, 60);

    return () => clearInterval(moveInterval);
  }, [direction, isPetting]);

  // 2. Рендер хомячка на Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    const frameIndex = Math.floor(now / 200) % 2;

    let sprite = HAMSTER_24_IDLE_1;
    if (isPetting) {
      sprite = frameIndex === 0 ? HAMSTER_24_GROOM_1 : HAMSTER_24_GROOM_2;
    } else if (isWalking) {
      sprite = frameIndex === 0 ? HAMSTER_24_WALK_1 : HAMSTER_24_WALK_2;
    } else {
      sprite = frameIndex === 0 ? HAMSTER_24_IDLE_1 : HAMSTER_24_IDLE_2;
    }

    // Масштаб спрайта (3 пикселя на точку для сочной четкости)
    drawCharacterMatrix(ctx, sprite, posX, 90, currentPalette, 3, direction === -1);
  }, [posX, direction, isWalking, isPetting, currentPalette]);

  // 3. Анимация всплывающих сердечек
  useEffect(() => {
    if (hearts.length === 0) return;
    const interval = setInterval(() => {
      setHearts((prev) =>
        prev
          .map((h) => ({ ...h, y: h.y - 2, opacity: h.opacity - 0.05 }))
          .filter((h) => h.opacity > 0)
      );
    }, 40);
    return () => clearInterval(interval);
  }, [hearts]);

  // 4. Обработчик ЛКМ: Двойной клик (развернуть) и Перетаскивание (Drag & Drop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Левая кнопка мыши: начало перетаскивания
      isDraggingRef.current = true;
      dragStartPosRef.current = { screenX: e.screenX, screenY: e.screenY };
    } else if (e.button === 2) {
      // Правая кнопка мыши: поглаживание
      isRightClickDownRef.current = true;
      setIsPetting(true);
      spawnHeart(posX + 25, 80);
      soundManager.playPetSound();

      // Увеличиваем счастье хомячка
      setData((prev) => ({
        ...prev,
        needs: {
          ...prev.needs,
          happiness: Math.min(100, prev.needs.happiness + 2),
        },
      }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Перемещение окна зажатой ЛКМ
    if (isDraggingRef.current && window.electronAPI) {
      const deltaX = e.screenX - dragStartPosRef.current.screenX;
      const deltaY = e.screenY - dragStartPosRef.current.screenY;
      dragStartPosRef.current = { screenX: e.screenX, screenY: e.screenY };
      window.electronAPI.movePetWindow(deltaX, deltaY);
    }

    // Поглаживание зажатой ПКМ
    if (isRightClickDownRef.current) {
      setIsPetting(true);
      if (Math.random() < 0.25) {
        spawnHeart(posX + 20 + Math.random() * 20, 80);
        soundManager.playPetSound();
        setData((prev) => ({
          ...prev,
          needs: {
            ...prev.needs,
            happiness: Math.min(100, prev.needs.happiness + 1),
          },
        }));
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDraggingRef.current = false;
    } else if (e.button === 2) {
      isRightClickDownRef.current = false;
      setIsPetting(false);
    }
  };

  const spawnHeart = (x: number, y: number) => {
    setHearts((prev) => [
      ...prev.slice(-8),
      { id: Date.now() + Math.random(), x, y, opacity: 1 },
    ]);
  };

  // Двойной клик ЛКМ -> открытие главного окна
  const handleDoubleClick = () => {
    soundManager.playClickSound();
    if (window.electronAPI) {
      window.electronAPI.openMainWindow();
    }
  };

  if (!isHydrated) return null;

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
      onDoubleClick={handleDoubleClick}
      className="w-full h-full select-none cursor-grab active:cursor-grabbing relative overflow-hidden flex items-end justify-center"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Облачко мыслей хомячка при потребности */}
      {thoughtEmoji && (
        <div
          className="absolute bg-white/95 text-black border-2 border-black rounded-full px-2 py-1 shadow-lg text-sm flex items-center justify-center animate-bounce pointer-events-none"
          style={{
            left: `${posX + 35}px`,
            top: '40px',
          }}
        >
          <span>{thoughtEmoji}</span>
          <div className="absolute -bottom-1 left-2 w-2 h-2 bg-white border-r-2 border-b-2 border-black rotate-45" />
        </div>
      )}

      {/* Всплывающие сердечки при поглаживании */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute text-retro-red font-bold text-base pointer-events-none transition-all duration-75"
          style={{
            left: `${h.x}px`,
            top: `${h.y}px`,
            opacity: h.opacity,
          }}
        >
          ❤️
        </div>
      ))}

      {/* Холст отрисовки хомячка */}
      <canvas
        ref={canvasRef}
        width={200}
        height={180}
        className="w-[200px] h-[180px] pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};
