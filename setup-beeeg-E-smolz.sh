#!/bin/bash
SCRIPT_DIR="$( cd "$(dirname "$0")" ; pwd -P )"
STYLES_FILE="beeegEsmolz"
MAIN_SCRIPT="setup.sh"

("$SCRIPT_DIR/$MAIN_SCRIPT" "$STYLES_FILE")
