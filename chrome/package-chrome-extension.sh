#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
echo $BASEDIR

cp $BASEDIR/../common/slack-beeeg-E-smolz.css $BASEDIR/
zip $BASEDIR/slack-beeegmojis.zip $BASEDIR/manifest.json $BASEDIR/slack-beeeg-E-smolz.css
rm $BASEDIR/slack-beeeg-E-smolz.css
