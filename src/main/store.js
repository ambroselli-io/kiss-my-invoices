const { ipcMain } = require("electron");
const Store = require("electron-store");
const fs = require("fs-extra");

const store = new Store({
  schema: {
    windowBounds: {
      type: "object",
      default: {
        width: 800,
        height: 600,
      },
      properties: {
        width: {
          type: "number",
          default: 800,
        },
        height: {
          type: "number",
          default: 600,
        },
      },
    },
    kiss_my_invoices_folder_path: {
      type: "string",
    },
  },
});

ipcMain.handle("app:save-folder-path", async (_event, kiss_my_invoices_folder_path) => {
  if (!fs.existsSync(kiss_my_invoices_folder_path)) {
    return null;
  }
  store.set("kiss_my_invoices_folder_path", kiss_my_invoices_folder_path);
  return store.get("kiss_my_invoices_folder_path");
});

ipcMain.handle("app:get-folder-path", async () => {
  const path = store.get("kiss_my_invoices_folder_path");
  if (!path) return null;
  if (!fs.existsSync(path)) {
    return null;
  }
  return path;
});

module.exports = store;
