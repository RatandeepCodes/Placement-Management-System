const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { createStudent, getStudent, getAllStudents, updateStudent } = require("../controllers/studentController");

router.post("/", authMiddleware, createStudent);
router.get("/", authMiddleware, getAllStudents);
router.get("/profile", authMiddleware, getStudent);
router.put("/profile", authMiddleware, updateStudent);

module.exports = router;