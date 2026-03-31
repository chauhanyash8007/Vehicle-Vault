// src/routes/compareRoutes.js

const express = require("express");
const router = express.Router();

const {
  compareVehicles,
  getComparisonById
} = require("../controllers/compareController");

const protect = require("../middleware/authMiddleware");

// Protected (user must login)
router.post("/", protect, compareVehicles);
router.get("/:id", protect, getComparisonById);

module.exports = router;