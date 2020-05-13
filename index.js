#!/usr/bin/env node
const asar = require("asar");
const commandLineArgs = require("command-line-args");
const del = require("del");
const fs = require("fs");
const os = require("os");
const path = require("path");
const semverSort = require("semver-sort");
const { execSync } = require("child_process");

const optionDefinitions = [{ name: "BEEEEEG", alias: "b", type: Boolean }];
const commandLineOptions = commandLineArgs(optionDefinitions);

const getSlackDirectoryOnWindows = () => {
  const slackRootDir = path.resolve(process.env.APPDATA, "..\\Local\\slack");
  const appDirNamePrefix = "app-";

  const getSlackVersions = (source) =>
    fs
      .readdirSync(source, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .filter((dirent) => dirent.startsWith(appDirNamePrefix))
      .map((dirent) => dirent.substring(appDirNamePrefix.length));
  const versions = getSlackVersions(slackRootDir);

  const getLatestVersionNumber = (versions) => semverSort.desc(versions)[0];
  const latestVersionNumber = getLatestVersionNumber(versions);

  return path.resolve(
    slackRootDir,
    `${appDirNamePrefix}${latestVersionNumber}`,
    "resources"
  );
};

const getSlackDirectory = () => {
  console.info("Figuring out where Slack is installed");

  switch (os.type()) {
    case "Linux":
      return path.resolve("/usr/lib/slack/resources/");
    case "Darwin":
      return path.resolve("/Applications/Slack.app/Contents/Resources/");
    case "Windows_NT":
      return getSlackDirectoryOnWindows();
    default:
      console.error(
        `Sorry, this operating system (${os.type()}) is not supported yet, feel free to raise a ticket`
      );
      process.exit(2);
  }
};

const getStylesFileLocation = (BEEEEEG) => {
  const resolveStylesFile = (filename) => {
    const cssFileExtension = ".css";
    return path.resolve(SCRIPT_DIR, "common", `${filename}${cssFileExtension}`);
  };

  if (BEEEEEG) {
    return resolveStylesFile("slack-beeegmojis");
  } else {
    return resolveStylesFile("slack-beeeg-E-smolz");
  }
};

const SCRIPT_DIR = __dirname;
const slackDirectory = getSlackDirectory();
const stylesFile = getStylesFileLocation(commandLineOptions.BEEEEEG);

const appDirectory = path.resolve(slackDirectory, "app");
const appendTarget = path.resolve(appDirectory, "dist/preload.bundle.js");
const backupAsarPath = path.resolve(slackDirectory, "app.asar.bak");
const injectFilesDir = path.resolve(SCRIPT_DIR, "electron-hack");
const injectOpenFile = path.resolve(injectFilesDir, "1.txt");
const injectCloseFile = path.resolve(injectFilesDir, "2.txt");
const originalAsarPath = path.resolve(slackDirectory, "app.asar");

console.info("Closing Slack");
if (os.type() === "Windows_NT") {
  try {
    execSync("taskkill /F /IM slack.exe");
  } catch {
    console.warn("Couldn't close Slack, maybe it wasn't running?");
  }
} else if (os.type() === "Darwin" || os.type() === "Linux") {
  execSync("pkill -9 slack");
}

if (commandLineOptions.BEEEEEG) {
  console.info("I like 'em BEEEEEG\nhttps://youtu.be/WJ1I-z0pBU0");
}

if (fs.existsSync(appDirectory)) {
  console.info("Cleaning up after last installation");
  del.sync(appDirectory, { force: true });
}

if (fs.existsSync(originalAsarPath)) {
  if (fs.existsSync(backupAsarPath)) {
    console.info("Removing the old Slack backup");
    del.sync(backupAsarPath, { force: true });
  }
  console.info("Backing up Slack");
  fs.copyFileSync(originalAsarPath, backupAsarPath);
} else {
  console.info("Restoring from Slack backup");
  fs.copyFileSync(backupAsarPath, originalAsarPath);
}

console.info("Unpacking Slack app");
asar.extractAll(originalAsarPath, appDirectory);

console.info("Chungus-ify-ing");
const injectOpenData = fs.readFileSync(injectOpenFile);
const stylesData = fs.readFileSync(stylesFile);
const injectCloseData = fs.readFileSync(injectCloseFile);
const appendStream = fs.createWriteStream(appendTarget, { flags: "a" });
appendStream.write(injectOpenData);
appendStream.write(stylesData);
appendStream.write(injectCloseData);
appendStream.end();

console.info("Removing packaged version of Slack");
del.sync(originalAsarPath, { force: true });

console.info("Done, have fun!");
