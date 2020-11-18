#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
echo $BASEDIR

cp $BASEDIR/../common/*.{css,html,js,png} $BASEDIR/
zip $BASEDIR/slack-beeegmojis.zip $BASEDIR/manifest.json $BASEDIR/*.{css,html,js,png}
rm $BASEDIR/*.{css,html,js,png}
