import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hamster.diogen',
  appName: 'Хомячок Диоген',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_hamster',
      iconColor: '#181425',
      sound: 'beep.wav',
    },
  },
};

export default config;
