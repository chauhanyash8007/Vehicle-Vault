const Review = require("../models/Review");
const mongoose = require("mongoose");

const addReview = async (req, res) => {
  try {
    const { vehicle_id, rating, comment } = req.body;

    if (!vehicle_id || rating === undefined || rating === null) {
      return res
        .status(400)
        .json({ message: "vehicle_id and rating are required" });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicle_id)) {
      return res.status(400).json({ message: "Invalid vehicle_id" });
    }

    const existingReview = await Review.findOne({
      user_id: req.user._id,
      vehicle_id,
    });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this vehicle" });
    }

    const review = await Review.create({
      user_id: req.user._id,
      vehicle_id,
      rating: numRating,
      comment: comment?.trim() || "",
    });

    const populated = await review.populate("user_id", "name");
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this vehicle" });
    }
    res.status(500).json({ message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const reviews = await Review.find({ vehicle_id: vehicleId })
      .populate("user_id", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const isOwner = review.user_id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addReview, getReviews, deleteReview };
