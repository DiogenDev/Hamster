/**
 * ============================================================================
 * МОДУЛЬ: 20 ДИЗАЙНЕРСКИХ ПАЛИТР И СПРАЙТОВЫЕ МАТРИЦЫ ХОМЯЧКА
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АРХИТЕКТУРНОЕ ОБОСНОВАНИЕ
 * ----------------------------------------------------------------------------
 * 1. ЗАЧЕМ ЭТО НУЖНО (Architectural Reason):
 *    Вместо растровых картинок (PNG/GIF) мы описываем хомяка в виде цифровых
 *    матриц (2D-массивов с индексами анатомических зон).
 *    Это дает колоссальные преимущества:
 *    - Разделение геометрии и окраса (Data-Driven Palette Swapping):
 *      Одна и та же анимация 16x16 мгновенно перекрашивается в любую из 20 палитр
 *      без необходимости перерисовывать сотни отдельных картинок!
 *    - 100% совместимость со студией пиксель-арта:
 *      Игрок может отредактировать матрицу прямо в игре и сразу надеть на хомячка.
 * 
 * 2. КАК ЭТО РАБОТАЕТ (Algorithmic Essence):
 *    Символьные коды анатомических слоев в матрице:
 *    '.' = Прозрачный фон (Alpha 0)
 *    'F' = Основная шерсть (Fur)
 *    'D' = Теневая шерсть / контур (Fur Dark)
 *    'B' = Светлое брюшко и щечки (Belly)
 *    'P' = Розовый носик, ушки и лапки (Pink)
 *    'E' = Черные глазки-бусинки (Eyes)
 *    'H' = Блик в глазках (Eye Highlight)
 *    'C' = Румянец на щечках (Cheeks)
 *    'S' = Семечка / еда в лапках (Seed/Food)
 * 
 * 3. ПОДВОДНЫЕ КАМНИ (Pitfalls & Gotchas):
 *    - Строки фиксированной ширины: все строки матрицы обязаны иметь строго одинаковую длину (16 символов).
 *      Если длина строки будет плавать, Canvas отрисует перекошенный спрайт со смещением пикселей.
 * ============================================================================
 */

import { HamsterPalette, FoodItem } from '@/types/hamster';

/**
 * 20 Готовых дизайнерских палитр хомячков
 */
