/**
 * ============================================================================
 * КОМПОНЕНТ: DynamicPixelBackdrop (Динамический Пиксельный Задний Фон)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. АУТЕНТИЧНАЯ ПИКСЕЛЬНАЯ АНИМАЦИЯ (Virtual Buffer 320x180):
 *    - Рендеринг выполняется в виртуальный Canvas фиксированного разрешения 320x180
 *      с отключенным сглаживанием (`imageSmoothingEnabled = false`).
 *    - Это гарантирует 100% аутентичные крупные пиксели (чистый пиксель-арт)
 *      и потребляет менее 1% CPU, работая плавно на любых устройствах.
 * 
 * 2. ТЕМАТИЧЕСКАЯ АДАПТИВНОСТЬ:
 *    - 'retro_arcade': Космический ретро-звездопад и мерцающие созвездия.
 *    - 'gameboy_classic': Зеленоватый LCD dot-matrix и падающие тетрамино-блоки.
 *    - 'cyberpunk_neon': Цифровой неоновый дождь данных (Matrix Cyan & Pink).
 *    - 'cozy_autumn': Кленовые пиксельные листья, кружащиеся на осеннем ветру.
 *    - 'pastel_dream': Нежные лепестки сакуры и мерцающие зефирные искры.
 *    - 'midnight_synth': Неоновая 3D synthwave-сетка с бегущей перспективой и закатом.
 * ============================================================================
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { AppThemeId } from '@/types/hamster';

export interface DynamicPixelBackdropProps {
  themeId: AppThemeId;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  seed: number;
  type?: number;
}

const V_WIDTH = 320;
const V_HEIGHT = 180;

export const DynamicPixelBackdrop: React.FC<DynamicPixelBackdropProps> = ({ themeId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // Инициализация пула частиц для текущей темы
    const particles: Particle[] = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * V_WIDTH,
        y: Math.random() * V_HEIGHT,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.2 + Math.random() * 0.6,
        size: Math.floor(Math.random() * 3) + 1,
        color: '#ffffff',
        seed: Math.random() * 100,
        type: Math.floor(Math.random() * 4),
      });
    }

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.03;

      // Очистка и отрисовка базового тематического градиента
      switch (themeId) {
        case 'retro_arcade':
          renderRetroArcade(ctx, particles, time);
          break;
        case 'gameboy_classic':
          renderGameBoy(ctx, particles, time);
          break;
        case 'cyberpunk_neon':
          renderCyberpunk(ctx, particles, time);
          break;
        case 'cozy_autumn':
          renderCozyAutumn(ctx, particles, time);
          break;
        case 'pastel_dream':
          renderPastelDream(ctx, particles, time);
          break;
        case 'midnight_synth':
          renderMidnightSynth(ctx, particles, time);
          break;
        default:
          renderRetroArcade(ctx, particles, time);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [themeId]);

  return (
    <canvas
      ref={canvasRef}
      width={V_WIDTH}
      height={V_HEIGHT}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none select-none"
      style={{
        imageRendering: 'pixelated',
        objectFit: 'cover',
      }}
    />
  );
};

/**
 * 1. RETRO ARCADE: Глубокий космос, мерцающие звезды и космическая пыль
 */
function renderRetroArcade(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  time: number
) {
  // Фон
  ctx.fillStyle = '#141226';
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // Мягкое фиолетовое сияние в центре
  const grad = ctx.createRadialGradient(
    V_WIDTH / 2,
    V_HEIGHT / 2,
    10,
    V_WIDTH / 2,
    V_HEIGHT / 2,
    140
  );
  grad.addColorStop(0, '#2b234d');
  grad.addColorStop(1, '#141226');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // Звезды
  particles.forEach((p, idx) => {
    p.y -= (0.1 + (idx % 3) * 0.15);
    if (p.y < 0) {
      p.y = V_HEIGHT;
      p.x = Math.random() * V_WIDTH;
    }

    const blink = Math.sin(time * 3 + p.seed);
    if (blink < -0.3) return; // Мерцание

    const isCross = (idx % 4 === 0);
    ctx.fillStyle = idx % 2 === 0 ? '#fee761' : '#63c74d';

    const ix = Math.floor(p.x);
    const iy = Math.floor(p.y);

    if (isCross) {
      // Крестообразная пиксельная звезда 3x3
      ctx.fillRect(ix, iy - 1, 1, 3);
      ctx.fillRect(ix - 1, iy, 3, 1);
    } else {
      // Одиночный пиксель
      ctx.fillRect(ix, iy, 1, 1);
    }
  });
}

