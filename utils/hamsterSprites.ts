/**
 * ============================================================================
 * МОДУЛЬ: 20 ДИЗАЙНЕРСКИХ ПАЛИТР И СПРАЙТЫ ХОМЯКА-БУХАНОЧКИ (Horizontal Loaf)
 * ============================================================================
 * 
 * 🎓 ИНТЕРАКТИВНЫЙ УЧЕБНИК: АНАТОМИЯ ГОРИЗОНТАЛЬНОГО ХОМЯКА
 * ----------------------------------------------------------------------------
 * 1. ПОЧЕМУ ХОМЯК ДОЛЖЕН БЫТЬ ВЫТЯНУТ В ШИРИНУ:
 *    Настоящие хомячки при ходьбе и сидении не стоят вертикально, как суслики,
 *    а представляют собой приземистый горизонтальный овал (форму батончика или буханочки,
 *    "hamster loaf").
 *    - Ширина тела: 22-23 пикселя.
 *    - Высота тела: всего 10-12 пикселей (с лапками и ушками ~14-15 пикселей).
 *    - Низкая посадка к опилкам, плавный изгиб спины, маленькие лапки снизу.
 * ============================================================================
 */


import { HamsterPalette, FoodItem } from '@/types/hamster';


export const HAMSTER_PALETTES: HamsterPalette[] = [
  {
    id: 'classic_golden',
    name: 'Золотистый сириец',
    nameEn: 'Classic Golden',
    description: 'Классический пушистый золотисто-рыжий окрас со светлым животиком.',
    fur: '#e8912f',
    furDark: '#8f4a0a',
    furLight: '#ffc27a',
    belly: '#fff4d6',
    pink: '#f9c0d3',
    eyes: '#1a1a1a',
    eyeHighlight: '#ffffff',
    cheeks: '#ff8fa8',
    paws: '#ffd0d9',
  },
  {
    id: 'roborovski_sand',
    name: 'Песочный Роборовского',
    nameEn: 'Roborovski Sand',
    description: 'Нежный песочно-палевый оттенок крошечного пустынного хомячка.',
    fur: '#e3bc82',
    furDark: '#9a7440',
    furLight: '#fae6c8',
    belly: '#fdf7ee',
    pink: '#f9dade',
    eyes: '#221c15',
    eyeHighlight: '#ffffff',
    cheeks: '#f2b4bb',
    paws: '#fdece2',
  },
  {
    id: 'albino_snow',
    name: 'Белоснежный альбинос',
    nameEn: 'Albino Snow',
    description: 'Ослепительно белая шубка с рубиново-красными глазками.',
    fur: '#f7f7f5',
    furDark: '#d8d8d4',
    furLight: '#ffffff',
    belly: '#ffffff',
    pink: '#ffd0d8',
    eyes: '#d61f4e',
    eyeHighlight: '#ff8fa0',
    cheeks: '#ffb6c4',
    paws: '#ffe8ee',
  },
  {
    id: 'panda_piebald',
    name: 'Черно-белый панда',
    nameEn: 'Panda Piebald',
    description: 'Контрастный пятнистый окрас с темной маской и белым тельцем.',
    fur: '#2c2f45',
    furDark: '#15172a',
    furLight: '#5a5f7f',
    belly: '#f0f4f7',
    pink: '#ffc2b5',
    eyes: '#0d0d0d',
    eyeHighlight: '#ffffff',
    cheeks: '#fcd9d2',
    paws: '#faf0ed',
  },
  {
    id: 'caramel_cream',
    name: 'Теплый карамельный',
    nameEn: 'Caramel Cream',
    description: 'Аппетитный мягкий оттенок ириски с кремовым подшерстком.',
    fur: '#c98d5b',
    furDark: '#7c481e',
    furLight: '#f2c69c',
    belly: '#ffe9d8',
    pink: '#f8ccd2',
    eyes: '#321c10',
    eyeHighlight: '#ffffff',
    cheeks: '#f5aeb9',
    paws: '#fedbb9',
  },
  {
    id: 'charcoal_dark',
    name: 'Глубокий угольный',
    nameEn: 'Charcoal Dark',
    description: 'Загадочный антрацитовый окрас с серебристым отливом.',
    fur: '#3b3b3e',
    furDark: '#1b1b1e',
    furLight: '#6d6d74',
    belly: '#68686c',
    pink: '#dbb8bc',
    eyes: '#000000',
    eyeHighlight: '#ffffff',
    cheeks: '#a87484',
    paws: '#92929a',
  },
  {
    id: 'cinnamon',
    name: 'Коричный',
    nameEn: 'Cinnamon',
    description: 'Пряный коричневато-медный цвет корицы с бежевым брюшком.',
    fur: '#a45730',
    furDark: '#61290b',
    furLight: '#db8656',
    belly: '#f7e0b6',
    pink: '#eab8bc',
    eyes: '#3d1a0a',
    eyeHighlight: '#ffffff',
    cheeks: '#d4868e',
    paws: '#f0dbc6',
  },
  {
    id: 'lilac_mist',
    name: 'Дымчато-сиреневый',
    nameEn: 'Lilac Mist',
    description: 'Благородный пепельно-лавандовый оттенок с мягким градиентом.',
    fur: '#a0858d',
    furDark: '#5e484e',
    furLight: '#d4bfc5',
    belly: '#f7c0c9',
    pink: '#ffcad4',
    eyes: '#2e1f27',
    eyeHighlight: '#ffffff',
    cheeks: '#e2856a',
    paws: '#ffe7db',
  },
  {
    id: 'silver_pearl',
    name: 'Серебристый жемчуг',
    nameEn: 'Silver Pearl',
    description: 'Светло-серый шелковистый окрас с мерцающей белой грудкой.',
    fur: '#b9c1ca',
    furDark: '#77828f',
    furLight: '#e8edf2',
    belly: '#f2f6f9',
    pink: '#fad6df',
    eyes: '#222831',
    eyeHighlight: '#ffffff',
    cheeks: '#f4aebe',
    paws: '#eceff2',
  },
  {
    id: 'blue_sapphire',
    name: 'Сапфировый джунгарик',
    nameEn: 'Blue Sapphire',
    description: 'Холодный серо-голубой окрас джунгарского хомячка.',
    fur: '#6f8098',
    furDark: '#3b4859',
    furLight: '#a9bcd5',
    belly: '#e0e8f0',
    pink: '#e8bcc6',
    eyes: '#1a2530',
    eyeHighlight: '#ffffff',
    cheeks: '#d690a2',
    paws: '#cdd8e4',
  },
  {
    id: 'chocolate_brown',
    name: 'Шоколадный брауни',
    nameEn: 'Chocolate Brown',
    description: 'Глубокий цвет темного шоколада с карамельной грудкой.',
    fur: '#5e3c22',
    furDark: '#30190a',
    furLight: '#9d663c',
    belly: '#d8a677',
    pink: '#e4987b',
    eyes: '#1e0f06',
    eyeHighlight: '#ffffff',
    cheeks: '#de6f59',
    paws: '#e7cdb4',
  },
  {
    id: 'argente_red',
    name: 'Оранжево-песочный',
    nameEn: 'Argente Red',
    description: 'Яркий персиково-апельсиновый оттенок шерсти с карими глазами.',
    fur: '#e87355',
    furDark: '#9c371e',
    furLight: '#fca489',
    belly: '#ffe9d8',
    pink: '#f5a76a',
    eyes: '#491b1d',
    eyeHighlight: '#ffffff',
    cheeks: '#eac46b',
    paws: '#f8eee9',
  },
  {
    id: 'honey_gold',
    name: 'Медовый янтарь',
    nameEn: 'Honey Gold',
    description: 'Теплый солнечный янтарно-желтый цвет летнего меда.',
    fur: '#f5a465',
    furDark: '#ad591e',
    furLight: '#ffd6ae',
    belly: '#fff2d3',
    pink: '#fcc6bf',
    eyes: '#381e05',
    eyeHighlight: '#ffffff',
    cheeks: '#e87355',
    paws: '#fde9cf',
  },
  {
    id: 'rust_orange',
    name: 'Рыжий кирпичный',
    nameEn: 'Rust Orange',
    description: 'Насыщенный осенний рыжий окрас пушистого зверька.',
    fur: '#d65602',
    furDark: '#7d2e00',
    furLight: '#ff964c',
    belly: '#fdedd2',
    pink: '#eebd9b',
    eyes: '#2c1200',
    eyeHighlight: '#ffffff',
    cheeks: '#e79c6a',
    paws: '#fbdcd7',
  },
  {
    id: 'dove_grey',
    name: 'Голубино-серый',
    nameEn: 'Dove Grey',
    description: 'Умиротворяющий матовый дымчатый цвет голубиного пера.',
    fur: '#8f9bb0',
    furDark: '#4c5565',
    furLight: '#c5d1e6',
    belly: '#eff3f5',
    pink: '#e9b8bc',
    eyes: '#2b2d42',
    eyeHighlight: '#ffffff',
    cheeks: '#db8a96',
    paws: '#dae4de',
  },
  {
    id: 'mink_soft',
    name: 'Норковый бежевый',
    nameEn: 'Mink Soft',
    description: 'Элегантный бежевый цвет шелковой норки с мягким свечением.',
    fur: '#b99eef',
    furDark: '#6e4cb2',
    furLight: '#e2d4ff',
    belly: '#f5eeff',
    pink: '#f9bfd4',
    eyes: '#281a40',
    eyeHighlight: '#ffffff',
    cheeks: '#ec84fd',
    paws: '#efe9f8',
  },
  {
    id: 'copper_glow',
    name: 'Медно-красный',
    nameEn: 'Copper Glow',
    description: 'Сияющий металлический медно-бронзовый цвет шерстки.',
    fur: '#ba5f39',
    furDark: '#6b2c12',
    furLight: '#f29874',
    belly: '#fbd5bb',
    pink: '#e79e8c',
    eyes: '#3b160a',
    eyeHighlight: '#ffffff',
    cheeks: '#cd5b44',
    paws: '#f6c8ac',
  },
  {
    id: 'ivory_white',
    name: 'Слоновая кость',
    nameEn: 'Ivory White',
    description: 'Мягкий сливочно-белый оттенок с темными глазками.',
    fur: '#fffbe2',
    furDark: '#bab284',
    furLight: '#ffffff',
    belly: '#ffffff',
    pink: '#fcc6ad',
    eyes: '#1e1e1e',
    eyeHighlight: '#ffffff',
    cheeks: '#f8afa0',
    paws: '#fbeed0',
  },
  {
    id: 'obsidian_onyx',
    name: 'Глянцевый оникс',
    nameEn: 'Obsidian Onyx',
    description: 'Смоляной черный мех с белыми перчатками на лапках.',
    fur: '#1b1b20',
    furDark: '#09090b',
    furLight: '#4a4a56',
    belly: '#2c2c33',
    pink: '#ffa2c0',
    eyes: '#000000',
    eyeHighlight: '#26e5ff',
    cheeks: '#ea1f63',
    paws: '#ffffff',
  },
  {
    id: 'cyber_rainbow',
    name: 'Party Cyber / Неон',
    nameEn: 'Party Cyber / Neon',
    description: 'Секретный киберпанк окрас с неоновой бирюзой и фуксией.',
    fur: '#00f2d4',
    furDark: '#0077b6',
    furLight: '#7fffef',
    belly: '#ffe94f',
    pink: '#f15bb5',
    eyes: '#9b5de5',
    eyeHighlight: '#ffffff',
    cheeks: '#ff0a72',
    paws: '#00f5d4',
  },
];


