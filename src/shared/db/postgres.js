const postgres = require("postgres");
require("dotenv").config();

const sql = postgres({
  host: process.env.dbhost,
  port: process.env.dbport || 5432,
  database: process.env.database,
  username: process.env.dbusername,
  password: process.env.dbpassword,
  connect_timeout: 30
});

module.exports = sql;
