// src/routes/accessoryRoutes.js

const express = require("express");
const router = express.Router();

const {
  createAccessory,
  getAccessories
} = require("../controllers/accessoryController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// Admin only
router.post("/", protect, isAdmin, createAccessory);

// Public
router.get("/:vehicleId", getAccessories);

module.exports = router;