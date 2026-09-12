/**
 * ============================================================================
 * КОМПОНЕНТ: CageCanvas (Панорамный 480x180 Движок Клетки с 2x Детализацией)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ПАНОРАМНЫЙ ФОРМАТ (480 x 180 px):
 *    Соотношение сторон 8:3 (2.67:1) идеально подходит для роли фонового браузерного виджета:
 *    он не занимает полезную высоту экрана, при этом давая хомяку широкую беговую зону.
 * 
 * 2. 2X ДЕТАЛИЗАЦИЯ И ИНТЕРАКТИВНОЕ БЕГОВОЕ КОЛЕСО:
 *    - Вращающееся колесо (Exercise Wheel) с процедурным тригонометрическим
 *      расчетом спиц (`cos(angle)`, `sin(angle)`).
 *    - 24x24 спрайты хомяка (4-кадровая походка, бег в колесе, умывание ушек, обнюхивание).
 *    - Двойной слой золотистых опилок с текстурными древесными завитками.
 * ============================================================================
 */

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import {
  HamsterBehavior,
  HamsterPalette,
  CustomSpriteData,
  FurnitureConfig,
  PoopItem,
  EmoteBubble,
  Particle,
} from '@/types/hamster';
import {
  drawCharacterMatrix,
  drawCustomPixelGrid,
  drawPixelRect,
  drawPixelSpeechBubble,
  drawPoopSprite,
} from '@/utils/canvasUtils';
import {
  HAMSTER_24_IDLE_1,
  HAMSTER_24_IDLE_2,
  HAMSTER_24_WALK_1,
  HAMSTER_24_WALK_2,
  HAMSTER_24_WALK_3,
  HAMSTER_24_WALK_4,
  HAMSTER_24_WHEEL_1,
  HAMSTER_24_WHEEL_2,
  HAMSTER_24_GROOM_1,
  HAMSTER_24_GROOM_2,
  HAMSTER_24_SNIFF_1,
  HAMSTER_24_EAT_1,
  HAMSTER_24_EAT_2,
  HAMSTER_24_SLEEP_1,
  HAMSTER_24_SLEEP_2,
  HAMSTER_24_LAYING,
  HAMSTER_24_POOPING,
} from '@/utils/spritePresets';

export interface CageCanvasProps {
  palette: HamsterPalette;
  customSprite: CustomSpriteData | null;
  behavior: HamsterBehavior;
  furniture: FurnitureConfig;
  poops: PoopItem[];
  emotes: EmoteBubble[];
  particles: Particle[];
  posRef: React.MutableRefObject<{
    x: number;
    y: number;
    vx: number;
    targetX: number;
    flipX: boolean;
  }>;
  stateTimeRef: React.MutableRefObject<number>;
  onPet: () => void;
  onCleanPoop: (poopId: string) => void;
  onTapWheel: () => void;
  onTapBowl?: () => void;
  onTapBottle?: () => void;
}

const VIRTUAL_WIDTH = 480;
const VIRTUAL_HEIGHT = 180;

