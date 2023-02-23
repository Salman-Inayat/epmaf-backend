const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const path = require("path");

const { PowerShell } = require("node-powershell");

const {
  environmentSettingsFile,
  encryptedPasswordsDirectory,
  credentialsDirectory
} = require("../constants");

exports.getSettingsFile = catchAsync(async (req, res, next) => {
  const settingsFile = fs.readFileSync(environmentSettingsFile, "utf8");

  const variables = {};
  let currentSection = "";

  settingsFile.split("\n").forEach((line) => {
    if (line.startsWith("## ")) {
      currentSection = line.substring(2, line.lastIndexOf("##")).trim();
      variables[currentSection] = {};
    } else if (line.startsWith("$")) {
      const [name, value] = line.split("=", 2).map((str) =>
        str
          .split("#")[0]
          .trim()
          .replace(/^"(.*)"$/, "$1")
      );

      variables[currentSection][name.substring(1)] = value;
    }
  });

  res.status(200).json({
    status: "success",
    settings: variables
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const { data } = req.body;

  const settingsFile = fs.readFileSync(environmentSettingsFile, "utf8");

  const lines = settingsFile.split("\n");

  Object.keys(data).forEach((key) => {
    const lineIndex = lines.findIndex((line) => line.startsWith(`$${key}`));
    lines[lineIndex] = `$${key} = "${data[key]}"`;
  });

  const newSettingsFile = lines.join("\n");

  fs.writeFileSync(environmentSettingsFile, newSettingsFile);

  res.status(200).json({
    status: "success"
  });
});

exports.addProperty = catchAsync(async (req, res, next) => {
  const { key, value, precedent } = req.body;

  const settingsFile = fs.readFileSync(environmentSettingsFile, "utf8");

  const lines = settingsFile.split("\n");

  const lineIndex = lines.findIndex((line) => line.startsWith(`$${precedent}`));

  lines.splice(lineIndex + 1, 0, `$${key} = "${value}"`);

  const newSettingsFile = lines.join("\n");

  fs.writeFileSync(environmentSettingsFile, newSettingsFile);

  res.status(200).json({
    status: "success"
  });
});

exports.getApplicationIcon = catchAsync(async (req, res, next) => {
  const files = fs.readdirSync(path.join(__dirname, "../uploads"));

  const iconPath = files[0];

  res.status(200).json({
    status: "success",
    iconPath: `http://localhost:5001/uploads/${iconPath}`
  });
});

exports.updateApplicationIcon = catchAsync(async (req, res, next) => {
  const files = fs.readdirSync(path.join(__dirname, "../uploads"));

  files.forEach((file) => {
    if (file !== req.file.filename) {
      fs.unlinkSync(path.join(__dirname, "../uploads", file));
    }
  });

  res.status(200).json({
    status: "success",
    iconPath: `http://localhost:5001/${req.file.path}`
  });
});

exports.getEncryptedPasswords = catchAsync(async (req, res, next) => {
  const files = fs.readdirSync(encryptedPasswordsDirectory);

  if (!files.length) {
    return res.status(200).json({
      passwords: []
    });
  }

  const passwords = files
    .filter((file) => file.endsWith(".txt"))
    .map((file) => {
      const content = fs
        .readFileSync(path.join(encryptedPasswordsDirectory, file), "utf16le")
        .replace(/\r?\n|\r/g, "");

      return {
        [file.split(".")[0]]: content
      };
    });

  res.status(200).json({
    passwords
  });
});

exports.encryptPassword = catchAsync(async (req, res, next) => {
  // const password = "password";

  const { password, passwordType } = req.body;

  const powershellInstance = async () => {
    const ps = new PowerShell({
      debug: true,
      executableOptions: {
        "-ExecutionPolicy": "bypass",
        "-NoProfile": true
      }
    });

    try {
      const scriptCommand = PowerShell.command`. ${path.join(
        credentialsDirectory,
        "EncryptSQLServerPassword.ps1"
      )} ${password}`;
      const result = await ps.invoke(scriptCommand);
      console.log(result);
    } catch (error) {
      console.error(error);
    } finally {
      await ps.dispose();
    }
  };

  await powershellInstance();

  res.status(200).json({
    message: "success"
  });
});
