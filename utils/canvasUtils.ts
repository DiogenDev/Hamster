/**
 * ============================================================================
 * МОДУЛЬ: УТИЛИТЫ CANVAS 2D И АЛГОРИТМ FLOOD FILL (V2)
 * ============================================================================
 */

import { HamsterPalette, PixelGrid } from '@/types/hamster';

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
 * Отрисовка символьной матрицы (16x16 или 24x24) хомячка с наложением палитры и поддержкой flipX
 */
export function drawCharacterMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: string[],
  startX: number,
  startY: number,
  palette: HamsterPalette,
  pixelSize: number = 2,
  flipX: boolean = false
) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  for (let r = 0; r < rows; r++) {
    const rowStr = matrix[r];
    for (let c = 0; c < cols; c++) {
      const char = rowStr[c];
      if (char === '.') continue;

      let color: string | null = null;
      switch (char) {
        case 'F': color = palette.fur; break;
        case 'D': color = palette.furDark; break;
        case 'L': color = palette.furLight || palette.fur; break;
        case 'B': color = palette.belly; break;
        case 'P': color = palette.pink; break;
        case 'E': color = palette.eyes; break;
        case 'H': color = palette.eyeHighlight; break;
        case 'C': color = palette.cheeks; break;
        case 'W': color = '#e2e8f0'; break; // Усики
        case 'S': color = '#d97706'; break; // Зернышко
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
  pixelSize: number = 2,
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

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return grid;
  }

  const targetColor = grid[startY][startX];
  if (targetColor === fillColor) {
    return grid;
  }

  const newGrid: PixelGrid = grid.map((row) => [...row]);
  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    const point = stack.pop();
    if (!point) continue;
    const [x, y] = point;

    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    if (newGrid[y][x] === targetColor) {
      newGrid[y][x] = fillColor;
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

  // Хвостик
  ctx.fillRect(centerX - 2, by + bubbleH, 4, 3);
  ctx.fillRect(centerX - 1, by + bubbleH + 3, 2, 2);

  // Белое заполнение
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx, by + 1, bubbleW, bubbleH - 2);
  ctx.fillRect(bx + 1, by, bubbleW - 2, bubbleH);
  ctx.fillRect(centerX - 1, by + bubbleH, 2, 3);

  // Эмодзи
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
