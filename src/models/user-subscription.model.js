// models/user-subscription.model.js
const mongoose = require("mongoose");

const UserSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: false
    },

    // Kept for backward compatibility with existing routes
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: false,
    },

    planName: {
      type: String,
      default: "Personal"
    },

    planCategory: {
      type: String,
      default: "personal"
    },

    duration: {
      type: String,
      enum: ["monthly", "six_months", "yearly"],
      default: "monthly"
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    endDate: {
      type: Date,
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "free_trial"],
      default: "free_trial"
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "active",
      index: true
    },

    amountPaid: {
      type: Number,
      default: 0
    },

    paymentId: {
      type: String,
      default: null
    },

    razorpayOrderId: {
      type: String,
      default: null
    },

    razorpaySignature: {
      type: String,
      default: null
    },

    // Consolidated Addon Entitlements
    purchasedAddons: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],

    unlockedFields: [
      {
        type: String,
        trim: true
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.models.UserSubscription || mongoose.model("UserSubscription", UserSubscriptionSchema);