#!/bin/bash
INFO="[INFO] BEEEGMOJIS: "
WARNING="[WARNING] BEEEGMOJIS: "
ERROR="[ERROR] BEEEGMOJIS: "

APP="app"
APP_ASAR="app.asar"
APP_ASAR_BAK="app.asar.bak"
INJECTION_VICTIM="${APP}/dist/preload.bundle.js"
SCRIPT_DIR="$( cd "$(dirname "$0")" ; pwd -P )"

if [ -z "$1" ]; then
    STYLES_FILE="${SCRIPT_DIR}/common/slack-beeegmojis.css"
else
    STYLES_FILE="$1"
fi


echo "${INFO}Figuring out where Slack is installed"
if [[ $OSTYPE == *"linux"* ]]; then
    SLACK_DIR="/usr/lib/slack/resources/"
    if [ -d "${SLACK_DIR}" ]; then
        echo "${INFO}Assuming slack is at ${SLACK_DIR}"
    else
        echo "${ERROR}Slack is not at ${SLACK_DIR} , please modify this script with the correct path using where and following the link"
        exit 3
    fi
elif [[ $OSTYPE == *"darwin"* ]]; then
    SLACK_DIR="/Applications/Slack.app/Contents/Resources/"
else
    echo "${ERROR}You're using an unsupported operating system, exiting"
    exit 1
fi



echo "${INFO}Making sure that NPM is installed"
if ! npm version > /dev/null; then
    if [[ $OSTYPE == *"linux"* ]]; then
        echo "${ERROR}NodeJS not found, please install it"
        exit 4

    elif [[ $OSTYPE == *"darwin"* ]]; then
        read -p "${WARNING}NodeJS not found, is it alright to install it? [y/n] " -n 1 -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "${WARNING}NodeJS not found, checking if Homebrew is installed"

            if brew -v; then
                echo "${INFO}Homebrew found"
            else
                echo "${WARNING}Homebrew not found, installing (you may have to rerun this script in a new terminal)"
                /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
            fi

            echo "${INFO}Installing NodeJS"
            brew install node
        fi
    fi
fi



if [ -d "${SLACK_DIR}${APP}" ]; then
    echo "${INFO}Cleaning up after last installation"
    rm -r "${SLACK_DIR}${APP}"
fi

if [ -f "${SLACK_DIR}${APP_ASAR}" ]; then
    echo "${INFO}Slack update found"
    yes | mv "${SLACK_DIR}${APP_ASAR}" "${SLACK_DIR}${APP_ASAR_BAK}"
fi

echo "${INFO}Unpacking Slack app"
if [ -f "${SLACK_DIR}${APP_ASAR_BAK}" ]; then
    mv "${SLACK_DIR}${APP_ASAR_BAK}" "${SLACK_DIR}${APP_ASAR}"
fi
if npx asar extract "${SLACK_DIR}${APP_ASAR}" "${SLACK_DIR}${APP}" ; then
    echo "${INFO}Backing up packaged Slack"
    mv "${SLACK_DIR}${APP_ASAR}" "${SLACK_DIR}${APP_ASAR_BAK}"
else
    echo "${ERROR}Extracting Slack app failed, cleaning up"
    rm -rf "${SLACK_DIR}${APP}"
    exit 2
fi



cat "${SCRIPT_DIR}/electron-hack/1.txt" >> "${SLACK_DIR}${INJECTION_VICTIM}"
cat "${STYLES_FILE}" >> "${SLACK_DIR}${INJECTION_VICTIM}"
cat "${SCRIPT_DIR}/electron-hack/2.txt" >> "${SLACK_DIR}${INJECTION_VICTIM}"

echo "${INFO}Done, have fun!"
