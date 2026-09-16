/**
 * ============================================================================
 * ELECTRON MAIN PROCESS: electron/main.js
 * ============================================================================
 * Главный процесс для Windows-версии игры "Хомячок Диоген".
 * Поддерживает:
 * 1. Обычное окно игры.
 * 2. Режим "Хомячок на рабочем столе" (прозрачный, без рамок, поверх всех окон).
 * 3. Режим "Интерактивные обои рабочего стола".
 * 4. Системный трей и автозагрузку Windows.
 * 5. Нативные Windows Toast-уведомления.
 * ============================================================================
 */

const { app, BrowserWindow, ipcMain, screen, Tray, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

// Идентификатор приложения для Windows Toast-уведомлений
if (process.platform === 'win32') {
  app.setAppUserModelId('com.hamster.diogen');
}

let mainWindow = null;
let petWindow = null;
let wallpaperWindow = null;
let tray = null;
let currentMode = 'normal'; // 'normal' | 'pet' | 'wallpaper'

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

function getAppUrl(queryParams = '') {
  if (isDev) {
    return `http://localhost:3002/${queryParams ? '?' + queryParams : ''}`;
  }
  const indexPath = path.join(__dirname, '..', 'out', 'index.html');
  return `file://${indexPath}${queryParams ? '?' + queryParams : ''}`;
}

/**
 * Создание главного полноразмерного окна игры
 */
function createMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const winW = Math.min(1100, Math.round(screenW * 0.85));
  const winH = Math.min(880, Math.round(screenH * 0.9));

  mainWindow = new BrowserWindow({
    width: winW,
    height: winH,
    minWidth: 700,
    minHeight: 550,
    title: 'Хомячок Диоген (Пиксельный 2D Тамагочи)',
    backgroundColor: '#181425',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(getAppUrl('mode=normal'));

  mainWindow.on('close', (e) => {
    // Если включен режим питомца на рабочем столе, скрываем главное окно вместо выхода
    if (currentMode === 'pet') {
      e.preventDefault();
      mainWindow.hide();
    } else {
      mainWindow = null;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Создание прозрачного окна питомца на рабочем столе (Desktop Pet / Shimeji)
 */
function createPetWindow() {
  if (petWindow) {
    petWindow.show();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  const petW = 200;
  const petH = 180;
  // Располагаем внизу экрана над панелью задач
  const initX = Math.round(workArea.x + workArea.width - petW - 80);
  const initY = Math.round(workArea.y + workArea.height - petH - 10);

  petWindow = new BrowserWindow({
    width: petW,
    height: petH,
    x: initX,
    y: initY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  petWindow.setAlwaysOnTop(true, 'screen-saver');
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  petWindow.loadURL(getAppUrl('mode=pet'));

  petWindow.on('closed', () => {
    petWindow = null;
  });
}

/**
 * Создание окна интерактивных обоев рабочего стола
 */
function createWallpaperWindow() {
  if (wallpaperWindow) {
    wallpaperWindow.show();
    return;
  }

  const { width, height } = screen.getPrimaryDisplay().bounds;

  wallpaperWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    type: 'desktop',
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  wallpaperWindow.loadURL(getAppUrl('mode=wallpaper'));

  wallpaperWindow.on('closed', () => {
    wallpaperWindow = null;
  });
}

/**
 * Переключение между режимами
 */
function switchAppMode(mode) {
  currentMode = mode;

  if (mode === 'normal') {
    if (petWindow) petWindow.hide();
    if (wallpaperWindow) wallpaperWindow.hide();
    createMainWindow();
    mainWindow.show();
    mainWindow.focus();
  } else if (mode === 'pet') {
    if (mainWindow) mainWindow.hide();
    if (wallpaperWindow) wallpaperWindow.hide();
    createPetWindow();
    petWindow.show();
  } else if (mode === 'wallpaper') {
    if (mainWindow) mainWindow.hide();
    if (petWindow) petWindow.hide();
    createWallpaperWindow();
    wallpaperWindow.show();
  }

  updateTrayMenu();
}

/**
 * Создание системного трея (иконки возле часов)
 */
function createSystemTray() {
  // Используем дефолтную иконку или фавикон
  const iconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
  const validIcon = fs.existsSync(iconPath) ? iconPath : path.join(__dirname, 'tray_icon.png');

  try {
    tray = new Tray(validIcon);
    tray.setToolTip('Хомячок Диоген');
    updateTrayMenu();

    tray.on('double-click', () => {
      switchAppMode('normal');
    });
  } catch (err) {
    console.warn('[Tray] Не удалось создать трей:', err);
  }
}

function updateTrayMenu() {
  if (!tray) return;

  const isAutostart = app.getLoginItemSettings().openAtLogin;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🐹 Хомячок Диоген',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Обычное окно',
      type: 'radio',
      checked: currentMode === 'normal',
      click: () => switchAppMode('normal'),
    },
    {
      label: 'Хомячок на рабочем столе',
      type: 'radio',
      checked: currentMode === 'pet',
      click: () => switchAppMode('pet'),
    },
    {
      label: 'Живые обои рабочего стола',
      type: 'radio',
      checked: currentMode === 'wallpaper',
      click: () => switchAppMode('wallpaper'),
    },
    { type: 'separator' },
    {
      label: 'Запускать вместе с Windows',
      type: 'checkbox',
      checked: isAutostart,
      click: (item) => {
        app.setLoginItemSettings({
          openAtLogin: item.checked,
          path: process.execPath,
        });
      },
    },
    { type: 'separator' },
    {
      label: 'Закрыть игру',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

// ----------------------------------------------------------------------------
// IPC ОБРАБОТЧИКИ
// ----------------------------------------------------------------------------

ipcMain.on('set-mode', (_event, mode) => {
  switchAppMode(mode);
});

ipcMain.on('open-main-window', () => {
  switchAppMode('normal');
});

ipcMain.on('move-pet-window', (_event, { deltaX, deltaY }) => {
  if (!petWindow) return;
  const [x, y] = petWindow.getPosition();
  petWindow.setPosition(Math.round(x + deltaX), Math.round(y + deltaY));
});

ipcMain.on('set-pet-window-pos', (_event, { x, y }) => {
  if (!petWindow) return;
  petWindow.setPosition(Math.round(x), Math.round(y));
});

ipcMain.handle('set-autostart', (_event, enable) => {
  app.setLoginItemSettings({
    openAtLogin: !!enable,
    path: process.execPath,
  });
  updateTrayMenu();
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle('get-autostart', () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on('show-notification', (_event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Хомячок Диоген',
      body: body || '',
      icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    }).show();
  }
});

// ----------------------------------------------------------------------------
// ЖИЗНЕННЫЙ ЦИКЛ ПРИЛОЖЕНИЯ
// ----------------------------------------------------------------------------

app.whenReady().then(() => {
  createMainWindow();
  createSystemTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // На Windows выходим, если не в режиме питомца
  if (currentMode !== 'pet' && process.platform !== 'darwin') {
    app.quit();
  }
});
