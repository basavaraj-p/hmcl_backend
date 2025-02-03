const { getConnection } = require("../Database/dbConfig");

async function getLatestLiveData() {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(
        "SELECT TOP (15) * FROM dbo.test_eol_lasermarking ORDER BY date_time DESC"
      );
    return result.recordset;
  } catch (error) {
    console.error(
      "Error getting live data from table test_eol_lasermarking:",
      error
    );
    throw error;
  }
}

module.exports = {
  getLatestLiveData,
};
