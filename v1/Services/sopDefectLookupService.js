const { getConnection } = require("../Database/dbConfig");

// async function getDefectLookupService(filterData) {
//   // console.log("getDefectLookupService **** ",filterData.params.machine)
//   const machine = filterData.params.machine;
//   const defectType = filterData.params.defect_type;

//   let pool;
//   try {
//     pool = await getConnection();
//     const result = await pool.request().input("machine",machine).input("defectType",defectType)
//     .query(`SELECT defect_code, defect_name , station FROM EV_BPA_DEV_MAINLINE.dbo.sop_defect_lookup WHERE station = @machine AND defect_type = @defectType;`);
//     // console.log("get defect result ",result.recordset)
//     return result.recordset;
//   } catch (error) {
//     console.error("Error while getting sop defect lookup  : ", error);
//     throw error;
//     }finally {
//         pool.close();
//     }
// }

async function getDefectLookupService(filterData) {
  let station = filterData.params.machine;
  let defect_type = filterData.params.defect_type;
  // console.log("machine ", station, " ", "defectType ", defect_type);

  let pool, result, query;
  pool = await getConnection();
  try {
    query = `
        SELECT defect_code, defect_name, station 
        FROM EV_BPA_DEV_MAINLINE.dbo.sop_defect_lookup
        WHERE station = @station AND defect_type = @defect_type`;

    if (station != "" && defect_type != "") {
      result = await pool
        .request()
        .input("station", station)
        .input("defect_type", defect_type)
        .query(query);
      return result.recordset;
    }
    return -1;
  } catch (error) {
    console.error("Error while getting sop defect lookup: ", error);
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

module.exports = { getDefectLookupService };
