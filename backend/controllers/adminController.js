const db = require("../config/db");

const VALID_APPLICATION_STATUSES = new Set([
  "Applied",
  "Shortlisted",
  "Interview",
  "Selected",
  "Placed",
  "Rejected",
]);

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(results);
    });
  });

const toNumber = (value) => Number(value || 0);

const sendServerError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({ message: "Internal server error" });
};

exports.getDashboard = async (req, res) => {
  try {
    const [summaryRows, recentApplicationRows, topCompanyRows] = await Promise.all([
      runQuery(`
        SELECT
          (SELECT COUNT(*) FROM students) AS students,
          (SELECT COUNT(*) FROM companies) AS companies,
          (SELECT COUNT(*) FROM jobs) AS total_jobs,
          (SELECT COUNT(*) FROM jobs WHERE deadline IS NOT NULL AND deadline >= NOW()) AS active_jobs,
          (SELECT COUNT(*) FROM applications) AS total_applications,
          (SELECT COUNT(*) FROM applications WHERE status IN ('Shortlisted', 'Interview')) AS shortlisted_applications,
          (SELECT COUNT(*) FROM applications WHERE status IN ('Selected', 'Placed')) AS placed_applications,
          (SELECT COUNT(DISTINCT student_id) FROM applications WHERE status IN ('Selected', 'Placed')) AS placed_students
      `),
      runQuery(`
        SELECT
          a.application_id,
          a.status,
          a.applied_date,
          s.student_id,
          COALESCE(a.student_name, s.name) AS student_name,
          s.branch,
          j.job_id,
          j.title AS job_title,
          c.company_id,
          c.name AS company_name
        FROM applications AS a
        JOIN students AS s ON s.student_id = a.student_id
        JOIN jobs AS j ON j.job_id = a.job_id
        JOIN companies AS c ON c.company_id = j.company_id
        ORDER BY a.application_id DESC
        LIMIT 8
      `),
      runQuery(`
        SELECT
          c.company_id,
          c.name AS company_name,
          COUNT(a.application_id) AS application_count,
          SUM(CASE WHEN a.status IN ('Selected', 'Placed') THEN 1 ELSE 0 END) AS placed_count
        FROM companies AS c
        LEFT JOIN jobs AS j ON j.company_id = c.company_id
        LEFT JOIN applications AS a ON a.job_id = j.job_id
        GROUP BY c.company_id, c.name
        HAVING COUNT(a.application_id) > 0
        ORDER BY application_count DESC, placed_count DESC, c.name ASC
        LIMIT 5
      `),
    ]);

    const summaryRow = summaryRows[0] || {};
    const totalStudents = toNumber(summaryRow.students);
    const placedStudents = toNumber(summaryRow.placed_students);

    res.json({
      summary: {
        totalStudents,
        totalCompanies: toNumber(summaryRow.companies),
        totalJobs: toNumber(summaryRow.total_jobs),
        activeJobs: toNumber(summaryRow.active_jobs),
        totalApplications: toNumber(summaryRow.total_applications),
        shortlistedApplications: toNumber(summaryRow.shortlisted_applications),
        placedApplications: toNumber(summaryRow.placed_applications),
        placedStudents,
        placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
      },
      recentApplications: recentApplicationRows.map((row) => ({
        applicationId: row.application_id,
        status: row.status,
        appliedDate: row.applied_date,
        studentId: row.student_id,
        studentName: row.student_name,
        branch: row.branch,
        jobId: row.job_id,
        jobTitle: row.job_title,
        companyId: row.company_id,
        companyName: row.company_name,
      })),
      topCompanies: topCompanyRows.map((row) => ({
        companyId: row.company_id,
        companyName: row.company_name,
        applicationCount: toNumber(row.application_count),
        placedCount: toNumber(row.placed_count),
      })),
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to load admin dashboard:");
  }
};

exports.getStudents = async (req, res) => {
  try {
    const studentRows = await runQuery(`
      SELECT
        s.student_id,
        s.user_id,
        u.email,
        s.name,
        s.roll_no,
        s.branch,
        s.year,
        s.cgpa,
        s.backlogs,
        s.phone,
        s.about,
        s.resume_filename,
        COUNT(a.application_id) AS application_count,
        SUM(CASE WHEN a.status IN ('Shortlisted', 'Interview') THEN 1 ELSE 0 END) AS shortlisted_count,
        SUM(CASE WHEN a.status IN ('Selected', 'Placed') THEN 1 ELSE 0 END) AS placed_count,
        MAX(a.applied_date) AS last_applied_date
      FROM students AS s
      JOIN users AS u ON u.user_id = s.user_id
      LEFT JOIN applications AS a ON a.student_id = s.student_id
      GROUP BY
        s.student_id,
        s.user_id,
        u.email,
        s.name,
        s.roll_no,
        s.branch,
        s.year,
        s.cgpa,
        s.backlogs,
        s.phone,
        s.about,
        s.resume_filename
      ORDER BY s.name ASC
    `);

    res.json(
      studentRows.map((row) => {
        const applicationCount = toNumber(row.application_count);
        const placedCount = toNumber(row.placed_count);

        return {
          studentId: row.student_id,
          userId: row.user_id,
          name: row.name,
          email: row.email,
          rollNo: row.roll_no,
          branch: row.branch,
          year: row.year,
          cgpa: Number(row.cgpa || 0),
          backlogs: toNumber(row.backlogs),
          phone: row.phone,
          about: row.about,
          resumeFilename: row.resume_filename,
          hasResume: Boolean(row.resume_filename),
          applicationCount,
          shortlistedCount: toNumber(row.shortlisted_count),
          placedCount,
          lastAppliedDate: row.last_applied_date,
          placementStatus:
            placedCount > 0 ? "Placed" : applicationCount > 0 ? "In Process" : "Not Applied",
        };
      }),
    );
  } catch (error) {
    return sendServerError(res, error, "Failed to load admin students:");
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companyRows = await runQuery(`
      SELECT
        c.company_id,
        c.name,
        c.industry,
        c.location,
        c.hr_email,
        COUNT(DISTINCT j.job_id) AS job_count,
        COUNT(DISTINCT CASE WHEN j.deadline IS NOT NULL AND j.deadline >= NOW() THEN j.job_id END) AS active_job_count,
        COUNT(a.application_id) AS application_count,
        SUM(CASE WHEN a.status IN ('Selected', 'Placed') THEN 1 ELSE 0 END) AS placed_count
      FROM companies AS c
      LEFT JOIN jobs AS j ON j.company_id = c.company_id
      LEFT JOIN applications AS a ON a.job_id = j.job_id
      GROUP BY c.company_id, c.name, c.industry, c.location, c.hr_email
      ORDER BY c.name ASC
    `);

    res.json(
      companyRows.map((row) => ({
        companyId: row.company_id,
        name: row.name,
        industry: row.industry,
        location: row.location,
        hrEmail: row.hr_email,
        jobCount: toNumber(row.job_count),
        activeJobCount: toNumber(row.active_job_count),
        applicationCount: toNumber(row.application_count),
        placedCount: toNumber(row.placed_count),
      })),
    );
  } catch (error) {
    return sendServerError(res, error, "Failed to load admin companies:");
  }
};

exports.createCompany = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const industry = String(req.body.industry || "").trim();
    const location = String(req.body.location || "").trim();
    const hrEmail = String(req.body.hrEmail || req.body.hr_email || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const duplicateRows = await runQuery(
      "SELECT company_id FROM companies WHERE LOWER(name) = LOWER(?) LIMIT 1",
      [name],
    );

    if (duplicateRows.length > 0) {
      return res.status(409).json({ message: "A company with this name already exists" });
    }

    const result = await runQuery(
      `
        INSERT INTO companies (name, industry, location, hr_email)
        VALUES (?, ?, ?, ?)
      `,
      [name, industry || null, location || null, hrEmail || null],
    );

    return res.status(201).json({
      message: "Company created successfully",
      companyId: result.insertId,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to create admin company:");
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobRows = await runQuery(`
      SELECT
        j.job_id,
        j.company_id,
        c.name AS company_name,
        j.title,
        j.min_cgpa,
        j.max_backlogs,
        j.salary,
        j.deadline,
        COUNT(a.application_id) AS application_count,
        SUM(CASE WHEN a.status IN ('Shortlisted', 'Interview') THEN 1 ELSE 0 END) AS shortlisted_count,
        SUM(CASE WHEN a.status IN ('Selected', 'Placed') THEN 1 ELSE 0 END) AS placed_count
      FROM jobs AS j
      JOIN companies AS c ON c.company_id = j.company_id
      LEFT JOIN applications AS a ON a.job_id = j.job_id
      GROUP BY
        j.job_id,
        j.company_id,
        c.name,
        j.title,
        j.min_cgpa,
        j.max_backlogs,
        j.salary,
        j.deadline
      ORDER BY
        CASE WHEN j.deadline IS NULL THEN 1 ELSE 0 END ASC,
        j.deadline DESC,
        j.job_id DESC
    `);

    res.json(
      jobRows.map((row) => ({
        jobId: row.job_id,
        companyId: row.company_id,
        companyName: row.company_name,
        title: row.title,
        minCgpa: Number(row.min_cgpa || 0),
        maxBacklogs: toNumber(row.max_backlogs),
        salary: row.salary,
        deadline: row.deadline,
        applicationCount: toNumber(row.application_count),
        shortlistedCount: toNumber(row.shortlisted_count),
        placedCount: toNumber(row.placed_count),
      })),
    );
  } catch (error) {
    return sendServerError(res, error, "Failed to load admin jobs:");
  }
};

exports.createJob = async (req, res) => {
  try {
    const companyId = Number(req.body.companyId || req.body.company_id);
    const title = String(req.body.title || "").trim();
    const minCgpa = Number(req.body.minCgpa ?? req.body.min_cgpa ?? 0);
    const maxBacklogs = Number(req.body.maxBacklogs ?? req.body.max_backlogs ?? 0);
    const salary = String(req.body.salary || "").trim();
    const deadline = req.body.deadline;

    if (!companyId || !title || !deadline) {
      return res.status(400).json({ message: "Company, title, and deadline are required" });
    }

    const parsedDeadline = new Date(deadline);
    if (Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: "Deadline must be a valid date/time" });
    }

    const companyRows = await runQuery(
      "SELECT company_id FROM companies WHERE company_id = ? LIMIT 1",
      [companyId],
    );

    if (companyRows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    const result = await runQuery(
      `
        INSERT INTO jobs (company_id, title, min_cgpa, max_backlogs, salary, deadline)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [companyId, title, minCgpa, maxBacklogs, salary || null, deadline],
    );

    return res.status(201).json({
      message: "Job created successfully",
      jobId: result.insertId,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to create admin job:");
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applicationRows = await runQuery(`
      SELECT
        a.application_id,
        a.status,
        a.applied_date,
        s.student_id,
        COALESCE(a.student_name, s.name) AS student_name,
        s.roll_no,
        s.branch,
        s.year,
        s.cgpa,
        s.backlogs,
        s.phone,
        s.resume_filename,
        u.email AS student_email,
        j.job_id,
        j.title AS job_title,
        j.min_cgpa,
        j.max_backlogs,
        j.salary,
        j.deadline,
        c.company_id,
        c.name AS company_name
      FROM applications AS a
      JOIN students AS s ON s.student_id = a.student_id
      JOIN users AS u ON u.user_id = s.user_id
      JOIN jobs AS j ON j.job_id = a.job_id
      JOIN companies AS c ON c.company_id = j.company_id
      ORDER BY a.application_id DESC
    `);

    res.json(
      applicationRows.map((row) => ({
        applicationId: row.application_id,
        status: row.status,
        appliedDate: row.applied_date,
        studentId: row.student_id,
        studentName: row.student_name,
        studentEmail: row.student_email,
        rollNo: row.roll_no,
        branch: row.branch,
        year: row.year,
        cgpa: Number(row.cgpa || 0),
        backlogs: toNumber(row.backlogs),
        phone: row.phone,
        hasResume: Boolean(row.resume_filename),
        resumeFilename: row.resume_filename,
        jobId: row.job_id,
        jobTitle: row.job_title,
        minCgpa: Number(row.min_cgpa || 0),
        maxBacklogs: toNumber(row.max_backlogs),
        salary: row.salary,
        deadline: row.deadline,
        companyId: row.company_id,
        companyName: row.company_name,
        eligibilityStatus:
          Number(row.cgpa || 0) >= Number(row.min_cgpa || 0) &&
          toNumber(row.backlogs) <= toNumber(row.max_backlogs)
            ? "Eligible"
            : "Ineligible",
      })),
    );
  } catch (error) {
    return sendServerError(res, error, "Failed to load admin applications:");
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const status = String(req.body.status || "").trim();

    if (!applicationId) {
      return res.status(400).json({ message: "Application id is required" });
    }

    if (!VALID_APPLICATION_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    const result = await runQuery(
      `
        UPDATE applications
        SET status = ?
        WHERE application_id = ?
      `,
      [status, applicationId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json({ message: "Application status updated successfully" });
  } catch (error) {
    return sendServerError(res, error, "Failed to update admin application status:");
  }
};

exports.getPlacements = async (req, res) => {
  try {
    const [summaryRows, placementRows, companyRows, branchRows] = await Promise.all([
      runQuery(`
        SELECT
          (SELECT COUNT(*) FROM students) AS total_students,
          COUNT(*) AS placement_records,
          COUNT(DISTINCT a.student_id) AS placed_students,
          SUM(CASE WHEN a.status = 'Selected' THEN 1 ELSE 0 END) AS selected_count,
          SUM(CASE WHEN a.status = 'Placed' THEN 1 ELSE 0 END) AS placed_count
        FROM applications AS a
        WHERE a.status IN ('Selected', 'Placed')
      `),
      runQuery(`
        SELECT
          a.application_id,
          a.status,
          a.applied_date,
          s.student_id,
          COALESCE(a.student_name, s.name) AS student_name,
          s.roll_no,
          s.branch,
          s.year,
          j.job_id,
          j.title AS job_title,
          c.company_id,
          c.name AS company_name,
          j.salary
        FROM applications AS a
        JOIN students AS s ON s.student_id = a.student_id
        JOIN jobs AS j ON j.job_id = a.job_id
        JOIN companies AS c ON c.company_id = j.company_id
        WHERE a.status IN ('Selected', 'Placed')
        ORDER BY a.application_id DESC
      `),
      runQuery(`
        SELECT
          c.company_id,
          c.name AS company_name,
          COUNT(*) AS placed_count
        FROM applications AS a
        JOIN jobs AS j ON j.job_id = a.job_id
        JOIN companies AS c ON c.company_id = j.company_id
        WHERE a.status IN ('Selected', 'Placed')
        GROUP BY c.company_id, c.name
        ORDER BY placed_count DESC, c.name ASC
      `),
      runQuery(`
        SELECT
          s.branch,
          COUNT(DISTINCT a.student_id) AS placed_students
        FROM applications AS a
        JOIN students AS s ON s.student_id = a.student_id
        WHERE a.status IN ('Selected', 'Placed')
        GROUP BY s.branch
        ORDER BY placed_students DESC, s.branch ASC
      `),
    ]);

    const summaryRow = summaryRows[0] || {};
    const totalStudents = toNumber(summaryRow.total_students);
    const placedStudents = toNumber(summaryRow.placed_students);

    res.json({
      summary: {
        totalStudents,
        placementRecords: toNumber(summaryRow.placement_records),
        placedStudents,
        selectedCount: toNumber(summaryRow.selected_count),
        placedCount: toNumber(summaryRow.placed_count),
        placementRate: totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0,
      },
      placements: placementRows.map((row) => ({
        applicationId: row.application_id,
        status: row.status,
        appliedDate: row.applied_date,
        studentId: row.student_id,
        studentName: row.student_name,
        rollNo: row.roll_no,
        branch: row.branch,
        year: row.year,
        jobId: row.job_id,
        jobTitle: row.job_title,
        companyId: row.company_id,
        companyName: row.company_name,
        salary: row.salary,
      })),
      companyBreakdown: companyRows.map((row) => ({
        companyId: row.company_id,
        companyName: row.company_name,
        placedCount: toNumber(row.placed_count),
      })),
      branchBreakdown: branchRows.map((row) => ({
        branch: row.branch || "Not specified",
        placedStudents: toNumber(row.placed_students),
      })),
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to load admin placements:");
  }
};
