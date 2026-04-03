const express = require("express");
const router = express.Router();

const {
  createAccessory,
  getAccessories,
  deleteAccessory,
} = require("../controllers/accessoryController");
const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// Admin: create
router.post("/", protect, isAdmin, createAccessory);

// Public: get accessories for a vehicle
router.get("/:vehicleId", getAccessories);

// Admin: delete
router.delete("/:id", protect, isAdmin, deleteAccessory);

module.exports = router;
