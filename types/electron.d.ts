export interface ElectronAPI {
  isElectron: boolean;
  setMode: (mode: 'normal' | 'pet' | 'wallpaper') => void;
  onModeChange: (callback: (mode: 'normal' | 'pet' | 'wallpaper') => void) => () => void;
  openMainWindow: () => void;
  movePetWindow: (deltaX: number, deltaY: number) => void;
  setPetWindowPos: (x: number, y: number) => void;
  setAutostart: (enable: boolean) => Promise<boolean>;
  getAutostart: () => Promise<boolean>;
  showNotification: (title: string, body: string) => void;
  minimizeWindow: () => void;
  closeWindow: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
