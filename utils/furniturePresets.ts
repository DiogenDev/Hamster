/**
 * ============================================================================
 * МОДУЛЬ: 20 ДИЗАЙНЕРСКИХ КОРМУШЕК И 20 ПОИЛОК (Furniture Presets & Pixel Art)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. МОДУЛЬНОСТЬ И ПОВТОРНОЕ ИСПОЛЬЗОВАНИЕ:
 *    Все 20 мисок и 20 поилок имеют единый интерфейс пресетов:
 *    - `BOWL_PRESETS` & `BOTTLE_PRESETS`: метаданные (название, иконка, описание).
 *    - `drawBowlDetailed`: панорамная отрисовка в клетке с динамическим уровнем корма.
 *    - `drawWaterBottleDetailed`: анимация капель, пузырьков и потоков на Canvas 2D.
 *    - `drawBowlPreview` & `drawBottlePreview`: быстрый рендеринг для превью-карточек
 *      в окне Настроек клетки.
 * ============================================================================
 */

import { BowlType, WaterBottleType } from '@/types/hamster';

export interface FurniturePreset<T extends string> {
  id: T;
  name: string;
  nameEn: string;
  desc: string;
  icon: string;
}

// ---------------------------------------------------------------------------
// 1. СПИСОК 20 ДИЗАЙНЕРСКИХ МИСОК
// ---------------------------------------------------------------------------
export const BOWL_PRESETS: FurniturePreset<BowlType>[] = [
  { id: 'clay', name: 'Глиняная плошка', nameEn: 'Clay Bowl', desc: 'Теплая обожженная терракота с традиционным рельефным ободком', icon: '🥣' },
  { id: 'wood', name: 'Деревянное корытце', nameEn: 'Wooden Trough', desc: 'Натуральный дубовый спил с фактурой древесной коры', icon: '🪵' },
  { id: 'neon', name: 'Неоновая миска', nameEn: 'Cyber Neon Bowl', desc: 'Киберпанк-блюдце с бирюзовым свечением и розовой неоновой каймой', icon: '✨' },
  { id: 'royal', name: 'Царский кубок', nameEn: 'Royal Golden Bowl', desc: 'Чистое червонное золото с инкрустированным рубиновым камнем', icon: '👑' },
  { id: 'coconut_shell', name: 'Скорлупа кокоса', nameEn: 'Coconut Shell', desc: 'Половинка тропического кокоса с белой мякотью внутри', icon: '🥥' },
  { id: 'watermelon', name: 'Арбузная корка', nameEn: 'Watermelon Rind', desc: 'Летняя полосатая корка со спелой алой мякотью', icon: '🍉' },
  { id: 'leaf_plate', name: 'Листочек лотоса', nameEn: 'Lotus Leaf', desc: 'Сочный изумрудный лист с утренней хрустальной росинкой', icon: '🍃' },
  { id: 'space_tray', name: 'Космический лоток', nameEn: 'Space Tray', desc: 'Титановый герметичный поднос с синими светодиодами', icon: '🛸' },
  { id: 'heart_ceramic', name: 'Сердечко-блюдце', nameEn: 'Heart Ceramic', desc: 'Милая розовая керамика в форме сердечка с белой глазурью', icon: '💖' },
  { id: 'golden_acorn', name: 'Желудевая чаша', nameEn: 'Acorn Cap Cup', desc: 'Лесная дубовая чаша с полированной золотистой сердцевиной', icon: '🌰' },
  { id: 'cat_dish', name: 'Кошачья мисочка', nameEn: 'Cat Dish', desc: 'Белоснежная фарфоровая плошка с забавными ушками', icon: '🐱' },
  { id: 'crystal_geode', name: 'Кристальная жеода', nameEn: 'Crystal Geode', desc: 'Расколотый фиолетовый аметист с мерцающими кристаллами', icon: '🔮' },
  { id: 'vintage_tea_saucer', name: 'Гжельское блюдце', nameEn: 'Vintage Saucer', desc: 'Белый фарфор с кобальтовой синей росписью ручной работы', icon: '☕' },
  { id: 'bamboo_trough', name: 'Бамбуковый желоб', nameEn: 'Bamboo Trough', desc: 'Срезанный стебель молодого бамбука с зелеными волокнами', icon: '🎋' },
  { id: 'cookie_bowl', name: 'Пряничная тарелка', nameEn: 'Cookie Plate', desc: 'Сладкий медовый корж с сахарной белой глазурью', icon: '🍪' },
  { id: 'pumpkin_bowl', name: 'Тыквенная лодочка', nameEn: 'Pumpkin Bowl', desc: 'Осенняя оранжевая тыковка с резным узорчатым краем', icon: '🎃' },
  { id: 'lava_stone', name: 'Базальтовая чаша', nameEn: 'Lava Stone', desc: 'Черный вулканический обсидиан с раскаленными магмовыми жилами', icon: '🌋' },
  { id: 'ice_chalice', name: 'Ледяная чаша', nameEn: 'Ice Chalice', desc: 'Прозрачный кусок северного льда с морозными узорами', icon: '🧊' },
  { id: 'magic_cauldron', name: 'Ведьмин котелок', nameEn: 'Magic Cauldron', desc: 'Черный чугунный котелок с искрами волшебного варева', icon: '🧪' },
  { id: 'cheese_plate', name: 'Сырная тарелка', nameEn: 'Cheese Wheel', desc: 'Аппетитный кругляш сыра с круглыми дырочками для зерен', icon: '🧀' },
];

