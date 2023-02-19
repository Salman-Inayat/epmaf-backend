const express = require("express");
const router = express.Router();

const singleProcessController = require("../controller/singleProcessController");

router.get("/:processTitle", singleProcessController.getProcessSteps);

router.post("/:processTitle/step", singleProcessController.addStepToProcess);

router.delete(
  "/:processTitle/step/:commandStep",
  singleProcessController.deleteStepFromProcess
);

module.exports = router;
