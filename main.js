const { app, BrowserWindow, autoUpdater } = require("electron");
const { checkAccess } = require("./prompt-linux-access.js");
const IS_LINUX = require("os").platform() === "linux";
const isDev = require('electron-is-dev');
const server = 'https://update.electronjs.org'
const feed = `${server}/SnailKM/SnailKM-Software/${process.platform}-${process.arch}/${app.getVersion()}`

autoUpdater.setFeedURL(feed)

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    autoHideMenuBar: true,
    icon: __dirname + './build/logo.ico',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
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

  mainWindow.loadURL("https://639b5455a26482517ea42e1d--cheery-tanuki-99ac8d.netlify.app/");
};

app.whenReady().then(async () => {
  if (IS_LINUX) {
    await checkAccess(app);
  } else {
    if (isDev) {
      console.log('Running in development');
    } else {
      console.log('Running in production');
      console.log('Update scheduled')
      setInterval(() => {
        autoUpdater.checkForUpdates()
      }, 1 * 60 * 1000)
      console.log('Running auto updater now manually')
      autoUpdater.checkForUpdates()
    }
  }
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});