const { getConnection } = require("../Database/dbConfig");
const sql = require("mssql");

async function createShiftSchedulerHistory(adid, dateRange, zones, shifts) {
  let pool;
  try {
    // console.log("adid : ", adid);
    // console.log("dateRange : ", dateRange);
    // console.log("zones : ", zones);
    // console.log("shifts : ", shifts);

    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    pool = await getConnection();

    // Get all shift IDs and names
    const shiftResult = await pool
      .request()
      .query(
        "SELECT shiftid, shiftname FROM EV_BPA_DEV_MAINLINE.dbo.sop_shifts"
      );
    const shiftMap = new Map(
      shiftResult.recordset.map((row) => [row.shiftname, row.shiftid])
    );

    // Get all Zones
    const zoneResult = await pool
      .request()
      .query("select * from sop_assets WHERE isbottleneck = 1");
    const zoneMap = new Map(zoneResult.recordset.map((row) => [row.zone]));

    // Prepare the base query
    const baseQuery = `
      INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_shifthistory 
      (useradid, fromdate, todate, shiftid, zone, actiontype, description, updatetime, isenabled)
      VALUES 
      (@useradid, @fromdate, @todate, @shiftid, @zone, @actiontype, @description, SYSDATETIMEOFFSET(), @isenabled)
    `;

    // Function to execute insert for each combination
    const insertRow = async (zone, shift) => {
      const request = pool.request();
      request.input("useradid", adid);
      request.input("fromdate", adjustedStartDate);
      request.input("todate", adjustedEndDate);
      request.input("shiftid", shiftMap.get(shift));
      request.input("zone", zone);
      request.input("actiontype", "Create");
      request.input("description", `${adid} created a shift`);
      // We no longer need to pass updatetime as a parameter
      request.input("isenabled", 1);

      await request.query(baseQuery);
    };

    // Handle zones
    const zoneList = zones[0] === "all" ? Array.from(zoneMap.keys()) : zones;

    // Handle shifts
    const shiftList =
      shifts[0] === "all" ? Array.from(shiftMap.keys()) : shifts;

    // Insert rows for each combination of zone and shift
    for (const zone of zoneList) {
      for (const shift of shiftList) {
        await insertRow(zone, shift);
      }
    }

    // console.log("Shift history created successfully in table sop_shifthistory");
  } catch (error) {
    console.error(
      "Error creating shift history in table sop_shifthistory:",
      error
    );
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function createShiftSchedulerHistoryOnDelete(
  adid,
  scheduledate,
  shiftid,
  zones
) {
  let pool;

  try {
    // console.log("adid : ", adid);
    // console.log("scheduledate : ", scheduledate);
    // console.log("shiftid : ", shiftid);
    // console.log("zone : ", zones);

    pool = await getConnection();
    await pool
      .request()
      .input("useradid", adid)
      .input("fromdate", scheduledate)
      .input("todate", scheduledate)
      .input("shiftid", shiftid)
      .input("zone", zones)
      .input("actiontype", "Delete")
      .input("description", `${adid} deleted a shift`)
      // We no longer need to pass updatetime as a parameter
      .input("isenabled", 1)
      .query(
        `INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_shifthistory 
        (useradid, fromdate, todate, shiftid, zone, actiontype, description, updatetime, isenabled)
        VALUES 
        (@useradid, @fromdate, @todate, @shiftid, @zone, @actiontype, @description, SYSDATETIMEOFFSET(), @isenabled)
        `
      );
  } catch (error) {
    console.error(
      "Error creating shift history on delete in table sop_shifthistory:",
      error
    );
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function getShiftHistory(dateRange, zones, shifts) {
  let pool;
  try {
    // Adjust the startDate and endDate in local time
    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate());
    adjustedStartDate.setHours(0, 0, 0, 0); // Set to 00:00:00 in local time

    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate());
    adjustedEndDate.setHours(23, 59, 59, 999); // Set to 23:59:59 in local time

    // Output for debugging - this will show the dates in local time
    // console.log("dateRange:", {
    //   adjustedStartDate: adjustedStartDate.toLocaleString(), // Output as local time
    //   adjustedEndDate: adjustedEndDate.toLocaleString(), // Output as local time
    // });

    let query = `
      SELECT sh.*, s.shiftname
      FROM dbo.sop_shifthistory sh
      JOIN dbo.sop_shifts s ON sh.shiftid = s.shiftid
      WHERE sh.updatetime >= @startDate AND sh.updatetime <= @endDate
    `;

    // Get the DB connection
    pool = await getConnection();
    const request = pool.request();

    // Use Date objects directly for MSSQL, which will handle the conversion
    request.input("startDate", sql.DateTimeOffset, adjustedStartDate);
    request.input("endDate", sql.DateTimeOffset, adjustedEndDate);

    // Add zones to the query if provided
    if (zones.length > 0 && zones[0] !== "all") {
      const zoneParams = zones.map((zone, index) => `@zone${index}`).join(", ");
      query += ` AND sh.zone IN (${zoneParams})`;
      zones.forEach((zone, index) => {
        request.input(`zone${index}`, sql.VarChar, zone.toString());
      });
    }

    // Add shifts to the query if provided
    if (shifts.length > 0 && shifts[0] !== "all") {
      const shiftParams = shifts
        .map((shift, index) => `@shift${index}`)
        .join(", ");
      query += ` AND s.shiftname IN (${shiftParams})`;
      shifts.forEach((shift, index) => {
        request.input(`shift${index}`, sql.VarChar, shift);
      });
    }

    // Execute the query
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error(
      "Error getting shift history from table sop_shifthistory:",
      error
    );
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function createShiftBreakHistory(
  adid,
  shiftid,
  breakstart,
  breakend,
  breakdescription,
  actiontype
) {
  let pool;
  try {
    console.table({
      adid,
      shiftid,
      breakstart,
      breakend,
      breakdescription,
      actiontype,
    });
    pool = await getConnection();
    await pool
      .request()
      .input("shiftid", shiftid)
      .input("useradid", adid)
      .input("breakstart", breakstart)
      .input("breakend", breakend)
      .input("breakdescription", breakdescription)
      .input("actiontype", actiontype)
      .query(
        `INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_shiftbreakhistory (time,shiftid,useradid, breakstart, breakend, breakdescription,actiontype) 
        VALUES (SYSDATETIMEOFFSET(),@shiftid,@useradid, @breakstart, @breakend, @breakdescription, @actiontype)`
      );
  } catch (error) {
    console.error(
      "Error updating shiftBreaks history in sop_shiftbreakhistory:",
      error
    );
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

async function getShiftBreakHistory(dateRange, shifts) {
  let pool;
  try {
    // console.log("dateRange:", dateRange);
    // console.log("shifts:", shifts);

    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    let query = `
      SELECT sbh.*, s.shiftname
      FROM dbo.sop_shiftbreakhistory sbh
      JOIN dbo.sop_shifts s ON sbh.shiftid = s.shiftid
      WHERE sbh.[time] >= @startDate AND sbh.[time] <= @endDate
    `;

    pool = await getConnection();
    const request = pool.request();

    request.input("startDate", sql.DateTimeOffset, adjustedStartDate);
    request.input("endDate", sql.DateTimeOffset, adjustedEndDate);

    if (shifts.length > 0 && shifts[0] !== "all") {
      const shiftParams = shifts
        .map((shift, index) => `@shift${index}`)
        .join(", ");
      query += ` AND s.shiftname IN (${shiftParams})`;
      shifts.forEach((shift, index) => {
        request.input(`shift${index}`, sql.VarChar, shift);
      });
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error(
      "Error getting shift break history from table sop_shiftbreakhistory:",
      error
    );
    throw error;
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

module.exports = {
  createShiftSchedulerHistory,
  createShiftSchedulerHistoryOnDelete,
  getShiftHistory,
  createShiftBreakHistory,
  getShiftBreakHistory,
};
