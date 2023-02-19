const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const { exec } = require("child_process");
const { parse } = require("csv-parse");
const { stringify } = require("csv-stringify");
const csv = require("csv");

const { basePath, processesDirectory } = require("../constants");

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
        delimiter: "|",
        quote: false // <== set quote to false to avoid errors
      })
    )
    .on("data", (row) => {
      console.log(row);
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
  // const output = values.join("|");

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

  // parse the data into a 2D array of rows and columns
  csv.parse(data, { delimiter: "|" }, (err, rows) => {
    if (err) throw err;

    // find the index of the row to delete
    const indexToDelete = rows.findIndex((row) => row[0] === commandStep);

    // remove the row to delete and update the index for remaining rows
    for (let i = indexToDelete; i < rows.length - 1; i++) {
      rows[i] = rows[i + 1];
      rows[i][0] = (i + 1).toString().padStart(3, "0");
    }
    rows.pop();

    console.log({ rows });

    const fileStream = fs.createWriteStream(filePath, { encoding: "utf-8" });

    // create the CSV stringifier object with the '|' delimiter
    const stringifier = csv.stringify({ delimiter: "|" });

    // pipe the stringifier output to the file stream
    stringifier.pipe(fileStream);

    // write the rows to the CSV file
    rows.forEach((row) => stringifier.write(row));

    // end the stream
    stringifier.end();
  });

  res.status(200).json({
    status: "success"
  });
});
