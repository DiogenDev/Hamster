/**
 * ============================================================================
 * МОДУЛЬ: ПРЕСЕТЫ 6 ТЕМ ОФОРМЛЕНИЯ ПРИЛОЖЕНИЯ (Theme Presets)
 * ============================================================================
 */

import { AppTheme, AppThemeId } from '@/types/hamster';

export const APP_THEMES: Record<AppThemeId, AppTheme> = {
  retro_arcade: {
    id: 'retro_arcade',
    name: 'Ретро Аркада',
    nameEn: 'Retro Arcade',
    icon: '👾',
    bodyBg: 'radial-gradient(circle at center, #262b44 0%, #181425 100%)',
    consoleBg: '#3a4466',
    consoleBorder: '#181425',
    cardBg: '#262b44',
    headerColor: '#fee761',
    accentColor: '#63c74d',
  },
  gameboy_classic: {
    id: 'gameboy_classic',
    name: 'GameBoy 1989',
    nameEn: 'GameBoy Classic',
    icon: '🎮',
    bodyBg: 'radial-gradient(circle at center, #8b956d 0%, #4f5a3b 100%)',
    consoleBg: '#8bac0f',
    consoleBorder: '#0f380f',
    cardBg: '#306230',
    headerColor: '#0f380f',
    accentColor: '#9bbc0f',
  },
  cyberpunk_neon: {
    id: 'cyberpunk_neon',
    name: 'Кибер Неон',
    nameEn: 'Cyberpunk Neon',
    icon: '⚡',
    bodyBg: 'radial-gradient(circle at center, #16122c 0%, #080612 100%)',
    consoleBg: '#181236',
    consoleBorder: '#00f5d4',
    cardBg: '#251b4e',
    headerColor: '#00f5d4',
    accentColor: '#ff007f',
  },
  cozy_autumn: {
    id: 'cozy_autumn',
    name: 'Уютный Кофе',
    nameEn: 'Cozy Coffee',
    icon: '☕',
    bodyBg: 'radial-gradient(circle at center, #3d2319 0%, #1e110b 100%)',
    consoleBg: '#4f3024',
    consoleBorder: '#27160f',
    cardBg: '#382017',
    headerColor: '#f4a261',
    accentColor: '#e76f51',
  },
  pastel_dream: {
    id: 'pastel_dream',
    name: 'Пастель Зефир',
    nameEn: 'Pastel Dream',
    icon: '🌸',
    bodyBg: 'radial-gradient(circle at center, #352847 0%, #1a1424 100%)',
    consoleBg: '#4a3b61',
    consoleBorder: '#241a33',
    cardBg: '#372b49',
    headerColor: '#ffcad4',
    accentColor: '#b5e2fa',
  },
  midnight_synth: {
    id: 'midnight_synth',
    name: 'Synthwave Полночь',
    nameEn: 'Midnight Synthwave',
    icon: '🌆',
    bodyBg: 'radial-gradient(circle at center, #240e3d 0%, #0c0417 100%)',
    consoleBg: '#331557',
    consoleBorder: '#ff007f',
    cardBg: '#230a40',
    headerColor: '#ff007f',
    accentColor: '#fee440',
  },
};
