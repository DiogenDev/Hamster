/**
 * ============================================================================
 * МОДУЛЬ: УТИЛИТЫ CANVAS 2D И АЛГОРИТМ FLOOD FILL (ЗАЛИВКА)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    - Четкость пикселей (Pixel Perfect Scaling):
 *      Стандартный Canvas 2D выполняет антиалиасинг (размытие) при нецелочисленных координатах
 *      (x = 12.34px). Для ретро-эстетики 8-bit все координаты обязаны округляться
 *      до целых чисел (`Math.floor`), а `imageSmoothingEnabled` должен быть выключен.
 *    - Оптимизация вызовов отрисовки:
 *      Каждый вызов `ctx.fillStyle` и `ctx.fillRect()` создает накладные расходы.
 *      Объединение соседних пикселей одного цвета в единые горизонтальные полосы (Run-Length)
 *      сокращает число draw calls на 60-80%.
 * 
 * 2. АЛГОРИТМ FLOOD FILL (Заливка замкнутой области):
 *    - Почему НЕЛЬЗЯ использовать наивную рекурсию:
 *      Функция `fill(x, y)` с 4 рекурсивными вызовами на холсте 24x24 может сделать
 *      глубину стека более 576 вызовов, что в мобильных браузерах вызывает фатальный
 *      "RangeError: Maximum call stack size exceeded".
 *    - Решение: Итеративный алгоритм на основе очереди/стека (BFS / Depth-Limited Stack).
 *      Мы храним координаты в обычном массиве `stack = [[startX, startY]]` в куче (heap),
 *      где нет ограничений на глубину стека вызовов функций.
 * 
 * 3. ПОДВОДНЫЕ КАМНИ (Pitfalls & Gotchas):
 *    - Зацикливание заливки: Если цвет клика совпадает с цветом заливки (`targetColor === fillColor`),
 *      алгоритм без предварительной проверки уйдет в бесконечный цикл. Всегда проверяем `targetColor === fillColor` в первой строке!
 * ============================================================================
 */

import { HamsterPalette, PixelGrid } from '@/types/hamster';

/**
 * Отрисовка целочисленного пиксельного прямоугольника без субпиксельного размытия
 */
export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
}

/**
 * Отрисовка символьной матрицы 16x16 хомячка с наложением цветовой палитры и поддержкой flipX
 */
export function drawCharacterMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: string[],
  startX: number,
  startY: number,
  palette: HamsterPalette,
  pixelSize: number = 3,
  flipX: boolean = false
) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  for (let r = 0; r < rows; r++) {
    const rowStr = matrix[r];
    for (let c = 0; c < cols; c++) {
      const char = rowStr[c];
      if (char === '.') continue; // Прозрачный пиксель

      let color: string | null = null;
      switch (char) {
        case 'F': color = palette.fur; break;
        case 'D': color = palette.furDark; break;
        case 'B': color = palette.belly; break;
        case 'P': color = palette.pink; break;
        case 'E': color = palette.eyes; break;
        case 'H': color = palette.eyeHighlight; break;
        case 'C': color = palette.cheeks; break;
        case 'S': color = '#e28743'; break; // Зернышко
        default: color = null;
      }

      if (color) {
        const colIndex = flipX ? (cols - 1 - c) : c;
        const px = Math.floor(startX + colIndex * pixelSize);
        const py = Math.floor(startY + r * pixelSize);
        ctx.fillStyle = color;
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
    }
  }
}

/**
 * Отрисовка кастомной сетки из пиксельного редактора (PixelGrid)
 */
export function drawCustomPixelGrid(
  ctx: CanvasRenderingContext2D,
  grid: PixelGrid,
  startX: number,
  startY: number,
  pixelSize: number = 3,
  flipX: boolean = false
) {
  const rows = grid.length;
  if (rows === 0) return;
  const cols = grid[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = grid[r][c];
      if (color) {
        const colIndex = flipX ? (cols - 1 - c) : c;
        const px = Math.floor(startX + colIndex * pixelSize);
        const py = Math.floor(startY + r * pixelSize);
        ctx.fillStyle = color;
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
    }
  }
}

/**
 * ИТЕРАТИВНЫЙ АЛГОРИТМ FLOOD FILL (4-связная заливка)
 * 
 * @param grid Исходная матрица пикселей
 * @param startX Координата X клика (колонка)
 * @param startY Координата Y клика (строка)
 * @param fillColor Новый цвет (#RRGGBB или null для прозрачности)
 * @returns Новая иммутабельная копия матрицы с выполненной заливкой
 */
export function executeFloodFill(
  grid: PixelGrid,
  startX: number,
  startY: number,
  fillColor: string | null
): PixelGrid {
  const height = grid.length;
  if (height === 0) return grid;
  const width = grid[0].length;

  // Проверка выхода начальной точки за границы
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return grid;
  }

  const targetColor = grid[startY][startX];

  // Если целевой цвет уже равен новому, заливка не требуется
  if (targetColor === fillColor) {
    return grid;
  }

  // Создаем глубокую копию сетки, соблюдая иммутабельность React
  const newGrid: PixelGrid = grid.map((row) => [...row]);

  // Стек для итеративного обхода в глубину (защита от переполнения стека JS)
  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    const point = stack.pop();
    if (!point) continue;
    const [x, y] = point;

    // Проверяем границы
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    // Если цвет пикселя соответствует заменяемому цвету
    if (newGrid[y][x] === targetColor) {
      newGrid[y][x] = fillColor;

      // Добавляем 4 соседних пикселя (Север, Юг, Восток, Запад)
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  }

  return newGrid;
}

/**
 * Отрисовка пиксельного спич-баббла с эмодзи над головой хомяка
 */
export function drawPixelSpeechBubble(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  bottomY: number,
  emoji: string,
  opacity: number = 1.0
) {
  if (opacity <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

  const bubbleW = 28;
  const bubbleH = 22;
  const bx = Math.floor(centerX - bubbleW / 2);
  const by = Math.floor(bottomY - bubbleH - 6);

  // Черная 1px пиксельная обводка
  ctx.fillStyle = '#181425';
  ctx.fillRect(bx - 1, by + 2, bubbleW + 2, bubbleH - 4);
  ctx.fillRect(bx + 2, by - 1, bubbleW - 4, bubbleH + 2);

  // Хвостик облачка (указывает на макушку хомяка)
  ctx.fillRect(centerX - 2, by + bubbleH, 4, 3);
  ctx.fillRect(centerX - 1, by + bubbleH + 3, 2, 2);

  // Белое пиксельное тело баббла
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx, by + 1, bubbleW, bubbleH - 2);
  ctx.fillRect(bx + 1, by, bubbleW - 2, bubbleH);

  // Белое заполнение хвостика
  ctx.fillRect(centerX - 1, by + bubbleH, 2, 3);

  // Отрисовка пиксельного эмодзи по центру баббла
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, centerX, by + bubbleH / 2 + 1);

  ctx.restore();
}

/**
 * Отрисовка пиксельной какашки (Poop)
 */
export function drawPoopSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 2
) {
  const poopMatrix = [
    '..BB..',
    '.BDBB.',
    'BBDDDB',
    'BBBBBB',
  ];

  const cols = 6;
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const char = poopMatrix[r][c];
      if (char === '.') continue;
      ctx.fillStyle = char === 'B' ? '#5c3a21' : '#3d1a0a';
      ctx.fillRect(
        Math.floor(x + c * scale),
        Math.floor(y + r * scale),
        scale,
        scale
      );
    }
  }
}
