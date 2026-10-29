@echo off
setlocal
cd /d "%~dp0"
where python >nul 2>&1
if not errorlevel 1 (
  start "CROWN OF FOOTBALL local server" /min cmd /c "python -m http.server 8000"
) else (
  where py >nul 2>&1
  if errorlevel 1 (
    echo Python 3 was not found. Install Python, or run: python -m http.server 8000
    pause
    exit /b 1
  )
  start "CROWN OF FOOTBALL local server" /min cmd /c "py -3 -m http.server 8000"
)
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8000/PLAY_NOW.html"
echo CROWN OF FOOTBALL is served at http://127.0.0.1:8000/PLAY_NOW.html
endlocal
