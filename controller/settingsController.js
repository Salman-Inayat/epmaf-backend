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

  const json = JSON.stringify(variables, null, 2);
  console.log(json);

  res.status(200).json({
    status: "success",
    settings: variables
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const { category, data } = req.body;

  //   async function parsePS1(ps1FilePath) {
  //     const data = fs.readFileSync(ps1FilePath, "utf-8");

  //     const sections = {};
  //     let currentSection = null;

  //     data.split("\n").forEach((line) => {
  //       // Remove whitespace and comments
  //       line = line.trim().split("#")[0].trim();

  //       // Check if line is a section title
  //       if (line.startsWith("## ")) {
  //         currentSection = line.substring(3).trim();
  //         sections[currentSection] = {};
  //       } else if (line.includes("=")) {
  //         // Check if line is a variable assignment
  //         const [key, value] = line.split("=");
  //         console.log(key, value);
  //         sections[currentSection][key.trim()] = value.trim().replace(/"/g, "");
  //       }
  //     });

  //     return sections;
  //   }

  //   function generatePS1(data) {
  //     let result = "";
  //     Object.keys(data).forEach((section) => {
  //       result += `## ${section}\n`;
  //       Object.keys(data[section]).forEach((key) => {
  //         result += `$${key} = "${data[section][key]}"\n`;
  //       });
  //       result += "\n";
  //     });
  //     return result;
  //   }

  //   const ps1Data = parsePS1("../Environment_Variables.ps1");

  //   // Add the new variable to the data
  //   ps1Data[category] = data;

  //   // Convert the data back to a string and write it to the file
  //   const ps1String = generatePS1(ps1Data);
  //   fs.writeFileSync("../Environment_Variables.ps1", ps1String);

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
