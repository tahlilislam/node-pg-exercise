/** Database setup for BizTime. */

// destructuring client object from pg
const { Client } = require("pg");

let DB_URI;

// If we're running in test "mode", use our test db
// Make sure to create both databases!
if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_db_test";
} else {
  DB_URI = "postgresql:///biztime_db";
}

// configuring client by passing in an object, and give the database uri, the db to connect to
let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;