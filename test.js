const fs = require("fs").promises; // Use the promise-based version of fs
const { v4: uuidv4 } = require("uuid");

async function getJSON(path) {
  try {
    const jsonString = await fs.readFile(path, "utf8");
    return JSON.parse(jsonString);
  } catch (err) {
    console.log("File read failed:", err);
    return null; // Return null or handle the error as needed
  }
}

const object = {
  adjustedStartDate: "2025-02-01T18:30:00.000Z",
  adjustedEndDate: "2025-03-01T18:29:59.999Z",
  shifts: ["Shift - A", "Shift - B"],
};

const shiftMapping = {
  "Shift - A": 1,
  "Shift - B": 2,
  "Shift - C": 3,
};

const getShiftID = (value) => shiftMapping[value] || "Unknown";

async function main() {
  try {
    const data = await getJSON("mock/Json/sopShiftHistory.json");
    let result = [];

    const convertShifts = () => object.shifts.map(getShiftID);
    const convertShifts2 = convertShifts();

    if (shifts[0] === "all") {
      result = data.sop_shiftbreakhistory.filter(
        (value) =>
          value.time >= adjustedStartDate.toLocaleDateString() &&
          value.time <= adjustedEndDate.toLocaleDateString()
      );
    } else if (shifts[0] !== "all") {
      for (const shiftid of convertShifts2) {
        result.push(
          ...data.sop_shiftbreakhistory.filter(
            (value) =>
              value.time >= adjustedStartDate.toLocaleDateString() &&
              value.time <= adjustedEndDate.toLocaleDateString() &&
              value.shiftid === shiftid
          )
        );
      }
    } else {
      result = [];
    }

    console.log("result : ", result);
  } catch (error) {
    console.error(
      "Error getting existing schedules from table sop_shiftscheduler:",
      error
    );
    throw error;
  }
}

main();
