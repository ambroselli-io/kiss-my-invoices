const { exec } = require("child_process");
const { ipcMain } = require("electron");
const fs = require("fs-extra");

// create a file
ipcMain.handle("app:save-pdf", async (_event, pdfData, filePathAndName) => {
  fs.writeFile(filePathAndName, Buffer.from(pdfData), (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`PDF saved to ${filePathAndName}`);
    }
  });
});

ipcMain.handle("app:send-email", async (_event, _params) => {
  exec(
    `osascript -e 'tell application "Mail"
    set newMessage to make new outgoing message with properties {subject:"Email Subject", content:"Hello - please find attached this pdf", visible:true}
    tell newMessage
      make new to recipient at end of to recipients with properties {address:"recipient1@example.com"}
      make new cc recipient at end of cc recipients with properties {address:"recipient2@example.com"}
      set theAttachment to "/Users/me/Downloads/myFile.pdf"
      tell content
        make new attachment with properties {file name:theAttachment} at after the last word of the last paragraph
      end tell
    end tell
  end tell'`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    },
  );
});
