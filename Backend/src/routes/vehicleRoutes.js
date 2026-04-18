const express = require("express");
const router = express.Router();

const {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleRecommendations,
  getAIRecommendations,
  getAutocomplete,
} = require("../controllers/vehicleController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const upload = require("../utils/upload");

// Public — specific routes BEFORE /:id
router.get("/autocomplete", getAutocomplete);
router.get("/", getVehicles);
router.get("/:id/recommendations", getVehicleRecommendations);
router.get("/:id/ai-recommendations", getAIRecommendations);
router.get("/:id", getVehicleById);

// Admin only
router.post("/", protect, isAdmin, upload.array("images", 5), createVehicle);
router.put("/:id", protect, isAdmin, upload.array("images", 5), updateVehicle);
router.delete("/:id", protect, isAdmin, deleteVehicle);

module.exports = router;
