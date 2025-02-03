const { getConnection } = require("../Database/dbConfig");
const jsonFunctions = require("../Json/functions");
const fs = require("fs").promises; // Use the promise-based version of fs

async function getRowCount() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopStopages.json");
    return result.total_stopages;
  } catch (error) {
    console.error("Error getting row count:", error);
    throw error;
  }
}

async function getRowCount2(defaultId) {
  // console.log("Default ID ",defaultId )
  try {
    // const pool = await getConnection();
    // var result;
    if (defaultId == 1) {
      const result = await jsonFunctions.getJSON("mock/Json/sopStopages.json");
      return result.stopages;
    }
    if (defaultId == 2) {
      const result = await jsonFunctions.getJSON("mock/Json/sopStopages.json");
      return result.stopages;
    }
  } catch (error) {
    console.error("Error getting row count:", error);
    throw error;
  }
}

// async function getConsolidatedLoss(lossid, defaultId) {
//   // console.log("Consolidated Losses",lossid,defaultId)
//   // lossid is the key given to the lossTypes. 0 -> None, 1 -> Breakdown Loss,... Refer LossTypes in stoppageReasons.js in frontend
//   // const reason = "";
//   var result;
//   try {
//     const pool = await getConnection();
//     if (defaultId == 1) {
//       result = await pool.request().input("lossid", lossid)
//         .query(`SELECT S.stopid, S.starttime, S.endtime, S.lossid, S.duration, S.reason, A.machinename, A.zone 
//             FROM dbo.sop_stopagereason S 
//             LEFT JOIN 
//             dbo.sop_assets A 
//             ON  S.assetid = A.assetid 
//             WHERE S.lossid = @lossid`);
//       // console.log("Fetching all data")
//       return result.recordset;
//     }
//     if (defaultId == 2) {
//       result = await pool.request().input("lossid", lossid)
//         .query(`SELECT  S.stopid,  S.starttime,  S.endtime,  S.lossid,  S.duration,  S.reason,  A.machinename,  A.zone 
//         FROM dbo.sop_stopagereason S 
//         LEFT JOIN dbo.sop_assets A 
//         ON S.assetid = A.assetid 
//         WHERE  S.lossid = @lossid
//         AND S.starttime >= DATEADD(DAY, -10, GETDATE());
//     `);

//       // console.log("Fetching last 10 days  data")

//       return result.recordset;
//     }
//   } catch (Err) {
//     console.error("Error getting in updateStoppage:", Err);
//     throw Err;
//   }
// }

async function updateStoppage(stopid, lossid, reason) {
  // console.log("Update Stoppage ",stopid,lossid,reason)
  try {
    const data = await jsonFunctions.getJSON("mock/Json/sopStopages.json");
    const result = data.stopages.filter((value) => value.stopid === stopid)[0];
    result.lossid = lossid
    result.reason = reason
    await fs.writeFile(
      "mock/Json/sopStopages.json",
      JSON.stringify(data, null, 2),
      "utf-8"
    );

  } catch (Err) {
    console.error("Error getting in updateStoppage:", Err);
    throw Err;
  }
}

async function getTodayRowCount() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopStopages.json");
    return result.current_stopages;
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
  // getConsolidatedLoss,
};

/*
  

*/