export const HAMSTER_PALETTES: HamsterPalette[] = [
  {
    id: 'classic_golden',
    name: 'Золотистый сириец',
    nameEn: 'Classic Golden',
    description: 'Классический пушистый золотисто-рыжий окрас со светлым животиком.',
    fur: '#e69138',
    furDark: '#b45f06',
    belly: '#fff2cc',
    pink: '#f4cccc',
    eyes: '#1b1b1b',
    eyeHighlight: '#ffffff',
    cheeks: '#ea9999',
    paws: '#fce5cd',
  },
  {
    id: 'roborovski_sand',
    name: 'Песочный Роборовского',
    nameEn: 'Roborovski Sand',
    description: 'Нежный песочно-палевый оттенок крошечного пустынного хомячка.',
    fur: '#e0b880',
    furDark: '#af854f',
    belly: '#fcf6ed',
    pink: '#f8d7da',
    eyes: '#201b15',
    eyeHighlight: '#ffffff',
    cheeks: '#f1b0b7',
    paws: '#fcebe0',
  },
  {
    id: 'albino_snow',
    name: 'Белоснежный альбинос',
    nameEn: 'Albino Snow',
    description: 'Ослепительно белая шубка с редкими рубиново-красными глазками.',
    fur: '#ffffff',
    furDark: '#d9d9d9',
    belly: '#f3f3f3',
    pink: '#ffccd5',
    eyes: '#c9184a',
    eyeHighlight: '#ff758f',
    cheeks: '#ffb3c1',
    paws: '#ffe5ec',
  },
  {
    id: 'panda_piebald',
    name: 'Черно-белый панда',
    nameEn: 'Panda Piebald',
    description: 'Контрастный пятнистый окрас с темной маской и белым тельцем.',
    fur: '#2b2d42',
    furDark: '#1a1b26',
    belly: '#edf2f4',
    pink: '#ffb5a7',
    eyes: '#0d0d0d',
    eyeHighlight: '#ffffff',
    cheeks: '#fcd5ce',
    paws: '#f8edeb',
  },
  {
    id: 'caramel_cream',
    name: 'Теплый карамельный',
    nameEn: 'Caramel Cream',
    description: 'Аппетитный мягкий оттенок ириски с кремовым подшерстком.',
    fur: '#c68b59',
    furDark: '#8f532a',
    belly: '#ffe8d6',
    pink: '#f7cad0',
    eyes: '#301b0f',
    eyeHighlight: '#ffffff',
    cheeks: '#f4acb7',
    paws: '#fed9b7',
  },
  {
    id: 'charcoal_dark',
    name: 'Глубокий угольный',
    nameEn: 'Charcoal Dark',
    description: 'Загадочный антрацитовый окрас с серебристым отливом.',
    fur: '#3a3a3c',
    furDark: '#1c1c1e',
    belly: '#636366',
    pink: '#d8b4b8',
    eyes: '#000000',
    eyeHighlight: '#ffffff',
    cheeks: '#a37081',
    paws: '#8e8e93',
  },
  {
    id: 'cinnamon',
    name: 'Коричный',
    nameEn: 'Cinnamon',
    description: 'Пряный коричневато-медный цвет корицы с бежевым брюшком.',
    fur: '#a0522d',
    furDark: '#6b3311',
    belly: '#f5deb3',
    pink: '#e8b4b8',
    eyes: '#3d1a0a',
    eyeHighlight: '#ffffff',
    cheeks: '#d2828a',
    paws: '#eed9c4',
  },
  {
    id: 'lilac_mist',
    name: 'Дымчато-сиреневый',
    nameEn: 'Lilac Mist',
    description: 'Благородный пепельно-лавандовый оттенок с мягким градиентом.',
    fur: '#9d8189',
    furDark: '#6b545a',
    belly: '#f4acb7',
    pink: '#ffcad4',
    eyes: '#2e1f27',
    eyeHighlight: '#ffffff',
    cheeks: '#e07a5f',
    paws: '#ffe5d9',
  },
  {
    id: 'silver_pearl',
    name: 'Серебристый жемчуг',
    nameEn: 'Silver Pearl',
    description: 'Светло-серый шелковистый окрас с мерцающей белой грудкой.',
    fur: '#b8c0c8',
    furDark: '#838e9b',
    belly: '#f0f4f8',
    pink: '#f9d2dc',
    eyes: '#222831',
    eyeHighlight: '#ffffff',
    cheeks: '#f3abbc',
    paws: '#e9ecef',
  },
  {
    id: 'blue_sapphire',
    name: 'Сапфировый джунгарик',
    nameEn: 'Blue Sapphire',
    description: 'Холодный серо-голубой окрас джунгарского хомячка с темной полоской.',
    fur: '#6c7d93',
    furDark: '#445163',
    belly: '#dce4ec',
    pink: '#e6b8c2',
    eyes: '#1a2530',
    eyeHighlight: '#ffffff',
    cheeks: '#d48c9e',
    paws: '#cbd5e1',
  },
  {
    id: 'chocolate_brown',
    name: 'Шоколадный брауни',
    nameEn: 'Chocolate Brown',
    description: 'Глубокий цвет темного шоколада с аппетитной карамельной грудкой.',
    fur: '#5c3a21',
    furDark: '#362111',
    belly: '#d4a373',
    pink: '#e29578',
    eyes: '#1e0f06',
    eyeHighlight: '#ffffff',
    cheeks: '#dd6b55',
    paws: '#e6ccb2',
  },
  {
    id: 'argente_red',
    name: 'Оранжево-песочный',
    nameEn: 'Argente Red',
    description: 'Яркий персиково-апельсиновый оттенок шерсти с карими глазами.',
    fur: '#e76f51',
    furDark: '#b84428',
    belly: '#ffe8d6',
    pink: '#f4a261',
    eyes: '#491b1d',
    eyeHighlight: '#ffffff',
    cheeks: '#e9c46a',
    paws: '#f8edeb',
  },
  {
    id: 'honey_gold',
    name: 'Медовый янтарь',
    nameEn: 'Honey Gold',
    description: 'Теплый солнечный янтарно-желтый цвет летнего меда.',
    fur: '#f4a261',
    furDark: '#c86d2b',
    belly: '#fff1d0',
    pink: '#fbc3bc',
    eyes: '#381e05',
    eyeHighlight: '#ffffff',
    cheeks: '#e76f51',
    paws: '#fde8cd',
  },
  {
    id: 'rust_orange',
    name: 'Рыжий кирпичный',
    nameEn: 'Rust Orange',
    description: 'Насыщенный осенний рыжий окрас пушистого зверька.',
    fur: '#d35400',
    furDark: '#962d00',
    belly: '#fdebd0',
    pink: '#edbb99',
    eyes: '#2c1200',
    eyeHighlight: '#ffffff',
    cheeks: '#e59866',
    paws: '#fadbd8',
  },
  {
    id: 'dove_grey',
    name: 'Голубино-серый',
    nameEn: 'Dove Grey',
    description: 'Умиротворяющий матовый дымчатый цвет голубиного пера.',
    fur: '#8d99ae',
    furDark: '#566375',
    belly: '#edf2f4',
    pink: '#e8b4b8',
    eyes: '#2b2d42',
    eyeHighlight: '#ffffff',
    cheeks: '#d98894',
    paws: '#d8e2dc',
  },
  {
    id: 'mink_soft',
    name: 'Норковый бежевый',
    nameEn: 'Mink Soft',
    description: 'Элегантный бежевый цвет шелковой норки с мягким свечением.',
    fur: '#b79ced',
    furDark: '#7f63b8',
    belly: '#f3ecff',
    pink: '#f8bbd0',
    eyes: '#281a40',
    eyeHighlight: '#ffffff',
    cheeks: '#ea80fc',
    paws: '#ede7f6',
  },
  {
    id: 'copper_glow',
    name: 'Медно-красный',
    nameEn: 'Copper Glow',
    description: 'Сияющий металлический медно-бронзовый цвет шерстки.',
    fur: '#b85d38',
    furDark: '#7e3518',
    belly: '#fad3b8',
    pink: '#e69c8a',
    eyes: '#3b160a',
    eyeHighlight: '#ffffff',
    cheeks: '#cc5a43',
    paws: '#f5c6aa',
  },
  {
    id: 'ivory_white',
    name: 'Слоновая кость',
    nameEn: 'Ivory White',
    description: 'Мягкий благородный сливочно-белый оттенок с темными глазками.',
    fur: '#fefae0',
    furDark: '#d4ceaa',
    belly: '#ffffff',
    pink: '#fbc4ab',
    eyes: '#1e1e1e',
    eyeHighlight: '#ffffff',
    cheeks: '#f8ad9d',
    paws: '#faedcd',
  },
  {
    id: 'obsidian_onyx',
    name: 'Глянцевый оникс',
    nameEn: 'Obsidian Onyx',
    description: 'Смоляной черный мех с элегантными белоснежными перчатками на лапках.',
    fur: '#141416',
    furDark: '#08080a',
    belly: '#28282e',
    pink: '#ff9ebb',
    eyes: '#000000',
    eyeHighlight: '#00e5ff',
    cheeks: '#e91e63',
    paws: '#ffffff',
  },
  {
    id: 'cyber_rainbow',
    name: 'Party Cyber / Неон',
    nameEn: 'Party Cyber / Neon',
    description: 'Секретный ретро-киберпанк окрас с неоново-бирюзовой шерсткой и фиолетовыми щечками.',
    fur: '#00f5d4',
    furDark: '#00bbf9',
    belly: '#fee440',
    pink: '#f15bb5',
    eyes: '#9b5de5',
    eyeHighlight: '#ffffff',
    cheeks: '#ff006e',
    paws: '#00f5d4',
  },
];

