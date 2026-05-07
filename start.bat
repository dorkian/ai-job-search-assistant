@echo off
setlocal enabledelayedexpansion

echo.
echo  ==========================================
echo   AI Job Search Assistant - Docker Launch
echo  ==========================================
echo.

:: ─── Check Docker is installed ─────────────────────────────────────────────
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Docker is not installed or not in PATH.
    echo  Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

:: ─── Check Docker daemon is running ────────────────────────────────────────
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Docker daemon is not running.
    echo  Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

:: ─── Determine compose command (v1 or v2) ──────────────────────────────────
set COMPOSE_CMD=docker compose
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    where docker-compose >nul 2>&1
    if %errorlevel% neq 0 (
        echo  ERROR: docker compose not found.
        echo  Please update Docker Desktop to a version that includes Compose V2.
        echo.
        pause
        exit /b 1
    )
    set COMPOSE_CMD=docker-compose
)

:: ─── Ensure .env exists ────────────────────────────────────────────────────
if not exist .env (
    echo  .env not found. Creating from .env.example...
    copy .env.example .env >nul
    echo.
    echo  ACTION REQUIRED: Open .env and fill in your API keys:
    echo    - ANTHROPIC_API_KEY  (required)
    echo    - SERPAPI_KEY        (optional, needed for job search)
    echo    - TAVILY_API_KEY     (optional, needed for job search)
    echo.
    echo  Opening .env in Notepad. Save and close to continue.
    echo.
    notepad .env
    echo  Press any key to continue after saving your .env file...
    pause >nul
    echo.
)

:: ─── Ensure data directory exists ──────────────────────────────────────────
if not exist data (
    mkdir data
)

:: ─── Parse command-line argument ───────────────────────────────────────────
set ACTION=%1
if "%ACTION%"=="" set ACTION=start

if /i "%ACTION%"=="stop" goto :stop
if /i "%ACTION%"=="logs" goto :logs
if /i "%ACTION%"=="restart" goto :restart
if /i "%ACTION%"=="rebuild" goto :rebuild
if /i "%ACTION%"=="start" goto :start

echo  Unknown action: %ACTION%
echo  Usage: start.bat [start^|stop^|restart^|rebuild^|logs]
goto :end

:: ─── Start ─────────────────────────────────────────────────────────────────
:start
echo  Removing existing containers...
%COMPOSE_CMD% down
docker rm -f ai-job-search-assistant >nul 2>&1
echo  Recreating and starting containers...
%COMPOSE_CMD% up -d --build --force-recreate
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Failed to start containers. Check the output above.
    goto :end
)
goto :success

:: ─── Stop ──────────────────────────────────────────────────────────────────
:stop
echo  Stopping containers...
%COMPOSE_CMD% down
echo  Containers stopped.
goto :end

:: ─── Logs ──────────────────────────────────────────────────────────────────
:logs
echo  Streaming logs (Ctrl+C to stop)...
%COMPOSE_CMD% logs -f
goto :end

:: ─── Restart ───────────────────────────────────────────────────────────────
:restart
echo  Restarting containers...
%COMPOSE_CMD% restart
goto :success

:: ─── Rebuild ───────────────────────────────────────────────────────────────
:rebuild
echo  Rebuilding and restarting containers (no cache)...
%COMPOSE_CMD% down
%COMPOSE_CMD% build --no-cache
%COMPOSE_CMD% up -d
goto :success

:: ─── Success message ───────────────────────────────────────────────────────
:success
echo.
echo  Application is running!
echo  for /f "tokens=2 delims==" %%A in ('findstr /i "^PORT=" .env 2^>nul') do set APP_PORT=%%A
  if not defined APP_PORT set APP_PORT=3031
  echo  Open http://localhost:!APP_PORT! in your browser.
echo.
echo  Useful commands:
echo    start.bat stop     - Stop the application
echo    start.bat logs     - View live logs
echo    start.bat restart  - Restart containers
echo    start.bat rebuild  - Rebuild image from scratch
echo.

:end
pause
endlocal
