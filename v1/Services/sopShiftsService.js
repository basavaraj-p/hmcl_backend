const { getConnection } = require("../Database/dbConfig");
const sql = require("mssql");

async function getShifts() {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM dbo.sop_shifts order by shiftid asc");
    return result.recordset;
  } catch (error) {
    console.error("Error getting rows from table sop_shifts:", error);
    throw error;
  }
}

async function getShiftBreaks() {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(
        "SELECT * FROM dbo.sop_shiftbreaks order by shiftid,breakstart asc"
      );
    return result.recordset;
  } catch (error) {
    console.error("Error getting rows from table sop_shiftbreaks:", error);
    throw error;
  }
}

async function updateShiftBreak(
  shiftid,
  breakstart,
  breakend,
  breakdescription
) {
  try {
    console.table({ shiftid, breakstart, breakend, breakdescription });
    const pool = await getConnection();
    await pool
      .request()
      .input("shiftid", shiftid)
      .input("breakstart", breakstart)
      .input("breakend", breakend)
      .input("breakdescription", breakdescription)
      .query(
        "INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_shiftbreaks (shiftid, breakstart, breakend, breakdescription) VALUES (@shiftid, @breakstart, @breakend, @breakdescription)"
      );
  } catch (error) {
    console.error(
      "Error updating shiftBreaks to table sop_shiftbreaks:",
      error
    );
    throw error;
  }
}

async function deleteShiftBreak(breakid) {
  try {
    // console.log("breakid :: ", breakid);
    const pool = await getConnection();
    await pool
      .request()
      .input("breakid", breakid)
      .query(
        "DELETE FROM EV_BPA_DEV_MAINLINE.dbo.sop_shiftbreaks WHERE breakid = @breakid"
      );
  } catch (error) {
    console.error(
      "Error deleting shiftBreak from table sop_shiftbreaks:",
      error
    );
    throw error;
  }
}

async function getShiftSchedules() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`WITH LatestDate AS (
    SELECT MAX(scheduledate) AS max_date
    FROM EV_BPA_DEV_MAINLINE.dbo.sop_shiftscheduler
)
SELECT s.*
FROM EV_BPA_DEV_MAINLINE.dbo.sop_shiftscheduler s
CROSS JOIN LatestDate ld
WHERE s.scheduledate BETWEEN DATEADD(day, -9, ld.max_date) AND ld.max_date
ORDER BY s.scheduledate DESC, s.shiftid`);
    return result.recordset;
  } catch (error) {
    console.error(
      "Error getting shift Schedules from table sop_shiftscheduler:",
      error
    );
    throw error;
  }
}

