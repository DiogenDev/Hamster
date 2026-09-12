/**
 * ============================================================================
 * КАСТОМНЫЙ ХУК: useSafeStorage (SSR-Безопасное Хранилище + Оффлайн-Дельта)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    В Next.js App Router компоненты по умолчанию рендерятся на Node.js сервере.
 *    На сервере глобального объекта `window` и `window.localStorage` НЕ СУЩЕСТВУЕТ.
 *    Если обратиться к `localStorage` при первом рендере напрямую:
 *      - Сервер отрендерит HTML со стандартными дефолтными значениями (или упадет с ReferenceError: window is not defined).
 *      - Браузер при загрузке прочитает localStorage и попытается отрендерить другие данные.
 *      - Возникнет фатальная ошибка гидратации React:
 *        "Hydration failed because the initial UI does not match what was rendered on the server".
 * 
 * 2. КАК ЭТО РАБОТАЕТ (Algorithmic Essence):
 *    - Паттерн "Двухфазного монтирования" (Two-pass Rendering / isMounted):
 *      При первом рендере хук возвращает дефолтный `initialState` и флаг `isHydrated = false`.
 *      В хуке `useEffect` (который выполняется ТОЛЬКО в браузере после монтирования DOM)
 *      мы безопасно считываем данные из localStorage, применяем формулу оффлайн-дельты
 *      и переключаем `isHydrated = true`.
 * 
 * 3. МАТЕМАТИКА ОФФЛАЙН-ПРОГРЕССА (Offline Delta Time):
 *    Формула:
 *      deltaSeconds = Math.max(0, (currentTimeMs - lastSavedTimestamp) / 1000)
 *    Спад показателей за время отсутствия игрока:
 *      - hunger: deltaSeconds / 25 сек (каждые 25с теряется 1 сытость)
 *      - energy: если спал — растет (deltaSeconds / 20 сек), если бодрствовал — падает (deltaSeconds / 35 сек)
 *      - hygiene: deltaSeconds / 45 сек
 *      - soft-cap (Мягкий ограничитель):
 *        Все показатели ограничиваются снизу порогом Math.max(5, value).
 *        Питомец НИКОГДА не погибнет во время сна игрока или закрытой вкладки!
 * 
 * 4. ПОДВОДНЫЕ КАМНИ (Pitfalls & Gotchas):
 *    - Чрезмерная запись в localStorage: `localStorage.setItem` синхронный и блокирует поток UI.
 *      Записывать данные 60 раз в секунду в requestAnimationFrame категорически нельзя!
 *      Мы сохраняем данные по интервалу (раз в 2 секунды) и по событию `beforeunload`/`visibilitychange`.
 * ============================================================================
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TamagotchiSaveData,
  HamsterBehavior,
  HamsterNeeds,
  PoopItem,
} from '@/types/hamster';

/** Ключ сохранения в localStorage браузера */
const STORAGE_KEY = 'hamster_diogen_tamagotchi_v1';

/** Начальное состояние для нового хомячка */
export const DEFAULT_SAVE_DATA: TamagotchiSaveData = {
  petName: 'Хома',
  paletteId: 'classic_golden',
  customSprite: null,
  needs: {
    hunger: 90,
    energy: 100,
    hygiene: 95,
    happiness: 90,
    health: 100,
  },
  behavior: HamsterBehavior.IDLE,
  furniture: {
    bowl: 'clay',
    waterBottle: 'ball',
    house: 'log_cabin',
    bowlFoodLevel: 80,
    currentFoodId: 'sunflower_seeds',
  },
  poops: [],
  lastSavedTimestamp: Date.now(),
  totalAgeSeconds: 0,
  isOnboarded: false,
  soundEnabled: true,
  soundVolume: 0.7,
};

export interface OfflineReport {
  deltaSeconds: number;
  hungerLost: number;
  energyChange: number;
  hygieneLost: number;
  newPoopsCount: number;
}

/**
 * Функция расчета деградации/роста показателей в оффлайне с формулой soft-cap
 */
