#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
echo $BASEDIR

cp $BASEDIR/../common/*.{css,html,jpg,js} $BASEDIR/
zip $BASEDIR/slack-beeegmojis.zip $BASEDIR/manifest.json $BASEDIR/*.{css,js,jpg}
#rm $BASEDIR/*.{css,js,jpg}
