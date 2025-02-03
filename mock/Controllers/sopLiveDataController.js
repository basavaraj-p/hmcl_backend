const sopLiveDataService = require("../Services/sopLiveDataService");

async function getLatestLiveData(req, res) {
  try {
    const liveData = await sopLiveDataService.getLatestLiveData();
    res.json(liveData);
  } catch (error) {
    res.status(500).json({
      error:
        "An error occurred while fetching the live data from function getLatestLiveData()",
    });
  }
}

module.exports = { getLatestLiveData };