// ---------------------------------------------------------------------------
// 2. СПИСОК 20 ДИЗАЙНЕРСКИХ ПОИЛОК
// ---------------------------------------------------------------------------
export const BOTTLE_PRESETS: FurniturePreset<WaterBottleType>[] = [
  { id: 'ball', name: 'Шариковая поилка', nameEn: 'Classic Ball Tube', desc: 'Надежная прозрачная поилка со стальным клапаном и пузырьками', icon: '💧' },
  { id: 'flask', name: 'Стеклянная колба', nameEn: 'Alchemist Flask', desc: 'Химическая мензурка с мерной шкалой и пробковой затычкой', icon: '🧪' },
  { id: 'fountain', name: 'Авто-фонтанчик', nameEn: 'Electric Fountain', desc: 'Электрический каскадный поильник с бегущими струйками воды', icon: '⛲' },
  { id: 'bamboo_drip', name: 'Бамбуковый стебель', nameEn: 'Bamboo Dripper', desc: 'Традиционный японский бамбуковый желоб с мягкой капелью', icon: '🎋' },
  { id: 'cyber_tube', name: 'Кибер-капсула', nameEn: 'Cyber Tube', desc: 'Сверхтехнологичный неоновый крио-тубус с фиолетовым шлюзом', icon: '⚡' },
  { id: 'honey_drop', name: 'Медовая капля', nameEn: 'Honey Nectar', desc: 'Янтарный сосуд в виде капли с золотистым сладким нектаром', icon: '🍯' },
  { id: 'potion_bottle', name: 'Фляга здоровья', nameEn: 'Health Potion', desc: 'Круглая стеклянная фляжка с алым бодрящим эликсиром', icon: '❤️' },
  { id: 'dew_leaf', name: 'Стебель с росой', nameEn: 'Dew Drop Leaf', desc: 'Гибкая лесная лоза с гигантской висящей каплей чистой росы', icon: '🍃' },
  { id: 'cloud_rain', name: 'Мини-облачко', nameEn: 'Rain Cloud', desc: 'Пушистая грозовая тучка, из которой моросит ласковый дождик', icon: '☁️' },
  { id: 'space_hydration', name: 'Орбитальный гидратор', nameEn: 'Space Hydrator', desc: 'Лунный металлический термос космонавта с датчиком давления', icon: '🚀' },
  { id: 'crystal_stalactite', name: 'Кристальный сталактит', nameEn: 'Crystal Stalactite', desc: 'Светящийся синий минерал, сочащийся горной ледниковой водой', icon: '🔮' },
  { id: 'vintage_teapot', name: 'Медный чайничек', nameEn: 'Copper Teapot', desc: 'Винтажный чайничек с тонким носиком на декоративной цепочке', icon: '🫖' },
  { id: 'baby_bottle', name: 'Детская бутылочка', nameEn: 'Baby Bottle', desc: 'Миниатюрная бутылочка с розовой крышечкой и мягкой соской', icon: '🍼' },
  { id: 'soda_dispenser', name: 'Ретро-сифон', nameEn: 'Soda Siphon', desc: 'Хромированный баллон для газировки с рычагом подачи воды', icon: '🥤' },
  { id: 'rainbow_flask', name: 'Радужная мензурка', nameEn: 'Rainbow Flask', desc: 'Многослойный волшебный сосуд со всеми цветами спектра', icon: '🌈' },
  { id: 'acorn_canteen', name: 'Желудевая фляжка', nameEn: 'Acorn Canteen', desc: 'Выдолбленный желудь на кожаном ремешке с медной трубочкой', icon: '🌰' },
  { id: 'plasma_cooler', name: 'Плазменный кулер', nameEn: 'Plasma Cooler', desc: 'Светящийся ультрамариновый реактор с криогенным паром', icon: '❄️' },
  { id: 'magic_chalice', name: 'Парящая чаша', nameEn: 'Levitating Chalice', desc: 'Мистический кубок, парящий в воздухе с бесконечным родником', icon: '✨' },
  { id: 'spring_well', name: 'Колодезное ведерко', nameEn: 'Well Bucket', desc: 'Деревянное ведерко со студеной колодезной водой на веревке', icon: '🪣' },
  { id: 'zen_bamboo_stream', name: 'Сиси-одоси', nameEn: 'Shishi-odoshi', desc: 'Качающийся японский бамбуковый противовес с чистой струей', icon: '🎋' },
];

