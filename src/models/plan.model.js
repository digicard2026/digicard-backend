// models/Plan.model.js
const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, enum: ["personal", "business", "business premium"] },
    duration: { type: String, required: true, enum: ["monthly", "six_months", "yearly"] },
    durationDays: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

// module.exports = mongoose.model("Plan", PlanSchema);
module.exports = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
