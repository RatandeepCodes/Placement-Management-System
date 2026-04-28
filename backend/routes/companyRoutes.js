const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { addCompany, getCompanies } = require("../controllers/companyController");

router.post("/", authMiddleware, adminMiddleware, addCompany);
router.get("/", getCompanies);

module.exports = router;
