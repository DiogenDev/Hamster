/**
 * ============================================================================
 * МОДУЛЬ: 20 ДИЗАЙНЕРСКИХ ДОМИКОВ ДЛЯ ХОМЯЧКА (House Presets & Pixel Renderer)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. 2-СЛОЙНЫЙ РЕНДЕРИНГ ДЛЯ РЕАЛЬНОГО ВХОДА В ДОМИК:
 *    - `drawHouseInterior`: рисует заднюю стенку, тень и мягкую подстилку внутри домика.
 *    - Затем рисуется хомячок (когда он спит или отдыхает внутри).
 *    - `drawHouseExterior`: рисует фасад, боковые стенки, дверной проем и крышу.
 *    Благодаря этому хомячок физически заходит ВНУТРЬ домика и сладко спит в нем!
 * 
 * 2. 20 РАЗНООБРАЗНЫХ ШИРОКИХ ПИКСЕЛЬНЫХ МОДЕЛЕЙ (76x64):
 *    Широкие комфортные домики с арочными и прямоугольными дверными проемами,
 *    включая превью-рендер для карточек выбора в Настройках.
 * ============================================================================
 */

import { HouseType } from '@/types/hamster';

export interface HousePreset {
  id: HouseType;
  name: string;
  nameEn: string;
  desc: string;
  icon: string;
}

export const HOUSE_PRESETS: HousePreset[] = [
  { id: 'log_cabin', name: 'Бревенчатый сруб', nameEn: 'Log Cabin', desc: 'Уютная теплая изба из сосновых бревен с двускатной крышей', icon: '🛖' },
  { id: 'mushroom_cottage', name: 'Грибной коттедж', nameEn: 'Mushroom Cottage', desc: 'Сказочный красный мухомор с белыми точками и деревянной дверью', icon: '🍄' },
  { id: 'coconut_hut', name: 'Кокосовая хижина', nameEn: 'Coconut Hut', desc: 'Тропическая скорлупа кокоса с соломенным козырьком', icon: '🥥' },
  { id: 'cardboard_fort', name: 'Картонный форт', nameEn: 'Cardboard Fort', desc: 'Плотная крафтовая коробочка с почтовыми штампами', icon: '📦' },
  { id: 'stone_castle', name: 'Каменный замок', nameEn: 'Stone Castle', desc: 'Средневековая крепость с зубчатыми башенками и флагом', icon: '🏰' },
  { id: 'gingerbread_house', name: 'Пряничный домик', nameEn: 'Gingerbread House', desc: 'Сладкий медовый пряник с белой глазурью и леденцами', icon: '🍪' },
  { id: 'teapot_manor', name: 'Чайный особняк', nameEn: 'Teapot Manor', desc: 'Винтажный керамический заварочный чайник с ручкой и носиком', icon: '🫖' },
  { id: 'swiss_cheese', name: 'Сырный дворец', nameEn: 'Swiss Cheese', desc: 'Огромный аппетитный кусок маасдама с круглыми дырками', icon: '🧀' },
  { id: 'acorn_villa', name: 'Желудевая вилла', nameEn: 'Acorn Villa', desc: 'Лесной дубовый желудь с фактурной шапочкой и резным входом', icon: '🌰' },
  { id: 'japanese_pagoda', name: 'Японская пагода', nameEn: 'Japanese Pagoda', desc: 'Традиционный восточный храм с загнутыми скатами крыши', icon: '⛩️' },
  { id: 'cyber_bunker', name: 'Кибер-бункер', nameEn: 'Cyber Bunker', desc: 'Неоновый титановый шлюз с бирюзовой подсветкой и датчиками', icon: '⚡' },
  { id: 'strawberry_loft', name: 'Клубничный лофт', nameEn: 'Strawberry Loft', desc: 'Сочная спелая ягодка с желтыми семечками и зелеными листьями', icon: '🍓' },
  { id: 'pumpkin_shack', name: 'Тыквенная хижина', nameEn: 'Pumpkin Shack', desc: 'Осенняя резная оранжевая тыква с уютным теплым нутром', icon: '🎃' },
  { id: 'ice_igloo', name: 'Ледяное иглу', nameEn: 'Ice Igloo', desc: 'Северное эскимосское купольное жилище из ледяных блоков', icon: '🧊' },
  { id: 'cactus_ranch', name: 'Кактусовое ранчо', nameEn: 'Cactus Ranch', desc: 'Пустынный цереус с колючками и цветущим цветком на макушке', icon: '🌵' },
  { id: 'retro_tv', name: 'Ретро-телевизор', nameEn: 'Retro TV', desc: 'Ламповый деревянный телевизор 60-х с антенной-рожками', icon: '📺' },
  { id: 'flower_pot', name: 'Цветочный горшок', nameEn: 'Flower Pot', desc: 'Опрокинутый глиняный терракотовый горшочек с ромашкой', icon: '🪴' },
  { id: 'honeycomb_hive', name: 'Медовый улей', nameEn: 'Honeycomb Hive', desc: 'Шестиугольные восковые соты, сочащиеся янтарным медком', icon: '🍯' },
  { id: 'space_capsule', name: 'Космический модуль', nameEn: 'Space Capsule', desc: 'Орбитальный лунный шаттл с тонированным иллюминатором', icon: '🚀' },
  { id: 'crystal_cave', name: 'Кристальная пещера', nameEn: 'Crystal Cave', desc: 'Грот из сверкающих фиолетовых аметистов и светящегося кварца', icon: '🔮' },
];

