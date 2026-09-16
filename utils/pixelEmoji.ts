/**
 * ============================================================================
 * МОДУЛЬ: utils/pixelEmoji.ts (Аутентичный Ретро Пиксель-Арт для Эмодзи)
 * ============================================================================
 * 
 * 🎓 АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ:
 * Вместо размытых векторных шрифтов ОС (ctx.fillText('💖')) этот модуль
 * выполняет попиксельный рендеринг по сеткам 8x8 - 12x12 с целочисленным масштабированием.
 * Поддерживает все игровые реакции, еду, соки, капельки и частицы.
 */

interface PixelEmojiDef {
  width: number;
  height: number;
  palette: Record<string, string>;
  matrix: string[];
}

export const PIXEL_EMOJIS: Record<string, PixelEmojiDef> = {
  // 💖 Сердечко
  '💖': {
    width: 10,
    height: 9,
    palette: {
      R: '#e11d48',
      P: '#fb7185',
      W: '#ffffff',
      D: '#881337',
    },
    matrix: [
      '.DD..DD...',
      'DPWDDPRD..',
      'DPWRPPRRD.',
      'DRPPPPPRD.',
      '.DRPPPPRD.',
      '..DRPPRD..',
      '...DRPRD..',
      '....DRD...',
      '.....D....',
    ],
  },
  '❤️': {
    width: 10,
    height: 9,
    palette: {
      R: '#ef4444',
      P: '#f87171',
      W: '#ffffff',
      D: '#991b1b',
    },
    matrix: [
      '.DD..DD...',
      'DPWDDPRD..',
      'DPWRPPRRD.',
      'DRPPPPPRD.',
      '.DRPPPPRD.',
      '..DRPPRD..',
      '...DRPRD..',
      '....DRD...',
      '.....D....',
    ],
  },

  // 💤 Zzz Сон
  '💤': {
    width: 10,
    height: 10,
    palette: {
      C: '#38bdf8',
      W: '#e0f2fe',
      D: '#0369a1',
    },
    matrix: [
      '..DDDDD...',
      '..DCCCD...',
      '....DCD...',
      '...DCD....',
      '..DCCCD...',
      '..DDDDD...',
      '.....DDDD.',
      '.....DCCD.',
      '....DCD...',
      '....DDDD..',
    ],
  },

  // 🌾 Зерно / колосок
  '🌾': {
    width: 9,
    height: 10,
    palette: {
      Y: '#facc15',
      O: '#ca8a04',
      G: '#65a30d',
      D: '#713f12',
    },
    matrix: [
      '....DDD..',
      '...DYYOD.',
      '..DYYOD..',
      '.DYYOGD..',
      '.DYYOGD..',
      '..DYOGD..',
      '...DGOD..',
      '...DGD...',
      '..DGD....',
      '.DD......',
    ],
  },

  // 💧 Капля чистой воды
  '💧': {
    width: 9,
    height: 10,
    palette: {
      B: '#0284c7',
      L: '#38bdf8',
      W: '#ffffff',
      D: '#0369a1',
    },
    matrix: [
      '....D....',
      '...DLD...',
      '..DLWLD..',
      '.DLWWLLD.',
      '.DLLLLBD.',
      'DLLLLLBBD',
      'DLLLLLBBD',
      '.DLLLBBD.',
      '..DBBBD..',
      '...DDD...',
    ],
  },

  // 🧃 Пакетик сока с соломинкой
  '🧃': {
    width: 10,
    height: 11,
    palette: {
      O: '#f97316',
      Y: '#fde047',
      W: '#ffffff',
      S: '#ef4444',
      D: '#7c2d12',
    },
    matrix: [
      '......DD..',
      '....DWWD..',
      '....DSDD..',
      '..DDDDDD..',
      '.DOWWWODD.',
      '.DOYYYODD.',
      '.DOYYYODD.',
      '.DOYYYODD.',
      '.DOYYYODD.',
      '.DOOOOODD.',
      '..DDDDDD..',
    ],
  },

  // 🥕 Морковка
  '🥕': {
    width: 10,
    height: 10,
    palette: {
      O: '#ea580c',
      L: '#fb923c',
      G: '#22c55e',
      D: '#7c2d12',
    },
    matrix: [
      '.......GD.',
      '.....GGD..',
      '...DGGDD..',
      '..DLLOOD..',
      '.DLLLOOD..',
      '.DLLLOOD..',
      '..DLLOOD..',
      '...DLOOD..',
      '....DODD..',
      '.....DD...',
    ],
  },

  // 🍎 Яблочко
  '🍎': {
    width: 10,
    height: 10,
    palette: {
      R: '#dc2626',
      L: '#f87171',
      W: '#ffffff',
      G: '#16a34a',
      D: '#7f1d1d',
      B: '#78350f',
    },
    matrix: [
      '....BD....',
      '...DGD....',
      '..DDDD....',
      '.DLLRRRD..',
      '.DLWWRRD..',
      'DLLRRRRRD.',
      'DLLRRRRRD.',
      '.DLRRRRD..',
      '..DRRRDD..',
      '...DDD....',
    ],
  },

  // 🍓 Клубничка
  '🍓': {
    width: 10,
    height: 10,
    palette: {
      R: '#e11d48',
      L: '#fb7185',
      Y: '#facc15',
      G: '#22c55e',
      D: '#881337',
    },
    matrix: [
      '...DGGD...',
      '..DGGGGD..',
      '.DDDDDDDD.',
      'DLLRRRRRD.',
      'DLYRRYRRD.',
      'DLRRYRRRD.',
      '.DLYRRYD..',
      '..DLRRD...',
      '...DLD....',
      '....D.....',
    ],
  },

  // 🧀 Сыр
  '🧀': {
    width: 10,
    height: 9,
    palette: {
      Y: '#facc15',
      L: '#fef08a',
      O: '#d97706',
      D: '#78350f',
    },
    matrix: [
      '....DDDD..',
      '..DDLLLYD.',
      '.DLLLLLYD.',
      'DLLLLLLYD.',
      'DLYYOLLOD.',
      'DLLLYYYOD.',
      'DLYOYYYYD.',
      '.DYYYYOD..',
      '..DDDDD...',
    ],
  },

  // 🥜 Арахис / орех
  '🥜': {
    width: 9,
    height: 10,
    palette: {
      B: '#b45309',
      L: '#fcd34d',
      D: '#78350f',
    },
    matrix: [
      '..DDDD...',
      '.DLLLBD..',
      '.DLLLBD..',
      '..DBBD...',
      '.DLLLBD..',
      'DLLLLBBD.',
      'DLLLLBBD.',
      '.DLLLBD..',
      '..DBBD...',
      '...DD....',
    ],
  },

  // 🍪 Печенье
  '🍪': {
    width: 10,
    height: 10,
    palette: {
      B: '#d97706',
      L: '#fde68a',
      C: '#451a03',
      D: '#78350f',
    },
    matrix: [
      '...DDDD...',
      '..DLLLBBD.',
      '.DLLCLLBD.',
      '.DLCLLLBD.',
      'DLLLLCLLBD',
      'DLLLCLLBD.',
      '.DLLLLCBD.',
      '..DLLBBD..',
      '...DBBD...',
      '....DD....',
    ],
  },

  // 🍉 Арбуз
  '🍉': {
    width: 10,
    height: 9,
    palette: {
      R: '#ef4444',
      L: '#fca5a5',
      G: '#15803d',
      W: '#f0fdf4',
      C: '#1c1917',
      D: '#052e16',
    },
    matrix: [
      '.DDDDDDDD.',
      '.DLLRRLRD.',
      'DLLCRLRCRD',
      'DLLRRLLRRD',
      '.DLLRRRRD.',
      '..DWWWWDD.',
      '..DGGGGD..',
      '...DDDD...',
      '..........',
    ],
  },

  // 🍌 Банан
  '🍌': {
    width: 10,
    height: 10,
    palette: {
      Y: '#facc15',
      L: '#fef9c3',
      D: '#854d0e',
      T: '#3f2c1d',
    },
    matrix: [
      '.....TT...',
      '....TYYD..',
      '...TYLYD..',
      '..TYLYD...',
      '..TYLYD...',
      '.TYLYD....',
      'TYLYD.....',
      '.TYD......',
      '..TD......',
      '...D......',
    ],
  },

  // 💩 Какашка
  '💩': {
    width: 10,
    height: 9,
    palette: {
      B: '#78350f',
      L: '#92400e',
      W: '#ffffff',
      C: '#1c1917',
      D: '#451a03',
    },
    matrix: [
      '....DDD...',
      '..DDLLBD..',
      '.DLLLLBD..',
      '.DWCWCCBD.',
      'DLLLLLLBD.',
      'DLLLLLLBD.',
      'DLLLLLLBD.',
      '.DBBBBBD..',
      '..DDDDD...',
    ],
  },

  // ✨ Искорка
  '✨': {
    width: 9,
    height: 9,
    palette: {
      Y: '#fde047',
      W: '#ffffff',
      D: '#ca8a04',
    },
    matrix: [
      '....D....',
      '...DWD...',
      '..DYWYD..',
      '.DYYWYYD.',
      'DDWWWDDD.',
      '.DYYWYYD.',
      '..DYWYD..',
      '...DWD...',
      '....D....',
    ],
  },

  // ☀️ Солнце
  '☀️': {
    width: 10,
    height: 10,
    palette: {
      Y: '#f59e0b',
      L: '#fef08a',
      D: '#b45309',
    },
    matrix: [
      '.D..DD..D.',
      '..DDYYDD..',
      '.DYYYYYYD.',
      'DYYLLLYYD.',
      'DYYLLLYYD.',
      'DYYLLLYYD.',
      '.DYYYYYYD.',
      '..DDYYDD..',
      '.D..DD..D.',
      '..........',
    ],
  },

  // 🎡 Колесо
  '🎡': {
    width: 10,
    height: 10,
    palette: {
      C: '#38bdf8',
      W: '#ffffff',
      D: '#0284c7',
    },
    matrix: [
      '..DDDDDD..',
      '.DCCCCCCD.',
      'DCCCDDCCCD',
      'DCCDDDDCCD',
      'DCDDWWDDCD',
      'DCDDWWDDCD',
      'DCCDDDDCCD',
      'DCCCDDCCCD',
      '.DCCCCCCD.',
      '..DDDDDD..',
    ],
  },

  // ⚡ Молния
  '⚡': {
    width: 9,
    height: 10,
    palette: {
      Y: '#facc15',
      L: '#fef08a',
      D: '#a16207',
    },
    matrix: [
      '....DDD..',
      '...DLYD..',
      '..DLYD...',
      '.DLYDD...',
      'DDYYYYDD.',
      '..DDLYD..',
      '...DLYD..',
      '..DLYD...',
      '.DLYD....',
      '..DD.....',
    ],
  },

  // ⚠️ Предупреждение
  '⚠️': {
    width: 10,
    height: 9,
    palette: {
      Y: '#eab308',
      L: '#fef08a',
      B: '#18181b',
      D: '#854d0e',
    },
    matrix: [
      '....DD....',
      '...DYYD...',
      '..DYBYD..',
      '..DYBYD..',
      '.DYYBYYD.',
      '.DYYDYYD.',
      'DYYYBYYYD',
      'DDDDDDDDD',
      '..........',
    ],
  },

  // 🤤 Сытая моська / слюнки
  '🤤': {
    width: 10,
    height: 9,
    palette: {
      Y: '#fbbf24',
      L: '#fef3c7',
      B: '#38bdf8',
      D: '#92400e',
    },
    matrix: [
      '..DDDDDD..',
      '.DYYYYYYD.',
      'DYDYYYDYYD',
      'DYYYYYYYYD',
      'DYDDDDDDYD',
      'DYYYYYYBBD',
      '.DYYYYYBBD',
      '..DDDDDDB.',
      '.......DB.',
    ],
  },

  // 🍔 Бургер
  '🍔': {
    width: 10,
    height: 9,
    palette: {
      B: '#d97706',
      G: '#22c55e',
      R: '#ef4444',
      M: '#78350f',
      D: '#451a03',
    },
    matrix: [
      '..DDDDDD..',
      '.DBBBBBBD.',
      'DGGGGGGGGDD',
      'DRRRRRRRRDD',
      'DMMMMMMMMDD',
      '.DBBBBBBD.',
      '..DDDDDD..',
      '..........',
      '..........',
    ],
  },

  // 🏠 Домик
  '🏠': {
    width: 10,
    height: 10,
    palette: {
      R: '#dc2626',
      W: '#fde68a',
      B: '#78350f',
      D: '#451a03',
    },
    matrix: [
      '....DD....',
      '...DRRD...',
      '..DRRRRD..',
      '.DRRRRRRD.',
      'DDDDDDDDDD',
      '.DWWWWWD..',
      '.DWDBBWD..',
      '.DWDBBWD..',
      '.DWDBBWD..',
      '.DDDDDDD..',
    ],
  },

  // 🧼 Мыло
  '🧼': {
    width: 10,
    height: 9,
    palette: {
      B: '#38bdf8',
      L: '#bae6fd',
      W: '#ffffff',
      D: '#0284c7',
    },
    matrix: [
      '..DDD.....',
      '.DWWLD....',
      '.DLLLD....',
      'DDDDDDDDD.',
      'DLLLLLLBD.',
      'DLLLLLLBD.',
      'DLLLLLLBD.',
      '.DBBBBBD..',
      '..DDDDD...',
    ],
  },

  // 🥛 Молочко
  '🥛': {
    width: 9,
    height: 10,
    palette: {
      W: '#ffffff',
      G: '#e2e8f0',
      B: '#94a3b8',
      D: '#475569',
    },
    matrix: [
      '..DDDDD..',
      '.DWWWWWD.',
      '.DWWWWWD.',
      '.DWWWWWD.',
      '.DWWWWWD.',
      '.DWWWWWD.',
      '.DWWWWWD.',
      '..DGGGD..',
      '...DDD...',
      '.........',
    ],
  },

  // 🥦 Брокколи
  '🥦': {
    width: 9,
    height: 10,
    palette: {
      G: '#15803d',
      L: '#22c55e',
      S: '#86efac',
      D: '#14532d',
    },
    matrix: [
      '..DDDDD..',
      '.DLLLLGD.',
      'DLLSLLGGD',
      'DLLLLLGGDD',
      '.DGGGGGD.',
      '..DDDDD..',
      '...DSD...',
      '...DSD...',
      '...DSD...',
      '...DDD...',
    ],
  },

  // 🥒 Огурчик
  '🥒': {
    width: 10,
    height: 9,
    palette: {
      G: '#15803d',
      L: '#4ade80',
      D: '#14532d',
    },
    matrix: [
      '....DDDD..',
      '..DDLLGGD.',
      '.DLLLGGD..',
      'DLLLGGD...',
      'DLLLGGD...',
      '.DLLLGGD..',
      '..DDLLGGD.',
      '....DDDD..',
      '..........',
    ],
  },

  // 🫐 Черника
  '🫐': {
    width: 10,
    height: 10,
    palette: {
      B: '#3b82f6',
      L: '#93c5fd',
      D: '#1e3a8a',
    },
    matrix: [
      '...DD.DD..',
      '..DLDDLD..',
      '.DLLDDLLD.',
      'DLLBDDLLBD',
      'DLLBDDLLBD',
      '.DBDDDBBD.',
      '..DDDDDD..',
      '..........',
      '..........',
      '..........',
    ],
  },

  // 🍑 Персик
  '🍑': {
    width: 10,
    height: 10,
    palette: {
      O: '#fb923c',
      P: '#f43f5e',
      G: '#22c55e',
      D: '#9a3412',
    },
    matrix: [
      '....GDD...',
      '...GGDD...',
      '..DDDDD...',
      '.DOOOPPD..',
      'DOOOOPPDD.',
      'DOOOOPPDD.',
      '.DOOOPPD..',
      '..DOOPD...',
      '...DDD....',
      '..........',
    ],
  },

  // 🌻 Подсолнух
  '🌻': {
    width: 10,
    height: 10,
    palette: {
      Y: '#facc15',
      B: '#78350f',
      G: '#15803d',
      D: '#713f12',
    },
    matrix: [
      '..DY..YD..',
      '.DYYYYYYD.',
      'DYYDBBDYYD',
      'DYYDBBDYYD',
      '.DYYYYYYD.',
      '..DYDDYD..',
      '...DGD....',
      '..DGGD....',
      '...DD.....',
      '..........',
    ],
  },

  // 🌰 Орех / желудь
  '🌰': {
    width: 9,
    height: 10,
    palette: {
      B: '#b45309',
      L: '#fde68a',
      D: '#78350f',
      C: '#451a03',
    },
    matrix: [
      '...DCD...',
      '..DCCCD..',
      '.DCCCCCD.',
      'DDDDDDDDD',
      '.DLLLBBD.',
      '.DLLLBBD.',
      '.DLLLBBD.',
      '..DBBBD..',
      '...DDD...',
      '.........',
    ],
  },

  // 🚇 Туннельчик хомячка (акриловая труба)
  '🚇': {
    width: 10,
    height: 10,
    palette: {
      C: '#38bdf8',
      W: '#ffffff',
      R: '#f59e0b',
      D: '#0284c7',
      B: '#1e293b',
    },
    matrix: [
      '..RRRRRR..',
      '.RCCWWCCR.',
      'RCWDDDDWCR',
      'RCDDBBDDCR',
      'RCDDBBDDCR',
      'RCDDBBDDCR',
      'RCDDBBDDCR',
      'RCWDDDDWCR',
      '.RCCWWCCR.',
      '..RRRRRR..',
    ],
  },

  // 🌟 Золотая звезда уровня
  '🌟': {
    width: 10,
    height: 10,
    palette: {
      Y: '#fbbf24',
      L: '#fef08a',
      D: '#b45309',
      W: '#ffffff',
    },
    matrix: [
      '....DD....',
      '...DWLD...',
      '..DDYYDD..',
      'DDYYYYYYDD',
      '.DLYWWYLD.',
      '..DYYYYD..',
      '.DYYDDYYD.',
      '.DYD..DYD.',
      'DD......DD',
      '..........',
    ],
  },

  // ❌ Крестик отказа / Недовольство
  '❌': {
    width: 9,
    height: 9,
    palette: {
      R: '#ef4444',
      L: '#fca5a5',
      D: '#991b1b',
      W: '#ffffff',
    },
    matrix: [
      '.DD...DD.',
      'DLRD.DRLD',
      '.DLRDRLD.',
      '..DLRLD..',
      '...DRD...',
      '..DLRLD..',
      '.DLRDRLD.',
      'DLRD.DRLD',
      '.DD...DD.',
    ],
  },

  // 💢 Злость / Раздражение
  '💢': {
    width: 9,
    height: 9,
    palette: {
      R: '#ef4444',
      L: '#fca5a5',
      D: '#991b1b',
    },
    matrix: [
      '.DD...DD.',
      'DLRD.DLRD',
      'DRRDRRD..',
      '.DDRRD...',
      '..DRRDRD.',
      '..DRRDD..',
      'DLRD.DLRD',
      '.DD...DD.',
      '.........',
    ],
  },
};

/**
 * Отрисовывает пиксельный эмодзи с центром в (centerX, centerY)
 */
export function drawPixelEmoji(
  ctx: CanvasRenderingContext2D,
  emoji: string,
  centerX: number,
  centerY: number,
  scale: number = 1,
  alpha: number = 1
): boolean {
  const def = PIXEL_EMOJIS[emoji] || PIXEL_EMOJIS[emoji.slice(0, 2)] || PIXEL_EMOJIS['✨'];
  if (!def) return false;

  const totalW = def.width * scale;
  const totalH = def.height * scale;
  const startX = Math.floor(centerX - totalW / 2);
  const startY = Math.floor(centerY - totalH / 2);

  ctx.save();
  if (alpha < 1) {
    ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
  }

  for (let r = 0; r < def.height; r++) {
    const row = def.matrix[r];
    if (!row) continue;
    for (let c = 0; c < def.width; c++) {
      const char = row[c];
      if (char === '.' || !char) continue;
      const color = def.palette[char];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(
          Math.floor(startX + c * scale),
          Math.floor(startY + r * scale),
          Math.ceil(scale),
          Math.ceil(scale)
        );
      }
    }
  }

  ctx.restore();
  return true;
}
