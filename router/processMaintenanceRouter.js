const express = require("express");
const router = express.Router();

const processMaintenanceController = require("../controller/processMaintenanceController");

router.get("/", processMaintenanceController.getProcesses);

router.post("/add-process", processMaintenanceController.addProcess);

router.post("/edit-process", processMaintenanceController.editProcess);

router.delete("/delete-process", processMaintenanceController.deleteProcess);

module.exports = router;
