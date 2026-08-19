// models/UserSubscription.model.js
const mongoose = require("mongoose");

const UserSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: false },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: false,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    paymentId: { type: String }, // Razorpay/Stripe ID
    amountPaid: { type: Number, required: true },

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
      // ADD THESE 2 FIELDS:
    razorpayOrderId: { type: String }, // Same as in SubscriptionPlan
    razorpaySignature: { type: String }, // Payment verification signature
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSubscription", UserSubscriptionSchema);