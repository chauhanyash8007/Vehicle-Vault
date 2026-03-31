// src/middleware/adminMiddleware.js

const isAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Admin access only" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Authorization error" });
  }
};

module.exports = isAdmin;