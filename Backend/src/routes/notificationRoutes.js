const express = require("express");
const router = express.Router();

const { createNotification, getNotifications, deleteNotification } = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

router.get("/", getNotifications);
router.post("/", protect, isAdmin, createNotification);
router.delete("/:id", protect, isAdmin, deleteNotification);

module.exports = router;