/**
 * 16x16 Символьные матрицы анимаций хомячка.
 * Каждая матрица содержит строго 16 строк по 16 символов.
 */

// 1. Спокойное сидение / Idle 1
export const HAMSTER_IDLE_FRAME_1 = [
  '................',
  '....DDF..FDD....',
  '...DPPF..FPPD...',
  '...DPPF..FPPD...',
  '..DFFFFFFFFFD...',
  '..DFEFDFFDFED...',
  '..DFHFDFFDFHD...',
  '..DFFFDPDFFFD...',
  '..DFCFD.DFCFD...',
  '.DFFFFFFFFFD....',
  '.DFFBBBBBFFFD...',
  '.DFFBBBBBFFFD...',
  '.DFFFFFFFFFD....',
  '..DFFDFFDFFD....',
  '...DPPD.DPPD....',
  '................',
];

// 2. Спокойное сидение / Idle 2 (шевелит ушками и носиком)
export const HAMSTER_IDLE_FRAME_2 = [
  '................',
  '...DDF....FDD...',
  '..DPPF....FPPD..',
  '..DPPF....FPPD..',
  '..DFFFFFFFFFD...',
  '..DFEFDFFDFED...',
  '..DFHFDFFDFHD...',
  '..DFFFD.DFFFD...',
  '..DFCFDPDFCFD...',
  '.DFFFFFFFFFD....',
  '.DFFBBBBBFFFD...',
  '.DFFBBBBBFFFD...',
  '.DFFFFFFFFFD....',
  '..DFFDFFDFFD....',
  '...DPPD.DPPD....',
  '................',
];

