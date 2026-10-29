# 📽️ Android Projector Optimizer

<p align="center">
  <img src="./screen.png" alt="Android Projector Optimizer Interface" width="850" style="border-radius: 8px;" />
</p>

<p align="center">
  <a href="https://github.com/asakue/android-projector-optimizer/releases/latest"><img src="https://img.shields.io/github/v/release/asakue/android-projector-optimizer?style=for-the-badge&color=00e5ff" alt="Latest Release" /></a>
  <img src="https://img.shields.io/badge/Platform-Windows%20x64-10b981?style=for-the-badge" alt="Windows x64" />
  <img src="https://img.shields.io/badge/License-MIT-ffb020?style=for-the-badge" alt="License MIT" />
  <img src="https://img.shields.io/badge/Language-English%20%7C%20Русский-00e5ff?style=for-the-badge" alt="Bilingual" />
</p>

---

<p align="center">
  <b><a href="#english">English Documentation</a></b> | <b><a href="#русский">Русская документация</a></b>
</p>

---

<a name="english"></a>
## 🇬🇧 English

**Android Projector Optimizer** is an open-source desktop application designed to optimize, debloat, accelerate, and customize any budget Android projector (*Magcubic HY300, HY320, Wanbo T2/T4/T6/X5, Salange, Transpeed, XGIMI, and generic devices powered by Allwinner, Amlogic, or Rockchip*).

