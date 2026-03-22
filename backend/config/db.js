const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "R@t@n@080106",
  multipleStatements: true,
});

const schemaPath = path.join(__dirname, "..", "placement_management_system.sql");

const setupDatabase = () => {
  db.query("CREATE DATABASE IF NOT EXISTS placement_management_system", (err) => {
    if (err) {
      console.error("Failed to create database:\n", err);
      return;
    }

    db.query("USE placement_management_system", (err) => {
      if (err) {
        console.error("Failed to use database:\n", err);
        return;
      }

      try {
        const sql = fs.readFileSync(schemaPath, "utf8");
        db.query(sql, (err2) => {
          if (err2) {
            console.error("Error executing schema file:\n", err2);
            return;
          }
          console.log("Database and tables are ready.");

          // Ensure about column exists for backwards compatibility.
          db.query(
            "SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE table_schema = 'placement_management_system' AND table_name = 'students' AND column_name = 'about'",
            (colErr, results) => {
              if (colErr) {
                console.error("Error checking about column:\n", colErr);
                return;
              }
              const hasAbout = results && results[0] && results[0].count > 0;
              if (!hasAbout) {
                db.query("ALTER TABLE students ADD COLUMN about TEXT", (alterErr) => {
                  if (alterErr) {
                    console.error("Error adding about column:\n", alterErr);
                  } else {
                    console.log("Added missing about column to students table.");
                  }
                });
              }
            }
          );
        });
      } catch (readErr) {
        console.error("Failed to read schema file:\n", readErr);
      }
    });
  });
};

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:\n", err);
  } else {
    console.log("Connected to MySQL");
    setupDatabase();
  }
});

module.exports = db;

module.exports = db