const { ipcMain } = require("electron");
const Store = require("electron-store");
const fs = require("fs-extra");

const store = new Store({
  schema: {
    settings: {
      type: "object",
      properties: {
        invoices_folder_path: {
          type: "string",
          default: "",
        },
        invoice_file_name: {
          type: "string",
          default: "",
        },
        invoice_number_format: {
          type: "string",
          default: "",
        },
        generic_email_template_body: {
          type: "string",
          default: "",
        },
        generic_email_template_subject: {
          type: "string",
          default: "",
        },
      },
    },
  },
});

ipcMain.handle("app:save-settings", async (_event, settings) => {
  store.set("settings", settings);
  return store.get("settings");
});

ipcMain.handle("app:get-settings", async () => {
  const settings = store.get("settings");
  // check if invoices_folder_path is a real path)
  if (settings.invoices_folder_path) {
    if (!fs.existsSync(settings.invoices_folder_path)) {
      settings.invoices_folder_path_error = true;
    }
  }

  return settings;
});

module.exports = store;
