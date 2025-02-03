const sopRejectionService = require("../Services/sopRejectionService");

async function fetchRejections(req, res) {
  const { zone, machine } = req.body;

  try {
    const rowData = await sopRejectionService.fetchRejections(zone, machine);
    res.json({ rowData });
    // res.status(200).json({ message: "rejections fetched successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching rejections from fetchRejections()",
      });
  }
}

async function fetchDefects(req, res) {
  const { zone } = req.body;

  try {
    const rowData = await sopRejectionService.fetchDefects(zone);
    res.json({ rowData });
    // res.status(200).json({ message: "rejections fetched successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "An error occurred while fetching defects from fetchDefects()",
      });
  }
}

async function createRejectionLookup(req, res) {
  const { zone, machine, assetid, defect } = req.body;

  try {
    await sopRejectionService.createRejectionLookup(
      zone,
      machine,
      assetid,
      defect
    );
    // res.json({ rowData });
    res
      .status(200)
      .json({
        message:
          "rejections lookup created successfully by createRejectionLookup()",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while creating rejections lookup createRejectionLookup by createRejectionLookup()",
      });
  }
}

async function deleteRejectionLookup(req, res) {
  const { lineid } = req.body;

  try {
    await sopRejectionService.deleteRejectionLookup(lineid);
    // res.json({ rowData });
    res
      .status(200)
      .json({
        message:
          "rejections lookup deleted successfully by deleteRejectionLookup()",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while deleting rejections lookup by deleteRejectionLookup()",
      });
  }
}

async function fetchRejectionsFromsop_rejection(req, res) {
  try {
    const rowData =
      await sopRejectionService.fetchRejectionsFromsop_rejection();
    res.json({ rowData });
    // res.status(200).json({ message: "rejections fetched successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while fetching rejections from fetchRejectionsFromsop_rejection()",
      });
  }
}

async function createRejection(req, res) {
  const { zone, machine, defect, rejectioncount, shift } = req.body;

  try {
    await sopRejectionService.createRejection(
      zone,
      machine,
      defect,
      rejectioncount,
      shift
    );
    // res.json({ rowData });
    res
      .status(200)
      .json({
        message: "rejections created successfully by createRejection()",
      });
  } catch (error) {
    res
      .status(500)
      .json({
        error:
          "An error occurred while creating rejections by createRejection()",
      });
  }
}

module.exports = {
  fetchRejections,
  fetchDefects,
  createRejectionLookup,
  deleteRejectionLookup,
  fetchRejectionsFromsop_rejection,
  createRejection,
};
