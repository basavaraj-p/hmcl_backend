const sopCycletimeService = require("../Services/sopCycletimeService");

async function getCycletimes(req, res) {
  try {
    const data = await sopCycletimeService.getCycletimes();
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching data from getCycletimes()",
    });
  }
}

async function getCycletimes2(req, res) {
  try {
    const data = await sopCycletimeService.getCycletimes2();
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching data from getCycletimes2()",
    });
  }
}

async function updateCycletime(req, res) {
  const { machineshortname, cycletime } = req.body;
  try {
    await sopCycletimeService.updateCycletime(machineshortname, cycletime);
    res.status(200).json({ message: "Cycletime updated successfully" });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while updating the cycletime from updateCycletime()",
    });
  }
}

async function getFilteredCycletimes(req, res) {
  const { startDate, endDate } = req.query;

  try {
    const data = await sopCycletimeService.getFilteredCycletimes(
      startDate,
      endDate
    );
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching data from getFilteredCycletimes()",
    });
  }
}

module.exports = {
  getCycletimes,
  getCycletimes2,
  updateCycletime,
  getFilteredCycletimes,
};
