echo off




set SLACK_VERSION=4.4.0





set SCRIPT_TITLE=Slack Beeegmojis Setup
title %SCRIPT_TITLE%

set "INFO=[INFO] BEEEGMOJIS: "
set "WARNING=[WARNING] BEEEGMOJIS: "
set "ERROR=[ERROR] BEEEGMOJIS: "

set APP=app
set APP_ASAR=app.asar
set APP_ASAR_BAK=app.asar.bak
set INJECTION_VICTIM=%APP%\dist\preload.bundle.js
set SCRIPT_DIR=%~dp0
set SLACK_DIR=%APPDATA%\..\Local\slack\app-%SLACK_VERSION%\resources\


tasklist /FI "IMAGENAME eq slack.exe" 2>NUL | find /I /N "slack.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %ERROR% Slack is still running, please close it
    exit 7
)

if "%~1"=="" ( set STYLES_FILE=%SCRIPT_DIR%common\slack-beeegmojis.css ) else ( set STYLES_FILE=%1 )


echo %INFO%Figuring out where Slack is installed
if exist %SLACK_DIR% (
    echo %INFO%Assuming slack is at %SLACK_DIR%
) else (
    echo %ERROR%Slack is not at %SLACK_DIR% , please modify this script by updating SLACK_VERSION from %SLACK_VERSION% to whatever is installed
    exit 3
)



echo %INFO%Making sure that NPM is installed
where npm >nul 2>nul
IF NOT ERRORLEVEL 0 (
    echo %ERROR%NodeJS not found, please install it: https://nodejs.org/en/
    exit 6
)


if exist %SLACK_DIR%%APP% (
    echo %INFO%Cleaning up after last installation
    RD /S /Q %SLACK_DIR%%APP%
)

echo %INFO%Unpacking Slack app
if exist %SLACK_DIR%%APP_ASAR_BAK% (
    move %SLACK_DIR%%APP_ASAR_BAK% %SLACK_DIR%%APP_ASAR%
)
call npx asar extract %SLACK_DIR%%APP_ASAR% %SLACK_DIR%%APP% 
if ERRORLEVEL 0 (
    title %SCRIPT_TITLE%
    echo %INFO%Backing up packaged Slack
    move %SLACK_DIR%%APP_ASAR% %SLACK_DIR%%APP_ASAR_BAK%
) else (
    echo %ERROR%Extracting Slack app failed, cleaning up
    RD /S /Q %SLACK_DIR%%APP%
    exit 2
)



type %SCRIPT_DIR%electron-hack\1.txt >> %SLACK_DIR%%INJECTION_VICTIM%
type %STYLES_FILE% >> %SLACK_DIR%%INJECTION_VICTIM%
type %SCRIPT_DIR%electron-hack\2.txt >> %SLACK_DIR%%INJECTION_VICTIM%

echo %INFO%Done, have fun!
