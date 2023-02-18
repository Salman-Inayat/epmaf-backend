const express = require("express");
const router = express.Router();

const settingsController = require("../controller/settingsController");

router.get("/", settingsController.getSettingsFile);

router.put("/update", settingsController.updateSettings);

module.exports = router;
