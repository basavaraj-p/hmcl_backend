const { getConnection } = require("../Database/dbConfig");
const jsonFunctions = require("../Json/functions");
const fs = require("fs").promises; // Use the promise-based version of fs

async function getCycletimes() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopCycletime.json");
    return result.cycletimesB1;
  } catch (error) {
    console.error("Error getting data from table sop_assets:", error);
    throw error;
  }
}

async function getCycletimes2() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopAssets.json");
    return result.sop_assets;
  } catch (error) {
    console.error(
      "Error getting data from table sop_assets from function getCycletimes2():",
      error
    );
    throw error;
  }
}

async function updateCycletime(machineshortname, cycletime) {
  try {
    // console.table({ machineshortname, cycletime });
    const data = await jsonFunctions.getJSON("mock/Json/sopCycletime.json");
    if (!data) {
      console.error("No data found or failed to read JSON.");
      return;
    }

    // console.log("Data before modification:", data.cycletimesB1);
    const cycletimeB1_by_msn = data.cycletimesB1.filter(
      (value) => value.machineshortname === machineshortname
    )[0];
    // console.log("cycletimeB1_by_msn : ",cycletimeB1_by_msn);
    cycletimeB1_by_msn.cycletime = cycletime;
    // Write the modified data back to the file
    const history_object = {
      time: jsonFunctions.getFormattedDateTime(),
      zone: String(cycletimeB1_by_msn.zone),
      value: cycletimeB1_by_msn.cycletime,
      machinename: cycletimeB1_by_msn.machinename,
    };

    data.cycletimesB1_history.push(history_object);
    await fs.writeFile(
      "mock/Json/sopCycletime.json",
      JSON.stringify(data, null, 2),
      "utf-8"
    );
    // console.log("Data successfully written to file.");
  } catch (error) {
    console.error("Error updating cycletime to table sop_assets:", error);
    throw error;
  }
}

async function getFilteredCycletimes(startDate, endDate) {
  try {
    const data = await jsonFunctions.getJSON("mock/Json/sopCycletime.json");
    if (!data) {
      console.error("No data found or failed to read JSON.");
      return;
    }

    const filteredData = data.cycletimesB1_history.filter(
      (value) => value.time >= startDate && value.time <= endDate
    );

    return filteredData;
  } catch (error) {
    console.error(
      "Error getting filtered data from sql function GetFilteredCycletimes():",
      error
    );
    throw error;
  }
}

// const getFilteredCycletimes = getFilteredCycletimes(
//   "2022-01-01",
//   "2022-01-02",
//   ["31Insertion", "32Insertion"],
//   [3.1, 4.0]
// );

// console.log(getFilteredCycletimes);

module.exports = {
  getCycletimes,
  getCycletimes2,
  updateCycletime,
  getFilteredCycletimes,
};
