const fs = require("fs").promises; // Use the promise-based version of fs

async function getJSON(path) {
  try {
    const jsonString = await fs.readFile(path, "utf8");
    return JSON.parse(jsonString);
  } catch (err) {
    console.log("File read failed:", err);
    return null; // Return null or handle the error as needed
  }
}

function getFormattedDateTime() {
  const date = new Date();

  // Extract date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  // Extract time components
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  // Get timezone offset in the format +0530
  const timezoneOffset = -date.getTimezoneOffset(); // Offset in minutes
  const offsetHours = String(Math.floor(timezoneOffset / 60)).padStart(2, "0");
  const offsetMinutes = String(timezoneOffset % 60).padStart(2, "0");
  const timezone = `${
    timezoneOffset >= 0 ? "+" : "-"
  }${offsetHours}${offsetMinutes}`;

  // Combine into the desired format
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} ${timezone}`;
}

function getMachineDetails(machine,data) {
    let filteredData
    let index
    // if (machine === "Welding Station") {
      filteredData = data.sop_assets.filter((value) =>
        value.machinename.includes(machine)
      );
      index = getRandomIndex(filteredData)
      return filteredData[index]
    // }
  }
  
  function getRandomIndex(array) {
    const index = Math.floor(Math.random() * array.length);
    return index;
  }
  
// Example usage
//   console.log(getFormattedDateTime());
// async function main() {
//   const result = await getJSON("./test.json");
//   console.log("result : ", result);
// }

// main();

module.exports = {
  getJSON,
  getFormattedDateTime,
  getMachineDetails,
  getRandomIndex
};
