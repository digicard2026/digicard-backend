const mongoose = require("mongoose");
const { checkUserSubscriptionActive } = require("../services/subscription-service");

const checkSubscription = async (req, res, next) => {
  try {
    // userId or email available from "auth" middleware or body/query
    const userId = req.user?.id || req.user?._id || req.body?.createdBy || req.body?.userId;
    const userEmail = req.user?.email || req.body?.email;

    const userIdentifier = userId || userEmail;

    if (!userIdentifier) {
      return res.status(400).json({
        allow: false,
        popup: true,
        message: "User authentication or identification required to verify subscription."
      });
    }

    const subCheck = await checkUserSubscriptionActive(userIdentifier);

    if (!subCheck.active) {
      return res.status(403).json({
        allow: false,
        popup: true,
        isExpired: true,
        message: subCheck.message || "Your 7-day free trial or subscription has ended. Please purchase a subscription to continue."
      });
    }

    req.subscription = subCheck.subscription;
    next();
  } catch (err) {
    console.error("checkSubscription error:", err);
    res.status(500).json({
      allow: false,
      message: "Subscription verification failed."
    });
  }
};

module.exports = checkSubscription;
