const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const AdbManager = require('../core/adb.cjs');
const { isValidIp, isValidPort, isPackageProtected, isSafeDownloadUrl } = require('../core/security.cjs');

const debloatPresets = require('../data/debloat-presets.json');
const appsCatalog = require('../data/apps-catalog.json');

const adb = new AdbManager();
let mainWindow = null;

// Global process error handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('[Android Projector Optimizer] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Android Projector Optimizer] Unhandled Rejection:', reason);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 1040,
    minHeight: 680,
    backgroundColor: '#090a0d',
    title: 'Android Projector Optimizer',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Resilient download utility with URL validation, redirect limits and temp cleanup
function downloadFile(url, destPath, onProgress, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (!isSafeDownloadUrl(url)) {
      return reject(new Error('URL для скачивания не входит в список разрешенных доверенных доменов.'));
    }

    if (maxRedirects <= 0) {
      return reject(new Error('Слишком много HTTP-перенаправлений.'));
    }

    let file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close(() => {
          try { fs.unlinkSync(destPath); } catch (_) {}
          downloadFile(response.headers.location, destPath, onProgress, maxRedirects - 1)
            .then(resolve)
            .catch(reject);
        });
        return;
      }

      if (response.statusCode !== 200) {
        file.close(() => {
          try { fs.unlinkSync(destPath); } catch (_) {}
          reject(new Error(`Ошибка сервера загрузки: HTTP ${response.statusCode}`));
        });
        return;
      }

      const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
      let receivedBytes = 0;

      response.on('data', (chunk) => {
        receivedBytes += chunk.length;
        if (totalBytes > 0 && onProgress) {
          const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
          onProgress(percent, receivedBytes, totalBytes);
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    });

    request.on('error', (err) => {
      file.close(() => {
        try { fs.unlinkSync(destPath); } catch (_) {}
        reject(err);
      });
    });

    request.setTimeout(45000, () => {
      request.abort();
      file.close(() => {
        try { fs.unlinkSync(destPath); } catch (_) {}
        reject(new Error('Таймаут соединения при загрузке APK'));
      });
    });
  });
}

// IPC Handlers
ipcMain.handle('adb:get-devices', async () => {
  return await adb.getDevices();
});

ipcMain.handle('adb:connect-wifi', async (_, { ip, port }) => {
  if (!isValidIp(ip)) {
    return { success: false, message: 'Некорректный формат IPv4-адреса' };
  }
  return await adb.connectWifi(ip, port);
});

ipcMain.handle('adb:disconnect-wifi', async (_, { ip, port }) => {
  return await adb.disconnectWifi(ip, port);
});

ipcMain.handle('adb:enable-tcpip', async (_, { serial, port }) => {
  return await adb.enableTcpip(serial, port);
});

ipcMain.handle('adb:get-device-info', async (_, serial) => {
  return await adb.getDeviceInfo(serial);
});

ipcMain.handle('adb:get-memory-stats', async (_, serial) => {
  return await adb.getMemoryStats(serial);
});

ipcMain.handle('adb:get-storage-stats', async (_, serial) => {
  return await adb.getStorageStats(serial);
});

ipcMain.handle('adb:get-packages', async (_, serial) => {
  const rawPackages = await adb.getPackages(serial);
  const presetMap = new Map(debloatPresets.map(p => [p.id, p]));

  return rawPackages.map(pkg => {
    const preset = presetMap.get(pkg.id);
    const isProt = isPackageProtected(pkg.id);

    return {
      id: pkg.id,
      name: preset ? preset.name : pkg.id,
      category: preset ? preset.category : (pkg.isThirdParty ? 'user' : 'system'),
      risk: isProt ? 'protected' : (preset ? preset.risk : (pkg.isThirdParty ? 'safe' : 'system')),
      description: preset ? preset.description : (isProt ? 'Критически важный системный компонент (защищен от отключения)' : (pkg.isThirdParty ? 'Пользовательское приложение' : 'Системный пакет Android')),
      recommended: isProt ? false : (preset ? preset.recommended : false),
      isThirdParty: pkg.isThirdParty,
      isDisabled: pkg.isDisabled,
      isSystem: pkg.isSystem,
      isProtected: isProt
    };
  });
});

ipcMain.handle('adb:set-package-state', async (_, { serial, packageName, enable }) => {
  if (!enable && isPackageProtected(packageName)) {
    return {
      success: false,
      error: `Пакет "${packageName}" защищен системой от отключения во избежание сбоев проектора.`
    };
  }
  return await adb.setPackageState(serial, packageName, enable);
});

ipcMain.handle('adb:set-animation-scale', async (_, { serial, scale }) => {
  return await adb.setAnimationScale(serial, scale);
});

ipcMain.handle('adb:compile-speed', async (_, { serial, packageName }) => {
  return await adb.compilePackageSpeed(serial, packageName);
});

