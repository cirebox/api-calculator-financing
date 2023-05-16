const postgres = require("postgres");
require("dotenv").config();

const URL = `postgres://${process.env.dbusername}:${process.env.dbpassword}@${process.env.dbhost}/${process.env.database}?options=project%3Dep-young-dream-393689`;

// const sql = postgres({
//   host: process.env.dbhost,
//   port: process.env.dbport || 5432,
//   database: process.env.database,
//   username: process.env.dbusername,
//   password: process.env.dbpassword,
//   connect_timeout: 30
// });

const sql = postgres(URL, { ssl: 'require' });

module.exports = sql;
