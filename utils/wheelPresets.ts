/**
 * ============================================================================
 * МОДУЛЬ: 20 ДИЗАЙНЕРСКИХ БЕГОВЫХ КОЛЕС (Wheel Presets & Pixel Art Renderer)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. 2-СЛОЙНЫЙ РЕНДЕРИНГ КОЛЕСА:
 *    - Задний слой (`drawWheelBackDetailed`): опора, задний обод и спицы (рисуются ДО хомячка).
 *    - Передний слой (`drawWheelFrontDetailed`): передний обод, тематические декорации
 *      (пончиковая глазурь, шестеренки, кристаллы, неон) и ступица (рисуются ПОВЕРХ хомячка).
 *    Благодаря этому хомяк бежит ТОЧНО ВНУТРИ барабана колеса!
 * 
 * 2. ДИЗАЙНЕРСКИЕ МОДЕЛИ:
 *    20 уникальных стилей от классики до киберпанка, пончиков и стимпанка.
 * ============================================================================
 */

import { WheelType } from '@/types/hamster';

export interface WheelPreset {
  id: WheelType;
  name: string;
  nameEn: string;
  desc: string;
  icon: string;
}

export const WHEEL_PRESETS: WheelPreset[] = [
  { id: 'classic', name: 'Бирюзовая сталь', nameEn: 'Classic Steel', desc: 'Надежное металлическое колесо на бесшумном подшипнике', icon: '🎡' },
  { id: 'wood_spoke', name: 'Дубовое колесо', nameEn: 'Oak Wood Spoke', desc: 'Теплое деревянное колесо со спицами из мореного дуба', icon: '🪵' },
  { id: 'cyber_neon', name: 'Кибер-неон', nameEn: 'Cyber Neon', desc: 'Неоновые розово-бирюзовые трубки со светящимся ротором', icon: '⚡' },
  { id: 'golden_sun', name: 'Золотое солнце', nameEn: 'Golden Sunburst', desc: 'Царское червонное золото с лучами и рубиновым кристаллом', icon: '👑' },
  { id: 'donut', name: 'Сладкий пончик', nameEn: 'Glazed Donut', desc: 'Аппетитный пончик с клубничной глазурью и цветной посыпкой', icon: '🍩' },
  { id: 'rainbow', name: 'Радужный вихрь', nameEn: 'Rainbow Vortex', desc: 'Многоцветный спектральный круг, создающий калейдоскоп при беге', icon: '🌈' },
  { id: 'flower_daisy', name: 'Ромашковое поле', nameEn: 'Flower Daisy', desc: 'Белоснежные лепестки с солнечной желтой сердцевиной', icon: '🌼' },
  { id: 'space_gyro', name: 'Орбитальный гироскоп', nameEn: 'Space Gyro', desc: 'Двойное титановое кольцо со светодиодным реактором', icon: '🛸' },
  { id: 'racing_tire', name: 'Гоночная шина', nameEn: 'Racing Tire', desc: 'Спортивная резиновая покрышка с рельефным протектором', icon: '🏎️' },
  { id: 'crystal_spinner', name: 'Аметистовый кристалл', nameEn: 'Amethyst Crystal', desc: 'Граненый фиолетовый минерал со сверкающими гранями', icon: '🔮' },
  { id: 'candy_peppermint', name: 'Мятный леденец', nameEn: 'Peppermint Candy', desc: 'Спиральные красно-белые полосы рождественской карамели', icon: '🍬' },
  { id: 'bubble_aqua', name: 'Аква-пузырек', nameEn: 'Bubble Aqua', desc: 'Морская лазурь с поднимающимися кислородными пузырьками', icon: '🫧' },
  { id: 'steampunk_gear', name: 'Латунная шестеренка', nameEn: 'Steampunk Gear', desc: 'Механическая шестерня с зубцами и заклепками эпохи пара', icon: '⚙️' },
  { id: 'galaxy_spiral', name: 'Спиральная галактика', nameEn: 'Galaxy Spiral', desc: 'Космическая туманность с мерцающей звездной пылью', icon: '🌌' },
  { id: 'watermelon_spin', name: 'Арбузный спиннер', nameEn: 'Watermelon Spin', desc: 'Зеленая полосатая корка и алая мякоть с черными косточками', icon: '🍉' },
  { id: 'clockwork', name: 'Винтажные часы', nameEn: 'Clockwork Dial', desc: 'Ретро-циферблат с часовыми стрелками и мерным тиканьем', icon: '🕰️' },
  { id: 'cheese_wheel', name: 'Сырное колесо', nameEn: 'Cheese Wheel', desc: 'Аппетитная сырная головка с дырочками, обожаемая хомячками', icon: '🧀' },
  { id: 'lava_vortex', name: 'Лавовый вихрь', nameEn: 'Lava Vortex', desc: 'Обсидиановый обод с раскаленными огненными языками пламени', icon: '🌋' },
  { id: 'acorn_spinner', name: 'Лесной желудь', nameEn: 'Forest Acorn', desc: 'Натуральная древесная текстура с зелеными листиками плюща', icon: '🌰' },
  { id: 'zen_bamboo', name: 'Бамбуковая мельница', nameEn: 'Zen Bamboo Mill', desc: 'Японское водяное колесо из крепких бамбуковых трубок', icon: '🎋' },
];

