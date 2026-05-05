
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPassword = String(password);
    const allowedRoles = ["student", "admin"];

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (normalizedPassword.length < 8 || normalizedPassword.length > 15) {
      return res.status(400).json({ message: "Password must be between 8 and 15 characters" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

    const sql = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";

    db.query(sql, [normalizedEmail, hashedPassword, role], (err, result) => {
      if (err) {
        console.error("Register error:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "An account with this email already exists" });
        }
        return res.status(500).json({ message: "Register failed" });
      }

      res.json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error("Register exception:", error);
    res.status(500).json({ message: "Register failed" });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [normalizedEmail], async (err, results) => {
      if (err) {
        console.error("Login query error:", err);
        return res.status(500).json({ message: err.code ? err.code : "Login failed" });
      }

      if (results.length === 0)
        return res.status(401).json({ message: "User not found" });

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: user.user_id, role: user.role },
        "secretkey",
        { expiresIn: "1d" }
      );

      res.json({ token });
    });
  } catch (error) {
    console.error("Login exception:", error);
    res.status(500).json({ message: "Login failed" });
  }
};
