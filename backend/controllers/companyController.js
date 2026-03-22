const db = require("../config/db");

const fallbackCompanies = [
  { company_id: 1, name: "Google", industry: "Technology", location: "Mountain View, CA", hr_email: "hr@google.com" },
  { company_id: 2, name: "Microsoft", industry: "Technology", location: "Redmond, WA", hr_email: "hr@microsoft.com" },
  { company_id: 3, name: "Amazon", industry: "E-Commerce", location: "Seattle, WA", hr_email: "hr@amazon.com" },
  { company_id: 4, name: "Infosys", industry: "IT Services", location: "Bengaluru, India", hr_email: "hr@infosys.com" },
  { company_id: 5, name: "TCS", industry: "IT Services", location: "Mumbai, India", hr_email: "hr@tcs.com" },
  { company_id: 6, name: "Tesla", industry: "Automotive", location: "Palo Alto, CA", hr_email: "hr@tesla.com" },
  { company_id: 7, name: "Spotify", industry: "Entertainment", location: "Stockholm, Sweden", hr_email: "hr@spotify.com" },
  { company_id: 8, name: "Meta", industry: "Social Media", location: "Menlo Park, CA", hr_email: "hr@meta.com" },
  { company_id: 9, name: "Uber", industry: "Mobility", location: "San Francisco, CA", hr_email: "hr@uber.com" },
  { company_id: 10, name: "Adobe", industry: "Software", location: "San Jose, CA", hr_email: "hr@adobe.com" },
];

exports.addCompany = (req, res) => {
  const { name, industry, location, hr_email } = req.body;

  const sql = `
    INSERT INTO companies (name, industry, location, hr_email)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, industry, location, hr_email], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Company added successfully" });
  });
};

const ensureCompanies = (callback) => {
  const sql = "SELECT * FROM companies";
  db.query(sql, (err, results) => {
    if (err) return callback(err);

    if (Array.isArray(results) && results.length >= 5) {
      return callback(null, results);
    }

    const values = fallbackCompanies.map((company) => [company.company_id, company.name, company.industry, company.location, company.hr_email]);
    const insertSql = "INSERT IGNORE INTO companies (company_id, name, industry, location, hr_email) VALUES ?";

    db.query(insertSql, [values], (insertErr) => {
      if (insertErr) return callback(insertErr);

      db.query(sql, (readErr, readResults) => {
        if (readErr) return callback(readErr);
        callback(null, readResults);
      });
    });
  });
};

exports.getCompanies = (req, res) => {
  ensureCompanies((err, companies) => {
    if (err) return res.status(500).json(err);
    res.json(companies);
  });
};