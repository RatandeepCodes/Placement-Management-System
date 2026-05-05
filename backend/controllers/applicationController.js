const db = require("../config/db");

const VALID_APPLICATION_STATUSES = new Set([
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Placed",
  "Rejected",
]);

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
    db.query(studentQuery, [id], callback);
  };

  const getJobQuery = "SELECT min_cgpa, max_backlogs FROM jobs WHERE job_id = ?";

  const handleStudent = (studentResult) => {
    if (studentResult.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = studentResult[0];

    db.query(getJobQuery, [job_id], (jobError, jobResult) => {
      if (jobError) return res.status(500).json(jobError);

      if (jobResult.length === 0) {
        return res.status(404).json({ message: "Job not found" });
      }

      const job = jobResult[0];

      if (student.cgpa < job.min_cgpa || student.backlogs > job.max_backlogs) {
        return res.status(403).json({ message: "Student not eligible for this job" });
      }

      const existingQuery = "SELECT * FROM applications WHERE student_id = ? AND job_id = ?";
      db.query(existingQuery, [student.student_id, job_id], (existingError, existingRows) => {
        if (existingError) return res.status(500).json(existingError);
        if (existingRows.length > 0) {
          return res.status(409).json({ message: "You have already applied for this job" });
        }

        const applyQuery = `
          INSERT INTO applications (student_id, student_name, job_id, status, applied_date)
          VALUES (?, ?, ?, 'Applied', NOW())
        `;

        db.query(applyQuery, [student.student_id, student.name, job_id], (applyError) => {
          if (applyError) return res.status(500).json(applyError);

          res.json({ message: "Application submitted successfully" });
        });
      });
    });
  };

  if (!job_id) {
    return res.status(400).json({ message: "job_id is required" });
  }

  getStudentByUserId(requester.id, (studentError, studentResult) => {
    if (studentError) return res.status(500).json(studentError);
    handleStudent(studentResult);
  });
};

exports.getApplications = (req, res) => {
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
  `;

  const params = [];

  if (requester.role === "admin") {
    if (requestedUserId) {
      sql += " WHERE students.user_id = ?";
      params.push(requestedUserId);
    }
  } else {
    sql += " WHERE students.user_id = ?";
    params.push(requester.id);
  }

  db.query(sql, params, (queryError, results) => {
    if (queryError) return res.status(500).json(queryError);

    res.json(results);
  });
};

exports.updateApplicationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!VALID_APPLICATION_STATUSES.has(status)) {
    return res.status(400).json({ message: "Invalid application status" });
  }

  const sql = `
    UPDATE applications
    SET status = ?
    WHERE application_id = ?
  `;

  db.query(sql, [status, id], (queryError, result) => {
    if (queryError) return res.status(500).json(queryError);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({ message: "Application status updated successfully" });
  });
};
