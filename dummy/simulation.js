const sql = require("mssql");
const db = require("./dbConfig");

function getRandomAssetId() {
  const assetIds = [
    10001, 20001, 31001, 31002, 31003, 31004, 31005, 31006, 31007, 31008, 31009,
    31010, 31011, 31012, 31013, 31014, 31015, 31016, 31017, 32001, 32002, 32003,
    32004, 32005, 32006, 32007, 32008, 32009, 32010, 32011, 32012, 32013, 32014,
    32015, 32016, 32017, 40001, 40002, 40003, 40004, 40005,
  ];

  const randomIndex = Math.floor(Math.random() * assetIds.length);
  return assetIds[randomIndex];
}

function getRandomDuration() {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const seconds = Math.floor(Math.random() * 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

async function insertDummyData(rowCount) {
  try {
    await db;

    for (let i = 0; i < rowCount; i++) {
      const dummyData = {
        stoptime: new Date(),
        lossid: "00" + (i % 10),
        assetid: getRandomAssetId(),
        duration: getRandomDuration(), // Valid duration format
        shiftid: (i % 3) + 1,
        reason: `Dummy reason for stoppage ${i}`,
        lossidreasonupdatedtime: new Date(),
        starttime: new Date(new Date().getTime() - (i + 1) * 1800000),
        endtime: new Date(),
      };

      const query = `
                INSERT INTO sop_stopagereason 
                (stoptime, lossid, assetid, duration, shiftid, reason, lossidreasonupdatedtime, starttime, endtime)
                VALUES 
                (@stoptime, @lossid, @assetid, @duration, @shiftid, @reason, @lossidreasonupdatedtime, @starttime, @endtime);
            `;

      const request = new sql.Request();
      request.input("stoptime", sql.DateTimeOffset, dummyData.stoptime);
      request.input("lossid", sql.VarChar(3), dummyData.lossid);
      request.input("assetid", sql.Int, dummyData.assetid);
      request.input("duration", sql.Time(6), dummyData.duration);
      request.input("shiftid", sql.Int, dummyData.shiftid);
      request.input("reason", sql.VarChar(sql.MAX), dummyData.reason);
      request.input(
        "lossidreasonupdatedtime",
        sql.DateTimeOffset,
        dummyData.lossidreasonupdatedtime
      );
      request.input("starttime", sql.DateTimeOffset, dummyData.starttime);
      request.input("endtime", sql.DateTimeOffset, dummyData.endtime);

      const result = await request.query(query);

      console.log(`Row ${i + 1} inserted successfully:`, result);
    }
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    sql.close();
  }
}

const numberOfRowsToInsert = 10;
insertDummyData(numberOfRowsToInsert);