/**
 * ============================================================================
 * 24x24 МАТРИЦЫ ХОМЯЧКА (Adorable Chibi / Anime Hamtaro Art Style)
 * Пропорции: круглые щечки с румянцем, выразительные блестящие глазки,
 * шелковистая округлая спинка, аккуратные ушки с розовой серединкой,
 * крошечный хвостик-пуговка и миниатюрные лапки (опора на пол на строке 21).
 * ============================================================================
 */


// Base 1: Clean Idle 1 (open sparkling eye)
export const HAMSTER_24_IDLE_1 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3: ear tips
  '...........DPPD..DPPD...', // 4: round pink cups
  '...........DPPD..DPPD...', // 5: ear cups
  '..........DDFFFFFFFFFFD.', // 6: ears merge into head crown
  '........DDFFFFFFFFFFFFD.', // 7: smooth high arched back
  '......DDLLLFFFFFFFFFFD..', // 8: back highlight band
  '....DDLLLLLLFFFFFHEEFFD.', // 9: glossy anime eye with catchlight H
  '...DLLLLFFFFFFFFFEEEFFPD', // 10: pupil + cute pink nose P
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11: muzzle
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12: white cheek with blush CC
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13: chubby cheek
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14: clean white chest
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15: white belly
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16: tail nub DPD on rump
  'DPDFFFFFFFFFFFBBBBBBBFFD', // 17: belly curve
  '.DFFFFFFFFFFFFFFFFFFFD..', // 18: underbelly
  '..DFFFFFFFFFFFFFFFFDFD..', // 19: leg base
  '...DDFFFFDD..DDFFFFDFD..', // 20: legs
  '....DPPPDD....DPPPDD....', // 21: paws resting on floor
  '........................', // 22
  '........................', // 23
];


