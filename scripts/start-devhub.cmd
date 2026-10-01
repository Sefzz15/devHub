@echo off
REM Build and start the whole devHub stack (mysql, backend, websocket, caddy).
REM Self-contained: the compose file lives in this repo under deploy\.
REM Still needs the sibling API repos:  repos\backend  and  repos\websocket-server
setlocal

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
