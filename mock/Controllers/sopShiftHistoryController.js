const sopShiftHistoryService = require("../Services/sopShiftHistoryService");

async function createShiftSchedulerHistory(req, res) {
  const { adid, dateRange, zones, shifts } = req.body;
  // console.log("dateRange : ", dateRange);
  // console.log("zone : ", zone);
  // console.log("shift : ", shift);

  try {
    await sopShiftHistoryService.createShiftSchedulerHistory(
      adid,
      dateRange,
      zones,
      shifts
    );
    res
      .status(200)
      .json({
        message:
          "shift history updated successfully by createShiftSchedulerHistory()",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while updating the shift history by createShiftSchedulerHistory()",
      });
  }
}

async function createShiftSchedulerHistoryOnDelete(req, res) {
  const { adid, scheduledate, shiftid, zones } = req.body;

  try {
    await sopShiftHistoryService.createShiftSchedulerHistoryOnDelete(
      adid,
      scheduledate,
      shiftid,
      zones
    );
    res
      .status(200)
      .json({
        message:
          "shift history updated successfully by createShiftSchedulerHistoryOnDelete()",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while updating the shift history by createShiftSchedulerHistoryOnDelete()",
      });
  }
}

async function getShiftHistory(req, res) {
  const { dateRange, zones, shifts } = req.body;
  try {
    const rowData = await sopShiftHistoryService.getShiftHistory(
      dateRange,
      zones,
      shifts
    );
    // console.log("Row data:", rowData);
    res.json({ rowData });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching shift history from getShiftHistory()",
      });
  }
}

async function createShiftBreakHistory(req, res) {
  const { adid, shiftid, breakstart, breakend, breakdescription, actiontype } =
    req.body;
  //   console.table({ adid, shiftid, breakstart, breakend, breakdescription });

  try {
    await sopShiftHistoryService.createShiftBreakHistory(
      adid,
      shiftid,
      breakstart,
      breakend,
      breakdescription,
      actiontype
    );
    res
      .status(200)
      .json({
        message:
          "shiftBreak history updated successfully  by createShiftBreakHistory()",
      });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while updating the shiftBreak history by createShiftBreakHistory()",
    });
  }
}

async function getShiftBreakHistory(req, res) {
  const { dateRange, shifts } = req.body;
  try {
    const rowData = await sopShiftHistoryService.getShiftBreakHistory(
      dateRange,
      shifts
    );
    // console.log("Row data:", rowData);
    res.json({ rowData });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching shift break history from getShiftBreakHistory()",
      });
  }
}

module.exports = {
  createShiftSchedulerHistory,
  createShiftSchedulerHistoryOnDelete,
  getShiftHistory,
  createShiftBreakHistory,
  getShiftBreakHistory,
};
