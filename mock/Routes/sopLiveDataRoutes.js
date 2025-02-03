const express = require("express");
const sopLiveDataController = require("../Controllers/sopLiveDataController");

const router = express.Router();

router.get(
  "/sop-live-data/live-data-15",
  sopLiveDataController.getLatestLiveData
);

module.exports = router;
