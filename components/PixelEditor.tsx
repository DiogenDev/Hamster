/**
 * ============================================================================
 * КОМПОНЕНТ: PixelEditor (Встроенная Студия Пиксель-Арта 24x24 / 16x16)
 * ============================================================================
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PixelGrid,
  CustomSpriteData,
  PixelEditorTool,
} from '@/types/hamster';
import { executeFloodFill } from '@/utils/canvasUtils';
import { soundManager } from '@/utils/soundEffects';

export interface PixelEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomSprite: (sprite: CustomSpriteData) => void;
  onResetToDefaultSkin: () => void;
  initialCustomSprite: CustomSpriteData | null;
}

const PALETTE_SWATCHES = [
  '#000000', '#1D2B53', '#7E2553', '#008751',
  '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436',
  '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
  '#ffffff', '#e69138', '#b45f06', '#f4cccc',
];

function createEmptyGrid(size: number): PixelGrid {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );
}

export const PixelEditor: React.FC<PixelEditorProps> = ({
  isOpen,
  onClose,
  onApplyCustomSprite,
  onResetToDefaultSkin,
  initialCustomSprite,
}) => {
  const [gridSize, setGridSize] = useState<number>(24);
  const [frames, setFrames] = useState<PixelGrid[]>([
    createEmptyGrid(24),
    createEmptyGrid(24),
    createEmptyGrid(24),
  ]);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<PixelEditorTool>('pencil');
  const [selectedColor, setSelectedColor] = useState<string>('#e69138');
  const [fps, setFps] = useState<number>(4);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const [previewFrameIndex, setPreviewFrameIndex] = useState<number>(0);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (initialCustomSprite && initialCustomSprite.frames.length > 0) {
      setGridSize(initialCustomSprite.width);
      setFrames(initialCustomSprite.frames);
      setFps(initialCustomSprite.fps || 4);
    }
  }, [initialCustomSprite, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPreviewFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [frames.length, fps, isOpen]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tileSize = 4;
    for (let r = 0; r < canvas.height / tileSize; r++) {
      for (let c = 0; c < canvas.width / tileSize; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#3a4466' : '#262b44';
        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
      }
    }

    const currentFrame = frames[previewFrameIndex];
    if (!currentFrame) return;

    const pixelScale = canvas.width / gridSize;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const color = currentFrame[r]?.[c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * pixelScale, r * pixelScale, pixelScale, pixelScale);
        }
      }
    }
  }, [frames, previewFrameIndex, gridSize]);

  const handleCellAction = useCallback(
    (r: number, c: number) => {
      const currentGrid = frames[activeFrameIndex];
      if (!currentGrid) return;

      if (activeTool === 'pencil') {
        const next = currentGrid.map((row, rowIdx) =>
          rowIdx === r
            ? row.map((cell, colIdx) => (colIdx === c ? selectedColor : cell))
            : [...row]
        );
        setFrames((prev) =>
          prev.map((f, i) => (i === activeFrameIndex ? next : f))
        );
      } else if (activeTool === 'eraser') {
        const next = currentGrid.map((row, rowIdx) =>
          rowIdx === r
            ? row.map((cell, colIdx) => (colIdx === c ? null : cell))
            : [...row]
        );
        setFrames((prev) =>
          prev.map((f, i) => (i === activeFrameIndex ? next : f))
        );
      } else if (activeTool === 'fill') {
        const filled = executeFloodFill(currentGrid, c, r, selectedColor);
        setFrames((prev) =>
          prev.map((f, i) => (i === activeFrameIndex ? filled : f))
        );
        soundManager.playClickSound();
      } else if (activeTool === 'dropper') {
        const picked = currentGrid[r]?.[c];
        if (picked) {
          setSelectedColor(picked);
          setActiveTool('pencil');
          soundManager.playClickSound();
        }
      }
    },
    [frames, activeFrameIndex, activeTool, selectedColor]
  );

  const handleClearFrame = () => {
    setFrames((prev) =>
      prev.map((f, i) =>
        i === activeFrameIndex ? createEmptyGrid(gridSize) : f
      )
    );
    soundManager.playClickSound();
  };

  const handleCopyPrevFrame = () => {
    if (activeFrameIndex === 0) return;
    const prevFrame = frames[activeFrameIndex - 1];
    setFrames((prev) =>
      prev.map((f, i) =>
        i === activeFrameIndex ? prevFrame.map((r) => [...r]) : f
      )
    );
    soundManager.playClickSound();
  };

  const handleSaveAndApply = () => {
    const customData: CustomSpriteData = {
      id: `custom_${Date.now()}`,
      name: 'Мой пиксельный хомяк',
      width: gridSize,
      height: gridSize,
      frames,
      fps,
      createdAt: Date.now(),
    };

    onApplyCustomSprite(customData);
    soundManager.playSuccessJingle();
    onClose();
  };

  const handleExportPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = gridSize * 8;
    canvas.height = gridSize * 8;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    const currentFrame = frames[activeFrameIndex];
    const scale = 8;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const color = currentFrame[r]?.[c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `hamster_sprite_${activeFrameIndex + 1}.png`;
    a.click();
    soundManager.playClickSound();
  };

  if (!isOpen) return null;

  const currentFrame = frames[activeFrameIndex] || createEmptyGrid(gridSize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-retro-dark border-4 border-retro-purple rounded-lg max-w-4xl w-full p-5 sm:p-6 shadow-pixel-lg text-white font-pixel max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b-2 border-retro-blue mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl text-retro-yellow">🎨</span>
            <h2 className="text-xs sm:text-sm text-retro-yellow">
              Pixel Art Studio (Мастерская Спрайтов)
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="text-retro-grey hover:text-white px-2 py-1 bg-retro-purple border-2 border-black rounded"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Инструменты */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <div className="bg-retro-purple p-2.5 rounded border-2 border-black">
              <h3 className="text-[10px] text-retro-cyan mb-2">ИНСТРУМЕНТЫ</h3>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    setActiveTool('pencil');
                    soundManager.playClickSound();
                  }}
                  className={`py-1.5 px-1 text-[9px] border-2 border-black rounded flex items-center justify-center gap-1 ${
                    activeTool === 'pencil'
                      ? 'bg-retro-yellow text-black font-bold shadow-pixel-sm'
                      : 'bg-retro-blue text-white'
                  }`}
                >
                  ✏️ Перо
                </button>
                <button
                  onClick={() => {
                    setActiveTool('eraser');
                    soundManager.playClickSound();
                  }}
                  className={`py-1.5 px-1 text-[9px] border-2 border-black rounded flex items-center justify-center gap-1 ${
                    activeTool === 'eraser'
                      ? 'bg-retro-yellow text-black font-bold shadow-pixel-sm'
                      : 'bg-retro-blue text-white'
                  }`}
                >
                  🧹 Ластик
                </button>
                <button
                  onClick={() => {
                    setActiveTool('fill');
                    soundManager.playClickSound();
                  }}
                  className={`py-1.5 px-1 text-[9px] border-2 border-black rounded flex items-center justify-center gap-1 ${
                    activeTool === 'fill'
                      ? 'bg-retro-yellow text-black font-bold shadow-pixel-sm'
                      : 'bg-retro-blue text-white'
                  }`}
                >
                  🪣 Заливка
                </button>
                <button
                  onClick={() => {
                    setActiveTool('dropper');
                    soundManager.playClickSound();
                  }}
                  className={`py-1.5 px-1 text-[9px] border-2 border-black rounded flex items-center justify-center gap-1 ${
                    activeTool === 'dropper'
                      ? 'bg-retro-yellow text-black font-bold shadow-pixel-sm'
                      : 'bg-retro-blue text-white'
                  }`}
                >
                  💧 Пипетка
                </button>
              </div>
            </div>

            {/* Палитра цветов */}
            <div className="bg-retro-purple p-2.5 rounded border-2 border-black">
              <h3 className="text-[10px] text-retro-cyan mb-2">ПАЛИТРА</h3>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {PALETTE_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => {
                      setSelectedColor(hex);
                      setActiveTool('pencil');
                    }}
                    style={{ backgroundColor: hex }}
                    className={`w-6 h-6 rounded border ${
                      selectedColor.toLowerCase() === hex.toLowerCase()
                        ? 'border-white scale-110 shadow-pixel-sm z-10'
                        : 'border-black'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-6 h-6 cursor-pointer rounded border border-black bg-transparent"
                />
                <span className="text-[9px] text-retro-grey">{selectedColor}</span>
              </div>
            </div>

            {/* Размер сетки */}
            <div className="bg-retro-purple p-2.5 rounded border-2 border-black flex justify-between items-center">
              <span className="text-[10px] text-retro-cyan">СЕТКА:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setGridSize(24);
                    setFrames([createEmptyGrid(24), createEmptyGrid(24), createEmptyGrid(24)]);
                    soundManager.playClickSound();
                  }}
                  className={`text-[9px] px-2 py-1 border border-black rounded ${
                    gridSize === 24 ? 'bg-retro-yellow text-black font-bold' : 'bg-retro-blue'
                  }`}
                >
                  24x24
                </button>
                <button
                  onClick={() => {
                    setGridSize(16);
                    setFrames([createEmptyGrid(16), createEmptyGrid(16), createEmptyGrid(16)]);
                    soundManager.playClickSound();
                  }}
                  className={`text-[9px] px-2 py-1 border border-black rounded ${
                    gridSize === 16 ? 'bg-retro-yellow text-black font-bold' : 'bg-retro-blue'
                  }`}
                >
                  16x16
                </button>
              </div>
            </div>
          </div>

          {/* Холст рисования */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div
              className="grid gap-[1px] bg-black/60 p-2 border-4 border-black rounded shadow-pixel-lg"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: '100%',
                maxWidth: '360px',
                aspectRatio: '1 / 1',
              }}
              onMouseLeave={() => setIsMouseDown(false)}
            >
              {currentFrame.map((row, r) =>
                row.map((color, c) => (
                  <div
                    key={`${r}_${c}`}
                    onMouseDown={() => {
                      setIsMouseDown(true);
                      handleCellAction(r, c);
                    }}
                    onMouseEnter={() => {
                      if (isMouseDown && (activeTool === 'pencil' || activeTool === 'eraser')) {
                        handleCellAction(r, c);
                      }
                    }}
                    onMouseUp={() => setIsMouseDown(false)}
                    style={{
                      backgroundColor: color || undefined,
                    }}
                    className={`aspect-square cursor-crosshair border-[0.5px] border-white/10 ${
                      !color ? 'bg-[#262b44] hover:bg-[#3a4466]' : ''
                    }`}
                  />
                ))
              )}
            </div>

            <div className="flex gap-2 mt-3 w-full max-w-[360px] justify-between">
              <button
                onClick={handleClearFrame}
                className="text-[9px] py-1 px-2 bg-retro-red/80 hover:bg-retro-red border border-black rounded"
              >
                Очистить
              </button>
              <button
                onClick={handleCopyPrevFrame}
                disabled={activeFrameIndex === 0}
                className="text-[9px] py-1 px-2 bg-retro-blue hover:bg-retro-cyan border border-black rounded disabled:opacity-40"
              >
                Копия кадра {activeFrameIndex}
              </button>
              <button
                onClick={handleExportPNG}
                className="text-[9px] py-1 px-2 bg-retro-green text-black font-bold border border-black rounded"
              >
                PNG
              </button>
            </div>
          </div>

          {/* Превью и кадры */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <div className="bg-retro-purple p-2.5 rounded border-2 border-black flex flex-col items-center">
              <h3 className="text-[10px] text-retro-cyan mb-2">ПРЕВЬЮ (FPS: {fps})</h3>
              <canvas
                ref={previewCanvasRef}
                width={80}
                height={80}
                className="border-2 border-black rounded mb-2"
              />
              <div className="w-full flex items-center gap-1.5">
                <span className="text-[8px] text-retro-grey">1</span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full h-1 bg-retro-blue rounded cursor-pointer"
                />
                <span className="text-[8px] text-retro-grey">12</span>
              </div>
            </div>

            <div className="bg-retro-purple p-2.5 rounded border-2 border-black">
              <h3 className="text-[10px] text-retro-cyan mb-1.5">КАДРЫ</h3>
              <div className="flex flex-col gap-1.5">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveFrameIndex(idx);
                      soundManager.playClickSound();
                    }}
                    className={`py-1.5 px-2 text-[9px] border border-black rounded flex justify-between items-center ${
                      activeFrameIndex === idx
                        ? 'bg-retro-yellow text-black font-bold shadow-pixel-sm'
                        : 'bg-retro-blue text-white'
                    }`}
                  >
                    <span>Кадр {idx + 1}</span>
                    <span className="text-[8px] opacity-70">
                      {idx === 0 ? 'Idle' : idx === 1 ? 'Walk' : 'Action'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onResetToDefaultSkin();
                soundManager.playClickSound();
                onClose();
              }}
              className="py-1.5 px-2 text-[8px] bg-retro-blue hover:bg-retro-cyan border border-black rounded text-retro-white text-center"
            >
              Сброс на заводской скин
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t-2 border-retro-blue flex justify-end gap-3">
          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="py-2 px-4 bg-retro-blue hover:bg-retro-cyan border border-black rounded text-xs"
          >
            Отмена
          </button>
          <button
            onClick={handleSaveAndApply}
            className="py-2 px-6 bg-retro-green hover:brightness-110 text-black font-bold border border-black rounded text-xs shadow-pixel-sm"
          >
            Надеть на хомячка ✨
          </button>
        </div>
      </div>
    </div>
  );
};