ipcMain.handle('adb:clean-cache', async (_, serial) => {
  return await adb.cleanCacheAndLogs(serial);
});

ipcMain.handle('adb:capture-screen', async (_, serial) => {
  return await adb.captureScreen(serial);
});

ipcMain.handle('adb:send-key', async (_, { serial, keyCode }) => {
  return await adb.sendKey(serial, keyCode);
});

ipcMain.handle('adb:send-text', async (_, { serial, text }) => {
  return await adb.sendText(serial, text);
});

ipcMain.handle('adb:reboot', async (_, serial) => {
  return await adb.rebootDevice(serial);
});

ipcMain.handle('apps:get-catalog', async () => {
  return appsCatalog;
});

ipcMain.handle('apps:install-app', async (event, { serial, appId }) => {
  const appItem = appsCatalog.find(a => a.id === appId);
  if (!appItem) return { success: false, error: 'Приложение не найдено в каталоге' };

  const tempDir = app.getPath('temp');
  const destPath = path.join(tempDir, `projector_app_${Date.now()}_${appId}.apk`);

  try {
    event.sender.send('apps:install-progress', { appId, status: 'downloading', percent: 0 });
    
    await downloadFile(appItem.downloadUrl, destPath, (percent) => {
      event.sender.send('apps:install-progress', { appId, status: 'downloading', percent });
    });

    event.sender.send('apps:install-progress', { appId, status: 'installing', percent: 100 });
    const res = await adb.installApk(serial, destPath);

    // Optionally compile installed app with speed mode
    if (res.success && appItem.packageName) {
      adb.compilePackageSpeed(serial, appItem.packageName).catch(() => {});
    }

    try { fs.unlinkSync(destPath); } catch (_) {}

    return res;
  } catch (err) {
    try { fs.unlinkSync(destPath); } catch (_) {}
    return { success: false, error: err.message };
  }
});

ipcMain.handle('adb:batch-optimize', async (event, { serial, options = {} }) => {
  const steps = [];
  const beforeMem = await adb.getMemoryStats(serial);

  // 1. Animation scaling
  if (options.animations !== false) {
    await adb.setAnimationScale(serial, options.animationScale || 0.5);
    steps.push('Масштаб системных анимаций ускорен до 0.5x');
  }

  // 2. Cache & Log cleanup
  if (options.cleanLogs !== false) {
    await adb.cleanCacheAndLogs(serial);
    steps.push('Кэши приложений и мусорные логи очищены');
  }

  // 3. Debloat recommended safe packages (with Protected Filter)
  if (options.debloat !== false) {
    const packages = await adb.getPackages(serial);
    const presetMap = new Map(debloatPresets.filter(p => p.recommended).map(p => [p.id, p]));
    let disabledCount = 0;

    for (const pkg of packages) {
      // Must NOT be protected
      if (!isPackageProtected(pkg.id) && presetMap.has(pkg.id) && !pkg.isDisabled) {
        await adb.setPackageState(serial, pkg.id, false);
        disabledCount++;
      }
    }
    steps.push(`Безопасно отключено ${disabledCount} рекламных и фоновых пакетов`);
  }

  // 4. Dexopt speed compilation for popular media apps
  if (options.compileSpeed !== false) {
    const packages = await adb.getPackages(serial);
    const criticalApps = ['ru.kinopoisk.tv', 'com.phlox.tvwebbrowser', 'com.teamsmart.videomanager.tv', 'me.efesser.flauncher'];
    let compiledCount = 0;
    for (const ca of criticalApps) {
      if (packages.some(p => p.id === ca && !p.isDisabled)) {
        await adb.compilePackageSpeed(serial, ca);
        compiledCount++;
      }
    }
    if (compiledCount > 0) {
      steps.push(`Скомпилировано с нативным ускорением ${compiledCount} медиа-приложений`);
    }
  }

  const afterMem = await adb.getMemoryStats(serial);
  const memFreed = (beforeMem && afterMem) ? Math.max(0, afterMem.availableMB - beforeMem.availableMB) : 0;

  return {
    success: true,
    steps,
    memFreedMB: memFreed,
    beforeMem,
    afterMem
  };
});

ipcMain.handle('adb:batch-restore', async (_, serial) => {
  const packages = await adb.getPackages(serial);
  let restoredCount = 0;

  for (const pkg of packages) {
    if (pkg.isDisabled) {
      await adb.setPackageState(serial, pkg.id, true);
      restoredCount++;
    }
  }

  await adb.setAnimationScale(serial, 1.0);

  return {
    success: true,
    restoredCount,
    message: `Восстановлено ${restoredCount} приложений и возвращен стандартный масштаб анимаций (1.0x).`
  };
});

ipcMain.handle('shell:open-external', async (_, url) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    return await shell.openExternal(url);
  }
});
