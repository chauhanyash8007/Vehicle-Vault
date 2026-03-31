const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    brand: { type: String, required: true },

    price: { type: Number, required: true },

    fuel_type: { type: String, required: true },

    mileage: { type: Number, required: true },

    engine: { type: String },

    transmission: { type: String },

    features: [{ type: String }],

    specifications: {
      type: mongoose.Schema.Types.Mixed,
    },

    images: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
