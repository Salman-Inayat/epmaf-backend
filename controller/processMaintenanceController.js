const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const { exec } = require("child_process");
const { basePath, processesDirectory } = require("../constants");

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

exports.addProcess = catchAsync(async (req, res) => {
  const { title } = req.params.processFileName;

  console.log({ title });

  // create a csv file in the processes directory
  const filePath = `${processesDirectory}/${title}.csv`;
  fs.writeFileSync(filePath, "");

  res.status(200).json({
    status: "success"
  });
});

exports.deleteProcess = catchAsync(async (req, res) => {
  const { title } = req.query;

  console.log({ title });

  // delete a csv file in the processes directory
  const filePath = `${processesDirectory}/${title}.csv`;

  // check if file exists
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  res.status(200).json({
    status: "success"
  });
});
