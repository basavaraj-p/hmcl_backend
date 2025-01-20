const express = require("express");
const sopShiftHistoryController = require("../Controllers/sopShiftHistoryController");

const router = express.Router();

router.post(
  "/sop-shifts-history/create-shift-history",
  sopShiftHistoryController.createShiftSchedulerHistory
);

router.post(
  "/sop-shifts-history/create-shift-history-on-delete",
  sopShiftHistoryController.createShiftSchedulerHistoryOnDelete
);

router.post(
  "/sop-shifts-history/get-shift-history",
  sopShiftHistoryController.getShiftHistory
);

router.post(
  "/sop-shifts-history/create-shift-break-history",
  sopShiftHistoryController.createShiftBreakHistory
);

router.post(
  "/sop-shifts-history/get-shift-break-history",
  sopShiftHistoryController.getShiftBreakHistory
);

module.exports = router;
