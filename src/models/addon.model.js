const mongoose = require("mongoose");

const AddonSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: true
    },
    billingType: {
      type: String,
      enum: ["monthly", "yearly", "one-time"],
      default: "monthly"
    },
    unlockedFields: [
      { type: String }
    ],
    quotaGrants: {
      galleryMaxCount: { type: Number, default: 0 },
      docsMaxCount: { type: Number, default: 0 },
      videosMaxCount: { type: Number, default: 0 },
      nfcCardIncluded: { type: Boolean, default: false },
      customQuota: { type: Map, of: Number, default: {} }
    },
    applicablePlans: [
      { type: String }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Addon || mongoose.model("Addon", AddonSchema);
