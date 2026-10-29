// Bilingual Internationalization (RU / EN) for Android Projector Optimizer

export const translations = {
  ru: {
    // Brand & Navigation
    'brand.title': 'Projector Optimizer',
    'brand.version': 'Android v1.1',
    'nav.dashboard': 'Дашборд',
    'nav.debloater': 'Очистка мусора',
    'nav.turbo': 'Турбо-ускорение',
    'nav.apps': 'Каталог TV-приложений',
    'nav.remote': 'Экран & Пульт',

    // Connection Status
    'conn.waiting': 'Ожидание...',
    'conn.online': 'Онлайн',
    'conn.disconnected': 'Отключено',
    'conn.no_device': 'Проектор не найден',
    'conn.connect_hint': 'Подключите USB или Wi-Fi',
    'conn.unauthorized_title': 'Внимание: экран проектора',
    'conn.unauthorized_hint': 'Нажмите «Разрешить отладку» на проекторе',
    'conn.offline': 'Устройство оффлайн',
    'conn.offline_hint': 'Проверьте питание или переподключите',
    'conn.refresh_tooltip': 'Обновить список устройств',

    // Top Bar
    'topbar.dashboard': 'Дашборд и телеметрия',
    'topbar.debloater': 'Очистка от китайского мусора и рекламы',
    'topbar.turbo': 'Турбо-ускорение и настройка экрана',
    'topbar.apps': 'Каталог легких TV-приложений',
    'topbar.remote': 'Трансляция экрана и виртуальный пульт',
    'topbar.btn_wifi': 'Подключить по Wi-Fi',
    'topbar.btn_reboot': 'Перезагрузить',

    // Dashboard Hero & KPIs
    'hero.title': 'Оптимизация проектора в 1 клик',
    'hero.desc': 'Ускорение анимаций в 2 раза, заморозка рекламного мусора, очистка кэшей и dexopt-компиляция медиа-приложений без риска для прошивки.',
    'hero.btn_boost': 'Турбо-оптимизация',
    'hero.btn_report': 'Экспорт отчёта',

    'kpi.ram': 'Оперативная память',
    'kpi.ram_free': 'Свободно: {free} MB',
    'kpi.storage': 'Внутренняя память',
    'kpi.storage_free': 'Свободно: {free}',
    'kpi.soc': 'Чипсет & Экран',
    'kpi.resolution': 'Разрешение: {res}',
    'kpi.cleanliness': 'Чистота системы',
    'kpi.packages_found': 'Обнаружено пакетов: {count}',

    // Quick Hardware Settings
    'quick.title': 'Быстрые системные настройки проектора',
    'quick.bluetooth': 'Bluetooth устройства',
    'quick.sound': 'Настройки звука',
    'quick.display': 'Дисплей и масштаб',

    // Hardware Specs
    'specs.title': 'Параметры подключенного оборудования',
    'specs.model': 'Модель устройства',
    'specs.android': 'Версия Android & SDK',
    'specs.brand': 'Производитель / Бренд',

    // Debloater
    'debloater.search_ph': 'Поиск по названию или пакету...',
    'debloater.filter_all': 'Все',
    'debloater.filter_rec': 'Рекомендованные',
    'debloater.filter_dis': 'Отключенные',
    'debloater.filter_third': 'Пользовательские',
    'debloater.btn_restore_all': 'Восстановить всё',
    'debloater.btn_freeze_trash': 'Заморозить мусор',
    'debloater.btn_backup_apks': 'Бэкап всех APK',
    'debloater.empty_hint': 'Подключите проектор для загрузки списка установленных приложений...',
    'debloater.col_name': 'ПАКЕТ И НАЗНАЧЕНИЕ',
    'debloater.col_cat': 'КАТЕГОРИЯ',
    'debloater.col_risk': 'СТАТУС БЕЗОПАСНОСТИ',
    'debloater.col_action': 'ДЕЙСТВИЕ',
    'debloater.badge_disabled': 'Отключен',
    'debloater.badge_active': 'Активен',
    'debloater.badge_protected': 'Защищен',
    'debloater.btn_freeze': 'Заморозить',
    'debloater.btn_restore': 'Включить',
    'debloater.btn_export': 'Экспорт APK',

    // Turbo Optimizer
    'turbo.anim_title': 'Масштаб системных анимаций',
    'turbo.anim_desc': 'По умолчанию Android использует медленные анимации переходов (1.0x). Ускорение делает проектор субъективно в 2-3 раза быстрее.',
    'turbo.anim_0': '0x (Отключить)',
    'turbo.anim_05': '0.5x (Рекомендуется)',
    'turbo.anim_1': '1.0x (Стандарт)',

    'turbo.density_title': 'Плотность экрана (DPI)',
    'turbo.density_desc': 'Настройка плотности интерфейса. Меньший DPI делает интерфейс четче и компактнее, вмещая больше плиток приложений, как на премиальных ТВ-боксах.',
    'turbo.density_current': 'Текущая плотность: {val} DPI',
    'turbo.density_compact': '240 (Компактный)',
    'turbo.density_balanced': '280 (Рекомендуется)',
    'turbo.density_standard': '320 (Стандартный)',
    'turbo.density_reset': 'Сбросить (Заводской)',
    'turbo.density_apply': 'Применить DPI',

    'turbo.dex_title': 'AOT Speed-компиляция приложений',
    'turbo.dex_desc': 'Компилирует байт-код популярных медиа-приложений в нативный машинный код чипсета. Полностью устраняет задержки запуска и дропы кадров.',
    'turbo.btn_dex': 'Скомпилировать плееры и лаунчер',

    'turbo.cache_title': 'Глубокая очистка временных логов и кэшей',
    'turbo.cache_desc': 'Удаляет мусорные журналы крашей /sdcard/Documents/log/* и производит системный тримминг кэша до 1000 МБ.',
    'turbo.btn_cache': 'Очистить кэш и мусорные логи',

    // App Hub
    'apps.install': 'Установить на проектор',
    'apps.downloading': 'Загрузка {percent}%...',
    'apps.installing': 'Установка...',
    'apps.installed': 'Установлено',

    // Remote
    'remote.mirror_title': 'Экран проектора в реальном времени',
    'remote.btn_capture': 'Сделать снимок',
    'remote.placeholder': 'Нажмите «Сделать снимок» для просмотра экрана',
    'remote.panel_title': 'Пульт управления',
    'remote.text_ph': 'Ввести текст на проекторе...',
    'remote.btn_send': 'Ввод',

    // Wi-Fi Auto-Discovery Modal
    'modal.wifi_title': 'Беспроводное подключение ADB',
    'modal.wifi_desc': 'Убедитесь, что проектор и компьютер подключены к одной Wi-Fi сети.',
    'modal.wifi_scan_btn': '🔍 Найти проектор в сети',
    'modal.wifi_scanning': 'Сканирование локальной сети ({percent}%)...',
    'modal.wifi_found_devices': 'Найденные устройства:',
    'modal.wifi_no_found': 'В сети пока не найден открытый порт ADB. Проверьте отладку по сети.',
    'modal.wifi_connect': 'Подключить',
    'modal.wifi_cancel': 'Отмена',
    'modal.wifi_ip_ph': 'Например: 192.168.1.145',
    'modal.wifi_usb_hint': 'Если проектор сейчас подключен кабелем USB:',
    'modal.wifi_activate_tcpip': 'Активировать режим Wi-Fi (adb tcpip 5555)',

    // Optimization Results Modal
    'results.title': 'Отчет об оптимизации',
    'results.heading': 'Турбо-оптимизация завершена!',
    'results.freed': 'Освобождено памяти: {freed}',
    'results.btn_save': 'Экспорт отчета в файл',
    'results.btn_ack': 'Отлично'
  },

  en: {
    // Brand & Navigation
    'brand.title': 'Projector Optimizer',
    'brand.version': 'Android v1.1',
    'nav.dashboard': 'Dashboard',
    'nav.debloater': 'Junk Cleaner',
    'nav.turbo': 'Turbo Boost',
    'nav.apps': 'TV App Catalog',
    'nav.remote': 'Screen & Remote',

    // Connection Status
    'conn.waiting': 'Waiting...',
    'conn.online': 'Online',
    'conn.disconnected': 'Disconnected',
    'conn.no_device': 'Projector not found',
    'conn.connect_hint': 'Connect via USB or Wi-Fi',
    'conn.unauthorized_title': 'Attention: Projector Display',
    'conn.unauthorized_hint': 'Tap "Allow USB Debugging" on projector screen',
    'conn.offline': 'Device offline',
    'conn.offline_hint': 'Check power or reconnect cable',
    'conn.refresh_tooltip': 'Refresh device list',

    // Top Bar
    'topbar.dashboard': 'Dashboard & Telemetry',
    'topbar.debloater': 'Debloater & Adware Removal',
    'topbar.turbo': 'Turbo Boost & Display Tuning',
    'topbar.apps': 'Lightweight TV App Hub',
    'topbar.remote': 'Screen Mirror & Virtual Remote',
    'topbar.btn_wifi': 'Connect via Wi-Fi',
    'topbar.btn_reboot': 'Reboot Device',

    // Dashboard Hero & KPIs
    'hero.title': '1-Click Projector Optimization',
    'hero.desc': '2x animation speedup, background adware freeze, deep cache purge, and AOT Dexopt acceleration without bricking firmware.',
    'hero.btn_boost': 'Turbo Optimize',
    'hero.btn_report': 'Export Report',

    'kpi.ram': 'RAM Usage',
    'kpi.ram_free': 'Free: {free} MB',
    'kpi.storage': 'Internal Storage',
    'kpi.storage_free': 'Free: {free}',
    'kpi.soc': 'Chipset & Screen',
    'kpi.resolution': 'Resolution: {res}',
    'kpi.cleanliness': 'System Cleanliness',
    'kpi.packages_found': 'Packages detected: {count}',

    // Quick Hardware Settings
    'quick.title': 'Quick Hardware & System Intents',
    'quick.bluetooth': 'Bluetooth Devices',
    'quick.sound': 'Sound Settings',
    'quick.display': 'Display & Scaling',

    // Hardware Specs
    'specs.title': 'Connected Hardware Specifications',
    'specs.model': 'Device Model',
    'specs.android': 'Android & SDK Version',
    'specs.brand': 'Manufacturer / Brand',

    // Debloater
    'debloater.search_ph': 'Search by app name or package ID...',
    'debloater.filter_all': 'All',
    'debloater.filter_rec': 'Recommended',
    'debloater.filter_dis': 'Disabled',
    'debloater.filter_third': 'User Apps',
    'debloater.btn_restore_all': 'Restore All',
    'debloater.btn_freeze_trash': 'Freeze Junk',
    'debloater.btn_backup_apks': 'Backup All APKs',
    'debloater.empty_hint': 'Connect projector to load installed applications list...',
    'debloater.col_name': 'PACKAGE & PURPOSE',
    'debloater.col_cat': 'CATEGORY',
    'debloater.col_risk': 'SAFETY STATUS',
    'debloater.col_action': 'ACTION',
    'debloater.badge_disabled': 'Disabled',
    'debloater.badge_active': 'Active',
    'debloater.badge_protected': 'Protected',
    'debloater.btn_freeze': 'Freeze',
    'debloater.btn_restore': 'Enable',
    'debloater.btn_export': 'Export APK',

    // Turbo Optimizer
    'turbo.anim_title': 'System Animation Scale',
    'turbo.anim_desc': 'By default, Android uses sluggish 1.0x transition scales. Speeding it up makes UI navigation 2-3x snappier.',
    'turbo.anim_0': '0x (Off)',
    'turbo.anim_05': '0.5x (Recommended)',
    'turbo.anim_1': '1.0x (Standard)',

    'turbo.density_title': 'Display Density (DPI)',
    'turbo.density_desc': 'Adjust UI scale. Lower DPI makes interface sharper, more compact, and displays more content tiles like modern TV boxes.',
    'turbo.density_current': 'Current Density: {val} DPI',
    'turbo.density_compact': '240 (Compact)',
    'turbo.density_balanced': '280 (Recommended)',
    'turbo.density_standard': '320 (Standard)',
    'turbo.density_reset': 'Reset (Default)',
    'turbo.density_apply': 'Apply DPI',

    'turbo.dex_title': 'AOT Speed Dexopt Compilation',
    'turbo.dex_desc': 'Pre-compiles DEX bytecode into native machine instructions on the projector SoC. Eliminates frame drops and startup lag.',
    'turbo.btn_dex': 'Compile Players & Launcher',

    'turbo.cache_title': 'Deep Cache & Crash Log Purge',
    'turbo.cache_desc': 'Deletes junk crash logs in /sdcard/Documents/log/* and performs system cache trimming up to 1000 MB.',
    'turbo.btn_cache': 'Purge Cache & Crash Logs',

    // App Hub
    'apps.install': 'Install on Projector',
    'apps.downloading': 'Downloading {percent}%...',
    'apps.installing': 'Installing...',
    'apps.installed': 'Installed',

    // Remote
    'remote.mirror_title': 'Real-Time Screen Mirror',
    'remote.btn_capture': 'Take Screenshot',
    'remote.placeholder': 'Click "Take Screenshot" to preview screen',
    'remote.panel_title': 'Remote Control',
    'remote.text_ph': 'Type text to send to projector...',
    'remote.btn_send': 'Send',

    // Wi-Fi Auto-Discovery Modal
    'modal.wifi_title': 'Wireless ADB Connection',
    'modal.wifi_desc': 'Ensure projector and computer are on the same Wi-Fi network.',
    'modal.wifi_scan_btn': '🔍 Auto-Discover Projector',
    'modal.wifi_scanning': 'Scanning local network ({percent}%)...',
    'modal.wifi_found_devices': 'Found Projectors:',
    'modal.wifi_no_found': 'No ADB port open in local network. Verify Wi-Fi debugging setting.',
    'modal.wifi_connect': 'Connect',
    'modal.wifi_cancel': 'Cancel',
    'modal.wifi_ip_ph': 'e.g. 192.168.1.145',
    'modal.wifi_usb_hint': 'If projector is currently plugged in via USB cable:',
    'modal.wifi_activate_tcpip': 'Enable Wi-Fi Mode (adb tcpip 5555)',

    // Optimization Results Modal
    'results.title': 'Optimization Summary',
    'results.heading': 'Turbo Optimization Complete!',
    'results.freed': 'RAM Freed: {freed}',
    'results.btn_save': 'Export Report to File',
    'results.btn_ack': 'Awesome'
  }
};

let currentLang = 'ru';

export function getLang() {
  return currentLang;
}

export function initLanguage() {
  const saved = localStorage.getItem('app_lang');
  if (saved && (saved === 'ru' || saved === 'en')) {
    currentLang = saved;
  } else {
    // Default to ru if user system is Russian, else en
    const sysLang = (navigator.language || '').toLowerCase();
    currentLang = sysLang.startsWith('ru') ? 'ru' : 'en';
  }
  return currentLang;
}

export function setLang(lang) {
  if (lang === 'ru' || lang === 'en') {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyTranslations();
  }
}

export function t(key, params = {}) {
  const dict = translations[currentLang] || translations.ru;
  let text = dict[key] || translations.ru[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return text;
}

export function applyTranslations() {
  // Update elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = t(key);
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    if (key) {
      el.placeholder = t(key);
    }
  });

  // Update titles
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      el.title = t(key);
    }
  });

  // Update HTML language attribute
  document.documentElement.lang = currentLang;

  // Dispatch custom event for dynamic components
  window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang: currentLang } }));
}
