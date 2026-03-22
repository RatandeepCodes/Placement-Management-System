const express = require("express");
const router = express.Router();
const { applyJob, getApplications } = require("../controllers/applicationController");
const { updateApplicationStatus } = require("../controllers/applicationController");

router.post("/apply", applyJob);
router.get("/", getApplications);
router.put("/:id", updateApplicationStatus);

module.exports = router;