// Base 2: Clean Idle 2 (peaceful blinking ^^ / breathing)
export const HAMSTER_24_IDLE_2 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3: ear tips
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFDDDFFD.', // 9: closed winking eye DDD
  '...DLLLLFFFFFFFFFDDDFFPD', // 10: cute closed eye curve, nose P
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16: tail
  'DPDFFFFFFFFFFFBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFD..', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: floor
  '........................', // 22
  '........................', // 23
];


// WALK 1: Waddling stride A (rear leg back, front leg forward)
export const HAMSTER_24_WALK_1 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3: ear tips
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFHEEFFD.', // 9
  '...DLLLLFFFFFFFFFEEEFFPD', // 10
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16
  'DPDFFFFFFFFFFFBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFD..', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '..DDFFFFDD....DDFFFFDFD.', // 20: shifted stride
  '...DPPPDD......DPPPDD...', // 21: floor
  '........................', // 22
  '........................', // 23
];


// WALK 2: Passing phase (paws together)
export const HAMSTER_24_WALK_2 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFHEEFFD.', // 9
  '...DLLLLFFFFFFFFFEEEFFPD', // 10
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16
  'DPDFFFFFFFFFFFBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFD..', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '....DDFFFFDDDDFFFFDDDFD.', // 20: paws centered
  '.....DPPPDD..DPPPDD.....', // 21: floor
  '........................', // 22
  '........................', // 23
];


