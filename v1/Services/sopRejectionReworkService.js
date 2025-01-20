const { getConnection } = require("../Database/dbConfig");
const { getConnection2 } = require("../Database/dbConfig2");
const sql = require("mssql");

async function fetchDefects() {
  let pool;
  try {
    pool = await getConnection();
    const result = await pool
      .request()
      .query(`select * from EV_BPA_DEV_MAINLINE.dbo.sop_defect_lookup;`);
    return result.recordset;
  } catch (error) {
    console.error(
      "Error fetching rejections from table sop_defect_lookup:",
      error
    );
    throw error;
  } finally {
    if (pool) {
      await pool.close();
      // console.log("EV_BPA_DEV_MAINLINE Connection closed");
    }
  }
}

// Function to get AssetID from EV_BPA_PROD_EOL
async function getAssetIdFromProdEOL(barcode, machine) {
  let pool2;
  try {
    pool2 = await getConnection2();
    // console.log("Test Function EV_BPA_PROD_EOL Connection:", {
    //   server: pool2.config.server,
    //   database: pool2.config.database,
    //   user: pool2.config.user,
    // });
    // console.log("EV_BPA_PROD_EOL Connection established");

    const machineInfo = machineLookup.find((m) => m.machine === machine);
    if (!machineInfo || !machineInfo.function) {
      // console.log(`No stored procedure found for machine: ${machine}`);
      return machineInfo ? machineInfo.defaultAssetId : null;
    }

    // console.log(`Executing stored procedure: ${machineInfo.function}`);
    const result =
      machineInfo.machine === "EOL" || machineInfo.machine === "LaserMarking"
        ? await pool2
            .request()
            .input("barcode", sql.NVarChar(50), barcode)
            .query(`select * from ${machineInfo.function}(@barcode);`)
        : await pool2
            .request()
            .input("barcode", sql.NVarChar(50), barcode)
            .execute(machineInfo.function);

    // console.log("Stored procedure result:", result);

    if (
      result.recordset &&
      result.recordset[0] &&
      result.recordset[0].AssetID
    ) {
      return result.recordset[0];
    } else {
      console.warn(
        `AssetID not found for barcode ${barcode} using function ${machineInfo.function}`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `Error getting AssetID for barcode ${barcode} from prod eol:`,
      error
    );
    throw error;
  } finally {
    if (pool2) {
      await pool2.close();
      // console.log("EV_BPA_PROD_EOL Connection closed");
    }
  }
}

// Function to insert rejection data into EV_BPA_DEV_MAINLINE
async function insertRejectionData(
  assetid,
  barcode,
  defectCodes,
  reason,
  adid,
  defectType,
  zone
) {
  let pool;
  try {
    pool = await getConnection();
    // console.log("Test Function EV_BPA_DEV_MAINLINE Connection:", {
    //   server: pool.config.server,
    //   database: pool.config.database,
    //   user: pool.config.user,
    // });
    // console.log("EV_BPA_DEV_MAINLINE Connection established");

    // Get the current shiftid
    const shiftResult = await pool.request().query(`
      SELECT dbo.sop_getcurrentshiftid() AS shiftid
    `);
    const shiftid = shiftResult.recordset[0].shiftid;

    const results = [];

    for (const defectCode of defectCodes) {
      try {
        const insertQuery = `
          INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_rejectionrework 
          ([datetime], assetid, shiftid, barcode, defectcode, reason, [user], defect_type, zone)
          VALUES 
          (SYSDATETIMEOFFSET(), @assetid, @shiftid, @barcode, @defectcode, @reason, @user, @defectType, @zone)
        `;

        await pool
          .request()
          .input("assetid", sql.Int, assetid)
          .input("shiftid", sql.Int, shiftid)
          .input("barcode", sql.VarChar(50), barcode)
          .input("defectcode", sql.VarChar(50), defectCode)
          .input("reason", sql.NVarChar(255), reason)
          .input("user", sql.NVarChar(100), adid)
          .input("defectType", sql.VarChar(50), defectType)
          .input("zone", sql.VarChar(50), String(parseFloat(zone).toFixed(1)))
          .query(insertQuery);

        results.push({ barcode, defectCode, status: "success" });
      } catch (error) {
        console.error(
          `Error inserting data for barcode ${barcode} and defectCode ${defectCode}:`,
          error
        );
        results.push({
          barcode,
          defectCode,
          status: "failed",
          reason: `Insert error: ${error.message}`,
        });
      }
    }

    return results;
  } catch (error) {
    console.error(
      "Error in inserting Rejection Data into table sop_rejectionrework:",
      error
    );
    throw error;
  } finally {
    if (pool) {
      await pool.close();
      // console.log("EV_BPA_DEV_MAINLINE Connection closed");
    }
  }
}

// Main function to create rejection rework
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

  const results = [];

  for (const barcode of barcodes) {
    try {
      // Get AssetID from EV_BPA_PROD_EOL
      const result = await getAssetIdFromProdEOL(barcode, machine);

      if (!result.AssetID) {
        results.push({
          barcode,
          status: "failed",
          reason: "AssetID not found",
        });
        continue;
      }

      // Insert rejection data into EV_BPA_DEV_MAINLINE
      const insertResults = await insertRejectionData(
        result.AssetID,
        barcode,
        defectCodes,
        reason,
        adid,
        defectType,
        result.Zone || result.sop_zone
      );
      results.push(...insertResults);
    } catch (error) {
      console.error(
        `Error processing barcode ${barcode} by function createRejectionRework():`,
        error
      );
      results.push({
        barcode,
        status: "failed",
        reason: `Error: ${error.message}`,
      });
    }
  }

  return { message: "Operation completed", results };
}

