const leakTestService = require("../Services/leakTestService");
const { getConnection2 } = require("../Database/dbConfig2");

async function postLeakTestController(req, res) {
  let filteringData = req.body;
  let machine = filteringData.params.machine;
  // console.log("filteringData leaktest ", filteringData);

  // These are key-val pair (assetID : machineName)
  const machineAssetId = {
    31010: "Insertion",
    31011: "Leak Testing",
    32010: "Insertion",
    32011: "Leak Testing",
    40001: "EOL",
    40002: "LaserMarking",
  };

  try {
    const result = await leakTestService.postLeakTestService1(filteringData);
    let result2 = await leakTestService.postLeakTestService2(result);
    // console.log("res2 ***** ",result2)
    const resolvedResults = await Promise.all(result2);
    const machineAssetId = {
      31010: "Insertion",
      31011: "Leak Testing",
      32010: "Insertion",
      32011: "Leak Testing",
      40001: "EOL",
      40002: "LaserMarking",
    };

    let filterArr = [];
    for (i = 0; i < resolvedResults.length; i++) {
      if (
        resolvedResults[i].assetID == 31010 ||
        resolvedResults[i].assetID == 31011 ||
        resolvedResults[i].assetID == 32010 ||
        resolvedResults[i].assetID == 32011 ||
        resolvedResults[i].assetID == 40001 ||
        resolvedResults[i].assetID == 40002
      ) {
        filterArr.push(resolvedResults[i]);
      }
    }
    // console.log("Filtered Arr ***** ",filterArr);
    res.json({ filterArr });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "An error occurred while fetching the postLeakTestController",
        error: error,
      });
  }
}

async function updateRejectionRework(req, res) {
  let data = req.body.params;
  let rows = req.body.params.Rows;
  // console.log("updateRejewctionRework controller",data)
  // console.log("updateRejectionRework controller ** ",rows)
  try {
    const result = await leakTestService.updateRejectionRework(data, rows);
    // console.log("update rej / rew controller >>>>>> ");
    // console.log("result.res ", result.res);
    // console.log("result.lastRes ", result.lastRes);
    // console.log("result.duplicates ", result.duplicates);
    res.status(200).json({ res: result });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching the updateRejectionRework controller",
      });
  }
}

module.exports = { postLeakTestController, updateRejectionRework };
