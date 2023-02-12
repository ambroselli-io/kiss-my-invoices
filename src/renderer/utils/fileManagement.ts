const appDir = "Pro/__admin/ZZP/Factures émises copy/";

// copy file
export const readFile = async (fileName: string, { default: defaultContent }: { default: any } = { default: null }) => {
  const file = await window.electron.ipcRenderer.invoke("app:read-file", {
    appDir,
    fileName,
    default: JSON.stringify(defaultContent),
  });
  return JSON.parse(file);
};

// copy file
export const writeFile = async (fileName: string, content: any) => {
  await window.electron.ipcRenderer.invoke("app:write-file", { appDir, fileName, content: JSON.stringify(content) });
  return readFile(fileName);
};
