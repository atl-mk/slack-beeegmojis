echo off
set SCRIPT_DIR=%~dp0
set STYLES_FILE=%SCRIPT_DIR%common\slack-beeeg-E-smolz.css
set MAIN_SCRIPT=setup.bat

%SCRIPT_DIR%%MAIN_SCRIPT% %STYLES_FILE%