/**
 * Вспомогательная функция рисования пиксельного прямоугольника
 */
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

/**
 * 1. ЗАДНИЙ СЛОЙ БЕГОВОГО КОЛЕСА (рисуется ДО хомячка)
 * Отрисовывает металлическую стойку-ножку к полу клетки и заднюю дугу обода.
 */
export function drawWheelBackDetailed(
  ctx: CanvasRenderingContext2D,
  type: WheelType,
  cx: number,
  cy: number,
  radius: number,
  angle: number
) {
  ctx.save();

  // 1. Опорная металлическая стойка колеса к поддону клетки
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1e2438';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - 16, cy + radius + 14);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 16, cy + radius + 14);
  ctx.stroke();

  // Основание стойки
  px(ctx, cx - 22, cy + radius + 12, 44, 4, '#101423');

  // 2. Цвета задней дуги в зависимости от типа
  let backColor = '#0077b6';
  let spokeColor = 'rgba(0, 180, 216, 0.45)';

  switch (type) {
    case 'wood_spoke':
      backColor = '#4a2c11';
      spokeColor = 'rgba(96, 56, 19, 0.45)';
      break;
    case 'cyber_neon':
      backColor = '#7209b7';
      spokeColor = 'rgba(0, 245, 212, 0.45)';
      break;
    case 'golden_sun':
      backColor = '#b8860b';
      spokeColor = 'rgba(255, 215, 0, 0.45)';
      break;
    case 'donut':
      backColor = '#b07d62';
      spokeColor = 'rgba(255, 117, 143, 0.45)';
      break;
    case 'rainbow':
      backColor = '#3a0ca3';
      spokeColor = 'rgba(255, 255, 255, 0.35)';
      break;
    case 'flower_daisy':
      backColor = '#2d6a4f';
      spokeColor = 'rgba(255, 255, 255, 0.4)';
      break;
    case 'racing_tire':
      backColor = '#1a1d20';
      spokeColor = 'rgba(108, 117, 125, 0.4)';
      break;
    case 'crystal_spinner':
      backColor = '#3a0ca3';
      spokeColor = 'rgba(181, 23, 158, 0.45)';
      break;
    case 'candy_peppermint':
      backColor = '#800f2f';
      spokeColor = 'rgba(255, 255, 255, 0.45)';
      break;
    case 'lava_vortex':
      backColor = '#6a040f';
      spokeColor = 'rgba(230, 57, 70, 0.45)';
      break;
    case 'zen_bamboo':
      backColor = '#2d6a4f';
      spokeColor = 'rgba(112, 224, 0, 0.45)';
      break;
    default:
      backColor = '#0077b6';
      spokeColor = 'rgba(0, 180, 216, 0.45)';
      break;
  }

  // Задний обод
  ctx.lineWidth = 3;
  ctx.strokeStyle = backColor;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Задние спицы
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = spokeColor;
  const numSpokes = 8;
  for (let i = 0; i < numSpokes; i++) {
    const spAngle = angle + (i * Math.PI * 2) / numSpokes;
    const x1 = cx + Math.cos(spAngle) * 4;
    const y1 = cy + Math.sin(spAngle) * 4;
    const x2 = cx + Math.cos(spAngle) * (radius - 2);
    const y2 = cy + Math.sin(spAngle) * (radius - 2);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 2. ПЕРЕДНИЙ СЛОЙ БЕГОВОГО КОЛЕСА (рисуется ПОСЛЕ хомячка)
 * Отрисовывает передний обод, тематические декоративные элементы и ступицу.
 */
export function drawWheelFrontDetailed(
  ctx: CanvasRenderingContext2D,
  type: WheelType,
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  isRunning: boolean
) {
  ctx.save();

  // Основной передний обод
  let frontColor = '#00f5d4';
  let rimAccent = '#48cae4';
  let hubColor = '#fee440';

  switch (type) {
    case 'wood_spoke':
      frontColor = '#8b5a2b';
      rimAccent = '#d4a373';
      hubColor = '#b08968';
      break;
    case 'cyber_neon':
      frontColor = '#ff007f';
      rimAccent = '#00f5d4';
      hubColor = '#fee440';
      break;
    case 'golden_sun':
      frontColor = '#ffd700';
      rimAccent = '#ffee58';
      hubColor = '#d90429';
      break;
    case 'donut':
      frontColor = '#ff758f';
      rimAccent = '#f4a261';
      hubColor = '#fff0f3';
      break;
    case 'rainbow':
      frontColor = '#ff0054';
      rimAccent = '#fee440';
      hubColor = '#00f5d4';
      break;
    case 'flower_daisy':
      frontColor = '#ffffff';
      rimAccent = '#70e000';
      hubColor = '#fee440';
      break;
    case 'space_gyro':
      frontColor = '#8d99ae';
      rimAccent = '#00b4d8';
      hubColor = '#00f5d4';
      break;
    case 'racing_tire':
      frontColor = '#343a40';
      rimAccent = '#6c757d';
      hubColor = '#e9ecef';
      break;
    case 'crystal_spinner':
      frontColor = '#7209b7';
      rimAccent = '#f72585';
      hubColor = '#4cc9f0';
      break;
    case 'candy_peppermint':
      frontColor = '#e63946';
      rimAccent = '#ffffff';
      hubColor = '#ffffff';
      break;
    case 'bubble_aqua':
      frontColor = '#00b4d8';
      rimAccent = '#90e0ef';
      hubColor = '#caf0f8';
      break;
    case 'steampunk_gear':
      frontColor = '#b87333';
      rimAccent = '#e0a948';
      hubColor = '#582f0e';
      break;
    case 'galaxy_spiral':
      frontColor = '#5a189a';
      rimAccent = '#e0aaff';
      hubColor = '#ffffff';
      break;
    case 'watermelon_spin':
      frontColor = '#2d6a4f';
      rimAccent = '#52b788';
      hubColor = '#e63946';
      break;
    case 'clockwork':
      frontColor = '#2b2d42';
      rimAccent = '#d4af37';
      hubColor = '#d4af37';
      break;
    case 'cheese_wheel':
      frontColor = '#fcbf49';
      rimAccent = '#f77f00';
      hubColor = '#fee440';
      break;
    case 'lava_vortex':
      frontColor = '#e63946';
      rimAccent = '#f77f00';
      hubColor = '#212529';
      break;
    case 'acorn_spinner':
      frontColor = '#7f5539';
      rimAccent = '#b08968';
      hubColor = '#52b788';
      break;
    case 'zen_bamboo':
      frontColor = '#70e000';
      rimAccent = '#38b000';
      hubColor = '#aacc00';
      break;
    default:
      frontColor = '#00f5d4';
      rimAccent = '#48cae4';
      hubColor = '#fee440';
      break;
  }

  // 1. Отрисовка внешнего обода
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = frontColor;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Тематические декорации по периметру обода
  const numDecors = 12;
  for (let i = 0; i < numDecors; i++) {
    const dAngle = angle + (i * Math.PI * 2) / numDecors;
    const dx = cx + Math.cos(dAngle) * radius;
    const dy = cy + Math.sin(dAngle) * radius;

    if (type === 'donut') {
      // Разноцветная посыпка
      const sprinkles = ['#00f5d4', '#fee440', '#ffffff', '#7209b7'];
      px(ctx, dx - 1, dy - 1, 3, 3, sprinkles[i % sprinkles.length]);
    } else if (type === 'steampunk_gear') {
      // Зубцы шестеренки
      const gx = cx + Math.cos(dAngle) * (radius + 3);
      const gy = cy + Math.sin(dAngle) * (radius + 3);
      px(ctx, gx - 2, gy - 2, 4, 4, '#b87333');
    } else if (type === 'cyber_neon') {
      // Неоновые насечки
      px(ctx, dx - 1, dy - 1, 3, 3, i % 2 === 0 ? '#00f5d4' : '#ff007f');
    } else if (type === 'candy_peppermint') {
      // Красно-белые секторы
      px(ctx, dx - 2, dy - 2, 4, 4, i % 2 === 0 ? '#ffffff' : '#e63946');
    } else if (type === 'flower_daisy') {
      // Лепестки
      px(ctx, dx - 2, dy - 2, 4, 4, '#ffffff');
    } else if (type === 'cheese_wheel') {
      // Сырные дырки
      if (i % 3 === 0) px(ctx, dx - 2, dy - 2, 3, 3, '#f77f00');
    }
  }

  // 3. Внутренний тонкий контур обода
  ctx.lineWidth = 1;
  ctx.strokeStyle = rimAccent;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Центральная ступица (ротор)
  ctx.fillStyle = '#0f1423';
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hubColor;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();

  // Эффект вращения (блик на ступице)
  if (isRunning) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle * 2) * 2, cy + Math.sin(angle * 2) * 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * 3. СПРАЙТ ПРЕДПРОСМОТРА БЕГОВОГО КОЛЕСА (для карточки выбора в Настройках)
 * Рендерит колесико размером 72x72 в переданный холст.
 */
export function drawWheelPreview(
  canvas: HTMLCanvasElement,
  wheelType: WheelType
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const cx = 36;
  const cy = 32;
  const radius = 26;
  const angle = 0.4;

  // Отрисовка задней половины
  drawWheelBackDetailed(ctx, wheelType, cx, cy, radius, angle);

  // Отрисовка передней половины
  drawWheelFrontDetailed(ctx, wheelType, cx, cy, radius, angle, false);
}
