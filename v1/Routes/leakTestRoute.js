const express = require("express");
const router = express.Router();
const leakTestController = require("../Controllers/leakTestController");

router.post("/leak-test", leakTestController.postLeakTestController); //Route path to get the data from leak test
router.put("/leak-test/update", leakTestController.updateRejectionRework); //Route path to put the data to rejection rework

module.exports = router;