// 3. Ходьба / Walk 1 (лапки вперед)
export const HAMSTER_WALK_FRAME_1 = [
  '................',
  '....DDF..FDD....',
  '...DPPF..FPPD...',
  '..DFFFFFFFFFD...',
  '..DFEFDFFDFED...',
  '..DFHFDFFDFHD...',
  '..DFFFDPDFFFD...',
  '..DFCFD.DFCFD...',
  '.DFFFFFFFFFFFD..',
  '.DFFBBBBBBFFFD..',
  '.DFFBBBBBBFFFD..',
  '.DFFFFFFFFFFFD..',
  '..DFFD...DFFD...',
  '.DPPD.....DPPD..',
  '................',
  '................',
];

// 4. Ходьба / Walk 2 (лапки назад)
export const HAMSTER_WALK_FRAME_2 = [
  '................',
  '....DDF..FDD....',
  '...DPPF..FPPD...',
  '..DFFFFFFFFFD...',
  '..DFEFDFFDFED...',
  '..DFHFDFFDFHD...',
  '..DFFFDPDFFFD...',
  '..DFCFD.DFCFD...',
  '.DFFFFFFFFFFFD..',
  '.DFFBBBBBBFFFD..',
  '.DFFBBBBBBFFFD..',
  '.DFFFFFFFFFFFD..',
  '...DFFD.DFFD....',
  '...DPPD.DPPD....',
  '................',
  '................',
];

// 5. Лежит на пузике / Laying
export const HAMSTER_LAYING_FRAME = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '....DDF..FDD....',
  '..DFFFFFFFFFFD..',
  '.DFFFFFFFFFFFFD.',
  '.DFEFDFFDDFEFD..',
  '.DFCFDPDDDFCFD..',
  '.DFFFFFFFFFFFFD.',
  '.DFFBBBBBBFFFD..',
  '..DPPDFFDDPPD...',
  '................',
  '................',
  '................',
];

// 6. Спит клубочком / Sleep 1 (выдох)
export const HAMSTER_SLEEP_FRAME_1 = [
  '................',
  '................',
  '................',
  '................',
  '....DDDDDDD.....',
  '..DDFFFFFFFD....',
  '.DFFFFFFFFFFD...',
  '.DFFFFFFFFFFD...',
  '.DFFFFDFFFFFD...',
  '.DFFFFDFFFFFD...',
  '.DFFFFDDPDFFD...',
  '.DFFFFDDDDFFD...',
  '..DFFBBBBBFFD...',
  '...DFFFFFFFFD...',
  '....DDDDDDD.....',
  '................',
];

