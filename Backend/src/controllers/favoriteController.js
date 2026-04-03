const Favorite = require("../models/Favorite");
const mongoose = require("mongoose");

const addFavorite = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    if (!vehicle_id) {
      return res.status(400).json({ message: "vehicle_id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicle_id)) {
      return res.status(400).json({ message: "Invalid vehicle_id" });
    }

    const favorite = await Favorite.create({
      user_id: req.user._id,
      vehicle_id,
    });

    const populated = await favorite.populate("vehicle_id");
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Vehicle is already in your favorites" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const isAdmin = req.user.role === "admin";

    if (
      requestedUserId &&
      !isAdmin &&
      requestedUserId !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view these favorites" });
    }

    const targetUserId = requestedUserId || req.user._id;

    const favorites = await Favorite.find({ user_id: targetUserId })
      .populate("vehicle_id")
      .sort({ created_at: -1 });

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid favorite ID" });
    }

    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    const isOwner = favorite.user_id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to remove this favorite" });
    }

    await favorite.deleteOne();
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addFavorite, getFavorites, removeFavorite };
