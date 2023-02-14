// get folder path
export const getInvoicesPath = async () => {
  const saved_invoices_folder_path = await window.electron.ipcRenderer.invoke("app:get-settings");
  return saved_invoices_folder_path;
};

// copy file
export const setInvoicesPath = async (invoices_folder_path: string) => {
  const settings = await window.electron.ipcRenderer.invoke("app:save-settings", {
    invoices_folder_path,
  });
  return settings.invoices_folder_path;
};

// copy file
export const readFile = async (fileName: string, { default: defaultContent }: { default: any } = { default: null }) => {
  const file = await window.electron.ipcRenderer.invoke("app:read-file", {
    fileName,
    default: JSON.stringify(defaultContent),
  });
  return file ? JSON.parse(file) : defaultContent;
};

// copy file
export const writeFile = async (fileName: string, content: any) => {
  await window.electron.ipcRenderer.invoke("app:write-file", { fileName, content: JSON.stringify(content) });
  return readFile(fileName);
};
