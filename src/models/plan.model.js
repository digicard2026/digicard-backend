const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    displayName: { 
      type: String, 
      trim: true 
    },
    category: { 
      type: String, 
      required: true, 
      lowercase: true,
      trim: true 
    },
    categoryGroup: {
      type: String,
      enum: ["individual", "business", "enterprise"],
      default: "individual"
    },
    description: { 
      type: String 
    },
    badge: { 
      type: String, 
      default: null 
    },
    duration: { 
      type: String, 
      required: true, 
      enum: ["monthly", "six_months", "yearly"],
      default: "monthly"
    },
    durationDays: { 
      type: Number, 
      required: true,
      default: 30 
    },
    price: { 
      type: Number, 
      required: true 
    },
    monthlyPrice: {
      type: Number
    },
    yearlyPrice: {
      type: Number
    },
    requiredFields: [
      { type: String }
    ],
    allowedFields: [
      { type: String }
    ],
    features: [
      { type: String }
    ],
    availableAddons: [
      { type: String }
    ],
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Indexes for fast lookup by category, duration, and name
PlanSchema.index({ category: 1, duration: 1 });
PlanSchema.index({ name: 1, duration: 1 });

module.exports = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);
