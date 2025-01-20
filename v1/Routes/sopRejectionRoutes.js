const express = require("express");
const sopRejectionController = require("../Controllers/sopRejectionController");

const router = express.Router();

router.post(
  "/sop-rejection/fetch-rejections",
  sopRejectionController.fetchRejections
);

router.post(
  "/sop-rejection/fetch-defects",
  sopRejectionController.fetchDefects
);

router.post(
  "/sop-rejection/create-rejection-lookup",
  sopRejectionController.createRejectionLookup
);

router.post(
  "/sop-rejection/delete-rejection-lookup",
  sopRejectionController.deleteRejectionLookup
);

router.get(
  "/sop-rejection/fetch-rejections-fromsop-rejection",
  sopRejectionController.fetchRejectionsFromsop_rejection
);

router.post(
  "/sop-rejection/create-rejection",
  sopRejectionController.createRejection
);

module.exports = router;
