const mongoose = require("mongoose");

const accessorySchema = new mongoose.Schema(
  {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String
    }
  }
);

module.exports = mongoose.model("Accessory", accessorySchema);