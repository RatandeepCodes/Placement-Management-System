const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { addCompany, getCompanies } = require("../controllers/companyController");

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, addCompany);
router.get("/", getCompanies);

module.exports = router;
