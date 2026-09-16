/**
 * ============================================================================
 * КОМПОНЕНТ: CageCanvas (Панорамный 480x180 / Мобильный Многоярусный: Вертикальная Камера & Туннели)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. МОБИЛЬНЫЙ МНОГОЯРУСНЫЙ ОБЗОР (Mobile Multi-Tier):
 *    - На мобильных устройствах отображаются СРАЗУ ВСЕ доступные этажи клетки:
 *      * 1 ярус: 480x180 (высота 180)
 *      * 2 яруса: 480x360 (высота 360, мезонин + 1-й этаж + соединяющая труба)
 *      * 3 яруса: 480x540 (высота 540, пентхаус + мезонин + 1-й этаж + 2 трубы)
 *    - Клетка центрирована по вертикали ("пришита к середине"), хомячок крупный и четко виден!
 * 
 * 2. ИНТУИТИВНОЕ УПРАВЛЕНИЕ (Mobile Gestures & Desktop):
 *    - Хомячок: просто зажать пальцем / мышкой и свободно тащить между этажами ("зажать и двигать").
 *      При отпускании хомячок приземляется на этаж с характерным звуком и эмоцией!
 *      Одиночный тап без смещения гладит хомячка.
 *    - Мебель и игрушки: ДВА КЛИКА / ДВА ТАПА по предмету активируют режим перемещения.
 *      Предмет подсвечивается пульсирующей неоновой рамкой, сверху появляется кнопка "✓ Применить".
 *      Пользователь двигает вещь и жмет галочку "✓ Применить" для сохранения!
 * 
 * 3. ПОСТОЯННО ВИДИМЫЕ ТУННЕЛИ НА ТЕЛЕФОНЕ:
 *    - На мобильном экране диагональные акриловые трубы всегда соединяют этажи.
 *    - Хомячок бежит внутри прозрачной трубы между этажами!
 * ============================================================================
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  HamsterBehavior,
  HamsterPalette,
  CustomSpriteData,
  FurnitureConfig,
  FurniturePositions,
  PoopItem,
  EmoteBubble,
  Particle,
  CageTier,
  CageColorId,
  TunnelColorId,
  TunnelTextureId,
  FloorStyleId,
  TierToysConfig,
  TunnelTransitionState,
} from '@/types/hamster';
import {
  drawCharacterMatrix,
  drawCustomPixelGrid,
  drawPixelRect,
  drawPixelSpeechBubble,
  drawPoopSprite,
} from '@/utils/canvasUtils';
import { drawPixelEmoji } from '@/utils/pixelEmoji';
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
  HAMSTER_24_DRINK_1,
  HAMSTER_24_DRINK_2,
  HAMSTER_24_SLEEP_1,
  HAMSTER_24_SLEEP_2,
  HAMSTER_SLEEP_PEEK_1,
  HAMSTER_SLEEP_PEEK_2,
  HAMSTER_24_LAYING,
  HAMSTER_24_POOPING,
  HAMSTER_24_PLAYING_1,
  HAMSTER_24_PLAYING_2,
} from '@/utils/hamsterSprites';
import { drawHouseInterior, drawHouseExterior } from '@/utils/housePresets';
import {
  drawBowlDetailed,
  drawWaterBottleDetailed,
} from '@/utils/furniturePresets';
import {
  drawWheelBackDetailed,
  drawWheelFrontDetailed,
} from '@/utils/wheelPresets';
import { soundManager } from '@/utils/soundEffects';
import {
  drawVerticalCageScenery,
  drawDiagonalTunnelBack,
  drawDiagonalTunnelFront,
  DIAGONAL_TUNNELS,
  CAGE_COLOR_PALETTES,
} from '@/utils/cageTiers';

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
  chonkScale?: number;
  cageTier?: CageTier;
  cageColor?: CageColorId;
  tunnelColor?: TunnelColorId;
  tunnelTexture?: TunnelTextureId;
  floorStyle?: FloorStyleId;
  tierToys?: TierToysConfig;
  currentFloor?: 1 | 2 | 3;
  tunnelTransition?: TunnelTransitionState | null;
  tunnelTransitionRef?: React.RefObject<TunnelTransitionState | null>;
  activeToyFloor?: 2 | 3 | null;
  onRequestFloorChange?: (targetFloor: 1 | 2 | 3) => void;
  onPet: () => void;
  onCleanPoop: (poopId: string) => void;
  onTapWheel: () => void;
  onTapBowl?: () => void;
  onTapBottle?: () => void;
  onTapHouse?: () => void;
  onTapFloorToy?: (floor: 2 | 3, toyId: string) => void;
  onUpdateFurniturePositions?: (positions: FurniturePositions) => void;
  onPickUpHamster?: () => void;
  onDropHamster?: (dropX: number, dropY: number) => void;
}

const VIRTUAL_WIDTH = 480;
const VIRTUAL_HEIGHT_DESKTOP = 180;

const WHEEL_RADIUS = 35;
const HOUSE_W = 76;
const HOUSE_H = 64;

const DEFAULT_POSITIONS: FurniturePositions = {
  houseX: 98,
  houseY: 78,
  wheelX: 56,
  wheelY: 86,
  bowlX: 412,
  bowlY: 122,
  bottleX: 246,
  bottleY: 38,
  floor2ToyX: 235,
  floor2ToyY: -28,
  floor3ToyX: 145,
  floor3ToyY: -208,
};

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
  chonkScale = 1.0,
  cageTier = 1,
  cageColor = 'silver',
  tunnelColor = 'neon_cyan',
  tunnelTexture = 'smooth_glass',
  floorStyle = 'natural_oak',
  tierToys = { floor2Toy: 'seesaw', floor3Toy: 'telescope' },
  currentFloor = 1,
  tunnelTransition = null,
  tunnelTransitionRef,
  activeToyFloor: activeToyFloorProp = null,
  onRequestFloorChange,
  onPet,
  onCleanPoop,
  onTapWheel,
  onTapBowl,
  onTapBottle,
  onTapHouse,
  onTapFloorToy,
  onUpdateFurniturePositions,
  onPickUpHamster,
  onDropHamster,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wheelAngleRef = useRef<number>(0);
  const cameraYRef = useRef<number>(0);

  // Определение мобильного экрана / компактного режима (< 768px или высота < 550px или тач)
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const updateMobile = () => {
      if (typeof window === 'undefined') return;
      const isNarrow = window.innerWidth < 768;
      const isShort = window.innerHeight < 550;
      const isTouch = 'ontouchstart' in window && window.innerWidth < 1024;
      setIsMobile(isNarrow || isShort || isTouch);
    };
    updateMobile();
    window.addEventListener('resize', updateMobile);
    window.addEventListener('orientationchange', updateMobile);
    return () => {
      window.removeEventListener('resize', updateMobile);
      window.removeEventListener('orientationchange', updateMobile);
    };
  }, []);

  // Виртуальная высота и смещение мира в зависимости от мобильного режима и ярусов
  const virtualWidth = VIRTUAL_WIDTH;
  const virtualHeight = isMobile
    ? cageTier === 1
      ? 180
      : cageTier === 2
      ? 360
      : 540
    : VIRTUAL_HEIGHT_DESKTOP;

  const worldOffsetY = isMobile
    ? cageTier === 1
      ? 0
      : cageTier === 2
      ? 180
      : 360
    : 0;

  const aspectRatioStr = isMobile
    ? cageTier === 1
      ? '480 / 180'
      : cageTier === 2
      ? '480 / 360'
      : '480 / 540'
    : '480 / 180';

  // Размеры контейнера холста в пикселях дисплея, вычисляемые динамически в реальном времени
  const [displayDimensions, setDisplayDimensions] = useState<{ width: number; height: number }>({
    width: 480,
    height: 180,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeFit = () => {
      const parent = container.parentElement;
      if (!parent) return;
      const pRect = parent.getBoundingClientRect();
      const padW = isMobile ? 4 : 16;
      const padH = isMobile ? 4 : 16;
      const availW = Math.max(120, pRect.width - padW);
      const availH = Math.max(100, pRect.height - padH);

      const ar = virtualWidth / virtualHeight;
      let targetW = availW;
      let targetH = targetW / ar;

      if (targetH > availH) {
        targetH = availH;
        targetW = targetH * ar;
      }

      setDisplayDimensions({
        width: Math.max(120, Math.floor(targetW)),
        height: Math.max(100, Math.floor(targetH)),
      });
    };

    computeFit();
    const ro = new ResizeObserver(computeFit);
    ro.observe(container.parentElement || container);
    window.addEventListener('resize', computeFit);
    window.addEventListener('orientationchange', computeFit);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeFit);
      window.removeEventListener('orientationchange', computeFit);
    };
  }, [virtualWidth, virtualHeight, isMobile]);

  // Локальные позиции мебели для плавного визуального перемещения
  const [positions, setPositions] = useState<FurniturePositions>({
    houseX: furniture.positions?.houseX ?? DEFAULT_POSITIONS.houseX,
    houseY: furniture.positions?.houseY ?? DEFAULT_POSITIONS.houseY,
    wheelX: furniture.positions?.wheelX ?? DEFAULT_POSITIONS.wheelX,
    wheelY: furniture.positions?.wheelY ?? DEFAULT_POSITIONS.wheelY,
    bowlX: furniture.positions?.bowlX ?? DEFAULT_POSITIONS.bowlX,
    bowlY: Math.min(124, furniture.positions?.bowlY ?? DEFAULT_POSITIONS.bowlY),
    bottleX: furniture.positions?.bottleX ?? DEFAULT_POSITIONS.bottleX,
    bottleY: furniture.positions?.bottleY ?? DEFAULT_POSITIONS.bottleY,
    floor2ToyX: furniture.positions?.floor2ToyX ?? DEFAULT_POSITIONS.floor2ToyX,
    floor2ToyY: furniture.positions?.floor2ToyY ?? DEFAULT_POSITIONS.floor2ToyY,
    floor3ToyX: furniture.positions?.floor3ToyX ?? DEFAULT_POSITIONS.floor3ToyX,
    floor3ToyY: furniture.positions?.floor3ToyY ?? DEFAULT_POSITIONS.floor3ToyY,
  });

  useEffect(() => {
    setPositions({
      houseX: furniture.positions?.houseX ?? DEFAULT_POSITIONS.houseX,
      houseY: furniture.positions?.houseY ?? DEFAULT_POSITIONS.houseY,
      wheelX: furniture.positions?.wheelX ?? DEFAULT_POSITIONS.wheelX,
      wheelY: furniture.positions?.wheelY ?? DEFAULT_POSITIONS.wheelY,
      bowlX: furniture.positions?.bowlX ?? DEFAULT_POSITIONS.bowlX,
      bowlY: Math.min(124, furniture.positions?.bowlY ?? DEFAULT_POSITIONS.bowlY),
      bottleX: furniture.positions?.bottleX ?? DEFAULT_POSITIONS.bottleX,
      bottleY: furniture.positions?.bottleY ?? DEFAULT_POSITIONS.bottleY,
      floor2ToyX: furniture.positions?.floor2ToyX ?? DEFAULT_POSITIONS.floor2ToyX,
      floor2ToyY: furniture.positions?.floor2ToyY ?? DEFAULT_POSITIONS.floor2ToyY,
      floor3ToyX: furniture.positions?.floor3ToyX ?? DEFAULT_POSITIONS.floor3ToyX,
      floor3ToyY: furniture.positions?.floor3ToyY ?? DEFAULT_POSITIONS.floor3ToyY,
    });
  }, [furniture.positions]);

  // Режим перемещения конкретного предмета (активируется двойным кликом / тапом)
  const [editingItem, setEditingItem] = useState<
    'house' | 'wheel' | 'bowl' | 'bottle' | 'floor2Toy' | 'floor3Toy' | null
  >(null);
  const [backupPositions, setBackupPositions] = useState<FurniturePositions | null>(null);

  // Состояние перетаскивания (Drag & Drop)
  const [draggingTarget, setDraggingTarget] = useState<
    'hamster' | 'house' | 'wheel' | 'bowl' | 'bottle' | 'floor2Toy' | 'floor3Toy' | null
  >(null);

  const dragInfoRef = useRef<{
    target: 'hamster' | 'house' | 'wheel' | 'bowl' | 'bottle' | 'floor2Toy' | 'floor3Toy';
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMoved: boolean;
  } | null>(null);

  // Рефы для детекции двойного клика / тапа
  const lastTapRef = useRef<{ time: number; target: string; x: number; y: number } | null>(null);
  const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Состояние активной анимации игрушки при клике
  const [activeToyFloor, setActiveToyFloor] = useState<2 | 3 | null>(null);
  const currentActiveToyFloor = activeToyFloorProp ?? activeToyFloor;

  /**
   * Отрисовка декораций клетки в координатах мира
   */
  const drawScenery = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const cPal = CAGE_COLOR_PALETTES[cageColor] || CAGE_COLOR_PALETTES.silver;

      // 1. Отрисовка всей вертикальной клетки (сетка, каркас, платформы с узором пола и игрушки)
      drawVerticalCageScenery(
        ctx,
        cageTier,
        cageColor,
        time,
        floorStyle,
        tierToys,
        currentActiveToyFloor,
        positions
      );

      // 2. Задняя часть бегового колеса на 1-м этаже (рисуется ДО хомяка)
      drawWheelBackDetailed(
        ctx,
        furniture.wheel || 'classic',
        positions.wheelX,
        positions.wheelY,
        WHEEL_RADIUS,
        wheelAngleRef.current
      );

      // 3. Интерьер домика на 1-м этаже (рисуется ДО хомяка)
      drawHouseInterior(
        ctx,
        furniture.house,
        positions.houseX,
        positions.houseY
      );

      // 4. Глубокий массивный поддон с опилками 1-го этажа (высота 54px: y = 126 .. 180)
      drawPixelRect(ctx, 8, 126, VIRTUAL_WIDTH - 16, 54, cPal.trayBase);
      drawPixelRect(ctx, 6, 124, VIRTUAL_WIDTH - 12, 5, cPal.trayRim);

      // Массивные клипсы-защелки крепления поддона к каркасу
      const latches = [34, 145, 335, 446];
      latches.forEach((lx) => {
        drawPixelRect(ctx, lx, 121, 12, 7, cPal.frameHighlight);
        drawPixelRect(ctx, lx + 2, 122, 8, 5, cPal.frame);
        drawPixelRect(ctx, lx + 4, 124, 4, 2, '#ffffff');
      });

      // Нижний базовый слой: плотные древесные гранулы (пеллеты)
      drawPixelRect(ctx, 10, 156, VIRTUAL_WIDTH - 20, 24, '#78350f');
      ctx.fillStyle = '#451a03';
      for (let x = 14; x < VIRTUAL_WIDTH - 16; x += 12) {
        const py = 160 + ((x * 7) % 15);
        ctx.fillRect(x, py, 5, 3);
        ctx.fillRect(x + 3, py + 1, 2, 2);
      }

      // Средний слой: пышная золотистая стружка
      drawPixelRect(ctx, 10, 134, VIRTUAL_WIDTH - 20, 26, '#f5c66e');
      drawPixelRect(ctx, 10, 132, VIRTUAL_WIDTH - 20, 4, '#fbe09e');

      ctx.fillStyle = '#df9b2d';
      for (let x = 16; x < VIRTUAL_WIDTH - 18; x += 14) {
        const off = (x * 11) % 13;
        ctx.fillRect(x, 138 + (off % 7), 5, 2);
        ctx.fillRect(x + 5, 148 + (off % 6), 4, 2);
        ctx.fillRect(x + 9, 154 + (off % 4), 5, 2);
      }
      ctx.fillStyle = '#fff4cf';
      for (let x = 18; x < VIRTUAL_WIDTH - 18; x += 18) {
        const off = (x * 13) % 9;
        ctx.fillRect(x + off, 139 + (off % 4), 4, 1.5);
        ctx.fillRect(x + 7, 150 + (off % 5), 3, 1.5);
      }

      // Верхний слой: мягкие органические холмики и завитки опилок
      for (let x = 12; x < VIRTUAL_WIDTH - 12; x += 16) {
        const moundH = 4 + ((x * 5) % 6);
        drawPixelRect(ctx, x, 128 - moundH + 4, 18, moundH, '#fde68a');
        drawPixelRect(ctx, x + 2, 127 - moundH + 4, 14, 2, '#fffbeb');
      }

      // 5. Поилка (крепится к прутьям 1-го этажа)
      drawWaterBottleDetailed(
        ctx,
        furniture.waterBottle,
        positions.bottleX,
        positions.bottleY,
        time,
        furniture.bottleWaterLevel ?? 100,
        furniture.drinkColor ?? '#38bdf8'
      );

      // 6. Кормушка (стоит ПОВЕРХ опилок 1-го этажа)
      drawBowlDetailed(
        ctx,
        furniture.bowl,
        furniture.bowlFoodLevel,
        positions.bowlX,
        positions.bowlY
      );
    },
    [furniture, positions, cageTier, cageColor, floorStyle, tierToys, currentActiveToyFloor]
  );

  /**
   * Главный рендер кадра на Canvas
   */
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const now = Date.now();
    const timeSec = now / 1000;
    const isWheeling = behavior === HamsterBehavior.WHEEL;

    if (isWheeling) {
      wheelAngleRef.current += 0.28;
    }

    const curTransition = tunnelTransitionRef?.current ?? tunnelTransition;

    // ========================================================================
    // РАСЧЕТ ПЛАВНОЙ ВЕРТИКАЛЬНОЙ КАМЕРЫ (ДЛЯ ДЕСКТОПА)
    // ========================================================================
    let targetCameraY = 0;
    if (curTransition?.active) {
      targetCameraY = -(posRef.current.y - 110);
    } else {
      if (currentFloor === 1) targetCameraY = 0;
      else if (currentFloor === 2) targetCameraY = 180;
      else if (currentFloor === 3) targetCameraY = 360;
    }

    cameraYRef.current += (targetCameraY - cameraYRef.current) * 0.12;
    const curCameraY = cameraYRef.current;

    // Очистка экрана
    ctx.fillStyle = '#181528';
    ctx.fillRect(0, 0, virtualWidth, virtualHeight);

    // ========================================================================
    // РЕНДЕРИНГ МИРА В СИСТЕМЕ КООРДИНАТ КЛЕТКИ
    // На мобильном: ctx.translate(0, worldOffsetY) - видны все этажи сразу!
    // На десктопе: ctx.translate(0, curCameraY) - вертикальный скролл камеры
    // ========================================================================
    ctx.save();
    ctx.translate(0, isMobile ? worldOffsetY : curCameraY);

    // 1. Декорации клетки, поддон и мебель
    drawScenery(ctx, timeSec);

    // 2. Какашки (на 1-м этаже)
    poops.forEach((p) => {
      drawPoopSprite(ctx, p.x, p.y, 2);
    });

    // 3. Вычисление точных координат хомячка
    const isSleeping = behavior === HamsterBehavior.SLEEP;
    const isEating = behavior === HamsterBehavior.EATING;
    const isDrinking = behavior === HamsterBehavior.DRINKING;
    let hx = Math.floor(posRef.current.x);
    let hy = Math.floor(posRef.current.y);
    let flipX = posRef.current.flipX;

    if (draggingTarget === 'hamster' || curTransition?.active) {
      hx = Math.floor(posRef.current.x);
      hy = Math.floor(posRef.current.y);
    } else if (isWheeling) {
      hx = positions.wheelX - 24;
      hy = positions.wheelY + WHEEL_RADIUS - 44;
      flipX = false;
    } else if (isSleeping) {
      hx = positions.houseX + 25;
      hy = positions.houseY + 38;
      flipX = false;
    } else if (isEating) {
      const isBowlRight = positions.bowlX >= 240;
      hx = isBowlRight ? positions.bowlX - 30 : positions.bowlX + 32;
      hy = 110;
      flipX = !isBowlRight;
    } else if (isDrinking) {
      hx = positions.bottleX - 18;
      hy = 110;
      flipX = false;
    }

    const isSleepingInHouse = isSleeping && draggingTarget !== 'hamster' && !curTransition?.active;
    const isRunningInWheel = isWheeling && draggingTarget !== 'hamster' && !curTransition?.active;

    // 4. ЗАДНИЙ СЛОЙ ДИАГОНАЛЬНЫХ ТУННЕЛЕЙ (ГОФРА)
    // Гофра отображается ТОЛЬКО когда хомячок идет вверх/вниз между этажами!
    if (curTransition?.active && curTransition.opacity > 0.01) {
      drawDiagonalTunnelBack(
        ctx,
        curTransition.tunnelIndex,
        tunnelColor,
        curTransition.opacity
      );
    }

    // 5. Фасад домика рисуется до хомяка при бодрствовании
    if (!isSleepingInHouse) {
      drawHouseExterior(
        ctx,
        furniture.house,
        positions.houseX,
        positions.houseY
      );
    }

    // 6. Передний обод колеса рисуется до хомяка, если он не внутри
    if (!isRunningInWheel) {
      drawWheelFrontDetailed(
        ctx,
        furniture.wheel || 'classic',
        positions.wheelX,
        positions.wheelY,
        WHEEL_RADIUS,
        wheelAngleRef.current,
        false
      );
    }

    // ========================================================================
    // 7. ОТРИСОВКА ХОМЯЧКА
    // ========================================================================
    ctx.save();
    if (isSleepingInHouse) {
      ctx.beginPath();
      ctx.rect(positions.houseX + 25, positions.houseY + 30, 26, 32);
      ctx.clip();
    }

    if (curTransition?.active) {
      const trans = curTransition;
      const geom = DIAGONAL_TUNNELS[trans.tunnelIndex];
      const isGoingUp = trans.toFloor > trans.fromFloor;
      const startX = isGoingUp ? geom.startX : geom.endX;
      const startY = isGoingUp ? geom.startY : geom.endY;
      const endX = isGoingUp ? geom.endX : geom.startX;
      const endY = isGoingUp ? geom.endY : geom.startY;

      const dx = endX - startX;
      const dy = endY - startY;
      const moveAngle = Math.atan2(dy, dx);
      let hamsterAngle = flipX ? moveAngle - Math.PI : moveAngle;
      while (hamsterAngle > Math.PI) hamsterAngle -= 2 * Math.PI;
      while (hamsterAngle < -Math.PI) hamsterAngle += 2 * Math.PI;

      ctx.translate(hx, hy);
      ctx.rotate(hamsterAngle);

      if (chonkScale && chonkScale !== 1.0) {
        ctx.scale(chonkScale, chonkScale);
      }

      const walkStep = Math.floor(timeSec * 10) % 4;
      let walkMatrix = HAMSTER_24_WALK_1;
      if (walkStep === 1) walkMatrix = HAMSTER_24_WALK_2;
      else if (walkStep === 2) walkMatrix = HAMSTER_24_WALK_3;
      else if (walkStep === 3) walkMatrix = HAMSTER_24_WALK_4;

      if (customSprite && customSprite.frames.length > 0) {
        const frameIndex = Math.floor(timeSec * customSprite.fps) % customSprite.frames.length;
        const currentFrame = customSprite.frames[frameIndex];
        drawCustomPixelGrid(ctx, currentFrame, -24, -26, 2, flipX);
      } else {
        drawCharacterMatrix(ctx, walkMatrix, -24, -26, palette, 2, flipX);
      }
    } else {
      if (chonkScale && chonkScale !== 1.0) {
        const cx = isSleepingInHouse ? hx + 13 : hx + 24;
        const cy = isSleepingInHouse ? hy + 12 : hy + 16;
        const effectiveScale = isSleepingInHouse ? Math.min(1.15, chonkScale) : chonkScale;
        ctx.translate(cx, cy);
        ctx.scale(effectiveScale, effectiveScale);
        ctx.translate(-cx, -cy);
      }

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
            const walkStep = Math.floor(timeSec * 6) % 4;
            if (walkStep === 0) currentMatrix = HAMSTER_24_WALK_1;
            else if (walkStep === 1) currentMatrix = HAMSTER_24_WALK_2;
            else if (walkStep === 2) currentMatrix = HAMSTER_24_WALK_3;
            else currentMatrix = HAMSTER_24_WALK_4;
            break;

          case HamsterBehavior.WHEEL:
            currentMatrix =
              Math.floor(timeSec * 9) % 2 === 0
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
            if (isSleepingInHouse) {
              currentMatrix =
                Math.floor(timeSec * 1.5) % 2 === 0
                  ? HAMSTER_SLEEP_PEEK_1
                  : HAMSTER_SLEEP_PEEK_2;
            } else {
              currentMatrix =
                Math.floor(timeSec * 1.5) % 2 === 0
                  ? HAMSTER_24_SLEEP_1
                  : HAMSTER_24_SLEEP_2;
            }
            break;

          case HamsterBehavior.EATING:
            currentMatrix =
              Math.floor(timeSec * 6) % 2 === 0
                ? HAMSTER_24_EAT_1
                : HAMSTER_24_EAT_2;
            break;

          case HamsterBehavior.DRINKING:
            currentMatrix =
              Math.floor(timeSec * 6) % 2 === 0
                ? HAMSTER_24_DRINK_1
                : HAMSTER_24_DRINK_2;
            break;

          case HamsterBehavior.POOPING:
            currentMatrix = HAMSTER_24_POOPING;
            break;

          case HamsterBehavior.PLAYING_TOY:
            currentMatrix =
              Math.floor(timeSec * 5) % 2 === 0
                ? HAMSTER_24_PLAYING_1
                : HAMSTER_24_PLAYING_2;
            break;
        }

        if (draggingTarget === 'hamster') {
          currentMatrix =
            Math.floor(timeSec * 8) % 2 === 0
              ? HAMSTER_24_WALK_2
              : HAMSTER_24_WALK_4;
        }

        drawCharacterMatrix(ctx, currentMatrix, hx, hy, palette, 2, flipX);
      }
    }
    ctx.restore();

    // 8. Фасад домика поверх спящего хомяка
    if (isSleepingInHouse) {
      drawHouseExterior(
        ctx,
        furniture.house,
        positions.houseX,
        positions.houseY
      );
    }

    // 9. Передняя стенка колеса поверх бегущего хомяка
    if (isRunningInWheel) {
      drawWheelFrontDetailed(
        ctx,
        furniture.wheel || 'classic',
        positions.wheelX,
        positions.wheelY,
        WHEEL_RADIUS,
        wheelAngleRef.current,
        true
      );
    }

    // 9.1 Передний край стружки опилок поверх лапок хомячка на 1-м этаже
    const isOnFloor1 = hy >= 90 && hy <= 150;
    if (
      !tunnelTransition?.active &&
      isOnFloor1 &&
      !isSleepingInHouse &&
      !isRunningInWheel &&
      draggingTarget !== 'hamster'
    ) {
      const hamsterFeetX = posRef.current.x;
      const hamsterFeetY = 150;
      ctx.fillStyle = '#fef08a';
      for (let fx = Math.max(16, hamsterFeetX - 8); fx <= Math.min(VIRTUAL_WIDTH - 20, hamsterFeetX + 52); fx += 6) {
        const flakeOff = (fx * 13) % 4;
        ctx.fillRect(fx, hamsterFeetY + flakeOff, 4, 2);
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(fx + 1, hamsterFeetY + flakeOff, 2, 1);
        ctx.fillStyle = '#fef08a';
      }
    }

    // ========================================================================
    // 10. ПЕРЕДНИЙ АКРИЛОВЫЙ СЛОЙ ДИАГОНАЛЬНЫХ ТУННЕЛЕЙ (ГОФРА)
    // Гофра отображается ТОЛЬКО когда хомячок идет вверх/вниз между этажами!
    // ========================================================================
    if (curTransition?.active && curTransition.opacity > 0.01) {
      drawDiagonalTunnelFront(
        ctx,
        curTransition.tunnelIndex,
        tunnelColor,
        curTransition.opacity,
        timeSec,
        tunnelTexture
      );
    }

    // ========================================================================
    // 11. РАМКА ПОДСВЕТКИ ДЛЯ ПЕРЕМЕЩЕНИЯ (ПОСЛЕ ДВОЙНОГО КЛИКА / ТАПА)
    // ========================================================================
    const highlightTarget = editingItem || (draggingTarget && draggingTarget !== 'hamster' ? draggingTarget : null);
    if (highlightTarget) {
      ctx.save();
      const pulseAlpha = 0.65 + 0.35 * Math.sin(timeSec * 7);
      ctx.strokeStyle = 'rgba(254, 228, 64, ' + pulseAlpha + ')';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);

      let bx = 0, by = 0, bw = 0, bh = 0;
      let isCircle = false;
      let rad = 0;

      if (highlightTarget === 'house') {
        bx = positions.houseX - 3;
        by = positions.houseY - 3;
        bw = HOUSE_W + 6;
        bh = HOUSE_H + 6;
      } else if (highlightTarget === 'wheel') {
        isCircle = true;
        bx = positions.wheelX;
        by = positions.wheelY;
        rad = WHEEL_RADIUS + 5;
      } else if (highlightTarget === 'bowl') {
        bx = positions.bowlX - 3;
        by = positions.bowlY - 3;
        bw = 46;
        bh = 24;
      } else if (highlightTarget === 'bottle') {
        bx = positions.bottleX - 3;
        by = positions.bottleY - 3;
        bw = 28;
        bh = 64;
      } else if (highlightTarget === 'floor2Toy') {
        const f2X = positions.floor2ToyX ?? 235;
        const f2Y = positions.floor2ToyY ?? -28;
        bx = f2X - 28;
        by = f2Y - 36;
        bw = 56;
        bh = 38;
      } else if (highlightTarget === 'floor3Toy') {
        const f3X = positions.floor3ToyX ?? 145;
        const f3Y = positions.floor3ToyY ?? -208;
        bx = f3X - 28;
        by = f3Y - 38;
        bw = 56;
        bh = 40;
      }

      if (isCircle) {
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(bx, by, bw, bh);

        // Угловые неоновые скобки
        ctx.setLineDash([]);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        const cornerLen = 6;
        // Верхний левый
        ctx.beginPath();
        ctx.moveTo(bx, by + cornerLen); ctx.lineTo(bx, by); ctx.lineTo(bx + cornerLen, by); ctx.stroke();
        // Верхний правый
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerLen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cornerLen); ctx.stroke();
        // Нижний левый
        ctx.beginPath();
        ctx.moveTo(bx, by + bh - cornerLen); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cornerLen, by + bh); ctx.stroke();
        // Нижний правый
        ctx.beginPath();
        ctx.moveTo(bx + bw - cornerLen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cornerLen); ctx.stroke();
      }
      ctx.restore();
    }

    // 12. Частицы
    particles.forEach((p) => {
      if (p.char) {
        const ok = drawPixelEmoji(ctx, p.char, p.x, p.y, 1);
        if (!ok) {
          ctx.font = '10px sans-serif';
          ctx.fillText(p.char, Math.floor(p.x), Math.floor(p.y));
        }
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }
    });

    // 13. Спич-бабблы
    emotes.forEach((e) => {
      const bubbleCenterX = isSleepingInHouse ? positions.houseX + 38 : hx + 24;
      const bubbleCenterY = isSleepingInHouse
        ? positions.houseY + 20 + e.offsetY
        : hy - 14 + e.offsetY;
      drawPixelSpeechBubble(ctx, bubbleCenterX, bubbleCenterY, e.emoji, e.opacity);
    });

    ctx.restore(); // Конец трансформации мира с камерой
  }, [
    behavior,
    chonkScale,
    customSprite,
    drawScenery,
    emotes,
    furniture,
    palette,
    particles,
    poops,
    posRef,
    positions,
    draggingTarget,
    editingItem,
    cageTier,
    cageColor,
    tunnelColor,
    tunnelTexture,
    floorStyle,
    tierToys,
    activeToyFloor,
    currentFloor,
    tunnelTransition,
    isMobile,
    virtualWidth,
    virtualHeight,
    worldOffsetY,
  ]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderFrame();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderFrame]);

  // -------------------------------------------------------------------------
  // ПРЕОБРАЗОВАНИЕ КООРДИНАТ С УЧЕТОМ ЭКРАНА И МИРА
  // -------------------------------------------------------------------------
  const getVirtualCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { screenX: 0, screenY: 0, vx: 0, vy: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = (clientX - rect.left) * (virtualWidth / rect.width);
    const screenY = (clientY - rect.top) * (virtualHeight / rect.height);
    return {
      screenX,
      screenY,
      vx: screenX,
      vy: isMobile ? screenY - worldOffsetY : screenY - cameraYRef.current,
    };
  };

  /**
   * Определение предмета под курсором / пальцем в мировых координатах
   */
  const getItemAtCoord = (
    vx: number,
    vy: number
  ): 'hamster' | 'house' | 'wheel' | 'bowl' | 'bottle' | 'floor2Toy' | 'floor3Toy' | null => {
    // 1. Игрушка 3-го этажа
    if (cageTier === 3) {
      const f3ToyX = positions.floor3ToyX ?? 145;
      const f3ToyY = positions.floor3ToyY ?? -208;
      if (Math.hypot(vx - f3ToyX, vy - (f3ToyY - 16)) < 32) return 'floor3Toy';
    }

    // 2. Игрушка 2-го этажа
    if (cageTier >= 2) {
      const f2ToyX = positions.floor2ToyX ?? 235;
      const f2ToyY = positions.floor2ToyY ?? -28;
      if (Math.hypot(vx - f2ToyX, vy - (f2ToyY - 14)) < 32) return 'floor2Toy';
    }

    // 3. Хомячок
    const isWheeling = behavior === HamsterBehavior.WHEEL;
    const isSleeping = behavior === HamsterBehavior.SLEEP;
    const hx = isWheeling
      ? positions.wheelX - 24
      : isSleeping
      ? positions.houseX + 26
      : posRef.current.x;
    const hy = isWheeling
      ? positions.wheelY + WHEEL_RADIUS - 44
      : isSleeping
      ? positions.houseY + 26
      : posRef.current.y;

    if (vx >= hx - 8 && vx <= hx + 56 && vy >= hy - 8 && vy <= hy + 42) {
      return 'hamster';
    }

    // 4. Поилка
    if (
      vx >= positions.bottleX - 8 &&
      vx <= positions.bottleX + 30 &&
      vy >= positions.bottleY - 6 &&
      vy <= positions.bottleY + 66
    ) {
      return 'bottle';
    }

    // 5. Кормушка
    if (
      vx >= positions.bowlX - 6 &&
      vx <= positions.bowlX + 46 &&
      vy >= positions.bowlY - 6 &&
      vy <= positions.bowlY + 26
    ) {
      return 'bowl';
    }

    // 6. Домик
    if (
      vx >= positions.houseX - 4 &&
      vx <= positions.houseX + HOUSE_W + 4 &&
      vy >= positions.houseY - 4 &&
      vy <= positions.houseY + HOUSE_H + 4
    ) {
      return 'house';
    }

    // 7. Беговое колесо
    if (Math.hypot(vx - positions.wheelX, vy - positions.wheelY) <= WHEEL_RADIUS + 10) {
      return 'wheel';
    }

    return null;
  };

  const getOriginX = (target: string) => {
    switch (target) {
      case 'house': return positions.houseX;
      case 'wheel': return positions.wheelX;
      case 'bowl': return positions.bowlX;
      case 'bottle': return positions.bottleX;
      case 'floor2Toy': return positions.floor2ToyX ?? 235;
      case 'floor3Toy': return positions.floor3ToyX ?? 145;
      default: return 0;
    }
  };

  const getOriginY = (target: string) => {
    switch (target) {
      case 'house': return positions.houseY;
      case 'wheel': return positions.wheelY;
      case 'bowl': return positions.bowlY;
      case 'bottle': return positions.bottleY;
      case 'floor2Toy': return positions.floor2ToyY ?? -28;
      case 'floor3Toy': return positions.floor3ToyY ?? -208;
      default: return 0;
    }
  };

  // -------------------------------------------------------------------------
  // ОБРАБОТЧИКИ POINTER EVENTS (ТАЧ + МЫШЬ)
  // -------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { screenX, screenY, vx, vy } = getVirtualCoords(e.clientX, e.clientY);

    // 1. Уборка какашек кликом
    for (const poop of poops) {
      if (Math.hypot(vx - (poop.x + 6), vy - (poop.y + 4)) < 18) {
        onCleanPoop(poop.id);
        return;
      }
    }

    const hitTarget = getItemAtCoord(vx, vy);

    // ========================================================================
    // ТРЕБОВАНИЕ: "а хомячка просто зажать и двигать"
    // ХОМЯЧОК: Прямой Drag & Drop без двойных кликов!
    // ========================================================================
    if (hitTarget === 'hamster') {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }

      const isWheeling = behavior === HamsterBehavior.WHEEL;
      const isSleeping = behavior === HamsterBehavior.SLEEP;
      const hx = isWheeling
        ? positions.wheelX - 24
        : isSleeping
        ? positions.houseX + 26
        : posRef.current.x;
      const hy = isWheeling
        ? positions.wheelY + WHEEL_RADIUS - 44
        : isSleeping
        ? positions.houseY + 26
        : posRef.current.y;

      dragInfoRef.current = {
        target: 'hamster',
        startX: vx,
        startY: vy,
        originX: hx,
        originY: hy,
        hasMoved: false,
      };
      setDraggingTarget('hamster');
      onPickUpHamster?.();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
      return;
    }

    // ========================================================================
    // ТРЕБОВАНИЕ: "а чтобы что то перемещать - два клика по предметы
    // и потом на галочку нажать чтобы применить"
    // ========================================================================
    // СЛУЧАЙ А: Предмет УЖЕ находится в режиме перемещения -> перетаскиваем его
    if (editingItem && (hitTarget === editingItem || !hitTarget)) {
      dragInfoRef.current = {
        target: editingItem,
        startX: vx,
        startY: vy,
        originX: getOriginX(editingItem),
        originY: getOriginY(editingItem),
        hasMoved: false,
      };
      setDraggingTarget(editingItem);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
      return;
    }

    // СЛУЧАЙ Б: Клик по мебели / игрушке (не в режиме редактирования)
    if (hitTarget) {
      const now = Date.now();
      const lastTap = lastTapRef.current;
      const isDoubleTap =
        lastTap &&
        lastTap.target === hitTarget &&
        now - lastTap.time < 420 &&
        Math.hypot(vx - lastTap.x, vy - lastTap.y) < 40;

      if (isDoubleTap) {
        // ДВОЙНОЙ КЛИК / ТАП ОБНАРУЖЕН! ВХОДИМ В РЕЖИМ ПЕРЕМЕЩЕНИЯ!
        if (singleTapTimeoutRef.current) {
          clearTimeout(singleTapTimeoutRef.current);
          singleTapTimeoutRef.current = null;
        }
        lastTapRef.current = null;
        soundManager.playClickSound();
        setEditingItem(hitTarget);
        setBackupPositions({ ...positions });

        dragInfoRef.current = {
          target: hitTarget,
          startX: vx,
          startY: vy,
          originX: getOriginX(hitTarget),
          originY: getOriginY(hitTarget),
          hasMoved: false,
        };
        setDraggingTarget(hitTarget);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch (_) {}
        return;
      } else {
        // Первый клик / тап: запоминаем и взводим таймер обычного действия
        lastTapRef.current = { time: now, target: hitTarget, x: vx, y: vy };
        if (singleTapTimeoutRef.current) {
          clearTimeout(singleTapTimeoutRef.current);
        }
        singleTapTimeoutRef.current = setTimeout(() => {
          singleTapTimeoutRef.current = null;
          // Одиночное действие
          if (hitTarget === 'wheel') {
            onTapWheel();
          } else if (hitTarget === 'house') {
            onTapHouse?.();
          } else if (hitTarget === 'bowl') {
            onTapBowl?.();
          } else if (hitTarget === 'bottle') {
            onTapBottle?.();
          } else if (hitTarget === 'floor2Toy') {
            onTapFloorToy?.(2, tierToys.floor2Toy);
            setActiveToyFloor(2);
            setTimeout(() => setActiveToyFloor((prev) => (prev === 2 ? null : prev)), 1500);
            soundManager.playClickSound();
          } else if (hitTarget === 'floor3Toy') {
            onTapFloorToy?.(3, tierToys.floor3Toy);
            setActiveToyFloor(3);
            setTimeout(() => setActiveToyFloor((prev) => (prev === 3 ? null : prev)), 1500);
            soundManager.playClickSound();
          }
        }, 260);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragInfoRef.current) return;
    const { vx, vy } = getVirtualCoords(e.clientX, e.clientY);
    const dx = vx - dragInfoRef.current.startX;
    const dy = vy - dragInfoRef.current.startY;

    if (Math.hypot(dx, dy) > 3) {
      dragInfoRef.current.hasMoved = true;
    }

    if (!dragInfoRef.current.hasMoved) return;

    const target = dragInfoRef.current.target;

    if (target === 'hamster') {
      // Плавное свободное перемещение хомячка между всеми этажами!
      const nextX = Math.max(16, Math.min(VIRTUAL_WIDTH - 60, dragInfoRef.current.originX + dx));
      const minY = cageTier === 3 ? -270 : cageTier === 2 ? -90 : 6;
      const nextY = Math.max(minY, Math.min(136, dragInfoRef.current.originY + dy));
      posRef.current.x = nextX;
      posRef.current.y = nextY;
      posRef.current.targetX = nextX;
      posRef.current.vx = 0;
    } else if (target === 'house') {
      const nextX = Math.max(10, Math.min(VIRTUAL_WIDTH - HOUSE_W - 10, dragInfoRef.current.originX + dx));
      const nextY = Math.max(30, Math.min(100, dragInfoRef.current.originY + dy));
      setPositions((prev) => ({ ...prev, houseX: Math.round(nextX), houseY: Math.round(nextY) }));
    } else if (target === 'wheel') {
      const nextX = Math.max(44, Math.min(VIRTUAL_WIDTH - 44, dragInfoRef.current.originX + dx));
      const nextY = Math.max(45, Math.min(95, dragInfoRef.current.originY + dy));
      setPositions((prev) => ({ ...prev, wheelX: Math.round(nextX), wheelY: Math.round(nextY) }));
    } else if (target === 'bowl') {
      const nextX = Math.max(16, Math.min(VIRTUAL_WIDTH - 48, dragInfoRef.current.originX + dx));
      const nextY = Math.max(90, Math.min(124, dragInfoRef.current.originY + dy));
      setPositions((prev) => ({ ...prev, bowlX: Math.round(nextX), bowlY: Math.round(nextY) }));
    } else if (target === 'bottle') {
      const nextX = Math.max(20, Math.min(VIRTUAL_WIDTH - 32, dragInfoRef.current.originX + dx));
      const nextY = Math.max(16, Math.min(65, dragInfoRef.current.originY + dy));
      setPositions((prev) => ({ ...prev, bottleX: Math.round(nextX), bottleY: Math.round(nextY) }));
    } else if (target === 'floor2Toy') {
      const nextX = Math.max(40, Math.min(430, dragInfoRef.current.originX + dx));
      setPositions((prev) => ({ ...prev, floor2ToyX: Math.round(nextX) }));
    } else if (target === 'floor3Toy') {
      const nextX = Math.max(40, Math.min(390, dragInfoRef.current.originX + dx));
      setPositions((prev) => ({ ...prev, floor3ToyX: Math.round(nextX) }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (!dragInfoRef.current) return;

    const { target, hasMoved } = dragInfoRef.current;
    dragInfoRef.current = null;
    setDraggingTarget(null);

    // Хомячок: отпускание
    if (target === 'hamster') {
      if (hasMoved) {
        const dropX = Math.max(16, Math.min(VIRTUAL_WIDTH - 60, posRef.current.x));
        const dropY = Math.round(posRef.current.y);
        onDropHamster?.(dropX, dropY);
      } else {
        onPet();
      }
    }
    // Если перемещался предмет мебели: он остается на новой позиции до нажатия "✓ Применить"
  };

  /**
   * Подтверждение новой позиции мебели галочкой
   */
  const handleApplyFurnitureMove = () => {
    onUpdateFurniturePositions?.(positions);
    soundManager.playSuccessJingle();
    setEditingItem(null);
    setBackupPositions(null);
  };

  /**
   * Отмена перемещения мебели
   */
  const handleCancelFurnitureMove = () => {
    if (backupPositions) {
      setPositions(backupPositions);
    }
    soundManager.playClickSound();
    setEditingItem(null);
    setBackupPositions(null);
  };

  const getItemLabel = (item: string) => {
    switch (item) {
      case 'house': return '🏠 Домик';
      case 'wheel': return '🎡 Колесо';
      case 'bowl': return '🥣 Кормушка';
      case 'bottle': return '🍼 Поилка';
      case 'floor2Toy': return '🎪 Игрушка 2-го эт.';
      case 'floor3Toy': return '🔭 Игрушка 3-го эт.';
      default: return 'Предмет';
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-lg overflow-hidden border-2 sm:border-4 border-black shadow-pixel-lg bg-black select-none group flex items-center justify-center m-auto transition-[width,height] duration-75"
      style={{
        width: `${displayDimensions.width}px`,
        height: `${displayDimensions.height}px`,
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      {/* Подсказка вверху слева */}
      <div className="absolute top-1.5 left-2 z-10 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity text-[7px] text-retro-cyan font-pixel bg-black/70 px-1.5 py-0.5 rounded border border-black/40">
        {isMobile ? '🐹 Зажми хомяка | 2 клика по вещи' : '✋ Хватай хомяка | 2 клика для мебели'}
      </div>

      {/* ПОЛУПРОЗРАЧНЫЕ КНОПКИ ПЕРЕКЛЮЧЕНИЯ ЭТАЖЕЙ: 1; 2; 3; */}
      {cageTier >= 2 && (
        <div className="absolute top-1.5 right-2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-lg border border-retro-cyan/40 shadow-pixel-sm">
          <span className="text-[7px] sm:text-[8px] font-pixel text-retro-cyan font-bold pr-0.5">
            ЭТАЖ:
          </span>
          {Array.from({ length: cageTier }, (_, i) => (i + 1) as 1 | 2 | 3).map((floor) => {
            const isActive = currentFloor === floor;
            const isTransitioningTo =
              tunnelTransition?.active && tunnelTransition.toFloor === floor;

            return (
              <button
                key={floor}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundManager.playClickSound();
                  onRequestFloorChange?.(floor);
                }}
                disabled={isActive && !tunnelTransition?.active}
                className={`px-1.5 sm:px-2 py-0.5 rounded font-pixel text-[8px] sm:text-[9px] font-bold border transition-all active:scale-95 ${
                  isActive
                    ? 'bg-retro-yellow text-black border-retro-yellow shadow-[0_0_6px_rgba(254,228,64,0.7)] cursor-default'
                    : isTransitioningTo
                    ? 'bg-retro-cyan text-black border-white animate-pulse'
                    : 'bg-white/10 hover:bg-white/25 text-white/90 border-white/20 hover:border-retro-cyan/60'
                }`}
                title={`Переместить хомячка на ${floor}-й этаж`}
              >
                {floor}
              </button>
            );
          })}
        </div>
      )}

      {/* ПЛАВАЮЩАЯ ПАНЕЛЬ ПОДТВЕРЖДЕНИЯ ПЕРЕМЕЩЕНИЯ (ПОСЛЕ ДВОЙНОГО КЛИКА) */}
      {editingItem && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#181425]/95 border-2 border-retro-yellow px-2.5 py-1.5 rounded-lg shadow-pixel text-white font-pixel text-[8px] sm:text-[9px] animate-fadeIn">
          <span className="text-retro-yellow font-bold whitespace-nowrap">
            {getItemLabel(editingItem)}
          </span>
          <button
            type="button"
            onClick={handleApplyFurnitureMove}
            className="px-2.5 py-1 bg-retro-green hover:brightness-110 text-black font-pixel font-bold rounded flex items-center gap-1 border border-black shadow-pixel-sm active:translate-y-0.5"
            title="Применить новую позицию"
          >
            <span>✓</span>
            <span>Применить</span>
          </button>
          <button
            type="button"
            onClick={handleCancelFurnitureMove}
            className="px-2 py-1 bg-retro-red/80 hover:bg-retro-red text-white font-pixel rounded flex items-center gap-1 border border-black shadow-pixel-sm active:translate-y-0.5"
            title="Отменить перемещение"
          >
            <span>✕</span>
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={virtualWidth}
        height={virtualHeight}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-full h-full block ${
          draggingTarget ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          touchAction: 'none',
        }}
      />
    </div>
  );
};
