const { 
  getUserSubscriptionStatus,
  getSubscriptionWithDetails,
  getUserSubscriptionHistory,
  canUserSubscribe,
   getUserPlanDetailsByUserId
} = require("../services/subscription-service");

// Your existing function - unchanged
exports.getSubscriptionStatus = async (req, res) => {
  try {
    console.log("🔍 req.user =>", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated (req.user missing)",
      });
    }

    const userId = req.user.id;

    const subscriptionData = await getUserSubscriptionStatus(userId);

    return res.status(200).json({
      success: true,
      data: subscriptionData,
    });
  } catch (error) {
    console.error("Subscription Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// NEW: Get subscription details
exports.getSubscriptionDetails = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    const result = await getSubscriptionWithDetails(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Subscription Details Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// NEW: Get subscription history
exports.getSubscriptionHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    const result = await getUserSubscriptionHistory(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Subscription History Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// NEW: Check subscription eligibility
exports.checkSubscriptionEligibility = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const userId = req.user.id;
    const result = await canUserSubscribe(userId);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Subscription Eligibility Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};






exports.getUserPlanDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await getUserPlanDetailsByUserId(userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Get user plan details error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



