const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { addJob, getJobs } = require("../controllers/jobController");

router.post("/", authMiddleware, adminMiddleware, addJob);
router.get("/", getJobs);

module.exports = router;
=======
const { addJob, getJobs } = require("../controllers/jobController");

router.post("/", addJob);
router.get("/", getJobs);

module.exports = router;
>>>>>>> 83320e1 (Backend)
