const sopWeeklymaintenanceService = require("../Services/sopWeeklymaintenanceService");

async function getWeeklymaintenancebyZone(req, res) {
  const { zone, month, year } = req.body;
  try {
    // console.log("data : ", { zone, month, year });

    const rowData =
      await sopWeeklymaintenanceService.getWeeklymaintenancebyZone(
        zone,
        month,
        year
      );
    res.json({ ...rowData });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching the rows from getWeeklymaintenancebyZone()",
      });
  }
}

async function getWeeklymaintenancebyMachine(req, res) {
  const { zone, month, machine, year } = req.body;
  try {
    const rowData =
      await sopWeeklymaintenanceService.getWeeklymaintenancebyMachine(
        zone,
        month,
        machine,
        year
      );
    res.json({ ...rowData });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching the rows from getWeeklymaintenancebyMachine()",
      });
  }
}

module.exports = { getWeeklymaintenancebyZone, getWeeklymaintenancebyMachine };
