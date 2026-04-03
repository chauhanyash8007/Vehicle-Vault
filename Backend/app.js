// ================= IMPORTS =================
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// ================= CONFIG =================
const connectDB = require("./src/config/db");
const corsConfig = require("./src/config/cors");
const logger = require("./src/config/logger");
const initCronJobs = require("./src/config/cron");

// ================= MIDDLEWARE =================
const errorHandler = require("./src/middleware/errorMiddleware");

// ================= ROUTES =================
const userRoutes = require("./src/routes/userRoutes");
const vehicleRoutes = require("./src/routes/vehicleRoutes");
const compareRoutes = require("./src/routes/compareRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const favoriteRoutes = require("./src/routes/favoriteRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const accessoryRoutes = require("./src/routes/accessoryRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

// ================= APP INIT =================
const app = express();

// ================= SECURITY =================
app.use(helmet());

// ================= CORS =================
app.use(corsConfig);

// ================= BODY PARSING =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= COOKIES =================
app.use(cookieParser());

// ================= LOGGER =================
app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Vehicle Vault API is running 🚗",
  });
});

// ================= ROUTES =================
app.use("/api/auth", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/compare", compareRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/accessories", accessoryRoutes);
app.use("/api/admin", adminRoutes);

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  if (err.name === "MulterError") {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// ================= GLOBAL ERROR HANDLER =================
app.use(errorHandler);

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  initCronJobs();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
