const express = require("express");
const router = express.Router();
const multer = require("multer");
const { iconDirectory } = require("../constants");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, iconDirectory);
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

router.get("/encrypted-passwords", settingsController.getEncryptedPasswords);

router.post("/encrypt-password", settingsController.encryptPassword);

router.post(
  "/generate-initial-encryption-keys",
  settingsController.generateInitialEncryptionKeys
);

router.post(
  "/update-app-name",
  settingsController.updateApplicationNameSettings
);

router.get("/get-app-name", settingsController.getApplicationNameSettings);

router.get("/dummy", (req, res) => {
  res.status(200).json({
    message: "Message from dummy route"
  });
});

module.exports = router;
