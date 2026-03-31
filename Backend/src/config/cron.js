// src/config/cron.js

const cron = require("node-cron");

// Example: runs every day at midnight
const initCronJobs = () => {
  cron.schedule("0 0 * * *", () => {
    console.log("🕛 Running daily maintenance tasks...");
    // Future: cleanup logs, notifications, etc.
  });
};

module.exports = initCronJobs;