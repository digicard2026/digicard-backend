const User = require("../models/user.model");

module.exports = async (req, res, next) => {
  try {
    const ownerId = req.cardOwnerId;
    if (!ownerId) {
      return res.status(400).json({ message: "Could not identify card owner" });
    }

    const user = await User.findById(ownerId);
    if (!user) return res.status(404).json({ message: "Card owner not found" });

    const now = new Date();

    // Block if trial ended
    if (user.trial?.endDate && now > new Date(user.trial.endDate)) {
      return res.status(403).json({
        success: false,
        message: "This card is unavailable because the owner's trial has expired."
      });
    }

    // Block if subscription expired
    if (
      user.subscription?.active &&
      user.subscription.endDate &&
      now > new Date(user.subscription.endDate)
    ) {
      return res.status(403).json({
        success: false,
        message: "This card is unavailable because the owner's subscription has expired."
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Failed to check public access",
      error: error.message,
    });
  }
};
