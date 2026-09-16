/**
 * ============================================================================
 * КАСТОМНЫЙ ХУК: useSafeStorage (SSR-Безопасное Хранилище + Оффлайн-Дельта + Дзен)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    В режиме "Дзен / Браузерный компаньон" (zenMode) или при отключенных статах,
 *    оффлайн-расчет обязан уважать настройки игрока:
 *    - Если голод отключен, за время отсутствия он не падает.
 *    - Если гигиена отключена, какашки не генерируются на дне клетки.
 *    - Если игрок вернулся, отчет показывает приятное сообщение о том,
 *      что хомячок просто сладко спал или катался в колесе.
 * ============================================================================
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  TamagotchiSaveData,
  HamsterBehavior,
  PoopItem,
} from '@/types/hamster';

/** Ключ сохранения в localStorage браузера */
const STORAGE_KEY = 'hamster_diogen_tamagotchi_v2';

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
    bottleWaterLevel: 100,
    currentDrinkId: 'fresh_water',
    drinkColor: '#38bdf8',
    positions: {
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
    },
  },
  poops: [],
  lastSavedTimestamp: Date.now(),
  totalAgeSeconds: 0,
  isOnboarded: false,
  soundEnabled: true,
  soundVolume: 0.7,
  zenMode: false,
  disabledStats: {
    hunger: false,
    energy: false,
    hygiene: false,
    happiness: false,
    health: false,
  },
  themeId: 'retro_arcade',
  musicConfig: {
    isPlaying: false,
    currentTrackIndex: 0,
    volume: 0.35,
    mode: 'loop',
  },
  cageColor: 'silver',
  tunnelColor: 'neon_cyan',
  tunnelTexture: 'smooth_glass',
  floorStyle: 'natural_oak',
  tierToys: {
    floor2Toy: 'seesaw',
    floor3Toy: 'telescope',
  },
};

export interface OfflineReport {
  deltaSeconds: number;
  hungerLost: number;
  energyChange: number;
  hygieneLost: number;
  newPoopsCount: number;
  isZen: boolean;
}

/**
 * Функция расчета деградации/роста показателей в оффлайне с учетом Дзен-режима
 */