export function calculateOfflineProgress(
  savedData: TamagotchiSaveData,
  nowMs: number = Date.now()
): { updatedData: TamagotchiSaveData; report: OfflineReport | null } {
  const deltaSeconds = Math.max(0, Math.floor((nowMs - savedData.lastSavedTimestamp) / 1000));

  // Если отсутствовали менее 5 секунд, оффлайн расчет пропускаем (простая перезагрузка)
  if (deltaSeconds < 5) {
    return {
      updatedData: {
        ...savedData,
        lastSavedTimestamp: nowMs,
      },
      report: null,
    };
  }

  const currentNeeds = { ...savedData.needs };

  // 1. Расчет голода: -1 за каждые 25 секунд
  const hungerLost = Math.floor(deltaSeconds / 25);
  // Мягкий порог (soft-cap): не ниже 5 единиц в оффлайне!
  currentNeeds.hunger = Math.max(5, currentNeeds.hunger - hungerLost);

  // 2. Расчет энергии:
  let energyChange = 0;
  if (savedData.behavior === HamsterBehavior.SLEEP) {
    // Во сне восстанавливает 1 единицу за 20 секунд
    energyChange = Math.floor(deltaSeconds / 20);
    currentNeeds.energy = Math.min(100, currentNeeds.energy + energyChange);
  } else {
    // При бодрствовании теряет 1 единицу за 35 секунд
    energyChange = -Math.floor(deltaSeconds / 35);
    currentNeeds.energy = Math.max(5, currentNeeds.energy + energyChange);
  }

  // 3. Расчет гигиены: -1 за каждые 45 секунд
  const hygieneLost = Math.floor(deltaSeconds / 45);
  currentNeeds.hygiene = Math.max(5, currentNeeds.hygiene - hygieneLost);

  // 4. Появление какашек при долгой оффлайн-сессии:
  // Если гигиена упала ниже 35, генерируем от 1 до 3 какашек
  let newPoopsCount = 0;
  const newPoops: PoopItem[] = [...savedData.poops];
  if (currentNeeds.hygiene < 40 && newPoops.length < 5) {
    newPoopsCount = Math.min(3, Math.floor(deltaSeconds / 300) + 1);
    for (let i = 0; i < newPoopsCount && newPoops.length < 5; i++) {
      newPoops.push({
        id: `poop_${nowMs}_${i}`,
        // Случайные координаты по ширине клетки (от 80 до 240 px)
        x: Math.floor(80 + Math.random() * 160),
        y: 195 + Math.floor(Math.random() * 10),
        createdAt: nowMs - i * 1000,
      });
    }
  }

  // 5. Расчет счастья и здоровья:
  // Если питомец очень голоден (< 20) или грязно (< 20), счастье стремительно падает
  if (currentNeeds.hunger < 20 || currentNeeds.hygiene < 20) {
    const happinessLost = Math.floor(deltaSeconds / 40);
    currentNeeds.happiness = Math.max(5, currentNeeds.happiness - happinessLost);
  }

  // Здоровье страдает только при крайнем истощении (soft-cap = 10%)
  if (currentNeeds.hunger <= 10 || currentNeeds.hygiene <= 10) {
    const healthLost = Math.floor(deltaSeconds / 60);
    currentNeeds.health = Math.max(10, currentNeeds.health - healthLost);
  }

  const updatedData: TamagotchiSaveData = {
    ...savedData,
    needs: currentNeeds,
    poops: newPoops,
    lastSavedTimestamp: nowMs,
    totalAgeSeconds: savedData.totalAgeSeconds + deltaSeconds,
  };

  const report: OfflineReport = {
    deltaSeconds,
    hungerLost,
    energyChange,
    hygieneLost,
    newPoopsCount,
  };

  return { updatedData, report };
}

/**
 * Хук для безопасного чтения и записи состояния игры в localStorage
 */
export function useSafeStorage() {
  const [data, setData] = useState<TamagotchiSaveData>(DEFAULT_SAVE_DATA);
  const [isHydrated, setIsHydrated] = useState(false);
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(null);

  // Реф для актуального состояния при сохранении в обработчиках событий
  const dataRef = useRef<TamagotchiSaveData>(DEFAULT_SAVE_DATA);
  dataRef.current = data;

  // Инициализация при монтировании в браузере
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TamagotchiSaveData;
        // Расчет оффлайн-прогресса
        const { updatedData, report } = calculateOfflineProgress(parsed, Date.now());
        setData(updatedData);
        if (report && report.deltaSeconds > 60) {
          setOfflineReport(report);
        }
      } else {
        setData(DEFAULT_SAVE_DATA);
      }
    } catch (err) {
      console.error('[useSafeStorage] Ошибка считывания localStorage:', err);
      setData(DEFAULT_SAVE_DATA);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Синхронное сохранение в localStorage
  const persistNow = useCallback((saveTarget?: TamagotchiSaveData) => {
    try {
      const target = saveTarget || dataRef.current;
      const toSave: TamagotchiSaveData = {
        ...target,
        lastSavedTimestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      console.error('[useSafeStorage] Не удалось сохранить состояние:', err);
    }
  }, []);

  // Периодическое автосохранение раз в 3 секунды
  useEffect(() => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      persistNow();
    }, 3000);

    // Сохранение при сворачивании страницы или закрытии вкладки
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistNow();
      }
    };

    const handleBeforeUnload = () => {
      persistNow();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isHydrated, persistNow]);

  // Сброс игры на заводские настройки
  const resetSaveData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setData({
        ...DEFAULT_SAVE_DATA,
        lastSavedTimestamp: Date.now(),
      });
      setOfflineReport(null);
    } catch (err) {
      console.error('[useSafeStorage] Ошибка сброса данных:', err);
    }
  }, []);

  return {
    data,
    setData,
    isHydrated,
    offlineReport,
    clearOfflineReport: () => setOfflineReport(null),
    persistNow,
    resetSaveData,
  };
}