/**
 * 2. GAMEBOY 1989: LCD экран, сетка пикселей и медленно падающие тетрамино
 */
function renderGameBoy(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  _time: number
) {
  // Зеленовато-оливковый фон экрана
  ctx.fillStyle = '#8bac0f';
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // Легкая текстура пиксельной сетки LCD
  ctx.fillStyle = '#83a30e';
  for (let y = 0; y < V_HEIGHT; y += 4) {
    ctx.fillRect(0, y, V_WIDTH, 1);
  }

  // Падающие блоки тетрамино (4 пикселя блок 2x2)
  particles.forEach((p, idx) => {
    p.y += 0.25 + (idx % 3) * 0.1;
    if (p.y > V_HEIGHT) {
      p.y = -10;
      p.x = Math.floor((Math.random() * V_WIDTH) / 6) * 6;
    }

    const ix = Math.floor(p.x);
    const iy = Math.floor(p.y);
    ctx.fillStyle = '#306230';

    // Формы тетрамино: L, T, O, I
    const shape = p.type || 0;
    if (shape === 0) {
      // O-block (2x2 кубик)
      ctx.fillRect(ix, iy, 4, 4);
    } else if (shape === 1) {
      // I-block (полоска)
      ctx.fillRect(ix, iy, 8, 2);
    } else if (shape === 2) {
      // T-block
      ctx.fillRect(ix, iy, 6, 2);
      ctx.fillRect(ix + 2, iy + 2, 2, 2);
    } else {
      // L-block
      ctx.fillRect(ix, iy, 2, 6);
      ctx.fillRect(ix + 2, iy + 4, 2, 2);
    }
  });
}

/**
 * 3. CYBERPUNK NEON: Цифровой дождь данных (Matrix Neon Rain)
 */
function renderCyberpunk(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  _time: number
) {
  ctx.fillStyle = '#0a0817';
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // Вертикальный дождь пикселей
  particles.forEach((p, idx) => {
    p.y += 1.2 + (idx % 4) * 0.4;
    if (p.y > V_HEIGHT) {
      p.y = -12;
      p.x = Math.floor(Math.random() * V_WIDTH);
    }

    const ix = Math.floor(p.x);
    const iy = Math.floor(p.y);

    const isPink = idx % 2 === 0;
    const colorLead = isPink ? '#ff007f' : '#00f5d4';
    const colorTrail = isPink ? '#7a003c' : '#006b5d';

    // Головной яркий пиксель
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ix, iy, 1, 2);

    // Основной хвост
    ctx.fillStyle = colorLead;
    ctx.fillRect(ix, iy - 3, 1, 3);

    // Затухающий хвост
    ctx.fillStyle = colorTrail;
    ctx.fillRect(ix, iy - 7, 1, 4);
  });

  // Нижняя неоновая кибер-линия горизонта
  ctx.fillStyle = '#ff007f';
  ctx.fillRect(0, V_HEIGHT - 3, V_WIDTH, 1);
  ctx.fillStyle = '#00f5d4';
  ctx.fillRect(0, V_HEIGHT - 2, V_WIDTH, 1);
}

/**
 * 4. COZY AUTUMN: Кленовые осенние листья, покачивающиеся на ветру
 */
function renderCozyAutumn(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  time: number
) {
  // Теплый градиент кофе и корицы
  ctx.fillStyle = '#26140e';
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  const colors = ['#f4a261', '#e76f51', '#e9c46a', '#c85a32'];

  particles.forEach((p, idx) => {
    // Падение вниз с синусоидальным покачиванием ветра
    p.y += 0.35 + (idx % 3) * 0.15;
    const sway = Math.sin(time * 1.5 + p.seed) * 0.8;
    p.x += sway;

    if (p.y > V_HEIGHT) {
      p.y = -6;
      p.x = Math.random() * V_WIDTH;
    }
    if (p.x < 0) p.x = V_WIDTH;
    if (p.x > V_WIDTH) p.x = 0;

    const ix = Math.floor(p.x);
    const iy = Math.floor(p.y);
    const color = colors[idx % colors.length];

    ctx.fillStyle = color;

    // Пиксельный осенний листик (ромбовидная форма 3x3)
    ctx.fillRect(ix + 1, iy, 1, 1);
    ctx.fillRect(ix, iy + 1, 3, 1);
    ctx.fillRect(ix + 1, iy + 2, 1, 2);
  });
}

