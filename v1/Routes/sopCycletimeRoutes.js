const express = require("express");
const sopCycletimeController = require("../Controllers/sopCycletimeController");

const router = express.Router();

router.get("/sop-cycletime/data", sopCycletimeController.getCycletimes);
router.get("/sop-cycletime/data2", sopCycletimeController.getCycletimes2);
router.post("/sop-cycletime/update", sopCycletimeController.updateCycletime);
router.get(
  "/sop-cycletime/filtered",
  sopCycletimeController.getFilteredCycletimes
);

module.exports = router;
