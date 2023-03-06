const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const { exec } = require("child_process");
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const csv = require("csv");

const {
  processesDirectory,
  getDelimiterFromSettingsFile
} = require("../constants");

exports.getProcessSteps = catchAsync(async (req, res) => {
  const title = req.params.processTitle;

  // read the csv file
  const filePath = `${processesDirectory}/${title}.csv`;

  // check if file exists
  if (!fs.existsSync(filePath)) {
    throw new AppError("Process not found", 404);
  }

  // read the csv file and parse it to json and return it

  let processSteps = [];

  fs.createReadStream(filePath)
    .pipe(
      parse({
        delimiter: getDelimiterFromSettingsFile(),
        quote: false // <== set quote to false to avoid errors
      })
    )
    .on("data", (row) => {
      // remove " from the start and end of the string
      row = row.map((item) => {
        return item.replace(/^"(.*)"$/, "$1");
      });

      let stepData = {
        commandStep: row[0],
        commandType: row[2],
        commandDescription: row[3],
        command: row[4],
        commandEnabled: row[5],
        commandContinueOnError: row[6]
      };

      processSteps.push(stepData);
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
      res.status(200).json({
        status: "success",
        steps: processSteps
      });
    });
});

exports.addStepToProcess = catchAsync(async (req, res) => {
  const title = req.params.processTitle;

  const { data } = req.body;

  // read the csv file
  const filePath = `${processesDirectory}/${title}.csv`;

  // check if file exists
  if (!fs.existsSync(filePath)) {
    throw new AppError("Process not found", 404);
  }

  const values = Object.values(data);

  // wrap the output in quotes
  const output = `"${values.join('"|"')}"`;

  fs.appendFileSync(filePath, output + "\n");

  res.status(200).json({
    status: "success"
  });
});

exports.deleteStepFromProcess = catchAsync(async (req, res) => {
  const { processTitle, commandStep } = req.params;

  // read the csv file
  const filePath = `${processesDirectory}/${processTitle}.csv`;

  // check if file exists
  if (!fs.existsSync(filePath)) {
    throw new AppError("Process not found", 404);
  }

  // read the file into memory
  const data = fs.readFileSync(filePath, "utf-8");

  // pick the row of the file where the commandStep matches the commandStep in the request
  const rows = data.split("\n");

  const rowToDelete = rows.find((row) => row.includes(commandStep));

  // remove the row from the file
  const updatedFile = data.replace(rowToDelete + "\n", "");

  // write the updated file to the file system
  fs.writeFileSync(filePath, updatedFile);

  res.status(200).json({
    status: "success"
  });
});

exports.updateStepInProcess = catchAsync(async (req, res) => {
  const title = req.params.processTitle;

  const { data } = req.body;

  // read the csv file
  const filePath = `${processesDirectory}/${title}.csv`;

  // check if file exists
  if (!fs.existsSync(filePath)) {
    throw new AppError("Process not found", 404);
  }

  // read the file contents

  const values = Object.values(data);

  // wrap the output in quotes
  const output = `"${values.join('"|"')}"`;

  // pick the row of the file where the commandStep matches the commandStep in the request
  const file = fs.readFileSync(filePath, "utf-8");
  const rows = file.split("\n");
  const rowToUpdate = rows.find((row) => row.includes(data.commandStep));

  // replace the row with the new data
  const updatedFile = file.replace(rowToUpdate, output);

  // write the updated file to the file system
  fs.writeFileSync(filePath, updatedFile);

  res.status(200).json({
    status: "success"
  });
});

exports.runProcess = catchAsync(async (req, res) => {
  const processTitle = req.params.processTitle;

  console.log({ processTitle });
  res.status(200).json({
    message: "success"
  });
});
