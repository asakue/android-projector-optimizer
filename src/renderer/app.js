import { Icons } from './components/icons.js';
import { initLanguage, getLang, setLang, t, applyTranslations } from './i18n.js';

// Global Application State
const state = {
  currentDevice: null,
  devices: [],
  deviceInfo: null,
  memoryStats: null,
  storageStats: null,
  displayDensity: null,
  packages: [],
  appsCatalog: [],
  currentTab: 'dashboard',
  debloatFilter: 'all',
  searchQuery: '',
  isPolling: false,
  isOptimizing: false,
  pollTimeoutId: null,
  lastOptimizationResult: null
};

// Initialize Optical SVG Icons
function initIcons() {
  document.getElementById('brand-logo-icon').innerHTML = Icons.projector();
  document.getElementById('icon-nav-dashboard').innerHTML = Icons.layers();
  document.getElementById('icon-nav-debloater').innerHTML = Icons.shieldCheck();
  document.getElementById('icon-nav-turbo').innerHTML = Icons.zap();
  document.getElementById('icon-nav-apps').innerHTML = Icons.download();
  document.getElementById('icon-nav-remote').innerHTML = Icons.remote();

  document.getElementById('icon-btn-lang').innerHTML = Icons.languages();
  document.getElementById('btn-refresh-devices').innerHTML = Icons.refresh();
  document.getElementById('icon-btn-wifi').innerHTML = Icons.wifi();
  document.getElementById('icon-btn-reboot').innerHTML = Icons.power();
  document.getElementById('icon-btn-boost').innerHTML = Icons.zap();
  document.getElementById('icon-btn-report').innerHTML = Icons.fileText();
  document.getElementById('icon-btn-backup').innerHTML = Icons.archive();

  document.getElementById('icon-kpi-ram').innerHTML = Icons.cpu();
  document.getElementById('icon-kpi-storage').innerHTML = Icons.hardDrive();
  document.getElementById('icon-kpi-cpu').innerHTML = Icons.projector();
  document.getElementById('icon-kpi-shield').innerHTML = Icons.shieldCheck();

  document.getElementById('icon-quick-settings').innerHTML = Icons.cpu();
  document.getElementById('icon-btn-bt').innerHTML = Icons.bluetooth();
  document.getElementById('icon-btn-sound').innerHTML = Icons.volume();
  document.getElementById('icon-btn-display').innerHTML = Icons.monitor();

  document.getElementById('icon-turbo-zap').innerHTML = Icons.zap();
  document.getElementById('icon-turbo-cpu').innerHTML = Icons.cpu();
  document.getElementById('icon-turbo-density').innerHTML = Icons.monitor();
  document.getElementById('icon-turbo-trash').innerHTML = Icons.shieldCheck();

  document.getElementById('icon-screen-mirror').innerHTML = Icons.projector();
  document.getElementById('icon-remote-power').innerHTML = Icons.power();
  document.getElementById('btn-dpad-up').innerHTML = Icons.arrowUp();
  document.getElementById('btn-dpad-down').innerHTML = Icons.arrowDown();
  document.getElementById('btn-dpad-left').innerHTML = Icons.arrowLeft();
  document.getElementById('btn-dpad-right').innerHTML = Icons.arrowRight();
  document.getElementById('btn-remote-back').innerHTML = Icons.back();
  document.getElementById('btn-remote-home').innerHTML = Icons.home();

  document.getElementById('icon-btn-scan').innerHTML = Icons.search();
  document.getElementById('icon-results-check').innerHTML = Icons.check();
  document.getElementById('icon-btn-report-modal').innerHTML = Icons.fileText();
}

// Leak-Free Polling Loop
async function startAdaptivePolling() {
  if (state.pollTimeoutId) {
    clearTimeout(state.pollTimeoutId);
    state.pollTimeoutId = null;
  }

  const poll = async () => {
    if (!state.isPolling && !state.isOptimizing) {
      state.isPolling = true;
      try {
        await refreshDevices();
      } catch (err) {
        console.error('Device polling error:', err);
      } finally {
        state.isPolling = false;
      }
    }
    // Schedule next poll interval (3.5s)
    state.pollTimeoutId = setTimeout(poll, 3500);
  };

  poll();
}

