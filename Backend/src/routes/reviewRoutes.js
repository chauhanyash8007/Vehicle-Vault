// src/routes/reviewRoutes.js

const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviews
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

// Add review → login required
router.post("/", protect, addReview);

// View reviews → public
router.get("/:vehicleId", getReviews);

module.exports = router;