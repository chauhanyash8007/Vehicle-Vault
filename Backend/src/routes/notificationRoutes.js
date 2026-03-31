// src/routes/notificationRoutes.js

const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// Admin only
router.post("/", protect, isAdmin, createNotification);

// Public (users can see notifications)
router.get("/", getNotifications);

module.exports = router;