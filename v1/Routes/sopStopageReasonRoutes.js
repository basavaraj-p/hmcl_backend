const express = require("express");
const sopStopageReasonController = require("../Controllers/sopStopageReasonController");

const router = express.Router();

router.get("/sop-stopage-reason/count", sopStopageReasonController.getRowCount);
router.get(
  "/sop-stopage-reason/today-count",
  sopStopageReasonController.getTodayRowCount
);

router.get(
  "/sop-stopage-reason/count2",
  sopStopageReasonController.getRowCount2
);
router.get(
  "/sop-stopage-reason/consolidate-loss",
  sopStopageReasonController.getConsolidatedLoss
);
router.post(
  "/sop-stopage-reason/update",
  sopStopageReasonController.updateStoppage
);

module.exports = router;
