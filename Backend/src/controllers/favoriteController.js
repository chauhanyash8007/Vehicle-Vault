// src/controllers/favoriteController.js

const Favorite = require("../models/Favorite");

const addFavorite = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    const favorite = await Favorite.create({
      user_id: req.user._id,
      vehicle_id
    });

    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const isAdmin = req.user.role === "admin";

    if (requestedUserId && !isAdmin && requestedUserId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view these favorites" });
    }

    const targetUserId = requestedUserId || req.user._id;

    const favorites = await Favorite.find({
      user_id: targetUserId
    }).populate("vehicle_id");

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addFavorite, getFavorites };