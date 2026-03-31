const mongoose = require("mongoose");

const comparisonSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
      }
    ],

    result: {
      differences: [
        {
          field: String,
          values: [mongoose.Schema.Types.Mixed]
        }
      ],

      similarities: [
        {
          field: String,
          value: mongoose.Schema.Types.Mixed
        }
      ],

      advantages: [String],
      disadvantages: [String],

      summary: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comparison", comparisonSchema);