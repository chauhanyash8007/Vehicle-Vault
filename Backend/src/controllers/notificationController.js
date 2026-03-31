// src/controllers/notificationController.js

const Notification = require("../models/Notification");
const AdminLog = require("../models/AdminLog");

const createNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    const notification = await Notification.create({ title, message });

    if (req.user?._id) {
      await AdminLog.create({
        admin_id: req.user._id,
        action: `Created notification: ${title}`
      });
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createNotification, getNotifications };