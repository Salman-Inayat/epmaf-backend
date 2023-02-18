const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

exports.getSettingsFile = catchAsync(async (req, res, next) => {
  const settingsFilePath = path.join(
    process.argv[0] + "./Environment_Variables.ps1"
  );

  const settingsFile = fs.readFileSync("./Environment_Variables.ps1", "utf8");

  const variables = {};
  let currentSection = "";

  console.log({ settingsFile });

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

  const settingsFile = fs.readFileSync("./Environment_Variables.ps1", "utf8");

  const lines = settingsFile.split("\n");

  Object.keys(data).forEach((key) => {
    const lineIndex = lines.findIndex((line) => line.startsWith(`$${key}`));
    lines[lineIndex] = `$${key} = "${data[key]}"`;

    console.log("Line updated: ", lines[lineIndex]);
  });

  const newSettingsFile = lines.join("\n");

  fs.writeFileSync("./Environment_Variables.ps1", newSettingsFile);

  res.status(200).json({
    status: "success"
  });
});

exports.addProperty = catchAsync(async (req, res, next) => {
  const { key, value, precedent } = req.body;

  const settingsFile = fs.readFileSync("./Environment_Variables.ps1", "utf8");

  const lines = settingsFile.split("\n");

  const lineIndex = lines.findIndex((line) => line.startsWith(`$${precedent}`));

  lines.splice(lineIndex + 1, 0, `$${key} = "${value}"`);

  const newSettingsFile = lines.join("\n");

  fs.writeFileSync("./Environment_Variables.ps1", newSettingsFile);

  res.status(200).json({
    status: "success"
  });
});
