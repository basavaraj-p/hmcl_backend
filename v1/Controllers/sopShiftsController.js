const sopShiftsService = require("../Services/sopShiftsService");

async function getShifts(req, res) {
  try {
    const rowData = await sopShiftsService.getShifts();
    // console.log("Row data:", rowData);
    res.json({ rowData });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching data from getShifts()",
    });
  }
}

async function getShiftBreaks(req, res) {
  try {
    const rowData = await sopShiftsService.getShiftBreaks();
    // console.log("Row data:", rowData);
    res.json({ rowData });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching data from getShiftBreaks()",
    });
  }
}

async function updateShiftBreak(req, res) {
  const { shiftid, breakstart, breakend, breakdescription } = req.body;
  // console.table({ shiftid, breakstart, breakend, breakdescription });

  try {
    await sopShiftsService.updateShiftBreak(
      shiftid,
      breakstart,
      breakend,
      breakdescription
    );
    res.status(200).json({
      message: "shiftBreak updated successfully by updateShiftBreak()",
    });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while updating the shiftBreak by updateShiftBreak()",
    });
  }
}

async function deleteShiftBreak(req, res) {
  const { breakid } = req.body;

  // console.log("breakid :: ", breakid);

  try {
    await sopShiftsService.deleteShiftBreak(breakid);
    res.status(200).json({
      message: "shiftBreak deleted successfully by deleteShiftBreak()",
    });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while deleting the shiftBreak by deleteShiftBreak()",
    });
  }
}

async function getShiftSchedules(req, res) {
  try {
    const rowData = await sopShiftsService.getShiftSchedules();
    // console.log("Row data:", rowData);
    res.json({ rowData });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching the shift schedules from getShiftSchedules",
    });
  }
}

async function scheduleShifts(req, res) {
  const { dateRange, zone, shift } = req.body;
  // console.log("dateRange : ", dateRange);
  // console.log("zone : ", zone);
  // console.log("shift : ", shift);

  try {
    await sopShiftsService.scheduleShifts(dateRange, zone, shift);
    res
      .status(200)
      .json({ message: "shift scheduled successfully by scheduleShifts()" });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while scheduling the shift by scheduleShifts()",
    });
  }
}

async function getExistingSchedules(req, res) {
  const { dateRange, zones, shifts } = req.body;
  // console.log("dateRange : ", dateRange);
  // console.log("zone : ", zone);
  // console.log("shift : ", shift);

  try {
    const dateExists = await sopShiftsService.getExistingSchedules(
      dateRange,
      zones,
      shifts
    );
    res.status(200).json({ ...dateExists });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching the scheduled shifts from getExistingSchedules()",
    });
  }
}

async function deleteShiftSchedule(req, res) {
  const { scheduleid } = req.body;

  // console.log("scheduleid :: ", scheduleid);

  try {
    await sopShiftsService.deleteShiftSchedule(scheduleid);
    res.status(200).json({
      message: "shift schedule deleted successfully by deleteShiftSchedule()",
    });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while deleting the shift schedule by deleteShiftSchedule()",
    });
  }
}

async function createShiftHighlights(req, res) {
  const { reason } = req.body;

  // console.log("reason :: ", reason);

  try {
    await sopShiftsService.createShiftHighlights(reason);
    res.status(200).json({
      message:
        "shiftHighlights created successfully by createShiftHighlights()",
    });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while creating the shiftHighlights by createShiftHighlights()",
    });
  }
}

async function getShiftHighlights(req, res) {
  // const { reason } = req.body;

  // console.log("reason :: ", reason);

  try {
    const rowData = await sopShiftsService.getShiftHighlights();
    // res.json({ rowData });
    res.status(200).json({
      message: "shiftHighlights fetched successfully by getShiftHighlights()",
      rowData,
    });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching the shiftHighlights from getShiftHighlights()",
    });
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
