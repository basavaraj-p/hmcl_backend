const fs = require("fs").promises; // Use the promise-based version of fs
const jsonFunctions = require("../Json/functions");
const { v4: uuidv4 } = require("uuid");

async function getShifts() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopShifts.json");
    return result.sop_shifts;
  } catch (error) {
    console.error("Error getting rows from table sop_shifts:", error);
    throw error;
  }
}

async function getShiftBreaks() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopShifts.json");
    return result.sop_shiftbreaks;
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
    // console.log({ shiftid, breakstart, breakend, breakdescription });
    const result = await jsonFunctions.getJSON("mock/Json/sopShifts.json");
    result.sop_shiftbreaks.push({
      shiftid: shiftid,
      breakstart: breakstart,
      breakend: breakend,
      breakdescription: breakdescription,
      zones: null,
      breakid: uuidv4(),
    });
    await fs.writeFile(
      "mock/Json/sopShifts.json",
      JSON.stringify(result, null, 2),
      "utf-8"
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
    // console.log("breakid :: ", typeof breakid);
    const data = await jsonFunctions.getJSON("mock/Json/sopShifts.json");
    const result = data.sop_shiftbreaks.filter(
      (value) => value.breakid !== breakid
    );
    // console.log(data.sop_shiftbreaks);
    data.sop_shiftbreaks = result;
    await fs.writeFile(
      "mock/Json/sopShifts.json",
      JSON.stringify(data, null, 2),
      "utf-8"
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
    const result = await jsonFunctions.getJSON("mock/Json/sopShifts.json");
    return result.sop_shiftscheduler;
  } catch (error) {
    console.error(
      "Error getting shift Schedules from table sop_shiftscheduler:",
      error
    );
    throw error;
  }
}

