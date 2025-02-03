const { getConnection } = require("../Database/dbConfig");
const sql = require("mssql");

async function fetchRejections(zone, machine) {
  try {
    // console.log("zone :: ", String(zone));
    // console.log("machine :: ", machine);

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("zone", String(zone))
      .input("machinename", machine)
      .query(
        `select * from sop_rejectionlookup where [zone] = @zone and machinename = @machinename;`
      );
    return result.recordset;
  } catch (error) {
    console.error(
      "Error fetching rejection lookups from table sop_rejectionlookup:",
      error
    );
    throw error;
  }
}

async function fetchDefects(zone) {
  try {
    // console.log("zone :: ", String(zone));

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("cell", String(zone))
      .query(`select * from defect_lookup where cell = @cell;`);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching defects from table defect_lookup:", error);
    throw error;
  }
}

async function createRejectionLookup(zone, machine, assetid, defect) {
  try {
    // console.log("zone :: ", String(zone)); // Ensure zone is a string
    // console.log("machine :: ", machine);
    // console.log("assetid :: ", assetid);
    // console.log("defect :: ", defect);

    const pool = await getConnection();

    // Ensure zone is treated as a string
    const result = await pool
      .request()
      .input("zone", sql.VarChar(50), String(zone)) // Explicitly cast zone to string
      .input("machine", sql.VarChar(50), machine)
      .input("assetid", sql.Int, assetid)
      .input("defect", sql.VarChar(255), defect).query(`
        INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_rejectionlookup (zone, machinename, assetid, phenomena)
        VALUES (@zone, @machine, @assetid, @defect);
      `);

    return result.rowsAffected; // Returns the number of rows affected
  } catch (error) {
    console.error(
      "Error inserting rejection lookup into table sop_rejectionlookup:",
      error
    );
    throw error;
  }
}

async function deleteRejectionLookup(lineid) {
  try {
    // console.log("lineid :: ", lineid);

    const pool = await getConnection();

    // Ensure zone is treated as a string
    const result = await pool.request().input("lineid", lineid).query(`
        DELETE FROM EV_BPA_DEV_MAINLINE.dbo.sop_rejectionlookup WHERE lineid = @lineid;
      `);

    return result.rowsAffected; // Returns the number of rows affected
  } catch (error) {
    console.error(
      "Error deleting rejection lookup in table sop_rejectionlookup:",
      error
    );
    throw error;
  }
}

async function fetchRejectionsFromsop_rejection() {
  try {
    // console.log("zone :: ", String(zone));

    const pool = await getConnection();
    const result = await pool.request().query(`SELECT *
    FROM EV_BPA_DEV_MAINLINE.dbo.sop_rejection
    WHERE rejectiondate >= DATEADD(day, -10, CAST(GETDATE() AS date));
    `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching rejections from sop_rejection:", error);
    throw error;
  }
}

async function createRejection(zone, machine, defect, rejectioncount, shift) {
  try {
    // console.log("zone :: ", String(zone));
    // console.log("machine :: ", machine);
    // console.log("defect :: ", defect);
    // console.log("rejectioncount :: ", rejectioncount);
    // console.log("shift :: ", shift);

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("zone", sql.VarChar(50), String(zone))
      .input("machine", sql.VarChar(50), machine)
      .input("defect", sql.VarChar(50), defect)
      .input("rejectioncount", sql.Int, rejectioncount)
      .input("shift", sql.VarChar(20), shift).query(`
        INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_rejection 
        (rejectiondate, shiftid, assetid, rejectioncount, defect_id)
        SELECT 
            GETDATE() AS rejectiondate,
            s.shiftid,
            a.assetid,
            @rejectioncount,
            d.defect_id
        FROM 
            EV_BPA_DEV_MAINLINE.dbo.sop_shifts s
            CROSS JOIN EV_BPA_DEV_MAINLINE.dbo.sop_assets a
            CROSS JOIN EV_BPA_DEV_MAINLINE.dbo.defect_lookup d
        WHERE 
            s.shiftname = @shift
            AND a.machinename = @machine
            AND CAST(a.zone AS VARCHAR(50)) = @zone
            AND d.defect_phenomenon = @defect
            AND d.cell = (SELECT TOP 1 cell FROM EV_BPA_DEV_MAINLINE.dbo.defect_lookup WHERE cell LIKE @zone + '%')
      `);

    return result.rowsAffected; // Returns the number of rows affected
  } catch (error) {
    console.error("Error inserting rejection into sop_rejection:", error);
    throw error;
  }
}

module.exports = {
  fetchRejections,
  fetchDefects,
  createRejectionLookup,
  deleteRejectionLookup,
  fetchRejectionsFromsop_rejection,
  createRejection,
};
