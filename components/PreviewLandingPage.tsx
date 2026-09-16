/**
 * ============================================================================
 * КОМПОНЕНТ: PreviewLandingPage.tsx (Сайт-превью и хаб игры для портфолио)
 * ============================================================================
 * Профессиональная и стильная презентация проекта:
 * - Выдержанный дизайн в стиле инди-игры, идеально подходящий для портфолио
 * - Настоящий нарисованный пиксельный логотип (без квадратных эмодзи)
 * - Компактная кнопка-шестеренка для смены динамического фона из игры
 * - Блок инженерных решений: архитектура (Win32 WorkerW, Canvas 2D, Next.js + Electron + Capacitor)
 * - Динамическая синхронизация релизов и ссылок на скачивание с GitHub API
 * - Интерактивное демо хомяка прямо на первом экране с 60 FPS
 * ============================================================================
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  Play,
  ExternalLink,
  Code,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
  Settings2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Terminal,
  ShieldCheck,
  Palette,
} from 'lucide-react';
import {
  HAMSTER_24_IDLE_1,
  HAMSTER_24_IDLE_2,
  HAMSTER_24_WALK_1,
  HAMSTER_24_WALK_2,
  HAMSTER_24_EAT_1,
  HAMSTER_24_EAT_2,
  HAMSTER_24_GROOM_1,
  HAMSTER_24_GROOM_2,
  HAMSTER_PALETTES,
} from '@/utils/hamsterSprites';
import { drawCharacterMatrix } from '@/utils/canvasUtils';
import { soundManager } from '@/utils/soundEffects';
import { DynamicPixelBackdrop } from '@/components/DynamicPixelBackdrop';
import { AppThemeId } from '@/types/hamster';

interface PreviewLandingPageProps {
  onPlayOnline?: () => void;
}

interface ReleaseAssetInfo {
  name: string;
  url: string;
  sizeMB: string;
  downloads: number;
}

interface GithubReleaseData {
  version: string;
  name: string;
  isPrerelease: boolean;
  publishedDate: string;
  htmlUrl: string;
  setupExe: ReleaseAssetInfo;
  portableZip: ReleaseAssetInfo;
  apk: ReleaseAssetInfo;
  isLive: boolean;
}

const THEME_OPTIONS: { id: AppThemeId; name: string; icon: string; desc: string }[] = [
  { id: 'retro_arcade', name: 'Ретро Космос', icon: '👾', desc: 'Звездопад и фиолетовое свечение' },
  { id: 'gameboy_classic', name: 'GameBoy 1989', icon: '🎮', desc: 'Монохромный LCD dot-matrix' },
  { id: 'cyberpunk_neon', name: 'Кибер Неон', icon: '⚡', desc: 'Цифровой бирюзовый дождь' },
  { id: 'cozy_autumn', name: 'Уютный Кофе', icon: '☕', desc: 'Теплые осенние тона' },
  { id: 'pastel_dream', name: 'Пастель Сакура', icon: '🌸', desc: 'Нежные лепестки сакуры' },
  { id: 'midnight_synth', name: 'Синтвейв 80s', icon: '🌆', desc: 'Бегущая 3D неоновая сетка' },
];

const DIOGENES_QUOTES = [
  'В бочке или в клетке — главное свобода духа!',
  'Человека ищу... а нашёл превосходную семечку!',
  'Не заслоняй мне солнце, путник. Лучше насыпь овса в кормушку.',
  'Богат не тот, у кого много зёрен, а тот, кому хватает одного орешка.',
  'Бег в колесе — идеальная метафора суеты человеческой жизни.',
  'Александр Македонский покорил полмира, но даже у него не было таких пушистых щёчек.',
  'Счастье — это свежие опилки, чистый поильник и дзен в душе.',
  'Простота — высшая форма изящества. Поел, побегал, поспал — постиг космос.',
  'Ты ищешь смысл жизни, а он прямо здесь: в хрустящем кусочке моркови.',
  'Пусть весь мир куда-то спешит, а я лягу на спинку и буду созерцать потолок.',
];

// Дефолтные данные релиза на случай отсутствия связи с GitHub API
const DEFAULT_RELEASE: GithubReleaseData = {
  version: 'v1.2.0-beta',
  name: 'Hamster Diogen v1.2.0-beta',
  isPrerelease: true,
  publishedDate: '16 сентября 2026',
  htmlUrl: 'https://github.com/DiogenDev/Hamster/releases/tag/v1.2.0-beta',
  setupExe: {
    name: 'HamsterDiogen-Setup.exe',
    url: 'https://github.com/DiogenDev/Hamster/releases/download/v1.2.0-beta/HamsterDiogen-Setup.exe',
    sizeMB: '150.4 МБ',
    downloads: 0,
  },
  portableZip: {
    name: 'HamsterDiogen-Windows-v1.2.0-beta.zip',
    url: 'https://github.com/DiogenDev/Hamster/releases/download/v1.2.0-beta/HamsterDiogen-Windows-v1.2.0-beta.zip',
    sizeMB: '217.1 МБ',
    downloads: 0,
  },
  apk: {
    name: 'HamsterDiogen.apk',
    url: 'https://github.com/DiogenDev/Hamster/releases/download/v1.2.0-beta/HamsterDiogen.apk',
    sizeMB: '4.9 МБ',
    downloads: 0,
  },
  isLive: false,
};

const GITHUB_REPO_URL = 'https://github.com/DiogenDev/Hamster';

/**
 * Аутентичный пиксельный логотип хомячка (16x14), нарисованный вектором без размытия
 */
