const express = require("express");
const router = express.Router();
const defectLookupController = require("../Controllers/sopDefectLookupController");

router.post("/defect/lookup", defectLookupController.getDefectLookupController); //Route path to get the data from leak test

module.exports = router;
