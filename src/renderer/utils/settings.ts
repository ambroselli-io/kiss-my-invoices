// get folder path

export type Settings = {
  invoices_folder_path: string;
  invoice_file_name: string;
  invoice_number_format: string;
  generic_email_template_body: string;
  generic_email_template_subject: string;
  invoices_folder_path_error: boolean;
};

export const getSettings = async (): Promise<Settings> => {
  const settings = await window.electron.ipcRenderer.invoke("app:get-settings");
  return settings;
};

// set settings (show TS return type)
export const setSettings = async (updatedSettings: Settings): Promise<Settings> => {
  const settings = await window.electron.ipcRenderer.invoke("app:save-settings", updatedSettings);
  return settings;
};
