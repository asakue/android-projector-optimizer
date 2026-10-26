@echo off
chcp 65001 >nul
title Android Projector Optimizer
cd /d "%~dp0"

echo ========================================================
echo    Android Projector Optimizer
echo    Запуск приложения для оптимизации проекторов...
echo ========================================================

call npx electron src/main/main.cjs
if %errorlevel% neq 0 (
    echo.
    echo [Ошибка] Не удалось запустить приложение. Проверяем зависимости...
    call npm install
    call npx electron src/main/main.cjs
)
