const express = require("express");
const sopAlarmController = require("../Controllers/sopAlarmController");

const router = express.Router();

router.get("/sop-alarm/count", sopAlarmController.getRowCount);
// router.get("/sop-alarm/latest", sopAlarmController.getLatestAlarms);
router.get("/sop-alarm/today-count", sopAlarmController.getTodayRowCount);

module.exports = router;
