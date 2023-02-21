require("dotenv").config();
const { notarize } = require("@electron/notarize");
const { build } = require("../../package.json");

exports.default = async function notarizeMacos(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  // if (process.env.CI !== "true") {
  //   console.warn("Skipping notarizing step. Packaging is not running in CI");
  //   return;
  // }

  if (!("APPLE_ID" in process.env)) {
    console.warn("Skipping notarizing step. APPLE_ID env variables must be set");
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  await notarize({
    appBundleId: build.appId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLE_ID,
    // https://github.com/electron/notarize#safety-when-using-appleidpassword
    appleIdPassword: "@keychain:AC_PASSWORD",
    ascProvider: "52FJ92F7JV",
  });
};
