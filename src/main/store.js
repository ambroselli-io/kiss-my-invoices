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
    settings: {
      type: "object",
      properties: {
        invoices_folder_path: {
          type: "string",
        },
        invoice_file_name: {
          type: "string",
        },
        invoice_number_format: {
          type: "string",
        },
        generic_email_template_body: {
          type: "string",
        },
        generic_email_template_subject: {
          type: "string",
        },
        payment_details: {
          type: "string",
        },
        payment_terms: {
          type: "string",
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
  let settings = store.get("settings");
  // check if invoices_folder_path is a real path)
  if (!settings) {
    settings = {};
    store.set("settings", settings);
  }
  if (settings.invoices_folder_path) {
    if (!fs.existsSync(settings.invoices_folder_path)) {
      settings.invoices_folder_path_error = true;
    }
  }

  return settings;
});

module.exports = store;
