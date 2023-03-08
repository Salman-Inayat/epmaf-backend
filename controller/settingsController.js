const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const path = require("path");

const { PowerShell } = require("node-powershell");

const {
  environmentSettingsFile,
  encryptedPasswordsDirectory,
  credentialsDirectory,
  iconDirectory
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
      const [name, value] = line.split("=", 2).map(
        (str) => str.split("#")[0].trim()
        // .replace(/^"(.*)"$/, "$1")
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
  let { category, data } = req.body;

  data = JSON.parse(data);

  console.log({ category, data });

  const settingsFile = fs.readFileSync(environmentSettingsFile, "utf8");

  const lines = settingsFile.split("\n");

  const sectionStartIndex = lines.findIndex((line) =>
    line.startsWith(`## ${category} ##`)
  );

  const sectionEndIndex = lines.findIndex(
    (line, index) => line.startsWith("## ") && index > sectionStartIndex
  );

  const sectionLines = lines.slice(sectionStartIndex, sectionEndIndex);

  console.log({ sectionStartIndex, sectionEndIndex, sectionLines });
  Object.keys(data).forEach((key) => {
    const lineIndex = sectionLines.findIndex((line) =>
      line.startsWith(`$${key}`)
    );
    sectionLines[lineIndex] = `$${key} = ${data[key]}`;
  });

  lines.splice(
    sectionStartIndex,
    sectionEndIndex - sectionStartIndex,
    ...sectionLines
  );

  const newSettingsFile = lines.join("\n");

  fs.writeFileSync(environmentSettingsFile, newSettingsFile);

  // const settingsFile = fs.readFileSync(environmentSettingsFile, "utf8");

  // const lines = settingsFile.split("\n");

  // Object.keys(data).forEach((key) => {
  //   const lineIndex = lines.findIndex((line) => line.startsWith(`$${key}`));
  //   lines[lineIndex] = `$${key} = ${data[key]}`;

  //   // if (
  //   //   data[key].charAt(0) === "'" ||
  //   //   data[key].charAt(0) === '"' ||
  //   //   data[key].charAt(0) === "$"
  //   // ) {
  //   //   lines[lineIndex] = `$${key}= ${data[key]}`;
  //   // } else {
  //   //   lines[lineIndex] = `$${key} = "${data[key]}"`;
  //   // }
  // });

  // const newSettingsFile = lines.join("\n");

  // fs.writeFileSync(environmentSettingsFile, newSettingsFile);

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

exports.getEncryptedPasswords = catchAsync(async (req, res, next) => {
  const files = fs.readdirSync(encryptedPasswordsDirectory);
  let encryptedPasswords = [];

  if (!files.length) {
    return res.status(200).json({
      encryptedPasswords
    });
  }

  files.forEach((file) => {
    const stats = fs.statSync(path.join(encryptedPasswordsDirectory, file));
    if (file.endsWith(".epw")) {
      encryptedPasswords.push({
        title: "EPM Cloud",
        encrypted: stats.size > 1 ? true : false,
        fileName: file,
        lastEncryptionTime: stats.mtime
      });
    } else {
      const fileName = file.split(".")[0];

      let key;

      if (fileName.includes("sftp")) key = "SFTP Server";
      if (fileName.includes("smtp")) key = "SMTP Server";
      if (fileName.includes("sql")) key = "SQL Server";

      encryptedPasswords.push({
        title: key,
        encrypted: stats.size > 1 ? true : false,
        fileName: file,
        lastEncryptionTime: stats.mtime
      });
    }
  });

  res.status(200).json({
    message: "success",
    encryptedPasswords
  });
});

exports.encryptPassword = catchAsync(async (req, res, next) => {
  const { key, value, fileName } = req.body;

  console.log({ key, value, fileName });

  let powershellScriptFile = "";

  // ["sftppassword", "sqlserverpassword", "smtppassword"].forEach((file) => {
  //   const filePath = path.join(encryptedPasswordsDirectory, `${file}.txt`);

  //   if (!fs.existsSync(filePath)) {
  //     fs.writeFileSync(filePath, "", "utf16le");
  //   }
  // });

  switch (key) {
    case "SQLServerPassword":
      powershellScriptFile = "FE_EncryptSQLServerPassword.ps1";
      break;

    case "SMTPServerPassword":
      powershellScriptFile = "FE_EncryptSMTPPassword.ps1";
      break;

    case "SFTPServerPassword":
      powershellScriptFile = "FE_EncryptSFTPPassword.ps1";
      break;

    case "EPMCloudPassword":
      powershellScriptFile = "FE_EncryptEPMCloudPassword.ps1";
      break;

    default:
      break;
  }

  const ps = new PowerShell({
    executableOptions: {
      "-ExecutionPolicy": "bypass",
      "-NoProfile": true
    }
  });

  const powershellInstance = async () => {
    try {
      const scriptCommand = PowerShell.command`. ${path.join(
        credentialsDirectory,
        powershellScriptFile
      )} ${value} ${key === "EPMCloudPassword" ? fileName : ""}`;
      const result = await ps.invoke(scriptCommand);
      console.log({ result });

      res.status(200).json({
        message: "success"
      });
    } catch (error) {
      console.error({ error });

      const filesObj = {
        SQLServerPassword: "sqlserverpassword.txt",
        SMTPServerPassword: "smtppassword.txt",
        SFTPServerPassword: "sftppassword.txt",
        EPMCloudPassword: fileName
      };

      const files = fs.readdirSync(encryptedPasswordsDirectory);
      files.forEach((file) => {
        if (file.startsWith(filesObj[key])) {
          fs.unlinkSync(path.join(encryptedPasswordsDirectory, file));
        }
      });

      res.status(500).json({
        message: "An error occurred"
      });
    } finally {
      await ps.dispose();
    }
  };

  await powershellInstance();
});

exports.generateInitialEncryptionKeys = catchAsync(async (req, res) => {
  const powershellInstance = async (powershellScriptFile, value) => {
    const ps = new PowerShell({
      executableOptions: {
        "-ExecutionPolicy": "bypass",
        "-NoProfile": true
      }
    });

    try {
      const scriptCommand = PowerShell.command`. ${path.join(
        credentialsDirectory,
        powershellScriptFile
      )} ${value}`;
      const result = await ps.invoke(scriptCommand);
      console.log({ result });
    } catch (error) {
      console.error({ error });
    } finally {
      await ps.dispose();
    }
  };

  res.status(200).json({
    message: "success"
  });

  await powershellInstance("FE_EncryptSQLServerPassword.ps1", "password");
  await powershellInstance("FE_EncryptSMTPPassword.ps1", "password");
  await powershellInstance("FE_EncryptSFTPPassword.ps1", "password");
});
