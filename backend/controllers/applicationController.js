const db = require("../config/db");

<<<<<<< HEAD
const VALID_APPLICATION_STATUSES = new Set([
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Placed",
  "Rejected",
]);

// Apply for a job with eligibility check
exports.applyJob = (req, res) => {
  const { job_id } = req.body;
  const requester = req.user;

  if (!requester) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (requester.role !== "student") {
    return res.status(403).json({ message: "Only students can apply to jobs" });
  }

  const getStudentByUserId = (id, callback) => {
    const studentQuery = "SELECT student_id, name, cgpa, backlogs FROM students WHERE user_id = ?";
=======
// Apply for a job with eligibility check
exports.applyJob = (req, res) => {
  const { student_id, job_id, user_id } = req.body;

  const getStudentById = (id, callback) => {
    const studentQuery = "SELECT student_id, cgpa, backlogs FROM students WHERE student_id = ?";
    db.query(studentQuery, [id], callback);
  };

  const getStudentByUserId = (id, callback) => {
    const studentQuery = "SELECT student_id, cgpa, backlogs FROM students WHERE user_id = ?";
>>>>>>> 83320e1 (Backend)
    db.query(studentQuery, [id], callback);
  };

  const getJobQuery = "SELECT min_cgpa, max_backlogs FROM jobs WHERE job_id = ?";

  const handleStudent = (studentResult) => {
    if (studentResult.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentResult[0];

    // Get job details
    db.query(getJobQuery, [job_id], (err, jobResult) => {
      if (err) return res.status(500).json(err);

      if (jobResult.length === 0) {
        return res.status(404).json({ message: "Job not found" });
      }

      const job = jobResult[0];

      // Eligibility check
      if (student.cgpa < job.min_cgpa || student.backlogs > job.max_backlogs) {
        return res.status(403).json({ message: "Student not eligible for this job" });
      }

      // Check for duplicate application
      const existingQuery = "SELECT * FROM applications WHERE student_id = ? AND job_id = ?";
      db.query(existingQuery, [student.student_id, job_id], (err2, existingRows) => {
        if (err2) return res.status(500).json(err2);
        if (existingRows.length > 0) {
          return res.status(409).json({ message: "You have already applied for this job" });
        }

        // Insert application
        const applyQuery = `
<<<<<<< HEAD
          INSERT INTO applications (student_id, student_name, job_id, status, applied_date)
          VALUES (?, ?, ?, 'Applied', NOW())
        `;

        db.query(applyQuery, [student.student_id, student.name, job_id], (err3, result) => {
=======
          INSERT INTO applications (student_id, job_id, status, applied_date)
          VALUES (?, ?, 'Applied', CURDATE())
        `;

        db.query(applyQuery, [student.student_id, job_id], (err3, result) => {
>>>>>>> 83320e1 (Backend)
          if (err3) return res.status(500).json(err3);

          res.json({ message: "Application submitted successfully" });
        });
      });
    });
  };

  if (!job_id) {
    return res.status(400).json({ message: "job_id is required" });
  }

<<<<<<< HEAD
  getStudentByUserId(requester.id, (err, studentResult) => {
    if (err) return res.status(500).json(err);
    handleStudent(studentResult);
  });
=======
  if (student_id) {
    getStudentById(student_id, (err, studentResult) => {
      if (err) return res.status(500).json(err);
      handleStudent(studentResult);
    });
  } else if (user_id) {
    getStudentByUserId(user_id, (err, studentResult) => {
      if (err) return res.status(500).json(err);
      handleStudent(studentResult);
    });
  } else {
    return res.status(400).json({ message: "student_id or user_id is required" });
  }
>>>>>>> 83320e1 (Backend)
};

// Get all applications, optionally filtered by student user_id
exports.getApplications = (req, res) => {
<<<<<<< HEAD
  const requester = req.user;

  if (!requester) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const requestedUserId = req.query.user_id;

  let sql = `
    SELECT applications.*, COALESCE(applications.student_name, students.name) AS student_name, jobs.title, companies.name AS company_name
    FROM applications
    JOIN students ON applications.student_id = students.student_id
    JOIN jobs ON applications.job_id = jobs.job_id
    JOIN companies ON jobs.company_id = companies.company_id
=======
  const userId = req.query.user_id;

  let sql = `
    SELECT applications.*, students.name, jobs.title
    FROM applications
    JOIN students ON applications.student_id = students.student_id
    JOIN jobs ON applications.job_id = jobs.job_id
>>>>>>> 83320e1 (Backend)
  `;

  const params = [];

<<<<<<< HEAD
  if (requester.role === "admin") {
    if (requestedUserId) {
      sql += " WHERE students.user_id = ?";
      params.push(requestedUserId);
    }
  } else {
    sql += " WHERE students.user_id = ?";
    params.push(requester.id);
=======
  if (userId) {
    sql += " WHERE students.user_id = ?";
    params.push(userId);
>>>>>>> 83320e1 (Backend)
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json(err);

    res.json(results);
  });
};
exports.updateApplicationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

<<<<<<< HEAD
  if (!VALID_APPLICATION_STATUSES.has(status)) {
    return res.status(400).json({ message: "Invalid application status" });
  }

=======
>>>>>>> 83320e1 (Backend)
  const sql = `
    UPDATE applications
    SET status = ?
    WHERE application_id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json(err);
<<<<<<< HEAD
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application status updated successfully" });
  });
};
=======

    res.json({ message: "Application status updated successfully" });
  });
};
>>>>>>> 83320e1 (Backend)
