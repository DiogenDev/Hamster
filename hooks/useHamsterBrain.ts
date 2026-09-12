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

import { useState, useRef, useCallback } from 'react';
import {
  HamsterBehavior,
  HamsterNeeds,
  PoopItem,
  EmoteBubble,
  Particle,
  FoodItem,
  DisabledStatsConfig,
} from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export interface HamsterBrainProps {
  initialNeeds: HamsterNeeds;
  initialBehavior: HamsterBehavior;
  initialPoops: PoopItem[];
  zenMode?: boolean;
  disabledStats?: DisabledStatsConfig;
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
  onNeedsChange,
  onBehaviorChange,
  onPoopsChange,
}: HamsterBrainProps) {
  const [behavior, setBehavior] = useState<HamsterBehavior>(initialBehavior);
  const [needs, setNeeds] = useState<HamsterNeeds>(initialNeeds);
  const [poops, setPoops] = useState<PoopItem[]>(initialPoops);
  const [emotes, setEmotes] = useState<EmoteBubble[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Высокочастотные координаты в виртуальном буфере 480x180
  // Уровень пола клетки: y = 100 (при высоте спрайта 44px, ножки стоят на опилках y=144)
  const posRef = useRef({
    x: 220,
    y: 100,
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

  // Таймеры
  const hungerTimerRef = useRef<number>(0);
  const energyTimerRef = useRef<number>(0);
  const hygieneTimerRef = useRef<number>(0);
  const healthTimerRef = useRef<number>(0);
  const sleepZzzTimerRef = useRef<number>(0);
  const wheelSoundTimerRef = useRef<number>(0);

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

  const changeBehavior = useCallback(
    (newBehavior: HamsterBehavior, customDuration?: number) => {
      behaviorRef.current = newBehavior;
      setBehavior(newBehavior);
      stateTimeRef.current = 0;
      stateDurationRef.current = customDuration ?? (3 + Math.random() * 4);

      if (newBehavior === HamsterBehavior.WALK) {
        // Выбираем новую случайную цель по широкому дну клетки (x: 75 .. 410)
        const targetX = Math.floor(75 + Math.random() * 335);
        posRef.current.targetX = targetX;
        posRef.current.flipX = targetX < posRef.current.x;
      } else if (newBehavior === HamsterBehavior.WHEEL) {
        posRef.current.x = 34;
        posRef.current.flipX = false;
        soundManager.playWheelSound();
        triggerEmote('🎡');
      } else if (newBehavior === HamsterBehavior.GROOM) {
        triggerEmote('✨');
      } else if (newBehavior === HamsterBehavior.SNIFF) {
        triggerEmote('🌾');
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
   * Отправить хомяка побегать в колесо
   */
  const goToWheel = useCallback(() => {
    if (behaviorRef.current === HamsterBehavior.SLEEP) {
      triggerEmote('💤');
      return;
    }
    changeBehavior(HamsterBehavior.WHEEL, 6);
  }, [changeBehavior, triggerEmote]);

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

  const feed = useCallback(
    (food: FoodItem) => {
      if (behaviorRef.current === HamsterBehavior.SLEEP) {
        changeBehavior(HamsterBehavior.IDLE);
      }

      soundManager.playEatSound();
      triggerEmote('🌾');
      changeBehavior(HamsterBehavior.EATING, food.eatingDurationSec);
      spawnParticles(5, posRef.current.x + 24, posRef.current.y + 10, '#f4a261');

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
    [changeBehavior, triggerEmote, spawnParticles, onNeedsChange]
  );

  const toggleSleep = useCallback(() => {
    if (behaviorRef.current === HamsterBehavior.SLEEP) {
      changeBehavior(HamsterBehavior.IDLE);
      soundManager.playClickSound();
    } else {
      changeBehavior(HamsterBehavior.SLEEP, 9999);
    }
  }, [changeBehavior]);

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
      stateTimeRef.current += dt;
      const currentBehavior = behaviorRef.current;
      const isZen = zenModeRef.current;
      const disabled = disabledStatsRef.current;

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

      // Пузырьки сна
      if (currentBehavior === HamsterBehavior.SLEEP) {
        sleepZzzTimerRef.current += dt;
        if (sleepZzzTimerRef.current >= 3.5) {
          sleepZzzTimerRef.current = 0;
          triggerEmote('💤');
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

      // 2. Движение при ходьбе по широкой клетке
      if (currentBehavior === HamsterBehavior.WALK) {
        const dx = posRef.current.targetX - posRef.current.x;
        const walkSpeed = 32;

        if (Math.abs(dx) > 2) {
          const step = Math.sign(dx) * walkSpeed * dt;
          posRef.current.x += step;
          posRef.current.flipX = dx < 0;
        } else {
          // Выбор следующего действия после прогулки
          const roll = Math.random();
          if (roll < 0.3) {
            changeBehavior(HamsterBehavior.SNIFF, 3);
          } else if (roll < 0.6) {
            changeBehavior(HamsterBehavior.GROOM, 3);
          } else if (roll < 0.8) {
            changeBehavior(HamsterBehavior.IDLE);
          } else {
            changeBehavior(HamsterBehavior.LAYING);
          }
        }
      }

      // 3. Завершение временных состояний:
      if (
        (currentBehavior === HamsterBehavior.EATING ||
          currentBehavior === HamsterBehavior.GROOM ||
          currentBehavior === HamsterBehavior.SNIFF ||
          currentBehavior === HamsterBehavior.WHEEL) &&
        stateTimeRef.current >= stateDurationRef.current
      ) {
        changeBehavior(HamsterBehavior.IDLE);
      }

      // 4. Появление какашки (только если не Дзен и гигиена включена)
      if (
        currentBehavior === HamsterBehavior.POOPING &&
        stateTimeRef.current >= stateDurationRef.current
      ) {
        if (!isZen && !disabled.hygiene) {
          const newPoop: PoopItem = {
            id: `poop_${Date.now()}`,
            x: Math.floor(posRef.current.x + 10),
            y: 154,
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
        if (!isZen && !disabled.energy && needsRef.current.energy < 20) {
          changeBehavior(HamsterBehavior.SLEEP);
        } else if (
          !isZen &&
          !disabled.hygiene &&
          needsRef.current.hygiene < 35 &&
          poopsRef.current.length < 5
        ) {
          changeBehavior(HamsterBehavior.POOPING, 2.5);
        } else {
          // Случайное поведение хомяка в клетке
          const roll = Math.random();
          if (roll < 0.35) {
            changeBehavior(HamsterBehavior.WALK);
          } else if (roll < 0.55) {
            changeBehavior(HamsterBehavior.WHEEL, 5 + Math.random() * 4);
          } else if (roll < 0.7) {
            changeBehavior(HamsterBehavior.GROOM, 3 + Math.random() * 2);
          } else if (roll < 0.85) {
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
    goToWheel,
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
