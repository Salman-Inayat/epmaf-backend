const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const { exec } = require("child_process");
const { processesDirectory } = require("../constants");

/**
 * Get all processes
 * @returns {array} - processes
 * @returns {object} - status
 *
 */
exports.getProcesses = catchAsync(async (req, res) => {
  const processes = fs.readdirSync(processesDirectory);

  // filter process that starts with P and remove the extension
  const processWithoutExtension = processes
    .filter((process) => process.startsWith("P"))
    .map((process) => process.replace(".csv", ""));

  res.status(200).json({
    status: "success",
    processes: processWithoutExtension
  });
});

/**
 * Add a process
 * @param {string} title - the title of the process
 * @returns {object} - status
 */
exports.addProcess = catchAsync(async (req, res) => {
  const { title } = req.body;

  console.log({ title });

  // create a csv file in the processes directory
  const filePath = `${processesDirectory}/${title}.csv`;
  fs.writeFileSync(filePath, "");

  res.status(200).json({
    status: "success"
  });
});

/**
 * Edit a process
 * @param {string} oldTitle - the old title of the process
 * @param {string} newTitle - the new title of the process
 * @returns {object} - status
 */
exports.editProcess = catchAsync(async (req, res) => {
  const { oldTitle, newTitle } = req.body;

  console.log({ oldTitle, newTitle });

  // rename a csv file in the processes directory
  const oldFilePath = `${processesDirectory}/${oldTitle}.csv`;
  const newFilePath = `${processesDirectory}/${newTitle}.csv`;

  // check if file exists
  if (fs.existsSync(oldFilePath)) {
    fs.renameSync(oldFilePath, newFilePath);
  }

  res.status(200).json({
    status: "success"
  });
});

/**
 * Delete a process
 * @param {string} title - the title of the process
 * @returns {object} - status
 */
exports.deleteProcess = catchAsync(async (req, res) => {
  const { title } = req.query;

  const filePrefix = title.split("_")[0];

  const filePath = `${processesDirectory}/${title}.csv`;

  // delete the content of the file
  fs.writeFileSync(filePath, "");

  // rename the file to P001_NotUsed.csv
  const newFilePath = `${processesDirectory}/${filePrefix}_NotUsed.csv`;
  fs.renameSync(filePath, newFilePath);

  res.status(200).json({
    status: "success"
  });
});
