const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { addJob, getJobs } = require("../controllers/jobController");

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, addJob);
router.get("/", getJobs);

module.exports = router;
