const bdUnitService = require("../Services/bdService");

async function getBdUnit(req, res) {
  try {
    const result = await bdUnitService.getBdUnit();
    // console.log("Unit controller" )
    res.json({ result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the bd Unit " });
  }
}

async function getBdPhenomena(req, res) {
  try {
    const result = await bdUnitService.getBdPhenomena();
    // console.log("Phenomena controller")
    res.json({ result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the bd Phenomena " });
  }
}

async function getBdCause(req, res) {
  try {
    const result = await bdUnitService.getBdCause();
    // console.log("Cause controller")
    res.json({ result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the bd Cause " });
  }
}

async function postEventAnalysis(req, res) {
  const { breakdownReasonForm } = req.body;
  // console.log("Event analysis controller");
  try {
    const result = await bdUnitService.postEventAnalysis(breakdownReasonForm);
    res.json({ result });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "An error occurred while fetching the bd event analysis ",
      });
  }
}

module.exports = { getBdUnit, getBdPhenomena, getBdCause, postEventAnalysis };
