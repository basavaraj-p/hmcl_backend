// const { getConnection } = require("../Database/dbConfig");
// const { getConnection2 } = require("../Database/dbConfig2");
// const sql = require("mssql");
const fs = require("fs").promises; // Use the promise-based version of fs
const jsonFunctions = require("../Json/functions");
const { v4: uuidv4 } = require('uuid');


async function fetchDefects() {
  try {
    const result = await jsonFunctions.getJSON(
      "mock/Json/sopRejectionRework.json"
    );
    return result.sop_defect_lookup;
  } catch (error) {
    console.error(
      "Error fetching rejections from table sop_defect_lookup:",
      error
    );
    throw error;
  }
}

async function createRejectionRework(
  adid,
  barcodes,
  machine,
  defectType,
  defectCodes,
  reason
) {
  // console.log("Input parameters:", {
  //   adid,
  //   barcodes,
  //   machine,
  //   defectType,
  //   defectCodes,
  //   reason,
  // });

  try {
    const result = await jsonFunctions.getJSON(
      "mock/Json/sopRejectionRework.json"
    );
    const result2 = await jsonFunctions.getJSON("mock/Json/sopAssets.json");

    const randomAssets = jsonFunctions.getMachineDetails(machine, result2);

    const shiftids = [1, 2, 3];

    for (const barcode of barcodes) {
      for (const defectCode of defectCodes) {
        result.sop_rejectionrework.push({
          uniqueid: uuidv4(),
          datetime: jsonFunctions.getFormattedDateTime(),
          assetid: randomAssets.assetid,
          shiftid: shiftids[jsonFunctions.getRandomIndex(shiftids)],
          barcode: barcode,
          defectcode: defectCode,
          reason: reason,
          user: adid,
          sapresponse: null,
          defect_type: defectType,
          zone: randomAssets.zone,
        });
      }
    }

    await fs.writeFile(
      "mock/Json/sopRejectionRework.json",
      JSON.stringify(result, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("error : ", error);
  }
}

async function fetchRejectionReworks() {
  try {
    const result = await jsonFunctions.getJSON(
      "mock/Json/sopRejectionRework.json"
    );
    return result.sop_rejectionrework;
  } catch (error) {
    console.error(
      "Error fetching rejections from table sop_rejectionrework:",
      error
    );
    throw error;
  }
}

async function fetchAssets() {
  try {
    const result = await jsonFunctions.getJSON("mock/Json/sopAssets.json");
    return result.sop_assets;
  } catch (error) {
    console.error("Error fetching assets from table sop_assets:", error);
    throw error;
  }
}

module.exports = {
  fetchDefects,
  createRejectionRework,
  fetchRejectionReworks,
  fetchAssets,
  // checkBarcodes,
};
