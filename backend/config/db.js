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

const ensureStudentCompatibility = () => {
  db.query(
    "SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE table_schema = 'placement_management_system' AND table_name = 'students' AND column_name = 'about'",
    (columnError, results) => {
      if (columnError) {
        console.error("Error checking about column:\n", columnError);
        return;
      }

      const hasAbout = results && results[0] && results[0].count > 0;
      if (!hasAbout) {
        db.query("ALTER TABLE students ADD COLUMN about TEXT", (alterError) => {
          if (alterError) {
            console.error("Error adding about column:\n", alterError);
          } else {
            console.log("Added missing about column to students table.");
          }
        });
      }
    },
  );
};

const ensureStudentResumeCompatibility = () => {
  const createResumeTableSql = `
    CREATE TABLE IF NOT EXISTS student_resumes (
      student_id INT PRIMARY KEY,
      resume_data LONGTEXT,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    )
  `;

  db.query(createResumeTableSql, (tableError) => {
    if (tableError) {
      console.error("Error ensuring student_resumes table:\n", tableError);
      return;
    }

    db.query(
      "SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE table_schema = 'placement_management_system' AND table_name = 'students' AND column_name = 'resume_data'",
      (columnError, results) => {
        if (columnError) {
          console.error("Error checking students.resume_data column:\n", columnError);
          return;
        }

        const hasResumeData = results && results[0] && results[0].count > 0;
        if (!hasResumeData) {
          return;
        }

        db.query(
          `
            INSERT INTO student_resumes (student_id, resume_data)
            SELECT student_id, resume_data
            FROM students
            WHERE resume_data IS NOT NULL AND resume_data <> ''
            ON DUPLICATE KEY UPDATE
              resume_data = VALUES(resume_data),
              updated_at = CURRENT_TIMESTAMP
          `,
          (backfillError) => {
            if (backfillError) {
              console.error("Error migrating student resume data:\n", backfillError);
              return;
            }

            db.query("ALTER TABLE students DROP COLUMN resume_data", (alterError) => {
              if (alterError) {
                console.error("Error removing students.resume_data column:\n", alterError);
              } else {
                console.log("Moved resume data out of students table.");
              }
            });
          },
        );
      },
    );
  });
};

const ensureApplicationCompatibility = () => {
  db.query(
    "SELECT COUNT(*) AS count FROM information_schema.COLUMNS WHERE table_schema = 'placement_management_system' AND table_name = 'applications' AND column_name = 'student_name'",
    (columnError, results) => {
      if (columnError) {
        console.error("Error checking student_name column:\n", columnError);
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
          (updateError) => {
            if (updateError) {
              console.error("Error backfilling application student names:\n", updateError);
            }
          },
        );
      };

      if (!hasStudentName) {
        db.query(
          "ALTER TABLE applications ADD COLUMN student_name VARCHAR(255) NULL AFTER student_id",
          (alterError) => {
            if (alterError) {
              console.error("Error adding student_name column:\n", alterError);
              return;
            }

            console.log("Added missing student_name column to applications table.");
            backfillStudentNames();
          },
        );
        return;
      }

      backfillStudentNames();
    },
  );
};

const ensureApplicationTimestampCompatibility = () => {
  db.query(
    "SELECT DATA_TYPE AS dataType FROM information_schema.COLUMNS WHERE table_schema = 'placement_management_system' AND table_name = 'applications' AND column_name = 'applied_date'",
    (columnError, results) => {
      if (columnError) {
        console.error("Error checking applied_date column:\n", columnError);
        return;
      }

      const currentType = results && results[0] ? String(results[0].dataType || "").toLowerCase() : "";

      if (currentType === "datetime" || currentType === "timestamp") {
        return;
      }

      if (currentType === "date") {
        db.query(
          "ALTER TABLE applications MODIFY COLUMN applied_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
          (alterError) => {
            if (alterError) {
              console.error("Error upgrading applied_date column to DATETIME:\n", alterError);
            } else {
              console.log("Upgraded applied_date column to DATETIME in applications table.");
            }
          },
        );
      }
    },
  );
};

const setupDatabase = () => {
  db.query("CREATE DATABASE IF NOT EXISTS placement_management_system", (databaseError) => {
    if (databaseError) {
      console.error("Failed to create database:\n", databaseError);
      return;
    }

    db.query("USE placement_management_system", (useError) => {
      if (useError) {
        console.error("Failed to use database:\n", useError);
        return;
      }

      try {
        const sql = fs.readFileSync(schemaPath, "utf8");
        db.query(sql, (schemaError) => {
          if (schemaError) {
            console.error("Error executing schema file:\n", schemaError);
            return;
          }

          console.log("Database and tables are ready.");
          ensureStudentCompatibility();
          ensureStudentResumeCompatibility();
          ensureApplicationCompatibility();
          ensureApplicationTimestampCompatibility();
        });
      } catch (readError) {
        console.error("Failed to read schema file:\n", readError);
      }
    });
  });
};

db.connect((connectionError) => {
  if (connectionError) {
    console.error("Database connection failed:\n", connectionError);
  } else {
    console.log("Connected to MySQL");
    setupDatabase();
  }
});

module.exports = db;