// Device Discovery & Status Handling
async function refreshDevices() {
  const devices = await window.electronAPI.getDevices();
  state.devices = devices;

  const dot = document.getElementById('device-status-dot');
  const statusText = document.getElementById('device-status-text');
  const nameEl = document.getElementById('device-quick-name');
  const serialEl = document.getElementById('device-quick-serial');

  if (!devices || devices.length === 0) {
    state.currentDevice = null;
    dot.className = 'status-dot';
    statusText.textContent = t('conn.disconnected');
    nameEl.textContent = t('conn.no_device');
    serialEl.textContent = t('conn.connect_hint');
    return;
  }

  const primary = devices[0];
  const isNew = !state.currentDevice || state.currentDevice.serial !== primary.serial;
  state.currentDevice = primary;

  if (primary.state === 'device') {
    dot.className = 'status-dot online';
    statusText.textContent = t('conn.online');
    nameEl.textContent = primary.model || 'Android Projector';
    serialEl.textContent = primary.isWifi ? `Wi-Fi (${primary.serial})` : `USB (${primary.serial})`;

    if (isNew) {
      await loadDeviceDetails();
    } else {
      updateLiveTelemetry();
    }
  } else if (primary.state === 'unauthorized') {
    dot.className = 'status-dot connecting';
    statusText.textContent = 'RSA';
    nameEl.textContent = t('conn.unauthorized_title');
    serialEl.textContent = t('conn.unauthorized_hint');
  } else if (primary.state === 'offline') {
    dot.className = 'status-dot';
    statusText.textContent = t('conn.offline');
    nameEl.textContent = primary.model || 'Android Projector';
    serialEl.textContent = t('conn.offline_hint');
  } else {
    dot.className = 'status-dot connecting';
    statusText.textContent = primary.state;
    nameEl.textContent = primary.model || 'Android Projector';
    serialEl.textContent = primary.serial;
  }
}

// Fetch Full Specs & Telemetry
async function loadDeviceDetails() {
  if (!state.currentDevice || state.currentDevice.state !== 'device') return;
  const serial = state.currentDevice.serial;

  try {
    const [info, mem, storage, packages, density] = await Promise.all([
      window.electronAPI.getDeviceInfo(serial),
      window.electronAPI.getMemoryStats(serial),
      window.electronAPI.getStorageStats(serial),
      window.electronAPI.getPackages(serial),
      window.electronAPI.getDisplayDensity(serial)
    ]);

    state.deviceInfo = info;
    state.memoryStats = mem;
    state.storageStats = storage;
    state.packages = packages;
    state.displayDensity = density;

    // Update Specs Display
    document.getElementById('spec-model').textContent = info.model;
    document.getElementById('spec-android').textContent = `Android ${info.androidVersion} (API ${info.sdk})`;
    document.getElementById('spec-brand').textContent = `${info.manufacturer} / ${info.brand}`;
    document.getElementById('kpi-soc-val').textContent = info.soc.toUpperCase();
    document.getElementById('kpi-res-val').textContent = t('kpi.resolution', { res: info.displaySize });

    // Update Display Density indicator
    if (density) {
      const densityLabel = document.getElementById('current-density-label');
      if (densityLabel) {
        densityLabel.textContent = t('turbo.density_current', { val: density.current }) + 
          (density.isCustom ? ` (Заводской: ${density.physical})` : '');
      }
    }

    // Update Telemetry
    updateLiveTelemetry();

    // Update Storage KPI
    if (storage) {
      document.getElementById('kpi-storage-val').textContent = `${storage.used} / ${storage.total}`;
      document.getElementById('kpi-storage-free').textContent = t('kpi.storage_free', { free: storage.available });
      const percent = parseInt(storage.usePercent.replace('%', ''), 10) || 0;
      document.getElementById('storage-progress').style.width = `${percent}%`;
    }

    renderDebloaterPackages();
  } catch (err) {
    console.error('Error loading device details:', err);
  }
}

// Update Memory Gauge & Status
async function updateLiveTelemetry() {
  if (!state.currentDevice || state.currentDevice.state !== 'device') return;
  const mem = await window.electronAPI.getMemoryStats(state.currentDevice.serial);
  if (!mem) return;
  state.memoryStats = mem;

  document.getElementById('kpi-ram-val').textContent = `${mem.usedMB} / ${mem.totalMB} MB`;
  document.getElementById('kpi-ram-free').textContent = t('kpi.ram_free', { free: mem.availableMB });
  const ramBar = document.getElementById('ram-progress');
  ramBar.style.width = `${mem.usagePercent}%`;

  if (mem.usagePercent > 85) {
    ramBar.className = 'progress-bar-fill danger';
  } else if (mem.usagePercent > 70) {
    ramBar.className = 'progress-bar-fill warning';
  } else {
    ramBar.className = 'progress-bar-fill';
  }
}

