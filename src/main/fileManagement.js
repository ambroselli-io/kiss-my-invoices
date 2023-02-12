const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const chokidar = require("chokidar");

// create a file
ipcMain.handle("app:write-file", async (_event, { appDir, fileName, content }) => {
  const filePath = path.resolve(os.homedir(), appDir, fileName);

  if (!fs.existsSync(filePath)) {
    // create the file
    fs.writeFileSync(filePath, "");
  }
  return fs.writeFileSync(filePath, content);
});

// read file
ipcMain.handle("app:read-file", async (_event, { appDir, fileName, default: defaultContent }) => {
  const filePath = path.resolve(os.homedir(), appDir, fileName);

  if (!fs.existsSync(filePath)) {
    // create the file
    fs.writeFileSync(filePath, defaultContent);
  }
  return fs.readFileSync(filePath, {
    encoding: "utf-8",
  });
});

// delete a file
ipcMain.handle("app:delete-file", async (_event, { appDir, fileName }) => {
  const filePath = path.resolve(os.homedir(), appDir, fileName);

  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
});

/*-----*/

// watch files from the application's storage directory
exports.watchFiles = (appDir, win) => {
  chokidar.watch(path.resolve(os.homedir(), appDir)).on("unlink", (filepath) => {
    win.webContents.send("app:delete-file", path.parse(filepath).base);
  });
};
