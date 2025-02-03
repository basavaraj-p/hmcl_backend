const express = require("express");
const sopWeeklymaintenanceController = require("../Controllers/sopWeeklymaintenanceController");

const router = express.Router();

router.post(
  "/sop-weeklymaintenance/zone",
  sopWeeklymaintenanceController.getWeeklymaintenancebyZone
);

module.exports = router;
