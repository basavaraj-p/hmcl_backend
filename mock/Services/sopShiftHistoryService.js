const { getConnection } = require("../Database/dbConfig");
const sql = require("mssql");
const fs = require("fs").promises; // Use the promise-based version of fs
const jsonFunctions = require("../Json/functions");
const { v4: uuidv4 } = require("uuid");

async function createShiftSchedulerHistory(adid, dateRange, zones, shifts) {
  // let pool;
  try {
    // console.log("adid : ", adid);
    // console.log("dateRange : ", dateRange);
    // console.log("zones : ", zones);
    // console.log("shifts : ", shifts);

    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    // Load JSON data
    const [data, cycletime, shiftHistory] = await Promise.all([
      jsonFunctions.getJSON("mock/Json/sopShifts.json"),
      jsonFunctions.getJSON("mock/Json/sopCycletime.json"),
      jsonFunctions.getJSON("mock/Json/sopShiftHistory.json"),
    ]);
    if (!data || !cycletime) {
      console.error("No data found or failed to read JSON.");
      return;
    }

    // Filter assets
    let assets = [];
    if (zones.length === 1 && zones[0] === "all") {
      assets = cycletime.cycletimesB1;
    } else if (zones.length === 1) {
      assets = cycletime.cycletimesB1.filter(
        (value) => value.zone === zones[0]
      );
    } else if (zones.length > 1) {
      for (const zone of zones) {
        const filteredAsset = cycletime.cycletimesB1.find(
          (value) => value.zone === zone
        );
        if (filteredAsset) {
          assets.push(filteredAsset);
        }
      }
    }

    // Filter shifts
    let filteredShifts = [];
    if (shifts.length === 1 && shifts[0] === "all") {
      filteredShifts = data.sop_shifts;
    } else if (shifts.length === 1) {
      filteredShifts = data.sop_shifts.filter(
        (value) => value.shiftname === shifts[0]
      );
    } else if (shifts.length > 1) {
      for (const shift of shifts) {
        const filteredShift = data.sop_shifts.find(
          (value) => value.shiftname === shift
        );
        if (filteredShift) {
          filteredShifts.push(filteredShift);
        }
      }
    }

    // Debug logs
    // console.log("Filtered assets:", assets);
    // console.log("Filtered shifts:", shifts);

    if (assets.length === 0 || shifts.length === 0) {
      console.error(
        "No assets or shifts found. Check your filtering logic or JSON data."
      );
      return;
    }

    // Function to execute insert for each combination
    const insertRow = async (zone, shift) => {
      shiftHistory.sop_shifthistory.unshift({
        useradid: "88880000",
        fromdate: new Date(adjustedStartDate)
          .toISOString()
          .replace("T", " ")
          .replace("Z", " +0000"),
        todate: new Date(adjustedEndDate)
          .toISOString()
          .replace("T", " ")
          .replace("Z", " +0000"),
        shiftid: shift.shiftid,
        zone: String(zone.zone),
        actiontype: "Create",
        description: "88880000 created a shift",
        updatetime: jsonFunctions.getFormattedDateTime(),
        isenabled: 1,
      });
    };

    // Insert rows for each combination of zone and shift
    for (const zone of assets) {
      for (const shift of filteredShifts) {
        await insertRow(zone, shift);
      }
    }

    await fs.writeFile(
      "mock/Json/sopShiftHistory.json",
      JSON.stringify(shiftHistory, null, 2),
      "utf-8"
    );

    // console.log("Shift history created successfully in table sop_shifthistory");
  } catch (error) {
    console.error(
      "Error creating shift history in table sop_shifthistory:",
      error
    );
    throw error;
  }
}