export function calculateOfflineProgress(
  savedData: TamagotchiSaveData,
  nowMs: number = Date.now()
): { updatedData: TamagotchiSaveData; report: OfflineReport | null } {
  const deltaSeconds = Math.max(0, Math.floor((nowMs - savedData.lastSavedTimestamp) / 1000));

  if (deltaSeconds < 5) {
    return {
      updatedData: {
        ...savedData,
        lastSavedTimestamp: nowMs,
      },
      report: null,
    };
  }

  const isZen = savedData.zenMode;
  const disabled = savedData.disabledStats || DEFAULT_SAVE_DATA.disabledStats;
  const currentNeeds = { ...savedData.needs };

  let hungerLost = 0;
  let energyChange = 0;
  let hygieneLost = 0;
  let newPoopsCount = 0;
  let updatedBehavior = savedData.behavior;
  const newPoops: PoopItem[] = [...savedData.poops];

  if (!isZen) {
    // 1. Голод
    if (!disabled.hunger) {
      hungerLost = Math.floor(deltaSeconds / 25);
      currentNeeds.hunger = Math.max(5, currentNeeds.hunger - hungerLost);
    } else {
      currentNeeds.hunger = 100;
    }

    // 2. Энергия (Баг-фикс: хомячок гарантированно восстанавливает силы во время сна в оффлайне)
    if (!disabled.energy) {
      if (savedData.behavior === HamsterBehavior.SLEEP) {
        // Хомячок сладко спал в домике: быстрое восстановление сил (+1% каждые 15 сек)
        energyChange = Math.floor(deltaSeconds / 15);
        currentNeeds.energy = Math.min(100, currentNeeds.energy + energyChange);
        // Если выспался до 100%, переходит в бодрствование
        if (currentNeeds.energy >= 100) {
          updatedBehavior = HamsterBehavior.IDLE;
        } else {
          updatedBehavior = HamsterBehavior.SLEEP;
        }
      } else {
        // Если хомячок не спал при закрытии браузера:
        // Рассчитываем, сколько времени прошло до естественного засыпания (< 20% энергии)
        const secondsToExhaustion = Math.max(0, (savedData.needs.energy - 20) * 35);
        if (deltaSeconds > secondsToExhaustion + 60) {
          // Хомячок устал за время отсутствия, залез в домик и проспал остаток времени
          const sleepDuration = deltaSeconds - secondsToExhaustion;
          const energyRecovered = Math.floor(sleepDuration / 15);
          currentNeeds.energy = Math.min(100, 20 + energyRecovered);
          energyChange = currentNeeds.energy - savedData.needs.energy;
          if (currentNeeds.energy >= 100) {
            updatedBehavior = HamsterBehavior.IDLE;
          } else {
            updatedBehavior = HamsterBehavior.SLEEP;
          }
        } else {
          // Короткое отсутствие без засыпания
          energyChange = -Math.floor(deltaSeconds / 35);
          currentNeeds.energy = Math.max(5, currentNeeds.energy + energyChange);
        }
      }
    } else {
      currentNeeds.energy = 100;
    }

    // 3. Гигиена и какашки
    if (!disabled.hygiene) {
      hygieneLost = Math.floor(deltaSeconds / 45);
      currentNeeds.hygiene = Math.max(5, currentNeeds.hygiene - hygieneLost);

      if (currentNeeds.hygiene < 40 && newPoops.length < 5) {
        newPoopsCount = Math.min(3, Math.floor(deltaSeconds / 300) + 1);
        for (let i = 0; i < newPoopsCount && newPoops.length < 5; i++) {
          newPoops.push({
            id: `poop_${nowMs}_${i}`,
            x: Math.floor(100 + Math.random() * 260),
            y: 152 + Math.floor(Math.random() * 8),
            createdAt: nowMs - i * 1000,
          });
        }
      }
    } else {
      currentNeeds.hygiene = 100;
    }

    // 4. Счастье и Здоровье
    if (!disabled.happiness && (currentNeeds.hunger < 20 || currentNeeds.hygiene < 20)) {
      const happinessLost = Math.floor(deltaSeconds / 40);
      currentNeeds.happiness = Math.max(5, currentNeeds.happiness - happinessLost);
    } else if (disabled.happiness) {
      currentNeeds.happiness = 100;
    }

    if (!disabled.health && (currentNeeds.hunger <= 10 || currentNeeds.hygiene <= 10)) {
      const healthLost = Math.floor(deltaSeconds / 60);
      currentNeeds.health = Math.max(10, currentNeeds.health - healthLost);
    } else if (disabled.health) {
      currentNeeds.health = 100;
    }
  } else {
    // В режиме Дзен все статы идеальны
    currentNeeds.hunger = 100;
    currentNeeds.energy = 100;
    currentNeeds.hygiene = 100;
    currentNeeds.happiness = 100;
    currentNeeds.health = 100;
  }

  const updatedData: TamagotchiSaveData = {
    ...savedData,
    behavior: updatedBehavior,
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
    isZen,
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

  const dataRef = useRef<TamagotchiSaveData>(DEFAULT_SAVE_DATA);
  dataRef.current = data;

  const updateData = useCallback(
    (updater: TamagotchiSaveData | ((prev: TamagotchiSaveData) => TamagotchiSaveData)) => {
      setData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        dataRef.current = next;
        return next;
      });
    },
    []
  );

  useEffect(() => {
    try {
      // Поддержка миграции v1 -> v2 если ключ v2 еще не существует
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        raw = localStorage.getItem('hamster_diogen_tamagotchi_v1');
      }

      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TamagotchiSaveData>;
        const merged: TamagotchiSaveData = {
          ...DEFAULT_SAVE_DATA,
          ...parsed,
          furniture: {
            ...DEFAULT_SAVE_DATA.furniture,
            ...(parsed.furniture || {}),
            positions: {
              ...(DEFAULT_SAVE_DATA.furniture.positions || {}),
              ...(parsed.furniture?.positions || {}),
            },
            bottleWaterLevel: parsed.furniture?.bottleWaterLevel ?? 100,
            currentDrinkId: parsed.furniture?.currentDrinkId ?? 'fresh_water',
            drinkColor: parsed.furniture?.drinkColor ?? '#38bdf8',
          },
          disabledStats: {
            ...DEFAULT_SAVE_DATA.disabledStats,
            ...(parsed.disabledStats || {}),
          },
          themeId: parsed.themeId || DEFAULT_SAVE_DATA.themeId,
          musicConfig: {
            ...DEFAULT_SAVE_DATA.musicConfig,
            ...(parsed.musicConfig || {}),
          },
          floorStyle: parsed.floorStyle || DEFAULT_SAVE_DATA.floorStyle,
          tierToys: {
            ...DEFAULT_SAVE_DATA.tierToys!,
            ...(parsed.tierToys || {}),
          },
        };
        const { updatedData, report } = calculateOfflineProgress(merged, Date.now());
        dataRef.current = updatedData;
        setData(updatedData);
        if (report && report.deltaSeconds > 60 && !report.isZen) {
          setOfflineReport(report);
        }
      } else {
        dataRef.current = DEFAULT_SAVE_DATA;
        setData(DEFAULT_SAVE_DATA);
      }
    } catch (err) {
      console.error('[useSafeStorage] Ошибка считывания localStorage:', err);
      dataRef.current = DEFAULT_SAVE_DATA;
      setData(DEFAULT_SAVE_DATA);
    } finally {
      setIsHydrated(true);
    }
  }, []);

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

  useEffect(() => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      persistNow();
    }, 3000);

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

  const resetSaveData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('hamster_diogen_tamagotchi_v1');
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
    setData: updateData,
    isHydrated,
    offlineReport,
    clearOfflineReport: () => setOfflineReport(null),
    persistNow,
    resetSaveData,
  };
}
