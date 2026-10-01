@echo off
REM Same as start-devhub.cmd, but refreshes the cinema listings first.
REM Self-contained: the compose file lives in this repo under deploy\.
REM Still needs the sibling API repos:  repos\backend  and  repos\websocket-server
setlocal

for %%I in ("%~dp0..") do set "APP_DIR=%%~fI"

REM The scraper rewrites src/app/components/cinema/films.data.ts, so it has to
REM run on the host before the image is built (compose builds this repo as its
REM context). Running it inside the container would discard the result with the
REM build stage. A scrape failure is not fatal: the last snapshot gets built.
echo [1/2] Refreshing cinema listings...
pushd "%APP_DIR%" || goto :no_app
call npm run scrape:cinema
if errorlevel 1 echo         WARNING: scrape failed - building with the existing films.data.ts
popd
goto :compose

:no_app
echo         WARNING: "%APP_DIR%" not found - skipping scrape

:compose
echo.
echo [2/2] Building and starting containers...
cd /d "%~dp0..\deploy" || goto :fail
if not exist ".env" goto :no_env

docker compose up -d --build
if errorlevel 1 goto :fail

echo.
echo devHub is up.
pause
exit /b 0

:no_env
echo.
echo FAILED - deploy\.env is missing.
echo Copy deploy\.env.example to deploy\.env and fill in the real values.
pause
exit /b 1

:fail
echo.
echo FAILED - check that Docker is running and the sibling repos exist.
pause
exit /b 1
