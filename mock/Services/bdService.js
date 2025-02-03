const { getConnection } = require("../Database/dbConfig");

async function getBdUnit() {
  try {
    // console.log("Unit Service")
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM EV_BPA_DEV_MAINLINE.dbo.bd_unit_lookup");
    return result.recordsets[0];
  } catch (error) {
    console.error("Error getting bd Unit :", error);
    throw error;
  }
}

async function getBdPhenomena() {
  try {
    // console.log("Phenomena Service")
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM EV_BPA_DEV_MAINLINE.dbo.bd_phenomena_lookup");
    return result.recordset;
  } catch (error) {
    console.error("Error getting bd Phenomena :", error);
    throw error;
  }
}

async function getBdCause() {
  try {
    // console.log("Cause Service")
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM EV_BPA_DEV_MAINLINE.dbo.bd_cause_lookup");
    return result.recordset;
  } catch (error) {
    console.error("Error getting bd Cause :", error);
    throw error;
  }
}

async function postEventAnalysis(breakdownReasonForm) {
  // console.log("post event analysis Service", breakdownReasonForm);
  const {
    stopid,
    unitCodeValue,
    phenomenonCodeValue,
    causeCodeValue,
    resolutionDetails,
  } = breakdownReasonForm;

  try {
    const pool = await getConnection();
    const result =
      await // .query(`INSERT INTO EV_BPA_DEV_MAINLINE.dbo.bd_event_analysis_copy
      //             (stop_id, unit_id, cause_id, phenomenon_id, bd_resolution)
      //         VALUES
      //             (@stopid, @unitCodeValue, @causeCodeValue, @phenomenonCodeValue, @resolutionDetails);
      //   `);
      pool
        .request()
        .input("stopid", stopid)
        .input("unitCodeValue", Number(unitCodeValue))
        .input("phenomenonCodeValue", Number(phenomenonCodeValue))
        .input("causeCodeValue", Number(causeCodeValue))
        .input("resolutionDetails", resolutionDetails)
        .query(`MERGE INTO EV_BPA_DEV_MAINLINE.dbo.bd_event_analysis_copy AS target
              USING (SELECT @stopid AS stop_id, @unitCodeValue AS unit_id, @causeCodeValue AS cause_id, 
                            @phenomenonCodeValue AS phenomenon_id, @resolutionDetails AS bd_resolution) AS source
              ON target.stop_id = source.stop_id  -- Adjust the condition based on your primary key
              WHEN MATCHED THEN
                  UPDATE SET 
                      unit_id = source.unit_id,
                      cause_id = source.cause_id,
                      phenomenon_id = source.phenomenon_id,
                      bd_resolution = source.bd_resolution
              WHEN NOT MATCHED THEN
                  INSERT (stop_id, unit_id, cause_id, phenomenon_id, bd_resolution)
                VALUES (source.stop_id, source.unit_id, source.cause_id, source.phenomenon_id, source.bd_resolution);
        `);

    // console.log("post Event analysis ", result);
    return result;
    // return result.recordset ;
  } catch (error) {
    console.error("Error getting bd Event analysis :", error);
    throw error;
  }

  return 0;
}

module.exports = { getBdUnit, getBdPhenomena, getBdCause, postEventAnalysis };
