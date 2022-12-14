const { app, BrowserWindow } = require("electron");
const { checkAccess } = require("./prompt-linux-access.js");
const IS_LINUX = require("os").platform() === "linux";
require('update-electron-app')()

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    autoHideMenuBar: true,
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

  mainWindow.loadURL("https://usevia.app");
};

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
