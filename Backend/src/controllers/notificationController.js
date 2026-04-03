const Notification = require("../models/Notification");
const AdminLog = require("../models/AdminLog");
const mongoose = require("mongoose");

const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ message: "Title and message are required" });
    }

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
    });

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Created notification: ${title}`,
      });
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.deleteOne();

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Deleted notification: ${notification.title}`,
      });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNotification, getNotifications, deleteNotification };
