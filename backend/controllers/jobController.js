const db = require("../config/db");

exports.addJob = (req, res) => {
  const { company_id, title, min_cgpa, max_backlogs, salary, deadline } = req.body;

  const sql = `
    INSERT INTO jobs (company_id, title, min_cgpa, max_backlogs, salary, deadline)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [company_id, title, min_cgpa, max_backlogs, salary, deadline],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Job posted successfully" });
    }
  );
};

const fallbackJobs = [
  { company_id: 1, title: 'Software Engineer', min_cgpa: 8.0, max_backlogs: 0, salary: '₹24 LPA', deadline: '2026-03-30 23:59:00' },
  { company_id: 2, title: 'Data Analyst', min_cgpa: 7.5, max_backlogs: 1, salary: '₹20 LPA', deadline: '2026-04-05 18:00:00' },
  { company_id: 3, title: 'Cloud Engineer', min_cgpa: 7.0, max_backlogs: 2, salary: '₹18 LPA', deadline: '2026-04-10 17:30:00' },
  { company_id: 4, title: 'Full Stack Developer', min_cgpa: 7.2, max_backlogs: 1, salary: '₹16 LPA', deadline: '2026-04-15 15:00:00' },
  { company_id: 5, title: 'QA Automation Engineer', min_cgpa: 7.0, max_backlogs: 2, salary: '₹14 LPA', deadline: '2026-04-18 16:00:00' },
  { company_id: 6, title: 'Data Scientist', min_cgpa: 8.5, max_backlogs: 0, salary: '₹26 LPA', deadline: '2026-04-22 11:59:00' },
  { company_id: 7, title: 'UI/UX Designer', min_cgpa: 7.0, max_backlogs: 2, salary: '₹12 LPA', deadline: '2026-04-25 14:00:00' },
  { company_id: 8, title: 'AI Research Intern', min_cgpa: 9.0, max_backlogs: 0, salary: '₹30 LPA', deadline: '2026-04-30 23:59:00' },
  { company_id: 9, title: 'Business Analyst', min_cgpa: 7.4, max_backlogs: 1, salary: '₹15 LPA', deadline: '2026-05-05 18:30:00' },
  { company_id: 10, title: 'DevOps Engineer', min_cgpa: 7.8, max_backlogs: 1, salary: '₹22 LPA', deadline: '2026-05-10 17:00:00' },
];

const ensureJobs = (callback) => {
  const countSql = "SELECT COUNT(*) AS total FROM jobs";
  db.query(countSql, (err, result) => {
    if (err) return callback(err);

    const total = (result[0] && result[0].total) || 0;
    if (total >= 10) return callback(null);

    const values = fallbackJobs.map((job) => [job.company_id, job.title, job.min_cgpa, job.max_backlogs, job.salary, job.deadline]);
    const insertSql = "INSERT IGNORE INTO jobs (company_id, title, min_cgpa, max_backlogs, salary, deadline) VALUES ?";

    db.query(insertSql, [values], (insertErr) => {
      if (insertErr) return callback(insertErr);
      callback(null);
    });
  });
};

exports.getJobs = (req, res) => {
  ensureJobs((ensureErr) => {
    if (ensureErr) return res.status(500).json(ensureErr);

    const maxLimit = 100;
    let limit = parseInt(req.query.limit, 10);

    if (isNaN(limit) || limit <= 0) {
      limit = maxLimit;
    }

    if (limit > maxLimit) {
      limit = maxLimit;
    }

    const sql = `
      SELECT jobs.*, companies.name AS company_name
      FROM jobs
      JOIN companies ON jobs.company_id = companies.company_id
      ORDER BY RAND()
      LIMIT ?
    `;

    db.query(sql, [limit], (err, results) => {
      if (err) return res.status(500).json(err);

      res.json(results);
    });
  });
};