const path = require('path');
const { execFile, spawn } = require('child_process');
const fs = require('fs');
const { isValidIp, isValidPort, isPackageProtected } = require('./security.cjs');

class AdbManager {
  constructor(customPath = null) {
    if (customPath && fs.existsSync(customPath)) {
      this.adbPath = customPath;
    } else {
      const devPath = path.resolve(__dirname, '../../platform-tools/adb.exe');
      const prodPath = path.resolve(process.resourcesPath || '', 'platform-tools/adb.exe');
      if (fs.existsSync(devPath)) {
        this.adbPath = devPath;
      } else if (fs.existsSync(prodPath)) {
        this.adbPath = prodPath;
      } else {
        this.adbPath = 'adb';
      }
    }
    this.activeChildProcesses = new Set();
  }

  // Safe execution with guaranteed process termination and cleanup
  execAdb(args, timeout = 15000) {
    return new Promise((resolve) => {
      let isResolved = false;
      let timer = null;

      const child = execFile(
        this.adbPath,
        args,
        {
          timeout,
          windowsHide: true,
          maxBuffer: 10 * 1024 * 1024
        },
        (error, stdout, stderr) => {
          if (timer) clearTimeout(timer);
          this.activeChildProcesses.delete(child);
          if (isResolved) return;
          isResolved = true;

          if (error) {
            resolve({
              success: false,
              error: error.message,
              stderr: stderr ? stderr.trim() : '',
              stdout: stdout ? stdout.trim() : ''
            });
          } else {
            resolve({
              success: true,
              stdout: stdout ? stdout.trim() : '',
              stderr: stderr ? stderr.trim() : ''
            });
          }
        }
      );

      this.activeChildProcesses.add(child);

      // Extra watchdog in case of Windows process deadlocks
      timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          this.activeChildProcesses.delete(child);
          try {
            child.kill('SIGKILL');
          } catch (_) {}
          resolve({
            success: false,
            error: `Command timed out after ${timeout}ms`,
            stderr: 'TIMEOUT',
            stdout: ''
          });
        }
      }, timeout + 500);
    });
  }

  async restartServer() {
    await this.execAdb(['kill-server'], 5000);
    return await this.execAdb(['start-server'], 8000);
  }

  async getDevices() {
    const res = await this.execAdb(['devices', '-l'], 8000);
    if (!res.success) return [];
    const lines = res.stdout.split('\n');
    const devices = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const serial = parts[0];
        const state = parts[1]; // 'device', 'unauthorized', 'offline'
        let model = 'Android Projector';
        let product = '';
        let device = '';

        for (let j = 2; j < parts.length; j++) {
          if (parts[j].startsWith('model:')) model = parts[j].replace('model:', '');
          if (parts[j].startsWith('product:')) product = parts[j].replace('product:', '');
          if (parts[j].startsWith('device:')) device = parts[j].replace('device:', '');
        }

        devices.push({
          serial,
          state,
          model,
          product,
          device,
          isWifi: serial.includes(':')
        });
      }
    }
    return devices;
  }

  async connectWifi(ip, port = 5555) {
    if (!isValidIp(ip)) {
      return { success: false, message: 'Некорректный IP-адрес устройства' };
    }
    if (!isValidPort(port)) {
      return { success: false, message: 'Некорректный сетевой порт' };
    }

    const target = `${ip.trim()}:${port}`;
    const res = await this.execAdb(['connect', target], 10000);
    const isConnected = res.success && res.stdout.includes('connected to');

    return {
      success: isConnected,
      message: res.stdout || res.stderr || (isConnected ? 'Подключено' : 'Ошибка соединения')
    };
  }

  async disconnectWifi(ip, port = 5555) {
    const target = `${ip}:${port}`;
    const res = await this.execAdb(['disconnect', target], 5000);
    return { success: res.success, message: res.stdout };
  }

  async enableTcpip(serial, port = 5555) {
    if (!isValidPort(port)) {
      return { success: false, message: 'Некорректный сетевой порт' };
    }
    const args = serial ? ['-s', serial, 'tcpip', port.toString()] : ['tcpip', port.toString()];
    const res = await this.execAdb(args, 10000);
    const ok = res.success && (res.stdout.includes('restarting in TCP mode') || res.stdout.includes('restarting in tcp mode'));
    return {
      success: ok || res.success,
      message: ok || res.success 
        ? `Беспроводной ADB успешно активирован на порту ${port}. Теперь можно отключать USB кабель и подключаться по Wi-Fi.` 
        : (res.error || res.stderr || 'Не удалось активировать TCP/IP режим')
    };
  }

  async getDeviceInfo(serial) {
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    const [propRes, sizeRes, densityRes] = await Promise.all([
      this.execAdb([...prefix, 'getprop'], 8000),
      this.execAdb([...prefix, 'wm', 'size'], 5000),
      this.execAdb([...prefix, 'wm', 'density'], 5000)
    ]);

    const props = {};
    if (propRes.success) {
      const lines = propRes.stdout.split('\n');
      for (const line of lines) {
        const match = line.match(/\[(.*?)\]:\s*\[(.*?)\]/);
        if (match) {
          props[match[1]] = match[2];
        }
      }
    }

    return {
      model: props['ro.product.model'] || props['ro.product.device'] || 'Unknown Model',
      manufacturer: props['ro.product.manufacturer'] || 'Unknown',
      brand: props['ro.product.brand'] || 'Unknown',
      androidVersion: props['ro.build.version.release'] || 'Unknown',
      sdk: props['ro.build.version.sdk'] || 'Unknown',
      soc: props['ro.board.platform'] || props['ro.hardware'] || props['ro.soc.model'] || 'ARM SoC',
      displaySize: sizeRes.stdout ? sizeRes.stdout.replace('Physical size:', '').trim() : '1920x1080',
      displayDensity: densityRes.stdout ? densityRes.stdout.replace('Physical density:', '').trim() : 'Default',
      securityPatch: props['ro.build.version.security_patch'] || 'N/A',
      buildDate: props['ro.build.date'] || 'N/A'
    };
  }

  async getMemoryStats(serial) {
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    const res = await this.execAdb([...prefix, 'cat', '/proc/meminfo'], 6000);
    if (!res.success) return null;

    const data = {};
    const lines = res.stdout.split('\n');
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length === 2) {
        const key = parts[0].trim();
        const val = parseInt(parts[1].trim().split(' ')[0], 10);
        data[key] = val;
      }
    }

    const totalMB = Math.round((data.MemTotal || 0) / 1024);
    const freeMB = Math.round((data.MemFree || 0) / 1024);
    const availableMB = Math.round((data.MemAvailable || (data.MemFree + data.Buffers + data.Cached)) / 1024);
    const cachedMB = Math.round((data.Cached || 0) / 1024);
    const usedMB = Math.max(0, totalMB - availableMB);
    const usagePercent = totalMB > 0 ? Math.min(100, Math.round((usedMB / totalMB) * 100)) : 0;

    return {
      totalMB,
      freeMB,
      availableMB,
      cachedMB,
      usedMB,
      usagePercent
    };
  }

  async getStorageStats(serial) {
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    const res = await this.execAdb([...prefix, 'df', '-h', '/data'], 6000);
    if (!res.success) return null;
    const lines = res.stdout.split('\n');
    if (lines.length >= 2) {
      const parts = lines[1].trim().split(/\s+/);
      if (parts.length >= 5) {
        return {
          total: parts[1],
          used: parts[2],
          available: parts[3],
          usePercent: parts[4]
        };
      }
    }
    return null;
  }

  async getPackages(serial) {
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    const [allRes, thirdRes, disRes] = await Promise.all([
      this.execAdb([...prefix, 'pm', 'list', 'packages'], 10000),
      this.execAdb([...prefix, 'pm', 'list', 'packages', '-3'], 8000),
      this.execAdb([...prefix, 'pm', 'list', 'packages', '-d'], 8000)
    ]);

    const parseList = (stdout) => {
      if (!stdout) return new Set();
      return new Set(
        stdout.split('\n')
          .map(l => l.replace('package:', '').trim())
          .filter(Boolean)
      );
    };

    const allPkgs = parseList(allRes.stdout);
    const thirdParty = parseList(thirdRes.stdout);
    const disabled = parseList(disRes.stdout);

    const result = [];
    for (const pkg of allPkgs) {
      result.push({
        id: pkg,
        isThirdParty: thirdParty.has(pkg),
        isDisabled: disabled.has(pkg),
        isSystem: !thirdParty.has(pkg),
        isProtected: isPackageProtected(pkg)
      });
    }

    return result;
  }

  async setPackageState(serial, packageName, enable = true) {
    if (!enable && isPackageProtected(packageName)) {
      return {
        success: false,
        error: `Пакет "${packageName}" защищен системой от отключения для предотвращения сбоев проектора.`
      };
    }

    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    if (enable) {
      return await this.execAdb([...prefix, 'pm', 'enable', packageName]);
    } else {
      await this.execAdb([...prefix, 'am', 'force-stop', packageName]);
      return await this.execAdb([...prefix, 'pm', 'disable-user', '--user', '0', packageName]);
    }
  }

  async setAnimationScale(serial, scale = 0.5) {
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    const s = Math.max(0, Math.min(2.0, Number(scale))).toString();
    await Promise.all([
      this.execAdb([...prefix, 'settings', 'put', 'global', 'window_animation_scale', s]),
      this.execAdb([...prefix, 'settings', 'put', 'global', 'transition_animation_scale', s]),
      this.execAdb([...prefix, 'settings', 'put', 'global', 'animator_duration_scale', s])
    ]);
    return { success: true };
  }

  async compilePackageSpeed(serial, packageName) {
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    return await this.execAdb([...prefix, 'cmd', 'package', 'compile', '-m', 'speed', '-f', packageName], 45000);
  }

  async cleanCacheAndLogs(serial) {
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    await this.execAdb([...prefix, 'rm', '-rf', '/sdcard/Documents/log/*'], 5000);
    await this.execAdb([...prefix, 'rm', '-rf', '/sdcard/.db'], 5000);
    await this.execAdb([...prefix, 'pm', 'trim-caches', '1000M'], 8000);
    return { success: true };
  }

  async sendKey(serial, keyCode) {
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    const code = parseInt(keyCode, 10);
    if (isNaN(code) || code < 0 || code > 350) return { success: false };
    return await this.execAdb([...prefix, 'input', 'keyevent', code.toString()], 4000);
  }

  async sendText(serial, text) {
    if (!text || typeof text !== 'string') return { success: false };
    const prefix = serial ? ['-s', serial, 'shell'] : ['shell'];
    const hasNonAscii = /[^\x00-\x7F]/.test(text);

    if (hasNonAscii) {
      // Support for Cyrillic / UTF-8 via Android Clipboard and Paste (Keyevent 279)
      const sanitized = text.replace(/["\\]/g, '\\$&');
      // Set clipboard and send PASTE keyevent
      await this.execAdb([...prefix, 'cmd', 'clipboard', 'set', 'text', `"${sanitized}"`], 5000);
      return await this.execAdb([...prefix, 'input', 'keyevent', '279'], 4000);
    } else {
      // Standard ASCII escaped input
      const escaped = text.replace(/([ "$\\`])/g, '\\$1');
      return await this.execAdb([...prefix, 'input', 'text', escaped], 4000);
    }
  }

  // Fault-tolerant screen capture with zero-leak process management
  captureScreen(serial) {
    return new Promise((resolve) => {
      const args = serial ? ['-s', serial, 'exec-out', 'screencap', '-p'] : ['exec-out', 'screencap', '-p'];
      let child = null;
      let isResolved = false;
      const chunks = [];

      const cleanup = () => {
        if (child) {
          this.activeChildProcesses.delete(child);
          try { child.kill('SIGKILL'); } catch (_) {}
          child = null;
        }
      };

      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve({ success: false, error: 'Screen capture timeout' });
        }
      }, 5000);

      try {
        child = spawn(this.adbPath, args, { windowsHide: true });
        this.activeChildProcesses.add(child);

        child.stdout.on('data', chunk => chunks.push(chunk));
        
        child.on('close', code => {
          clearTimeout(timer);
          cleanup();
          if (isResolved) return;
          isResolved = true;

          if (code === 0 && chunks.length > 0) {
            const buffer = Buffer.concat(chunks);
            // Verify PNG header [0x89, 0x50, 0x4E, 0x47]
            if (buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
              resolve({
                success: true,
                base64: `data:image/png;base64,${buffer.toString('base64')}`
              });
            } else {
              resolve({ success: false, error: 'Invalid image data received' });
            }
          } else {
            resolve({ success: false, error: 'Capture process closed with error' });
          }
        });

        child.on('error', () => {
          clearTimeout(timer);
          cleanup();
          if (!isResolved) {
            isResolved = true;
            resolve({ success: false, error: 'Spawn error' });
          }
        });
      } catch (err) {
        clearTimeout(timer);
        cleanup();
        resolve({ success: false, error: err.message });
      }
    });
  }

  async installApk(serial, apkPath) {
    if (!fs.existsSync(apkPath)) {
      return { success: false, output: 'APK файл не найден' };
    }
    const args = serial ? ['-s', serial, 'install', '-r', apkPath] : ['install', '-r', apkPath];
    const res = await this.execAdb(args, 90000);
    return {
      success: res.success && res.stdout.includes('Success'),
      output: res.stdout || res.stderr
    };
  }

  async rebootDevice(serial) {
    const args = serial ? ['-s', serial, 'reboot'] : ['reboot'];
    return await this.execAdb(args, 10000);
  }
}

module.exports = AdbManager;
