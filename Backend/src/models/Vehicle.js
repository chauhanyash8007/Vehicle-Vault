const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    fuel_type: { type: String, required: true, trim: true },
    mileage: { type: Number, required: true, min: 0 },
    engine: { type: String, trim: true },
    transmission: { type: String, trim: true },
    features: [{ type: String }],
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    images: [{ type: String }],
  },
  { timestamps: true },
);

vehicleSchema.index({ brand: 1 });
vehicleSchema.index({ fuel_type: 1 });
vehicleSchema.index({ transmission: 1 });
vehicleSchema.index({ price: 1 });
vehicleSchema.index({ mileage: 1 });
vehicleSchema.index({ name: "text", brand: "text", engine: "text" });

module.exports = mongoose.model("Vehicle", vehicleSchema);
