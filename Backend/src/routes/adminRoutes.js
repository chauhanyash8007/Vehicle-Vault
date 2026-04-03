const express = require("express");
const router = express.Router();

const {
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getAnalytics,
  getAdminLogs,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

router.get("/analytics", protect, isAdmin, getAnalytics);
router.get("/users", protect, isAdmin, getUsers);
router.get("/logs", protect, isAdmin, getAdminLogs);
router.put("/block/:id", protect, isAdmin, blockUser);
router.put("/unblock/:id", protect, isAdmin, unblockUser);
router.delete("/users/:id", protect, isAdmin, deleteUser);

module.exports = router;
