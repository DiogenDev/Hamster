/**
 * ============================================================================
 * КОМПОНЕНТ: CageCanvas (Движок Рендеринга Клетки на HTML5 Canvas 2D)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Canvas vs 100 React <div> элементов):
 *    - Проблема DOM: если делать анимации опилок, прутьев клетки, хомяка, мисок,
 *      какашек и сотен частиц через React-компоненты (<div style={{ left, top }}>),
 *      браузер будет вынужден на каждом тике пересчитывать дерево стилей (CSSOM Reflow / Layout Thrashing).
 *      Это приводит к сильным просадкам FPS, нагреву устройства и лагам сборщика мусора.
 *    - Преимущество Canvas 2D: Мы используем режим немедленной отрисовки (Immediate Mode).
 *      Вся сцена (клетка, предметы интерьера, тени, хомяк, бабблы) рисуется за 1 проход в одном
 *      буфере фиксированного разрешения (320x240) с отключенным сглаживанием:
 *      `ctx.imageSmoothingEnabled = false`.
 * 
 * 2. ЦЕЛОЧИСЛЕННОЕ МАСШТАБИРОВАНИЕ (Pixel Perfect Integer Scaling):
 *    - Виртуальный холст имеет строгое разрешение 320x240 пикселей (пропорция 4:3).
 *    - Через CSS `image-rendering: pixelated` и `aspectRatio: '320 / 240'` браузер растягивает
 *      картинку на весь экран без мыла, сохраняя аутентичный шарм NES/GameBoy.
 *    - Для корректного клика мы транслируем координаты мыши из клиентских пикселей
 *      (clientX, clientY) в виртуальные (0..320, 0..240) по формуле:
 *        virtualX = (clientX - rect.left) * (320 / rect.width)
 *        virtualY = (clientY - rect.top) * (240 / rect.height)
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
  HAMSTER_IDLE_FRAME_1,
  HAMSTER_IDLE_FRAME_2,
  HAMSTER_WALK_FRAME_1,
  HAMSTER_WALK_FRAME_2,
  HAMSTER_LAYING_FRAME,
  HAMSTER_SLEEP_FRAME_1,
  HAMSTER_SLEEP_FRAME_2,
  HAMSTER_EATING_FRAME_1,
  HAMSTER_EATING_FRAME_2,
  HAMSTER_POOPING_FRAME,
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
  onTapBowl?: () => void;
  onTapBottle?: () => void;
}

const VIRTUAL_WIDTH = 320;
const VIRTUAL_HEIGHT = 240;

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
  onTapBowl,
  onTapBottle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  /**
   * Отрисовка декораций клетки и мебели
   */
  const drawScenery = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      // 1. Задний фон комнаты (теплые ретро-обои в пиксельную полоску)
      ctx.fillStyle = '#262b44';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Полосы обоев
      ctx.fillStyle = '#2f3554';
      for (let x = 0; x < VIRTUAL_WIDTH; x += 16) {
        ctx.fillRect(x, 0, 8, 180);
      }

      // 2. Металлическая решетка заднего плана клетки
      ctx.fillStyle = '#475375';
      for (let x = 20; x < VIRTUAL_WIDTH - 20; x += 12) {
        ctx.fillRect(x, 24, 2, 170);
      }
      ctx.fillRect(20, 24, VIRTUAL_WIDTH - 40, 3);
      ctx.fillRect(20, 90, VIRTUAL_WIDTH - 40, 2);
      ctx.fillRect(20, 160, VIRTUAL_WIDTH - 40, 2);

      // 3. Домик в левом углу (x=24, y=130)
      drawHouse(ctx, furniture.house, 24, 130);

      // 4. Поилка на стенке клетки (x=160, y=70)
      drawWaterBottle(ctx, furniture.waterBottle, 155, 75, time);

      // 5. Кормушка справа (x=248, y=175)
      drawBowl(ctx, furniture.bowl, furniture.bowlFoodLevel, 248, 175);

      // 6. Поддон клетки с мягкими опилками
      // Основа поддона
      drawPixelRect(ctx, 16, 190, VIRTUAL_WIDTH - 32, 44, '#b45f06');
      drawPixelRect(ctx, 14, 186, VIRTUAL_WIDTH - 28, 6, '#8f4700');

      // Слой золотистых опилок
      drawPixelRect(ctx, 18, 192, VIRTUAL_WIDTH - 36, 38, '#f5c66e');
      drawPixelRect(ctx, 18, 190, VIRTUAL_WIDTH - 36, 4, '#f7d28c');

      // Пиксельные завитки опилок
      const sawdustDots = [
        [30, 195], [50, 202], [80, 198], [110, 205], [140, 196],
        [170, 203], [200, 197], [230, 206], [260, 199], [290, 204],
        [40, 212], [90, 218], [135, 214], [180, 220], [225, 215], [270, 222]
      ];
      ctx.fillStyle = '#e5a83b';
      sawdustDots.forEach(([dx, dy]) => {
        ctx.fillRect(dx, dy, 3, 2);
      });
      ctx.fillStyle = '#fff0ba';
      sawdustDots.forEach(([dx, dy]) => {
        ctx.fillRect(dx + 3, dy, 2, 2);
      });
    },
    [furniture]
  );

  /**
   * Отрисовка выбранного типа домика
   */
  const drawHouse = (ctx: CanvasRenderingContext2D, type: FurnitureConfig['house'], x: number, y: number) => {
    switch (type) {
      case 'log_cabin':
        // Бревенчатый сруб с крышей
        drawPixelRect(ctx, x, y + 20, 52, 45, '#8b4513');
        // Полосы бревен
        drawPixelRect(ctx, x, y + 28, 52, 2, '#5c2d0c');
        drawPixelRect(ctx, x, y + 38, 52, 2, '#5c2d0c');
        drawPixelRect(ctx, x, y + 48, 52, 2, '#5c2d0c');
        // Двускатная крыша
        drawPixelRect(ctx, x - 4, y + 14, 60, 8, '#a0522d');
        drawPixelRect(ctx, x + 4, y + 8, 44, 6, '#cd853f');
        drawPixelRect(ctx, x + 12, y + 2, 28, 6, '#df9b56');
        // Входная арочка
        drawPixelRect(ctx, x + 16, y + 36, 20, 29, '#2b1704');
        drawPixelRect(ctx, x + 18, y + 33, 16, 4, '#2b1704');
        break;

      case 'coconut':
        // Скорлупа кокоса
        drawPixelRect(ctx, x + 4, y + 15, 48, 50, '#5c3a21');
        drawPixelRect(ctx, x + 8, y + 8, 40, 10, '#5c3a21');
        drawPixelRect(ctx, x + 14, y + 3, 28, 6, '#5c3a21');
        // Вход
        drawPixelRect(ctx, x + 16, y + 32, 24, 33, '#2a180d');
        drawPixelRect(ctx, x + 19, y + 28, 18, 5, '#2a180d');
        // Текстура волокон кокоса
        ctx.fillStyle = '#7a4e2d';
        ctx.fillRect(x + 10, y + 20, 4, 2);
        ctx.fillRect(x + 40, y + 22, 5, 2);
        ctx.fillRect(x + 36, y + 14, 4, 2);
        break;

      case 'mushroom':
        // Керамический гриб-мухомор
        // Белая ножка
        drawPixelRect(ctx, x + 10, y + 26, 36, 39, '#f4ece1');
        drawPixelRect(ctx, x + 18, y + 36, 18, 29, '#2a2015'); // Вход
        // Красная шляпка
        drawPixelRect(ctx, x - 4, y + 16, 64, 14, '#e63946');
        drawPixelRect(ctx, x + 2, y + 8, 52, 10, '#e63946');
        drawPixelRect(ctx, x + 10, y + 2, 36, 8, '#e63946');
        // Белые пятна мухомора
        drawPixelRect(ctx, x + 6, y + 18, 8, 6, '#ffffff');
        drawPixelRect(ctx, x + 24, y + 6, 8, 6, '#ffffff');
        drawPixelRect(ctx, x + 42, y + 16, 7, 5, '#ffffff');
        break;

      case 'box':
        // Картонная коробка
        drawPixelRect(ctx, x, y + 18, 52, 47, '#d4a373');
        drawPixelRect(ctx, x + 6, y + 12, 40, 6, '#faedcd');
        // Скотч
        drawPixelRect(ctx, x + 20, y + 12, 12, 53, '#ccd5ae');
        // Вход-окошко
        drawPixelRect(ctx, x + 12, y + 34, 18, 20, '#332211');
        // Окно сбоку
        drawPixelRect(ctx, x + 34, y + 28, 12, 12, '#332211');
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
        // Шариковая капельная поилка
        drawPixelRect(ctx, x, y, 16, 45, '#48cae4'); // колба
        drawPixelRect(ctx, x + 3, y - 4, 10, 5, '#023e8a'); // крышка
        drawPixelRect(ctx, x + 2, y + 4, 3, 37, '#caf0f8'); // блик
        // Металлический носик под углом
        drawPixelRect(ctx, x + 5, y + 45, 6, 14, '#ced4da');
        drawPixelRect(ctx, x + 8, y + 57, 4, 6, '#6c757d');
        // Капелька воды
        if (Math.sin(time * 3) > 0.3) {
          drawPixelRect(ctx, x + 9, y + 64, 2, 3, '#00b4d8');
        }
        break;

      case 'flask':
        // Стеклянная мензурка
        drawPixelRect(ctx, x + 4, y, 8, 20, '#90e0ef');
        drawPixelRect(ctx, x, y + 20, 16, 26, '#0096c7');
        drawPixelRect(ctx, x + 2, y + 22, 2, 20, '#caf0f8');
        // Металлический кран
        drawPixelRect(ctx, x + 5, y + 46, 6, 12, '#adb5bd');
        break;

      case 'fountain':
        // Автоматический фонтанчик
        drawPixelRect(ctx, x - 4, y + 15, 24, 35, '#0077b6');
        drawPixelRect(ctx, x, y + 5, 16, 12, '#03045e');
        // Струйка воды с мерцанием
        const waterOffset = Math.floor(Math.sin(time * 8) * 2);
        drawPixelRect(ctx, x + 7 + waterOffset, y + 17, 3, 30, '#90e0ef');
        break;
    }
  };

  /**
   * Отрисовка кормушки и насыпанного корма
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

    // Тело миски
    drawPixelRect(ctx, x, y + 4, 36, 14, bowlColor);
    drawPixelRect(ctx, x + 3, y + 17, 30, 3, rimColor);
    // Ободок миски
    drawPixelRect(ctx, x - 2, y, 40, 5, rimColor);

    // Отрисовка корма внутри миски
    if (foodLevel > 0) {
      const foodH = Math.min(6, Math.ceil((foodLevel / 100) * 6));
      drawPixelRect(ctx, x + 2, y - foodH + 2, 32, foodH, '#f4a261');
      // Зернышки и семечки поверх
      ctx.fillStyle = '#2b1704';
      ctx.fillRect(x + 6, y - foodH + 1, 4, 2);
      ctx.fillRect(x + 16, y - foodH + 2, 3, 2);
      ctx.fillRect(x + 25, y - foodH + 1, 4, 2);
      ctx.fillStyle = '#e76f51';
      ctx.fillRect(x + 12, y - foodH, 3, 2);
      ctx.fillRect(x + 21, y - foodH, 3, 2);
    }
  };

  /**
   * Главный рендер кадра на Canvas
   */
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Гарантируем жесткие пиксели без блюра
    ctx.imageSmoothingEnabled = false;

    const now = Date.now();
    const timeSec = now / 1000;

    // 1. Рисуем декорации клетки
    drawScenery(ctx, timeSec);

    // 2. Рисуем какашки на полу клетки
    poops.forEach((p) => {
      drawPoopSprite(ctx, p.x, p.y, 2);
    });

    // 3. Выбор спрайта хомячка и отрисовка
    const hx = Math.floor(posRef.current.x);
    const hy = Math.floor(posRef.current.y);
    const flipX = posRef.current.flipX;

    if (customSprite && customSprite.frames.length > 0) {
      // Отрисовка кастомного спрайта из студии Pixel Art Studio
      const frameIndex =
        Math.floor(timeSec * customSprite.fps) % customSprite.frames.length;
      const currentFrame = customSprite.frames[frameIndex];
      drawCustomPixelGrid(ctx, currentFrame, hx, hy, 3, flipX);
    } else {
      // Процедурная отрисовка базового хомячка с наложением 20 дизайнерских палитр
      let currentMatrix: string[] = HAMSTER_IDLE_FRAME_1;

      switch (behavior) {
        case HamsterBehavior.IDLE:
          // Моргает и шевелит носиком каждые 0.6 сек
          currentMatrix =
            Math.floor(timeSec * 2) % 2 === 0
              ? HAMSTER_IDLE_FRAME_1
              : HAMSTER_IDLE_FRAME_2;
          break;

        case HamsterBehavior.WALK:
          // Шагает лапками: 5 кадров в секунду
          currentMatrix =
            Math.floor(timeSec * 5) % 2 === 0
              ? HAMSTER_WALK_FRAME_1
              : HAMSTER_WALK_FRAME_2;
          break;

        case HamsterBehavior.LAYING:
          currentMatrix = HAMSTER_LAYING_FRAME;
          break;

        case HamsterBehavior.SLEEP:
          // Дышит во сне клубочком (1.5 кадра в сек)
          currentMatrix =
            Math.floor(timeSec * 1.5) % 2 === 0
              ? HAMSTER_SLEEP_FRAME_1
              : HAMSTER_SLEEP_FRAME_2;
          break;

        case HamsterBehavior.EATING:
          // Быстро жует щечками
          currentMatrix =
            Math.floor(timeSec * 6) % 2 === 0
              ? HAMSTER_EATING_FRAME_1
              : HAMSTER_EATING_FRAME_2;
          break;

        case HamsterBehavior.POOPING:
          currentMatrix = HAMSTER_POOPING_FRAME;
          break;
      }

      drawCharacterMatrix(ctx, currentMatrix, hx, hy, palette, 3, flipX);
    }

    // 4. Отрисовка частиц (сердечки, крошки, блеск)
    particles.forEach((p) => {
      if (p.char) {
        ctx.font = '12px sans-serif';
        ctx.fillText(p.char, Math.floor(p.x), Math.floor(p.y));
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }
    });

    // 5. Отрисовка всплывающих спич-бабблов
    emotes.forEach((e) => {
      const bubbleCenterX = hx + 24;
      const bubbleBottomY = hy + e.offsetY;
      drawPixelSpeechBubble(ctx, bubbleCenterX, bubbleBottomY, e.emoji, e.opacity);
    });

    // 6. Передние прутья клетки (для создания эффекта объема и глубины 3D)
    ctx.fillStyle = 'rgba(71, 83, 117, 0.45)';
    for (let x = 20; x < VIRTUAL_WIDTH - 20; x += 16) {
      ctx.fillRect(x, 24, 2, 172);
    }
  }, [drawScenery, poops, customSprite, behavior, palette, particles, emotes, posRef]);

  // Запуск непрерывного рендера
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  /**
   * Интерактивный клик по Canvas
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Транслируем координаты экрана в виртуальные пиксели 320x240
    const clickX = (e.clientX - rect.left) * (VIRTUAL_WIDTH / rect.width);
    const clickY = (e.clientY - rect.top) * (VIRTUAL_HEIGHT / rect.height);

    // 1. Проверяем клик по какашке для уборки клетки
    for (const poop of poops) {
      const dist = Math.hypot(clickX - (poop.x + 6), clickY - (poop.y + 4));
      if (dist < 16) {
        onCleanPoop(poop.id);
        return;
      }
    }

    // 2. Проверяем клик по хомячку (размер хитбокса 48x48 пикселей)
    const hx = posRef.current.x;
    const hy = posRef.current.y;
    if (
      clickX >= hx - 5 &&
      clickX <= hx + 55 &&
      clickY >= hy - 5 &&
      clickY <= hy + 55
    ) {
      onPet();
      return;
    }

    // 3. Проверяем клик по кормушке
    if (clickX >= 240 && clickX <= 290 && clickY >= 165 && clickY <= 200) {
      onTapBowl?.();
      return;
    }

    // 4. Проверяем клик по поилке
    if (clickX >= 145 && clickX <= 180 && clickY >= 65 && clickY <= 140) {
      onTapBottle?.();
      return;
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden border-4 border-black shadow-pixel-lg bg-black select-none">
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        onClick={handleCanvasClick}
        className="w-full h-auto block cursor-pointer"
        style={{
          imageRendering: 'pixelated',
          aspectRatio: '320 / 240',
        }}
      />
      <div className="absolute bottom-2 left-2 text-[10px] text-white/50 font-pixel pointer-events-none">
        TAP: Погладить / Убрать
      </div>
    </div>
  );
};
