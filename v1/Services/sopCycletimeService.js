const { getConnection } = require("../Database/dbConfig");

async function getCycletimes() {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(
        "select machineshortname,[zone],cycletime,assetid,machinename from EV_BPA_DEV_MAINLINE.dbo.sop_assets where isbottleneck=1"
      );
    return result.recordset;
  } catch (error) {
    console.error("Error getting data from table sop_assets:", error);
    throw error;
  }
}

async function getCycletimes2() {
  try {
    const pool = await getConnection();
    const machineResult = await pool
      .request()
      // .query("select machineshortname,[zone],cycletime,assetid,machinename from EV_BPA_DEV_MAINLINE.dbo.sop_assets where isbottleneck=1");
      .query(
        "SELECT DISTINCT machinename, [zone] FROM EV_BPA_DEV_MAINLINE.dbo.sop_assets ORDER BY [zone] ASC"
      );

    return machineResult.recordsets[0];
  } catch (error) {
    console.error(
      "Error getting data from table sop_assets from function getCycletimes2():",
      error
    );
    throw error;
  }
}

async function updateCycletime(machineshortname, cycletime) {
  try {
    // console.table({ machineshortname, cycletime });
    const pool = await getConnection();
    await pool
      .request()
      .input("cycletime", cycletime)
      .input("machineshortname", machineshortname)
      .query(
        "UPDATE EV_BPA_DEV_MAINLINE.dbo.sop_assets SET cycletime = @cycletime WHERE machineshortname = @machineshortname"
      );
  } catch (error) {
    console.error("Error updating cycletime to table sop_assets:", error);
    throw error;
  }
}

async function getFilteredCycletimes(startDate, endDate) {
  try {
    // console.log("Function called with params:", {
    //   startDate,
    //   endDate,
    // });

    const pool = await getConnection();
    // console.log("Database connection established");

    const result = await pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .query("SELECT * FROM dbo.GetFilteredCycletimes(@startDate, @endDate)");

    // console.log("Query executed successfully, result:", result.recordset);

    return result.recordset;
  } catch (error) {
    console.error(
      "Error getting filtered data from sql function GetFilteredCycletimes():",
      error
    );
    throw error;
  }
}

// const getFilteredCycletimes = getFilteredCycletimes(
//   "2022-01-01",
//   "2022-01-02",
//   ["31Insertion", "32Insertion"],
//   [3.1, 4.0]
// );

// console.log(getFilteredCycletimes);

module.exports = {
  getCycletimes,
  getCycletimes2,
  updateCycletime,
  getFilteredCycletimes,
};
