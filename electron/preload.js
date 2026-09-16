/**
 * ============================================================================
 * ELECTRON PRELOAD: electron/preload.js
 * ============================================================================
 * Безопасный мост между веб-приложением и нативными функциями Windows.
 * ============================================================================
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  
  // Управление режимами Windows
  setMode: (mode) => ipcRenderer.send('set-mode', mode),
  onModeChange: (callback) => {
    const handler = (_event, mode) => callback(mode);
    ipcRenderer.on('mode-change', handler);
    return () => ipcRenderer.removeListener('mode-change', handler);
  },
  
  // Разворачивание главного окна из режима питомца
  openMainWindow: () => ipcRenderer.send('open-main-window'),

  // Перемещение окна питомца на рабочем столе (drag & drop)
  movePetWindow: (deltaX, deltaY) => ipcRenderer.send('move-pet-window', { deltaX, deltaY }),
  
  // Позиционирование питомца
  setPetWindowPos: (x, y) => ipcRenderer.send('set-pet-window-pos', { x, y }),

  // Автозагрузка Windows
  setAutostart: (enable) => ipcRenderer.invoke('set-autostart', enable),
  getAutostart: () => ipcRenderer.invoke('get-autostart'),

  // Нативные Windows Toast-уведомления
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),
  
  // Закрытие / сворачивание
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
});
