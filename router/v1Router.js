const express = require("express");
const router = express.Router();
const authRouter = require("./authRouter");
const settingsRouter = require("./settingsRouter");

router.use("/auth", authRouter);
router.use("/settings", settingsRouter);

module.exports = router;
