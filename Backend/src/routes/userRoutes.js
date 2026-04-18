const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  registerUser, loginUser, forgotPassword, resetPassword,
  simpleResetPassword, getProfile, updateProfile, deleteAccount,
} = require("../controllers/userController");

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/reset-password-simple", simpleResetPassword);

// Protected
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteAccount);

module.exports = router;
