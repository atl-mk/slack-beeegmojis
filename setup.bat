echo off

set SCRIPT_TITLE=Slack Beeegmojis Setup
title %SCRIPT_TITLE%

set "INFO=[INFO] BEEEGMOJIS: "
set "ERROR=[ERROR] BEEEGMOJIS: "

echo %INFO%Making sure that NPM is installed
where npm >nul 2>nul
IF NOT ERRORLEVEL 0 (
    echo %ERROR%NodeJS not found, please install it: https://nodejs.org/en/
    exit 1
)

npm install

IF "%1"=="" (
    call node index.js -b
) ELSE (
    call node index.js %1
)
