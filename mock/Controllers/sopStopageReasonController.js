const sopStopageReasonService = require("../Services/sopStopageReasonService");

async function getRowCount(req, res) {
  try {
    const count = await sopStopageReasonService.getRowCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching the row count from getRowCount()",
    });
  }
}

async function getRowCount2(req, res) {
  const { defaultId } = req.query; // Access query parameters
  // console.log("req getRowCount ", defaultId);
  try {
    const count = await sopStopageReasonService.getRowCount2(defaultId);
    res.json(count);
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching the row count from getRowCount2()",
    });
  }
}

// async function getConsolidatedLoss(req, res) {
//   const { lossid, defaultId } = req.query; // Access query parameters
//   // console.log("req.params ",lossid)
//   try {
//     const response = await sopStopageReasonService.getConsolidatedLoss(
//       lossid,
//       defaultId
//     );
//     res.json({ response });
//   } catch (error) {
//     // console.log("Err ", error);
//     res.status(500).json({
//       error:
//         "An error occurred while fetching stoppage by getConsolidatedLoss()",
//     });
//   }
// }

async function updateStoppage(req, res) {
  // console.log("Update stoppage ",req.body);
  const { stopid, lossid, reason } = req.body;
  try {
    const response = await sopStopageReasonService.updateStoppage(
      stopid,
      lossid,
      reason
    );
    res.json({ response });
  } catch (error) {
    // console.log("Err ", error);
    res.status(500).json({
      error: "An error occurred while updating stoppage by updateStoppage()",
    });
  }
}

async function getTodayRowCount(req, res) {
  try {
    const count = await sopStopageReasonService.getTodayRowCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching today's row count by getTodayRowCount()",
    });
  }
}

module.exports = {
  getRowCount,
  getRowCount2,
  getTodayRowCount,
  updateStoppage,
  // getConsolidatedLoss,
};
