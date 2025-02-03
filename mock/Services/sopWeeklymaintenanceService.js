const { getConnection } = require("../Database/dbConfig");
const sql = require("mssql");
const fs = require("fs").promises; // Use the promise-based version of fs
const jsonFunctions = require("../Json/functions");

async function getWeeklymaintenancebyZone(zone, month, year) {
  try {
    // console.log("data : ", { zone, month, year });
    const result = await jsonFunctions.getJSON("mock/Json/sopWeekly.json");
    // const date = new Date();
    const data = result.sop_weeklymaintenancezone.filter(
      (value) =>
        new Date(value.date).getMonth() === month &&
        new Date(value.date).getFullYear() === year &&
        value.zone === zone
    );

    const bdMinutes = [
      {
        monthAvg: Number(
          (
            data.reduce((sum, item) => sum + item.bdminutes, 0) / data.length
          ).toFixed(2)
        ),
        w1: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() <= 7)
              .reduce((sum, item) => sum + item.bdminutes, 0) /
              data.filter((row) => new Date(row.date).getDate() <= 7).length ||
            0
          ).toFixed(2)
        ),
        w2: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              )
              .reduce((sum, item) => sum + item.bdminutes, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              ).length || 0
          ).toFixed(2)
        ),
        w3: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              )
              .reduce((sum, item) => sum + item.bdminutes, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              ).length || 0
          ).toFixed(2)
        ),
        w4: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() > 21)
              .reduce((sum, item) => sum + item.bdminutes, 0) /
              data.filter((row) => new Date(row.date).getDate() > 21).length ||
            0
          ).toFixed(2)
        ),
      },
    ];

    const bdNumbers = [
      {
        monthAvg: Number(
          (
            data.reduce((sum, item) => sum + item.bdnumbers, 0) / data.length
          ).toFixed(2)
        ),
        w1: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() <= 7)
              .reduce((sum, item) => sum + item.bdnumbers, 0) /
              data.filter((row) => new Date(row.date).getDate() <= 7).length ||
            0
          ).toFixed(2)
        ),
        w2: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              )
              .reduce((sum, item) => sum + item.bdnumbers, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              ).length || 0
          ).toFixed(2)
        ),
        w3: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              )
              .reduce((sum, item) => sum + item.bdnumbers, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              ).length || 0
          ).toFixed(2)
        ),
        w4: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() > 21)
              .reduce((sum, item) => sum + item.bdnumbers, 0) /
              data.filter((row) => new Date(row.date).getDate() > 21).length ||
            0
          ).toFixed(2)
        ),
      },
    ];

    const upTimeVariable = [
      {
        monthAvg: Number(
          (
            data.reduce((sum, item) => sum + item.uptime, 0) / data.length
          ).toFixed(2)
        ),
        w1: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() <= 7)
              .reduce((sum, item) => sum + item.uptime, 0) /
              data.filter((row) => new Date(row.date).getDate() <= 7).length ||
            0
          ).toFixed(2)
        ),
        w2: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              )
              .reduce((sum, item) => sum + item.uptime, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              ).length || 0
          ).toFixed(2)
        ),
        w3: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              )
              .reduce((sum, item) => sum + item.uptime, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              ).length || 0
          ).toFixed(2)
        ),
        w4: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() > 21)
              .reduce((sum, item) => sum + item.uptime, 0) /
              data.filter((row) => new Date(row.date).getDate() > 21).length ||
            0
          ).toFixed(2)
        ),
      },
    ];

    const upTimeConstant = Number(
      (
        data.reduce((sum, item) => sum + item.availabletime, 0) / data.length
      ).toFixed(2)
    );

    const mttr = [
      {
        monthAvg: Number(
          (
            data.reduce((sum, item) => sum + item.mttr, 0) / data.length
          ).toFixed(2)
        ),
        w1: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() <= 7)
              .reduce((sum, item) => sum + item.mttr, 0) /
              data.filter((row) => new Date(row.date).getDate() <= 7).length ||
            0
          ).toFixed(2)
        ),
        w2: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              )
              .reduce((sum, item) => sum + item.mttr, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              ).length || 0
          ).toFixed(2)
        ),
        w3: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              )
              .reduce((sum, item) => sum + item.mttr, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              ).length || 0
          ).toFixed(2)
        ),
        w4: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() > 21)
              .reduce((sum, item) => sum + item.mttr, 0) /
              data.filter((row) => new Date(row.date).getDate() > 21).length ||
            0
          ).toFixed(2)
        ),
      },
    ];

    const mtbf = [
      {
        monthAvg: Number(
          (
            data.reduce((sum, item) => sum + item.mtbf, 0) / data.length
          ).toFixed(2)
        ),
        w1: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() <= 7)
              .reduce((sum, item) => sum + item.mtbf, 0) /
              data.filter((row) => new Date(row.date).getDate() <= 7).length ||
            0
          ).toFixed(2)
        ),
        w2: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              )
              .reduce((sum, item) => sum + item.mtbf, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 7 &&
                  new Date(row.date).getDate() <= 14
              ).length || 0
          ).toFixed(2)
        ),
        w3: Number(
          (
            data
              .filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              )
              .reduce((sum, item) => sum + item.mtbf, 0) /
              data.filter(
                (row) =>
                  new Date(row.date).getDate() > 14 &&
                  new Date(row.date).getDate() <= 21
              ).length || 0
          ).toFixed(2)
        ),
        w4: Number(
          (
            data
              .filter((row) => new Date(row.date).getDate() > 21)
              .reduce((sum, item) => sum + item.mtbf, 0) /
              data.filter((row) => new Date(row.date).getDate() > 21).length ||
            0
          ).toFixed(2)
        ),
      },
    ];

    return {
      bdMinutes,
      bdNumbers,
      upTimeVariable,
      upTimeConstant,
      mttr,
      mtbf,
    };
  } catch (error) {
    console.error("Error fetching rows:", error);
    throw error;
  }
}

// async function main(){
//   const result = await getWeeklymaintenancebyZone("3.1", 9);
//   const result2 = await getWeeklymaintenancebyMachine("3.1", 9, "BMS");
//   console.log("result : ", result);
//   console.log("result2 : ", result2);
// }

// main()

module.exports = { getWeeklymaintenancebyZone };
