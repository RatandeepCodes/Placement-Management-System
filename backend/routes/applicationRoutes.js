const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { applyJob, getApplications } = require("../controllers/applicationController");
const { updateApplicationStatus } = require("../controllers/applicationController");

router.post("/apply", authMiddleware, applyJob);
router.get("/", authMiddleware, getApplications);
router.put("/:id", authMiddleware, adminMiddleware, updateApplicationStatus);

module.exports = router;
