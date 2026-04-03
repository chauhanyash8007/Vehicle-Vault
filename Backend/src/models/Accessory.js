const mongoose = require("mongoose");

const accessorySchema = new mongoose.Schema(
  {
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Accessory", accessorySchema);
