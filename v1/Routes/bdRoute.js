const express = require("express");
const router = express.Router();
const bdController = require("../Controllers/bdController");

router.get("/bd/unit", bdController.getBdUnit); //Route path to get the data from bd_unit_code
router.get("/bd/phenomena", bdController.getBdPhenomena); //Route path to get the data from bd_phenomenon_code
router.get("/bd/cause", bdController.getBdCause); //Route path to get the data from bd_cause_code
router.post("/bd/event", bdController.postEventAnalysis); //Route path to get the data from bd_event-analysis

module.exports = router;
