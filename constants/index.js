const path = require("path");
const fs = require("fs");

const basePath = path.join(__dirname, "../../../");
// const basePath = path.join(process.argv[0], "../../../../");

console.log("Process path: ", process.argv[0]);
console.log("Base path: ", basePath);

const environmentSettingsFile = path.join(
  basePath,
  "/Environment/Environment_Variables.ps1"
);

const getDelimiterFromSettingsFile = () => {
  const settingsFile = fs.readFileSync(environmentSettingsFile, "utf8");

  let delimiter;

  settingsFile.split("\n").forEach((line) => {
    if (line.includes("$delimiter")) {
      delimiter = line.split("=")[1].trim().replace(/['"]+/g, "");
    }
  });

  return delimiter;
};

const processesDirectory = path.join(
  basePath,
  "Process",
  "Converted_Process_Files"
);

const uploadsDirectory = path.join(basePath, "/uploads");

const credentialsDirectory = path.join(basePath, "Credential");

const encryptedPasswordsDirectory = path.join(
  credentialsDirectory,
  "Encrypted_Passwords"
);

module.exports = {
  basePath,
  environmentSettingsFile,
  processesDirectory,
  getDelimiterFromSettingsFile,
  uploadsDirectory,
  credentialsDirectory,
  encryptedPasswordsDirectory
};