export const CageCanvas: React.FC<CageCanvasProps> = ({
  palette,
  customSprite,
  behavior,
  furniture,
  poops,
  emotes,
  particles,
  posRef,
  stateTimeRef,
  onPet,
  onCleanPoop,
  onTapWheel,
  onTapBowl,
  onTapBottle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wheelAngleRef = useRef<number>(0);

  /**
   * Отрисовка декораций панорамной клетки
   */
  const drawScenery = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      // 1. Задний фон комнаты (уютный теплый вечерний интерьер)
      ctx.fillStyle = '#1e1b2e';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Декоративные деревянные рейки стены
      ctx.fillStyle = '#26223b';
      for (let x = 0; x < VIRTUAL_WIDTH; x += 16) {
        ctx.fillRect(x, 0, 8, 140);
      }

      // 2. Металлическая решетка заднего плана (прутья с шагом 12px)
      ctx.fillStyle = '#3e4868';
      for (let x = 12; x < VIRTUAL_WIDTH - 12; x += 12) {
        ctx.fillRect(x, 16, 2, 130);
      }
      ctx.fillRect(12, 16, VIRTUAL_WIDTH - 24, 3);
      ctx.fillRect(12, 70, VIRTUAL_WIDTH - 24, 2);
      ctx.fillRect(12, 125, VIRTUAL_WIDTH - 24, 2);

      // 3. Беговое колесо слева (x = 24..74, центр: 49, 105)
      drawWheel(ctx, 49, 105, 26, behavior === HamsterBehavior.WHEEL);

      // 4. Домик (x = 88..144)
      drawHouse(ctx, furniture.house, 88, 86);

      // 5. Поилка по центру (x = 236)
      drawWaterBottle(ctx, furniture.waterBottle, 236, 40, time);

      // 6. Кормушка справа (x = 405..448)
      drawBowl(ctx, furniture.bowl, furniture.bowlFoodLevel, 408, 128);

      // 7. Поддон клетки с опилками (глубокий деревянный лоток)
      // Каркас поддона
      drawPixelRect(ctx, 8, 140, VIRTUAL_WIDTH - 16, 38, '#8a4b12');
      drawPixelRect(ctx, 6, 137, VIRTUAL_WIDTH - 12, 5, '#693508');

      // Слой золотистых опилок
      drawPixelRect(ctx, 10, 142, VIRTUAL_WIDTH - 20, 34, '#f5c66e');
      drawPixelRect(ctx, 10, 140, VIRTUAL_WIDTH - 20, 3, '#fbe09e');

      // Пиксельные завитки опилок
      ctx.fillStyle = '#df9b2d';
      for (let x = 20; x < VIRTUAL_WIDTH - 20; x += 18) {
        const offset = ((x * 7) % 11);
        ctx.fillRect(x + offset, 145 + (offset % 5), 4, 2);
        ctx.fillRect(x + 5, 158 + (offset % 6), 3, 2);
        ctx.fillRect(x + 10, 168 + (offset % 4), 4, 2);
      }
      ctx.fillStyle = '#fff4cf';
      for (let x = 22; x < VIRTUAL_WIDTH - 20; x += 22) {
        const offset = ((x * 13) % 9);
        ctx.fillRect(x + offset, 147 + (offset % 4), 3, 1);
        ctx.fillRect(x + 8, 162 + (offset % 5), 2, 1);
      }
    },
    [furniture, behavior]
  );

  /**
   * Отрисовка интерактивного бегового колеса
   */
  const drawWheel = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    isSpinning: boolean
  ) => {
    // Вращение колеса
    if (isSpinning) {
      wheelAngleRef.current += 0.22;
    }

    const angle = wheelAngleRef.current;

    // Металлическая стойка колеса
    ctx.fillStyle = '#2b2d42';
    ctx.fillRect(cx - 3, cy, 6, 42);
    ctx.fillRect(cx - 18, cy + 38, 36, 4);

    // Обод колеса
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Внутренний обод с перфорацией
    ctx.strokeStyle = '#90e0ef';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
    ctx.stroke();

    // 8 спиц колеса
    ctx.strokeStyle = '#caf0f8';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 8; i++) {
      const spAngle = angle + (i * Math.PI) / 4;
      const x1 = cx + Math.cos(spAngle) * 3;
      const y1 = cy + Math.sin(spAngle) * 3;
      const x2 = cx + Math.cos(spAngle) * (radius - 2);
      const y2 = cy + Math.sin(spAngle) * (radius - 2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Центральная ступица колеса
    ctx.fillStyle = '#03045e';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 1, cy - 1, 2, 2);
  };

  /**
   * Отрисовка домика
   */
  const drawHouse = (
    ctx: CanvasRenderingContext2D,
    type: FurnitureConfig['house'],
    x: number,
    y: number
  ) => {
    switch (type) {
      case 'log_cabin':
        drawPixelRect(ctx, x, y + 16, 56, 42, '#8b4513');
        drawPixelRect(ctx, x, y + 24, 56, 2, '#5c2d0c');
        drawPixelRect(ctx, x, y + 34, 56, 2, '#5c2d0c');
        drawPixelRect(ctx, x, y + 44, 56, 2, '#5c2d0c');
        // Крыша
        drawPixelRect(ctx, x - 4, y + 10, 64, 8, '#a0522d');
        drawPixelRect(ctx, x + 4, y + 4, 48, 6, '#cd853f');
        drawPixelRect(ctx, x + 12, y, 32, 5, '#df9b56');
        // Входная арочка
        drawPixelRect(ctx, x + 18, y + 28, 20, 30, '#2b1704');
        break;

      case 'coconut':
        drawPixelRect(ctx, x + 4, y + 12, 50, 46, '#5c3a21');
        drawPixelRect(ctx, x + 10, y + 5, 38, 9, '#5c3a21');
        drawPixelRect(ctx, x + 16, y + 1, 26, 5, '#5c3a21');
        drawPixelRect(ctx, x + 16, y + 28, 24, 30, '#2a180d');
        break;

      case 'mushroom':
        drawPixelRect(ctx, x + 12, y + 20, 34, 38, '#f4ece1');
        drawPixelRect(ctx, x + 18, y + 30, 20, 28, '#2a2015');
        drawPixelRect(ctx, x - 4, y + 12, 64, 12, '#e63946');
        drawPixelRect(ctx, x + 2, y + 5, 52, 9, '#e63946');
        drawPixelRect(ctx, x + 10, y, 36, 6, '#e63946');
        drawPixelRect(ctx, x + 6, y + 14, 8, 5, '#ffffff');
        drawPixelRect(ctx, x + 24, y + 4, 8, 5, '#ffffff');
        drawPixelRect(ctx, x + 42, y + 12, 7, 4, '#ffffff');
        break;

      case 'box':
        drawPixelRect(ctx, x, y + 14, 56, 44, '#d4a373');
        drawPixelRect(ctx, x + 6, y + 8, 44, 6, '#faedcd');
        drawPixelRect(ctx, x + 22, y + 8, 12, 50, '#ccd5ae');
        drawPixelRect(ctx, x + 12, y + 28, 20, 24, '#332211');
        drawPixelRect(ctx, x + 38, y + 22, 12, 12, '#332211');
        break;
    }
  };

  /**
   * Отрисовка поилки
   */
  const drawWaterBottle = (
    ctx: CanvasRenderingContext2D,
    type: FurnitureConfig['waterBottle'],
    x: number,
    y: number,
    time: number
  ) => {
    switch (type) {
      case 'ball':
        drawPixelRect(ctx, x, y, 16, 44, '#48cae4');
        drawPixelRect(ctx, x + 3, y - 4, 10, 5, '#023e8a');
        drawPixelRect(ctx, x + 2, y + 4, 3, 36, '#caf0f8');
        drawPixelRect(ctx, x + 5, y + 44, 6, 14, '#ced4da');
        drawPixelRect(ctx, x + 8, y + 56, 4, 6, '#6c757d');
        if (Math.sin(time * 3) > 0.3) {
          drawPixelRect(ctx, x + 9, y + 62, 2, 3, '#00b4d8');
        }
        break;

      case 'flask':
        drawPixelRect(ctx, x + 4, y, 8, 18, '#90e0ef');
        drawPixelRect(ctx, x, y + 18, 16, 26, '#0096c7');
        drawPixelRect(ctx, x + 2, y + 20, 2, 20, '#caf0f8');
        drawPixelRect(ctx, x + 5, y + 44, 6, 12, '#adb5bd');
        break;

      case 'fountain':
        drawPixelRect(ctx, x - 4, y + 15, 24, 32, '#0077b6');
        drawPixelRect(ctx, x, y + 5, 16, 10, '#03045e');
        const waterOffset = Math.floor(Math.sin(time * 8) * 2);
        drawPixelRect(ctx, x + 7 + waterOffset, y + 15, 3, 26, '#90e0ef');
        break;
    }
  };

  /**
   * Отрисовка кормушки
   */
  const drawBowl = (
    ctx: CanvasRenderingContext2D,
    type: FurnitureConfig['bowl'],
    foodLevel: number,
    x: number,
    y: number
  ) => {
    let bowlColor = '#d97706';
    let rimColor = '#b45309';

    if (type === 'wood') {
      bowlColor = '#8b5a2b';
      rimColor = '#5c3a1e';
    } else if (type === 'neon') {
      bowlColor = '#00f5d4';
      rimColor = '#00bbf9';
    } else if (type === 'royal') {
      bowlColor = '#ffd700';
      rimColor = '#d4af37';
    }

    drawPixelRect(ctx, x, y + 4, 36, 14, bowlColor);
    drawPixelRect(ctx, x + 3, y + 17, 30, 3, rimColor);
    drawPixelRect(ctx, x - 2, y, 40, 5, rimColor);

    if (foodLevel > 0) {
      const foodH = Math.min(6, Math.ceil((foodLevel / 100) * 6));
      drawPixelRect(ctx, x + 2, y - foodH + 2, 32, foodH, '#f4a261');
      ctx.fillStyle = '#2b1704';
      ctx.fillRect(x + 6, y - foodH + 1, 4, 2);
      ctx.fillRect(x + 16, y - foodH + 2, 3, 2);
      ctx.fillRect(x + 25, y - foodH + 1, 4, 2);
    }
  };

  /**
   * Главный рендер кадра на Canvas 480x180
   */
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const now = Date.now();
    const timeSec = now / 1000;

    // 1. Декорации
    drawScenery(ctx, timeSec);

    // 2. Какашки
    poops.forEach((p) => {
      drawPoopSprite(ctx, p.x, p.y, 2);
    });

    // 3. Спрайт хомячка (24x24 с pixelSize = 2 -> итоговый размер 48x48)
    const hx = Math.floor(posRef.current.x);
    const hy = Math.floor(posRef.current.y);
    const flipX = posRef.current.flipX;

    if (customSprite && customSprite.frames.length > 0) {
      const frameIndex =
        Math.floor(timeSec * customSprite.fps) % customSprite.frames.length;
      const currentFrame = customSprite.frames[frameIndex];
      drawCustomPixelGrid(ctx, currentFrame, hx, hy, 2, flipX);
    } else {
      let currentMatrix: string[] = HAMSTER_24_IDLE_1;

      switch (behavior) {
        case HamsterBehavior.IDLE:
          currentMatrix =
            Math.floor(timeSec * 2) % 2 === 0
              ? HAMSTER_24_IDLE_1
              : HAMSTER_24_IDLE_2;
          break;

        case HamsterBehavior.WALK:
          // Плавная 4-кадровая походка (6 FPS)
          const walkStep = Math.floor(timeSec * 6) % 4;
          if (walkStep === 0) currentMatrix = HAMSTER_24_WALK_1;
          else if (walkStep === 1) currentMatrix = HAMSTER_24_WALK_2;
          else if (walkStep === 2) currentMatrix = HAMSTER_24_WALK_3;
          else currentMatrix = HAMSTER_24_WALK_4;
          break;

        case HamsterBehavior.WHEEL:
          // Быстрый бег в колесе
          currentMatrix =
            Math.floor(timeSec * 8) % 2 === 0
              ? HAMSTER_24_WHEEL_1
              : HAMSTER_24_WHEEL_2;
          break;

        case HamsterBehavior.GROOM:
          currentMatrix =
            Math.floor(timeSec * 3) % 2 === 0
              ? HAMSTER_24_GROOM_1
              : HAMSTER_24_GROOM_2;
          break;

        case HamsterBehavior.SNIFF:
          currentMatrix = HAMSTER_24_SNIFF_1;
          break;

        case HamsterBehavior.LAYING:
          currentMatrix = HAMSTER_24_LAYING;
          break;

        case HamsterBehavior.SLEEP:
          currentMatrix =
            Math.floor(timeSec * 1.5) % 2 === 0
              ? HAMSTER_24_SLEEP_1
              : HAMSTER_24_SLEEP_2;
          break;

        case HamsterBehavior.EATING:
          currentMatrix =
            Math.floor(timeSec * 6) % 2 === 0
              ? HAMSTER_24_EAT_1
              : HAMSTER_24_EAT_2;
          break;

        case HamsterBehavior.POOPING:
          currentMatrix = HAMSTER_24_POOPING;
          break;
      }

      drawCharacterMatrix(ctx, currentMatrix, hx, hy, palette, 2, flipX);
    }

    // 4. Частицы
    particles.forEach((p) => {
      if (p.char) {
        ctx.font = '12px sans-serif';
        ctx.fillText(p.char, Math.floor(p.x), Math.floor(p.y));
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }
    });

    // 5. Всплывающие эмодзи-бабблы
    emotes.forEach((e) => {
      const bubbleCenterX = hx + 24;
      const bubbleBottomY = hy + e.offsetY;
      drawPixelSpeechBubble(ctx, bubbleCenterX, bubbleBottomY, e.emoji, e.opacity);
    });

    // 6. Передние прутья клетки
    ctx.fillStyle = 'rgba(62, 72, 104, 0.45)';
    for (let x = 12; x < VIRTUAL_WIDTH - 12; x += 16) {
      ctx.fillRect(x, 16, 2, 130);
    }
  }, [drawScenery, poops, customSprite, behavior, palette, particles, emotes, posRef]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (VIRTUAL_WIDTH / rect.width);
    const clickY = (e.clientY - rect.top) * (VIRTUAL_HEIGHT / rect.height);

    // 1. Клик по какашке
    for (const poop of poops) {
      const dist = Math.hypot(clickX - (poop.x + 6), clickY - (poop.y + 4));
      if (dist < 16) {
        onCleanPoop(poop.id);
        return;
      }
    }

    // 2. Клик по беговому колесу (x = 24..74, y = 78..148)
    if (clickX >= 24 && clickX <= 74 && clickY >= 75 && clickY <= 148) {
      onTapWheel();
      return;
    }

    // 3. Клик по хомячку
    const hx = posRef.current.x;
    const hy = posRef.current.y;
    if (
      clickX >= hx - 5 &&
      clickX <= hx + 52 &&
      clickY >= hy - 5 &&
      clickY <= hy + 52
    ) {
      onPet();
      return;
    }

    // 4. Клик по кормушке
    if (clickX >= 400 && clickX <= 455 && clickY >= 120 && clickY <= 155) {
      onTapBowl?.();
      return;
    }

    // 5. Клик по поилке
    if (clickX >= 225 && clickX <= 260 && clickY >= 35 && clickY <= 110) {
      onTapBottle?.();
      return;
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-lg overflow-hidden border-4 border-black shadow-pixel-lg bg-black select-none">
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        onClick={handleCanvasClick}
        className="w-full h-auto block cursor-pointer"
        style={{
          imageRendering: 'pixelated',
          aspectRatio: '480 / 180',
        }}
      />
      <div className="absolute bottom-1.5 left-2 text-[8px] text-white/50 font-pixel pointer-events-none">
        TAP: Хомяк • Колесо • Миска • Поилка • Какашки
      </div>
    </div>
  );
};
