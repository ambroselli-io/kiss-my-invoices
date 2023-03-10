const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const chokidar = require("chokidar");
const store = require("./store");

const getFolderPath = () => {
  return store.get("kiss_my_invoices_folder_path");
};
// create a file
ipcMain.handle("app:write-file", async (_event, { fileName, content }) => {
  const kiss_my_invoices_folder_path = getFolderPath();
  if (!fs.existsSync(kiss_my_invoices_folder_path)) {
    return null;
  }
  const filePath = path.resolve(kiss_my_invoices_folder_path, fileName);

  if (!fs.existsSync(filePath)) {
    // create the file
    fs.writeFileSync(filePath, "");
  }
  return fs.writeFileSync(filePath, content);
});

// read file
ipcMain.handle("app:read-file", async (_event, { fileName, default: defaultContent }) => {
  const kiss_my_invoices_folder_path = getFolderPath();
  if (!fs.existsSync(kiss_my_invoices_folder_path)) {
    return null;
  }
  const filePath = path.resolve(kiss_my_invoices_folder_path, fileName);

  if (!fs.existsSync(filePath)) {
    // create the file
    fs.writeFileSync(filePath, defaultContent);
  }
  return fs.readFileSync(filePath, {
    encoding: "utf-8",
  });
});

// delete a file
ipcMain.handle("app:delete-file", async (_event, { fileName }) => {
  const kiss_my_invoices_folder_path = getFolderPath();
  if (!fs.existsSync(kiss_my_invoices_folder_path)) {
    return null;
  }
  const filePath = path.resolve(kiss_my_invoices_folder_path, fileName);

  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
});

/*-----*/

// watch files from the application's storage directory
exports.watchFiles = (appDir, win) => {
  chokidar.watch(path.resolve(getFolderPath())).on("unlink", (filepath) => {
    win.webContents.send("app:delete-file", path.parse(filepath).base);
  });
};
