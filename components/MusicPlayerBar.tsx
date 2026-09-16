/**
 * ============================================================================
 * КОМПОНЕНТ: MusicPlayerBar (Компактный 8-битный Ретро-Миниплеер 📼)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. МИНИМАЛИСТИЧНЫЙ ВИДЖЕТ:
 *    Не загромождает экран. Отображает статус текущего трека, точный таймер (0:00 / 0:45),
 *    прогресс-бар длины песни и быстрые кнопки Play/Pause, Next и Mode.
 * 2. ИНТЕГРАЦИЯ С НАСТРОЙКАМИ:
 *    Полный каталог из 16 треков с предпрослушиванием доступен в Настройках.
 * ============================================================================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { musicPlayer, TRACK_DURATION_SEC } from '@/utils/musicEngine';
import { PlaybackMode } from '@/types/hamster';
import { soundManager } from '@/utils/soundEffects';

export interface MusicPlayerBarProps {
  initialVolume?: number;
  initialMode?: PlaybackMode;
  onVolumeChange?: (v: number) => void;
  onModeChange?: (mode: PlaybackMode) => void;
  onOpenMusicSettings?: () => void;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  initialVolume = 0.35,
  initialMode = 'loop',
  onVolumeChange,
  onModeChange,
  onOpenMusicSettings,
}) => {
  const [playerState, setPlayerState] = useState(musicPlayer.getStatus());

  useEffect(() => {
    musicPlayer.setVolume(initialVolume);
    musicPlayer.setMode(initialMode);
    setPlayerState(musicPlayer.getStatus());

    const unsubscribe = musicPlayer.subscribe(() => {
      setPlayerState(musicPlayer.getStatus());
    });
    return unsubscribe;
  }, [initialVolume, initialMode]);

  const handleTogglePlay = () => {
    soundManager.playClickSound();
    musicPlayer.togglePlay();
  };

  const handleNext = () => {
    soundManager.playClickSound();
    musicPlayer.nextTrack();
  };

  const handlePrev = () => {
    soundManager.playClickSound();
    musicPlayer.prevTrack();
  };

  const handleModeToggle = () => {
    soundManager.playClickSound();
    const modes: PlaybackMode[] = ['loop', 'shuffle', 'sequential'];
    const nextIdx = (modes.indexOf(playerState.mode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    musicPlayer.setMode(nextMode);
    onModeChange?.(nextMode);
  };

  const formatSec = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rest = s % 60;
    return `${m}:${rest < 10 ? '0' : ''}${rest}`;
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, (playerState.elapsedSeconds / TRACK_DURATION_SEC) * 100)
  );

  const getModeShort = (m: PlaybackMode) => {
    switch (m) {
      case 'loop':
        return { label: '🔁 Зациклить', color: 'bg-retro-yellow text-black' };
      case 'shuffle':
        return { label: '🔀 Микс', color: 'bg-retro-cyan text-black' };
      case 'sequential':
        return { label: '⏩ По порядку', color: 'bg-retro-blue text-white' };
    }
  };

  const modeBadge = getModeShort(playerState.mode);

  return (
    <div className="w-full max-w-3xl mx-auto bg-retro-dark/95 border-2 border-retro-purple/80 p-2 rounded-lg shadow-pixel-sm text-white font-pixel select-none mt-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Кнопка Play/Pause и название текущего трека */}
        <div className="flex items-center gap-2 flex-1 min-w-[190px]">
          <button
            type="button"
            onClick={handleTogglePlay}
            title={playerState.isPlaying ? 'Пауза' : 'Воспроизвести'}
            className={`w-7 h-7 rounded border border-black flex items-center justify-center text-[10px] font-bold shrink-0 active:translate-y-0.5 ${
              playerState.isPlaying
                ? 'bg-retro-green text-black animate-pulse'
                : 'bg-retro-yellow text-black'
            }`}
          >
            {playerState.isPlaying ? '⏸' : '▶'}
          </button>

          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1 text-[8px] text-retro-yellow truncate">
              <span className="font-bold">
                {playerState.currentTrackIndex + 1}/16: {playerState.currentTrack.title}
              </span>
            </div>
            {/* Полоса прогресса 45 секунд */}
            <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-retro-purple/50 mt-1">
              <div
                className="bg-retro-cyan h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-[7px] text-retro-grey whitespace-nowrap shrink-0">
            {formatSec(playerState.elapsedSeconds)} / {formatSec(TRACK_DURATION_SEC)}
          </div>
        </div>

        {/* Управление и режимы */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            title="Предыдущий трек"
            className="px-1.5 py-1 bg-retro-purple hover:bg-retro-blue border border-black rounded text-[8px] active:translate-y-0.5"
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={handleNext}
            title="Следующий трек"
            className="px-1.5 py-1 bg-retro-purple hover:bg-retro-blue border border-black rounded text-[8px] active:translate-y-0.5"
          >
            ⏭
          </button>

          {/* Режим воспроизведения */}
          <button
            type="button"
            onClick={handleModeToggle}
            title="Сменить режим воспроизведения"
            className={`px-1.5 py-1 rounded border border-black text-[7px] font-bold ${modeBadge.color}`}
          >
            {modeBadge.label}
          </button>

          {/* Громкость */}
          <div className="flex items-center gap-1 ml-1">
            <span className="text-[7px] text-retro-grey">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={playerState.volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                musicPlayer.setVolume(v);
                onVolumeChange?.(v);
              }}
              className="w-12 sm:w-16 h-1 bg-retro-purple rounded cursor-pointer"
            />
          </div>

          {/* Кнопка перехода к списку треков в Настройки */}
          {onOpenMusicSettings && (
            <button
              type="button"
              onClick={onOpenMusicSettings}
              title="Открыть каталог 16 треков"
              className="px-2 py-1 bg-retro-blue hover:bg-retro-cyan text-white text-[7px] border border-black rounded"
            >
              🎵 16 Треков
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