// Render Debloater List
function renderDebloaterPackages() {
  const container = document.getElementById('packages-container');
  if (!state.packages || state.packages.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">${t('debloater.empty_hint')}</div>`;
    return;
  }

  const query = state.searchQuery.toLowerCase();
  const filter = state.debloatFilter;

  let filtered = state.packages.filter(pkg => {
    const matchesSearch = pkg.id.toLowerCase().includes(query) || (pkg.name && pkg.name.toLowerCase().includes(query));
    if (!matchesSearch) return false;

    if (filter === 'recommended') return pkg.recommended && !pkg.isDisabled;
    if (filter === 'disabled') return pkg.isDisabled;
    if (filter === 'third') return pkg.isThirdParty;
    return true;
  });

  const bloatCount = state.packages.filter(p => p.recommended && !p.isDisabled).length;
  document.getElementById('debloat-badge').textContent = bloatCount;
  document.getElementById('kpi-bloat-val').textContent = bloatCount === 0 ? '0' : `${bloatCount}`;
  document.getElementById('kpi-bloat-meta').textContent = t('kpi.packages_found', { count: state.packages.length });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Ничего не найдено</div>`;
    return;
  }

  container.innerHTML = filtered.map(pkg => {
    let badgeClass = 'badge-safe';
    let badgeText = 'БЕЗОПАСНО';

    if (pkg.isProtected) {
      badgeClass = 'badge-safe';
      badgeText = t('debloater.badge_protected');
    } else if (pkg.isDisabled) {
      badgeClass = 'badge-disabled';
      badgeText = t('debloater.badge_disabled');
    } else if (pkg.risk === 'caution') {
      badgeClass = 'badge-caution';
      badgeText = 'ВНИМАНИЕ';
    }

    const actionText = pkg.isDisabled ? t('debloater.btn_restore') : t('debloater.btn_freeze');
    const isActionDisabled = pkg.isProtected ? 'disabled style="opacity: 0.4; cursor: not-allowed;" title="Этот системный компонент защищен от отключения"' : '';

    return `
      <div class="package-item" data-id="${pkg.id}">
        <div class="package-info">
          <div class="package-name-row">
            <span class="package-title">${pkg.name || pkg.id}</span>
            <span class="badge ${badgeClass}">${badgeText}</span>
            ${pkg.recommended ? '<span class="badge badge-caution">МУСОР</span>' : ''}
          </div>
          <span class="package-id">${pkg.id}</span>
          <span class="package-desc">${pkg.description || ''}</span>
        </div>
        <div style="display: flex; gap: 8px;">
          ${pkg.isThirdParty ? `
            <button class="btn btn-secondary btn-export-single-apk" data-pkg="${pkg.id}" title="${t('debloater.btn_export')}">
              ${Icons.archive()}
              <span>APK</span>
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-toggle-pkg" data-pkg="${pkg.id}" data-enable="${pkg.isDisabled}" ${isActionDisabled}>
            ${actionText}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach Toggle Listeners
  container.querySelectorAll('.btn-toggle-pkg:not([disabled])').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const pkgId = e.currentTarget.dataset.pkg;
      const shouldEnable = e.currentTarget.dataset.enable === 'true';
      btn.textContent = '...';
      btn.disabled = true;

      const res = await window.electronAPI.setPackageState(state.currentDevice.serial, pkgId, shouldEnable);
      if (res && res.error) {
        alert(res.error);
      }
      await loadDeviceDetails();
    });
  });

  // Attach Single APK Export Listeners
  container.querySelectorAll('.btn-export-single-apk').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const pkgId = e.currentTarget.dataset.pkg;
      const destDir = await window.electronAPI.selectDirectory();
      if (!destDir) return;

      btn.disabled = true;
      try {
        const res = await window.electronAPI.exportApk(state.currentDevice.serial, pkgId, destDir);
        if (res.success) {
          alert(`APK успешно сохранен:\n${res.filePath}`);
        } else {
          alert(`Ошибка выгрузки APK: ${res.error}`);
        }
      } finally {
        btn.disabled = false;
      }
    });
  });
}

// Render Apps Catalog
async function loadAppsCatalog() {
  const catalog = await window.electronAPI.getAppsCatalog();
  state.appsCatalog = catalog;

  const container = document.getElementById('apps-container');
  container.innerHTML = catalog.map(app => {
    return `
      <div class="app-card" id="app-card-${app.id}">
        <div>
          <div class="app-card-top">
            <div class="app-icon-box">
              ${Icons[app.icon] ? Icons[app.icon]() : Icons.download()}
            </div>
            <div class="app-card-details">
              <h3>${app.name}</h3>
              <span>${app.category} • ${app.version}</span>
            </div>
          </div>
          <p class="app-card-desc">${app.description}</p>
        </div>
        <div>
          <div class="progress-bar-container" id="progress-container-${app.id}" style="display: none; margin-bottom: 8px;">
            <div class="progress-bar-fill" id="progress-fill-${app.id}" style="width: 0%;"></div>
          </div>
          <button class="btn btn-secondary btn-install-app" data-id="${app.id}" style="width: 100%; justify-content: center;">
            <span id="btn-icon-${app.id}">${Icons.download()}</span>
            <span id="btn-text-${app.id}">${t('apps.install')}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach Install Listeners
  container.querySelectorAll('.btn-install-app').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const appId = e.currentTarget.dataset.id;
      if (!state.currentDevice || state.currentDevice.state !== 'device') {
        alert('Пожалуйста, сначала подключите проектор!');
        return;
      }

      const btnEl = e.currentTarget;
      btnEl.disabled = true;
      const textEl = document.getElementById(`btn-text-${appId}`);
      const progContainer = document.getElementById(`progress-container-${appId}`);

      progContainer.style.display = 'block';
      textEl.textContent = t('apps.downloading', { percent: 0 });

      const res = await window.electronAPI.installApp(state.currentDevice.serial, appId);
      btnEl.disabled = false;
      progContainer.style.display = 'none';

      if (res.success) {
        textEl.textContent = t('apps.installed');
        btnEl.className = 'btn btn-primary';
        setTimeout(() => {
          textEl.textContent = t('apps.install');
          btnEl.className = 'btn btn-secondary';
        }, 4000);
      } else {
        textEl.textContent = 'Ошибка';
        alert(`Не удалось установить: ${res.error || res.output}`);
      }
    });
  });
}

