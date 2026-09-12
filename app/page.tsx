/**
 * ============================================================================
 * ГЛАВНЫЙ ЭКРАН: app/page.tsx (Координатор Панорамной Игры и Дзен-Режима)
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
  DisabledStatsConfig,
} from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export default function TamagotchiPage() {
  const {
    data,
    setData,
    isHydrated,
    offlineReport,
    clearOfflineReport,
    resetSaveData,
  } = useSafeStorage();

  const [isFeedModalOpen, setIsFeedModalOpen] = useState<boolean>(false);
  const [isFurnitureModalOpen, setIsFurnitureModalOpen] = useState<boolean>(false);
  const [isPixelEditorOpen, setIsPixelEditorOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [ageSeconds, setAgeSeconds] = useState<number>(data.totalAgeSeconds);

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
    goToWheel,
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
    zenMode: data.zenMode,
    disabledStats: data.disabledStats,
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

  useEffect(() => {
    if (isHydrated) {
      setNeeds(data.needs);
      setPoops(data.poops);
      setAgeSeconds(data.totalAgeSeconds);
      soundManager.setEnabled(data.soundEnabled);
      soundManager.setVolume(data.soundVolume);
    }
  }, [isHydrated, data.needs, data.poops, data.totalAgeSeconds, data.soundEnabled, data.soundVolume, setNeeds, setPoops]);

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

  useGameLoop({
    onFixedUpdate: fixedUpdate,
    onRender: () => {},
    isActive: isHydrated,
  });

  const currentPalette: HamsterPalette =
    HAMSTER_PALETTES.find((p) => p.id === data.paletteId) ||
    HAMSTER_PALETTES[0];

  const handleSelectFood = useCallback(
    (food: FoodItem) => {
      feed(food);
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

  const handleCleanAllPoops = useCallback(() => {
    if (poops.length === 0) return;
    poops.forEach((p) => cleanPoop(p.id));
  }, [poops, cleanPoop]);

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

  const handleApplyCustomSprite = useCallback(
    (customSprite: CustomSpriteData) => {
      setData((prev) => ({
        ...prev,
        customSprite,
      }));
    },
    [setData]
  );

  const handleResetToDefaultSkin = useCallback(() => {
    setData((prev) => ({
      ...prev,
      customSprite: null,
    }));
  }, [setData]);

  const handleSaveFurniture = useCallback(
    (newFurniture: FurnitureConfig) => {
      setData((prev) => ({
        ...prev,
        furniture: newFurniture,
      }));
    },
    [setData]
  );

  const handleToggleZenMode = useCallback(() => {
    setData((prev) => {
      const nextZen = !prev.zenMode;
      if (nextZen) {
        soundManager.playSuccessJingle();
      } else {
        soundManager.playClickSound();
      }
      return {
        ...prev,
        zenMode: nextZen,
      };
    });
  }, [setData]);

  const handleUpdateSettings = useCallback(
    (params: {
      petName: string;
      paletteId: string;
      soundEnabled: boolean;
      soundVolume: number;
      zenMode: boolean;
      disabledStats: DisabledStatsConfig;
    }) => {
      setData((prev) => ({
        ...prev,
        petName: params.petName,
        paletteId: params.paletteId,
        soundEnabled: params.soundEnabled,
        soundVolume: params.soundVolume,
        zenMode: params.zenMode,
        disabledStats: params.disabledStats,
      }));
    },
    [setData]
  );

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
    <main className="w-full max-w-4xl flex flex-col items-center">
      {/* Шапка */}
      <header className="text-center mb-2.5">
        <h1 className="text-sm sm:text-lg text-retro-yellow font-pixel tracking-wider drop-shadow-[2px_2px_0px_#000]">
          🐹 ПИКСЕЛЬНЫЙ ТАМАГОЧИ: ХОМЯЧОК
        </h1>
        <p className="text-[7px] sm:text-[8px] text-retro-cyan font-pixel mt-1 opacity-90">
          Панорамный экран 480x180 • Беговое колесо • 2x Детализация • Дзен-компаньон
        </p>
      </header>

      {/* Корпус ретро-консоли */}
      <div className="w-full bg-[#3a4466] border-4 border-[#181425] p-2.5 sm:p-4 rounded-2xl shadow-pixel-lg">
        {/* HUD Статов */}
        <StatsOverlay
          petName={data.petName}
          needs={needs}
          behavior={behavior}
          ageSeconds={ageSeconds}
          zenMode={data.zenMode}
          disabledStats={data.disabledStats}
          onToggleZenMode={handleToggleZenMode}
        />

        {/* Главный панорамный Canvas 480x180 */}
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
          onTapWheel={goToWheel}
          onTapBowl={() => setIsFeedModalOpen(true)}
          onTapBottle={() => {
            soundManager.playPetSound();
            pet();
          }}
        />

        {/* Панель действий */}
        <ActionToolbar
          behavior={behavior}
          poopCount={poops.length}
          zenMode={data.zenMode}
          onOpenFeedModal={() => setIsFeedModalOpen(true)}
          onPet={pet}
          onGoToWheel={goToWheel}
          onToggleSleep={toggleSleep}
          onCleanAllPoops={handleCleanAllPoops}
          onOpenFurnitureModal={() => setIsFurnitureModalOpen(true)}
          onOpenPixelEditor={() => setIsPixelEditorOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />
      </div>

      {/* Модальные окна */}
      <OnboardingModal
        isOpen={!data.isOnboarded}
        onComplete={handleOnboardingComplete}
      />

      <FoodMenuModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        onSelectFood={handleSelectFood}
      />

      <FurnitureModal
        isOpen={isFurnitureModalOpen}
        onClose={() => setIsFurnitureModalOpen(false)}
        currentFurniture={data.furniture}
        onSaveFurniture={handleSaveFurniture}
      />

      <PixelEditor
        isOpen={isPixelEditorOpen}
        onClose={() => setIsPixelEditorOpen(false)}
        onApplyCustomSprite={handleApplyCustomSprite}
        onResetToDefaultSkin={handleResetToDefaultSkin}
        initialCustomSprite={data.customSprite}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentPetName={data.petName}
        currentPaletteId={data.paletteId}
        soundEnabled={data.soundEnabled}
        soundVolume={data.soundVolume}
        zenMode={data.zenMode}
        disabledStats={data.disabledStats}
        onUpdateSettings={handleUpdateSettings}
        onResetProgress={resetSaveData}
      />

      {/* Оффлайн отчет */}
      {offlineReport && (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm bg-retro-dark border-4 border-retro-yellow p-4 rounded-lg shadow-pixel text-white font-pixel animate-fadeIn select-none">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs text-retro-yellow">💤 С ВОЗВРАЩЕНИЕМ!</h4>
            <button
              onClick={clearOfflineReport}
              className="text-xs text-retro-grey hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[9px] text-retro-white leading-relaxed mb-2">
            Прошло {Math.floor(offlineReport.deltaSeconds / 60)} мин. Хомячок сладко спал в клетке!
          </p>
          <ul className="text-[8px] text-retro-grey space-y-1 mb-3">
            <li>• Изменение сытости: -{offlineReport.hungerLost}%</li>
            <li>• Изменение энергии: {offlineReport.energyChange}%</li>
            <li>• Снижение чистоты: -{offlineReport.hygieneLost}%</li>
            {offlineReport.newPoopsCount > 0 && (
              <li className="text-yellow-400">• Появилось какашек: +{offlineReport.newPoopsCount}</li>
            )}
            <li className="text-retro-green">• Soft-cap спас питомца!</li>
          </ul>
          <button
            onClick={clearOfflineReport}
            className="w-full py-1.5 bg-retro-green hover:brightness-110 text-black text-[9px] font-bold rounded border border-black"
          >
            Погладить хомяка ❤️
          </button>
        </div>
      )}
    </main>
  );
}
