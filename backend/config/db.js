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

<<<<<<< HEAD
const ensureStudentCompatibility = () => {
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
};

const ensureApplicationCompatibility = () => {
  db.query(
    "SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE table_schema = 'placement_management_system' AND table_name = 'applications' AND column_name = 'student_name'",
    (colErr, results) => {
      if (colErr) {
        console.error("Error checking student_name column:\n", colErr);
        return;
      }

      const hasStudentName = results && results[0] && results[0].count > 0;

      const backfillStudentNames = () => {
        db.query(
          `
            UPDATE applications AS a
            JOIN students AS s ON s.student_id = a.student_id
            SET a.student_name = s.name
            WHERE a.student_name IS NULL OR a.student_name = ''
          `,
          (updateErr) => {
            if (updateErr) {
              console.error("Error backfilling application student names:\n", updateErr);
            }
          }
        );
      };

      if (!hasStudentName) {
        db.query(
          "ALTER TABLE applications ADD COLUMN student_name VARCHAR(255) NULL AFTER student_id",
          (alterErr) => {
            if (alterErr) {
              console.error("Error adding student_name column:\n", alterErr);
              return;
            }

            console.log("Added missing student_name column to applications table.");
            backfillStudentNames();
          }
        );
        return;
      }

      backfillStudentNames();
    }
  );
};

const ensureApplicationTimestampCompatibility = () => {
  db.query(
    "SELECT DATA_TYPE AS dataType FROM information_schema.COLUMNS WHERE table_schema = 'placement_management_system' AND table_name = 'applications' AND column_name = 'applied_date'",
    (colErr, results) => {
      if (colErr) {
        console.error("Error checking applied_date column:\n", colErr);
        return;
      }

      const currentType = results && results[0] ? String(results[0].dataType || "").toLowerCase() : "";

      if (currentType === "datetime" || currentType === "timestamp") {
        return;
      }

      if (currentType === "date") {
        db.query(
          "ALTER TABLE applications MODIFY COLUMN applied_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
          (alterErr) => {
            if (alterErr) {
              console.error("Error upgrading applied_date column to DATETIME:\n", alterErr);
            } else {
              console.log("Upgraded applied_date column to DATETIME in applications table.");
            }
          }
        );
      }
    }
  );
};

=======
>>>>>>> 83320e1 (Backend)
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
<<<<<<< HEAD
          ensureStudentCompatibility();
          ensureApplicationCompatibility();
          ensureApplicationTimestampCompatibility();
=======

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
>>>>>>> 83320e1 (Backend)
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

<<<<<<< HEAD
module.exports = db
=======
module.exports = db
>>>>>>> 83320e1 (Backend)