// WALK 3: Waddling stride B (rear leg forward, front leg back)
export const HAMSTER_24_WALK_3 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFHEEFFD.', // 9
  '...DLLLLFFFFFFFFFEEEFFPD', // 10
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16
  'DPDFFFFFFFFFFFBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFD..', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '.....DDFFFFDD..DDFFFFDFD', // 20: opposite stride
  '......DPPPDD..DPPPDD....', // 21: floor
  '........................', // 22
  '........................', // 23
];


export const HAMSTER_24_WALK_4 = HAMSTER_24_WALK_2;


// WHEEL 1: Fast running sprint in wheel
export const HAMSTER_24_WHEEL_1 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '........................', // 3
  '..........DD....DD......', // 4: ears pinned back
  '.........DPPD..DPPD.....', // 5
  '.........DPPD..DPPD.....', // 6
  '........DDFFFFFFFFFFD...', // 7
  '......DDFFFFFFFFFFFFD...', // 8: streamlined back
  '....DDLLLFFFFFFFFFFD....', // 9
  '..DDLLLLLLFFFFFHEEFFD...', // 10
  '.DLLLLFFFFFFFFFEEEFFPD..', // 11
  'DLLLFFFFFFFFFFFDFFFFD...', // 12
  'DFFFFFFFFFFFFFFBBBBBBCCF', // 13
  'DFFFFFFFFFFFFFBBBBBBCCFD', // 14
  '.DFFFFFFFFFFFBBBBBBBBFFD', // 15
  'DPDFFFFFFFFFBBBBBBBBBFFD', // 16
  'DPDFFFFFFFFFBBBBBBDPPD..', // 17
  '.DFFFFFFFFFFFFFFFFDPPD..', // 18
  '..DDFFFFDD....DDFFDFD...', // 19
  '.DPPPDD........DPPPDD...', // 20: outstretched running paws
  '.DPPD............DPPD...', // 21
  '........................', // 22
  '........................', // 23
];


