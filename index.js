#!/usr/bin/env node
const asar = require('asar');
const commandLineArgs = require('command-line-args')
const del = require('del');
const fs = require('fs');
const os = require('os');
const path = require('path')
const { exec } = require('child_process');

const optionDefinitions = [{ name: 'BEEEEEG', alias: 'b', type: Boolean }]
const commandLineOptions = commandLineArgs(optionDefinitions)

const getSlackDirectory = () => {
    console.info('Figuring out where Slack is installed')
    
    switch(os.type()) {
        case 'Linux': 
            return path.resolve('/usr/lib/slack/resources/')
        case 'Darwin':
            return path.resolve('/Applications/Slack.app/Contents/Resources/')
        case 'Windows_NT':
            // TODO need to write a way to figure out where the slack installation is placed
            // set SLACK_VERSION=4.4.0
            // set SLACK_DIR=%APPDATA%\..\Local\slack\app-%SLACK_VERSION%\resources\
        default:
            console.error(`Sorry, this operating system (${os.type()}) is not supported yet, feel free to raise a ticket`)
            process.exit(1)
    }
}

const getStylesFileLocation = (BEEEEEG) => {
    const resolveStylesFile = (filename) => {
        const cssFileExtension = '.css'
        return path.resolve(SCRIPT_DIR, 'common', `${filename}${cssFileExtension}`)
    }
    
    if (BEEEEEG) {
        return resolveStylesFile('slack-beeegmojis')
    } else {
        return resolveStylesFile('slack-beeeg-E-smolz')
    }
}

const SCRIPT_DIR = __dirname
const slackDirectory = getSlackDirectory()
const stylesFile = getStylesFileLocation(commandLineOptions.BEEEEEG)

const appDirectory = path.resolve(slackDirectory, 'app')
const appendTarget = path.resolve(appDirectory, 'dist/preload.bundle.js')
const backupAsarPath = path.resolve(slackDirectory, 'app.asar.bak')
const injectFilesDir = path.resolve(SCRIPT_DIR, 'electron-hack')
const injectOpenFile = path.resolve(injectFilesDir, '1.txt')
const injectCloseFile = path.resolve(injectFilesDir, '2.txt')
const originalAsarPath = path.resolve(slackDirectory, 'app.asar')

console.info('Closing Slack')
if (os.type === 'Windows_NT') {
    // TODO need to get PID and process.kill()
} else if (os.type() === 'Darwin' || os.type() === 'Linux') {
    exec('pkill -9 slack')
}

if (commandLineOptions.BEEEEEG) {
    console.info("I like 'em BEEEEEG\nhttps://youtu.be/WJ1I-z0pBU0")
}

if (fs.existsSync(appDirectory)) {
    console.info('Cleaning up after last installation')
    del.sync(appDirectory, { force: true })
}

if (fs.existsSync(originalAsarPath)) {
    if (fs.existsSync(backupAsarPath)) {
        console.info('Removing the old Slack backup')
        del.sync(backupAsarPath, { force: true })
    }
    console.info('Backing up Slack')
    fs.copyFileSync(originalAsarPath, backupAsarPath)
} else{
    console.info('Restoring from Slack backup')
    fs.copyFileSync(backupAsarPath, originalAsarPath)
}

console.info('Unpacking Slack app')
asar.extractAll(originalAsarPath, appDirectory)    

console.info('Chungus-ify-ing')
const injectOpenData = fs.readFileSync(injectOpenFile)
const stylesData = fs.readFileSync(stylesFile)
const injectCloseData = fs.readFileSync(injectCloseFile)
const appendStream = fs.createWriteStream(appendTarget, {flags:'a'});
appendStream.write(injectOpenData)
appendStream.write(stylesData)
appendStream.write(injectCloseData)
appendStream.end();

console.info('Removing packaged version of Slack')
del.sync(originalAsarPath, { force: true })

console.info('Done, have fun!')
