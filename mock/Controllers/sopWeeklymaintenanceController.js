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


module.exports = { getWeeklymaintenancebyZone };
