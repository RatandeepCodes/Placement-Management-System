const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getDashboard,
  getStudents,
  getCompanies,
  createCompany,
  getJobs,
  createJob,
  getApplications,
  updateApplicationStatus,
  getPlacements,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/dashboard", getDashboard);
router.get("/students", getStudents);
router.get("/companies", getCompanies);
router.post("/companies", createCompany);
router.get("/jobs", getJobs);
router.post("/jobs", createJob);
router.get("/applications", getApplications);
router.patch("/applications/:id/status", updateApplicationStatus);
router.get("/placements", getPlacements);

module.exports = router;