/**
 * Нормализация идентификатора домика для обратной совместимости
 */
export function normalizeHouseId(id: HouseType): HouseType {
  if (id === 'mushroom') return 'mushroom_cottage';
  if (id === 'coconut') return 'coconut_hut';
  if (id === 'box') return 'cardboard_fort';
  return id;
}

/**
 * Вспомогательная функция рисования пиксельного прямоугольника
 */
function pRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

/**
 * 1. ИНТЕРЬЕР ДОМИКА (рисуется ДО отрисовки хомячка)
 * Создает темную уютную глубину внутри дверного проема и мягкие опилки.
 */
export function drawHouseInterior(
  ctx: CanvasRenderingContext2D,
  rawType: HouseType,
  x: number,
  y: number
) {
  const type = normalizeHouseId(rawType);
  const dw = 26; // Ширина двери
  const dh = 30; // Высота двери
  const dx = x + 25; // X двери
  const dy = y + 32; // Y двери

  // Задняя стенка и темная глубина комнаты
  pRect(ctx, dx, dy, dw, dh, '#1a0d06');

  // Мягкая подушка из теплых опилок внутри домика
  pRect(ctx, dx, dy + dh - 8, dw, 8, '#e0a948');
  pRect(ctx, dx + 2, dy + dh - 10, dw - 4, 3, '#fbe09e');
  pRect(ctx, dx + 4, dy + dh - 6, 6, 2, '#fff4cf');
  pRect(ctx, dx + 14, dy + dh - 5, 8, 2, '#df9b2d');

  // Тематический задний фон внутри комнаты
  if (type === 'cyber_bunker') {
    pRect(ctx, dx + 4, dy + 6, dw - 8, 2, '#00f5d4');
    pRect(ctx, dx + 4, dy + 14, dw - 8, 2, '#ff007f');
  } else if (type === 'space_capsule') {
    pRect(ctx, dx + 6, dy + 4, dw - 12, 12, '#1b2a4a');
    pRect(ctx, dx + 10, dy + 8, 3, 3, '#00f5d4');
  } else if (type === 'crystal_cave') {
    pRect(ctx, dx + 2, dy + 4, 4, 12, '#8338ec');
    pRect(ctx, dx + dw - 6, dy + 6, 4, 10, '#3a86ff');
  }
}

/**
 * 2. ФАСАД И КРЫША ДОМИКА (рисуется ПОСЛЕ отрисовки хомячка)
 * Оставляет дверной проем прозрачным, чтобы хомяк был виден внутри!
 */