// WHEEL 2: Fast running stride tucked
export const HAMSTER_24_WHEEL_2 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '........................', // 3
  '..........DD....DD......', // 4
  '.........DPPD..DPPD.....', // 5
  '.........DPPD..DPPD.....', // 6
  '........DDFFFFFFFFFFD...', // 7
  '......DDFFFFFFFFFFFFD...', // 8
  '....DDLLLFFFFFFFFFFD....', // 9
  '..DDLLLLLLFFFFFHEEFFD...', // 10
  '.DLLLLFFFFFFFFFEEEFFPD..', // 11
  'DLLLFFFFFFFFFFFDFFFFD...', // 12
  'DFFFFFFFFFFFFFFBBBBBBCCF', // 13
  'DFFFFFFFFFFFFFBBBBBBCCFD', // 14
  '.DFFFFFFFFFFFBBBBBBBBFFD', // 15
  'DPDFFFFFFFFFBBBBBBBBBFFD', // 16
  'DPDFFFFFFFFFBBBBBBDPPD..', // 17
  '.DFFFFFFFFFFFFFFFFDPPD..', // 18
  '...DDFFFFDD..DDFFDFD....', // 19
  '.....DPPPDD..DPPPDD.....', // 20: tucked running paws
  '......DPPD....DPPD......', // 21
  '........................', // 22
  '........................', // 23
];


// GROOM 1: Sitting back, washing cheeks with tiny hands
export const HAMSTER_24_GROOM_1 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3: ear tips
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFDDDFFD.', // 9: happy closed eyes ^^
  '...DLLLLFFFFFFFFFDDDFFPD', // 10: nose
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFBBDPPDCFD', // 12: tiny paw DPPD washing cheek!
  '.DFFFFFFFFFFFFFBBDPPDCFD', // 13: rubbing cheeks
  '.DFFFFFFFFFFFFFBBBBBBFFD', // 14
  '.DFFFFFFFFFFFBBBBBBBBFFD', // 15
  'DPDFFFFFFFFFBBBBBBBBBFFD', // 16: tail
  'DPDFFFFFFFFFBBBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20: back legs
  '....DPPPDD....DPPPDD....', // 21: floor row 21
  '........................', // 22
  '........................', // 23
];


// GROOM 2: Washing ears with tiny hands
export const HAMSTER_24_GROOM_2 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '...........DPPD..DPPD...', // 3: hands DPPD up touching ears!
  '..........DPPPDD.DPPPDD.', // 4: grooming ears
  '...........DPPFDDDPPFD..', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFDDDFFD.', // 9: happy eyes
  '...DLLLLFFFFFFFFFDDDFFPD', // 10
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: floor
  '........................', // 22
  '........................', // 23
];


// SNIFF 1: Snout down curious sniffing
export const HAMSTER_24_SNIFF_1 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3: ears tilted
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFHEEFFD.', // 9: curious eye
  '...DLLLLFFFFFFFFFEEEFFD.', // 10
  '..DLLLFFFFFFFFFFFDFFFFPD', // 11: nose P sniffing down!
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12: blush
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16
  'DPDFFFFFFFFFFFBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFD..', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: floor
  '........................', // 22
  '........................', // 23
];


// EAT 1: Holding sunflower seed 'S' in tiny hands
export const HAMSTER_24_EAT_1 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFHEEFFD.', // 9: shiny eye looking at seed
  '...DLLLLFFFFFFFFFEEEFFPD', // 10: nose
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFSSSSBCCF', // 12: sunflower seed 'SSSS'
  '.DFFFFFFFFFFFFFFSSSSBCCF', // 13: seed held in paws
  '.DFFFFFFFFFFFFFFDPPDFFFD', // 14: paws DPPD holding seed
  '.DFFFFFFFFFFFBBBBBBBBFFD', // 15
  'DPDFFFFFFFFFBBBBBBBBBFFD', // 16
  'DPDFFFFFFFFFBBBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: floor row 21
  '........................', // 22
  '........................', // 23
];


