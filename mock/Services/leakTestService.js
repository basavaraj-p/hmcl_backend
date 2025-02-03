// leakTestService
const { response } = require("express");
const { getConnection } = require("../Database/dbConfig");
const { getConnection2 } = require("../Database/dbConfig2");

async function postLeakTestService1(filteringData) {
  let zone = filteringData.params.zone.toString();
  let shift = filteringData.params.shift;
  let date = filteringData.params.date;

  // console.log("Start Date : ", date.startDate.substr(0, 10));
  // console.log("End Date   : ", date.endDate.substr(0, 10));

  // const start_date = date.startDate.substr(0,10);
  const start_date = new Date(date.startDate.substr(0, 10));
  start_date.setHours(start_date.getHours() + 24);

  // const end_date = date.endDate.substr(0,10)
  const end_date = new Date(date.endDate.substr(0, 10));
  end_date.setHours(end_date.getHours() + 24);

  // console.log("Start Date 2 : ", start_date);
  // console.log("End Date 2   : ", end_date);
  let pool;
  // const date = new Date(newDate); // Original date
  // date.setHours(date.getHours() + 24);

  try {
    pool = await getConnection();
    const result = await pool
      .request()
      .input("shift", shift)
      .input("zone", zone)
      .input("start_date", start_date)
      .input("end_date", end_date)
      .query(`SELECT [DateTime], Battery_Pack_Barcode, LeakTestResult FROM EV_BPA_DEV_MAINLINE.dbo.test_leaktesting 
            WHERE OperationalShift = @shift 
            AND Spare01 = ${zone}
            AND CAST([DateTime] AS DATE) > @start_date 
            AND CAST([DateTime] AS DATE) <= @end_date
            AND LeakTestResult = 0 ;`);
    // console.log("Leak test result >>>>>>>>>>>>>>>>>>>>> ");
    // console.log(result.recordset);

    return result.recordset;
  } catch (error) {
    console.log("Error getting leak test service1 : ", error);
    throw error;
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

async function postLeakTestService2(results) {
  let pool2,
    filterArr = [];
  try {
    pool2 = await getConnection2();
    const request = pool2.request();

    const data = await results.map(async (res) => {
      let filterData = await request.query(
        `EXEC sop_getleaktestingassetidandzonebybarcode ${res.Battery_Pack_Barcode}`
      );
      // console.log("FD ***** ",filterData.recordset[0].AssetID)
      filterArr.push(filterData);

      return {
        assetID: filterData.recordset[0].AssetID,
        data: res,
      };
    });

    return data;
  } catch (error) {
    console.error("Error getting leak test service2: ", error);
    throw error;
  }
}

// async function updateRejectionRework(data, rows){
//   let pool, lastRes = [], result , duplicates = [];
//   const defect_code = data.defect_code;    const defect_type = data.defect_type;
//   const reason = data.reason;              const zone = data.zone;
//   const user = data.user;                  let shiftid = data.shift;

//   if(data.shift == 'A') shiftid = 1;    if(data.shift == 'B') shiftid = 2;      if(data.shift == 'C') shiftid = 3;
//   let last7DaysResult, last7DaysArr = [];
//   console.log("Updating rejection rework  >>>>>>>>>> ");
//   // console.log("zone ",data.zone);

//   try {
//     pool = await getConnection();
//     last7DaysResult = await pool.request()
//               .query(`SELECT barcode , defectcode
//                 FROM EV_BPA_DEV_MAINLINE.dbo.sop_rejectionrework
//                 WHERE datetime >= DATEADD(DAY, -7, GETDATE()) ;`);
//     last7DaysArr = last7DaysResult.recordset;
//     // console.log("Last 7 Days data ",last7DaysArr);

//     let res = await defect_code.map( async (code) => {
//         let rowResult = await rows.map( async (row) => {
//             let datetime = row.data.DateTime;
//             let assetid = row.assetID;
//             let barcode = row.data.Battery_Pack_Barcode;

//            lastRes =  last7DaysArr.filter((rowValue) => {
//             console.log(rowValue.barcode , " " ,barcode ," ", rowValue.defectcode ," ",code);

//               if(rowValue.barcode == barcode && rowValue.defectcode == code){
//                 return 1 ;
//               }
//             })
//             console.log("Last res >>>>>>>>>>>>>>>>>> ",lastRes," ",lastRes.length );

//         if(lastRes.length > 0){
//           if(lastRes[0].barcode == barcode && lastRes[0].defectcode == code){
//             console.log("Skipped / Alread exists !! ",barcode," ",code);
//             duplicates.push({barcode , code})
//           }
//           else {
//               result = await pool.request().input("assetid",assetid)
//               .input("shiftid",shiftid).input("barcode",barcode)
//               .input("code",code).input("reason",reason)
//               .input("user",user).input("defect_type",defect_type).input("zone",zone)
//               .query(`INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_rejectionrework
//                 ([datetime], assetid, shiftid, barcode, defectcode, reason, [user], defect_type, zone)
//                 VALUES (SYSDATETIMEOFFSET(), @assetid, @shiftid, @barcode, @code, @reason, @user, @defect_type, @zone ) ;`);

//                 console.log("result 1 ** ",result);
//                 console.log("Inserted 1 ******** ",code," ",row.assetID," ",row.data.DateTime,"",row.data.Battery_Pack_Barcode," ",shiftid," ",defect_type," ",reason," ",zone," ",user)

//                 return result;
//             }
//        }else{
//          result = await pool.request().input("assetid",assetid)
//         .input("shiftid",shiftid).input("barcode",barcode)
//         .input("code",code).input("reason",reason)
//         .input("user",user).input("defect_type",defect_type).input("zone",zone)
//         .query(`INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_rejectionrework
//           ([datetime], assetid, shiftid, barcode, defectcode, reason, [user], defect_type, zone)
//           VALUES (SYSDATETIMEOFFSET(), @assetid, @shiftid, @barcode, @code, @reason, @user, @defect_type, @zone ) ;`);

//           console.log("result 2 ** ",result);
//           console.log("Inserted 2 ******** ",code," ",row.assetID," ",row.data.DateTime,"",row.data.Battery_Pack_Barcode," ",shiftid," ",defect_type," ",reason," ",zone," ",user)

//           return { result : result, rows : {defect_type : code , barcode : row.data.Battery_Pack_Barcode} };
//        }
//       })
//       console.log("rowResult ***** ",rowResult)
//       return rowResult;
//     })
//     return data = {res , lastRes, duplicates};

//   } catch (error) {
//     console.error("Error getting rejection rework service : ", error);
//     throw error;
//     }finally{
//       if(pool){
//         pool.close();
//       }
//     }
// }

async function updateRejectionRework(data, rows) {
  let pool;
  const { defect_code, defect_type, reason, zone, user, shift } = data;
  const shiftid = { A: 1, B: 2, C: 3 }[shift] || null;

  // console.log("Updating rejection rework >>>>>>>>>>");

  try {
    pool = await getConnection();

    // Fetch last 7 days data
    const last7DaysResult = await pool.request()
      .query(`SELECT barcode, defectcode 
              FROM EV_BPA_DEV_MAINLINE.dbo.sop_rejectionrework
              WHERE datetime >= DATEADD(DAY, -7, GETDATE())`);
    const last7DaysArr = last7DaysResult.recordset;

    // Process each defect code
    const results = await Promise.all(
      defect_code.map(async (code) => {
        const rowResults = await Promise.all(
          rows.map(async (row) => {
            const { DateTime, Battery_Pack_Barcode: barcode } = row.data;
            const assetid = row.assetID;

            const existingEntries = last7DaysArr.filter(
              ({ barcode: b, defectcode: d }) => b === barcode && d === code
            );
            if (existingEntries.length > 0) {
              console.log("Skipped / Already exists !!", barcode, code);
              return { barcode, code, exists: true };
            }

            // Insert new entry
            const result = await pool
              .request()
              .input("assetid", assetid)
              .input("shiftid", shiftid)
              .input("barcode", barcode)
              .input("code", code)
              .input("reason", reason)
              .input("user", user)
              .input("defect_type", defect_type)
              .input("zone", zone)
              .query(`INSERT INTO EV_BPA_DEV_MAINLINE.dbo.sop_rejectionrework 
                  ([datetime], assetid, shiftid, barcode, defectcode, reason, [user], defect_type, zone)
                  VALUES (SYSDATETIMEOFFSET(), @assetid, @shiftid, @barcode, @code, @reason, @user, @defect_type, @zone)`);

            // console.log("Inserted:", {
            //   code,
            //   assetid,
            //   barcode,
            //   shiftid,
            //   defect_type,
            //   reason,
            //   zone,
            //   user,
            // });
            return { barcode, code, exists: false, result };
          })
        );

        return rowResults;
      })
    );

    return { results, duplicates: results.flat().filter((r) => r.exists) };
  } catch (error) {
    console.error("Error in updateRejectionRework:", error);
    throw error;
  } finally {
    if (pool) {
      pool.close();
    }
  }
}

module.exports = {
  postLeakTestService1,
  postLeakTestService2,
  updateRejectionRework,
};
