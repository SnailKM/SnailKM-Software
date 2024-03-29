const { app, BrowserWindow } = require("electron");
const { checkAccess } = require("./prompt-linux-access.js");
const IS_LINUX = require("os").platform() === "linux";
const isDev = require('electron-is-dev');
const { autoUpdater } = require("electron-updater")

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    autoHideMenuBar: true,
    icon: 'icon.ico',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    title: require('./package.json').name + ' ' + require('./package.json').version
  });

  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });

  mainWindow.webContents.session.on(
    "select-hid-device",
    (event, details, callback) => {
      event.preventDefault();
      if (details.deviceList && details.deviceList.length > 0) {
        callback(details.deviceList[0].deviceId);
      }
    }
  );

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === "hid") {
      return true;
    }
    return false;
  });

  // Auto Updater
  mainWindow.once('ready-to-show', () => {
  if (isDev) {
    console.log('Running in development');
  } else {
    console.log('SnailDOS Powered')
    console.log('App Version:')
    console.log(app.getVersion())
    console.log('Running in production');
    console.log('Setting parameters...')
    autoUpdater.logger = require("electron-log")
    autoUpdater.logger.transports.file.level = "info"
    console.log('Sending update task now.')
    autoUpdater.checkForUpdatesAndNotify();
    console.log('App is ready.')
  }
});

mainWindow.loadURL("https://main--cheery-tanuki-99ac8d.netlify.app/");
};

  // Linux
app.whenReady().then(async () => {
    if (IS_LINUX) {
      await checkAccess(app);
  }

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
