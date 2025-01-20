// dbConfig.js
const sql = require("mssql");
require("dotenv").config();


const config = {
  user: process.env.DB_USER_TEST,
  password: process.env.DB_PASSWORD_TEST,
  server: process.env.DB_SERVER_TEST,
  database: process.env.DB_DATABASE_TEST,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

module.exports = sql.connect(config);