/** Вспомогательная функция отрисовки пиксельного прямоугольника */
function px(
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

// ---------------------------------------------------------------------------
// 3. ДЕТАЛЬНАЯ ОТРИСОВКА КОРМУШКИ (В КЛЕТКЕ)
// ---------------------------------------------------------------------------
export function drawBowlDetailed(
  ctx: CanvasRenderingContext2D,
  type: BowlType,
  foodLevel: number,
  x: number,
  y: number
) {
  // Базовая отрисовка в зависимости от модели
  switch (type) {
    case 'clay':
      px(ctx, x, y + 4, 38, 14, '#c86d51');
      px(ctx, x + 3, y + 18, 32, 3, '#813405');
      px(ctx, x - 2, y, 42, 5, '#e07a5f');
      px(ctx, x + 4, y + 8, 30, 2, '#813405');
      break;

    case 'wood':
      px(ctx, x, y + 4, 38, 14, '#8b5a2b');
      px(ctx, x + 3, y + 18, 32, 3, '#4a2c11');
      px(ctx, x - 2, y, 42, 5, '#603813');
      px(ctx, x + 6, y + 8, 8, 3, '#4a2c11');
      px(ctx, x + 22, y + 10, 10, 3, '#4a2c11');
      break;

    case 'neon':
      px(ctx, x, y + 4, 38, 14, '#00f5d4');
      px(ctx, x + 3, y + 18, 32, 3, '#0077b6');
      px(ctx, x - 2, y, 42, 5, '#ff007f');
      px(ctx, x + 4, y + 10, 30, 2, '#fee440');
      break;

    case 'royal':
      px(ctx, x, y + 4, 38, 14, '#ffd700');
      px(ctx, x + 3, y + 18, 32, 3, '#b8860b');
      px(ctx, x - 2, y, 42, 5, '#ffee58');
      // Рубин по центру
      px(ctx, x + 16, y + 7, 6, 6, '#d90429');
      px(ctx, x + 18, y + 8, 2, 2, '#ffffff');
      break;

    case 'coconut_shell':
      px(ctx, x, y + 4, 38, 14, '#5e3023');
      px(ctx, x + 3, y + 18, 32, 3, '#381d14');
      px(ctx, x - 2, y, 42, 5, '#895737');
      // Белая кайма кокосовой мякоти
      px(ctx, x + 2, y + 2, 34, 3, '#f7ede2');
      break;

    case 'watermelon':
      // Зеленая корка
      px(ctx, x, y + 4, 38, 14, '#2d6a4f');
      px(ctx, x + 3, y + 18, 32, 3, '#1b4332');
      px(ctx, x - 2, y, 42, 5, '#52b788');
      // Белая и красная мякоть
      px(ctx, x + 2, y + 2, 34, 2, '#d8f3dc');
      px(ctx, x + 4, y + 4, 30, 4, '#e63946');
      // Арбузные семечки
      px(ctx, x + 8, y + 8, 2, 3, '#181425');
      px(ctx, x + 26, y + 8, 2, 3, '#181425');
      break;

    case 'leaf_plate':
      px(ctx, x - 4, y + 6, 44, 12, '#38b000');
      px(ctx, x, y + 16, 36, 3, '#007200');
      px(ctx, x - 6, y + 2, 48, 5, '#70e000');
      // Прожилки листа
      px(ctx, x + 2, y + 6, 32, 2, '#007200');
      px(ctx, x + 14, y + 8, 2, 6, '#007200');
      px(ctx, x + 24, y + 8, 2, 6, '#007200');
      // Капля росы
      px(ctx, x + 34, y + 4, 3, 3, '#caf0f8');
      break;

    case 'space_tray':
      px(ctx, x, y + 6, 38, 12, '#8d99ae');
      px(ctx, x + 3, y + 18, 32, 3, '#2b2d42');
      px(ctx, x - 2, y + 2, 42, 5, '#edf2f4');
      // Синий диод состояния
      px(ctx, x + 4, y + 8, 4, 4, '#00b4d8');
      px(ctx, x + 30, y + 8, 4, 4, '#00b4d8');
      break;

    case 'heart_ceramic':
      px(ctx, x, y + 4, 38, 14, '#ff758f');
      px(ctx, x + 3, y + 18, 32, 3, '#c9184a');
      px(ctx, x - 2, y, 42, 5, '#ff4d6d');
      // Сердечко по центру
      px(ctx, x + 16, y + 7, 6, 5, '#fff0f3');
      px(ctx, x + 18, y + 6, 2, 2, '#ff4d6d');
      break;

    case 'golden_acorn':
      px(ctx, x, y + 4, 38, 14, '#b08968');
      px(ctx, x + 3, y + 18, 32, 3, '#582f0e');
      px(ctx, x - 2, y, 42, 5, '#e0a948');
      // Чешуйки шляпки
      for (let cx = x + 4; cx < x + 34; cx += 6) {
        px(ctx, cx, y + 8, 3, 2, '#7f5539');
        px(ctx, cx + 3, y + 12, 3, 2, '#7f5539');
      }
      break;

    case 'cat_dish':
      px(ctx, x, y + 4, 38, 14, '#edf2f4');
      px(ctx, x + 3, y + 18, 32, 3, '#8d99ae');
      px(ctx, x - 2, y, 42, 5, '#ffffff');
      // Кошачьи ушки по бокам
      px(ctx, x - 2, y - 4, 6, 5, '#ffffff');
      px(ctx, x, y - 2, 3, 3, '#ff85a1');
      px(ctx, x + 34, y - 4, 6, 5, '#ffffff');
      px(ctx, x + 35, y - 2, 3, 3, '#ff85a1');
      break;

    case 'crystal_geode':
      px(ctx, x, y + 4, 38, 14, '#7209b7');
      px(ctx, x + 3, y + 18, 32, 3, '#3a0ca3');
      px(ctx, x - 2, y, 42, 5, '#b5179e');
      // Кристальные выступы
      px(ctx, x + 4, y + 6, 4, 6, '#f72585');
      px(ctx, x + 14, y + 4, 5, 8, '#4cc9f0');
      px(ctx, x + 26, y + 5, 6, 7, '#f72585');
      break;

    case 'vintage_tea_saucer':
      px(ctx, x, y + 4, 38, 14, '#ffffff');
      px(ctx, x + 3, y + 18, 32, 3, '#023e8a');
      px(ctx, x - 2, y, 42, 5, '#edf2f4');
      // Гжельская синяя роспись
      px(ctx, x + 6, y + 8, 6, 4, '#0077b6');
      px(ctx, x + 18, y + 7, 4, 5, '#023e8a');
      px(ctx, x + 26, y + 8, 6, 4, '#0077b6');
      break;

    case 'bamboo_trough':
      px(ctx, x, y + 4, 38, 14, '#70e000');
      px(ctx, x + 3, y + 18, 32, 3, '#38b000');
      px(ctx, x - 2, y, 42, 5, '#aacc00');
      // Бамбуковые перегородки
      px(ctx, x + 12, y + 2, 3, 16, '#38b000');
      px(ctx, x + 26, y + 2, 3, 16, '#38b000');
      break;

    case 'cookie_bowl':
      px(ctx, x, y + 4, 38, 14, '#b07d62');
      px(ctx, x + 3, y + 18, 32, 3, '#6f4e37');
      px(ctx, x - 2, y, 42, 5, '#d4a373');
      // Волнистая белая глазурь
      for (let cx = x; cx < x + 38; cx += 4) {
        px(ctx, cx, y, 2, 4, '#ffffff');
      }
      break;

    case 'pumpkin_bowl':
      px(ctx, x, y + 4, 38, 14, '#f77f00');
      px(ctx, x + 3, y + 18, 32, 3, '#d62828');
      px(ctx, x - 2, y, 42, 5, '#fcbf49');
      // Бороздки тыквы
      px(ctx, x + 8, y + 4, 2, 14, '#d62828');
      px(ctx, x + 18, y + 4, 2, 14, '#d62828');
      px(ctx, x + 28, y + 4, 2, 14, '#d62828');
      break;

    case 'lava_stone':
      px(ctx, x, y + 4, 38, 14, '#212529');
      px(ctx, x + 3, y + 18, 32, 3, '#101214');
      px(ctx, x - 2, y, 42, 5, '#343a40');
      // Раскаленные жилки лавы
      px(ctx, x + 6, y + 8, 8, 2, '#e63946');
      px(ctx, x + 12, y + 10, 6, 2, '#f77f00');
      px(ctx, x + 24, y + 7, 8, 3, '#e63946');
      break;

    case 'ice_chalice':
      px(ctx, x, y + 4, 38, 14, '#90e0ef');
      px(ctx, x + 3, y + 18, 32, 3, '#0096c7');
      px(ctx, x - 2, y, 42, 5, '#caf0f8');
      // Морозный блеск
      px(ctx, x + 4, y + 6, 3, 3, '#ffffff');
      px(ctx, x + 28, y + 8, 3, 3, '#ffffff');
      break;

    case 'magic_cauldron':
      px(ctx, x + 2, y + 4, 34, 14, '#1b1b22');
      px(ctx, x + 6, y + 18, 26, 3, '#0d0d11');
      px(ctx, x - 2, y, 42, 5, '#2c2c38');
      // Ножки котелка
      px(ctx, x + 4, y + 18, 4, 4, '#1b1b22');
      px(ctx, x + 30, y + 18, 4, 4, '#1b1b22');
      // Зеленое зелье
      px(ctx, x + 4, y + 2, 30, 3, '#38b000');
      px(ctx, x + 16, y, 4, 3, '#70e000');
      break;

    case 'cheese_plate':
      px(ctx, x, y + 4, 38, 14, '#fcbf49');
      px(ctx, x + 3, y + 18, 32, 3, '#f77f00');
      px(ctx, x - 2, y, 42, 5, '#fee440');
      // Сырные дырки
      px(ctx, x + 6, y + 8, 6, 4, '#e76f51');
      px(ctx, x + 22, y + 9, 7, 5, '#e76f51');
      break;

    default:
      px(ctx, x, y + 4, 38, 14, '#c86d51');
      px(ctx, x + 3, y + 18, 32, 3, '#813405');
      px(ctx, x - 2, y, 42, 5, '#e07a5f');
      break;
  }

  // Отрисовка уровня корма (семечки, орехи, злаки)
  if (foodLevel > 0) {
    const foodH = Math.min(7, Math.ceil((foodLevel / 100) * 7));
    px(ctx, x + 2, y - foodH + 2, 34, foodH, '#f4a261');
    // Семечки и крупинки корма
    px(ctx, x + 6, y - foodH + 1, 4, 2, '#2b1704');
    px(ctx, x + 14, y - foodH + 2, 5, 2, '#e76f51');
    px(ctx, x + 22, y - foodH + 1, 4, 2, '#2b1704');
    px(ctx, x + 28, y - foodH + 2, 3, 2, '#2a9d8f');
  }
}

// ---------------------------------------------------------------------------
// 4. ДЕТАЛЬНАЯ ОТРИСОВКА ПОИЛКИ (В КЛЕТКЕ)
// ---------------------------------------------------------------------------
export function drawWaterBottleDetailed(
  ctx: CanvasRenderingContext2D,
  type: WaterBottleType,
  x: number,
  y: number,
  time: number,
  waterLevel: number = 100,
  liquidColor: string = '#48cae4'
) {
  // Крепеж к прутьям клетки
  px(ctx, x - 4, y + 12, 24, 4, '#6c757d');
  px(ctx, x - 4, y + 36, 24, 4, '#6c757d');

  const lvlPct = Math.max(0, Math.min(100, waterLevel)) / 100;
  const hasLiquid = lvlPct > 0.02;

  switch (type) {
    case 'ball': {
      // 1. Шариковая классика (прозрачный тубус + уровень жидкости)
      px(ctx, x, y, 16, 46, '#1e293b'); // Внутренность / фон
      if (hasLiquid) {
        const fillH = Math.round(44 * lvlPct);
        const fillY = y + 45 - fillH;
        px(ctx, x + 1, fillY, 14, fillH, liquidColor);
        // Блик на жидкости
        px(ctx, x + 2, fillY, 2, fillH, '#ffffff');
      }
      // Стеклянная оболочка и крышка
      px(ctx, x + 3, y - 4, 10, 5, '#023e8a');
      px(ctx, x, y, 1, 46, '#94a3b8');
      px(ctx, x + 15, y, 1, 46, '#94a3b8');
      // Металлический носик и шарик
      px(ctx, x + 5, y + 46, 6, 14, '#ced4da');
      px(ctx, x + 8, y + 58, 4, 6, '#6c757d');
      // Капелька жидкости выбранного напитка
      if (hasLiquid && Math.sin(time * 3) > 0.2) {
        px(ctx, x + 9, y + 64, 2, 3, liquidColor);
      }
      break;
    }

    case 'flask': {
      // 2. Стеклянная колба
      px(ctx, x + 4, y, 8, 18, '#90e0ef');
      px(ctx, x - 2, y + 18, 20, 28, '#1e293b');
      if (hasLiquid) {
        const fH = Math.round(26 * lvlPct);
        px(ctx, x - 1, y + 45 - fH, 18, fH, liquidColor);
      }
      px(ctx, x + 4, y - 4, 8, 5, '#b08968'); // Пробка
      px(ctx, x, y + 20, 2, 22, '#caf0f8');
      px(ctx, x + 5, y + 46, 6, 14, '#adb5bd');
      // Пузырек внутри колбы
      if (hasLiquid) {
        const bubY = y + 38 - Math.floor((time * 8) % 16);
        px(ctx, x + 8, bubY, 3, 3, '#ffffff');
      }
      break;
    }

    case 'fountain': {
      // 3. Авто-фонтанчик
      px(ctx, x - 4, y + 12, 24, 34, '#0077b6');
      px(ctx, x, y + 4, 16, 10, '#03045e');
      const wave = Math.floor(Math.sin(time * 8) * 2);
      px(ctx, x + 6 + wave, y + 14, 4, 28, hasLiquid ? liquidColor : '#64748b');
      px(ctx, x + 4, y + 46, 8, 8, '#0096c7');
      break;
    }

    case 'bamboo_drip': {
      // 4. Бамбуковый стебель
      px(ctx, x + 2, y, 12, 48, '#70e000');
      px(ctx, x + 1, y + 16, 14, 4, '#38b000');
      px(ctx, x + 1, y + 34, 14, 4, '#38b000');
      // Срезанный наклонный носик
      px(ctx, x + 4, y + 48, 8, 12, '#38b000');
      if (hasLiquid) {
        px(ctx, x + 7, y + 60, 3, 4, liquidColor);
      }
      break;
    }

    case 'cyber_tube': {
      // 5. Кибер-капсула
      px(ctx, x - 1, y, 18, 46, '#181425');
      if (hasLiquid) {
        const fH = Math.round(38 * lvlPct);
        px(ctx, x + 2, y + 42 - fH, 12, fH, liquidColor);
        px(ctx, x + 5, y + 42 - fH, 6, fH, '#ffffff');
      }
      px(ctx, x - 3, y - 2, 22, 6, '#ff007f');
      px(ctx, x + 4, y + 46, 8, 14, '#7209b7');
      if (hasLiquid) {
        px(ctx, x + 7, y + 60, 3, 4, liquidColor);
      }
      break;
    }

    case 'honey_drop': {
      // 6. Медовая капля
      px(ctx, x + 2, y, 12, 14, '#e76f51');
      px(ctx, x - 2, y + 14, 20, 32, '#1e293b');
      if (hasLiquid) {
        const fH = Math.round(30 * lvlPct);
        px(ctx, x - 1, y + 45 - fH, 18, fH, liquidColor);
      }
      px(ctx, x, y + 16, 3, 26, '#fefae0');
      px(ctx, x + 6, y + 46, 5, 14, '#e76f51');
      if (hasLiquid) {
        px(ctx, x + 7, y + 60, 3, 5, liquidColor);
      }
      break;
    }

    case 'potion_bottle': {
      // 7. Фляга здоровья
      px(ctx, x + 4, y, 8, 14, '#b08968'); // Горлышко
      px(ctx, x - 4, y + 14, 24, 30, '#1e293b');
      if (hasLiquid) {
        const fH = Math.round(28 * lvlPct);
        px(ctx, x - 3, y + 43 - fH, 22, fH, liquidColor);
      }
      px(ctx, x - 2, y + 16, 3, 24, '#ffffff');
      px(ctx, x + 6, y + 44, 5, 14, '#6c757d');
      if (hasLiquid) {
        px(ctx, x + 8, y + 58, 2, 4, liquidColor);
      }
      break;
    }

    case 'dew_leaf': {
      // 8. Стебель с росой
      px(ctx, x + 6, y, 5, 40, '#2d6a4f');
      px(ctx, x - 2, y + 20, 10, 8, '#52b788');
      // Капля росы
      px(ctx, x - 2, y + 40, 20, 20, '#caf0f8');
      px(ctx, x, y + 42, 5, 14, '#ffffff');
      px(ctx, x + 6, y + 60, 4, 5, '#00b4d8');
      break;
    }

    case 'cloud_rain': {
      // 9. Мини-облачко
      px(ctx, x - 6, y + 10, 28, 18, '#8ecae6');
      px(ctx, x - 2, y + 4, 20, 10, '#bde0fe');
      px(ctx, x + 2, y + 28, 12, 14, '#ced4da');
      // Дождевые капли
      const dropOffset = Math.floor((time * 20) % 18);
      px(ctx, x - 2, y + 32 + dropOffset, 2, 4, '#023e8a');
      px(ctx, x + 6, y + 38 + ((dropOffset + 8) % 18), 2, 4, '#0077b6');
      px(ctx, x + 14, y + 34 + ((dropOffset + 4) % 18), 2, 4, '#023e8a');
      break;
    }

    case 'space_hydration': {
      // 10. Орбитальный гидратор
      px(ctx, x, y, 16, 46, '#edf2f4');
      px(ctx, x + 3, y - 4, 10, 5, '#2b2d42');
      px(ctx, x + 4, y + 14, 8, 8, '#f77f00'); // Манометр
      px(ctx, x + 5, y + 46, 6, 14, '#8d99ae');
      px(ctx, x + 8, y + 58, 3, 5, '#00b4d8');
      break;
    }

    case 'crystal_stalactite': {
      // 11. Кристальный сталактит
      px(ctx, x - 2, y, 20, 12, '#3a0ca3');
      px(ctx, x + 1, y + 12, 14, 20, '#4361ee');
      px(ctx, x + 4, y + 32, 8, 18, '#4cc9f0');
      px(ctx, x + 6, y + 50, 4, 12, '#caf0f8');
      px(ctx, x + 7, y + 62, 2, 4, '#ffffff');
      break;
    }

    case 'vintage_teapot': {
      // 12. Медный чайничек
      px(ctx, x - 4, y + 8, 24, 26, '#b87333');
      px(ctx, x + 2, y + 2, 12, 6, '#d4a373'); // Крышка
      px(ctx, x + 6, y + 34, 5, 18, '#d4a373'); // Носик
      if (hasLiquid) {
        px(ctx, x + 8, y + 52, 3, 5, liquidColor);
      }
      break;
    }

    case 'baby_bottle': {
      // 13. Детская бутылочка
      px(ctx, x, y + 8, 16, 38, '#1e293b');
      if (hasLiquid) {
        const fH = Math.round(36 * lvlPct);
        px(ctx, x + 1, y + 45 - fH, 14, fH, liquidColor);
      }
      px(ctx, x - 2, y + 2, 20, 6, '#ffafcc');
      px(ctx, x + 4, y - 4, 8, 6, '#f4a261'); // Соска
      px(ctx, x + 5, y + 46, 6, 14, '#f4a261');
      // Мерная шкала
      px(ctx, x + 12, y + 14, 3, 2, '#ff4d6d');
      px(ctx, x + 12, y + 22, 3, 2, '#ff4d6d');
      px(ctx, x + 12, y + 30, 3, 2, '#ff4d6d');
      if (hasLiquid) {
        px(ctx, x + 8, y + 58, 2, 4, liquidColor);
      }
      break;
    }

    case 'soda_dispenser': {
      // 14. Ретро-сифон
      px(ctx, x, y + 8, 16, 38, '#adb5bd');
      if (hasLiquid) {
        const fH = Math.round(30 * lvlPct);
        px(ctx, x + 2, y + 44 - fH, 12, fH, liquidColor);
      }
      px(ctx, x + 2, y + 10, 4, 32, '#f8f9fa');
      px(ctx, x - 4, y + 2, 24, 6, '#495057');
      px(ctx, x - 6, y, 6, 4, '#e63946'); // Рычаг
      px(ctx, x + 5, y + 46, 6, 14, '#6c757d');
      if (hasLiquid) {
        px(ctx, x + 7, y + 60, 2, 4, liquidColor);
      }
      break;
    }

    case 'rainbow_flask': {
      // 15. Радужная мензурка
      px(ctx, x + 1, y, 14, 46, '#1e293b');
      if (hasLiquid) {
        const fH = Math.round(40 * lvlPct);
        px(ctx, x + 2, y + 45 - fH, 12, fH, liquidColor);
      }
      px(ctx, x + 3, y + 4, 10, 6, '#ff0000');
      px(ctx, x + 3, y + 10, 10, 6, '#ff7f00');
      px(ctx, x + 3, y + 16, 10, 6, '#ffff00');
      px(ctx, x + 3, y + 22, 10, 6, '#00ff00');
      px(ctx, x + 3, y + 28, 10, 6, '#0000ff');
      px(ctx, x + 3, y + 34, 10, 8, '#8b00ff');
      px(ctx, x + 5, y + 46, 6, 14, '#adb5bd');
      if (hasLiquid) {
        px(ctx, x + 7, y + 60, 3, 4, liquidColor);
      }
      break;
    }

    case 'acorn_canteen': {
      // 16. Желудевая фляжка
      px(ctx, x - 2, y + 6, 20, 38, '#7f5539');
      px(ctx, x - 4, y + 2, 24, 8, '#582f0e'); // Шапочка
      px(ctx, x + 5, y + 44, 6, 14, '#b08968');
      if (hasLiquid) {
        px(ctx, x + 8, y + 58, 2, 4, liquidColor);
      }
      break;
    }

    case 'plasma_cooler': {
      // 17. Плазменный кулер
      px(ctx, x, y, 16, 46, '#3a86ff');
      px(ctx, x + 3, y + 6, 10, 32, '#8338ec');
      px(ctx, x + 6, y + 10, 4, 24, '#ffffff');
      px(ctx, x + 4, y + 46, 8, 14, '#00b4d8');
      px(ctx, x + 7, y + 60, 3, 5, '#caf0f8');
      break;
    }

    case 'magic_chalice': {
      // 18. Парящая чаша
      px(ctx, x - 2, y + 10, 20, 16, '#9d4edd');
      px(ctx, x + 4, y + 26, 8, 14, '#7b2cbf');
      px(ctx, x, y + 40, 16, 6, '#5a189a');
      // Неиссякаемая родниковая струя
      px(ctx, x + 6, y + 46, 4, 18, '#c77dff');
      px(ctx, x + 7, y + 64, 2, 4, '#ffffff');
      break;
    }

    case 'spring_well': {
      // 19. Колодезное ведерко
      px(ctx, x + 7, y, 2, 20, '#d4a373'); // Веревка
      px(ctx, x - 2, y + 20, 20, 24, '#7f4f24');
      px(ctx, x, y + 22, 16, 4, '#48cae4'); // Вода в ведерке
      px(ctx, x + 5, y + 44, 6, 14, '#582f0e');
      break;
    }

    case 'zen_bamboo_stream': {
      // 20. Сиси-одоси
      px(ctx, x - 4, y + 10, 24, 8, '#70e000');
      px(ctx, x + 2, y + 18, 12, 28, '#38b000');
      const streamX = x + 6 + Math.floor(Math.sin(time * 6) * 2);
      px(ctx, streamX, y + 46, 4, 18, '#90e0ef');
      break;
    }

    default:
      px(ctx, x, y, 16, 46, '#48cae4');
      px(ctx, x + 3, y - 4, 10, 5, '#023e8a');
      px(ctx, x + 5, y + 46, 6, 14, '#ced4da');
      break;
  }
}

// ---------------------------------------------------------------------------
// 5. СПРАЙТ ПРЕДПРОСМОТРА КОРМУШКИ (для карточек в Настройках)
// ---------------------------------------------------------------------------
export function drawBowlPreview(
  canvas: HTMLCanvasElement,
  type: BowlType
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  // Центрируем мисочку (размер ~42x24 на холсте 56x36)
  drawBowlDetailed(ctx, type, 80, 8, 10);
}

// ---------------------------------------------------------------------------
// 6. СПРАЙТ ПРЕДПРОСМОТРА ПОИЛКИ (для карточек в Настройках)
// ---------------------------------------------------------------------------
export function drawBottlePreview(
  canvas: HTMLCanvasElement,
  type: WaterBottleType
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  // Центрируем поилку (холст 44x70)
  drawWaterBottleDetailed(ctx, type, 14, 4, 1.5);
}
