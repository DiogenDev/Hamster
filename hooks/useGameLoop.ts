/**
 * ============================================================================
 * КАСТОМНЫЙ ХУК: useGameLoop (Игровой Цикл на requestAnimationFrame)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    В веб-разработке новички часто используют `setInterval(update, 1000 / 60)`.
 *    Почему это фатальная ошибка для игр?
 *    - `setInterval` не синхронизирован с частотой развертки монитора (VSync). Возникает screen tearing и микрофризы.
 *    - Браузер занижает приоритет таймеров в фоновых вкладках, вызывая хаотические скачки дельты.
 *    - На экранах 120Hz или 144Hz игра будет дергаться, так как интервал рассчитан на 60Hz.
 * 
 *    Решение: `requestAnimationFrame(callback)`.
 *    Браузер вызывает callback строго перед перерисовкой экрана, обеспечивая идеально плавные 60/120 FPS
 *    и автоматически приостанавливая вызовы при скрытии вкладки (экономя 100% батареи).
 * 
 * 2. КАК ЭТО РАБОТАЕТ (Algorithmic Essence):
 *    - Паттерн "Фиксированный шаг физики" (Fix Your Timestep / Accumulator):
 *      Мы рассчитываем реальную дельту между кадрами: `rawDelta = (time - lastTime) / 1000`.
 *      Защищаем от "спирали смерти" (Spiral of Death) через clamp: `delta = Math.min(rawDelta, 0.1)`.
 *      Накапливаем время в аккумуляторе: `accumulator += delta`.
 *      Пока `accumulator >= FIXED_STEP` (1/60 секунды), выполняем расчет физики и стейт-машины.
 * 
 * 3. ПОДВОДНЫЕ КАМНИ REACT (React Re-renders & Garbage Collection):
 *    - Если вызывать `setCount(c => c + 1)` 60 раз в секунду в стейте React,
 *      React начнет делать 60 диффов Virtual DOM в секунду! Это мгновенно забьет кучу памяти
 *      и вызовет паузы Garbage Collector (фризы на 50-200 мс).
 *    - Правило Senior GameDev в React:
 *      Высокочастотные игровые координаты хомячка, частицы и тики анимации живут в `useRef`
 *      и рисуются прямо на Canvas. React-стейт обновляется ТОЛЬКО при смене дискретных
 *      состояний (изменились очки голода, сменился статус с IDLE на WALK, открылась модалка).
 * ============================================================================
 */

'use client';

import { useEffect, useRef } from 'react';

export interface GameLoopCallbacks {
  /** Функция обновления физики и логики (вызывается с фиксированным шагом) */
  onFixedUpdate: (deltaSeconds: number) => void;
  /** Функция отрисовки кадра на Canvas (вызывается на каждый VSync кадр) */
  onRender: (interpolationAlpha: number) => void;
  /** Флаг активности игрового цикла */
  isActive?: boolean;
}

/** Фиксированный шаг физики: 60 обновлений в секунду (0.01667 сек) */
const FIXED_TIMESTEP = 1 / 60;
/** Максимальная дельта за кадр для защиты от скачка при возвращении из фона вкладки */
const MAX_FRAME_DELTA = 0.1;

export function useGameLoop({
  onFixedUpdate,
  onRender,
  isActive = true,
}: GameLoopCallbacks) {
  // Сохраняем функции обратного вызова в Ref, чтобы избежать перезапуска эффекта при их смене
  const onFixedUpdateRef = useRef(onFixedUpdate);
  const onRenderRef = useRef(onRender);
  onFixedUpdateRef.current = onFixedUpdate;
  onRenderRef.current = onRender;

  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const loop = (currentTime: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }

      // Реальная дельта времени между кадрами в секундах
      const rawDelta = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Ограничиваем дельту, предотвращая проскок сквозь стены и зависания
      const delta = Math.min(rawDelta, MAX_FRAME_DELTA);
      accumulatorRef.current += delta;

      // Выполняем фиксированные шаги физики
      while (accumulatorRef.current >= FIXED_TIMESTEP) {
        onFixedUpdateRef.current(FIXED_TIMESTEP);
        accumulatorRef.current -= FIXED_TIMESTEP;
      }

      // Фактор интерполяции для сглаживания рендеринга между тиками физики (0 .. 1)
      const alpha = accumulatorRef.current / FIXED_TIMESTEP;
      onRenderRef.current(alpha);

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      lastTimeRef.current = null;
      accumulatorRef.current = 0;
    };
  }, [isActive]);
}