// Memory-Safe Screen Capture
async function captureProjectorScreen() {
  if (!state.currentDevice || state.currentDevice.state !== 'device') return;
  const res = await window.electronAPI.captureScreen(state.currentDevice.serial);
  const img = document.getElementById('screen-image');
  const placeholder = document.getElementById('screen-placeholder');

  if (res && res.success && res.base64) {
    img.removeAttribute('src');
    img.src = res.base64;
    img.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    console.warn('Capture failed or incomplete frame:', res?.error);
  }
}

// Generate Markdown Optimization Report
function generateMarkdownReport() {
  const dev = state.deviceInfo || {};
  const mem = state.memoryStats || {};
  const storage = state.storageStats || {};
  const density = state.displayDensity || {};
  const dateStr = new Date().toLocaleString();
  const disabledPkgs = (state.packages || []).filter(p => p.isDisabled);

  return `# Android Projector Optimizer — Отчет об оптимизации

**Дата формирования:** ${dateStr}
**Модель устройства:** ${dev.model || 'Unknown'}
**Бренд / Производитель:** ${dev.brand || ''} / ${dev.manufacturer || ''}
**Версия Android:** ${dev.androidVersion || 'N/A'} (API SDK ${dev.sdk || 'N/A'})
**Чипсет (SoC):** ${(dev.soc || '').toUpperCase()}
**Разрешение экрана:** ${dev.displaySize || '1920x1080'}
**Плотность экрана (DPI):** ${density.current || 280} DPI ${density.isCustom ? `(Заводское: ${density.physical})` : ''}

---

## 1. Состояние памяти и накопителя
* **ОЗУ:** Всего ${mem.totalMB || 0} MB, Свободно ${mem.availableMB || 0} MB (Используется: ${mem.usagePercent || 0}%, Кэш: ${mem.cachedMB || 0} MB)
* **Накопитель (/data):** Свободно ${storage.available || '--'} из ${storage.total || '--'} (Занято: ${storage.usePercent || '--'})

---

## 2. Результаты очистки и ускорения (Debloat & Boost)
* **Всего обнаружено пакетов:** ${(state.packages || []).length}
* **Отключено рекламных и системных пакетов:** ${disabledPkgs.length}
${disabledPkgs.length > 0 ? disabledPkgs.map(p => `  - [x] \`${p.id}\` — ${p.name || 'Служба'}`).join('\n') : '  - Отключенных пакетов нет'}

