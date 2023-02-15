const { exec } = require("child_process");
const { ipcMain } = require("electron");
const fs = require("fs-extra");

// create a file
ipcMain.handle("app:save-pdf", async (_event, pdfData, filePathAndName) => {
  await fs.writeFile(filePathAndName, Buffer.from(pdfData));
  if (!fs.existsSync(filePathAndName)) return null;
  return filePathAndName;
});

ipcMain.handle("app:send-email", async (_event, { to, cc, subject, body, filePathAndName }) => {
  const escapedSubject = subject.replace(/"/g, '\\"');

  const escapedBody = body
    .replace(/"/g, '\\"')
    .replace(/(\r\n|\n|\r)/gm, "\\n")
    .replace(/'/g, "\u2019");
  const escapedFilePath = filePathAndName.replace(/"/g, '\\"');

  // replace diacritics in body

  console.log({ escapedBody });

  const appleScript = `osascript -e 'tell application "Mail"
  set newMessage to make new outgoing message with properties {subject:"${escapedSubject}", content:"${escapedBody}", visible:true}
  tell newMessage
    make new to recipient at end of to recipients with properties {address:"${to}"}
    ${cc ? `make new cc recipient at end of cc recipients with properties {address:"${cc}"}` : ""}
    set theAttachment to "${escapedFilePath}"
    tell content
      make new attachment with properties {file name:theAttachment} at after the last word of the last paragraph
    end tell
  end tell
end tell'`;

  console.log({ appleScript });

  exec(appleScript, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
});