// EAT 2: Chewing seed (happy closed eyes, munching)
export const HAMSTER_24_EAT_2 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFDDDFFD.', // 9: happy closed eyes ^^
  '...DLLLLFFFFFFFFFDDDFFPD', // 10
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFFSSSBCCF', // 12: seed nibble
  '.DFFFFFFFFFFFFFFSSSSBCCF', // 13
  '.DFFFFFFFFFFFFFFDPPDFFFD', // 14: paws holding seed
  '.DFFFFFFFFFFFBBBBBBBBFFD', // 15: puffed cheeks
  'DPDFFFFFFFFFBBBBBBBBBFFD', // 16
  'DPDFFFFFFFFFBBBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: floor
  '........................', // 22
  '........................', // 23
];


// SLEEP 1: Curled up sweet mochi ball
export const HAMSTER_24_SLEEP_1 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '........................', // 3
  '........................', // 4
  '........................', // 5
  '........................', // 6
  '........................', // 7
  '...........DD.....DD....', // 8: relaxed folded ears
  '..........DPPD...DPPD...', // 9: pink ear tips
  '......DDFFFFFFFFFFFD....', // 10: rounded head/neck
  '....DDLLLLFFFFFFFFFFFD..', // 11: smooth arched back
  '..DDLLLLLLFFFFFFFFFFFD..', // 12: fluffy back arch
  '.DLLLLFFFFFFFFFFFDDDFD..', // 13: peaceful closed eye curve
  'DFFFFFFFFFFFFFFFFDDDFPPD', // 14: sweet tucked nose
  'DPDFFFFFFFFFFFFBBBBBDFFD', // 15: tail nub + white cheek
  'DPDFFFFFFFFFFBBBBBBBCCFD', // 16: soft blush
  '.DFFFFFFFFFBBBBBBBBBBFFD', // 17: chubby round tummy
  '..DFFFFFFFFFBBBBBBBBFFD.', // 18: tucked paws
  '...DFFFFFFFBBBBBBBDFD...', // 19: cozy body resting
  '....DDFFFFFBBBBBDDFD....', // 20: warm belly against bedding
  '......DDDDDDDDDDDD......', // 21: resting on bedding (row 21)
  '........................', // 22
  '........................', // 23
];


// SLEEP 2: Breathing gently
export const HAMSTER_24_SLEEP_2 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '........................', // 3
  '........................', // 4
  '........................', // 5
  '........................', // 6
  '...........DD.....DD....', // 7: lifted 1px breath
  '..........DPPD...DPPD...', // 8
  '......DDFFFFFFFFFFFD....', // 9
  '....DDLLLLFFFFFFFFFFFD..', // 10
  '..DDLLLLLLFFFFFFFFFFFD..', // 11
  '.DLLLLFFFFFFFFFFFDDDFD..', // 12: peaceful eye
  'DFFFFFFFFFFFFFFFFDDDFPPD', // 13: tucked nose
  'DPDFFFFFFFFFFFFBBBBBDFFD', // 14: white cheek
  'DPDFFFFFFFFFFBBBBBBBCCFD', // 15: soft blush
  '.DFFFFFFFFFBBBBBBBBBBFFD', // 16: rounded tummy
  '..DFFFFFFFFFBBBBBBBBFFD.', // 17
  '...DFFFFFFFBBBBBBBDFD...', // 18
  '....DDFFFFFBBBBBDDFD....', // 19
  '.....DDFFFFFBBBDDFD.....', // 20
  '......DDDDDDDDDDDD......', // 21: resting on bedding
  '........................', // 22
  '........................', // 23
];


// LAYING: Relaxed flat loaf
export const HAMSTER_24_LAYING = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3: relaxed ears
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDFFFFFFFFFFFFFD..', // 8: flat low back
  '....DDFFFFFFFFFFFHEEFFD.', // 9: calm eye
  '...DFFFFFFFFFFFFFEEEFFPD', // 10: nose
  '..DFFFFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12: blush
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16: tail + chest flat on bedding
  'DPDFFFFFFFFFFFBBBBBBBFFD', // 17
  '.DFFFFFFFFFFFFFFFFFFFD..', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '..DDFFFFDD....DDFFFFDFD.', // 20: splayed legs
  '...DPPPDD......DPPPDD...', // 21: floor
  '........................', // 22
  '........................', // 23
];


