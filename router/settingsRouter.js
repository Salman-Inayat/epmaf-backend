const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "." + file.originalname.split(".").pop());
  }
});
const upload = multer({ storage: storage });

const settingsController = require("../controller/settingsController");

router.get("/", settingsController.getSettingsFile);

router.put("/update", settingsController.updateSettings);

router.put("/add-property", settingsController.addProperty);

router.get("/application-icon", settingsController.getApplicationIcon);

router.post(
  "/update-application-icon",
  upload.single("file"),
  settingsController.updateApplicationIcon
);

module.exports = router;
