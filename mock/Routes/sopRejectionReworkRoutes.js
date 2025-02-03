const express = require("express");
const sopRejectionReworkController = require("../Controllers/sopRejectionReworkController");

const router = express.Router();

router.get(
  "/sop-rejection-rework/fetch-defects",
  sopRejectionReworkController.fetchRejections
);

router.post(
  "/sop-rejection-rework/create-rejection-rework",
  sopRejectionReworkController.createRejectionRework
);

router.get(
  "/sop-rejection-rework/fetch-rejection-reworks",
  sopRejectionReworkController.fetchRejectionReworks
);

router.get(
  "/sop-rejection-rework/fetch-assets",
  sopRejectionReworkController.fetchAssets
);

// router.post(
//   "/sop-rejection-rework/check-barcodes",
//   sopRejectionReworkController.checkBarcodes
// );

module.exports = router;
