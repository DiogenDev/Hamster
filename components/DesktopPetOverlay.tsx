/**
 * ============================================================================
 * КОМПОНЕНТ: DesktopPetOverlay.tsx
 * ============================================================================
 * Режим "Хомячок на рабочем столе" (Windows Desktop Pet / Shimeji).
 * Отображается в прозрачном окне без рамок.
 * ============================================================================
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
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
  x: number;
  y: number;
  opacity: number;
  vy: number;
  vx: number;
}

export const DesktopPetOverlay: React.FC = () => {
  const { data, setData, isHydrated } = useSafeStorage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ссылки на высокочастотные параметры анимации (без лагов и без ререндеров React)
  const posRef = useRef({
    x: 40,
    y: 95,
    dir: 1 as 1 | -1,
    isWalking: true,
    isPetting: false,
  });

  const heartsRef = useRef<HeartParticle[]>([]);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<{ screenX: number; screenY: number }>({ screenX: 0, screenY: 0 });
  const isRightClickDownRef = useRef<boolean>(false);
  const lastStateChangeRef = useRef<number>(Date.now());
  const lastPetSoundTimeRef = useRef<number>(0);

  // Палитра хомячка
  const currentPalette =
    HAMSTER_PALETTES.find((p) => p.id === data?.paletteId) || HAMSTER_PALETTES[0];

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Вычисление нужд хомячка для облачка мыслей
  const getThoughtEmoji = useCallback(() => {
    const currentData = dataRef.current;
    if (!currentData || !currentData.needs) return null;
    const foodLevel = currentData.furniture?.bowlFoodLevel ?? 100;
    const waterLevel = currentData.furniture?.bottleWaterLevel ?? 100;

    if (currentData.needs.hunger <= 30 || foodLevel <= 15) return '🌾';
    if (waterLevel <= 15) return '🧃';
    if (currentData.needs.hygiene <= 30 || (currentData.poops && currentData.poops.length >= 3)) return '🧼';
    if (currentData.needs.energy <= 20) return '💤';
    if (currentData.needs.happiness <= 30) return '💔';
    return null;
  }, []);

  // 1. Принудительная установка прозрачности окна
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('pet-mode');
      document.body.classList.add('pet-mode');
      document.body.style.background = 'transparent';
      document.body.style.backgroundColor = 'transparent';
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('pet-mode');
        document.body.classList.remove('pet-mode');
      }
    };
  }, []);

  // 2. Оптимизированный игровой цикл на requestAnimationFrame (60 FPS без лагов DWM)
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const now = Date.now();
          const pos = posRef.current;

          // Логика движения хомячка
          if (!pos.isPetting && !isDraggingRef.current) {
            if (now - lastStateChangeRef.current > 2500) {
              lastStateChangeRef.current = now;
              if (Math.random() < 0.35) {
                pos.isWalking = !pos.isWalking;
              }
            }

            if (pos.isWalking) {
              pos.x += pos.dir * 45 * dt;
              if (pos.x >= 115) {
                pos.x = 115;
                pos.dir = -1;
              } else if (pos.x <= 15) {
                pos.x = 15;
                pos.dir = 1;
              }
            }
          }

          // Выбор спрайта
          const frameIndex = Math.floor(now / 200) % 2;
          let sprite = HAMSTER_24_IDLE_1;
          if (pos.isPetting) {
            sprite = frameIndex === 0 ? HAMSTER_24_GROOM_1 : HAMSTER_24_GROOM_2;
          } else if (pos.isWalking) {
            sprite = frameIndex === 0 ? HAMSTER_24_WALK_1 : HAMSTER_24_WALK_2;
          } else {
            sprite = frameIndex === 0 ? HAMSTER_24_IDLE_1 : HAMSTER_24_IDLE_2;
          }

          // Отрисовка спрайта хомячка
          drawCharacterMatrix(
            ctx,
            sprite,
            Math.round(pos.x),
            Math.round(pos.y),
            currentPalette,
            3,
            pos.dir === -1
          );

          // Отрисовка облачка мыслей прямо на Canvas
          const emoji = getThoughtEmoji();
          if (emoji && !pos.isPetting) {
            const bx = Math.round(pos.x + 36);
            const by = Math.round(pos.y - 32 + Math.sin(now / 250) * 3);

            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;

            ctx.beginPath();
            if (typeof (ctx as any).roundRect === 'function') {
              (ctx as any).roundRect(bx - 16, by - 13, 32, 26, 6);
            } else {
              ctx.rect(bx - 16, by - 13, 32, 26);
            }
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(bx - 6, by + 13);
            ctx.lineTo(bx - 10, by + 19);
            ctx.lineTo(bx - 1, by + 13);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.stroke();

            ctx.font = '14px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, bx, by);
            ctx.restore();
          }

          // Обновление и отрисовка сердечек прямо на Canvas
          const hearts = heartsRef.current;
          if (hearts.length > 0) {
            ctx.save();
            ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (let i = hearts.length - 1; i >= 0; i--) {
              const h = hearts[i];
              h.y -= h.vy * dt;
              h.x += h.vx * dt;
              h.opacity -= 0.8 * dt;

              if (h.opacity <= 0) {
                hearts.splice(i, 1);
              } else {
                ctx.globalAlpha = Math.max(0, Math.min(1, h.opacity));
                ctx.fillText('❤️', h.x, h.y);
              }
            }
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentPalette, getThoughtEmoji]);

  // 3. Обработчики мыши
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Левая кнопка мыши: перетаскивание
      isDraggingRef.current = true;
      dragStartPosRef.current = { screenX: e.screenX, screenY: e.screenY };
    } else if (e.button === 2) {
      // Правая кнопка мыши: поглаживание
      isRightClickDownRef.current = true;
      posRef.current.isPetting = true;
      spawnHeart();
      playPetSoundThrottled();

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
      posRef.current.isPetting = true;
      if (Math.random() < 0.3) {
        spawnHeart();
        playPetSoundThrottled();
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
      posRef.current.isPetting = false;
    }
  };

  const spawnHeart = () => {
    const pos = posRef.current;
    if (heartsRef.current.length > 12) return;
    heartsRef.current.push({
      x: pos.x + 36 + (Math.random() * 20 - 10),
      y: pos.y + 10,
      opacity: 1,
      vy: 40 + Math.random() * 30,
      vx: (Math.random() - 0.5) * 20,
    });
  };

  const playPetSoundThrottled = () => {
    const now = Date.now();
    if (now - lastPetSoundTimeRef.current > 150) {
      lastPetSoundTimeRef.current = now;
      soundManager.playPetSound();
    }
  };

  // Двойной клик ЛКМ -> открытие главной игры с клеткой
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
      className="w-full h-full select-none cursor-grab active:cursor-grabbing relative overflow-hidden flex items-end justify-center bg-transparent"
      style={{
        backgroundColor: 'transparent',
        background: 'transparent',
      }}
    >
      <canvas
        ref={canvasRef}
        width={200}
        height={180}
        className="w-[200px] h-[180px] pointer-events-none"
        style={{
          imageRendering: 'pixelated',
          backgroundColor: 'transparent',
          background: 'transparent',
        }}
      />
    </div>
  );
};
