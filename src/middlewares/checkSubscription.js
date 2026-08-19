const mongoose = require("mongoose");
const UserSubscription = require("../models/user-subscription.model");

const checkSubscription = async (req, res, next) => {
  try {
    // userId available because of "auth" middleware
    const userId = req.user.id;

    console.log("USER ID FROM TOKEN:", userId);

    if (!userId) {
      return res.status(400).json({
        message: "User ID not found in token."
      });
    }

    // Find user's latest subscription
    const latestSub = await UserSubscription.findOne({ userId })
      .sort({ createdAt: -1 });

    // If no subscription found → new user → allow 7-day trial
    if (!latestSub) {
      return res.status(200).json({
        allow: true,
        popup: false,
        message: "Free trial active for new user."
      });
    }

    const now = new Date();

    // Check expiry
    if (now > latestSub.endDate) {
      return res.status(403).json({
        allow: false,
        popup: true,
        message: "Your free trial has ended. Please purchase a subscription."
      });
    }

    // Subscription valid → continue
    next();
  } catch (err) {
    console.log("checkSubscription error:", err);
    res.status(500).json({
      message: "Subscription verification failed."
    });
  }
};

module.exports = checkSubscription;