// POOPING: Straining cute face >_<
export const HAMSTER_24_POOPING = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFDFDFFD.', // 9: squeezed shut eyes >_<
  '...DLLLLFFFFFFFFFDDDFFPD', // 10: nose
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12: blush
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16: tail up
  'DPDFFFFFFFFFFFBBBBBDPPD.', // 17: braced paws
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: floor
  '........................', // 22
  '........................', // 23
];


// DRINK 1: Reaching up to water droplet 'J'
export const HAMSTER_24_DRINK_1 = [
  '........................', // 0
  '........................', // 1
  '..................JJ....', // 2: water drops JJ
  '.................JJ.....', // 3
  '............DD....DD....', // 4: ears perked up
  '...........DPPD..DPPD...', // 5
  '...........DPPD..DPPD...', // 6
  '..........DDFFFFFFFFFFD.', // 7
  '........DDFFFFFFFFFFFFD.', // 8
  '......DDLLLFFFFFFFFFFD..', // 9
  '....DDLLLLLLDFFFFDHEEFD.', // 10: eye looking up at spout!
  '...DLLLLFFFFFFFFFFEEEFPD', // 11: nose reaching up!
  '..DLLLFFFFFFFFFFFFFFFFFD', // 12
  '..DFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 14
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 15
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 16
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 17: paws stretching
  'DPDFFFFFFFFFFFBBBBBBDPPD', // 18
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: standing tall on paws
  '........................', // 22
  '........................', // 23
];


// DRINK 2: Drinking water drop, happy eyes
export const HAMSTER_24_DRINK_2 = [
  '........................', // 0
  '........................', // 1
  '...................J....', // 2: drop J
  '........................', // 3
  '............DD....DD....', // 4
  '...........DPPD..DPPD...', // 5
  '...........DPPD..DPPD...', // 6
  '..........DDFFFFFFFFFFD.', // 7
  '........DDFFFFFFFFFFFFD.', // 8
  '......DDLLLFFFFFFFFFFD..', // 9
  '....DDLLLLLLFFFFFDDDFFD.', // 10: happy closed eyes drinking
  '...DLLLLFFFFFFFFFDDDFFPD', // 11: nose sipping
  '..DLLLFFFFFFFFFFFFFFFFFD', // 12
  '..DFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 14
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 15
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 16
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 17
  'DPDFFFFFFFFFFFBBBBBBDPPD', // 18
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: floor
  '........................', // 22
  '........................', // 23
];


// PLAYING 1: Joyful hop in the air!
export const HAMSTER_24_PLAYING_1 = [
  '........................', // 0
  '............DD....DD....', // 1: jumped up in the air!
  '...........DPPD..DPPD...', // 2
  '...........DPPD..DPPD...', // 3
  '..........DDFFFFFFFFFFD.', // 4
  '........DDFFFFFFFFFFFFD.', // 5
  '......DDLLLFFFFFFFFFFD..', // 6
  '....DDLLLLLLFFFFFHEEFFD.', // 7: sparkling eyes!
  '...DLLLLFFFFFFFFFEEEFFPD', // 8: happy nose
  '..DLLLFFFFFFFFFFFDFFFFD.', // 9
  '..DFFFFFFFFFFFFFBBBBBCCF', // 10: blush
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 11
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 12
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 13
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 14: tail
  'DPDFFFFFFFFFFFBBBBBBDPPD', // 15
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 16
  '..DFFFFFFFFFFFFFFFFDFD..', // 17
  '...DDFFFFDD..DDFFFFDFD..', // 18: feet tucked up
  '....DPPPDD....DPPPDD....', // 19
  '........................', // 20
  '........................', // 21: airborne!
  '........................', // 22
  '........................', // 23
];


