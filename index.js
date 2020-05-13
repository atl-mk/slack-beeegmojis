#!/usr/bin/env node

const os = require('os');
const { exec } = require('child_process');

if (os.type() === 'Windows_NT') {
    exec('setup-beeeg-E-smolzbat');
} else {
    exec("sh setup-beeeg-E-smolz.sh");
}
