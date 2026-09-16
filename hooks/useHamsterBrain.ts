/**
 * ============================================================================
 * КАСТОМНЫЙ ХУК: useHamsterBrain (FSM V2: Беговое Колесо, Умывание, Дзен-Режим)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ПАНОРАМНОЕ ПЕРЕМЕЩЕНИЕ И НОВЫЕ ПОВЕДЕНИЯ:
 *    Широкая клетка (480px) дает питомцу пространство для полноценного исследования.
 *    Мы добавили интерактивные точки интереса:
 *    - Беговое колесо (x = 34): хомячок запрыгивает в колесо (`WHEEL`) и бегает с удовольствием.
 *    - Зона умывания (`GROOM`): чистит шерстку и ушки.
 *    - Зона обнюхивания (`SNIFF`): принюхивается к опилкам.
 * 
 * 2. ДЗЕН-РЕЖИМ (Zen Mode):
 *    Если `zenMode === true` или конкретный стат отключен в настройках,
 *    таймеры деградации блокируются, а показатели фиксируются на 100%.
 *    Хомячок ведет себя беззаботно, радуя владельца живыми анимациями.
 * ============================================================================
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  HamsterBehavior,
  HamsterNeeds,
  PoopItem,
  EmoteBubble,
  Particle,
  FoodItem,
  DrinkItem,
  DisabledStatsConfig,
  FurnitureConfig,
  CageTier,
  TunnelTransitionState,
  TierToysConfig,
  Floor2ToyId,
  Floor3ToyId,
} from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';
import {
  DIAGONAL_TUNNELS,
  VERTICAL_FLOORS,
  FLOOR2_TOY_PRESETS,
  FLOOR3_TOY_PRESETS,
} from '@/utils/cageTiers';
import { FOOD_ITEMS } from '@/utils/foodAndDrinkPresets';

export interface HamsterBrainProps {
  initialNeeds: HamsterNeeds;
  initialBehavior: HamsterBehavior;
  initialPoops: PoopItem[];
  zenMode?: boolean;
  disabledStats?: DisabledStatsConfig;
  furniture?: FurnitureConfig;
  cageTier?: CageTier;
  tierToys?: TierToysConfig;
  onNeedsChange?: (needs: HamsterNeeds) => void;
  onBehaviorChange?: (behavior: HamsterBehavior) => void;
  onPoopsChange?: (poops: PoopItem[]) => void;
}

export function useHamsterBrain({
  initialNeeds,
  initialBehavior,
  initialPoops,
  zenMode = false,
  disabledStats = {
    hunger: false,
    energy: false,
    hygiene: false,
    happiness: false,
    health: false,
  },
  furniture,
  cageTier = 1,
  tierToys = { floor2Toy: 'seesaw', floor3Toy: 'telescope' },
  onNeedsChange,
  onBehaviorChange,
  onPoopsChange,
}: HamsterBrainProps) {
  const [behavior, setBehavior] = useState<HamsterBehavior>(initialBehavior);
  const [needs, setNeeds] = useState<HamsterNeeds>(initialNeeds);
  const [poops, setPoops] = useState<PoopItem[]>(initialPoops);
  const [emotes, setEmotes] = useState<EmoteBubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  const furnitureRef = useRef<FurnitureConfig | undefined>(furniture);
  furnitureRef.current = furniture;

  // Высокочастотные координаты в виртуальном буфере 480x180
  // Уровень пола клетки: y = 110 (при высоте спрайта 32px лапки стоят на опилках y=142)
  const posRef = useRef({
    x: 220,
    y: 110,
    vx: 0,
    targetX: 220,
    flipX: false,
  });

  const stateTimeRef = useRef<number>(0);
  const stateDurationRef = useRef<number>(4);
  const behaviorRef = useRef<HamsterBehavior>(initialBehavior);
  behaviorRef.current = behavior;

  const needsRef = useRef<HamsterNeeds>(initialNeeds);
  needsRef.current = needs;

  const poopsRef = useRef<PoopItem[]>(initialPoops);
  poopsRef.current = poops;

  const zenModeRef = useRef<boolean>(zenMode);
  zenModeRef.current = zenMode;

  const disabledStatsRef = useRef<DisabledStatsConfig>(disabledStats);
  disabledStatsRef.current = disabledStats;

  const [chonkScale, setChonkScale] = useState<number>(1.0);
  const chonkScaleRef = useRef<number>(1.0);
  const recentFeedsTimestampsRef = useRef<number[]>([]);

  // Ярус клетки и текущий этаж хомяка (1, 2, 3)
  const cageTierRef = useRef<CageTier>(cageTier);
  cageTierRef.current = cageTier;
  const [currentFloor, setCurrentFloor] = useState<1 | 2 | 3>(1);
  const currentFloorRef = useRef<1 | 2 | 3>(1);

  // Состояние перехода по диагональному туннелю (акриловая труба проявляется только во время перехода!)
  const [tunnelTransition, setTunnelTransition] = useState<TunnelTransitionState | null>(null);
  const tunnelTransitionRef = useRef<TunnelTransitionState | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Корректировка этажа при смене яруса клетки (например, при сбросе через админку)
  useEffect(() => {
    if (cageTier === 1 && currentFloorRef.current !== 1) {
      currentFloorRef.current = 1;
      setCurrentFloor(1);
      posRef.current.y = 110;
      posRef.current.targetX = Math.max(30, Math.min(430, posRef.current.x));
    } else if (cageTier === 2 && currentFloorRef.current === 3) {
      currentFloorRef.current = 2;
      setCurrentFloor(2);
      posRef.current.y = -70;
      posRef.current.targetX = Math.max(40, Math.min(430, posRef.current.x));
    }
  }, [cageTier]);


  // Таймеры и флаги перемещения
  const hungerTimerRef = useRef<number>(0);
  const energyTimerRef = useRef<number>(0);
  const hygieneTimerRef = useRef<number>(0);
  const healthTimerRef = useRef<number>(0);
  const sleepZzzTimerRef = useRef<number>(0);
  const wheelSoundTimerRef = useRef<number>(0);
  const isEnteringHouseRef = useRef<boolean>(false);
  const isGoingToWheelRef = useRef<boolean>(false);
  const isGoingToBottleRef = useRef<boolean>(false);
  const isGoingToBowlRef = useRef<boolean>(false);
  const isHeldRef = useRef<boolean>(false);
  const drinkSoundTimerRef = useRef<number>(0);
  const currentDrinkItemRef = useRef<DrinkItem | null>(null);
  const currentFoodItemRef = useRef<FoodItem | null>(null);

  const tierToysRef = useRef<TierToysConfig | undefined>(tierToys);
  tierToysRef.current = tierToys;
  const isGoingToToyRef = useRef<{ floor: 2 | 3 } | null>(null);
  const [activeToyFloor, setActiveToyFloor] = useState<2 | 3 | null>(null);
  const activeToyFloorRef = useRef<2 | 3 | null>(null);
  const playWithToyRef = useRef<((floor?: 2 | 3) => void) | null>(null);

  // Динамические координаты домика, колеса, поилки и кормушки из конфига мебели
  const getHousePos = useCallback(() => {
    const p = furnitureRef.current?.positions;
    return {
      x: p?.houseX ?? 98,
      y: p?.houseY ?? 78,
    };
  }, []);

  const getWheelPos = useCallback(() => {
    const p = furnitureRef.current?.positions;
    return {
      x: p?.wheelX ?? 56,
      y: p?.wheelY ?? 86,
    };
  }, []);

  const getBottlePos = useCallback(() => {
    const p = furnitureRef.current?.positions;
    return {
      x: p?.bottleX ?? 246,
      y: p?.bottleY ?? 38,
    };
  }, []);

  const getBowlPos = useCallback(() => {
    const p = furnitureRef.current?.positions;
    return {
      x: p?.bowlX ?? 412,
      y: p?.bowlY ?? 122,
    };
  }, []);

  const triggerEmote = useCallback((emoji: EmoteBubble['emoji']) => {
    const newEmote: EmoteBubble = {
      id: `emote_${Date.now()}_${Math.random()}`,
      emoji,
      createdAt: Date.now(),
      durationMs: 2200,
      offsetY: 0,
      opacity: 1.0,
    };
    setEmotes((prev) => [...prev.slice(-2), newEmote]);
  }, []);

  const spawnParticles = useCallback(
    (
      count: number,
      originX: number,
      originY: number,
      color: string,
      char?: string
    ) => {
      const newBatch: Particle[] = [];
      for (let i = 0; i < count; i++) {
        newBatch.push({
          id: `p_${Date.now()}_${Math.random()}`,
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 40,
          vy: -20 - Math.random() * 40,
          color,
          size: char ? 10 : 2 + Math.floor(Math.random() * 2),
          life: 0,
          maxLife: 1.2,
          char,
        });
      }
      setParticles((prev) => [...prev, ...newBatch]);
    },
    []
  );

  /**
   * Запрос перемещения хомячка на целевой этаж через диагональный туннель
   * Туннель плавно проявляется, хомячок пробегает внутри, и туннель растворяется!
   */
  const requestFloorChange = useCallback(
    (targetFloor: 1 | 2 | 3, onComplete?: () => void) => {
      if (tunnelTransitionRef.current?.active) {
        // Если туннель уже анимируется, ставим следующий запрос в очередь, чтобы клики не терялись
        pendingActionRef.current = () => {
          if (currentFloorRef.current !== targetFloor) {
            requestFloorChange(targetFloor, onComplete);
          } else {
            onComplete?.();
          }
        };
        return;
      }
      const current = currentFloorRef.current;
      if (current === targetFloor) {
        onComplete?.();
        return;
      }
      const tier = cageTierRef.current;
      if (targetFloor > tier) return;

      let nextStepFloor: 1 | 2 | 3 = targetFloor;
      let tunnelIdx: 1 | 2 = 1;

      if (current === 1 && targetFloor >= 2) {
        nextStepFloor = 2;
        tunnelIdx = 1;
        if (targetFloor === 3) {
          pendingActionRef.current = () => {
            requestFloorChange(3, onComplete);
          };
        }
      } else if (current === 2 && targetFloor === 3) {
        nextStepFloor = 3;
        tunnelIdx = 2;
      } else if (current === 3 && targetFloor <= 2) {
        nextStepFloor = 2;
        tunnelIdx = 2;
        if (targetFloor === 1) {
          pendingActionRef.current = () => {
            requestFloorChange(1, onComplete);
          };
        }
      } else if (current === 2 && targetFloor === 1) {
        nextStepFloor = 1;
        tunnelIdx = 1;
      }

      const geom = DIAGONAL_TUNNELS[tunnelIdx];
      const isGoingUp = nextStepFloor > current;
      const startX = isGoingUp ? geom.startX : geom.endX;
      const startY = isGoingUp ? geom.startY : geom.endY;

      posRef.current.x = startX;
      posRef.current.y = startY;
      posRef.current.targetX = startX;
      posRef.current.vx = 0;
      posRef.current.flipX = isGoingUp ? true : false;

      isEnteringHouseRef.current = false;
      isGoingToWheelRef.current = false;
      isGoingToBottleRef.current = false;
      isGoingToBowlRef.current = false;
      isGoingToToyRef.current = null;
      activeToyFloorRef.current = null;
      setActiveToyFloor(null);

      if (onComplete && targetFloor === nextStepFloor) {
        pendingActionRef.current = onComplete;
      }

      const newTrans: TunnelTransitionState = {
        active: true,
        fromFloor: current,
        toFloor: nextStepFloor,
        progress: 0,
        opacity: 0,
        tunnelIndex: tunnelIdx,
      };
      tunnelTransitionRef.current = newTrans;
      setTunnelTransition(newTrans);
      behaviorRef.current = HamsterBehavior.WALK;
      setBehavior(HamsterBehavior.WALK);
      stateTimeRef.current = 0;
      stateDurationRef.current = 999;
      soundManager.playTunnelSound();
      triggerEmote('🚇');
      onBehaviorChange?.(HamsterBehavior.WALK);
    },
    [onBehaviorChange, triggerEmote]
  );

  const changeBehavior = useCallback(
    (newBehavior: HamsterBehavior, customDuration?: number) => {
      // Если хомячок просыпается ото сна — выходит наружу рядом с домиком
      if (
        behaviorRef.current === HamsterBehavior.SLEEP &&
        newBehavior !== HamsterBehavior.SLEEP
      ) {
        const { x: houseX } = getHousePos();
        const exitX = houseX < 240 ? houseX + 80 : houseX - 20;
        posRef.current.x = Math.max(20, Math.min(440, exitX));
        posRef.current.targetX = posRef.current.x;
        posRef.current.flipX = houseX >= 240;
        chonkScaleRef.current = 1.0;
        setChonkScale(1.0);
      }

      if (newBehavior !== HamsterBehavior.PLAYING_TOY) {
        activeToyFloorRef.current = null;
        setActiveToyFloor(null);
      }

      behaviorRef.current = newBehavior;
      setBehavior(newBehavior);
      stateTimeRef.current = 0;
      stateDurationRef.current = customDuration ?? (3 + Math.random() * 4);

      // Предметные действия происходят на 1-м этаже (колесо, домик, поилка, миска)
      if (
        newBehavior === HamsterBehavior.WHEEL ||
        newBehavior === HamsterBehavior.SLEEP ||
        newBehavior === HamsterBehavior.DRINKING ||
        newBehavior === HamsterBehavior.EATING
      ) {
        currentFloorRef.current = 1;
        setCurrentFloor(1);
        posRef.current.y = VERTICAL_FLOORS[1].y;
      } else if (!tunnelTransitionRef.current?.active) {
        // Поддержание правильного уровня Y в зависимости от текущего этажа
        const floor = currentFloorRef.current;
        if (floor === 2) {
          posRef.current.y = VERTICAL_FLOORS[2].y;
        } else if (floor === 3) {
          posRef.current.y = VERTICAL_FLOORS[3].y;
        } else {
          posRef.current.y = VERTICAL_FLOORS[1].y;
        }
      }

      if (newBehavior === HamsterBehavior.WALK) {
        if (
          !isEnteringHouseRef.current &&
          !isGoingToWheelRef.current &&
          !isGoingToBottleRef.current &&
          !isGoingToBowlRef.current &&
          !isGoingToToyRef.current &&
          !tunnelTransitionRef.current?.active
        ) {
          const tier = cageTierRef.current;
          const floor = currentFloorRef.current;
          const roll = Math.random();

          // Автономное решение хомячка поиграть с игрушкой на текущем верхнем этаже
          if ((floor === 2 || floor === 3) && Math.random() < 0.35) {
            playWithToyRef.current?.(floor as 2 | 3);
            return;
          }

          // Автономное решение хомячка исследовать другой этаж через туннель
          if (tier >= 2 && roll < 0.25) {
            if (floor === 1) {
              requestFloorChange(2);
              return;
            } else if (floor === 2) {
              if (tier === 3 && Math.random() < 0.5) {
                requestFloorChange(3);
              } else {
                requestFloorChange(1);
              }
              return;
            } else if (floor === 3) {
              requestFloorChange(2);
              return;
            }
          }

          // Обычная прогулка по текущему этажу:
          if (floor === 1) {
            posRef.current.y = VERTICAL_FLOORS[1].y;
          } else if (floor === 2) {
            posRef.current.y = VERTICAL_FLOORS[2].y;
          } else if (floor === 3) {
            posRef.current.y = VERTICAL_FLOORS[3].y;
          }

          const targetX = Math.floor(40 + Math.random() * 380);
          posRef.current.targetX = targetX;
          posRef.current.flipX = targetX < posRef.current.x;
        }
      } else if (newBehavior === HamsterBehavior.WHEEL) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        const { x: wheelX } = getWheelPos();
        posRef.current.x = wheelX;
        posRef.current.targetX = wheelX;
        posRef.current.flipX = false;
        soundManager.playWheelSound();
        triggerEmote('🎡');
      } else if (newBehavior === HamsterBehavior.GROOM) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        triggerEmote('✨');
      } else if (newBehavior === HamsterBehavior.SNIFF) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        triggerEmote('🌾');
      } else if (newBehavior === HamsterBehavior.POOPING) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        soundManager.playPoopSound();
        triggerEmote('💩');
      } else if (newBehavior === HamsterBehavior.SLEEP) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        isGoingToBottleRef.current = false;
        isGoingToBowlRef.current = false;
        const { x: houseX } = getHousePos();
        posRef.current.x = houseX + 26;
        posRef.current.targetX = houseX + 26;
        soundManager.playSleepSound();
        triggerEmote('💤');
      } else if (newBehavior === HamsterBehavior.DRINKING) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        isGoingToBottleRef.current = false;
        isGoingToBowlRef.current = false;
        const { x: bottleX } = getBottlePos();
        const drinkStandX = Math.max(20, Math.min(430, bottleX - 18));
        posRef.current.x = drinkStandX;
        posRef.current.targetX = drinkStandX;
        posRef.current.y = 110;
        posRef.current.flipX = false;
        soundManager.playDrinkSound();
        triggerEmote('💧');
      } else if (newBehavior === HamsterBehavior.EATING) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        isGoingToBottleRef.current = false;
        isGoingToBowlRef.current = false;
        const { x: bowlX } = getBowlPos();
        const bowlStandX = bowlX >= 240 ? Math.max(20, bowlX - 30) : Math.min(430, bowlX + 32);
        posRef.current.x = bowlStandX;
        posRef.current.targetX = bowlStandX;
        posRef.current.y = 110;
        posRef.current.flipX = bowlX < posRef.current.x;
        soundManager.playEatSound();
        triggerEmote('🌾');
      } else if (newBehavior === HamsterBehavior.PLAYING_TOY) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        isGoingToBottleRef.current = false;
        isGoingToBowlRef.current = false;
        isGoingToToyRef.current = null;
      }

      onBehaviorChange?.(newBehavior);
    },
    [getHousePos, getWheelPos, getBottlePos, getBowlPos, onBehaviorChange, triggerEmote]
  );

  /**
   * Отправить хомяка побегать в колесо (с плавным подходом пешком!)
   */
  const goToWheel = useCallback(() => {
    if (behaviorRef.current === HamsterBehavior.SLEEP) {
      triggerEmote('💤');
      return;
    }
    if (currentFloorRef.current !== 1) {
      requestFloorChange(1, () => goToWheel());
      return;
    }
    const { x: wheelX } = getWheelPos();
    const dist = Math.abs(posRef.current.x - wheelX);
    if (dist <= 18) {
      isGoingToWheelRef.current = false;
      isGoingToBottleRef.current = false;
      isGoingToBowlRef.current = false;
      isEnteringHouseRef.current = false;
      changeBehavior(HamsterBehavior.WHEEL, 6);
    } else {
      isGoingToWheelRef.current = true;
      isGoingToBottleRef.current = false;
      isGoingToBowlRef.current = false;
      isEnteringHouseRef.current = false;
      posRef.current.targetX = wheelX;
      posRef.current.flipX = wheelX < posRef.current.x;
      triggerEmote('🎡');
      changeBehavior(HamsterBehavior.WALK, 8);
    }
  }, [changeBehavior, getWheelPos, requestFloorChange, triggerEmote]);

  /**
   * Непосредственное выполнение игры с игрушкой (хомяк уже находится на этаже и подошел к игрушке)
   */
  const executePlayingToy = useCallback(
    (floor: 2 | 3) => {
      isGoingToToyRef.current = null;
      activeToyFloorRef.current = floor;
      setActiveToyFloor(floor);

      const toyId =
        floor === 2
          ? tierToysRef.current?.floor2Toy ?? 'seesaw'
          : tierToysRef.current?.floor3Toy ?? 'telescope';

      const toyCfg =
        floor === 2
          ? FLOOR2_TOY_PRESETS[toyId as Floor2ToyId]
          : FLOOR3_TOY_PRESETS[toyId as Floor3ToyId];

      const toyX =
        floor === 2
          ? furnitureRef.current?.positions?.floor2ToyX ?? 235
          : furnitureRef.current?.positions?.floor3ToyX ?? 145;

      const toyY = floor === 2 ? VERTICAL_FLOORS[2].y : VERTICAL_FLOORS[3].y;

      posRef.current.x = toyX;
      posRef.current.targetX = toyX;
      posRef.current.y = toyY;

      // Звуковые эффекты согласно типу игрушки
      if (toyCfg.soundType === 'wheel') {
        soundManager.playWheelSound();
      } else if (toyCfg.soundType === 'sleep') {
        soundManager.playSleepSound();
      } else if (toyCfg.soundType === 'eat') {
        soundManager.playEatSound();
      } else if (toyCfg.soundType === 'clean') {
        soundManager.playCleanSound();
      } else {
        soundManager.playSuccessJingle();
      }

      triggerEmote((toyCfg.actionEmote as any) || '✨');
      spawnParticles(6, toyX, toyY + 8, '#fbbf24', toyCfg.particleChar);

      // Применение полезных эффектов игрушки к потребностям хомячка
      if (!zenModeRef.current) {
        setNeeds((prev) => {
          const disabled = disabledStatsRef.current;
          const eff = toyCfg.effects;
          const next = {
            hunger: prev.hunger,
            energy: disabled.energy
              ? prev.energy
              : Math.max(0, Math.min(100, prev.energy + (eff.energyGain ?? 0))),
            happiness: disabled.happiness
              ? prev.happiness
              : Math.max(0, Math.min(100, prev.happiness + (eff.happinessGain ?? 0))),
            hygiene: disabled.hygiene
              ? prev.hygiene
              : Math.max(0, Math.min(100, prev.hygiene + (eff.hygieneGain ?? 0))),
            health: disabled.health
              ? prev.health
              : Math.max(0, Math.min(100, prev.health + (eff.healthGain ?? 0))),
          };
          onNeedsChange?.(next);
          return next;
        });
      }

      changeBehavior(HamsterBehavior.PLAYING_TOY, toyCfg.durationSec);
    },
    [changeBehavior, onNeedsChange, spawnParticles, triggerEmote]
  );

  /**
   * Отправить хомяка поиграть с игрушкой на верхнем этаже.
   * Если он на другом этаже — пробегает по диагональному туннелю.
   */
  const playWithToy = useCallback(
    (floor?: 2 | 3) => {
      const tier = cageTierRef.current;
      if (tier < 2) return;

      let targetFloor: 2 | 3 = 2;
      if (floor) {
        targetFloor = floor;
      } else if (currentFloorRef.current === 3 && tier >= 3) {
        targetFloor = 3;
      } else if (currentFloorRef.current === 2) {
        targetFloor = 2;
      } else {
        targetFloor = 2;
      }

      if (targetFloor > tier) return;

      if (currentFloorRef.current !== targetFloor) {
        requestFloorChange(targetFloor, () => playWithToy(targetFloor));
        return;
      }

      if (behaviorRef.current === HamsterBehavior.SLEEP) {
        isEnteringHouseRef.current = false;
        changeBehavior(HamsterBehavior.IDLE);
      }

      const toyX =
        targetFloor === 2
          ? furnitureRef.current?.positions?.floor2ToyX ?? 235
          : furnitureRef.current?.positions?.floor3ToyX ?? 145;

      const dist = Math.abs(posRef.current.x - toyX);
      if (dist <= 18) {
        executePlayingToy(targetFloor);
      } else {
        isGoingToToyRef.current = { floor: targetFloor };
        isGoingToBowlRef.current = false;
        isGoingToBottleRef.current = false;
        isGoingToWheelRef.current = false;
        isEnteringHouseRef.current = false;
        posRef.current.targetX = toyX;
        posRef.current.flipX = toyX < posRef.current.x;
        triggerEmote('🏃');
        changeBehavior(HamsterBehavior.WALK, 8);
      }
    },
    [changeBehavior, executePlayingToy, requestFloorChange, triggerEmote]
  );

  // Сохраняем ссылку для автономных решений в changeBehavior
  playWithToyRef.current = playWithToy;

  const pet = useCallback(() => {
    if (behaviorRef.current === HamsterBehavior.SLEEP) {
      triggerEmote('💤');
      return;
    }

    soundManager.playPetSound();
    triggerEmote('💖');
    spawnParticles(4, posRef.current.x + 24, posRef.current.y, '#ff4081', '💖');

    if (!zenModeRef.current && !disabledStatsRef.current.happiness) {
      setNeeds((prev) => {
        const next = {
          ...prev,
          happiness: Math.min(100, prev.happiness + 15),
        };
        onNeedsChange?.(next);
        return next;
      });
    }
  }, [triggerEmote, spawnParticles, onNeedsChange]);

  /**
   * Непосредственное выполнение приема пищи (хомячок уже стоит у миски)
   */
  const executeEating = useCallback(
    (food: FoodItem) => {
      currentFoodItemRef.current = food;

      // Хомячок фиксируется строго у миски на 1-м этаже
      currentFloorRef.current = 1;
      setCurrentFloor(1);
      posRef.current.y = 110;

      const { x: bowlX } = getBowlPos();
      const isBowlRight = bowlX >= 240;
      const bowlStandX = isBowlRight ? Math.max(20, bowlX - 30) : Math.min(430, bowlX + 32);
      posRef.current.x = bowlStandX;
      posRef.current.targetX = bowlStandX;
      posRef.current.flipX = !isBowlRight; // лицом к миске

      // Проверка на перекорм (серия быстрых кормлений или кормление при сытости >= 85)
      const now = Date.now();
      recentFeedsTimestampsRef.current = [
        ...recentFeedsTimestampsRef.current.filter((t) => now - t < 15000),
        now,
      ];

      const currentHunger = needsRef.current.hunger;
      const isOverfeeding =
        recentFeedsTimestampsRef.current.length >= 3 ||
        (currentHunger >= 85 && recentFeedsTimestampsRef.current.length >= 2);

      if (isOverfeeding) {
        // Хомячок объелся у миски! Раздувается в пухляша (1.35x)
        chonkScaleRef.current = 1.35;
        setChonkScale(1.35);
        soundManager.playEatSound();
        triggerEmote('🤤');
        spawnParticles(8, posRef.current.x + 24, posRef.current.y + 10, '#f4a261', '🍔');

        // Падает в сытый сон прямо у миски через секунду
        setTimeout(() => {
          triggerEmote('💤');
          changeBehavior(HamsterBehavior.SLEEP, 9999);
        }, 1200);
      } else {
        soundManager.playEatSound();
        triggerEmote('🌾');
        changeBehavior(HamsterBehavior.EATING, food.eatingDurationSec);
        spawnParticles(5, posRef.current.x + 24, posRef.current.y + 10, '#f4a261');
      }

      if (!zenModeRef.current) {
        setNeeds((prev) => {
          const next = {
            ...prev,
            hunger: disabledStatsRef.current.hunger
              ? 100
              : Math.min(100, prev.hunger + food.hungerGain),
            happiness: disabledStatsRef.current.happiness
              ? 100
              : Math.min(100, prev.happiness + food.happinessGain),
            health: disabledStatsRef.current.health
              ? 100
              : Math.min(100, prev.health + food.healthGain),
          };
          onNeedsChange?.(next);
          return next;
        });
      }
    },
    [changeBehavior, getBowlPos, onNeedsChange, spawnParticles, triggerEmote]
  );

  /**
   * Кормление хомячка: хомяк кушает ТОЛЬКО у миски!
   * Если он не у миски или на верхнем этаже — спускается к миске на 1-й этаж.
   */
  const feed = useCallback(
    (food: FoodItem) => {
      // Если хомяк на верхних этажах — сначала спускаемся по туннелю на 1-й этаж
      if (currentFloorRef.current !== 1) {
        requestFloorChange(1, () => feed(food));
        return;
      }

      // Если хомячок спал — просыпается
      if (behaviorRef.current === HamsterBehavior.SLEEP) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        isGoingToBottleRef.current = false;
        isGoingToBowlRef.current = false;
        const { x: houseX } = getHousePos();
        const exitX = houseX < 240 ? houseX + 80 : houseX - 20;
        posRef.current.x = Math.max(20, Math.min(440, exitX));
        posRef.current.targetX = posRef.current.x;
        posRef.current.y = 110;
        currentFloorRef.current = 1;
        setCurrentFloor(1);
        changeBehavior(HamsterBehavior.IDLE);
      }

      currentFoodItemRef.current = food;

      const { x: bowlX } = getBowlPos();
      const isBowlRight = bowlX >= 240;
      const bowlStandX = isBowlRight ? Math.max(20, bowlX - 30) : Math.min(430, bowlX + 32);
      const dist = Math.abs(posRef.current.x - bowlStandX);

      if (dist <= 18) {
        // Уже вплотную у миски — кушает прямо сейчас!
        isGoingToBowlRef.current = false;
        isGoingToBottleRef.current = false;
        isGoingToWheelRef.current = false;
        isEnteringHouseRef.current = false;
        executeEating(food);
      } else {
        // Бежит целенаправленно к миске с кормом
        isGoingToBowlRef.current = true;
        isGoingToBottleRef.current = false;
        isGoingToWheelRef.current = false;
        isEnteringHouseRef.current = false;
        posRef.current.targetX = bowlStandX;
        posRef.current.flipX = bowlStandX < posRef.current.x;
        triggerEmote('🌾');
        changeBehavior(HamsterBehavior.WALK, 10);
      }
    },
    [changeBehavior, executeEating, getBowlPos, getHousePos, requestFloorChange, triggerEmote]
  );

  /**
   * Непосредственное выполнение питья (хомячок уже стоит у поилки)
   */
  const executeDrinking = useCallback(
    (drinkItem: DrinkItem) => {
      currentDrinkItemRef.current = drinkItem;

      // Хомячок фиксируется строго у поилки на 1-м этаже
      currentFloorRef.current = 1;
      setCurrentFloor(1);
      posRef.current.y = 110;

      const { x: bottleX } = getBottlePos();
      const drinkStandX = Math.max(20, Math.min(430, bottleX - 18));
      posRef.current.x = drinkStandX;
      posRef.current.targetX = drinkStandX;
      posRef.current.flipX = false; // лицом к носику поилки

      changeBehavior(HamsterBehavior.DRINKING, drinkItem.drinkingDurationSec);
      soundManager.playDrinkSound();
      triggerEmote((drinkItem.icon as any) || '💧');
      spawnParticles(6, posRef.current.x + 20, posRef.current.y - 4, drinkItem.liquidColor, '💧');

      if (!zenModeRef.current) {
        setNeeds((prev) => {
          const next = {
            ...prev,
            hunger: disabledStatsRef.current.hunger
              ? 100
              : Math.min(100, prev.hunger + drinkItem.hungerGain),
            energy: disabledStatsRef.current.energy
              ? 100
              : Math.min(100, prev.energy + drinkItem.energyGain),
            happiness: disabledStatsRef.current.happiness
              ? 100
              : Math.min(100, prev.happiness + drinkItem.happinessGain),
            health: disabledStatsRef.current.health
              ? 100
              : Math.min(100, prev.health + drinkItem.healthGain),
          };
          onNeedsChange?.(next);
          return next;
        });
      }
    },
    [changeBehavior, getBottlePos, onNeedsChange, spawnParticles, triggerEmote]
  );

  /**
   * Питье воды или сока: хомяк пьет ТОЛЬКО у поилки на 1-м этаже!
   */
  const drink = useCallback(
    (drinkItem: DrinkItem) => {
      // Если хомяк на верхних этажах — сначала спускаемся по туннелю на 1-й этаж
      if (currentFloorRef.current !== 1) {
        requestFloorChange(1, () => drink(drinkItem));
        return;
      }

      if (behaviorRef.current === HamsterBehavior.SLEEP) {
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        isGoingToBottleRef.current = false;
        isGoingToBowlRef.current = false;
        const { x: houseX } = getHousePos();
        const exitX = houseX < 240 ? houseX + 80 : houseX - 20;
        posRef.current.x = Math.max(20, Math.min(440, exitX));
        posRef.current.targetX = posRef.current.x;
        posRef.current.y = 110;
        currentFloorRef.current = 1;
        setCurrentFloor(1);
        changeBehavior(HamsterBehavior.IDLE);
      }

      currentDrinkItemRef.current = drinkItem;

      const { x: bottleX } = getBottlePos();
      const drinkStandX = Math.max(20, Math.min(430, bottleX - 18));
      const dist = Math.abs(posRef.current.x - drinkStandX);

      if (dist <= 18) {
        // Уже возле поилки — сразу пьет!
        isGoingToBottleRef.current = false;
        isGoingToBowlRef.current = false;
        isGoingToWheelRef.current = false;
        isEnteringHouseRef.current = false;
        executeDrinking(drinkItem);
      } else {
        // Идет пешком строго к поилке
        isGoingToBottleRef.current = true;
        isGoingToBowlRef.current = false;
        isEnteringHouseRef.current = false;
        isGoingToWheelRef.current = false;
        posRef.current.targetX = drinkStandX;
        posRef.current.flipX = drinkStandX < posRef.current.x;
        triggerEmote('💧');
        changeBehavior(HamsterBehavior.WALK, 10);
      }
    },
    [changeBehavior, executeDrinking, getBottlePos, getHousePos, requestFloorChange, triggerEmote]
  );

  /**
   * Синхронизация поведения при оффлайн-восстановлении
   */
  const syncBehavior = useCallback((newBehavior: HamsterBehavior) => {
    behaviorRef.current = newBehavior;
    setBehavior(newBehavior);
    if (newBehavior === HamsterBehavior.SLEEP) {
      const { x: houseX } = getHousePos();
      posRef.current.x = houseX + 26;
      posRef.current.targetX = houseX + 26;
    }
  }, [getHousePos]);

  /**
   * Забежать в домик спать или проснуться и выйти наружу
   */
  const toggleSleep = useCallback(() => {
    // 1. Если хомячок УЖЕ спит — по первому клику просыпается и выходит наружу
    if (behaviorRef.current === HamsterBehavior.SLEEP) {
      isEnteringHouseRef.current = false;
      isGoingToWheelRef.current = false;
      isGoingToBottleRef.current = false;
      isGoingToBowlRef.current = false;
      isGoingToToyRef.current = null;
      const { x: houseX } = getHousePos();
      const outsideX = houseX < 240 ? houseX + 80 : houseX - 20;
      posRef.current.x = Math.max(20, Math.min(440, outsideX));
      posRef.current.targetX = posRef.current.x;
      posRef.current.flipX = houseX >= 240;
      changeBehavior(HamsterBehavior.IDLE, 4);
      triggerEmote('☀️');
      soundManager.playClickSound();
      return;
    }

    const { x: houseX } = getHousePos();
    const doorX = houseX + 26;

    // 2. Если он уже идет в домик спать — повторный клик мгновенно укладывает его в постельку
    if (isEnteringHouseRef.current) {
      isEnteringHouseRef.current = false;
      isGoingToWheelRef.current = false;
      isGoingToBottleRef.current = false;
      isGoingToBowlRef.current = false;
      isGoingToToyRef.current = null;
      posRef.current.x = doorX;
      posRef.current.targetX = doorX;
      posRef.current.y = 110;
      currentFloorRef.current = 1;
      setCurrentFloor(1);
      soundManager.playSleepSound();
      triggerEmote('💤');
      changeBehavior(HamsterBehavior.SLEEP, 9999);
      return;
    }

    // 3. Проверка: выспался ли хомячок и много ли энергии?
    // Требование: если хомяк выспанный и энергии много (>= 80%),
    // хомяк показывает крестик ❌ и издает звук "Грр" (недовольный)
    const isWellRested =
      !disabledStatsRef.current.energy && needsRef.current.energy >= 80;

    if (isWellRested) {
      soundManager.playGrrSound();
      triggerEmote('❌');
      // Недовольное ворчание и отказ спать
      changeBehavior(HamsterBehavior.SNIFF, 2.5);
      return;
    }

    // 4. Хомячок устал (энергии < 80%) — ложится спать надежно с первого раза!
    // Если хомячок на верхнем этаже (2 или 3) — сначала спускаемся по гофре на 1-й этаж
    if (currentFloorRef.current !== 1) {
      triggerEmote('💤');
      isEnteringHouseRef.current = true;
      requestFloorChange(1, () => {
        const { x: hX } = getHousePos();
        const dX = hX + 26;
        posRef.current.x = dX;
        posRef.current.targetX = dX;
        posRef.current.y = 110;
        currentFloorRef.current = 1;
        setCurrentFloor(1);
        isEnteringHouseRef.current = false;
        soundManager.playSleepSound();
        triggerEmote('💤');
        changeBehavior(HamsterBehavior.SLEEP, 9999);
      });
      return;
    }

    // На 1-м этаже:
    const distToDoor = Math.abs(posRef.current.x - doorX);
    if (distToDoor <= 26) {
      // Уже вплотную у домика — сразу засыпает
      isEnteringHouseRef.current = false;
      isGoingToWheelRef.current = false;
      isGoingToBottleRef.current = false;
      isGoingToBowlRef.current = false;
      isGoingToToyRef.current = null;
      posRef.current.x = doorX;
      posRef.current.targetX = doorX;
      posRef.current.y = 110;
      soundManager.playSleepSound();
      triggerEmote('💤');
      changeBehavior(HamsterBehavior.SLEEP, 9999);
    } else {
      // Бежит целенаправленно к двери домика
      isEnteringHouseRef.current = true;
      isGoingToWheelRef.current = false;
      isGoingToBottleRef.current = false;
      isGoingToBowlRef.current = false;
      isGoingToToyRef.current = null;
      posRef.current.targetX = doorX;
      posRef.current.flipX = doorX < posRef.current.x;
      soundManager.playSleepSound();
      triggerEmote('💤');
      changeBehavior(HamsterBehavior.WALK, 12);
    }
  }, [changeBehavior, getHousePos, requestFloorChange, triggerEmote]);

  /**
   * Взять хомячка на ручки мышкой (Drag & Drop старт)
   */
  const pickUpHamster = useCallback(() => {
    isHeldRef.current = true;
    isEnteringHouseRef.current = false;
    isGoingToWheelRef.current = false;
    isGoingToBottleRef.current = false;
    isGoingToBowlRef.current = false;

    if (
      behaviorRef.current === HamsterBehavior.SLEEP ||
      behaviorRef.current === HamsterBehavior.WHEEL
    ) {
      behaviorRef.current = HamsterBehavior.IDLE;
      setBehavior(HamsterBehavior.IDLE);
      onBehaviorChange?.(HamsterBehavior.IDLE);
    }
    posRef.current.vx = 0;
    posRef.current.targetX = posRef.current.x;
  }, [onBehaviorChange]);

  /**
   * Отпустить хомячка с рук (Drag & Drop финиш с детекцией этажа)
   */
  const dropHamster = useCallback(
    (dropX: number, dropY: number) => {
      isHeldRef.current = false;
      isEnteringHouseRef.current = false;
      isGoingToWheelRef.current = false;
      isGoingToBottleRef.current = false;
      isGoingToBowlRef.current = false;

      const tier = cageTierRef.current;
      let finalFloor: 1 | 2 | 3 = 1;
      let finalY = 110;
      let finalX = Math.max(30, Math.min(430, dropX));

      if (tier === 3 && dropY <= -160) {
        // Посадили на 3-й этаж (пентхаус)!
        finalFloor = 3;
        finalY = -250;
        soundManager.playClickSound();
        triggerEmote('🌟');
      } else if (tier >= 2 && dropY <= 20) {
        // Посадили на 2-й этаж (деревянный мезонин)!
        finalFloor = 2;
        finalY = -70;
        soundManager.playClickSound();
        triggerEmote('✨');
      } else {
        // Посадили на 1-й этаж (опилки клетки)
        finalFloor = 1;
        finalY = 110;
        soundManager.playClickSound();
        triggerEmote('✨');
      }

      currentFloorRef.current = finalFloor;
      setCurrentFloor(finalFloor);
      posRef.current.x = finalX;
      posRef.current.y = finalY;
      posRef.current.targetX = finalX;
      posRef.current.vx = 0;

      // Хомячок приземлился! Переводим в IDLE на 4 секунды
      changeBehavior(HamsterBehavior.IDLE, 4);
      spawnParticles(7, finalX + 24, finalY + 24, '#fbe09e');
    },
    [changeBehavior, triggerEmote, spawnParticles]
  );

  /**
   * Телепортация хомячка на конкретный этаж (для мгновенного тестирования в админке)
   */
  const teleportToFloor = useCallback(
    (floor: 1 | 2 | 3) => {
      currentFloorRef.current = floor;
      setCurrentFloor(floor);

      if (floor === 1) {
        posRef.current.y = 110;
        posRef.current.x = 220;
      } else if (floor === 2) {
        posRef.current.y = -70;
        posRef.current.x = 220;
      } else if (floor === 3) {
        posRef.current.y = -250;
        posRef.current.x = 220;
      }

      posRef.current.targetX = posRef.current.x;
      posRef.current.vx = 0;
      changeBehavior(HamsterBehavior.IDLE, 3);
      soundManager.playClickSound();
      triggerEmote(floor === 3 ? '🌟' : '✨');
    },
    [changeBehavior, triggerEmote]
  );

  const cleanPoop = useCallback(
    (poopId: string) => {
      const target = poopsRef.current.find((p) => p.id === poopId);
      if (target) {
        spawnParticles(6, target.x + 6, target.y + 4, '#fee761', '✨');
      }

      soundManager.playCleanSound();
      const nextPoops = poopsRef.current.filter((p) => p.id !== poopId);
      poopsRef.current = nextPoops;
      setPoops(nextPoops);
      onPoopsChange?.(nextPoops);

      if (!zenModeRef.current) {
        setNeeds((prev) => {
          const next = {
            ...prev,
            hygiene: disabledStatsRef.current.hygiene
              ? 100
              : Math.min(100, prev.hygiene + 20),
            happiness: disabledStatsRef.current.happiness
              ? 100
              : Math.min(100, prev.happiness + 8),
          };
          onNeedsChange?.(next);
          return next;
        });
      }
    },
    [spawnParticles, onPoopsChange, onNeedsChange]
  );

  const fixedUpdate = useCallback(
    (dt: number) => {
      // Если хомячка держат на ручках мышкой — физиология и авто-движение замирают
      if (isHeldRef.current) {
        stateTimeRef.current = 0;
        posRef.current.targetX = posRef.current.x;
        posRef.current.vx = 0;
        return;
      }

      stateTimeRef.current += dt;
      const currentBehavior = behaviorRef.current;
      const isZen = zenModeRef.current;
      const disabled = disabledStatsRef.current;

      // 0. ОБРАБОТКА ДИАГОНАЛЬНОГО ТУННЕЛЯ (ПОЯВЛЕНИЕ, ПРОБЕЖКА ПО ДИАГОНАЛИ, ИСЧЕЗНОВЕНИЕ)
      if (tunnelTransitionRef.current?.active) {
        const trans = tunnelTransitionRef.current;
        const geom = DIAGONAL_TUNNELS[trans.tunnelIndex];
        const isGoingUp = trans.toFloor > trans.fromFloor;
        const startX = isGoingUp ? geom.startX : geom.endX;
        const startY = isGoingUp ? geom.startY : geom.endY;
        const endX = isGoingUp ? geom.endX : geom.startX;
        const endY = isGoingUp ? geom.endY : geom.startY;

        // Фаза 1: Плавное появление туннеля (opacity 0 -> 1)
        if (trans.opacity < 1.0 && trans.progress === 0) {
          trans.opacity = Math.min(1.0, trans.opacity + dt * 3.2);
          posRef.current.x = startX;
          posRef.current.y = startY;
          return;
        }

        // Фаза 2: Хомячок бежит по диагонали внутри туннеля
        if (trans.progress < 1.0) {
          trans.progress = Math.min(1.0, trans.progress + dt * 0.55);
          const t = trans.progress;
          posRef.current.x = Math.round(startX + t * (endX - startX));
          posRef.current.y = Math.round(startY + t * (endY - startY));
          posRef.current.flipX = endX < startX;

          if (Math.random() < dt * 0.9) {
            soundManager.playTunnelSound();
          }
          return;
        }

        // Фаза 3: Хомячок прибыл на целевой этаж, туннель растворяется (opacity 1 -> 0)
        posRef.current.x = endX;
        posRef.current.y = endY;
        currentFloorRef.current = trans.toFloor;
        setCurrentFloor(trans.toFloor);

        trans.opacity = Math.max(0, trans.opacity - dt * 3.2);

        if (trans.opacity <= 0) {
          // Переход завершен!
          tunnelTransitionRef.current = null;
          setTunnelTransition(null);
          soundManager.playSuccessJingle();
          triggerEmote(trans.toFloor === 3 ? '🌟' : '✨');

          const floorWalkingY = trans.toFloor === 1 ? 110 : trans.toFloor === 2 ? -70 : -250;
          posRef.current.x = Math.max(40, Math.min(430, endX - 24));
          posRef.current.y = floorWalkingY;
          posRef.current.targetX = posRef.current.x;

          if (pendingActionRef.current) {
            const act = pendingActionRef.current;
            pendingActionRef.current = null;
            act();
          } else {
            changeBehavior(HamsterBehavior.IDLE, 3);
          }
        }
        return;
      }

      // 1. Физиологические таймеры (только если Дзен выключен)
      if (!isZen) {
        if (!disabled.hunger) {
          hungerTimerRef.current += dt;
          if (hungerTimerRef.current >= 25) {
            hungerTimerRef.current = 0;
            setNeeds((prev) => {
              const next = { ...prev, hunger: Math.max(0, prev.hunger - 1) };
              onNeedsChange?.(next);
              return next;
            });
          }
        }

        if (!disabled.energy) {
          energyTimerRef.current += dt;
          if (currentBehavior === HamsterBehavior.SLEEP) {
            if (energyTimerRef.current >= 5) {
              energyTimerRef.current = 0;
              setNeeds((prev) => {
                const next = { ...prev, energy: Math.min(100, prev.energy + 1) };
                if (next.energy >= 100) {
                  changeBehavior(HamsterBehavior.IDLE);
                  soundManager.playSuccessJingle();
                }
                onNeedsChange?.(next);
                return next;
              });
            }
          } else if (currentBehavior === HamsterBehavior.WHEEL) {
            // Бег в колесе сжигает энергию активнее: каждые 6 сек -1%
            if (energyTimerRef.current >= 6) {
              energyTimerRef.current = 0;
              setNeeds((prev) => {
                const next = { ...prev, energy: Math.max(0, prev.energy - 1) };
                onNeedsChange?.(next);
                return next;
              });
            }
          } else {
            if (energyTimerRef.current >= 35) {
              energyTimerRef.current = 0;
              setNeeds((prev) => {
                const next = { ...prev, energy: Math.max(0, prev.energy - 1) };
                onNeedsChange?.(next);
                return next;
              });
            }
          }
        }

        if (!disabled.hygiene) {
          hygieneTimerRef.current += dt;
          if (hygieneTimerRef.current >= 40) {
            hygieneTimerRef.current = 0;
            setNeeds((prev) => {
              const next = { ...prev, hygiene: Math.max(0, prev.hygiene - 1) };
              onNeedsChange?.(next);
              return next;
            });
          }
        }

        if (!disabled.health) {
          healthTimerRef.current += dt;
          if (healthTimerRef.current >= 15) {
            healthTimerRef.current = 0;
            if (needsRef.current.hunger <= 0 || needsRef.current.hygiene <= 0) {
              triggerEmote('⚠️');
              setNeeds((prev) => {
                const next = { ...prev, health: Math.max(0, prev.health - 2) };
                onNeedsChange?.(next);
                return next;
              });
            }
          }
        }
      }

      // Пузырьки сна и переваривание пищи (плавное сдувание пухляша)
      if (currentBehavior === HamsterBehavior.SLEEP) {
        sleepZzzTimerRef.current += dt;
        if (sleepZzzTimerRef.current >= 3.5) {
          sleepZzzTimerRef.current = 0;
          triggerEmote('💤');
        }

        // Если хомячок объелся — во сне пища переваривается и он постепенно сдувается
        if (chonkScaleRef.current > 1.0) {
          const nextScale = Math.max(1.0, chonkScaleRef.current - dt * 0.02);
          chonkScaleRef.current = nextScale;
          setChonkScale(nextScale);
        }
      }

      // Стрекотание колеса во время бега
      if (currentBehavior === HamsterBehavior.WHEEL) {
        wheelSoundTimerRef.current += dt;
        if (wheelSoundTimerRef.current >= 0.4) {
          wheelSoundTimerRef.current = 0;
          soundManager.playWheelSound();
        }
      }

      // Звуки питья и пузырьки напитка
      if (currentBehavior === HamsterBehavior.DRINKING) {
        drinkSoundTimerRef.current += dt;
        if (drinkSoundTimerRef.current >= 0.7) {
          drinkSoundTimerRef.current = 0;
          soundManager.playDrinkSound();
          const col = currentDrinkItemRef.current?.liquidColor || '#38bdf8';
          spawnParticles(2, posRef.current.x + 20, posRef.current.y - 4, col);
        }
      }

      // 2. Движение при ходьбе по широкой клетке
      if (currentBehavior === HamsterBehavior.WALK) {
        const dx = posRef.current.targetX - posRef.current.x;
        const isInTunnel = Boolean(tunnelTransitionRef.current?.active);
        const walkSpeed =
          isInTunnel
            ? 70
            : isEnteringHouseRef.current ||
              isGoingToWheelRef.current ||
              isGoingToBottleRef.current ||
              isGoingToBowlRef.current ||
              Boolean(isGoingToToyRef.current)
            ? 56
            : 32;

        if (Math.abs(dx) > 3) {
          const step = Math.sign(dx) * walkSpeed * dt;
          posRef.current.x += step;
          posRef.current.flipX = dx < 0;
        } else {
          // Пришел к домику спать
          if (isEnteringHouseRef.current) {
            isEnteringHouseRef.current = false;
            currentFloorRef.current = 1;
            setCurrentFloor(1);
            posRef.current.y = 110;
            const { x: houseX } = getHousePos();
            posRef.current.x = houseX + 26;
            posRef.current.targetX = houseX + 26;
            changeBehavior(HamsterBehavior.SLEEP, 9999);
            return;
          }

          // Пришел к колесу бегать
          if (isGoingToWheelRef.current) {
            isGoingToWheelRef.current = false;
            changeBehavior(HamsterBehavior.WHEEL, 5 + Math.random() * 4);
            return;
          }

          // Пришел к миске кушать
          if (isGoingToBowlRef.current) {
            isGoingToBowlRef.current = false;
            currentFloorRef.current = 1;
            setCurrentFloor(1);
            posRef.current.y = 110;
            const food = currentFoodItemRef.current;
            if (food) {
              executeEating(food);
            }
            return;
          }

          // Пришел к поилке пить
          if (isGoingToBottleRef.current) {
            isGoingToBottleRef.current = false;
            currentFloorRef.current = 1;
            setCurrentFloor(1);
            posRef.current.y = 110;
            const item = currentDrinkItemRef.current;
            if (item) {
              executeDrinking(item);
            }
            return;
          }

          // Пришел к игрушке играть на верхнем этаже
          if (isGoingToToyRef.current) {
            const fl = isGoingToToyRef.current.floor;
            isGoingToToyRef.current = null;
            executePlayingToy(fl);
            return;
          }

          // Завершение обычной прогулки
          const roll = Math.random();
          if (roll < 0.3) {
            changeBehavior(HamsterBehavior.SNIFF, 3);
          } else if (roll < 0.6) {
            changeBehavior(HamsterBehavior.GROOM, 3);
          } else if (roll < 0.8) {
            changeBehavior(HamsterBehavior.IDLE, 4);
          } else {
            changeBehavior(HamsterBehavior.LAYING, 4);
          }
        }
      }

      // 3. Завершение временных состояний:
      if (
        (currentBehavior === HamsterBehavior.EATING ||
          currentBehavior === HamsterBehavior.DRINKING ||
          currentBehavior === HamsterBehavior.GROOM ||
          currentBehavior === HamsterBehavior.SNIFF ||
          currentBehavior === HamsterBehavior.WHEEL ||
          currentBehavior === HamsterBehavior.PLAYING_TOY) &&
        stateTimeRef.current >= stateDurationRef.current
      ) {
        activeToyFloorRef.current = null;
        setActiveToyFloor(null);
        changeBehavior(HamsterBehavior.IDLE);
      }

      // 4. Появление какашки (только если не Дзен и гигиена включена)
      if (
        currentBehavior === HamsterBehavior.POOPING &&
        stateTimeRef.current >= stateDurationRef.current
      ) {
        if (!isZen && !disabled.hygiene) {
          const currentFloor = currentFloorRef.current;
          const poopY =
            currentFloor === 2 ? -30 : currentFloor === 3 ? -210 : 154;
          const newPoop: PoopItem = {
            id: `poop_${Date.now()}`,
            x: Math.floor(posRef.current.x + 10),
            y: poopY,
            createdAt: Date.now(),
          };
          const updatedPoops = [...poopsRef.current, newPoop];
          poopsRef.current = updatedPoops;
          setPoops(updatedPoops);
          onPoopsChange?.(updatedPoops);

          setNeeds((prev) => {
            const next = { ...prev, hygiene: Math.max(0, prev.hygiene - 15) };
            onNeedsChange?.(next);
            return next;
          });
        }
        changeBehavior(HamsterBehavior.IDLE);
      }

      // 5. Переходы из IDLE и LAYING
      if (
        (currentBehavior === HamsterBehavior.IDLE ||
          currentBehavior === HamsterBehavior.LAYING) &&
        stateTimeRef.current >= stateDurationRef.current
      ) {
        const bowlLevel = furnitureRef.current?.bowlFoodLevel ?? 100;
        if (!isZen && !disabled.energy && needsRef.current.energy < 20) {
          toggleSleep();
        } else if (
          !isZen &&
          !disabled.hunger &&
          needsRef.current.hunger < 35 &&
          bowlLevel > 0
        ) {
          // Хомячок проголодался и сам идет кушать к миске
          const curFoodId = furnitureRef.current?.currentFoodId;
          const food = FOOD_ITEMS.find((f) => f.id === curFoodId) || FOOD_ITEMS[0];
          feed(food);
        } else if (
          !isZen &&
          !disabled.hygiene &&
          needsRef.current.hygiene < 35 &&
          poopsRef.current.length < 5
        ) {
          changeBehavior(HamsterBehavior.POOPING, 2.5);
        } else {
          // Случайное поведение хомяка в клетке (без мгновенных прыжков!)
          const roll = Math.random();
          if (roll < 0.3) {
            changeBehavior(HamsterBehavior.WALK);
          } else if (roll < 0.5) {
            goToWheel();
          } else if (roll < 0.65) {
            // Если в поилке есть вода, хомячок может сам подойти попить
            const waterLevel = furnitureRef.current?.bottleWaterLevel ?? 100;
            if (waterLevel > 0 && Math.random() < 0.5) {
              drink({
                id: 'water_sip',
                name: 'Глоток воды',
                description: 'Освежиться у поилки',
                icon: '💧',
                liquidColor: furnitureRef.current?.drinkColor || '#38bdf8',
                hungerGain: 2,
                energyGain: 8,
                happinessGain: 6,
                healthGain: 4,
                drinkingDurationSec: 3.5,
              });
            } else {
              changeBehavior(HamsterBehavior.GROOM, 3 + Math.random() * 2);
            }
          } else if (roll < 0.78) {
            changeBehavior(HamsterBehavior.GROOM, 3 + Math.random() * 2);
          } else if (roll < 0.9) {
            changeBehavior(HamsterBehavior.SNIFF, 2.5 + Math.random() * 2);
          } else {
            changeBehavior(HamsterBehavior.LAYING, 4 + Math.random() * 3);
          }
        }
      }

      // 6. Частицы
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            life: p.life + dt,
          }))
          .filter((p) => p.life < p.maxLife)
      );

      // 7. Спич-бабблы
      setEmotes((prev) =>
        prev
          .map((e) => {
            const age = Date.now() - e.createdAt;
            const progress = age / e.durationMs;
            return {
              ...e,
              offsetY: -progress * 16,
              opacity: 1 - Math.max(0, (progress - 0.7) / 0.3),
            };
          })
          .filter((e) => Date.now() - e.createdAt < e.durationMs)
      );
    },
    [
      changeBehavior,
      getHousePos,
      goToWheel,
      drink,
      toggleSleep,
      onNeedsChange,
      onPoopsChange,
      triggerEmote,
      spawnParticles,
    ]
  );

  return {
    behavior,
    needs,
    poops,
    emotes,
    particles,
    posRef,
    stateTimeRef,
    chonkScale,
    setChonkScale,
    pickUpHamster,
    dropHamster,
    fixedUpdate,
    changeBehavior,
    syncBehavior,
    goToWheel,
    pet,
    feed,
    drink,
    toggleSleep,
    cleanPoop,
    triggerEmote,
    spawnParticles,
    setNeeds,
    setPoops,
    currentFloor,
    teleportToFloor,
    tunnelTransition,
    tunnelTransitionRef,
    requestFloorChange,
    playWithToy,
    activeToyFloor,
  };
}