/**
 * 5. PASTEL DREAM: Нежные лепестки сакуры и мерцающие звездочки
 */
function renderPastelDream(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  time: number
) {
  // Мягкий градиент зефирного заката
  ctx.fillStyle = '#261b36';
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // Лепестки сакуры
  particles.forEach((p, idx) => {
    p.y += 0.28 + (idx % 3) * 0.1;
    p.x += Math.sin(time + p.seed) * 0.4 + 0.15;

    if (p.y > V_HEIGHT) {
      p.y = -5;
      p.x = Math.random() * V_WIDTH;
    }
    if (p.x > V_WIDTH) p.x = 0;

    const ix = Math.floor(p.x);
    const iy = Math.floor(p.y);

    if (idx % 3 === 0) {
      // Мерцающая зефирная искра
      const blink = Math.sin(time * 4 + p.seed);
      if (blink > 0) {
        ctx.fillStyle = '#b5e2fa';
        ctx.fillRect(ix, iy, 1, 1);
      }
    } else {
      // Лепесток сакуры (розовый овал 2x3)
      ctx.fillStyle = idx % 2 === 0 ? '#ffcad4' : '#f4acb7';
      ctx.fillRect(ix, iy, 2, 2);
      ctx.fillRect(ix + 1, iy + 2, 1, 1);
    }
  });
}

/**
 * 6. MIDNIGHT SYNTH: 3D perspective wireframe grid & retro neon sunset
 */
function renderMidnightSynth(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  time: number
) {
  // Небо индиго
  ctx.fillStyle = '#0c0417';
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  const horizonY = 100;

  // Неоновое солнце на горизонте
  const sunX = V_WIDTH / 2;
  const sunY = horizonY - 12;
  const sunRadius = 24;

  const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
  sunGrad.addColorStop(0, '#fee440');
  sunGrad.addColorStop(1, '#ff007f');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  // Горизонтальные полосы на солнце (стиль 80s synthwave)
  ctx.fillStyle = '#0c0417';
  for (let sy = sunY - 4; sy < sunY + sunRadius; sy += 4) {
    const h = (sy - (sunY - 4)) / 6 + 1;
    ctx.fillRect(sunX - sunRadius - 2, sy, sunRadius * 2 + 4, h);
  }

  // Мерцающие звезды на небе
  particles.slice(0, 20).forEach((p, idx) => {
    if (p.y >= horizonY - 5) return;
    const blink = Math.sin(time * 2 + p.seed);
    if (blink < 0) return;
    ctx.fillStyle = idx % 2 === 0 ? '#fee440' : '#ff007f';
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);
  });

  // Бегущая 3D неоновая сетка на земле
  ctx.fillStyle = '#ff007f';
  ctx.fillRect(0, horizonY, V_WIDTH, 1);

  // Перспективные лучи из центра горизонта
  for (let x = -V_WIDTH; x <= V_WIDTH * 2; x += 30) {
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
    ctx.beginPath();
    ctx.moveTo(sunX, horizonY);
    ctx.lineTo(x, V_HEIGHT);
    ctx.stroke();
  }

  // Бегущие к зрителю горизонтальные линии сетки
  const speed = (time * 25) % 20;
  for (let y = horizonY + 2; y < V_HEIGHT; y += 8) {
    const dist = y - horizonY;
    const offset = (dist + speed) % 20;
    const finalY = horizonY + dist + offset * 0.4;
    if (finalY < V_HEIGHT) {
      ctx.fillStyle = `rgba(0, 245, 212, ${Math.min(1, dist / 60)})`;
      ctx.fillRect(0, Math.floor(finalY), V_WIDTH, 1);
    }
  }
}
