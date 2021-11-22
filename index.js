#!/usr/bin/env node
const asar = require("asar");
const commandLineArgs = require("command-line-args");
const del = require("del");
const fs = require("fs");
const os = require("os");
const path = require("path");
const semverSort = require("semver-sort");
const { execSync } = require("child_process");

const optionDefinitions = [
  { name: "BEEEEEG", alias: "b", type: Boolean },
  { name: "smol", alias: "s", type: Boolean },
  { name: "uninstall", alias: "u", type: Boolean },
];
const commandLineOptions = commandLineArgs(optionDefinitions);

const getSlackDirectoryOnWindows = () => {
  const slackRootDir = path.resolve(process.env.APPDATA, "..\\Local\\slack");
  const appDirNamePrefix = "app-";

  const getSlackVersions = (source) =>
    fs
      .readdirSync(source, { withFileTypes: true })
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name)
      .filter((dir) => dir.startsWith(appDirNamePrefix))
      .map((dir) => dir.substring(appDirNamePrefix.length));
  const slackVersions = getSlackVersions(slackRootDir);

  const getLatestVersionNumber = (versions) => semverSort.desc(versions)[0];
  const latestVersionNumber = getLatestVersionNumber(slackVersions);

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

const getStylesFileLocation = (BEEEEEG, smol) => {
  const resolveStylesFile = (filename) => {
    const cssFileExtension = ".css";
    return path.resolve(SCRIPT_DIR, "common", `${filename}${cssFileExtension}`);
  };

  if (BEEEEEG && !smol) {
    return resolveStylesFile("slack-beeegmojis");
  } else if (smol && !BEEEEEG) {
    return resolveStylesFile("slack-smolbois");
  } else {
    return resolveStylesFile("slack-beeeg-E-smolz");
  }
};

const SCRIPT_DIR = __dirname;
const slackDirectory = getSlackDirectory();
const stylesFile = getStylesFileLocation(
  commandLineOptions.BEEEEEG,
  commandLineOptions.smol
);

const appDirectory = path.resolve(slackDirectory, "app");
const appendTarget = path.resolve(appDirectory, "dist/preload.bundle.js");
const backupAsarPath = path.resolve(slackDirectory, "app.asar.bak");
const injectFilesDir = path.resolve(SCRIPT_DIR, "electron-hack");
const injectOpenFile = path.resolve(injectFilesDir, "1.txt");
const injectCloseFile = path.resolve(injectFilesDir, "2.txt");
const originalAsarPath = path.resolve(slackDirectory, "app.asar");

const closeSlack = () => {
  console.info("Closing Slack");
  try {
    if (os.type() === "Windows_NT") {
      execSync("taskkill /F /IM slack.exe");
    } else if (os.type() === "Darwin" || os.type() === "Linux") {
      execSync("pkill -9 slack");
    }
  } catch {
    console.warn("Couldn't close Slack, maybe it wasn't running?");
  }
};

const displayMemeMessage = () => {
  if (commandLineOptions.BEEEEEG && !commandLineOptions.smol) {
    console.info("I like 'em BEEEEEG\nhttps://youtu.be/WJ1I-z0pBU0");
  } else if (commandLineOptions.BEEEEEG && commandLineOptions.smol) {
    console.info(
      "Some of the best memes are d̶e̶e̶p̶-̶f̶r̶i̶e̶d̶ are served medium-rare"
    );
  }
};

const removeModifiedFiles = () => {
  if (fs.existsSync(appDirectory)) {
    console.info("Cleaning up after last installation");
    del.sync(appDirectory, { force: true });
  }
};

const originalPackagedFileExists = () => {
  return fs.existsSync(originalAsarPath);
};

const backupPackagedFile = () => {
  if (fs.existsSync(backupAsarPath)) {
    console.info("Removing the old Slack backup");
    del.sync(backupAsarPath, { force: true });
  }
  console.info("Backing up Slack");
  fs.copyFileSync(originalAsarPath, backupAsarPath);
};

const restorePackageFile = () => {
  console.info("Restoring Slack from backup");
  fs.copyFileSync(backupAsarPath, originalAsarPath);
};

const unpackSlackFiles = () => {
  console.info("Unpacking Slack app");
  asar.extractAll(originalAsarPath, appDirectory);
};

const packageSlackFiles = () => {
  console.info("Re-packaging Slack app");
  asar.createPackage(appDirectory, originalAsarPath);
};

const injectStyles = () => {
  console.info("Chungus-ify-ing");
  const injectOpenData = fs.readFileSync(injectOpenFile);
  const stylesData = fs.readFileSync(stylesFile);
  const injectCloseData = fs.readFileSync(injectCloseFile);
  const appendStream = fs.createWriteStream(appendTarget, { flags: "a" });
  appendStream.write(injectOpenData);
  appendStream.write(stylesData);
  appendStream.write(injectCloseData);
  appendStream.end();
};

const removePackagedSlackFile = () => {
  console.info("Removing packaged version of Slack");
  del.sync(originalAsarPath, { force: true });
};

const displayDoneMessage = () => {
  if (commandLineOptions.uninstall) {
    console.info("Done!");
  } else {
    console.info("Done, have fun!");
  }
};

const install = () => {
  closeSlack();
  displayMemeMessage();
  removeModifiedFiles();
  if (originalPackagedFileExists()) {
    backupPackagedFile();
  } else {
    restorePackageFile();
  }
  unpackSlackFiles();
  injectStyles();
  removePackagedSlackFile();
  packageSlackFiles();
  displayDoneMessage();
};

const uninstall = () => {
  closeSlack();
  removeModifiedFiles();
  removePackagedSlackFile();
  if (!originalPackagedFileExists()) {
    restorePackageFile();
  }
  displayDoneMessage();
};

if (!commandLineOptions.uninstall) {
  install();
} else {
  uninstall();
}