// PLAYING 2: Landing / bouncing
export const HAMSTER_24_PLAYING_2 = [
  '........................', // 0
  '........................', // 1
  '........................', // 2
  '............DD....DD....', // 3
  '...........DPPD..DPPD...', // 4
  '...........DPPD..DPPD...', // 5
  '..........DDFFFFFFFFFFD.', // 6
  '........DDFFFFFFFFFFFFD.', // 7
  '......DDLLLFFFFFFFFFFD..', // 8
  '....DDLLLLLLFFFFFDDDFFD.', // 9: happy closed eyes ^^
  '...DLLLLFFFFFFFFFDDDFFPD', // 10
  '..DLLLFFFFFFFFFFFDFFFFD.', // 11
  '..DFFFFFFFFFFFFFBBBBBCCF', // 12: blush
  '.DFFFFFFFFFFFFFFBBBBBCCF', // 13
  '.DFFFFFFFFFFFFFFBBBBBFFD', // 14
  '.DFFFFFFFFFFFFBBBBBBBBFD', // 15
  'DPDFFFFFFFFFFFBBBBBBBBFD', // 16
  'DPDFFFFFFFFFFFBBBBBBDPPD', // 17
  '.DFFFFFFFFFFFFFFFFFFFFD.', // 18
  '..DFFFFFFFFFFFFFFFFDFD..', // 19
  '...DDFFFFDD..DDFFFFDFD..', // 20
  '....DPPPDD....DPPPDD....', // 21: landing on floor
  '........................', // 22
  '........................', // 23
];


// PEEK 1 & 2: 13x12 cute face peeking from house door
export const HAMSTER_SLEEP_PEEK_1 = [
  '..DDD...DDD..', // 0: round ear tops
  '.DPPD...DPPD.', // 1: pink inner ears
  '.DPPFD.DPPFD.', // 2
  'DDFFDDDDDFFDD', // 3
  'DFFFLLLLLFFFD', // 4
  'DFHEDFFFDEHFD', // 5: big glossy eyes with catchlights H!
  'DFEEDFPDFEEFD', // 6: eyes + cute pink nose P
  'WCCFFBBBFFCCW', // 7: rosy cheeks + white muzzle + whiskers
  '.CCFBBBBBFCC.', // 8: round cheek pouches
  '.DFFFFFFFFFD.', // 9: chin
  '..DPPD.DPPD..', // 10: tiny paws on rim
  '..DPPD.DPPD..', // 11
];


export const HAMSTER_SLEEP_PEEK_2 = [
  '..DDD...DDD..', // 0
  '.DPPD...DPPD.', // 1
  '.DPPFD.DPPFD.', // 2
  'DDFFDDDDDFFDD', // 3
  'DFFFFFFFFFFFF', // 4
  'DFFFLLLLLFFFD', // 5
  'DFDDFFFFFDDFD', // 6: gentle blink / sleepy eyes
  'DFDDDFPDFDDDF', // 7
  'WCCFFBBBFFCCW', // 8
  '.CCFBBBBBFCC.', // 9
  '..DPPD.DPPD..', // 10
  '..DPPD.DPPD..', // 11
];


// Алиасы обратной совместимости
export const HAMSTER_IDLE_FRAME_1 = HAMSTER_24_IDLE_1;
export const HAMSTER_IDLE_FRAME_2 = HAMSTER_24_IDLE_2;
export const HAMSTER_WALK_FRAME_1 = HAMSTER_24_WALK_1;
export const HAMSTER_WALK_FRAME_2 = HAMSTER_24_WALK_2;
export const HAMSTER_LAYING_FRAME = HAMSTER_24_LAYING;
export const HAMSTER_SLEEP_FRAME_1 = HAMSTER_24_SLEEP_1;
export const HAMSTER_SLEEP_FRAME_2 = HAMSTER_24_SLEEP_2;
export const HAMSTER_EATING_FRAME_1 = HAMSTER_24_EAT_1;
export const HAMSTER_EATING_FRAME_2 = HAMSTER_24_EAT_2;
export const HAMSTER_POOPING_FRAME = HAMSTER_24_POOPING;
export const HAMSTER_DRINKING_FRAME_1 = HAMSTER_24_DRINK_1;
export const HAMSTER_DRINKING_FRAME_2 = HAMSTER_24_DRINK_2;


export { FOOD_ITEMS } from './foodAndDrinkPresets';
export { DRINK_ITEMS } from './foodAndDrinkPresets';