const PixelHamsterLogo: React.FC<{ size?: number }> = ({ size = 28 }) => {
  const pixels = [
    // [x, y, color]
    // Ушки
    [3, 0, '#8f4a0a'], [4, 0, '#8f4a0a'], [11, 0, '#8f4a0a'], [12, 0, '#8f4a0a'],
    [2, 1, '#8f4a0a'], [3, 1, '#f9c0d3'], [4, 1, '#8f4a0a'], [11, 1, '#8f4a0a'], [12, 1, '#f9c0d3'], [13, 1, '#8f4a0a'],
    // Голова
    [2, 2, '#8f4a0a'], [3, 2, '#e8912f'], [4, 2, '#e8912f'], [11, 2, '#e8912f'], [12, 2, '#e8912f'], [13, 2, '#8f4a0a'],
    [1, 3, '#8f4a0a'], [2, 3, '#e8912f'], [3, 3, '#ffc27a'], [4, 3, '#ffc27a'], [5, 3, '#e8912f'], [10, 3, '#e8912f'], [11, 3, '#ffc27a'], [12, 3, '#ffc27a'], [13, 3, '#e8912f'], [14, 3, '#8f4a0a'],
    [1, 4, '#8f4a0a'], [2, 4, '#ffc27a'], [3, 4, '#ffc27a'], [4, 4, '#ffc27a'], [5, 4, '#e8912f'], [6, 4, '#e8912f'], [7, 4, '#e8912f'], [8, 4, '#e8912f'], [9, 4, '#e8912f'], [10, 4, '#e8912f'], [11, 4, '#ffc27a'], [12, 4, '#ffc27a'], [13, 4, '#ffc27a'], [14, 4, '#8f4a0a'],
    // Глазки с бликами
    [0, 5, '#8f4a0a'], [1, 5, '#e8912f'], [2, 5, '#e8912f'], [3, 5, '#ffffff'], [4, 5, '#1a1a1a'], [5, 5, '#e8912f'], [6, 5, '#e8912f'], [7, 5, '#e8912f'], [8, 5, '#e8912f'], [9, 5, '#e8912f'], [10, 5, '#e8912f'], [11, 5, '#ffffff'], [12, 5, '#1a1a1a'], [13, 5, '#e8912f'], [14, 5, '#e8912f'], [15, 5, '#8f4a0a'],
    [0, 6, '#8f4a0a'], [1, 6, '#e8912f'], [2, 6, '#e8912f'], [3, 6, '#1a1a1a'], [4, 6, '#1a1a1a'], [5, 6, '#e8912f'], [6, 6, '#e8912f'], [7, 6, '#e8912f'], [8, 6, '#e8912f'], [9, 6, '#e8912f'], [10, 6, '#e8912f'], [11, 6, '#1a1a1a'], [12, 6, '#1a1a1a'], [13, 6, '#e8912f'], [14, 6, '#e8912f'], [15, 6, '#8f4a0a'],
    // Носик и пухлые щёчки
    [0, 7, '#8f4a0a'], [1, 7, '#ff8fa8'], [2, 7, '#ff8fa8'], [3, 7, '#e8912f'], [4, 7, '#fff4d6'], [5, 7, '#fff4d6'], [6, 7, '#f9c0d3'], [7, 7, '#f9c0d3'], [8, 7, '#f9c0d3'], [9, 7, '#f9c0d3'], [10, 7, '#fff4d6'], [11, 7, '#fff4d6'], [12, 7, '#e8912f'], [13, 7, '#ff8fa8'], [14, 7, '#ff8fa8'], [15, 7, '#8f4a0a'],
    [0, 8, '#8f4a0a'], [1, 8, '#ff8fa8'], [2, 8, '#fff4d6'], [3, 8, '#fff4d6'], [4, 8, '#fff4d6'], [5, 8, '#fff4d6'], [6, 8, '#fff4d6'], [7, 8, '#fff4d6'], [8, 8, '#fff4d6'], [9, 8, '#fff4d6'], [10, 8, '#fff4d6'], [11, 8, '#fff4d6'], [12, 8, '#fff4d6'], [13, 8, '#fff4d6'], [14, 8, '#ff8fa8'], [15, 8, '#8f4a0a'],
    // Подбородок
    [1, 9, '#8f4a0a'], [2, 9, '#e8912f'], [3, 9, '#fff4d6'], [4, 9, '#fff4d6'], [5, 9, '#fff4d6'], [6, 9, '#fff4d6'], [7, 9, '#fff4d6'], [8, 9, '#fff4d6'], [9, 9, '#fff4d6'], [10, 9, '#fff4d6'], [11, 9, '#fff4d6'], [12, 9, '#fff4d6'], [13, 9, '#e8912f'], [14, 9, '#8f4a0a'],
    [2, 10, '#8f4a0a'], [3, 10, '#8f4a0a'], [4, 10, '#e8912f'], [5, 10, '#e8912f'], [6, 10, '#e8912f'], [7, 10, '#e8912f'], [8, 10, '#e8912f'], [9, 10, '#e8912f'], [10, 10, '#e8912f'], [11, 10, '#e8912f'], [12, 10, '#8f4a0a'], [13, 10, '#8f4a0a'],
    [4, 11, '#8f4a0a'], [5, 11, '#8f4a0a'], [6, 11, '#8f4a0a'], [7, 11, '#8f4a0a'], [8, 11, '#8f4a0a'], [9, 11, '#8f4a0a'], [10, 11, '#8f4a0a'], [11, 11, '#8f4a0a'],
  ];

  return (
    <svg
      width={size}
      height={size * (12 / 16)}
      viewBox="0 0 16 12"
      className="shrink-0 select-none pixelated"
      style={{ shapeRendering: 'crispEdges' }}
    >
      {pixels.map(([x, y, color], idx) => (
        <rect key={idx} x={x} y={y} width="1" height="1" fill={color as string} />
      ))}
    </svg>
  );
};

