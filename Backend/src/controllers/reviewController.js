// src/controllers/reviewController.js

const Review = require("../models/Review");

const addReview = async (req, res) => {
  try {
    const { vehicle_id, rating, comment } = req.body;

    //  Prevent duplicate reviews
    const existingReview = await Review.findOne({
      user_id: req.user._id,
      vehicle_id
    });

    if (existingReview) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    const review = await Review.create({
      user_id: req.user._id,
      vehicle_id,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    res.status(500).json({ message: error.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      vehicle_id: req.params.vehicleId
    }).populate("user_id", "name");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
  getReviews
};