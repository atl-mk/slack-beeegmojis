#!/usr/bin/env node

const os = require('os');
const { exec } = require('child_process');
const commandLineArgs = require('command-line-args')

const optionDefinitions = [{ name: 'BEEEEEG', alias: 'b', type: Boolean }]
const commandLineOptions = commandLineArgs(optionDefinitions)

if (commandLineOptions.BEEEEEG) {
    console.info("I like 'em BEEEEEG\nhttps://youtu.be/WJ1I-z0pBU0")
}

if (os.type() === 'Windows_NT') {
    if (commandLineOptions.BEEEEEG) {
        exec('setup-beeeg-E-smolz.bat')
    } else {
        exec('setup.bat')
    }
} else {
    if (commandLineOptions.BEEEEEG) {
        exec("sh setup-beeeg-E-smolz.sh")
    } else {
        exec("sh setup.sh")
    }
}
