const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { addJob, getJobs } = require("../controllers/jobController");

router.post("/", authMiddleware, adminMiddleware, addJob);
router.get("/", getJobs);

module.exports = router;
