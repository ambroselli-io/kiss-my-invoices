// get folder path

import { readFile, writeFile } from "./fileManagement";

export type Settings = {
  kiss_my_invoices_folder_path?: string;
  invoice_file_name: string;
  invoice_number_format: string;
  generic_email_template_body: string;
  generic_email_template_subject: string;
  payment_details: string;
  payment_terms: string;
  invoices_folder_path_error: boolean;
};

export const getSettings = async (): Promise<Settings> => {
  const settings = await readFile("settings.json");
  return settings;
};

// set settings (show TS return type)
export const setSettings = async (updatedSettings: Settings): Promise<Settings> => {
  console.log("updatedSettings", updatedSettings);
  if (updatedSettings.kiss_my_invoices_folder_path) {
    const isGoodPath = await window.electron.ipcRenderer.invoke(
      "app:save-folder-path",
      updatedSettings.kiss_my_invoices_folder_path,
    );
    if (!isGoodPath) {
      return { ...updatedSettings, invoices_folder_path_error: true };
    }
    delete updatedSettings.kiss_my_invoices_folder_path;
  }
  return writeFile("settings.json", updatedSettings);
};
