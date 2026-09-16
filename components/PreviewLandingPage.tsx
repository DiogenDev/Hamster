/**
 * ============================================================================
 * КОМПОНЕНТ: PreviewLandingPage.tsx (Сайт-превью и хаб установки игры)
 * ============================================================================
 * - Интерактивный анимированный пиксельный фон из игры с мгновенным переключением
 * - Динамическая синхронизация версии и ссылок на скачивание напрямую с GitHub API
 * - Интерактивный хомяк Диоген (кормление, поглаживания, колесо, смена окраса)
 * - Прямые ссылки на установку для Windows (Setup, Portable) и Android (APK)
 * - Кнопка мгновенного запуска в браузере без скачивания
 * - Живой, неформальный текст без бюрократии и канцеляризмов
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
  Sparkles,
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

const THEME_OPTIONS: { id: AppThemeId; name: string; icon: string }[] = [
  { id: 'retro_arcade', name: 'Космос', icon: '👾' },
  { id: 'gameboy_classic', name: 'GameBoy', icon: '🎮' },
  { id: 'cyberpunk_neon', name: 'Неон', icon: '⚡' },
  { id: 'cozy_autumn', name: 'Кофе', icon: '☕' },
  { id: 'pastel_dream', name: 'Сакура', icon: '🌸' },
  { id: 'midnight_synth', name: 'Синтвейв', icon: '🌆' },
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

// Дефолтные данные релиза на случай офлайна или задержки сети
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

export const PreviewLandingPage: React.FC<PreviewLandingPageProps> = ({ onPlayOnline }) => {
  // Тема анимированного фона (как в игре)
  const [bgTheme, setBgTheme] = useState<AppThemeId>('retro_arcade');

  // Динамические данные релиза с GitHub API
  const [releaseInfo, setReleaseInfo] = useState<GithubReleaseData>(DEFAULT_RELEASE);

  // Состояния интерактива
  const [paletteIndex, setPaletteIndex] = useState<number>(0);
  const [hamsterState, setHamsterState] = useState<'idle' | 'eating' | 'grooming' | 'running'>('idle');
  const [quote, setQuote] = useState<string>(DIOGENES_QUOTES[0]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentPalette = HAMSTER_PALETTES[paletteIndex] || HAMSTER_PALETTES[0];

  // 1. Загрузка темы из локального хранилища
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('hamster_landing_theme') as AppThemeId;
      if (savedTheme && THEME_OPTIONS.some((t) => t.id === savedTheme)) {
        setBgTheme(savedTheme);
      }
    }
  }, []);

  // 2. ДИНАМИЧЕСКИЙ ЗАПРОС РЕЛИЗОВ С GITHUB API
  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        // Проверяем кэш, чтобы не бомбить лимиты GitHub API
        const cached = localStorage.getItem('hamster_cached_release');
        const cachedTime = Number(localStorage.getItem('hamster_cached_release_time') || 0);
        const now = Date.now();

        if (cached && now - cachedTime < 10 * 60 * 1000) {
          // Кэш свежее 10 минут
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

        // Берем самый свежий релиз (первый в списке)
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
        console.warn('[GitHub API] Не удалось обновить релиз с GitHub, используется кэш/дефолт:', err);
      }
    };

    fetchLatestRelease();
  }, []);

  const handleSelectTheme = (themeId: AppThemeId) => {
    soundManager.playClickSound();
    setBgTheme(themeId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hamster_landing_theme', themeId);
    }
  };

  // Анимация хомячка на интерактивном холсте
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

          // Уютный подиум с опилками
          ctx.fillStyle = '#1e1833';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#45283c';
          ctx.fillRect(0, canvas.height - 24, canvas.width, 24);
          ctx.fillStyle = '#e3bc82';
          ctx.fillRect(0, canvas.height - 20, canvas.width, 4);

          // Опилки на полу
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

          // Тень
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
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden text-white selection:bg-[#fee761] selection:text-black scroll-smooth">
      {/* 1. ЖИВОЙ АНИМИРОВАННЫЙ ПИКСЕЛЬНЫЙ ФОН ИЗ ИГРЫ */}
      <DynamicPixelBackdrop themeId={bgTheme} />

      {/* 2. НАВИГАЦИОННАЯ ПАНЕЛЬ */}
      <header className="sticky top-0 z-50 bg-[#141022]/90 backdrop-blur-md border-b-4 border-black px-3 sm:px-6 py-2.5 shadow-pixel">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Чистый стильный пиксельный логотип БЕЗ квадратного эмодзи */}
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs sm:text-base text-[#fee761] tracking-wider drop-shadow-[2px_2px_0px_#000]">
              ХОМЯЧОК ДИОГЕН
            </span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/60 border border-[#63c74d]/60 rounded">
              <span className={`w-1.5 h-1.5 rounded-full ${releaseInfo.isLive ? 'bg-[#63c74d] animate-pulse' : 'bg-[#feae34]'}`} />
              <span className="text-[9px] font-pixel text-[#63c74d]">
                {releaseInfo.version}
              </span>
            </div>
          </div>

          {/* Переключалка тем заднего фона прямо в шапке */}
          <div className="hidden lg:flex items-center gap-1 bg-black/50 border border-white/20 p-1 rounded-lg">
            <span className="text-[9px] font-pixel text-[#8b9bb4] px-1">Фон:</span>
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTheme(t.id)}
                className={`px-2 py-1 text-[9px] font-pixel rounded transition-all ${
                  bgTheme === t.id
                    ? 'bg-[#fee761] text-black font-bold shadow-pixel-sm'
                    : 'text-[#c0cbdc] hover:text-[#fee761]'
                }`}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </div>

          {/* Действия */}
          <div className="flex items-center gap-2">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-[#262b44] hover:bg-[#3a4466] border-2 border-black rounded text-[10px] font-pixel text-white flex items-center gap-1.5 shadow-pixel-sm active:translate-y-0.5 transition-all"
            >
              <Code className="w-3.5 h-3.5 text-[#fee761]" />
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {onPlayOnline && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClickSound();
                  onPlayOnline();
                }}
                className="px-3 py-1.5 bg-[#63c74d] hover:bg-[#52ad3f] text-black border-2 border-black rounded text-[10px] sm:text-xs font-pixel flex items-center gap-1.5 shadow-pixel-sm active:translate-y-0.5 transition-all font-bold"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Играть онлайн</span>
              </button>
            )}
          </div>
        </div>

        {/* Мобильная переключалка тем */}
        <div className="flex lg:hidden items-center justify-center gap-1 mt-2 pt-2 border-t border-white/10 overflow-x-auto pb-0.5">
          <span className="text-[8px] font-pixel text-[#8b9bb4] shrink-0">Фон:</span>
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTheme(t.id)}
              className={`px-2 py-0.5 text-[8px] font-pixel rounded shrink-0 transition-all ${
                bgTheme === t.id
                  ? 'bg-[#fee761] text-black font-bold'
                  : 'text-[#c0cbdc] bg-black/40'
              }`}
            >
              {t.icon} {t.name}
            </button>
          ))}
        </div>
      </header>

      {/* 3. ГЕРОЙ-СЕКЦИЯ (HERO) */}
      <section className="relative px-3 sm:px-6 pt-6 sm:pt-10 pb-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* Бейдж версии с прямой ссылкой на GitHub релиз */}
          <a
            href={releaseInfo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur border-2 border-black rounded-full shadow-pixel-sm mb-4 hover:border-[#fee761] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#63c74d] animate-ping" />
            <span className="text-[10px] font-pixel text-[#fee761]">
              {releaseInfo.isPrerelease ? 'Бета-тест открыт' : 'Свежий релиз'}: {releaseInfo.version}
            </span>
            <ExternalLink className="w-3 h-3 text-[#fee761]" />
          </a>

          <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-[#fee761] leading-tight mb-4 drop-shadow-[3px_3px_0px_#000]">
            ХОМЯЧОК ДИОГЕН
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#c0cbdc] max-w-2xl leading-relaxed mb-6 font-sans">
            Твой личный карманный философ в теле пушистого хомяка-буханочки.
            Бегает прямо по рабочему столу поверх открытых окон, живёт на обоях,
            кушает семечки и выдаёт базу об устройстве мира.
          </p>

          {/* Быстрые кнопки */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <a
              href="#downloads"
              className="px-5 py-3 bg-[#feae34] hover:bg-[#e8912f] text-black border-4 border-black rounded-lg font-pixel text-xs sm:text-sm shadow-pixel hover:shadow-pixel-lg active:translate-y-1 transition-all flex items-center gap-2 font-bold"
            >
              <Download className="w-4 h-4" />
              <span>Забрать игру на ПК или телефон</span>
            </a>

            {onPlayOnline && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClickSound();
                  onPlayOnline();
                }}
                className="px-5 py-3 bg-[#63c74d] hover:bg-[#52ad3f] text-black border-4 border-black rounded-lg font-pixel text-xs sm:text-sm shadow-pixel hover:shadow-pixel-lg active:translate-y-1 transition-all flex items-center gap-2 font-bold"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Запустить в браузере (0 МБ)</span>
              </button>
            )}
          </div>

          {/* ИНТЕРАКТИВНЫЙ ХОЛСТ С ХОМЯКОМ */}
          <div className="w-full max-w-xl bg-[#262b44]/90 backdrop-blur-md border-4 border-black rounded-xl p-3 sm:p-5 shadow-pixel-lg text-left">
            {/* Мысль Диогена */}
            <div className="mb-3 bg-black/60 border-2 border-black rounded-lg p-3 shadow-pixel-sm flex items-start gap-2.5">
              <span className="text-xl select-none">📜</span>
              <div className="flex-1">
                <span className="text-[9px] text-[#fee761] font-pixel block mb-0.5">
                  Мудрость Диогена:
                </span>
                <p className="text-xs sm:text-sm text-[#c0cbdc] italic font-sans leading-snug">
                  «{quote}»
                </p>
              </div>
              <button
                type="button"
                onClick={handleRandomQuote}
                className="p-1.5 bg-[#3a4466] hover:bg-[#5a6988] border border-black rounded text-white shadow-pixel-sm active:translate-y-0.5"
                title="Другая мысль"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#fee761]" />
              </button>
            </div>

            {/* Холст */}
            <div className="relative border-4 border-black rounded-lg overflow-hidden shadow-pixel bg-[#181425] mx-auto flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={380}
                height={210}
                className="w-full max-w-md h-auto block select-none pixelated"
              />

              <div className="absolute top-2 right-2 bg-black/80 border border-white/20 px-2 py-0.5 rounded text-[9px] font-pixel text-[#fee761]">
                {currentPalette.name}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[10px] font-pixel">
              <button
                type="button"
                onClick={handleFeed}
                className="p-2 bg-[#3a4466] hover:bg-[#5a6988] border-2 border-black rounded text-white shadow-pixel-sm active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
              >
                <span>🌻</span>
                <span>Семечка</span>
              </button>

              <button
                type="button"
                onClick={handlePet}
                className="p-2 bg-[#3a4466] hover:bg-[#5a6988] border-2 border-black rounded text-white shadow-pixel-sm active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
              >
                <span>❤️</span>
                <span>Погладить</span>
              </button>

              <button
                type="button"
                onClick={handleRun}
                className="p-2 bg-[#3a4466] hover:bg-[#5a6988] border-2 border-black rounded text-white shadow-pixel-sm active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
              >
                <span>🎡</span>
                <span>Колесо</span>
              </button>

              <button
                type="button"
                onClick={handleNextPalette}
                className="p-2 bg-[#feae34] hover:bg-[#e8912f] text-black border-2 border-black rounded font-bold shadow-pixel-sm active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
              >
                <span>🎨</span>
                <span>Скин</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. БЛОК СКАЧИВАНИЯ (DOWNLOADS) С АКТУАЛЬНЫМИ ССЫЛКАМИ GITHUB */}
      <section id="downloads" className="px-3 sm:px-6 py-10 bg-[#1a152e]/85 backdrop-blur-md border-y-4 border-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-pixel text-xl sm:text-3xl text-[#fee761] drop-shadow-[2px_2px_0px_#000] mb-2">
              ГДЕ БУДЕМ ИГРАТЬ?
            </h2>
            <p className="text-xs sm:text-sm text-[#c0cbdc] max-w-xl mx-auto font-sans">
              Качай на ПК, ставь на телефон или открывай прямо в браузере.
              Никакой рекламы, донатов и регистраций — просто запускай и кайфуй.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* 1. WINDOWS УСТАНОВЩИК */}
            <div className="bg-[#241c38]/90 border-4 border-black rounded-xl p-4 sm:p-5 shadow-pixel flex flex-col justify-between relative overflow-hidden group hover:border-[#feae34] transition-all">
              <div className="absolute top-2 right-2 bg-[#feae34] text-black text-[9px] font-pixel px-2 py-0.5 rounded font-bold border border-black">
                ТОП ВЫБОР ДЛЯ ПК
              </div>

              <div>
                <div className="w-12 h-12 bg-[#3a4466] border-2 border-black rounded-lg flex items-center justify-center mb-3 shadow-pixel-sm">
                  <Monitor className="w-6 h-6 text-[#fee761]" />
                </div>

                <h3 className="font-pixel text-sm sm:text-base text-[#fee761] mb-1">
                  Windows Installer
                </h3>
                <span className="text-[10px] font-pixel text-[#8b9bb4] block mb-3 truncate" title={releaseInfo.setupExe.name}>
                  {releaseInfo.setupExe.name} • {releaseInfo.setupExe.sizeMB}
                </span>

                <ul className="text-xs text-[#c0cbdc] space-y-2 mb-6 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Установка в один клик с ярлыком на рабочем столе</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Хомячок бегает поверх всех окон (60 FPS, не лагает)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Режим живых обоев под всеми иконками и папками</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Иконка в трее возле часов для быстрого управления</span>
                  </li>
                </ul>
              </div>

              <a
                href={releaseInfo.setupExe.url}
                className="w-full py-3 bg-[#63c74d] hover:bg-[#52ad3f] text-black border-2 border-black rounded-lg font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm active:translate-y-0.5 font-bold transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Скачать Setup.exe</span>
              </a>
            </div>

            {/* 2. WINDOWS ПОРТАТИВНАЯ (.ZIP) */}
            <div className="bg-[#241c38]/90 border-4 border-black rounded-xl p-4 sm:p-5 shadow-pixel flex flex-col justify-between relative overflow-hidden group hover:border-[#63c74d] transition-all">
              <div className="absolute top-2 right-2 bg-[#3a4466] text-white text-[9px] font-pixel px-2 py-0.5 rounded border border-black">
                БЕЗ УСТАНОВКИ
              </div>

              <div>
                <div className="w-12 h-12 bg-[#3a4466] border-2 border-black rounded-lg flex items-center justify-center mb-3 shadow-pixel-sm">
                  <PackageCheck className="w-6 h-6 text-[#63c74d]" />
                </div>

                <h3 className="font-pixel text-sm sm:text-base text-[#63c74d] mb-1">
                  Windows Portable
                </h3>
                <span className="text-[10px] font-pixel text-[#8b9bb4] block mb-3 truncate" title={releaseInfo.portableZip.name}>
                  {releaseInfo.portableZip.name} • {releaseInfo.portableZip.sizeMB}
                </span>

                <ul className="text-xs text-[#c0cbdc] space-y-2 mb-6 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Для тех, кто не любит установщики и админ-права</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Распаковал в любую папку или на флешку</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Стартует мгновенно за 0.1 сек через HamsterDiogen.exe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Все сейвы хранятся локально и не теряются</span>
                  </li>
                </ul>
              </div>

              <a
                href={releaseInfo.portableZip.url}
                className="w-full py-3 bg-[#3a4466] hover:bg-[#5a6988] text-white border-2 border-black rounded-lg font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm active:translate-y-0.5 font-bold transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Скачать .zip архив</span>
              </a>
            </div>

            {/* 3. ANDROID APK */}
            <div className="bg-[#241c38]/90 border-4 border-black rounded-xl p-4 sm:p-5 shadow-pixel flex flex-col justify-between relative overflow-hidden group hover:border-[#feae34] transition-all">
              <div className="absolute top-2 right-2 bg-[#68386c] text-white text-[9px] font-pixel px-2 py-0.5 rounded border border-black">
                ДЛЯ ТЕЛЕФОНА
              </div>

              <div>
                <div className="w-12 h-12 bg-[#3a4466] border-2 border-black rounded-lg flex items-center justify-center mb-3 shadow-pixel-sm">
                  <Smartphone className="w-6 h-6 text-[#feae34]" />
                </div>

                <h3 className="font-pixel text-sm sm:text-base text-[#feae34] mb-1">
                  Android APK
                </h3>
                <span className="text-[10px] font-pixel text-[#8b9bb4] block mb-3 truncate" title={releaseInfo.apk.name}>
                  {releaseInfo.apk.name} • {releaseInfo.apk.sizeMB}
                </span>

                <ul className="text-xs text-[#c0cbdc] space-y-2 mb-6 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Весит всего 5 МБ — качается за 2 секунды</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>100% офлайн — играй в метро, самолёте или на парах</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Удобное сенсорное управление и звуковые эффекты</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#63c74d] shrink-0 mt-0.5" />
                    <span>Напоминалки, когда хомяку пора подсыпать корм</span>
                  </li>
                </ul>
              </div>

              <a
                href={releaseInfo.apk.url}
                className="w-full py-3 bg-[#feae34] hover:bg-[#e8912f] text-black border-2 border-black rounded-lg font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm active:translate-y-0.5 font-bold transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Скачать APK на телефон</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ЧЕМ ЗАНЯТЬСЯ В ИГРЕ (ФИЧИ) */}
      <section className="px-3 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-pixel text-xl sm:text-3xl text-[#fee761] drop-shadow-[2px_2px_0px_#000] mb-2">
              ТУТ КУЧА ВСЕГО:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-[#241c38]/85 backdrop-blur border-4 border-black rounded-xl p-4 shadow-pixel">
              <div className="text-2xl mb-2">🪟</div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#fee761] mb-1.5">
                Питомец на рабочем столе
              </h3>
              <p className="text-xs text-[#c0cbdc] font-sans leading-relaxed">
                Хомячок бегает прямо поверх твоих браузеров, телеграма и кода. Можно гладить правой кнопкой мыши или перетаскивать левой.
              </p>
            </div>

            <div className="bg-[#241c38]/85 backdrop-blur border-4 border-black rounded-xl p-4 shadow-pixel">
              <div className="text-2xl mb-2">🖼️</div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#fee761] mb-1.5">
                Живые обои WorkerW
              </h3>
              <p className="text-xs text-[#c0cbdc] font-sans leading-relaxed">
                Клетка встраивается прямо в рабочий стол под все иконки и папки. Никаких лагов и ноль помех для работы за компом.
              </p>
            </div>

            <div className="bg-[#241c38]/85 backdrop-blur border-4 border-black rounded-xl p-4 shadow-pixel">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#fee761] mb-1.5">
                20+ Окрасов и Свой Скин
              </h3>
              <p className="text-xs text-[#c0cbdc] font-sans leading-relaxed">
                Золотистый сириец, джунгарик, альбинос, кибер-хомяк или нарисуй собственного уникального питомца во встроенной мастерской.
              </p>
            </div>

            <div className="bg-[#241c38]/85 backdrop-blur border-4 border-black rounded-xl p-4 shadow-pixel">
              <div className="text-2xl mb-2">🏰</div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#fee761] mb-1.5">
                Многоэтажная вилла
              </h3>
              <p className="text-xs text-[#c0cbdc] font-sans leading-relaxed">
                Прокачивай клетку до 4 этажей с тоннелями, лесенками, керамическими домиками, песочной ванной и беговыми колесами.
              </p>
            </div>

            <div className="bg-[#241c38]/85 backdrop-blur border-4 border-black rounded-xl p-4 shadow-pixel">
              <div className="text-2xl mb-2">📜</div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#fee761] mb-1.5">
                Философия Диогена
              </h3>
              <p className="text-xs text-[#c0cbdc] font-sans leading-relaxed">
                Хомяк сыплет остроумными мыслями о простоте жизни, лени, сытости и бессмысленности вечной суеты.
              </p>
            </div>

            <div className="bg-[#241c38]/85 backdrop-blur border-4 border-black rounded-xl p-4 shadow-pixel">
              <div className="text-2xl mb-2">🎵</div>
              <h3 className="font-pixel text-xs sm:text-sm text-[#fee761] mb-1.5">
                8-битный ретро Lo-Fi
              </h3>
              <p className="text-xs text-[#c0cbdc] font-sans leading-relaxed">
                Встроенный чиптюн-плеер с атмосферными расслабляющими треками для учебы, работы или сна.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ПОДВАЛ */}
      <footer className="bg-[#0f0b1a]/95 border-t-4 border-black px-3 sm:px-6 py-6 text-center text-xs">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <div className="font-pixel text-xs text-[#fee761]">
            ХОМЯЧОК ДИОГЕН • {releaseInfo.version}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-pixel">
            <a
              href={releaseInfo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c0cbdc] hover:text-[#fee761] transition-colors flex items-center gap-1"
            >
              <span>GitHub Релиз ({releaseInfo.version})</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#3a4466]">•</span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c0cbdc] hover:text-[#fee761] transition-colors flex items-center gap-1"
            >
              <span>Исходный код</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#3a4466]">•</span>
            <button
              type="button"
              onClick={copyReleaseLink}
              className="text-[#c0cbdc] hover:text-[#63c74d] transition-colors"
            >
              {copiedLink ? '✓ Скопировано!' : 'Скопировать ссылку'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
