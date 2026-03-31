// src/routes/adminRoutes.js

const express = require("express");
const router = express.Router();

const {
  getUsers,
  blockUser,
  getAnalytics,
  getAdminLogs
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// All admin routes MUST be protected
router.get("/users", protect, isAdmin, getUsers);
router.put("/block/:id", protect, isAdmin, blockUser);
router.get("/analytics", protect, isAdmin, getAnalytics);
router.get("/logs", protect, isAdmin, getAdminLogs);

module.exports = router;