const mysql = require("mysql2");

const DBCONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

let connection = mysql.createConnection(DBCONFIG);
connection.connect(onConnectionReady);

function onConnectionReady(error) {
  if (error != null) {
    console.error("Error connecting to the database:", error);
  } else {
    console.log("Successfully connected to the database:", DBCONFIG.database);
  }
}

module.exports = connection;
