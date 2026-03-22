const db = require("../config/db");

const rejectIneligibleApplications = (userId, callback) => {
  const rejectSql = `
    UPDATE applications AS a
    JOIN students AS s ON a.student_id = s.student_id
    JOIN jobs AS j ON a.job_id = j.job_id
    SET a.status = 'Rejected'
    WHERE s.user_id = ? AND a.status = 'Applied'
      AND (s.backlogs > j.max_backlogs OR s.cgpa < j.min_cgpa)
  `;

  db.query(rejectSql, [userId], (err) => {
    if (err) {
      console.error("Error setting rejected applications:", err);
    }
    if (typeof callback === "function") callback();
  });
};

exports.createStudent = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, roll_no, branch, cgpa, backlogs, phone, year, about, resume_filename, resume_data } = req.body;

  const sql = `
    INSERT INTO students 
    (user_id, name, roll_no, branch, cgpa, backlogs, phone, year, about, resume_filename, resume_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [userId, name, roll_no, branch, cgpa, backlogs, phone, year, about || null, resume_filename || null, resume_data || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message || "Failed to create student" });

      rejectIneligibleApplications(userId, () => {
        res.json({ message: "Student profile created successfully" });
      });
    }
  );
};

exports.getStudent = (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const sql = "SELECT * FROM students WHERE user_id = ?";

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message || "Failed to retrieve student" });

    if (results.length === 0) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.json(results[0]);
  });
};

exports.getAllStudents = (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId || role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const sql = "SELECT student_id, user_id, name, roll_no, branch, cgpa, backlogs, about FROM students";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message || "Failed to retrieve students" });
    res.json(results);
  });
};

exports.updateStudent = (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { name, roll_no, branch, cgpa, backlogs, phone, year, about, resume_filename, resume_data } = req.body;

  const sql = `
    UPDATE students
    SET name = ?, roll_no = ?, branch = ?, cgpa = ?, backlogs = ?, phone = ?, year = ?, about = ?, resume_filename = ?, resume_data = ?
    WHERE user_id = ?
  `;

  const executeUpdate = () => {
    db.query(
      sql,
      [name, roll_no, branch, cgpa, backlogs, phone, year, about || null, resume_filename || null, resume_data || null, userId],
      (err, result) => {
        if (err) {
          if (err.code === "ER_BAD_FIELD_ERROR" && err.sqlMessage.includes("about")) {
            // safety: add missing column and retry once
            return db.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS about TEXT", (alterErr) => {
              if (alterErr) return res.status(500).json({ message: alterErr.message || "Failed to alter students table" });
              executeUpdate();
            });
          }
          return res.status(500).json({ message: err.message || "Failed to update student" });
        }

        if (result.affectedRows === 0) {
          // Insert new record if none exists
          const insertSql = `
            INSERT INTO students (user_id, name, roll_no, branch, cgpa, backlogs, phone, year, about, resume_filename, resume_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          return db.query(
            insertSql,
            [userId, name, roll_no, branch, cgpa, backlogs, phone, year, about || null, resume_filename || null, resume_data || null],
            (insertErr) => {
              if (insertErr) return res.status(500).json({ message: insertErr.message || "Failed to create student" });

              rejectIneligibleApplications(userId, () => {
                res.json({ message: "Student profile created successfully" });
              });
            }
          );
        }

        rejectIneligibleApplications(userId, () => {
          res.json({ message: "Student profile updated successfully" });
        });
      }
    );
  };

  executeUpdate();
};