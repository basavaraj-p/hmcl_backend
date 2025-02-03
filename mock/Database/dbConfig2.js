// In your dbConfig2.js file
const sql = require("mssql");

const config = {
  user: process.env.DB_USER2,
  password: process.env.DB_PASSWORD2,
  server: process.env.DB_SERVER2,
  database: process.env.DB_DATABASE2,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function getConnection2() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    console.error("Error connecting to EV_BPA_PROD_EOL database:", err);
    throw err;
  }
}

module.exports = { getConnection2 };
