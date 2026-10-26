const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getDevices: () => ipcRenderer.invoke('adb:get-devices'),
  connectWifi: (ip, port) => ipcRenderer.invoke('adb:connect-wifi', { ip, port }),
  disconnectWifi: (ip, port) => ipcRenderer.invoke('adb:disconnect-wifi', { ip, port }),
  enableTcpip: (serial, port) => ipcRenderer.invoke('adb:enable-tcpip', { serial, port }),
  getDeviceInfo: (serial) => ipcRenderer.invoke('adb:get-device-info', serial),
  getMemoryStats: (serial) => ipcRenderer.invoke('adb:get-memory-stats', serial),
  getStorageStats: (serial) => ipcRenderer.invoke('adb:get-storage-stats', serial),
  getPackages: (serial) => ipcRenderer.invoke('adb:get-packages', serial),
  setPackageState: (serial, packageName, enable) => ipcRenderer.invoke('adb:set-package-state', { serial, packageName, enable }),
  setAnimationScale: (serial, scale) => ipcRenderer.invoke('adb:set-animation-scale', { serial, scale }),
  compileSpeed: (serial, packageName) => ipcRenderer.invoke('adb:compile-speed', { serial, packageName }),
  cleanCache: (serial) => ipcRenderer.invoke('adb:clean-cache', serial),
  captureScreen: (serial) => ipcRenderer.invoke('adb:capture-screen', serial),
  sendKey: (serial, keyCode) => ipcRenderer.invoke('adb:send-key', { serial, keyCode }),
  sendText: (serial, text) => ipcRenderer.invoke('adb:send-text', { serial, text }),
  rebootDevice: (serial) => ipcRenderer.invoke('adb:reboot', serial),
  
  getAppsCatalog: () => ipcRenderer.invoke('apps:get-catalog'),
  installApp: (serial, appId) => ipcRenderer.invoke('apps:install-app', { serial, appId }),
  onInstallProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('apps:install-progress', handler);
    return () => ipcRenderer.removeListener('apps:install-progress', handler);
  },

  batchOptimize: (serial, options) => ipcRenderer.invoke('adb:batch-optimize', { serial, options }),
  batchRestore: (serial) => ipcRenderer.invoke('adb:batch-restore', serial),
  
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url)
});
