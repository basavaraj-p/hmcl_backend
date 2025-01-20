const { getConnection } = require("../Database/dbConfig");

async function getRowCount() {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM dbo.sop_alarm");
    return result.recordset[0].count;
  } catch (error) {
    console.error("Error getting row count from table sop_alarm:", error);
    throw error;
  }
}

async function getLatestAlarms(limit = 10) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("limit", limit)
      .query("SELECT TOP (@limit) * FROM dbo.sop_alarm ORDER BY [time] DESC");
    return result.recordset;
  } catch (error) {
    console.error("Error getting latest alarms from table sop_alarm:", error);
    throw error;
  }
}

async function getTodayRowCount() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM dbo.sop_alarm 
        WHERE [time] >= CAST(GETDATE() AS DATE) 
        AND [time] < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
      `);
    return result.recordset[0].count;
  } catch (error) {
    console.error(
      "Error getting today's row count from table sop_alarm:",
      error
    );
    throw error;
  }
}

module.exports = { getRowCount, getLatestAlarms, getTodayRowCount };
