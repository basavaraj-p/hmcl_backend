const { getConnection } = require("../Database/dbConfig");

async function getRowCount() {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM dbo.sop_stopagereason");
    return result.recordset[0].count;
  } catch (error) {
    console.error("Error getting row count:", error);
    throw error;
  }
}

async function getRowCount2(defaultId) {
  // console.log("Default ID ",defaultId )
  try {
    const pool = await getConnection();
    var result;
    if (defaultId == 1) {
      result = await pool.request()
        .query(`SELECT S.stopid, S.starttime, S.endtime, S.duration, S.lossid, S.reason, 
              A.machinename, A.zone FROM  dbo.sop_stopagereason S LEFT JOIN dbo.sop_assets A ON S.assetid = A.assetid`);
      // .query(`SELECT DISTINCT S.assetid, A.machinename, A.zone FROM  dbo.sop_stopagereason S LEFT JOIN dbo.sop_assets A ON S.assetid = A.assetid`)

      // console.log("defaultId stop",defaultId)
      return [result];
    }
    if (defaultId == 2) {
      result = await pool.request()
        .query(`SELECT  S.stopid,  S.starttime,  S.endtime,  S.duration,  S.lossid,  S.reason,  A.machinename,  A.zone 
               FROM  dbo.sop_stopagereason S 
               LEFT JOIN dbo.sop_assets A 
               ON S.assetid = A.assetid 
               WHERE  S.starttime >= DATEADD(DAY, -10, GETDATE());`);
      //  console.log("defaultId stop",defaultId)
      return [result];
    }
  } catch (error) {
    console.error("Error getting row count:", error);
    throw error;
  }
}

async function getConsolidatedLoss(lossid, defaultId) {
  // console.log("Consolidated Losses",lossid,defaultId)
  // lossid is the key given to the lossTypes. 0 -> None, 1 -> Breakdown Loss,... Refer LossTypes in stoppageReasons.js in frontend
  // const reason = "";
  var result;
  try {
    const pool = await getConnection();
    if (defaultId == 1) {
      result = await pool.request().input("lossid", lossid)
        .query(`SELECT S.stopid, S.starttime, S.endtime, S.lossid, S.duration, S.reason, A.machinename, A.zone 
            FROM dbo.sop_stopagereason S 
            LEFT JOIN 
            dbo.sop_assets A 
            ON  S.assetid = A.assetid 
            WHERE S.lossid = @lossid`);
      // console.log("Fetching all data")
      return result.recordset;
    }
    if (defaultId == 2) {
      result = await pool.request().input("lossid", lossid)
        .query(`SELECT  S.stopid,  S.starttime,  S.endtime,  S.lossid,  S.duration,  S.reason,  A.machinename,  A.zone 
        FROM dbo.sop_stopagereason S 
        LEFT JOIN dbo.sop_assets A 
        ON S.assetid = A.assetid 
        WHERE  S.lossid = @lossid
        AND S.starttime >= DATEADD(DAY, -10, GETDATE());
    `);

      // console.log("Fetching last 10 days  data")

      return result.recordset;
    }
  } catch (Err) {
    console.error("Error getting in updateStoppage:", Err);
    throw Err;
  }
}

async function updateStoppage(stopid, lossid, reason) {
  // console.log("Update Stoppage ",stopid,lossid,reason)
  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("stopid", stopid)
      .input("lossid", lossid)
      .input("reason", reason)
      .query(
        "UPDATE EV_BPA_DEV_MAINLINE.dbo.sop_stopagereason SET lossid = @lossid, reason = @reason WHERE stopid = @stopid"
      );
  } catch (Err) {
    console.error("Error getting in updateStoppage:", Err);
    throw Err;
  }
}

async function getTodayRowCount() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM dbo.sop_stopagereason 
        WHERE stoptime >= CAST(GETDATE() AS DATE) 
        AND stoptime < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
      `);
    return result.recordset[0].count;
  } catch (error) {
    console.error("Error getting today's row count:", error);
    throw error;
  }
}

module.exports = {
  getRowCount,
  getRowCount2,
  getTodayRowCount,
  updateStoppage,
  getConsolidatedLoss,
};

/*
  

*/
