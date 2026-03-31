// src/routes/userRoutes.js

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
} = require("../controllers/userController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;