### ⬇️ Download
* **[Download AndroidProjectorOptimizer.exe (Portable)](https://github.com/asakue/android-projector-optimizer/releases/latest)** — Standalone portable binary, ready to run without installation.

---

### ✨ Key Features

1. **🔍 Wi-Fi Auto-Discovery (Zero-Config)**:
   - **One-click Network Scan**: Automatically probes your local subnet for open ADB ports (port 5555) without requiring you to manually check router tables or type IP addresses.
   - **Built-in ADB Engine**: Comes bundled with Google's official `platform-tools`. No command-line setup or environment variables required.

2. **🛡️ 100% Brick-Proof Debloater**:
   - Safely disables Chinese adware, hidden telemetry daemons, and background bloatware using `pm disable-user --user 0`.
   - **Hardware Whitelist Protection**: Optical motors, keystone trapezoid calibration, and input drivers are strictly protected from accidental modification.
   - **1-Click Restore**: Immediately re-enables all disabled packages back to factory defaults at any time.

3. **🎯 Display Density (DPI) & Turbo Boost**:
   - **DPI Tuner**: Adjust UI scale via `wm density` (240 compact, 280 balanced, 320 standard). Makes the projector interface sharp and displays more app tiles on the screen.
   - **System Animation Speedup**: Safely sets transition scales to 0.5x or 0x for 2–3x snappier navigation.
   - **AOT Dexopt Speed Compilation**: Ahead-of-time precompilation of popular media apps (`SmartTube`, `TV-Bro`, launchers) into native machine code, removing frame drops and startup lag.
   - **Deep Cache & Crash Log Purge**: Automatically cleans `/sdcard/Documents/log/*` and performs system cache trimming up to 1000 MB.

4. **🔊 Quick Hardware & System Intents**:
   - 1-click shortcuts to launch projector **Bluetooth pairing**, **Sound & volume settings**, and **Display adjustments**, bypassing obscure Chinese system menus.

5. **💾 User App Backup (APK Export)**:
   - Export installed user apps (`.apk`) from the projector directly to your PC before performing experiments or factory resets.
   - Supports both single-package export and batch backup.

6. **📄 Optimization Summary Report**:
   - Export detailed Markdown/Text reports detailing hardware specs, freed RAM, disabled packages, screen DPI, and applied tweaks.

7. **📦 Curated Lightweight TV App Hub**:
   - **TV-Bro**: Ultra-lightweight TV browser with ad-blocker (~40 MB RAM vs 400+ MB for Chrome).
   - **SmartTube**: Ad-free YouTube with SponsorBlock, 4K/60fps, and background audio.
   - **FLauncher**: Fast, open-source minimalist Android TV launcher.
   - **Nova Video Player**: Hardware-accelerated video playback across network shares (SMB/NFS).
   - **Aptoide TV**: TV-compatible app catalog for streaming services without a Google account.

8. **📱 Live Screen Mirror & Remote Control**:
   - Real-time projector display preview directly inside the desktop window.
   - Tactile D-Pad with full PC keyboard navigation (Arrow keys, Enter, Back, Home).
   - **Keyboard Text Input**: Type search queries and passwords from your PC keyboard straight into projector text fields (with full Unicode/Cyrillic support).

9. **🌐 Bilingual Interface**:
   - Instant toggle between **English** and **Russian** (saved across sessions).

---

### 🚀 Quick Start Guide

1. Download and run:
   ```text
   AndroidProjectorOptimizer.exe
   ```
   *(Or clone the repository and run `npm start`)*.

2. Enable **USB Debugging** on your projector:
   - Go to **Settings** -> **About Device** -> click **Build number** 7 times until you see *"You are now a developer!"*.
   - Open the **Developer Options** menu and turn on **USB Debugging**.
   - When prompted with *"Allow USB debugging from this computer?"*, check **Always allow** and click **OK**.

3. For Wi-Fi connection:
   - Click **Connect via Wi-Fi** in the top bar.
   - Click **🔍 Auto-Discover Projector** to detect your device, or enter the projector IP address.

---

<a name="русский"></a>
## 🇷🇺 Русский

**Android Projector Optimizer** — это десктопное приложение для комплексной оптимизации, безопасного деблоатинга, ускорения и кастомизации любых Android-проекторов (*Magcubic HY300, HY320, Wanbo T2/T4/T6/X5, Salange, Transpeed, XGIMI и любых устройств на Amlogic, Allwinner, Rockchip*).

### ⬇️ Скачивание
* **[Скачать AndroidProjectorOptimizer.exe (Портативная версия)](https://github.com/asakue/android-projector-optimizer/releases/latest)** — Автономный `.exe` файл, готовый к запуску без установки.

---

### 🌟 Ключевые возможности

1. **🔍 Автопоиск в Wi-Fi сети (Auto-Discovery)**:
   - **Сканирование сети в 1 клик**: Автоматический быстрый поиск открытого ADB-порта (5555) в вашей подсети. Вам не нужно заходить в роутер или вручную вбивать IP-адрес.
   - **Встроенный ADB Bridge**: Включает официальные Google `platform-tools`. Никаких консольных команд или настройки переменных окружения.

2. **🛡️ 100% безопасная очистка (Fail-Safe Debloat)**:
   - Распознает китайские рекламные лаунчеры, скрытые сервисы телеметрии и спам-маркеты.
   - Отключает мусор через команду `pm disable-user --user 0` (вместо жесткого удаления системных файлов), что гарантирует **защиту от окирпичивания**.
   - **Аппаратный белый список**: Моторы оптики, коррекция трапеции (Keystone) и драйверы ввода защищены от отключения.
   - Кнопка **«Восстановить всё»** моментально возвращает все системные пакеты в заводское состояние в 1 клик.

3. **🎯 Настройка плотности экрана (DPI) и Турбо-ускорение**:
   - **Тюнер DPI**: Настройка плотности интерфейса через `wm density` (240 компактный, 280 сбалансированный, 320 стандартный). Делает картинку резче и отображает больше плиток контента.
   - **Масштаб системных анимаций**: Безопасное переключение в 0.5x или 0x (интерфейс проектора становится в 2–3 раза отзывчивее).
   - **Dexopt AOT Speed-компиляция**: Компилирует байт-код популярных медиа-приложений (`SmartTube`, `TV-Bro`, лаунчеры) в нативный машинный код чипсета, полностью устраняя лаги и просадки кадров.
   - **Глубокая очистка кэшей**: Удаление мусорных логов `/sdcard/Documents/log/*` и принудительный тримминг кэша до 1000 МБ.

4. **🔊 Быстрый доступ к настройкам Bluetooth / звука**:
   - Мгновенный вызов меню сопряжения **Bluetooth-колонок**, **настроек звука** и **дисплея**, минуя запутанные китайские меню.

5. **💾 Бэкап приложений (APK Export)**:
   - Выгрузка установленных сторонних программ с проектора на ПК перед экспериментами или сбросом до заводских настроек.

6. **📄 Экспорт отчёта об оптимизации**:
   - Сохранение форматированного отчета в Markdown/TXT с характеристиками устройства, освобожденным ОЗУ, списком отключенных пакетов и параметрами DPI.

7. **📦 Каталог легковесных TV-приложений (App Hub)**:
   - **TV-Bro**: Сверхлегкий браузер для Android TV с блокировщиком рекламы и управлением пультом (~40 МБ ОЗУ).
   - **SmartTube**: Просмотр YouTube без рекламы, с SponsorBlock, поддержкой 4K/60fps и фоновым воспроизведением.
   - **FLauncher**: Открытый минималистичный лаунчер без зависаний и рекламы.
   - **Nova Video Player**: Плеер с идеальным аппаратным декодированием видео (поддержка SMB/NFS).
   - **Aptoide TV Store**: Каталог приложений для установки кинотеатров без Google-аккаунта.

8. **📱 Виртуальный пульт и живой экран (Live Remote & Screen Mirror)**:
   - Просмотр экрана проектора прямо в окне приложения.
   - Тактильный D-Pad (Вверх, Вниз, Влево, Вправо, OK), кнопки Home, Back, Power, Volume +/-.
   - Управление с клавиатуры ПК (стрелки, Enter, Escape).
   - **Быстрый ввод текста**: Печать поисковых запросов и паролей с клавиатуры компьютера напрямую в поле ввода проектора (с поддержкой кириллицы).

9. **🌐 Двуязычный интерфейс (RU / EN)**:
   - Мгновенное переключение языка интерфейса в шапке программы с сохранением настроек.

---

### 🚀 Быстрый запуск

1. Запустите файл:
   ```text
   AndroidProjectorOptimizer.exe
   ```
   *(Или в терминале разработчика: `npm start`)*.

2. На проекторе включите **Отладку по USB**:
   - Перейдите в **Настройки** -> **Об устройстве** -> нажмите 7 раз на **Номер сборки** (Build number), пока не появится надпись *"Вы стали разработчиком!"*.
   - Откройте появившееся меню **Для разработчиков** и включите тумблер **«Отладка по USB»** (USB Debugging).
   - При подключении кабеля к ПК на проекторе появится окно с вопросом *"Разрешить отладку с этого компьютера?"* — поставьте галочку и нажмите **«Разрешить» (OK)**.

3. Для подключения по Wi-Fi:
   - Нажмите в верхней панели **«Подключить по Wi-Fi»**.
   - Нажмите **«🔍 Найти проектор в сети»** для автоматического обнаружения или введите IP-адрес вручную.

---

## 🎨 Дизайн и эстетика

Интерфейс спроектирован по канонам дизайн-системы **`data-terminal / true-black-flat`**:
- Глубокий обсидиановый фон (`#090a0d`), отсутствие шаблонных градиентов и дешевых теней.
- Акцентный оптический цвет **Luma Cyan (`#00e5ff`)**, отсылающий к оптике и лучу проектора.
- Единый авторский сет векторных SVG-иконок на сетке 24×24 px с оптическим балансом.
- Чистые моноширинные числовые индикаторы телеметрии памяти (`font-feature-settings: "tnum"`).

---

## 📄 Лицензия

Распространяется под свободной лицензией [MIT](LICENSE).