// 7. Спит клубочком / Sleep 2 (вдох - приподнялся)
export const HAMSTER_SLEEP_FRAME_2 = [
  '................',
  '................',
  '................',
  '....DDDDDDD.....',
  '..DDFFFFFFFD....',
  '.DFFFFFFFFFFD...',
  '.DFFFFFFFFFFD...',
  '.DFFFFFFFFFFD...',
  '.DFFFFDFFFFFD...',
  '.DFFFFDDPDFFD...',
  '.DFFFFDDDDFFD...',
  '..DFFBBBBBFFD...',
  '...DFFFFFFFFD...',
  '....DDDDDDD.....',
  '................',
  '................',
];

// 8. Кушает / Eating 1 (надувает щечки с семечкой 'S')
export const HAMSTER_EATING_FRAME_1 = [
  '................',
  '....DDF..FDD....',
  '...DPPF..FPPD...',
  '..DFFFFFFFFFD...',
  '..DFEFDFFDFED...',
  '..DFHFDFFDFHD...',
  '.DFFFFDPDFFFFD..',
  '.DFCCFD.DFCCFD..',
  '.DFCCFDSSDFCCFD.',
  '.DFFFFDPPDFFFD..',
  '.DFFBBBBBBFFFD..',
  '.DFFFFFFFFFFFD..',
  '..DFFDFFDFFD....',
  '...DPPD.DPPD....',
  '................',
  '................',
];

// 9. Кушает / Eating 2 (жует)
export const HAMSTER_EATING_FRAME_2 = [
  '................',
  '....DDF..FDD....',
  '...DPPF..FPPD...',
  '..DFFFFFFFFFD...',
  '..DFEFDFFDFED...',
  '..DFHFDFFDFHD...',
  '.DFFFFDPDFFFFD..',
  '.DFCCFDSSDFCCFD.',
  '.DFCCFDDDDCCFD..',
  '.DFFFFDPPDFFFD..',
  '.DFFBBBBBBFFFD..',
  '.DFFFFFFFFFFFD..',
  '..DFFDFFDFFD....',
  '...DPPD.DPPD....',
  '................',
  '................',
];

// 10. Дефекация / Pooping
export const HAMSTER_POOPING_FRAME = [
  '................',
  '................',
  '....DDF..FDD....',
  '...DPPF..FPPD...',
  '..DFFFFFFFFFD...',
  '..DFEFDFFDFED...',
  '..DFHFDFFDFHD...',
  '..DFFFDPDFFFD...',
  '..DFCFD.DFCFD...',
  '.DFFFFFFFFFFD...',
  '.DFFFFFFFFFFD...',
  '..DFFFFFFFFD....',
  '...DFFD..DFFD...',
  '....DPPD..DPPD..',
  '................',
  '................',
];

/**
 * Меню доступных видов корма
 */
export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'sunflower_seeds',
    name: 'Семечки подсолнуха',
    description: 'Хрустящее любимое лакомство. Быстро съедается.',
    icon: '🌻',
    hungerGain: 15,
    happinessGain: 10,
    healthGain: 2,
    eatingDurationSec: 3,
  },
  {
    id: 'grain_mix',
    name: 'Зерновая смесь',
    description: 'Овсяные хлопья, просо и пшеница. Сытный сбалансированный обед.',
    icon: '🌾',
    hungerGain: 35,
    happinessGain: 15,
    healthGain: 5,
    eatingDurationSec: 5,
  },
  {
    id: 'apple_slice',
    name: 'Сочное яблоко',
    description: 'Свежий ломтик фрукта. Богат витаминами и отлично поднимает настроение.',
    icon: '🍎',
    hungerGain: 25,
    happinessGain: 25,
    healthGain: 10,
    eatingDurationSec: 4,
  },
  {
    id: 'drops_treat',
    name: 'Йогуртовые дропсы',
    description: 'Царское лакомство для грызунов. Максимальное счастье и целебный эффект!',
    icon: '🍓',
    hungerGain: 45,
    happinessGain: 40,
    healthGain: 20,
    eatingDurationSec: 6,
  },
];
