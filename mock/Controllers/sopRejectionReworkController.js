const sopRejectionReworkService = require("../Services/sopRejectionReworkService");

async function fetchRejections(req, res) {
  try {
    const rowData = await sopRejectionReworkService.fetchDefects();
    res.json({ rowData });
    // res.status(200).json({ message: "rejections fetched successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching rejections from fetchDefects()",
      });
  }
}

async function createRejectionRework(req, res) {
  const { adid, barcodes, machine, defectType, defectCodes, reason } = req.body;

  try {
    await sopRejectionReworkService.createRejectionRework(
      adid,
      barcodes,
      machine,
      defectType,
      defectCodes,
      reason
    );
    // res.json({ rowData });
    res
      .status(200)
      .json({
        message:
          "rejection/rework created successfully by createRejectionRework()",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while creating rejection/rework by createRejectionRework()",
      });
  }
}

async function fetchRejectionReworks(req, res) {
  try {
    const rowData = await sopRejectionReworkService.fetchRejectionReworks();
    res.json({ rowData });
    // res.status(200).json({ message: "rejections fetched successfully" });
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching rejections and reworks from fetchRejectionReworks()",
    });
  }
}

async function fetchAssets(req, res) {
  try {
    const rowData = await sopRejectionReworkService.fetchAssets();
    res.json({ rowData });
    // res.status(200).json({ message: "rejections fetched successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "An error occurred while fetching assets by fetchAssets()",
      });
  }
}

// async function checkBarcodes(req, res) {
//   const { barcodes, machine } = req.body;
//   try {
//     // const barcodes = ["RJ6318100ADA", "RJ6018100AC8"]; // Example barcode
//     // const machine = "Welding integrity";
//     // console.log("Starting main function with barcode:", {
//     //   barcodes,
//     //   machine,
//     // });
//     const resultData = await sopRejectionReworkService.checkBarcodes(
//       barcodes,
//       machine
//     );
//     res.json({ resultData });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         error: "An error occurred while checking barcodes from checkBarcodes()",
//       });
//   }
// }

module.exports = {
  fetchRejections,
  createRejectionRework,
  fetchRejectionReworks,
  fetchAssets,
  // checkBarcodes,
};
