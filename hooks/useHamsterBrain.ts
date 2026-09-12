/**
 * ============================================================================
 * КАСТОМНЫЙ ХУК: useHamsterBrain (Конечный Автомат и Искусственный Интеллект)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Поведение живого питомца — это не случайный набор реакций, а модель
 *    Конечного Автомата (Finite State Machine, FSM), управляемая внутренними
 *    потребностями (Hunger, Energy, Hygiene, Happiness, Health).
 *    Вынесение логики ИИ в отдельный хук изолирует геймплейные правила от рендеринга
 *    (Принцип единственной ответственности - Single Responsibility Principle).
 * 
 * 2. КАК ЭТО РАБОТАЕТ (Algorithmic Essence):
 *    - Внутренние таймеры:
 *      Каждые 25 секунд голод падает на 1 ед.
 *      Каждые 35 секунд бодрствования энергия падает на 1 ед. Во сне — восстанавливается!
 *    - Взвешенные переходы FSM (Markov Decision Chain):
 *      В состоянии IDLE хомяк каждые 3-7 секунд выбирает следующее действие на основе весов:
 *        * Если энергия < 20: 70% шанс заснуть (SLEEP).
 *        * Если гигиена < 35: 80% позыв в туалет (POOPING).
 *        * Обычное состояние: 50% бродить по клетке (WALK), 30% прилечь (LAYING), 20% остаться в IDLE.
 * 
 * 3. ПОДВОДНЫЕ КАМНИ (Pitfalls & Gotchas):
 *    - Застревание в циклах состояний: Если не ограничивать таймеры состояний,
 *      хомяк может вечно ходить туда-сюда. Каждое состояние имеет строгое время жизни (`stateTime`).
 *    - Состояние сна: Если игрок пытается кормить спящего хомяка, стейт-машина должна
 *      либо разбудить его, либо отклонить действие с эмодзи 💤.
 * ============================================================================
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import {
  HamsterBehavior,
  HamsterNeeds,
  PoopItem,
  EmoteBubble,
  Particle,
  FoodItem,
} from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export interface HamsterBrainProps {
  initialNeeds: HamsterNeeds;
  initialBehavior: HamsterBehavior;
  initialPoops: PoopItem[];
  onNeedsChange?: (needs: HamsterNeeds) => void;
  onBehaviorChange?: (behavior: HamsterBehavior) => void;
  onPoopsChange?: (poops: PoopItem[]) => void;
}

export function useHamsterBrain({
  initialNeeds,
  initialBehavior,
  initialPoops,
  onNeedsChange,
  onBehaviorChange,
  onPoopsChange,
}: HamsterBrainProps) {
  // Текущее дискретное поведение для UI
  const [behavior, setBehavior] = useState<HamsterBehavior>(initialBehavior);
  const [needs, setNeeds] = useState<HamsterNeeds>(initialNeeds);
  const [poops, setPoops] = useState<PoopItem[]>(initialPoops);
  const [emotes, setEmotes] = useState<EmoteBubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Высокочастотные физические параметры в Ref (без ререндеров React 60 раз/сек)
  const posRef = useRef({
    x: 140, // Начальная позиция X в виртуальном буфере 320x240
    y: 172, // Уровень пола клетки (лапки касаются пола)
    vx: 0,
    targetX: 140,
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

  // Таймеры спада потребностей
  const hungerTimerRef = useRef<number>(0);
  const energyTimerRef = useRef<number>(0);
  const hygieneTimerRef = useRef<number>(0);
  const healthTimerRef = useRef<number>(0);
  const sleepZzzTimerRef = useRef<number>(0);

  /**
   * Запуск всплывающего эмодзи-баббла
   */
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

  /**
   * Спавн пиксельных частиц (сердечки, крошки, искры)
   */
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
   * Смена поведения хомяка
   */
  const changeBehavior = useCallback(
    (newBehavior: HamsterBehavior, customDuration?: number) => {
      behaviorRef.current = newBehavior;
      setBehavior(newBehavior);
      stateTimeRef.current = 0;
      stateDurationRef.current = customDuration ?? (3 + Math.random() * 4);

      if (newBehavior === HamsterBehavior.WALK) {
        // Выбираем новую цель блуждания по полу клетки (между x=60 и x=240)
        const targetX = Math.floor(60 + Math.random() * 180);
        posRef.current.targetX = targetX;
        posRef.current.flipX = targetX < posRef.current.x;
      } else if (newBehavior === HamsterBehavior.POOPING) {
        soundManager.playPoopSound();
        triggerEmote('💩');
      } else if (newBehavior === HamsterBehavior.SLEEP) {
        soundManager.playSleepSound();
        triggerEmote('💤');
      }

      onBehaviorChange?.(newBehavior);
    },
    [onBehaviorChange, triggerEmote]
  );

  /**
   * Погладить хомяка
   */
  const pet = useCallback(() => {
    if (behaviorRef.current === HamsterBehavior.SLEEP) {
      triggerEmote('💤');
      return;
    }

    soundManager.playPetSound();
    triggerEmote('💖');
    spawnParticles(4, posRef.current.x + 20, posRef.current.y, '#ff4081', '💖');

    setNeeds((prev) => {
      const next = {
        ...prev,
        happiness: Math.min(100, prev.happiness + 15),
      };
      onNeedsChange?.(next);
      return next;
    });
  }, [triggerEmote, spawnParticles, onNeedsChange]);

  /**
   * Накормить хомячка выбранным блюдом
   */
  const feed = useCallback(
    (food: FoodItem) => {
      if (behaviorRef.current === HamsterBehavior.SLEEP) {
        // Спящий хомяк просыпается от запаха еды
        changeBehavior(HamsterBehavior.IDLE);
      }

      soundManager.playEatSound();
      triggerEmote('🌾');
      changeBehavior(HamsterBehavior.EATING, food.eatingDurationSec);
      spawnParticles(5, posRef.current.x + 20, posRef.current.y + 10, '#f4a261');

      // Обновляем показатели
      setNeeds((prev) => {
        const next = {
          ...prev,
          hunger: Math.min(100, prev.hunger + food.hungerGain),
          happiness: Math.min(100, prev.happiness + food.happinessGain),
          health: Math.min(100, prev.health + food.healthGain),
        };
        onNeedsChange?.(next);
        return next;
      });
    },
    [changeBehavior, triggerEmote, spawnParticles, onNeedsChange]
  );

  /**
   * Уложить спать / Разбудить
   */
  const toggleSleep = useCallback(() => {
    if (behaviorRef.current === HamsterBehavior.SLEEP) {
      // Разбудить
      changeBehavior(HamsterBehavior.IDLE);
      soundManager.playClickSound();
    } else {
      // Уложить спать
      changeBehavior(HamsterBehavior.SLEEP, 9999);
    }
  }, [changeBehavior]);

  /**
   * Убрать какашку кликом игрока (+гигиена, +счастье, звук блеска)
   */
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

      setNeeds((prev) => {
        const next = {
          ...prev,
          hygiene: Math.min(100, prev.hygiene + 20),
          happiness: Math.min(100, prev.happiness + 8),
        };
        onNeedsChange?.(next);
        return next;
      });
    },
    [spawnParticles, onPoopsChange, onNeedsChange]
  );

  /**
   * Главный фиксированный тик логики и физики (вызывается из useGameLoop с FIXED_TIMESTEP)
   */
  const fixedUpdate = useCallback(
    (dt: number) => {
      stateTimeRef.current += dt;
      const currentBehavior = behaviorRef.current;
      const currentNeeds = needsRef.current;

      // 1. Расчет физиологических таймеров:
      hungerTimerRef.current += dt;
      if (hungerTimerRef.current >= 25) {
        hungerTimerRef.current = 0;
        setNeeds((prev) => {
          const next = { ...prev, hunger: Math.max(0, prev.hunger - 1) };
          onNeedsChange?.(next);
          return next;
        });
      }

      energyTimerRef.current += dt;
      if (currentBehavior === HamsterBehavior.SLEEP) {
        // Во сне восстанавливает энергию: +1 каждые 5 сек
        if (energyTimerRef.current >= 5) {
          energyTimerRef.current = 0;
          setNeeds((prev) => {
            const next = { ...prev, energy: Math.min(100, prev.energy + 1) };
            if (next.energy >= 100) {
              // Автоматически просыпается, когда полон сил
              changeBehavior(HamsterBehavior.IDLE);
              soundManager.playSuccessJingle();
            }
            onNeedsChange?.(next);
            return next;
          });
        }

        // Пузыри "Zzz" во время сна
        sleepZzzTimerRef.current += dt;
        if (sleepZzzTimerRef.current >= 3.5) {
          sleepZzzTimerRef.current = 0;
          triggerEmote('💤');
        }
      } else {
        // Во время бодрствования теряет энергию: -1 каждые 35 сек
        if (energyTimerRef.current >= 35) {
          energyTimerRef.current = 0;
          setNeeds((prev) => {
            const next = { ...prev, energy: Math.max(0, prev.energy - 1) };
            onNeedsChange?.(next);
            return next;
          });
        }
      }

      hygieneTimerRef.current += dt;
      if (hygieneTimerRef.current >= 40) {
        hygieneTimerRef.current = 0;
        setNeeds((prev) => {
          const next = { ...prev, hygiene: Math.max(0, prev.hygiene - 1) };
          onNeedsChange?.(next);
          return next;
        });
      }

      // Здоровье: если голод или гигиена на нуле — теряем здоровье
      healthTimerRef.current += dt;
      if (healthTimerRef.current >= 15) {
        healthTimerRef.current = 0;
        if (currentNeeds.hunger <= 0 || currentNeeds.hygiene <= 0) {
          triggerEmote('⚠️');
          setNeeds((prev) => {
            const next = { ...prev, health: Math.max(0, prev.health - 2) };
            onNeedsChange?.(next);
            return next;
          });
        }
      }

      // 2. Логика движения и анимации в состояниях:
      if (currentBehavior === HamsterBehavior.WALK) {
        const dx = posRef.current.targetX - posRef.current.x;
        const walkSpeed = 28; // пикселей в секунду

        if (Math.abs(dx) > 2) {
          const step = Math.sign(dx) * walkSpeed * dt;
          posRef.current.x += step;
          posRef.current.flipX = dx < 0;
        } else {
          // Достиг цели — переходим в отдых
          changeBehavior(Math.random() > 0.4 ? HamsterBehavior.IDLE : HamsterBehavior.LAYING);
        }
      }

      // 3. Завершение временных состояний (EATING, POOPING):
      if (
        currentBehavior === HamsterBehavior.EATING &&
        stateTimeRef.current >= stateDurationRef.current
      ) {
        changeBehavior(HamsterBehavior.IDLE);
      }

      if (
        currentBehavior === HamsterBehavior.POOPING &&
        stateTimeRef.current >= stateDurationRef.current
      ) {
        // Оставляем какашку в точке нахождения хомяка
        const newPoop: PoopItem = {
          id: `poop_${Date.now()}`,
          x: Math.floor(posRef.current.x + 10),
          y: Math.floor(posRef.current.y + 24),
          createdAt: Date.now(),
        };
        const updatedPoops = [...poopsRef.current, newPoop];
        poopsRef.current = updatedPoops;
        setPoops(updatedPoops);
        onPoopsChange?.(updatedPoops);

        // Снижаем гигиену
        setNeeds((prev) => {
          const next = { ...prev, hygiene: Math.max(0, prev.hygiene - 15) };
          onNeedsChange?.(next);
          return next;
        });

        changeBehavior(HamsterBehavior.IDLE);
      }

      // 4. Смена состояний по истечении времени в IDLE / LAYING:
      if (
        (currentBehavior === HamsterBehavior.IDLE || currentBehavior === HamsterBehavior.LAYING) &&
        stateTimeRef.current >= stateDurationRef.current
      ) {
        // Проверка физиологических приоритетов:
        if (currentNeeds.energy < 20) {
          changeBehavior(HamsterBehavior.SLEEP);
        } else if (currentNeeds.hygiene < 35 && poopsRef.current.length < 6) {
          changeBehavior(HamsterBehavior.POOPING, 2.5);
        } else {
          // Случайный выбор следующего занятия
          const roll = Math.random();
          if (roll < 0.5) {
            changeBehavior(HamsterBehavior.WALK);
          } else if (roll < 0.8) {
            changeBehavior(HamsterBehavior.IDLE);
          } else {
            changeBehavior(HamsterBehavior.LAYING);
          }
        }
      }

      // 5. Физика частиц
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

      // 6. Плавное всплывание и угасание спич-бабблов
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
    [changeBehavior, onNeedsChange, onPoopsChange, triggerEmote]
  );

  return {
    behavior,
    needs,
    poops,
    emotes,
    particles,
    posRef,
    stateTimeRef,
    fixedUpdate,
    changeBehavior,
    pet,
    feed,
    toggleSleep,
    cleanPoop,
    triggerEmote,
    spawnParticles,
    setNeeds,
    setPoops,
  };
}