async function createShiftSchedulerHistoryOnDelete(
  adid,
  scheduledate,
  shiftid,
  zones
) {
  try {
    const data = await jsonFunctions.getJSON("mock/Json/sopShiftHistory.json");

    // console.log("adid : ", adid);
    // console.log("scheduledate : ", scheduledate);
    // console.log("shiftid : ", shiftid);
    // console.log("zone : ", zones);

    data.sop_shifthistory.unshift({
      useradid: "88880000",
      fromdate: new Date(scheduledate)
        .toISOString()
        .replace("T", " ")
        .replace("Z", " +0000"),
      todate: new Date(scheduledate)
        .toISOString()
        .replace("T", " ")
        .replace("Z", " +0000"),
      shiftid: shiftid,
      zone: zones,
      actiontype: "Delete",
      description: "88880000 deleted a shift",
      updatetime: jsonFunctions.getFormattedDateTime(),
      isenabled: 1,
    });

    await fs.writeFile(
      "mock/Json/sopShiftHistory.json",
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error(
      "Error creating shift history on delete in table sop_shifthistory:",
      error
    );
    throw error;
  }
}

async function getShiftHistory(dateRange, zones, shifts) {
  try {
    const shiftMapping = {
      "Shift - A": 1,
      "Shift - B": 2,
      "Shift - C": 3,
    };

    const getShiftID = (value) => shiftMapping[value] || "Unknown";

    // Adjust the startDate and endDate in local time
    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate());
    adjustedStartDate.setHours(0, 0, 0, 0); // Set to 00:00:00 in local time

    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate());
    adjustedEndDate.setHours(23, 59, 59, 999); // Set to 23:59:59 in local time

    // Output for debugging - this will show the dates in local time
    // console.log("data:", {
    //   adjustedStartDate: adjustedStartDate, // Output as local time
    //   adjustedEndDate: adjustedEndDate, // Output as local time
    //   zones,
    //   shifts,
    // });

    const data = await jsonFunctions.getJSON("mock/Json/sopShiftHistory.json");
    let result = [];

    const convertShifts = () => shifts.map(getShiftID);
    const convertShifts2 = convertShifts();

    if (shifts[0] === "all" && zones[0] === "all") {
      result = data.sop_shifthistory.filter(
        (value) =>
          value.updatetime >= adjustedStartDate.toLocaleDateString() &&
          value.updatetime <= adjustedEndDate.toLocaleDateString()
      );
    } else if (shifts[0] !== "all" && zones[0] === "all") {
      for (const shiftid of convertShifts2) {
        result.push(
          ...data.sop_shifthistory.filter(
            (value) =>
              value.updatetime >= adjustedStartDate.toLocaleDateString() &&
              value.updatetime <= adjustedEndDate.toLocaleDateString() &&
              value.shiftid === shiftid
          )
        );
      }
    } else if (shifts[0] === "all" && zones[0] !== "all") {
      for (const zone of zones) {
        result.push(
          ...data.sop_shifthistory.filter(
            (value) =>
              value.updatetime >= adjustedStartDate.toLocaleDateString() &&
              value.updatetime <= adjustedEndDate.toLocaleDateString() &&
              value.zone === String(zone)
          )
        );
      }
    } else if (shifts[0] !== "all" && zones[0] !== "all") {
      for (const zone of zones) {
        for (const shiftid of convertShifts2) {
          result.push(
            ...data.sop_shifthistory.filter(
              (value) =>
                value.updatetime >= adjustedStartDate.toLocaleDateString() &&
                value.updatetime <= adjustedEndDate.toLocaleDateString() &&
                value.shiftid === shiftid &&
                value.zone === String(zone)
            )
          );
        }
      }
    } else {
      result = [];
    }
    // console.log("result : ", result);
    return result;
  } catch (error) {
    console.error(
      "Error getting shift history from table sop_shifthistory:",
      error
    );
    throw error;
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
  try {
    console.table({
      adid,
      shiftid,
      breakstart,
      breakend,
      breakdescription,
      actiontype,
    });
    const data = await jsonFunctions.getJSON("mock/Json/sopShiftHistory.json");
    data.sop_shiftbreakhistory.unshift({
      time: jsonFunctions.getFormattedDateTime(),
      shiftid: shiftid,
      useradid: "88880000",
      breakstart: breakstart,
      breakend: breakend,
      breakdescription: breakdescription,
      actiontype: actiontype,
    });
    await fs.writeFile(
      "mock/Json/sopShiftHistory.json",
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error(
      "Error updating shiftBreaks history in sop_shiftbreakhistory:",
      error
    );
    throw error;
  }
}

async function getShiftBreakHistory(dateRange, shifts) {
  try {
    const shiftMapping = {
      "Shift - A": 1,
      "Shift - B": 2,
      "Shift - C": 3,
    };

    const getShiftID = (value) => shiftMapping[value] || "Unknown";

    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    // console.log("data : ", { adjustedStartDate, adjustedEndDate, shifts });

    const data = await jsonFunctions.getJSON("mock/Json/sopShiftHistory.json");
    let result = [];

    const convertShifts = () => shifts.map(getShiftID);
    const convertShifts2 = convertShifts();

    // Convert the time strings in the JSON data to Date objects
    const formattedData = data.sop_shiftbreakhistory.map(entry => ({
      ...entry,
      time: new Date(entry.time)
    }));

    if (shifts[0] === "all") {
      result = formattedData.filter(
        (value) =>
          value.time >= adjustedStartDate &&
          value.time <= adjustedEndDate
      );
    } else if (shifts[0] !== "all") {
      for (const shiftid of convertShifts2) {
        result.push(
          ...formattedData.filter(
            (value) =>
              value.time >= adjustedStartDate &&
              value.time <= adjustedEndDate &&
              value.shiftid === shiftid
          )
        );
      }
    } else {
      result = [];
    }

    // console.log("result : ", result);
    return result;
  } catch (error) {
    console.error(
      "Error getting shift break history from table sop_shiftbreakhistory:",
      error
    );
    throw error;
  }
}

module.exports = {
  createShiftSchedulerHistory,
  createShiftSchedulerHistoryOnDelete,
  getShiftHistory,
  createShiftBreakHistory,
  getShiftBreakHistory,
};
