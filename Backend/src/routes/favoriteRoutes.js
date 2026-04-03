const express = require("express");
const router = express.Router();

const { addFavorite, getFavorites, removeFavorite } = require("../controllers/favoriteController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, addFavorite);
router.get("/", protect, getFavorites);
router.get("/user/:userId", protect, getFavorites);
router.delete("/:id", protect, removeFavorite);

module.exports = router;
