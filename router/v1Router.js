const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const settingsRouter = require("./settingsRouter");
const processMaintenanceRouter = require("./processMaintenanceRouter");
const singleProcessRouter = require("./singleProcessRouter");

router.use("/auth", authRouter);
router.use("/settings", settingsRouter);
router.use("/process-maintenance", processMaintenanceRouter);
router.use("/process", singleProcessRouter);

module.exports = router;
