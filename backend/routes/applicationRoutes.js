const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { applyJob, getApplications, updateApplicationStatus } = require("../controllers/applicationController");

const router = express.Router();

router.post("/apply", authMiddleware, applyJob);
router.get("/", authMiddleware, getApplications);
router.put("/:id", authMiddleware, adminMiddleware, updateApplicationStatus);

module.exports = router;