async function scheduleShifts(dateRange, zones, shifts) {
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
    // console.log("data : ", {
    //   adjustedStartDate,
    //   adjustedEndDate,
    //   zones,
    //   shifts,
    // });

    // Load JSON data
    const [data, cycletime] = await Promise.all([
      jsonFunctions.getJSON("mock/Json/sopShifts.json"),
      jsonFunctions.getJSON("mock/Json/sopCycletime.json"),
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

    // Generate scheduled shifts
    // let sheduled_shifts = [];
    let currentDate = new Date(adjustedStartDate);
    const endDate = new Date(adjustedEndDate); // Convert adjustedEndDate to a Date object
    let loopCount = 0;

    while (currentDate <= endDate) {
      // Compare Date objects
      loopCount++;
      const formattedDate = currentDate.toISOString().split("T")[0];

      for (const asset of assets) {
        for (const shift of filteredShifts) {
          data.sop_shiftscheduler.unshift({
            scheduleid: uuidv4(),
            scheduledate: formattedDate,
            shiftid: shift.shiftid, // Use shift.shiftid or shift.shiftname
            isenabled: 1,
            performance: null,
            zones: asset.zone.toString(),
            assetid: asset.assetid,
            machineshortname: asset.machineshortname,
            isbottleneck: 1,
          });
        }
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // console.log("Loop ran", loopCount, "times.");
    // console.log("sheduled_shifts : ", sheduled_shifts);
    await fs.writeFile(
      "mock/Json/sopShifts.json",
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error(
      "Error scheduling shifts to table sop_shiftscheduler:",
      error
    );
    throw error;
  }
}

function checkDatesExistDetailedv2(data, startDate, endDate, zones, shifts) {
  // Parse zones and shifts
  const zonesTable = zones.includes("all") ? [] : zones.map(String); // Ensure zones are strings
  const shiftsTable = shifts.includes("all") ? [] : shifts.map(Number); // Ensure shifts are numbers

  const allZones = zones.includes("all");
  const allShifts = shifts.includes("all");

  // Filter data based on date range
  const filteredData = data.sop_shiftscheduler.filter((entry) => {
    const entryDate = new Date(entry.scheduledate);
    return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
  });

  // Process filtered data
  const scheduleData = filteredData.map((entry) => {
    const zoneMatch = allZones || zonesTable.includes(entry.zones); // Compare as strings
    const shiftMatch = allShifts || shiftsTable.includes(entry.shiftid); // Compare as numbers
    return {
      scheduledate: entry.scheduledate,
      zones: entry.zones,
      shiftname: entry.shiftid.toString(),
      ScheduleExists: zoneMatch && shiftMatch ? 1 : 0,
    };
  });

  // Determine if any schedule exists
  const dateExists = scheduleData.some((entry) => entry.ScheduleExists === 1);

  // Extract existing zones, shifts, and dates
  const existingZones = [
    ...new Set(
      scheduleData
        .filter((entry) => entry.ScheduleExists === 1)
        .map((entry) => entry.zones)
    ),
  ];
  const existingShifts = [
    ...new Set(
      scheduleData
        .filter((entry) => entry.ScheduleExists === 1)
        .map((entry) => entry.shiftname)
    ),
  ];
  const existingDates = [
    ...new Set(
      scheduleData
        .filter((entry) => entry.ScheduleExists === 1)
        .map((entry) => entry.scheduledate)
    ),
  ];

  return {
    DateExists: dateExists ? 1 : 0,
    ExistingZones: existingZones,
    ExistingShifts: existingShifts,
    ExistingDates: existingDates,
  };
}

async function getExistingSchedules(dateRange, zones, shifts) {
  try {
    const data = await jsonFunctions.getJSON("mock/Json/sopShifts.json");

    const adjustedStartDate = new Date(dateRange[0].startDate);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + 1);
    const adjustedEndDate = new Date(dateRange[0].endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);

    // console.log("parameters : ", {
    //   adjustedStartDate: adjustedStartDate.toISOString().split("T")[0],
    //   adjustedEndDate: adjustedEndDate.toISOString().split("T")[0],
    //   zones,
    //   shifts,
    // });

    const shiftMapping = {
      "Shift - A": 1,
      "Shift - B": 2,
      "Shift - C": 3,
    };

    const getShiftName = (value) => shiftMapping[value] || "Unknown";

    const convertShifts = () => shifts.map(getShiftName);

    const result = checkDatesExistDetailedv2(
      data,
      adjustedStartDate.toISOString().split("T")[0],
      adjustedEndDate.toISOString().split("T")[0],
      zones.map(String), // Ensure zones are treated as strings
      convertShifts() // Convert human-readable shifts to numeric values
    );

    // console.log({
    //   DateExists: result.DateExists,
    //   ExistingZones: result.ExistingZones,
    //   ExistingShifts: result.ExistingShifts,
    //   ExistingDates: result.ExistingDates,
    // });

    return {
      DateExists: result.DateExists,
      ExistingZones: result.ExistingZones,
      ExistingShifts: result.ExistingShifts,
      ExistingDates: result.ExistingDates,
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
    // console.log("scheduleid :: ", typeof scheduleid);
    const data = await jsonFunctions.getJSON("mock/Json/sopShifts.json");
    const result = data.sop_shiftscheduler.filter(
      (value) => value.scheduleid !== scheduleid
    );
    data.sop_shiftscheduler = result;
    await fs.writeFile(
      "mock/Json/sopShifts.json",
      JSON.stringify(data, null, 2),
      "utf-8"
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
    const data = await jsonFunctions.getJSON("mock/Json/sopShifts.json");
    if (!data) {
      console.error("No data found or failed to read JSON.");
      return;
    }

    // console.log("Data before modification:", data.shift_highlights);

    // Modify the shift_highlights property
    data.shift_highlights = reason;

    // Write the modified data back to the file
    await fs.writeFile(
      "mock/Json/sopShifts.json",
      JSON.stringify(data, null, 2),
      "utf-8"
    );
    // console.log("Data successfully written to file.");
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
    const result = await jsonFunctions.getJSON("mock/Json/sopShifts.json");
    return result.shift_highlights;
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