export function drawHouseExterior(
  ctx: CanvasRenderingContext2D,
  rawType: HouseType,
  x: number,
  y: number
) {
  const type = normalizeHouseId(rawType);

  // Координаты дверного проема (dx, dy, dw, dh)
  const dx = x + 25;
  const dy = y + 32;
  const dw = 26;
  const dh = 30;

  switch (type) {
    case 'log_cabin': {
      // 1. Бревенчатый сруб (76x64)
      // Левая и правая стены
      pRect(ctx, x, y + 20, 25, 42, '#7a3e1d');
      pRect(ctx, x + 51, y + 20, 25, 42, '#7a3e1d');
      // Верхняя балка над дверью
      pRect(ctx, dx, y + 20, dw, 12, '#7a3e1d');
      // Горизонтальные борозды бревен
      for (let by = y + 26; by < y + 62; by += 8) {
        pRect(ctx, x, by, 25, 2, '#522710');
        pRect(ctx, x + 51, by, 25, 2, '#522710');
      }
      pRect(ctx, dx, y + 26, dw, 2, '#522710');
      // Арочный наличник двери
      pRect(ctx, dx - 2, dy - 2, 2, dh + 2, '#421e09');
      pRect(ctx, dx + dw, dy - 2, 2, dh + 2, '#421e09');
      pRect(ctx, dx - 2, dy - 2, dw + 4, 3, '#421e09');

      // Двускатная деревянная крыша
      pRect(ctx, x - 4, y + 14, 84, 8, '#9c522b');
      pRect(ctx, x + 4, y + 8, 68, 7, '#b86638');
      pRect(ctx, x + 14, y + 3, 48, 6, '#d47b47');
      pRect(ctx, x + 26, y, 24, 4, '#e08b58');
      // Дымоход
      pRect(ctx, x + 54, y - 6, 10, 14, '#b04a2d');
      pRect(ctx, x + 52, y - 8, 14, 3, '#6e2b17');
      // Окошко на чердаке
      pRect(ctx, x + 34, y + 6, 8, 8, '#fed766');
      pRect(ctx, x + 37, y + 6, 2, 8, '#522710');
      break;
    }

    case 'mushroom_cottage': {
      // 2. Грибной коттедж
      // Ножка гриба
      pRect(ctx, x + 6, y + 24, 19, 38, '#ede0d4');
      pRect(ctx, x + 51, y + 24, 19, 38, '#ede0d4');
      pRect(ctx, dx, y + 24, dw, 8, '#ede0d4');
      pRect(ctx, dx - 2, dy, 2, dh, '#b08968');
      pRect(ctx, dx + dw, dy, 2, dh, '#b08968');
      pRect(ctx, dx - 2, dy - 2, dw + 4, 3, '#b08968');

      // Круглое окошко на ножке
      pRect(ctx, x + 11, y + 32, 8, 8, '#70d6ff');
      pRect(ctx, x + 14, y + 32, 2, 8, '#b08968');

      // Красная шляпка мухомора
      pRect(ctx, x - 4, y + 16, 84, 12, '#d90429');
      pRect(ctx, x + 2, y + 8, 72, 9, '#ef233c');
      pRect(ctx, x + 10, y + 2, 56, 7, '#d90429');
      pRect(ctx, x + 20, y - 2, 36, 5, '#ef233c');

      // Белые горошины
      pRect(ctx, x + 6, y + 18, 7, 6, '#ffffff');
      pRect(ctx, x + 24, y + 6, 8, 7, '#ffffff');
      pRect(ctx, x + 46, y + 4, 9, 6, '#ffffff');
      pRect(ctx, x + 63, y + 16, 7, 6, '#ffffff');
      pRect(ctx, x + 35, y + 14, 6, 5, '#ffffff');
      break;
    }

    case 'coconut_hut': {
      // 3. Кокосовая хижина
      pRect(ctx, x + 4, y + 16, 21, 46, '#5e3023');
      pRect(ctx, x + 51, y + 16, 21, 46, '#5e3023');
      pRect(ctx, dx, y + 16, dw, 16, '#5e3023');
      // Текстура волокон
      pRect(ctx, x + 8, y + 24, 2, 8, '#895737');
      pRect(ctx, x + 60, y + 28, 2, 10, '#895737');

      // Соломенный навес
      pRect(ctx, x - 2, y + 10, 80, 8, '#c68b59');
      pRect(ctx, x + 6, y + 4, 64, 7, '#df9b56');
      pRect(ctx, x + 18, y, 40, 5, '#eec170');
      // Веревочная обвязка входа
      pRect(ctx, dx - 2, dy, 2, dh, '#c68b59');
      pRect(ctx, dx + dw, dy, 2, dh, '#c68b59');
      break;
    }

    case 'cardboard_fort': {
      // 4. Картонный форт
      pRect(ctx, x, y + 16, 25, 46, '#ddb892');
      pRect(ctx, x + 51, y + 16, 25, 46, '#ddb892');
      pRect(ctx, dx, y + 16, dw, 16, '#ddb892');
      // Скотч на стыках
      pRect(ctx, x + 8, y + 12, 60, 4, 'rgba(255,255,255,0.4)');
      // Штамп FRAGILE
      pRect(ctx, x + 4, y + 28, 16, 6, '#b02a37');
      pRect(ctx, x + 6, y + 30, 12, 2, '#ffffff');
      // Верхние клапаны коробки
      pRect(ctx, x - 2, y + 10, 36, 7, '#b08968');
      pRect(ctx, x + 42, y + 10, 36, 7, '#b08968');
      break;
    }

    case 'stone_castle': {
      // 5. Каменный замок
      pRect(ctx, x + 2, y + 14, 23, 48, '#6c757d');
      pRect(ctx, x + 51, y + 14, 23, 48, '#6c757d');
      pRect(ctx, dx, y + 14, dw, 18, '#6c757d');
      // Зубцы башен слева и справа
      pRect(ctx, x, y + 4, 8, 10, '#495057');
      pRect(ctx, x + 14, y + 4, 8, 10, '#495057');
      pRect(ctx, x + 54, y + 4, 8, 10, '#495057');
      pRect(ctx, x + 68, y + 4, 8, 10, '#495057');
      // Каменные блоки
      pRect(ctx, x + 6, y + 26, 8, 4, '#adb5bd');
      pRect(ctx, x + 58, y + 30, 8, 4, '#adb5bd');
      // Красный флажок на шпиле
      pRect(ctx, x + 36, y - 6, 2, 14, '#212529');
      pRect(ctx, x + 38, y - 6, 8, 5, '#e63946');
      break;
    }

    case 'gingerbread_house': {
      // 6. Пряничный домик
      pRect(ctx, x, y + 18, 25, 44, '#b06d3b');
      pRect(ctx, x + 51, y + 18, 25, 44, '#b06d3b');
      pRect(ctx, dx, y + 18, dw, 14, '#b06d3b');
      // Белая сахарная глазурь на стенах
      pRect(ctx, x - 2, y + 12, 80, 8, '#ffffff');
      pRect(ctx, x + 8, y + 6, 60, 7, '#ffffff');
      pRect(ctx, x + 20, y + 1, 36, 6, '#ffffff');
      // Леденцовые цветные пуговки
      pRect(ctx, x + 8, y + 24, 4, 4, '#ff0054');
      pRect(ctx, x + 62, y + 24, 4, 4, '#390099');
      pRect(ctx, x + 36, y + 6, 4, 4, '#ffbd00');
      // Карамельные трости по бокам двери
      pRect(ctx, dx - 3, dy, 3, dh, '#ff0054');
      pRect(ctx, dx + dw, dy, 3, dh, '#ff0054');
      break;
    }

    case 'teapot_manor': {
      // 7. Чайный особняк
      pRect(ctx, x + 6, y + 14, 19, 48, '#e9ecef');
      pRect(ctx, x + 51, y + 14, 19, 48, '#e9ecef');
      pRect(ctx, dx, y + 14, dw, 18, '#e9ecef');
      // Носик чайника слева
      pRect(ctx, x - 6, y + 20, 8, 8, '#ced4da');
      pRect(ctx, x - 10, y + 14, 6, 8, '#adb5bd');
      // Ручка чайника справа
      pRect(ctx, x + 72, y + 16, 6, 26, '#ced4da');
      // Золотая крышечка сверху
      pRect(ctx, x + 20, y + 6, 36, 9, '#ffd166');
      pRect(ctx, x + 34, y + 1, 8, 6, '#f77f00');
      break;
    }

    case 'swiss_cheese': {
      // 8. Сырный дворец
      pRect(ctx, x, y + 14, 25, 48, '#ffb703');
      pRect(ctx, x + 51, y + 14, 25, 48, '#ffb703');
      pRect(ctx, dx, y + 14, dw, 18, '#ffb703');
      // Скошенная сырная верхушка
      pRect(ctx, x, y + 4, 50, 10, '#fb8500');
      pRect(ctx, x, y - 2, 28, 6, '#fb8500');
      // Круглые сырные дырки
      pRect(ctx, x + 6, y + 26, 8, 8, '#d48b00');
      pRect(ctx, x + 58, y + 22, 10, 10, '#d48b00');
      pRect(ctx, x + 34, y + 18, 7, 7, '#d48b00');
      break;
    }

    case 'acorn_villa': {
      // 9. Желудевая вилла
      pRect(ctx, x + 4, y + 18, 21, 44, '#9c6644');
      pRect(ctx, x + 51, y + 18, 21, 44, '#9c6644');
      pRect(ctx, dx, y + 18, dw, 14, '#9c6644');
      // Шапочка желудя в крапинку
      pRect(ctx, x - 2, y + 10, 80, 10, '#582f0e');
      pRect(ctx, x + 6, y + 3, 64, 8, '#7f4f24');
      pRect(ctx, x + 20, y - 2, 36, 6, '#7f4f24');
      // Хвостик-черенок сверху
      pRect(ctx, x + 36, y - 8, 4, 8, '#3d1308');
      break;
    }

    case 'japanese_pagoda': {
      // 10. Японская пагода
      pRect(ctx, x + 6, y + 22, 19, 40, '#c1121f');
      pRect(ctx, x + 51, y + 22, 19, 40, '#c1121f');
      pRect(ctx, dx, y + 22, dw, 10, '#c1121f');
      // Черные карнизы с загнутыми вверх краями
      pRect(ctx, x - 6, y + 16, 88, 6, '#1b1b1e');
      pRect(ctx, x - 8, y + 14, 4, 4, '#ffd166');
      pRect(ctx, x + 80, y + 14, 4, 4, '#ffd166');
      // Второй ярус крыши
      pRect(ctx, x + 6, y + 6, 64, 6, '#1b1b1e');
      pRect(ctx, x + 4, y + 4, 4, 4, '#ffd166');
      pRect(ctx, x + 68, y + 4, 4, 4, '#ffd166');
      // Золотой шпиль
      pRect(ctx, x + 36, y - 4, 4, 10, '#ffd166');
      break;
    }

    case 'cyber_bunker': {
      // 11. Кибер-бункер
      pRect(ctx, x, y + 14, 25, 48, '#1b1433');
      pRect(ctx, x + 51, y + 14, 25, 48, '#1b1433');
      pRect(ctx, dx, y + 14, dw, 18, '#1b1433');
      // Неоновые бирюзовые и розовые полосы
      pRect(ctx, x, y + 20, 76, 2, '#00f5d4');
      pRect(ctx, x, y + 28, 25, 2, '#ff007f');
      pRect(ctx, x + 51, y + 28, 25, 2, '#ff007f');
      // Шлюзовой козырек
      pRect(ctx, x - 2, y + 10, 80, 5, '#00f5d4');
      pRect(ctx, x + 10, y + 5, 56, 5, '#ff007f');
      break;
    }

    case 'strawberry_loft': {
      // 12. Клубничный лофт
      pRect(ctx, x + 2, y + 16, 23, 46, '#d90429');
      pRect(ctx, x + 51, y + 16, 23, 46, '#d90429');
      pRect(ctx, dx, y + 16, dw, 16, '#d90429');
      // Зеленые чашелистики на макушке
      pRect(ctx, x + 6, y + 8, 64, 8, '#38b000');
      pRect(ctx, x + 16, y + 2, 44, 7, '#007200');
      pRect(ctx, x + 35, y - 4, 6, 7, '#004b23');
      // Желтые клубничные семечки
      pRect(ctx, x + 8, y + 26, 2, 2, '#ffea00');
      pRect(ctx, x + 16, y + 40, 2, 2, '#ffea00');
      pRect(ctx, x + 60, y + 28, 2, 2, '#ffea00');
      pRect(ctx, x + 66, y + 42, 2, 2, '#ffea00');
      break;
    }

    case 'pumpkin_shack': {
      // 13. Тыквенная хижина
      pRect(ctx, x + 2, y + 14, 23, 48, '#e85d04');
      pRect(ctx, x + 51, y + 14, 23, 48, '#e85d04');
      pRect(ctx, dx, y + 14, dw, 18, '#e85d04');
      // Вертикальные сегменты тыквы
      pRect(ctx, x + 10, y + 14, 2, 48, '#dc2f02');
      pRect(ctx, x + 64, y + 14, 2, 48, '#dc2f02');
      // Округлая верхушка
      pRect(ctx, x + 10, y + 6, 56, 9, '#f48c06');
      pRect(ctx, x + 24, y + 1, 28, 6, '#faa307');
      // Зеленый черенок
      pRect(ctx, x + 36, y - 6, 5, 8, '#2d6a4f');
      break;
    }

    case 'ice_igloo': {
      // 14. Ледяное иглу
      pRect(ctx, x + 2, y + 16, 23, 46, '#caf0f8');
      pRect(ctx, x + 51, y + 16, 23, 46, '#caf0f8');
      pRect(ctx, dx, y + 16, dw, 16, '#caf0f8');
      // Ледяные кирпичные швы
      for (let iy = y + 24; iy < y + 62; iy += 9) {
        pRect(ctx, x + 2, iy, 23, 2, '#90e0ef');
        pRect(ctx, x + 51, iy, 23, 2, '#90e0ef');
      }
      // Купол
      pRect(ctx, x + 8, y + 8, 60, 9, '#ade8f4');
      pRect(ctx, x + 20, y + 2, 36, 7, '#e0fbfc');
      break;
    }

    case 'cactus_ranch': {
      // 15. Кактусовое ранчо
      pRect(ctx, x + 8, y + 12, 17, 50, '#2d6a4f');
      pRect(ctx, x + 51, y + 12, 17, 50, '#2d6a4f');
      pRect(ctx, dx, y + 12, dw, 20, '#2d6a4f');
      // Боковые отростки
      pRect(ctx, x - 2, y + 22, 10, 16, '#40916c');
      pRect(ctx, x + 68, y + 18, 10, 16, '#40916c');
      // Розовый цветок на макушке
      pRect(ctx, x + 32, y + 4, 12, 8, '#ff4d6d');
      pRect(ctx, x + 36, y, 4, 5, '#ff758f');
      break;
    }

    case 'retro_tv': {
      // 16. Ретро-телевизор
      pRect(ctx, x, y + 12, 25, 50, '#7f4f24');
      pRect(ctx, x + 51, y + 12, 25, 50, '#7f4f24');
      pRect(ctx, dx, y + 12, dw, 20, '#7f4f24');
      // Верхняя панель
      pRect(ctx, x - 2, y + 8, 80, 5, '#582f0e');
      // Антенна V-образная
      pRect(ctx, x + 32, y - 6, 2, 14, '#ced4da');
      pRect(ctx, x + 42, y - 6, 2, 14, '#ced4da');
      // Переключатели справа
      pRect(ctx, x + 58, y + 20, 6, 6, '#ffd166');
      pRect(ctx, x + 58, y + 32, 6, 6, '#ffd166');
      break;
    }

    case 'flower_pot': {
      // 17. Цветочный горшок
      pRect(ctx, x + 4, y + 14, 21, 48, '#e07a5f');
      pRect(ctx, x + 51, y + 14, 21, 48, '#e07a5f');
      pRect(ctx, dx, y + 14, dw, 18, '#e07a5f');
      // Ободок горшка сверху
      pRect(ctx, x, y + 8, 76, 7, '#cc5a3d');
      // Белая ромашка с желтой сердцевиной на верхушке
      pRect(ctx, x + 34, y - 4, 8, 8, '#ffffff');
      pRect(ctx, x + 36, y - 2, 4, 4, '#f4a261');
      break;
    }

    case 'honeycomb_hive': {
      // 18. Медовый улей
      pRect(ctx, x, y + 14, 25, 48, '#f77f00');
      pRect(ctx, x + 51, y + 14, 25, 48, '#f77f00');
      pRect(ctx, dx, y + 14, dw, 18, '#f77f00');
      // Шестиугольные соты
      for (let cy = y + 20; cy < y + 60; cy += 12) {
        pRect(ctx, x + 6, cy, 10, 8, '#fcbf49');
        pRect(ctx, x + 60, cy, 10, 8, '#fcbf49');
      }
      // Капли стекающего меда
      pRect(ctx, x + 16, y + 10, 6, 12, '#eae2b7');
      pRect(ctx, x + 54, y + 8, 6, 14, '#eae2b7');
      break;
    }

    case 'space_capsule': {
      // 19. Космический модуль
      pRect(ctx, x, y + 14, 25, 48, '#e9ecef');
      pRect(ctx, x + 51, y + 14, 25, 48, '#e9ecef');
      pRect(ctx, dx, y + 14, dw, 18, '#e9ecef');
      // Обтекаемый носовой обтекатель
      pRect(ctx, x + 6, y + 6, 64, 9, '#ced4da');
      pRect(ctx, x + 18, y, 40, 7, '#0077b6');
      // Иллюминатор сверху
      pRect(ctx, x + 32, y + 18, 12, 10, '#00b4d8');
      pRect(ctx, x + 34, y + 20, 8, 6, '#90e0ef');
      break;
    }

    case 'crystal_cave': {
      // 20. Кристальная пещера
      pRect(ctx, x, y + 14, 25, 48, '#3c096c');
      pRect(ctx, x + 51, y + 14, 25, 48, '#3c096c');
      pRect(ctx, dx, y + 14, dw, 18, '#3c096c');
      // Фиолетовые и неоновые кристаллы на своде
      pRect(ctx, x - 2, y + 8, 80, 7, '#5a189a');
      pRect(ctx, x + 8, y + 2, 12, 8, '#7b2cbf');
      pRect(ctx, x + 32, y - 4, 14, 14, '#9d4edd');
      pRect(ctx, x + 58, y + 2, 12, 8, '#c77dff');
      // Искорки
      pRect(ctx, x + 12, y + 24, 3, 3, '#e0aaff');
      pRect(ctx, x + 62, y + 28, 3, 3, '#e0aaff');
      break;
    }

    default:
      // Фолбэк на Бревенчатый сруб
      pRect(ctx, x, y + 20, 76, 42, '#7a3e1d');
      break;
  }
}

/**
 * 3. СПРАЙТ ПРЕДПРОСМОТРА ДОМИКА (для карточки выбора в Настройках)
 * Рендерит миниатюру домика размером 76x64 в переданный canvas.
 */
export function drawHousePreview(
  canvas: HTMLCanvasElement,
  houseType: HouseType
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const ox = 6;
  const oy = 10;

  // Отрисовка интерьера
  drawHouseInterior(ctx, houseType, ox, oy);

  // Миниатюрный хомячок, спящий внутри (для наглядности превью!)
  pRect(ctx, ox + 27, oy + 44, 22, 12, '#f4a261');
  pRect(ctx, ox + 32, oy + 48, 14, 8, '#ffffff');
  pRect(ctx, ox + 42, oy + 47, 2, 1, '#181425'); // закрытый сонный глазик

  // Отрисовка экстерьера
  drawHouseExterior(ctx, houseType, ox, oy);
}
