 const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic User Info (Signup)
    name: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
     isEmailVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    verificationTokenExpires: {
      type: Date,
      default: null,
    },
    phoneNumber: { type: String },

  
    role: {
      type: String,
      enum: ["admin", "franchise", "partner","customer",""],
      default: ""
    },

    
    // franchisePartner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "FranchisePartner",
    // },

    // Account Status
    isActive: { type: Boolean, default: true },
    registrationComplete: { type: Boolean, default: false },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "users",
  }
);
module.exports = mongoose.model("User", userSchema);
