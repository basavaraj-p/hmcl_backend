const sopAlarmService = require("../Services/sopAlarmService");

async function getRowCount(req, res) {
  try {
    const count = await sopAlarmService.getRowCount();
    res.json({ count });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the row count" });
  }
}

async function getLatestAlarms(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const alarms = await sopAlarmService.getLatestAlarms(limit);
    res.json(alarms);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the latest alarms" });
  }
}

async function getTodayRowCount(req, res) {
  try {
    const count = await sopAlarmService.getTodayRowCount();
    res.json({ count });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching today's row count" });
  }
}

module.exports = { getRowCount, getLatestAlarms, getTodayRowCount };