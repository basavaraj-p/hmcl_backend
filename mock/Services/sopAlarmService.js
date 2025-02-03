// const { getConnection } = require("../Database/dbConfig");
const jsonFunctions = require("../Json/functions");

async function getRowCount() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopAlarms.json");
    return result.total_alarms;
  } catch (error) {
    console.error("Error getting row count from table sop_alarm:", error);
    throw error;
  }
}

async function getTodayRowCount() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopAlarms.json");
    // console.log(result);
    return result.current_alarms;
  } catch (error) {
    console.error(
      "Error getting today's row count from table sop_alarm:",
      error
    );
    throw error;
  }
}

module.exports = { getRowCount, getTodayRowCount };
