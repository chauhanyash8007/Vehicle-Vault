const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  action: {
    type: String,
    required: true
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AdminLog", adminLogSchema);