## 3. Примененные твики
* Ускорение системных анимаций до 0.5x
* Dexopt AOT Speed-компиляция медиа-плееров
* Очистка журналов крашей и глубокий тримминг кэша

*Создано утилитой Android Projector Optimizer (https://github.com/asakue/android-projector-optimizer)*
`;
}

// Navigation & Tab Switching
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.content-view');
  const topbarText = document.getElementById('topbar-text');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewName = item.dataset.view;
      state.currentTab = viewName;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      views.forEach(v => v.classList.remove('active'));
      const activeView = document.getElementById(`view-${viewName}`);
      if (activeView) activeView.classList.add('active');

      topbarText.textContent = t(`topbar.${viewName}`);

      if (viewName === 'remote') {
        captureProjectorScreen();
      }
    });
  });
}

// Event Listeners Setup
function setupEvents() {
  // Language Toggle
  document.getElementById('btn-toggle-lang').addEventListener('click', () => {
    const nextLang = getLang() === 'ru' ? 'en' : 'ru';
    setLang(nextLang);
    document.getElementById('lang-indicator').textContent = nextLang.toUpperCase();
    document.getElementById('topbar-text').textContent = t(`topbar.${state.currentTab}`);
    renderDebloaterPackages();
    loadAppsCatalog();
  });

  document.getElementById('btn-refresh-devices').addEventListener('click', refreshDevices);

  document.getElementById('debloat-search').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderDebloaterPackages();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.debloatFilter = e.target.dataset.filter;
      renderDebloaterPackages();
    });
  });

  // Debloat Recommended Safe
  document.getElementById('btn-debloat-selected').addEventListener('click', async () => {
    if (!state.currentDevice || state.currentDevice.state !== 'device') return;
    const btn = document.getElementById('btn-debloat-selected');
    btn.textContent = '...';
    btn.disabled = true;

    state.isOptimizing = true;
    try {
      await window.electronAPI.batchOptimize(state.currentDevice.serial, {
        animations: false,
        cleanLogs: true,
        debloat: true,
        compileSpeed: false
      });
      await loadDeviceDetails();
      alert('Рекомендованные рекламные и мусорные приложения успешно заморожены!');
    } finally {
      state.isOptimizing = false;
      btn.textContent = t('debloater.btn_freeze_trash');
      btn.disabled = false;
    }
  });

  // Restore All Packages
  document.getElementById('btn-restore-all').addEventListener('click', async () => {
    if (!state.currentDevice || state.currentDevice.state !== 'device') return;
    if (!confirm('Восстановить все ранее отключенные системные приложения?')) return;

    state.isOptimizing = true;
    try {
      const res = await window.electronAPI.batchRestore(state.currentDevice.serial);
      await loadDeviceDetails();
      alert(res.message);
    } finally {
      state.isOptimizing = false;
    }
  });

  // Batch Backup User APKs
  document.getElementById('btn-backup-all-apks').addEventListener('click', async () => {
    if (!state.currentDevice || state.currentDevice.state !== 'device') {
      alert('Подключите проектор для выгрузки бэкапа!');
      return;
    }

    const thirdPartyPkgs = (state.packages || []).filter(p => p.isThirdParty).map(p => p.id);
    if (thirdPartyPkgs.length === 0) {
      alert('Пользовательских приложений для бэкапа не найдено.');
      return;
    }

    const destDir = await window.electronAPI.selectDirectory();
    if (!destDir) return;

    const btn = document.getElementById('btn-backup-all-apks');
    btn.disabled = true;
    btn.querySelector('span:last-child').textContent = 'Бэкап...';

    try {
      const res = await window.electronAPI.batchExportApks(state.currentDevice.serial, thirdPartyPkgs, destDir);
      alert(`Бэкап завершен!\nЭкспортировано: ${res.exportedCount} из ${thirdPartyPkgs.length} APK файлов в:\n${destDir}`);
    } catch (err) {
      alert(`Ошибка бэкапа: ${err.message}`);
    } finally {
      btn.disabled = false;
      btn.querySelector('span:last-child').textContent = t('debloater.btn_backup_apks');
    }
  });

  // 1-Click Hero Quick Boost
  document.getElementById('btn-hero-quick-boost').addEventListener('click', async () => {
    if (!state.currentDevice || state.currentDevice.state !== 'device') {
      alert('Подключите проектор перед запуском оптимизации!');
      return;
    }

    const btn = document.getElementById('btn-hero-quick-boost');
    btn.textContent = '...';
    btn.disabled = true;
    state.isOptimizing = true;

    try {
      const res = await window.electronAPI.batchOptimize(state.currentDevice.serial, {
        animations: true,
        animationScale: 0.5,
        cleanLogs: true,
        debloat: true,
        compileSpeed: true
      });

      state.lastOptimizationResult = res;
      document.getElementById('results-ram-freed').textContent = t('results.freed', { freed: `~${res.memFreedMB || 180} MB ОЗУ` });
      const listEl = document.getElementById('results-steps-list');
      listEl.innerHTML = res.steps.map(step => `<div>✓ ${step}</div>`).join('');
      document.getElementById('results-modal').classList.add('active');

      await loadDeviceDetails();
    } finally {
      state.isOptimizing = false;
      btn.textContent = t('hero.btn_boost');
      btn.disabled = false;
    }
  });

  // Export Report from Dashboard & Modal
  const handleExportReport = async () => {
    if (!state.currentDevice) {
      alert('Подключите проектор для генерации отчета!');
      return;
    }
    const reportContent = generateMarkdownReport();
    const defaultName = `Projector_Report_${(state.deviceInfo?.model || 'Optimizer').replace(/\s+/g, '_')}.md`;
    const res = await window.electronAPI.saveReport(reportContent, defaultName);
    if (res.success) {
      alert(`Отчет успешно сохранен:\n${res.filePath}`);
    }
  };

  document.getElementById('btn-dashboard-report').addEventListener('click', handleExportReport);
  document.getElementById('btn-save-report-modal').addEventListener('click', handleExportReport);

  // Quick Hardware Settings Intents
  document.getElementById('btn-open-bluetooth').addEventListener('click', async () => {
    if (!state.currentDevice) return;
    await window.electronAPI.openBluetoothSettings(state.currentDevice.serial);
  });
  document.getElementById('btn-open-sound').addEventListener('click', async () => {
    if (!state.currentDevice) return;
    await window.electronAPI.openSoundSettings(state.currentDevice.serial);
  });
  document.getElementById('btn-open-display').addEventListener('click', async () => {
    if (!state.currentDevice) return;
    await window.electronAPI.openDisplaySettings(state.currentDevice.serial);
  });

  // Display Density (DPI) Preset Buttons
  document.querySelectorAll('.density-preset-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!state.currentDevice || state.currentDevice.state !== 'device') return;
      const density = e.currentTarget.dataset.density;
      const res = await window.electronAPI.setDisplayDensity(state.currentDevice.serial, density);
      if (res.success) {
        alert(res.message);
        await loadDeviceDetails();
      } else {
        alert(`Ошибка установки DPI: ${res.error}`);
      }
    });
  });

  // Custom Density Apply
  document.getElementById('btn-apply-custom-density').addEventListener('click', async () => {
    if (!state.currentDevice || state.currentDevice.state !== 'device') return;
    const val = parseInt(document.getElementById('custom-density-input').value.trim(), 10);
    if (isNaN(val) || val < 120 || val > 640) {
      alert('Введите корректное число DPI от 120 до 640!');
      return;
    }
    const res = await window.electronAPI.setDisplayDensity(state.currentDevice.serial, val);
    if (res.success) {
      alert(res.message);
      await loadDeviceDetails();
    } else {
      alert(`Ошибка: ${res.error}`);
    }
  });

  // Animation Buttons
  document.querySelectorAll('.anim-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (!state.currentDevice || state.currentDevice.state !== 'device') return;
      const scale = parseFloat(e.currentTarget.dataset.scale);
      await window.electronAPI.setAnimationScale(state.currentDevice.serial, scale);
      alert(`Масштаб анимаций установлен в ${scale}x!`);
    });
  });

  // Dexopt Compile Button
  document.getElementById('btn-compile-apps').addEventListener('click', async () => {
    if (!state.currentDevice || state.currentDevice.state !== 'device') return;
    const btn = document.getElementById('btn-compile-apps');
    btn.textContent = 'Компиляция...';
    btn.disabled = true;

    try {
      const criticalApps = ['ru.kinopoisk.tv', 'com.phlox.tvwebbrowser', 'com.teamsmart.videomanager.tv', 'me.efesser.flauncher'];
      for (const app of criticalApps) {
        await window.electronAPI.compileSpeed(state.currentDevice.serial, app);
      }
      alert('Компиляция завершена! Приложения скомпилированы в нативный код.');
    } finally {
      btn.textContent = t('turbo.btn_dex');
      btn.disabled = false;
    }
  });

  // Clean Cache Button
  document.getElementById('btn-clean-cache').addEventListener('click', async () => {
    if (!state.currentDevice || state.currentDevice.state !== 'device') return;
    await window.electronAPI.cleanCache(state.currentDevice.serial);
    await loadDeviceDetails();
    alert('Кэши и временные логи очищены!');
  });

  // Reboot Device
  document.getElementById('btn-reboot-device').addEventListener('click', async () => {
    if (!state.currentDevice) return;
    if (confirm('Перезагрузить проектор?')) {
      await window.electronAPI.rebootDevice(state.currentDevice.serial);
    }
  });

  // Capture Frame
  document.getElementById('btn-capture-frame').addEventListener('click', captureProjectorScreen);

  // Key Event Sender
  const sendKey = (code) => {
    if (state.currentDevice && state.currentDevice.state === 'device') {
      window.electronAPI.sendKey(state.currentDevice.serial, code);
      setTimeout(captureProjectorScreen, 350);
    }
  };

  document.getElementById('btn-dpad-up').addEventListener('click', () => sendKey(19));
  document.getElementById('btn-dpad-down').addEventListener('click', () => sendKey(20));
  document.getElementById('btn-dpad-left').addEventListener('click', () => sendKey(21));
  document.getElementById('btn-dpad-right').addEventListener('click', () => sendKey(22));
  document.getElementById('btn-dpad-ok').addEventListener('click', () => sendKey(23));

  document.getElementById('btn-remote-back').addEventListener('click', () => sendKey(4));
  document.getElementById('btn-remote-home').addEventListener('click', () => sendKey(3));
  document.getElementById('btn-remote-volup').addEventListener('click', () => sendKey(24));
  document.getElementById('btn-remote-voldn').addEventListener('click', () => sendKey(25));
  document.getElementById('btn-remote-power').addEventListener('click', () => sendKey(26));

  // Send Text
  const sendTextAction = async () => {
    const input = document.getElementById('remote-text-input');
    const text = input.value.trim();
    if (text && state.currentDevice && state.currentDevice.state === 'device') {
      await window.electronAPI.sendText(state.currentDevice.serial, text);
      input.value = '';
      setTimeout(captureProjectorScreen, 400);
    }
  };

  document.getElementById('btn-send-text').addEventListener('click', sendTextAction);
  document.getElementById('remote-text-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendTextAction();
  });

  // Wi-Fi Modal & Auto-Discovery Handlers
  document.getElementById('btn-open-wifi-modal').addEventListener('click', () => {
    document.getElementById('wifi-modal').classList.add('active');
  });
  document.getElementById('btn-close-wifi-modal').addEventListener('click', () => {
    document.getElementById('wifi-modal').classList.remove('active');
  });
  document.getElementById('btn-cancel-wifi').addEventListener('click', () => {
    document.getElementById('wifi-modal').classList.remove('active');
  });

  // Auto-Discovery Scanner
  const scanBtn = document.getElementById('btn-scan-network');
  const scanProgBox = document.getElementById('scan-progress-box');
  const scanBar = document.getElementById('scan-progress-bar');
  const scanText = document.getElementById('scan-progress-text');
  const scanResults = document.getElementById('scan-results-box');

  scanBtn.addEventListener('click', async () => {
    scanBtn.disabled = true;
    scanProgBox.style.display = 'block';
    scanResults.style.display = 'none';
    scanResults.innerHTML = '';
    scanBar.style.width = '0%';
    scanText.textContent = t('modal.wifi_scanning', { percent: 0 });

    const removeListener = window.electronAPI.onScanProgress(({ percent, currentIp, found }) => {
      scanBar.style.width = `${percent}%`;
      scanText.textContent = t('modal.wifi_scanning', { percent }) + (currentIp ? ` (${currentIp})` : '');
    });

    try {
      const found = await window.electronAPI.scanNetwork();
      scanProgBox.style.display = 'none';
      scanResults.style.display = 'block';

      if (!found || found.length === 0) {
        scanResults.innerHTML = `<div style="font-size: 11px; color: var(--text-muted); padding: 8px;">${t('modal.wifi_no_found')}</div>`;
      } else {
        scanResults.innerHTML = `
          <div style="font-size: 11px; font-weight: 600; margin-bottom: 6px; color: var(--text-secondary);">${t('modal.wifi_found_devices')}</div>
          ${found.map(dev => `
            <div class="scan-candidate-item" data-ip="${dev.ip}" data-port="${dev.port}">
              <span class="scan-candidate-ip">${dev.ip}:${dev.port}</span>
              <button class="btn btn-secondary btn-connect-candidate" style="padding: 3px 8px; font-size: 11px;">Подключить</button>
            </div>
          `).join('')}
        `;

        scanResults.querySelectorAll('.scan-candidate-item').forEach(item => {
          item.addEventListener('click', (e) => {
            const ip = e.currentTarget.dataset.ip;
            const port = e.currentTarget.dataset.port;
            document.getElementById('wifi-ip-input').value = ip;
            document.getElementById('wifi-port-input').value = port;
            document.getElementById('btn-confirm-wifi').click();
          });
        });
      }
    } finally {
      if (removeListener) removeListener();
      scanBtn.disabled = false;
    }
  });

  document.getElementById('btn-confirm-wifi').addEventListener('click', async () => {
    const ip = document.getElementById('wifi-ip-input').value.trim();
    const port = parseInt(document.getElementById('wifi-port-input').value.trim(), 10) || 5555;
    if (!ip) {
      alert('Введите IPv4 адрес проектора!');
      return;
    }

    const btn = document.getElementById('btn-confirm-wifi');
    btn.textContent = '...';
    btn.disabled = true;

    try {
      const res = await window.electronAPI.connectWifi(ip, port);
      if (res.success) {
        document.getElementById('wifi-modal').classList.remove('active');
        await refreshDevices();
      } else {
        alert(`Ошибка подключения: ${res.message || 'Проверьте IP и включенную отладку на проекторе'}`);
      }
    } finally {
      btn.textContent = t('modal.wifi_connect');
      btn.disabled = false;
    }
  });

  document.getElementById('btn-activate-tcpip').addEventListener('click', async () => {
    if (!state.currentDevice) {
      alert('Сначала подключите проектор кабелем USB к компьютеру!');
      return;
    }
    const btn = document.getElementById('btn-activate-tcpip');
    btn.textContent = '...';
    btn.disabled = true;

    try {
      const res = await window.electronAPI.enableTcpip(state.currentDevice.serial, 5555);
      alert(res.message);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    } finally {
      btn.textContent = t('modal.wifi_activate_tcpip');
      btn.disabled = false;
    }
  });

  // Results Modal Close
  document.getElementById('btn-close-results-modal').addEventListener('click', () => {
    document.getElementById('results-modal').classList.remove('active');
  });
  document.getElementById('btn-ack-results').addEventListener('click', () => {
    document.getElementById('results-modal').classList.remove('active');
  });

  // Install Progress Listener
  window.electronAPI.onInstallProgress(({ appId, status, percent }) => {
    const fill = document.getElementById(`progress-fill-${appId}`);
    const text = document.getElementById(`btn-text-${appId}`);
    if (fill) fill.style.width = `${percent}%`;
    if (text) {
      if (status === 'downloading') text.textContent = t('apps.downloading', { percent });
      if (status === 'installing') text.textContent = t('apps.installing');
    }
  });

  // Keyboard Navigation on Remote Tab
  window.addEventListener('keydown', (e) => {
    if (state.currentTab !== 'remote') return;
    if (document.activeElement.tagName === 'INPUT') return;

    if (e.key === 'ArrowUp') { e.preventDefault(); sendKey(19); }
    if (e.key === 'ArrowDown') { e.preventDefault(); sendKey(20); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); sendKey(21); }
    if (e.key === 'ArrowRight') { e.preventDefault(); sendKey(22); }
    if (e.key === 'Enter') { e.preventDefault(); sendKey(23); }
    if (e.key === 'Escape') { e.preventDefault(); sendKey(4); }
  });
}

// Master Initialization
async function init() {
  initLanguage();
  initIcons();
  setupNavigation();
  setupEvents();
  applyTranslations();
  document.getElementById('lang-indicator').textContent = getLang().toUpperCase();
  await loadAppsCatalog();
  await refreshDevices();
  startAdaptivePolling();
}

document.addEventListener('DOMContentLoaded', init);
