const express = require("express");
const sopShiftsController = require("../Controllers/sopShiftsController");

const router = express.Router();

router.get("/sop-shifts/shifts", sopShiftsController.getShifts);
router.get("/sop-shifts/shift-breaks", sopShiftsController.getShiftBreaks);
router.post(
  "/sop-shifts/shift-update-breaks",
  sopShiftsController.updateShiftBreak
);
router.post(
  "/sop-shifts/shift-delete-breaks",
  sopShiftsController.deleteShiftBreak
);
router.get(
  "/sop-shifts/shift-schedules",
  sopShiftsController.getShiftSchedules
);
router.post("/sop-shifts/schedule-shifts", sopShiftsController.scheduleShifts);
router.post(
  "/sop-shifts/schedule-shifts-existing",
  sopShiftsController.getExistingSchedules
);
router.post(
  "/sop-shifts/shift-delete-schedule",
  sopShiftsController.deleteShiftSchedule
);
router.post(
  "/sop-shifts/create-shift-highlights",
  sopShiftsController.createShiftHighlights
);
router.get(
  "/sop-shifts/fetch-shift-highlights",
  sopShiftsController.getShiftHighlights
);

module.exports = router;
