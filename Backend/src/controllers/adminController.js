const mongoose = require("mongoose");
const User = require("../models/User");
const AdminLog = require("../models/AdminLog");
const Vehicle = require("../models/Vehicle");
const Review = require("../models/Review");
const Favorite = require("../models/Favorite");
const Comparison = require("../models/Comparison");
const Notification = require("../models/Notification");
const Accessory = require("../models/Accessory");

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .sort({ created_at: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot block an admin" });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    user.isBlocked = true;
    await user.save();

    await AdminLog.create({
      admin_id: req.user._id,
      action: `Blocked user: ${user.email}`,
    });
    res.json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();

    await AdminLog.create({
      admin_id: req.user._id,
      action: `Unblocked user: ${user.email}`,
    });
    res.json({ message: "User unblocked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot delete an admin" });
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await user.deleteOne();

    await AdminLog.create({
      admin_id: req.user._id,
      action: `Deleted user: ${user.email}`,
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [
      users,
      admins,
      blockedUsers,
      vehicles,
      reviews,
      favorites,
      comparisons,
      notifications,
      accessories,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isBlocked: true }),
      Vehicle.countDocuments(),
      Review.countDocuments(),
      Favorite.countDocuments(),
      Comparison.countDocuments(),
      Notification.countDocuments(),
      Accessory.countDocuments(),
    ]);

    return res.json({
      users,
      admins,
      blockedUsers,
      vehicles,
      reviews,
      favorites,
      comparisons,
      notifications,
      accessories,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminLogs = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AdminLog.find()
        .populate("admin_id", "name email")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      AdminLog.countDocuments(),
    ]);

    return res.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getAnalytics,
  getAdminLogs,
};
