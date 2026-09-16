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
const http = require('http');

// Идентификатор приложения для Windows Toast-уведомлений
if (process.platform === 'win32') {
  app.setAppUserModelId('com.hamster.diogen');
}

// Защита от параллельного запуска нескольких копий игры
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

let mainWindow = null;
let petWindow = null;
let wallpaperWindow = null;
let tray = null;
let currentMode = 'normal'; // 'normal' | 'pet' | 'wallpaper'

let localServer = null;
let localPort = null;

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

/**
 * Локальный легковесный HTTP-сервер для раздачи статического экспорта Next.js.
 * Решает проблему бесконечной загрузки на protocol file://, корректно отдавая
 * все chunk-скрипты, стили CSS, аудио и изображения с правильными MIME-типами.
 */
function startLocalServer() {
  return new Promise((resolve, reject) => {
    const outDir = path.join(__dirname, '..', 'out');

    localServer = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
        let pathname = decodeURIComponent(parsedUrl.pathname);

        if (pathname === '/' || pathname === '') {
          pathname = '/index.html';
        }

        let filePath = path.join(outDir, pathname);

        // Если файл не найден или это папка, пробуем index.html или отдаем корневой index.html (SPA Fallback)
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          if (fs.existsSync(filePath + '.html')) {
            filePath = filePath + '.html';
          } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
            filePath = path.join(filePath, 'index.html');
          } else {
            filePath = path.join(outDir, 'index.html');
          }
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
          }
          res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          });
          res.end(data);
        });
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: ' + err.message);
      }
    });

    localServer.listen(0, '127.0.0.1', () => {
      localPort = localServer.address().port;
      console.log(`[LocalServer] Serving ${outDir} on http://127.0.0.1:${localPort}`);
      resolve(localPort);
    });

    localServer.on('error', (err) => {
      console.error('[LocalServer] Ошибка сервера:', err);
      reject(err);
    });
  });
}

function getAppUrl(queryParams = '') {
  const query = queryParams ? (queryParams.startsWith('?') ? queryParams : '?' + queryParams) : '';
  if (isDev && !localPort) {
    return `http://localhost:3002/${query}`;
  }
  return `http://127.0.0.1:${localPort}/${query}`;
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
    show: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(getAppUrl('mode=normal'));

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer L${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Renderer ERROR] did-fail-load: ${errorCode} ${errorDescription} (${validatedURL})`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Renderer] Page finished loading successfully');
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

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
    backgroundColor: '#00000000',
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

const { execFile } = require('child_process');

function getWallpaperHelperPath() {
  const candidates = [
    path.join(process.resourcesPath || '', 'wallpaper-helper.exe'),
    path.join(__dirname, 'wallpaper-helper.exe'),
    path.join(process.cwd(), 'electron', 'wallpaper-helper.exe'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function attachWallpaperWindow() {
  if (!wallpaperWindow || process.platform !== 'win32') return;

  const helperPath = getWallpaperHelperPath();
  if (!helperPath) {
    console.warn('[Wallpaper] wallpaper-helper.exe не найден');
    return;
  }

  try {
    const hwndBuf = wallpaperWindow.getNativeWindowHandle();
    const hwnd = process.arch === 'x64'
      ? hwndBuf.readBigInt64LE(0).toString()
      : hwndBuf.readInt32LE(0).toString();

    execFile(helperPath, ['attach', hwnd], (err, stdout) => {
      if (err) {
        console.error('[Wallpaper] Ошибка закрепления под рабочий стол:', err);
      } else {
        console.log('[Wallpaper] Успешно закреплено под рабочий стол:', stdout);
      }
    });
  } catch (e) {
    console.error('[Wallpaper] Ошибка получения HWND:', e);
  }
}

/**
 * Создание окна интерактивных обоев рабочего стола
 */
function createWallpaperWindow() {
  if (wallpaperWindow) {
    attachWallpaperWindow();
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
    show: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  wallpaperWindow.loadURL(getAppUrl('mode=wallpaper'));

  wallpaperWindow.once('ready-to-show', () => {
    attachWallpaperWindow();
    wallpaperWindow.show();
  });

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
    if (wallpaperWindow) {
      wallpaperWindow.destroy();
      wallpaperWindow = null;
    }
    createMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send('mode-change', 'normal');
      mainWindow.show();
      mainWindow.focus();
    }
  } else if (mode === 'pet') {
    if (mainWindow) mainWindow.hide();
    if (wallpaperWindow) {
      wallpaperWindow.destroy();
      wallpaperWindow = null;
    }
    createPetWindow();
    if (petWindow) {
      petWindow.webContents.send('mode-change', 'pet');
      petWindow.show();
    }
  } else if (mode === 'wallpaper') {
    if (mainWindow) mainWindow.hide();
    if (petWindow) petWindow.hide();
    createWallpaperWindow();
    if (wallpaperWindow) {
      wallpaperWindow.webContents.send('mode-change', 'wallpaper');
      attachWallpaperWindow();
    }
  }

  updateTrayMenu();
}

/**
 * Создание системного трея (иконки возле часов)
 */
function createSystemTray() {
  const icoPath = path.join(__dirname, 'tray.ico');
  const pngPath = path.join(__dirname, 'tray_icon.png');
  const iconFile = fs.existsSync(icoPath) ? icoPath : (fs.existsSync(pngPath) ? pngPath : null);

  if (!iconFile) return;

  try {
    const { nativeImage } = require('electron');
    const trayIcon = nativeImage.createFromPath(iconFile);
    if (!trayIcon.isEmpty()) {
      tray = new Tray(trayIcon);
      tray.setToolTip('Хомячок Диоген');
      updateTrayMenu();

      tray.on('double-click', () => {
        switchAppMode('normal');
      });
    }
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
      icon: path.join(__dirname, 'icon.png'),
    }).show();
  }
});

// ----------------------------------------------------------------------------
// ЖИЗНЕННЫЙ ЦИКЛ ПРИЛОЖЕНИЯ
// ----------------------------------------------------------------------------

app.whenReady().then(async () => {
  try {
    await startLocalServer();
  } catch (err) {
    console.error('[App] Ошибка запуска локального сервера:', err);
  }

  createMainWindow();
  createSystemTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('before-quit', () => {
  if (localServer) {
    try {
      localServer.close();
    } catch (_) {}
  }
});

app.on('window-all-closed', () => {
  // На Windows выходим, если не в режиме питомца
  if (currentMode !== 'pet' && process.platform !== 'darwin') {
    app.quit();
  }
});
