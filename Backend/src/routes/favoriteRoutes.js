// src/routes/favoriteRoutes.js

const express = require("express");
const router = express.Router();

const {
  addFavorite,
  getFavorites
} = require("../controllers/favoriteController");

const protect = require("../middleware/authMiddleware");

// All favorites are user-specific → must be protected
router.post("/", protect, addFavorite);
router.get("/", protect, getFavorites);
router.get("/:userId", protect, getFavorites);

module.exports = router;