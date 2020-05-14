#!/bin/bash

INFO="[INFO] BEEEGMOJIS: "
WARNING="[WARNING] BEEEGMOJIS: "
ERROR="[ERROR] BEEEGMOJIS: "

echo "${INFO}Making sure that NPM is installed"
if ! npm version > /dev/null; then
    if [[ $OSTYPE == *"linux"* ]]; then
        echo "${ERROR}NodeJS not found, please install it"
        exit 4

    elif [[ $OSTYPE == *"darwin"* ]]; then
        read -p "${WARNING}NodeJS not found, is it alright to install it and if needed homebrew? [y/n] " -n 1 -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "${WARNING}Checking if Homebrew is installed"

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

if [ -z "$1" ]; then
    npx slack-beeegmojis -b
else
    npx slack-beeegmojis
fi
