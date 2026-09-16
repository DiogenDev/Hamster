/**
 * ============================================================================
 * ГЛАВНЫЙ ЭКРАН: app/page.tsx (Координатор Панорамной Игры и Дзен-Режима)
 * ============================================================================
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSafeStorage } from '@/hooks/useSafeStorage';
import { useHamsterBrain } from '@/hooks/useHamsterBrain';
import { useGameLoop } from '@/hooks/useGameLoop';
import { CageCanvas } from '@/components/CageCanvas';
import { StatsOverlay } from '@/components/StatsOverlay';
import { ActionToolbar } from '@/components/ActionToolbar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { FoodMenuModal, FoodMenuTab } from '@/components/FoodMenuModal';
import { PixelEditor } from '@/components/PixelEditor';
import { SettingsModal, SettingsTab } from '@/components/SettingsModal';
import { CageDesignModal } from '@/components/CageDesignModal';
import { MusicPlayerBar } from '@/components/MusicPlayerBar';
import { DynamicPixelBackdrop } from '@/components/DynamicPixelBackdrop';
import { HAMSTER_PALETTES } from '@/utils/hamsterSprites';
import { APP_THEMES } from '@/utils/themePresets';
import { getEffectiveCageTier, calculateHamsterLevel } from '@/utils/cageTiers';
import {
  HamsterPalette,
  FoodItem,
  DrinkItem,
  HamsterBehavior,
  FurnitureConfig,
  FurniturePositions,
  CustomSpriteData,
  DisabledStatsConfig,
  AppThemeId,
  PlaybackMode,
  CageTier,
  CageColorId,
  TunnelColorId,
  TunnelTextureId,
  FloorStyleId,
  Floor2ToyId,
  Floor3ToyId,
  TierToysConfig,
} from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';
import {
  notifyHamsterNeed,
  scheduleFutureNeedNotification,
} from '@/utils/notificationService';

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
  const [foodMenuTab, setFoodMenuTab] = useState<FoodMenuTab>('food');
  const [isPixelEditorOpen, setIsPixelEditorOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isCageDesignModalOpen, setIsCageDesignModalOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('themes');
  const [ageSeconds, setAgeSeconds] = useState<number>(data.totalAgeSeconds);
  const [isShortScreen, setIsShortScreen] = useState<boolean>(false);

  useEffect(() => {
    const check = () => {
      setIsShortScreen(typeof window !== 'undefined' && window.innerHeight < 550);
    };
    check();
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('orientationchange', check);
    };
  }, []);

  const openSettings = useCallback((tab: SettingsTab = 'themes') => {
    setSettingsInitialTab(tab);
    setIsSettingsModalOpen(true);
  }, []);

  const effectiveCageTier = getEffectiveCageTier(
    data.totalAgeSeconds,
    data.adminCageTierOverride
  );

  const {
    behavior,
    needs,
    poops,
    emotes,
    particles,
    posRef,
    stateTimeRef,
    chonkScale,
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
    setNeeds,
    setPoops,
    currentFloor,
    teleportToFloor,
    tunnelTransition,
    tunnelTransitionRef,
    requestFloorChange,
    triggerEmote,
    playWithToy,
    activeToyFloor,
  } = useHamsterBrain({
    initialNeeds: data.needs,
    initialBehavior: data.behavior,
    initialPoops: data.poops,
    zenMode: data.zenMode,
    disabledStats: data.disabledStats,
    furniture: data.furniture,
    cageTier: effectiveCageTier,
    tierToys: data.tierToys,
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

  // Отслеживание повышения уровня для звукового фанфара и звездных эмоций
  const previousLevelRef = useRef<number>(1);
  useEffect(() => {
    if (!isHydrated) return;
    const currentLevel = calculateHamsterLevel(data.totalAgeSeconds);
    if (previousLevelRef.current && currentLevel > previousLevelRef.current) {
      soundManager.playLevelUpJingle();
      triggerEmote('🌟');
    }
    previousLevelRef.current = currentLevel;
  }, [isHydrated, data.totalAgeSeconds, triggerEmote]);

  useEffect(() => {
    if (isHydrated) {
      setNeeds(data.needs);
      setPoops(data.poops);
      setAgeSeconds(data.totalAgeSeconds);
      if (data.behavior === HamsterBehavior.SLEEP) {
        syncBehavior(HamsterBehavior.SLEEP);
      }
      soundManager.setEnabled(data.soundEnabled);
      soundManager.setVolume(data.soundVolume);
    }
  }, [
    isHydrated,
    data.needs,
    data.poops,
    data.behavior,
    data.totalAgeSeconds,
    data.soundEnabled,
    data.soundVolume,
    setNeeds,
    setPoops,
    syncBehavior,
  ]);

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

  // Отслеживание потребностей и планирование уведомлений (строго не более 1 раза в 24 часа)
  useEffect(() => {
    if (!isHydrated) return;

    notifyHamsterNeed(data);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        scheduleFutureNeedNotification(data);
      } else if (document.visibilityState === 'visible') {
        notifyHamsterNeed(data);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHydrated, data]);

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

  const handleSelectDrink = useCallback(
    (drinkItem: DrinkItem) => {
      drink(drinkItem);
      setData((prev) => ({
        ...prev,
        furniture: {
          ...prev.furniture,
          bottleWaterLevel: 100,
          currentDrinkId: drinkItem.id,
          drinkColor: drinkItem.liquidColor,
        },
      }));
    },
    [drink, setData]
  );

  const handleOpenFeed = useCallback(() => {
    setFoodMenuTab('food');
    setIsFeedModalOpen(true);
  }, []);

  const handleOpenDrink = useCallback(() => {
    setFoodMenuTab('drinks');
    setIsFeedModalOpen(true);
  }, []);

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

  const handleUpdateFurniturePositions = useCallback(
    (positions: FurniturePositions) => {
      setData((prev) => ({
        ...prev,
        furniture: {
          ...prev.furniture,
          positions,
        },
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
      themeId: AppThemeId;
      soundEnabled: boolean;
      soundVolume: number;
      zenMode: boolean;
      disabledStats: DisabledStatsConfig;
      tierOverride?: CageTier | null;
      cageColor?: CageColorId;
      tunnelColor?: TunnelColorId;
      tunnelTexture?: TunnelTextureId;
      floorStyle?: FloorStyleId;
      tierToys?: TierToysConfig;
    }) => {
      setData((prev) => ({
        ...prev,
        petName: params.petName,
        paletteId: params.paletteId,
        themeId: params.themeId,
        soundEnabled: params.soundEnabled,
        soundVolume: params.soundVolume,
        zenMode: params.zenMode,
        disabledStats: params.disabledStats,
        adminCageTierOverride:
          params.tierOverride !== undefined ? params.tierOverride : prev.adminCageTierOverride,
        cageColor: params.cageColor ?? prev.cageColor ?? 'silver',
        tunnelColor: params.tunnelColor ?? prev.tunnelColor ?? 'neon_cyan',
        tunnelTexture: params.tunnelTexture ?? prev.tunnelTexture ?? 'smooth_glass',
        floorStyle: params.floorStyle ?? prev.floorStyle ?? 'natural_oak',
        tierToys: params.tierToys ?? prev.tierToys ?? { floor2Toy: 'seesaw', floor3Toy: 'telescope' },
      }));
    },
    [setData]
  );

  const handleSaveCageDesign = useCallback(
    (params: {
      tierOverride?: CageTier | null;
      cageColor: CageColorId;
      tunnelColor: TunnelColorId;
      tunnelTexture: TunnelTextureId;
      floorStyle: FloorStyleId;
      tierToys: TierToysConfig;
      furniture: FurnitureConfig;
    }) => {
      setData((prev) => ({
        ...prev,
        adminCageTierOverride:
          params.tierOverride !== undefined ? params.tierOverride : prev.adminCageTierOverride,
        cageColor: params.cageColor,
        tunnelColor: params.tunnelColor,
        tunnelTexture: params.tunnelTexture,
        floorStyle: params.floorStyle,
        tierToys: params.tierToys,
        furniture: params.furniture,
      }));
    },
    [setData]
  );

  const handleMusicVolumeChange = useCallback(
    (volume: number) => {
      setData((prev) => ({
        ...prev,
        musicConfig: {
          ...(prev.musicConfig || {
            isPlaying: false,
            currentTrackIndex: 0,
            volume: 0.35,
            mode: 'loop',
          }),
          volume,
        },
      }));
    },
    [setData]
  );

  const handleMusicModeChange = useCallback(
    (mode: PlaybackMode) => {
      setData((prev) => ({
        ...prev,
        musicConfig: {
          ...(prev.musicConfig || {
            isPlaying: false,
            currentTrackIndex: 0,
            volume: 0.35,
            mode: 'loop',
          }),
          mode,
        },
      }));
    },
    [setData]
  );

  const currentTheme =
    APP_THEMES[data.themeId || 'retro_arcade'] || APP_THEMES.retro_arcade;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.background = currentTheme.bodyBg;
    }
  }, [currentTheme.bodyBg]);

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
    <main className="w-full h-full max-h-[100dvh] max-w-4xl mx-auto flex flex-col justify-between items-center overflow-hidden p-1 sm:p-3 relative select-none">
      {/* Динамический нестатичный пиксельный задний фон, зависящий от темы */}
      <DynamicPixelBackdrop themeId={data.themeId || 'retro_arcade'} />

      {/* CARD 1: ВЕРХНЯЯ ПАНЕЛЬ (Шапка + HUD Статов) — shrink-0, динамически наверху */}
      <div className="w-full shrink-0 z-20 max-w-3xl mx-auto flex flex-col pt-[env(safe-area-inset-top,2px)]">
        {/* Шапка: адаптивная для смартфона и десктопа */}
        <header className="flex w-full items-center justify-between mb-1 px-1">
          <h1
            className="text-[10px] sm:text-base font-pixel tracking-wider drop-shadow-[2px_2px_0px_#000] transition-colors duration-300 truncate"
            style={{ color: currentTheme.headerColor }}
          >
            🐹 <span className="hidden sm:inline">ТАМАГОЧИ: </span>ХОМЯЧОК
          </h1>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundManager.playClickSound();
                setIsCageDesignModalOpen(true);
              }}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-retro-purple/80 hover:bg-retro-purple border border-retro-cyan/70 hover:border-retro-cyan rounded text-[7px] sm:text-[9px] text-retro-cyan font-pixel flex items-center gap-1 shadow-pixel-sm transition-all active:translate-y-0.5"
              title="Обустройство и дизайн клетки"
            >
              <span>🏗️</span>
              <span className="hidden sm:inline">Обустройство клетки</span>
              <span className="sm:hidden">Клетка</span>
            </button>

            <button
              type="button"
              onClick={() => openSettings('themes')}
              className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black/40 hover:bg-black/70 border border-black/80 rounded text-[7px] sm:text-[9px] text-retro-yellow font-pixel flex items-center gap-1 shadow-pixel-sm transition-all active:translate-y-0.5"
              title="Открыть настройки и кастомизацию"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Настройки</span>
              <span className="sm:hidden">Опции</span>
            </button>
          </div>
        </header>

        {/* HUD Статов */}
        <StatsOverlay
          petName={data.petName}
          needs={needs}
          behavior={behavior}
          ageSeconds={ageSeconds}
          zenMode={data.zenMode}
          disabledStats={data.disabledStats}
          adminCageTierOverride={data.adminCageTierOverride}
          onToggleZenMode={handleToggleZenMode}
        />
      </div>

      {/* CARD 2: ЦЕНТРАЛЬНАЯ ЗОНА (Клетка) — flex-1 min-h-0, динамически занимает все доступное место */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center my-auto transition-all duration-300 bg-transparent p-0.5 sm:p-1 max-w-4xl overflow-hidden">
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
          chonkScale={chonkScale}
          cageTier={effectiveCageTier}
          cageColor={data.cageColor || 'silver'}
          tunnelColor={data.tunnelColor || 'neon_cyan'}
          tunnelTexture={data.tunnelTexture || 'smooth_glass'}
          floorStyle={data.floorStyle || 'natural_oak'}
          tierToys={data.tierToys || { floor2Toy: 'seesaw', floor3Toy: 'telescope' }}
          currentFloor={currentFloor}
          tunnelTransition={tunnelTransition}
          tunnelTransitionRef={tunnelTransitionRef}
          activeToyFloor={activeToyFloor}
          onRequestFloorChange={requestFloorChange}
          onPet={pet}
          onCleanPoop={cleanPoop}
          onTapWheel={goToWheel}
          onTapBowl={handleOpenFeed}
          onTapBottle={handleOpenDrink}
          onTapHouse={toggleSleep}
          onTapFloorToy={(floor) => {
            playWithToy(floor);
          }}
          onUpdateFurniturePositions={handleUpdateFurniturePositions}
          onPickUpHamster={pickUpHamster}
          onDropHamster={dropHamster}
        />
      </div>

      {/* CARD 3: НИЖНЯЯ ПАНЕЛЬ ДЕЙСТВИЙ — shrink-0, динамически прижата к низу экрана */}
      <div className="w-full shrink-0 z-20 max-w-3xl mx-auto pb-[calc(env(safe-area-inset-bottom,2px)+2px)] pt-0.5">
        <ActionToolbar
          behavior={behavior}
          poopCount={poops.length}
          zenMode={data.zenMode}
          onOpenFeedModal={handleOpenFeed}
          onOpenDrinkModal={handleOpenDrink}
          onPet={pet}
          onGoToWheel={goToWheel}
          onToggleSleep={toggleSleep}
          onCleanAllPoops={handleCleanAllPoops}
        />

        {/* На больших экранах достаточной высоты показываем плеер музыки */}
        {!isShortScreen && (
          <div className="hidden sm:block mt-1">
            <MusicPlayerBar
              initialVolume={data.musicConfig?.volume ?? 0.35}
              initialMode={data.musicConfig?.mode ?? 'loop'}
              onVolumeChange={handleMusicVolumeChange}
              onModeChange={handleMusicModeChange}
              onOpenMusicSettings={() => openSettings('music')}
            />
          </div>
        )}
      </div>

      {/* Модальные окна */}
      <OnboardingModal
        isOpen={!data.isOnboarded}
        onComplete={handleOnboardingComplete}
      />

      <FoodMenuModal
        isOpen={isFeedModalOpen}
        initialTab={foodMenuTab}
        onClose={() => setIsFeedModalOpen(false)}
        onSelectFood={handleSelectFood}
        onSelectDrink={handleSelectDrink}
        bottleWaterLevel={data.furniture.bottleWaterLevel ?? 100}
        currentDrinkId={data.furniture.currentDrinkId ?? 'fresh_water'}
        drinkColor={data.furniture.drinkColor ?? '#38bdf8'}
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
        currentThemeId={data.themeId || 'retro_arcade'}
        soundEnabled={data.soundEnabled}
        soundVolume={data.soundVolume}
        zenMode={data.zenMode}
        disabledStats={data.disabledStats}
        currentFurniture={data.furniture}
        hasCustomSkin={Boolean(data.customSprite)}
        initialTab={settingsInitialTab}
        cageTier={effectiveCageTier}
        adminCageTierOverride={data.adminCageTierOverride}
        currentCageColor={data.cageColor || 'silver'}
        currentTunnelColor={data.tunnelColor || 'neon_cyan'}
        currentTunnelTexture={data.tunnelTexture || 'smooth_glass'}
        currentFloorStyle={data.floorStyle || 'natural_oak'}
        currentTierToys={data.tierToys || { floor2Toy: 'seesaw', floor3Toy: 'telescope' }}
        onUpdateSettings={handleUpdateSettings}
        onSaveFurniture={handleSaveFurniture}
        onOpenPixelEditor={() => setIsPixelEditorOpen(true)}
        onResetToDefaultSkin={handleResetToDefaultSkin}
        onResetProgress={resetSaveData}
      />

      <CageDesignModal
        isOpen={isCageDesignModalOpen}
        onClose={() => setIsCageDesignModalOpen(false)}
        cageTier={effectiveCageTier}
        adminCageTierOverride={data.adminCageTierOverride}
        currentCageColor={data.cageColor || 'silver'}
        currentTunnelColor={data.tunnelColor || 'neon_cyan'}
        currentTunnelTexture={data.tunnelTexture || 'smooth_glass'}
        currentFloorStyle={data.floorStyle || 'natural_oak'}
        currentTierToys={data.tierToys || { floor2Toy: 'seesaw', floor3Toy: 'telescope' }}
        currentFurniture={data.furniture}
        onSave={handleSaveCageDesign}
        onPlayWithToy={(floor) => playWithToy(floor)}
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
