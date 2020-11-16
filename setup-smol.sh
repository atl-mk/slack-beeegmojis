#!/bin/bash
SCRIPT_DIR="$( cd "$(dirname "$0")" ; pwd -P )"
MAIN_SCRIPT="setup.sh"

("$SCRIPT_DIR/$MAIN_SCRIPT" "-s")
