const { exec } = require("child_process");
const { ipcMain } = require("electron");
const fs = require("fs-extra");

// create a file
ipcMain.handle("app:save-pdf", async (_event, pdfData, filePathAndName) => {
  await fs.writeFile(filePathAndName, Buffer.from(pdfData));
  if (!fs.existsSync(filePathAndName)) return null;
  return filePathAndName;
});

ipcMain.handle("app:send-email", async (_event, { to, cc, bcc, subject, body, filePathAndName }) => {
  const escapedSubject = subject.replace(/"/g, '\\"');
  const escapedBody = body
    .replace(/"/g, '\\"')
    .replace(/(\r\n|\n|\r)/gm, "\\n")
    .replace(/'/g, "\u2019");
  const escapedFilePath = filePathAndName.replace(/"/g, '\\"');

  const appleScript = `osascript -e 'tell application "Mail"
  set newMessage to make new outgoing message with properties {subject:"${escapedSubject}", content:"${escapedBody}", visible:true}
  tell newMessage
    ${
      to
        ? `repeat with email in {${to
            .split(",")
            .map((email) => `"${email}"`)
            .join(", ")}}
      make new to recipient at end of to recipients with properties {address:email}
    end repeat`
        : ""
    }
    ${
      cc
        ? `repeat with email in {${cc
            .split(",")
            .map((email) => `"${email}"`)
            .join(", ")}}
      make new cc recipient at end of cc recipients with properties {address:email}
    end repeat`
        : ""
    }
    ${
      bcc
        ? `repeat with email in {${bcc
            .split(",")
            .map((email) => `"${email}"`)
            .join(", ")}}
      make new cc recipient at end of cc recipients with properties {address:email}
    end repeat`
        : ""
    }
    set theAttachment to "${escapedFilePath}"
    tell content
      make new attachment with properties {file name:theAttachment} at after the last word of the last paragraph
    end tell
    set sender to "arnaud@ambroselli.io"
  end tell
end tell
tell application "Mail" to activate'`;

  exec(appleScript, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
});
