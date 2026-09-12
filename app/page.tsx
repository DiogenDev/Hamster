/**
 * ============================================================================
 * ГЛАВНЫЙ ЭКРАН: app/page.tsx (Координатор Игровой Системы и UI)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Паттерн "Координатор" (Orchestrator Pattern).
 *    Главный экран связывает воедино 4 ключевых слоя приложения:
 *    - Слой хранения (`useSafeStorage`): SSR-безопасный localStorage с оффлайн-дельтой.
 *    - Слой логики и ИИ (`useHamsterBrain`): конечный автомат (FSM), потребности, физика.
 *    - Слой игрового цикла (`useGameLoop`): requestAnimationFrame с фиксированным шагом физики.
 *    - Слой представления (`CageCanvas`, `StatsOverlay`, модальные окна).
 * 
 * 2. ЗАЩИТА ОТ ГИДРАТАЦИИ В NEXT.JS APP ROUTER:
 *    Пока `isHydrated === false`, компонент рендерит лаконичный ретро-лоадер "ЗАГРУЗКА...".
 *    Это на 100% исключает рассинхронизацию между HTML сервера и клиента.
 * 
 * 3. ПОДВОДНЫЕ КАМНИ (Pitfalls & Memory Safety):
 *    Все обработчики действий и синхронизации стейтов стабилизированы через `useCallback`
 *    и ссылки `useRef`, что исключает утечки слушателей событий и лишние ререндеры.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSafeStorage } from '@/hooks/useSafeStorage';
import { useHamsterBrain } from '@/hooks/useHamsterBrain';
import { useGameLoop } from '@/hooks/useGameLoop';
import { CageCanvas } from '@/components/CageCanvas';
import { StatsOverlay } from '@/components/StatsOverlay';
import { ActionToolbar } from '@/components/ActionToolbar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { FoodMenuModal } from '@/components/FoodMenuModal';
import { FurnitureModal } from '@/components/FurnitureModal';
import { PixelEditor } from '@/components/PixelEditor';
import { SettingsModal } from '@/components/SettingsModal';
import { HAMSTER_PALETTES } from '@/utils/spritePresets';
import {
  HamsterPalette,
  FoodItem,
  FurnitureConfig,
  CustomSpriteData,
} from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export default function TamagotchiPage() {
  // 1. Слой безопасного хранилища
  const {
    data,
    setData,
    isHydrated,
    offlineReport,
    clearOfflineReport,
    resetSaveData,
  } = useSafeStorage();

  // Состояние открытых модальных окон
  const [isFeedModalOpen, setIsFeedModalOpen] = useState<boolean>(false);
  const [isFurnitureModalOpen, setIsFurnitureModalOpen] = useState<boolean>(false);
  const [isPixelEditorOpen, setIsPixelEditorOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Возраст питомца в секундах
  const [ageSeconds, setAgeSeconds] = useState<number>(data.totalAgeSeconds);

  // 2. Слой ИИ и стейт-машины хомячка
  const {
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
    setNeeds,
    setPoops,
  } = useHamsterBrain({
    initialNeeds: data.needs,
    initialBehavior: data.behavior,
    initialPoops: data.poops,
    onNeedsChange: (updatedNeeds) => {
      setData((prev) => ({ ...prev, needs: updatedNeeds }));
    },
    onBehaviorChange: (updatedBehavior) => {
      setData((prev) => ({ ...prev, behavior: updatedBehavior }));
    },
    onPoopsChange: (updatedPoops) => {
      setData((prev) => ({ ...prev, poops: updatedPoops }));
    },
  });

  // Синхронизация данных при первом считывании из localStorage
  useEffect(() => {
    if (isHydrated) {
      setNeeds(data.needs);
      setPoops(data.poops);
      setAgeSeconds(data.totalAgeSeconds);
      soundManager.setEnabled(data.soundEnabled);
      soundManager.setVolume(data.soundVolume);
    }
  }, [isHydrated, data.needs, data.poops, data.totalAgeSeconds, data.soundEnabled, data.soundVolume, setNeeds, setPoops]);

  // Таймер взросления питомца (+1 секунда)
  useEffect(() => {
    if (!isHydrated) return;
    const interval = setInterval(() => {
      setAgeSeconds((prev) => {
        const next = prev + 1;
        setData((d) => ({ ...d, totalAgeSeconds: next }));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isHydrated, setData]);

  // 3. Слой игрового цикла (Fixed Update 60 FPS)
  useGameLoop({
    onFixedUpdate: fixedUpdate,
    onRender: () => {
      // Рендеринг непрерывно управляется CageCanvas
    },
    isActive: isHydrated,
  });

  // Текущая палитра хомяка
  const currentPalette: HamsterPalette =
    HAMSTER_PALETTES.find((p) => p.id === data.paletteId) ||
    HAMSTER_PALETTES[0];

  /**
   * Кормление выбранным продуктом
   */
  const handleSelectFood = useCallback(
    (food: FoodItem) => {
      feed(food);
      // Наполняем кормушку на Canvas
      setData((prev) => ({
        ...prev,
        furniture: {
          ...prev.furniture,
          bowlFoodLevel: 100,
          currentFoodId: food.id,
        },
      }));
    },
    [feed, setData]
  );

  /**
   * Уборка всех какашек сразу по кнопке тулбара
   */
  const handleCleanAllPoops = useCallback(() => {
    if (poops.length === 0) return;
    poops.forEach((p) => cleanPoop(p.id));
  }, [poops, cleanPoop]);

  /**
   * Завершение первого онбординга
   */
  const handleOnboardingComplete = useCallback(
    (name: string, paletteId: string) => {
      setData((prev) => ({
        ...prev,
        petName: name,
        paletteId: paletteId,
        isOnboarded: true,
      }));
    },
    [setData]
  );

  /**
   * Применение кастомного пиксель-арт скина
   */
  const handleApplyCustomSprite = useCallback(
    (customSprite: CustomSpriteData) => {
      setData((prev) => ({
        ...prev,
        customSprite,
      }));
    },
    [setData]
  );

  /**
   * Сброс кастомного скина
   */
  const handleResetToDefaultSkin = useCallback(() => {
    setData((prev) => ({
      ...prev,
      customSprite: null,
    }));
  }, [setData]);

  /**
   * Сохранение новой мебели
   */
  const handleSaveFurniture = useCallback(
    (newFurniture: FurnitureConfig) => {
      setData((prev) => ({
        ...prev,
        furniture: newFurniture,
      }));
    },
    [setData]
  );

  /**
   * Сохранение настроек
   */
  const handleUpdateSettings = useCallback(
    (params: {
      petName: string;
      paletteId: string;
      soundEnabled: boolean;
      soundVolume: number;
    }) => {
      setData((prev) => ({
        ...prev,
        petName: params.petName,
        paletteId: params.paletteId,
        soundEnabled: params.soundEnabled,
        soundVolume: params.soundVolume,
      }));
    },
    [setData]
  );

  // Экран загрузки (защита от несовпадения верстки SSR)
  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-pixel text-center">
        <div className="text-3xl animate-bounce">🐹</div>
        <div className="text-xs text-retro-yellow">ЗАГРУЗКА ХОМЯЧКА...</div>
        <div className="text-[9px] text-retro-grey">Инициализация Canvas 2D и Audio...</div>
      </div>
    );
  }

  return (
    <main className="w-full max-w-3xl flex flex-col items-center">
      {/* Шапка заголовка */}
      <header className="text-center mb-3">
        <h1 className="text-sm sm:text-lg text-retro-yellow font-pixel tracking-wider drop-shadow-[2px_2px_0px_#000]">
          🐹 ПИКСЕЛЬНЫЙ ТАМАГОЧИ: ХОМЯЧОК
        </h1>
        <p className="text-[8px] sm:text-[9px] text-retro-cyan font-pixel mt-1 opacity-90">
          Next.js 14 App Router • Canvas 2D • 8-Bit Web Audio • Pixel Studio
        </p>
      </header>

      {/* Ретро-монитор / Корпус консоли */}
      <div className="w-full bg-[#3a4466] border-4 border-[#181425] p-3 sm:p-5 rounded-2xl shadow-pixel-lg">
        {/* Верхняя панель статов (HUD) */}
        <StatsOverlay
          petName={data.petName}
          needs={needs}
          behavior={behavior}
          ageSeconds={ageSeconds}
        />

        {/* Главный игровой экран Canvas 2D */}
        <CageCanvas
          palette={currentPalette}
          customSprite={data.customSprite}
          behavior={behavior}
          furniture={data.furniture}
          poops={poops}
          emotes={emotes}
          particles={particles}
          posRef={posRef}
          stateTimeRef={stateTimeRef}
          onPet={pet}
          onCleanPoop={cleanPoop}
          onTapBowl={() => setIsFeedModalOpen(true)}
          onTapBottle={() => {
            soundManager.playPetSound();
            pet();
          }}
        />

        {/* Нижняя панель действий */}
        <ActionToolbar
          behavior={behavior}
          poopCount={poops.length}
          onOpenFeedModal={() => setIsFeedModalOpen(true)}
          onPet={pet}
          onToggleSleep={toggleSleep}
          onCleanAllPoops={handleCleanAllPoops}
          onOpenFurnitureModal={() => setIsFurnitureModalOpen(true)}
          onOpenPixelEditor={() => setIsPixelEditorOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />
      </div>

      {/* Модальное окно первого онбординга (если еще не пройден) */}
      <OnboardingModal
        isOpen={!data.isOnboarded}
        onComplete={handleOnboardingComplete}
      />

      {/* Меню кормления */}
      <FoodMenuModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        onSelectFood={handleSelectFood}
      />

      {/* Кастомизация мебели */}
      <FurnitureModal
        isOpen={isFurnitureModalOpen}
        onClose={() => setIsFurnitureModalOpen(false)}
        currentFurniture={data.furniture}
        onSaveFurniture={handleSaveFurniture}
      />

      {/* Встроенная студия пиксель-арта */}
      <PixelEditor
        isOpen={isPixelEditorOpen}
        onClose={() => setIsPixelEditorOpen(false)}
        onApplyCustomSprite={handleApplyCustomSprite}
        onResetToDefaultSkin={handleResetToDefaultSkin}
        initialCustomSprite={data.customSprite}
      />

      {/* Настройки игры и звука */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentPetName={data.petName}
        currentPaletteId={data.paletteId}
        soundEnabled={data.soundEnabled}
        soundVolume={data.soundVolume}
        onUpdateSettings={handleUpdateSettings}
        onResetProgress={resetSaveData}
      />

      {/* Всплывающее уведомление об оффлайн-прогрессе */}
      {offlineReport && (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm bg-retro-dark border-4 border-retro-yellow p-4 rounded-lg shadow-pixel text-white font-pixel animate-fadeIn select-none">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs text-retro-yellow">💤 ПОКА ТЕБЯ НЕ БЫЛО</h4>
            <button
              onClick={clearOfflineReport}
              className="text-xs text-retro-grey hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[9px] text-retro-white leading-relaxed mb-2">
            Прошло {Math.floor(offlineReport.deltaSeconds / 60)} мин. Хомячок скучал!
          </p>
          <ul className="text-[8px] text-retro-grey space-y-1 mb-3">
            <li>• Потеряно сытости: -{offlineReport.hungerLost}%</li>
            <li>• Изменение энергии: {offlineReport.energyChange}%</li>
            <li>• Снижение чистоты: -{offlineReport.hygieneLost}%</li>
            {offlineReport.newPoopsCount > 0 && (
              <li className="text-yellow-400">• Появилось какашек: +{offlineReport.newPoopsCount}</li>
            )}
            <li className="text-retro-green">• Soft-cap спас питомца от гибели!</li>
          </ul>
          <button
            onClick={clearOfflineReport}
            className="w-full py-1.5 bg-retro-green hover:brightness-110 text-black text-[9px] font-bold rounded border border-black"
          >
            Позаботиться о нем!
          </button>
        </div>
      )}
    </main>
  );
}
