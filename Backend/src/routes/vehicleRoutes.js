const express = require("express");
const router = express.Router();

const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleRecommendations,
} = require("../controllers/vehicleController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const upload = require("../utils/upload");

// Public
router.get("/", getVehicles);
router.get("/:id/recommendations", getVehicleRecommendations);
router.get("/:id", getVehicleById);

// Admin only
router.post("/", protect, isAdmin, upload.array("images", 5), createVehicle);
router.put("/:id", protect, isAdmin, upload.array("images", 5), updateVehicle);
router.delete("/:id", protect, isAdmin, deleteVehicle);

module.exports = router;
