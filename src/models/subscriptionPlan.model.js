const mongoose = require("mongoose");

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },

    selectedPrice: { type: Number, required: true },
    selectedDurationDays: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "cancelled", "completed"],
      default: "pending",
    },
     razorpayOrderId: { type: String }, // Razorpay order ID
    paymentStatus: { 
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },
    transactionId: { type: String }, // Razorpay payment ID
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