const machineLookup = [
  {
    machine: "Welding integrity",
    function: "dbo.sop_getweldintegrityassetidandzonebybarcode",
  },
  {
    machine: "Welding Station",
    function: "dbo.sop_getweldingstationassetidzonebybarcode",
  },
  {
    machine: "Leak Testing",
    function: "dbo.sop_getleaktestingassetidandzonebybarcode",
  },
  {
    machine: "Z Fixation",
    function: "dbo.sop_getzfixationassetidandzonebybarcode",
  },
  {
    machine: "Insertion",
    function: "dbo.sop_getinsertionstationassetidandzonebybarcode",
  },
  {
    machine: "Foam",
    function: "dbo.sop_getfoamassetidandzonebybarcode",
  },
  {
    machine: "LaserMarking",
    function: "sop_getlasermarkingassetandzonebybarcode",
  },
  { machine: "EOL", function: "sop_geteolassetandzonebybarcode" },
];

async function fetchRejectionReworks() {
  let pool;
  try {
    pool = await getConnection();
    const result = await pool.request().query(`SELECT *
        FROM EV_BPA_DEV_MAINLINE.dbo.sop_rejectionrework
        WHERE [datetime] >= DATEADD(day, -10, GETDATE()) order by [datetime] desc;`);
    return result.recordset;
  } catch (error) {
    console.error(
      "Error fetching rejections from table sop_rejectionrework:",
      error
    );
    throw error;
  } finally {
    if (pool) {
      await pool.close();
      // console.log("EV_BPA_DEV_MAINLINE Connection closed");
    }
  }
}

async function fetchAssets() {
  let pool;
  try {
    pool = await getConnection();
    const result = await pool
      .request()
      .query(`select assetid,machinename,[zone] from sop_assets;`);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching assets from table sop_assets:", error);
    throw error;
  } finally {
    if (pool) {
      await pool.close();
      // console.log("EV_BPA_DEV_MAINLINE Connection closed");
    }
  }
}

async function checkBarcodes(barcodes, machine) {
  try {
    // const barcodes = ["RJ6318100ADA", "RJ6018100AC8"]; // Example barcode
    // const machine = "Welding integrity";
    // console.log("Starting main function with barcode:", {
    //   barcodes,
    //   machine,
    // });
    let results = [];
    for (const barcode of barcodes) {
      const result = await getAssetIdFromProdEOL(barcode, machine);
      // console.log("Result : ", result);
      results.push({
        barcode,
        assetId: result.AssetID,
      });
    }
    // console.log("Result : ", results);
    return results;
  } catch (error) {
    console.error(
      "An error occurred in function getAssetIdFromProdEOL():",
      error
    );
  }
}

module.exports = {
  fetchDefects,
  createRejectionRework,
  fetchRejectionReworks,
  fetchAssets,
  checkBarcodes,
};