async function scheduleShifts(dateRange, zone, shift) {
  try {
    // console.log("Original dateRange : ", dateRange);

    // Adjust the startDate and endDate by adding one day
    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);

    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    // console.log("Adjusted startDate:", adjustedStartDate.toISOString());
    // console.log("Adjusted endDate:", adjustedEndDate.toISOString());
    // console.log("zone : ", zone);
    // console.log("shift : ", shift);

    const pool = await getConnection();

    // Handle 'all' case for shifts
    let shiftIdsQuery;
    if (shift.length === 1 && shift[0] === "all") {
      shiftIdsQuery = `SELECT shiftid FROM EV_BPA_DEV_MAINLINE.dbo.sop_shifts`;
    } else {
      shiftIdsQuery = `
        SELECT shiftid 
        FROM EV_BPA_DEV_MAINLINE.dbo.sop_shifts
        WHERE shiftname IN (${shift.map((s) => `'${s}'`).join(", ")})
      `;
    }
    const shiftIdsResult = await pool.request().query(shiftIdsQuery);
    const shiftIds = shiftIdsResult.recordset.map((row) => row.shiftid);

    // Handle 'all' case for zones
    let assetsQuery;
    if (zone.length === 1 && zone[0] === "all") {
      assetsQuery = `
        SELECT assetid, machineshortname, [zone], isbottleneck 
        FROM EV_BPA_DEV_MAINLINE.dbo.sop_assets
        WHERE isbottleneck = 1
      `;
    } else {
      assetsQuery = `
        SELECT assetid, machineshortname, [zone], isbottleneck 
        FROM EV_BPA_DEV_MAINLINE.dbo.sop_assets
        WHERE [zone] IN (${zone.join(", ")}) AND isbottleneck = 1
      `;
    }
    const assetsResult = await pool.request().query(assetsQuery);

    // Insert rows into the sop_shiftscheduler table
    let currentDate = new Date(adjustedStartDate);

    while (currentDate <= adjustedEndDate) {
      const formattedDate = currentDate.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'

      for (const asset of assetsResult.recordset) {
        for (const shiftId of shiftIds) {
          await pool
            .request()
            .input("scheduledate", formattedDate)
            .input("shiftid", shiftId)
            .input("isenabled", 1)
            .input("isbottleneck", 1)
            .input("zones", asset.zone.toString())
            .input("assetid", asset.assetid)
            .input("machineshortname", asset.machineshortname).query(`
              INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_shiftscheduler
              (scheduledate, shiftid, isenabled, isbottleneck, zones, assetid, machineshortname)
              VALUES (@scheduledate, @shiftid, @isenabled, @isbottleneck, @zones, @assetid, @machineshortname)
            `);
        }
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // console.log("Shifts scheduled successfully");
  } catch (error) {
    console.error(
      "Error scheduling shifts to table sop_shiftscheduler:",
      error
    );
    throw error;
  }
}

async function getExistingSchedules(dateRange, zones, shifts) {
  try {
    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    // console.log("Adjusted startDate:", adjustedStartDate.toISOString());
    // console.log("Adjusted endDate:", adjustedEndDate.toISOString());
    // console.log("Zones:", zones);
    // console.log("Shifts:", shifts);

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("startDate", sql.Date, adjustedStartDate)
      .input("endDate", sql.Date, adjustedEndDate)
      .input("zones", sql.NVarChar(sql.MAX), JSON.stringify(zones))
      .input("shifts", sql.NVarChar(sql.MAX), JSON.stringify(shifts))
      .execute("dbo.CheckDatesExistDetailedv2");

    const rawResult = result.recordset[0];

    return {
      DateExists: rawResult.DateExists,
      ExistingZones: JSON.parse(rawResult.ExistingZones || "[]"),
      ExistingShifts: JSON.parse(rawResult.ExistingShifts || "[]"),
      ExistingDates: JSON.parse(rawResult.ExistingDates || "[]").map(
        (item) => item.date
      ),
    };
  } catch (error) {
    console.error(
      "Error getting existing schedules from table sop_shiftscheduler:",
      error
    );
    throw error;
  }
}

async function deleteShiftSchedule(scheduleid) {
  try {
    // console.log("scheduleid :: ", scheduleid);
    const pool = await getConnection();
    await pool
      .request()
      .input("scheduleid", scheduleid)
      .query(
        "DELETE FROM EV_BPA_DEV_MAINLINE.dbo.sop_shiftscheduler WHERE scheduleid = @scheduleid"
      );
  } catch (error) {
    console.error(
      "Error deleting shift schedule from sop_shiftscheduler:",
      error
    );
    throw error;
  }
}

async function createShiftHighlights(reason) {
  try {
    // console.log("reason :: ", reason);
    const pool = await getConnection();
    const shiftResult = await pool.request().query(`
      SELECT dbo.sop_getcurrentshiftid() AS shiftid
    `);
    const shiftid = shiftResult.recordset[0].shiftid;

    await pool
      .request()
      .input("shift_highlights_details", String(reason))
      .input("shift_id", shiftid)
      .query(
        "INSERT into dbo.shift_highlights (highlights_date,shift_highlights_details, shift_id) VALUES (SYSDATETIMEOFFSET(),@shift_highlights_details, @shift_id)"
      );
  } catch (error) {
    console.error(
      "Error inserting shift highlights to table shift_highlights:",
      error
    );
    throw error;
  }
}

async function getShiftHighlights() {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query(
        "SELECT TOP 1 * FROM shift_highlights ORDER BY shift_highlights_id DESC"
      );
    return result.recordset;
  } catch (error) {
    console.error(
      "Error getting shift highlights from shift_highlights:",
      error
    );
    throw error;
  }
}

module.exports = {
  getShifts,
  getShiftBreaks,
  updateShiftBreak,
  deleteShiftBreak,
  getShiftSchedules,
  scheduleShifts,
  getExistingSchedules,
  deleteShiftSchedule,
  createShiftHighlights,
  getShiftHighlights,
};
