const defectLookUpService = require("../Services/sopDefectLookupService");

async function getDefectLookupController(req, res) {
  const filterData = req.body;
  // console.log("getDefectLookupController ", filterData);
  const machine = filterData.params.machine;
  const defectType = filterData.params.defect_type;
  try {
    const result = await defectLookUpService.getDefectLookupService(filterData);
    // console.log("In def look up controller ",result)
    res.status(200).json({ result });
  } catch (error) {
    // console.log("Error >>>>>>>> ", error);
    res.status(500).json({
      message: "An error occurred in getDefectLookupController ",
      error: error,
    });
  }
}

module.exports = { getDefectLookupController };