export const PreviewLandingPage: React.FC<PreviewLandingPageProps> = ({ onPlayOnline }) => {
  // Тема фона
  const [bgTheme, setBgTheme] = useState<AppThemeId>('retro_arcade');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  // Релиз с GitHub API
  const [releaseInfo, setReleaseInfo] = useState<GithubReleaseData>(DEFAULT_RELEASE);

  // Интерактив хомяка
  const [paletteIndex, setPaletteIndex] = useState<number>(0);
  const [hamsterState, setHamsterState] = useState<'idle' | 'eating' | 'grooming' | 'running'>('idle');
  const [quote, setQuote] = useState<string>(DIOGENES_QUOTES[0]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentPalette = HAMSTER_PALETTES[paletteIndex] || HAMSTER_PALETTES[0];

  // 1. Инициализация темы из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('hamster_landing_theme') as AppThemeId;
      if (savedTheme && THEME_OPTIONS.some((t) => t.id === savedTheme)) {
        setBgTheme(savedTheme);
      }
    }
  }, []);

  // Закрытие меню тем при клике вне него
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. ДИНАМИЧЕСКАЯ СИНХРОНИЗАЦИЯ С GITHUB API
  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const cached = localStorage.getItem('hamster_cached_release');
        const cachedTime = Number(localStorage.getItem('hamster_cached_release_time') || 0);
        const now = Date.now();

        if (cached && now - cachedTime < 10 * 60 * 1000) {
          try {
            setReleaseInfo(JSON.parse(cached));
          } catch {}
        }

        const res = await fetch('https://api.github.com/repos/DiogenDev/Hamster/releases', {
          headers: { Accept: 'application/vnd.github+json' },
        });

        if (!res.ok) return;

        const releases = await res.json();
        if (!Array.isArray(releases) || releases.length === 0) return;

        const latest = releases[0];
        const tag = latest.tag_name || 'v1.2.0-beta';
        const assets = latest.assets || [];

        const formatSize = (bytes: number) => {
          if (!bytes) return '150 МБ';
          return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
        };

        const exeAsset = assets.find((a: any) => a.name.endsWith('.exe') && !a.name.includes('helper'));
        const zipAsset = assets.find((a: any) => a.name.endsWith('.zip'));
        const apkAsset = assets.find((a: any) => a.name.endsWith('.apk'));

        const parsed: GithubReleaseData = {
          version: tag,
          name: latest.name || `Hamster Diogen ${tag}`,
          isPrerelease: Boolean(latest.prerelease),
          publishedDate: latest.published_at
            ? new Date(latest.published_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : DEFAULT_RELEASE.publishedDate,
          htmlUrl: latest.html_url || `https://github.com/DiogenDev/Hamster/releases/tag/${tag}`,
          setupExe: {
            name: exeAsset?.name || 'HamsterDiogen-Setup.exe',
            url: exeAsset?.browser_download_url || DEFAULT_RELEASE.setupExe.url,
            sizeMB: formatSize(exeAsset?.size),
            downloads: exeAsset?.download_count || 0,
          },
          portableZip: {
            name: zipAsset?.name || 'HamsterDiogen-Windows.zip',
            url: zipAsset?.browser_download_url || DEFAULT_RELEASE.portableZip.url,
            sizeMB: formatSize(zipAsset?.size),
            downloads: zipAsset?.download_count || 0,
          },
          apk: {
            name: apkAsset?.name || 'HamsterDiogen.apk',
            url: apkAsset?.browser_download_url || DEFAULT_RELEASE.apk.url,
            sizeMB: formatSize(apkAsset?.size),
            downloads: apkAsset?.download_count || 0,
          },
          isLive: true,
        };

        setReleaseInfo(parsed);
        localStorage.setItem('hamster_cached_release', JSON.stringify(parsed));
        localStorage.setItem('hamster_cached_release_time', String(now));
      } catch (err) {
        console.warn('[GitHub API] Использован кэш релиза:', err);
      }
    };

    fetchLatestRelease();
  }, []);

  const handleSelectTheme = (themeId: AppThemeId) => {
    soundManager.playClickSound();
    setBgTheme(themeId);
    setIsThemeMenuOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hamster_landing_theme', themeId);
    }
  };

  // Анимационный цикл интерактивного холста
  useEffect(() => {
    let animFrame: number;
    let frame = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      if (time - lastTime > 220) {
        frame = (frame + 1) % 4;
        lastTime = time;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Подиум
          ctx.fillStyle = '#1e1833';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#3a2434';
          ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
          ctx.fillStyle = '#e3bc82';
          ctx.fillRect(0, canvas.height - 20, canvas.width, 4);

          // Опилки
          ctx.fillStyle = '#fae6c8';
          for (let i = 8; i < canvas.width; i += 24) {
            ctx.fillRect(i, canvas.height - 16, 6, 2);
            ctx.fillRect(i + 12, canvas.height - 10, 4, 2);
          }

          let matrix = HAMSTER_24_IDLE_1;
          if (hamsterState === 'idle') {
            matrix = frame % 2 === 0 ? HAMSTER_24_IDLE_1 : HAMSTER_24_IDLE_2;
          } else if (hamsterState === 'eating') {
            matrix = frame % 2 === 0 ? HAMSTER_24_EAT_1 : HAMSTER_24_EAT_2;
          } else if (hamsterState === 'grooming') {
            matrix = frame % 2 === 0 ? HAMSTER_24_GROOM_1 : HAMSTER_24_GROOM_2;
          } else if (hamsterState === 'running') {
            matrix = frame % 2 === 0 ? HAMSTER_24_WALK_1 : HAMSTER_24_WALK_2;
          }

          const scale = 5;
          const hamsterW = 24 * scale;
          const hamsterH = 24 * scale;
          const startX = Math.floor((canvas.width - hamsterW) / 2);
          const startY = Math.floor(canvas.height - hamsterH - 12);

          // Мягкая тень
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.beginPath();
          ctx.ellipse(canvas.width / 2, canvas.height - 16, 45, 9, 0, 0, Math.PI * 2);
          ctx.fill();

          drawCharacterMatrix(ctx, matrix, startX, startY, currentPalette, scale, false);
        }
      }

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, [hamsterState, currentPalette]);

  const handleFeed = () => {
    soundManager.playClickSound();
    setHamsterState('eating');
    if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);
    stateTimeoutRef.current = setTimeout(() => setHamsterState('idle'), 3000);
  };

  const handlePet = () => {
    soundManager.playClickSound();
    setHamsterState('grooming');
    if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);
    stateTimeoutRef.current = setTimeout(() => setHamsterState('idle'), 2500);
  };

  const handleRun = () => {
    soundManager.playClickSound();
    setHamsterState('running');
    if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);
    stateTimeoutRef.current = setTimeout(() => setHamsterState('idle'), 3500);
  };

  const handleNextPalette = () => {
    soundManager.playClickSound();
    setPaletteIndex((prev) => (prev + 1) % HAMSTER_PALETTES.length);
  };

  const handleRandomQuote = () => {
    soundManager.playClickSound();
    const nextIdx = Math.floor(Math.random() * DIOGENES_QUOTES.length);
    setQuote(DIOGENES_QUOTES[nextIdx]);
  };

  const copyReleaseLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(releaseInfo.htmlUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden text-white selection:bg-[#fee761] selection:text-black scroll-smooth font-sans">
      {/* 1. ЖИВОЙ АНИМИРОВАННЫЙ ПИКСЕЛЬНЫЙ ФОН ИЗ ИГРЫ */}
      <DynamicPixelBackdrop themeId={bgTheme} />

      {/* 2. ЧИСТАЯ, ДЕЛОВАЯ НАВИГАЦИОННАЯ ПАНЕЛЬ */}
      <header className="sticky top-0 z-50 bg-[#120e24]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Нарисованный пиксельный логотип + название */}
          <div className="flex items-center gap-3">
            <PixelHamsterLogo size={30} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs sm:text-sm text-[#fee761] tracking-wider">
                  ХОМЯЧОК ДИОГЕН
                </span>
                <span className="text-[9px] font-pixel text-[#63c74d] px-1.5 py-0.5 bg-[#63c74d]/10 border border-[#63c74d]/30 rounded">
                  {releaseInfo.version}
                </span>
              </div>
              <span className="text-[10px] text-[#8b9bb4] hidden sm:block">
                Open-Source Desktop & Mobile Pet
              </span>
            </div>
          </div>

          {/* Центральное меню */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-[#c0cbdc]">
            <a href="#overview" className="hover:text-[#fee761] transition-colors">
              Обзор
            </a>
            <a href="#downloads" className="hover:text-[#fee761] transition-colors">
              Платформы
            </a>
            <a href="#architecture" className="hover:text-[#fee761] transition-colors">
              Архитектура
            </a>
            <a href="#features" className="hover:text-[#fee761] transition-colors">
              Возможности
            </a>
          </nav>

          {/* Правый блок: компактная шестеренка тем + GitHub + Live Demo */}
          <div className="flex items-center gap-2 relative">
            {/* КВАДРАТИК С ШЕСТЕРЕНКОЙ ДЛЯ СМЕНЫ ФОНА */}
            <div className="relative" ref={themeMenuRef}>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClickSound();
                  setIsThemeMenuOpen(!isThemeMenuOpen);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                  isThemeMenuOpen
                    ? 'bg-[#fee761] text-black border-[#fee761] shadow-pixel-sm'
                    : 'bg-[#241c38]/80 text-[#fee761] border-white/20 hover:border-[#fee761] hover:bg-[#2e2347]'
                }`}
                title="Сменить анимированный фон"
                aria-label="Настройки фона"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              {/* Выпадающая панель тем */}
              {isThemeMenuOpen && (
                <div className="absolute right-0 top-11 w-64 bg-[#181329]/95 backdrop-blur-xl border border-white/20 rounded-xl p-2.5 shadow-2xl z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 px-1">
                    <span className="text-[10px] font-pixel text-[#fee761]">
                      ФОН ИЗ ИГРЫ
                    </span>
                    <span className="text-[9px] text-[#8b9bb4]">Canvas 2D</span>
                  </div>

                  <div className="space-y-1">
                    {THEME_OPTIONS.map((t) => {
                      const isActive = bgTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTheme(t.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                            isActive
                              ? 'bg-[#fee761] text-black font-medium shadow-sm'
                              : 'text-[#c0cbdc] hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{t.icon}</span>
                            <span className="text-xs">{t.name}</span>
                          </div>
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* GitHub */}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#241c38]/80 hover:bg-[#2e2347] border border-white/20 rounded-lg text-xs text-white flex items-center gap-1.5 transition-all"
            >
              <Code className="w-3.5 h-3.5 text-[#fee761]" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* Live Web Demo */}
            {onPlayOnline && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClickSound();
                  onPlayOnline();
                }}
                className="px-3.5 py-1.5 bg-[#63c74d] hover:bg-[#52ad3f] text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm active:translate-y-0.5 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Запустить Web-демо</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO СЕКЦИЯ */}
      <section id="overview" className="relative px-4 sm:px-8 pt-8 sm:pt-14 pb-12">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Статус-бейдж */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black/50 backdrop-blur-md border border-white/15 rounded-full text-xs text-[#c0cbdc] mb-5">
            <span className="w-2 h-2 rounded-full bg-[#63c74d] animate-pulse" />
            <span>Инди-проект • Windows, Android и Web • Открытый исходный код</span>
          </div>

          <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-[#fee761] leading-tight mb-4 drop-shadow-[2px_2px_0px_#000]">
            ХОМЯЧОК ДИОГЕН
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#c0cbdc] max-w-2xl leading-relaxed mb-8">
            Интерактивный 2D-тамагочи с нативной интеграцией в оболочку Windows
            (режимы <strong>Desktop Pet</strong> и <strong>Live Wallpaper</strong>)
            и оптимизированным графическим движком на чистом Canvas 2D.
          </p>

          {/* Кнопки призыва к действию */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
            <a
              href="#downloads"
              className="px-6 py-3 bg-[#feae34] hover:bg-[#e8912f] text-black font-semibold rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-xl active:translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Скачать для Windows и Android</span>
            </a>

            {onPlayOnline && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClickSound();
                  onPlayOnline();
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold rounded-xl text-xs sm:text-sm backdrop-blur-md active:translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Запустить онлайн в браузере</span>
              </button>
            )}
          </div>

          {/* ИНТЕРАКТИВНЫЙ ХОЛСТ-ДЕМОНСТРАТОР */}
          <div className="w-full max-w-xl bg-[#1e1730]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-2xl text-left">
            {/* Панель цитаты */}
            <div className="mb-3.5 bg-black/40 border border-white/10 rounded-xl p-3 flex items-start gap-3">
              <span className="text-xl select-none mt-0.5">📜</span>
              <div className="flex-1">
                <span className="text-[10px] font-pixel text-[#fee761] block mb-0.5">
                  ФИЛОСОФИЯ ДИОГЕНА
                </span>
                <p className="text-xs sm:text-sm text-[#c0cbdc] italic leading-snug">
                  «{quote}»
                </p>
              </div>
              <button
                type="button"
                onClick={handleRandomQuote}
                className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                title="Случайная мысль"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#fee761]" />
              </button>
            </div>

            {/* Холст */}
            <div className="relative border-2 border-black rounded-xl overflow-hidden shadow-inner bg-[#141022] mx-auto flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={380}
                height={210}
                className="w-full max-w-md h-auto block select-none pixelated"
              />

              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-md text-[9px] font-pixel text-[#fee761]">
                Окрас: {currentPalette.name}
              </div>

              <div className="absolute bottom-2 left-2.5 bg-black/70 backdrop-blur-sm border border-white/10 px-2 py-0.5 rounded text-[9px] text-[#63c74d] font-mono">
                60 FPS • Canvas 2D
              </div>
            </div>

            {/* Кнопки управления интерактивом */}
            <div className="grid grid-cols-3 gap-2.5 mt-3.5 text-xs">
              <button
                type="button"
                onClick={handleFeed}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <span>🌻</span>
                <span>Семечка</span>
              </button>

              <button
                type="button"
                onClick={handlePet}
                className="py-2.5 px-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <span>❤️</span>
                <span>Погладить</span>
              </button>

              <button
                type="button"
                onClick={handleNextPalette}
                className="py-2.5 px-3 bg-[#feae34] hover:bg-[#e8912f] text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>🎨</span>
                <span>Окрас</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. БЛОК ДИСТРИБУТИВОВ И УСТАНОВКИ (GITHUB RELEASES) */}
      <section id="downloads" className="px-4 sm:px-8 py-12 bg-[#140e24]/85 backdrop-blur-lg border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono text-[#63c74d] tracking-wider uppercase block mb-1">
                Release Assets • {releaseInfo.version}
              </span>
              <h2 className="font-pixel text-xl sm:text-2xl text-[#fee761]">
                ДИСТРИБУТИВЫ И СКАЧИВАНИЕ
              </h2>
            </div>
            <div className="text-xs text-[#8b9bb4]">
              {releaseInfo.isLive ? (
                <span className="flex items-center gap-1.5 text-[#63c74d]">
                  <span className="w-2 h-2 rounded-full bg-[#63c74d]" />
                  Синхронизировано с GitHub Releases
                </span>
              ) : (
                <span>Релиз от {releaseInfo.publishedDate}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. WINDOWS SETUP */}
            <div className="bg-[#1e1730]/90 border border-white/15 rounded-2xl p-5 flex flex-col justify-between relative hover:border-[#feae34]/60 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-[#feae34]/15 border border-[#feae34]/30 rounded-xl flex items-center justify-center text-[#feae34]">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#feae34]/20 text-[#feae34] border border-[#feae34]/30 rounded-md font-medium">
                    Installer
                  </span>
                </div>

                <h3 className="font-semibold text-base text-white mb-1">
                  Windows Установщик
                </h3>
                <p className="text-xs text-[#8b9bb4] mb-4">
                  {releaseInfo.setupExe.name} • {releaseInfo.setupExe.sizeMB}
                </p>

                <ul className="text-xs text-[#c0cbdc] space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Автоматическая установка с ярлыками и деинсталлятором</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Режимы <strong>Desktop Pet</strong> и <strong>Live Wallpaper</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Интеграция в системный трей возле часов</span>
                  </li>
                </ul>
              </div>

              <a
                href={releaseInfo.setupExe.url}
                className="w-full py-2.5 bg-[#feae34] hover:bg-[#e8912f] text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Скачать Setup.exe</span>
              </a>
            </div>

            {/* 2. WINDOWS PORTABLE */}
            <div className="bg-[#1e1730]/90 border border-white/15 rounded-2xl p-5 flex flex-col justify-between relative hover:border-[#63c74d]/60 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-[#63c74d]/15 border border-[#63c74d]/30 rounded-xl flex items-center justify-center text-[#63c74d]">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#63c74d]/20 text-[#63c74d] border border-[#63c74d]/30 rounded-md font-medium">
                    Portable ZIP
                  </span>
                </div>

                <h3 className="font-semibold text-base text-white mb-1">
                  Windows Портативная
                </h3>
                <p className="text-xs text-[#8b9bb4] mb-4">
                  {releaseInfo.portableZip.name} • {releaseInfo.portableZip.sizeMB}
                </p>

                <ul className="text-xs text-[#c0cbdc] space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Не требует установки и прав администратора</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Мгновенный холодный старт (0.05-0.1 сек)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Все файлы и сохранения изолированы в папке</span>
                  </li>
                </ul>
              </div>

              <a
                href={releaseInfo.portableZip.url}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Скачать .zip архив</span>
              </a>
            </div>

            {/* 3. ANDROID APK */}
            <div className="bg-[#1e1730]/90 border border-white/15 rounded-2xl p-5 flex flex-col justify-between relative hover:border-[#fee761]/60 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-[#fee761]/15 border border-[#fee761]/30 rounded-xl flex items-center justify-center text-[#fee761]">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#fee761]/20 text-[#fee761] border border-[#fee761]/30 rounded-md font-medium">
                    Android APK
                  </span>
                </div>

                <h3 className="font-semibold text-base text-white mb-1">
                  Android Приложение
                </h3>
                <p className="text-xs text-[#8b9bb4] mb-4">
                  {releaseInfo.apk.name} • {releaseInfo.apk.sizeMB}
                </p>

                <ul className="text-xs text-[#c0cbdc] space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Компактный размер пакета (~5 МБ)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>100% автономная работа без подключения к сети</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Сенсорная адаптация и локальные уведомления</span>
                  </li>
                </ul>
              </div>

              <a
                href={releaseInfo.apk.url}
                className="w-full py-2.5 bg-[#63c74d] hover:bg-[#52ad3f] text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Скачать APK-файл</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ИНЖЕНЕРНЫЙ БЛОК ДЛЯ ПОРТФОЛИО (ТЕХНОЛОГИИ И АРХИТЕКТУРА) */}
      <section id="architecture" className="px-4 sm:px-8 py-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-[#fee761] tracking-wider uppercase block mb-1">
              • Engineering & Architecture •
            </span>
            <h2 className="font-pixel text-xl sm:text-2xl text-white mb-2">
              ТЕХНИЧЕСКИЙ СТЕК И РЕШЕНИЯ
            </h2>
            <p className="text-xs sm:text-sm text-[#8b9bb4] max-w-xl mx-auto">
              Разработано с акцентом на высокую производительность, низкое потребление ресурсов и глубокую системную интеграцию.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* ТЕХ 1: WIN32 WORKERW */}
            <div className="bg-[#1e1730]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2.5 mb-3 text-[#63c74d]">
                <Terminal className="w-5 h-5" />
                <h3 className="font-semibold text-sm text-white">Win32 WorkerW Hook</h3>
              </div>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Интеграция с оболочкой Windows Explorer через отправку системных сообщений <code className="text-[#fee761] bg-black/40 px-1 py-0.5 rounded">0x052C</code> окну <code className="text-[#fee761] bg-black/40 px-1 py-0.5 rounded">Progman</code>. Приложение закрепляется в слое WorkerW строго позади всех ярлыков рабочего стола.
              </p>
            </div>

            {/* ТЕХ 2: CANVAS 2D 60 FPS */}
            <div className="bg-[#1e1730]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2.5 mb-3 text-[#feae34]">
                <Cpu className="w-5 h-5" />
                <h3 className="font-semibold text-sm text-white">Canvas 2D Engine</h3>
              </div>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Оптимизированный рендеринг на HTML5 Canvas с циклом <code className="text-[#fee761] bg-black/40 px-1 py-0.5 rounded">requestAnimationFrame</code> без накладных расходов React. Потребление CPU &lt; 0.2%, стабильные 60 кадров/сек в режиме оверлея.
              </p>
            </div>

            {/* ТЕХ 3: КРОССПЛАТФОРМЕННОСТЬ */}
            <div className="bg-[#1e1730]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2.5 mb-3 text-[#fee761]">
                <Layers className="w-5 h-5" />
                <h3 className="font-semibold text-sm text-white">Single Codebase</h3>
              </div>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Единый стек на TypeScript и Next.js 14 (App Router, Static Export). Дистрибутив упаковывается в нативный Windows-бандл через Electron и в мобильное приложение через Capacitor.
              </p>
            </div>

            {/* ТЕХ 4: ДЕСКТОП ПИТОМЕЦ */}
            <div className="bg-[#1e1730]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2.5 mb-3 text-[#ff8fa8]">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold text-sm text-white">Frameless Desktop Pet</h3>
              </div>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Прозрачное безрамочное окно Shimeji поверх всех окон Windows. Перетаскивание левой кнопкой мыши, контекстное меню в трее и мгновенное возвращение в полноценный режим двойным кликом.
              </p>
            </div>

            {/* ТЕХ 5: АВТОНОМНОСТЬ */}
            <div className="bg-[#1e1730]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2.5 mb-3 text-[#63c74d]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-semibold text-sm text-white">100% Offline & Safe</h3>
              </div>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Полная независимость от внешних серверов. Надежная схема сохранения состояния с автоматическим расчетом прошедшего времени (оффлайн-режим с защитой от гибели питомца).
              </p>
            </div>

            {/* ТЕХ 6: ПИКСЕЛЬНЫЙ ПАЙПЛАЙН */}
            <div className="bg-[#1e1730]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-2.5 mb-3 text-[#c0cbdc]">
                <Palette className="w-5 h-5" />
                <h3 className="font-semibold text-sm text-white">Pixel Art & Sprite Engine</h3>
              </div>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                20 палитр пород, процедурная матричная перекраска спрайтов в реальном времени, редактор скинов с поддержкой алгоритма заливки Flood Fill.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ГЕЙМПЛЕЙ И ВОЗМОЖНОСТИ */}
      <section id="features" className="px-4 sm:px-8 py-12 bg-[#140e24]/85 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-pixel text-xl sm:text-2xl text-[#fee761] mb-2">
              ИГРОВЫЕ ВОЗМОЖНОСТИ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#1e1730]/80 border border-white/10 rounded-xl p-4">
              <div className="text-2xl mb-2">🪟</div>
              <h3 className="font-semibold text-sm text-[#fee761] mb-1">
                Питомец на рабочем столе
              </h3>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Свободно бегает поверх рабочих приложений. Реагирует на клики, ласку и перетаскивание курсором.
              </p>
            </div>

            <div className="bg-[#1e1730]/80 border border-white/10 rounded-xl p-4">
              <div className="text-2xl mb-2">🖼️</div>
              <h3 className="font-semibold text-sm text-[#fee761] mb-1">
                Живые обои рабочего стола
              </h3>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Клетка встраивается на задний план под ярлыки и окна, создавая уютную дзен-атмосферу во время работы.
              </p>
            </div>

            <div className="bg-[#1e1730]/80 border border-white/10 rounded-xl p-4">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold text-sm text-[#fee761] mb-1">
                20 Окрасов и Редактор
              </h3>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                От золотистого сирийца до сапфирового джунгарика, плюс возможность нарисовать свой скин попиксельно.
              </p>
            </div>

            <div className="bg-[#1e1730]/80 border border-white/10 rounded-xl p-4">
              <div className="text-2xl mb-2">🏰</div>
              <h3 className="font-semibold text-sm text-[#fee761] mb-1">
                Кастомизация клетки
              </h3>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Многоэтажные тоннели, колесо, керамические укрытия, кормушки, лесенки и песочные ванночки.
              </p>
            </div>

            <div className="bg-[#1e1730]/80 border border-white/10 rounded-xl p-4">
              <div className="text-2xl mb-2">📜</div>
              <h3 className="font-semibold text-sm text-[#fee761] mb-1">
                Философия античного Диогена
              </h3>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Остроумные философские высказывания о простоте, умеренности и суете повседневной жизни.
              </p>
            </div>

            <div className="bg-[#1e1730]/80 border border-white/10 rounded-xl p-4">
              <div className="text-2xl mb-2">🎵</div>
              <h3 className="font-semibold text-sm text-[#fee761] mb-1">
                Чиптюн Lo-Fi саундтрек
              </h3>
              <p className="text-xs text-[#c0cbdc] leading-relaxed">
                Встроенный 8-битный аудиопроигрыватель с расслабляющими ретро-треками для фокуса и сна.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ПОДВАЛ */}
      <footer className="bg-[#0e0a1a] border-t border-white/10 px-4 sm:px-8 py-8 text-xs text-[#8b9bb4]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <PixelHamsterLogo size={22} />
            <span className="font-pixel text-[11px] text-[#fee761]">
              ХОМЯЧОК ДИОГЕН • {releaseInfo.version}
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <a
              href={releaseInfo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>GitHub Release</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={copyReleaseLink}
              className="hover:text-[#63c74d] transition-colors"
            >
              {copiedLink ? '✓ Ссылка скопирована' : 'Поделиться'}
            </button>
          </div>

          <div className="text-[11px] text-[#5a6988]">
            MIT License • Open Source Portfolio Project
          </div>
        </div>
      </footer>
    </div>
  );
};
