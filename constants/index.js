const path = require("path");

const basePath = path.join(__dirname, "../../../");

const environmentSettingsFile = path.join(
  basePath,
  "/Environment/Environment_Variables.ps1"
);

const processesDirectory = path.join(
  basePath,
  "/Process/Converted_Process_Files"
);

module.exports = {
  basePath,
  environmentSettingsFile,
  processesDirectory
};
