const UserSubscription = require("../models/user-subscription.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const Plan = require("../models/plan.model");

// Your existing function - unchanged
exports.getUserSubscriptionStatus = async (userId) => {
  const subscription = await UserSubscription.findOne({ userId }).sort({
    createdAt: -1,
  });

  if (!subscription) {
    return {
      hasSubscription: false,
      message: "No subscription found",
    };
  }

  const now = new Date();
  const endDate = new Date(subscription.endDate);

  const diffMs = endDate - now;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isExpired = diffMs <= 0;

  return {
    hasSubscription: true,
    planId: subscription.planId,
    subscriptionPlanId: subscription.subscriptionPlanId,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    daysLeft: isExpired ? 0 : daysLeft,
    status: isExpired ? "expired" : "active",
    amountPaid: subscription.amountPaid,
    paymentId: subscription.paymentId || null,
  };
};

// NEW: Get subscription with plan details
exports.getSubscriptionWithDetails = async (userId) => {
  try {
    const subscription = await UserSubscription.findOne({ 
      userId, 
      status: "active" 
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return {
        success: false,
        hasSubscription: false,
        message: "No active subscription found"
      };
    }

    // Get plan details
    const plan = await Plan.findById(subscription.planId);
    
    // Get subscription plan details
    const subscriptionPlan = await SubscriptionPlan.findById(subscription.subscriptionPlanId);

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffMs = endDate - now;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = diffMs <= 0;

    return {
      success: true,
      hasSubscription: true,
      subscription: subscription,
      planDetails: plan,
      subscriptionPlanDetails: subscriptionPlan,
      status: isExpired ? "expired" : "active",
      daysLeft: isExpired ? 0 : daysLeft,
      isActive: !isExpired && subscription.status === "active",
      message: isExpired ? "Subscription has expired" : "Subscription is active"
    };
  } catch (error) {
    console.error("Error getting subscription details:", error);
    return {
      success: false,
      hasSubscription: false,
      message: error.message
    };
  }
};

// NEW: Get subscription history
exports.getUserSubscriptionHistory = async (userId) => {
  try {
    const subscriptions = await UserSubscription.find({ userId })
      .sort({ createdAt: -1 })
      .populate('planId')
      .populate('subscriptionPlanId');

    return {
      success: true,
      count: subscriptions.length,
      subscriptions: subscriptions,
      activeSubscriptions: subscriptions.filter(sub => sub.status === "active"),
      expiredSubscriptions: subscriptions.filter(sub => sub.status === "expired"),
      cancelledSubscriptions: subscriptions.filter(sub => sub.status === "cancelled")
    };
  } catch (error) {
    console.error("Error getting subscription history:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

// NEW: Check if user can subscribe
exports.canUserSubscribe = async (userId) => {
  try {
    const activeSubscription = await UserSubscription.findOne({
      userId: userId,
      status: "active",
      endDate: { $gte: new Date() }
    });

    return {
      success: true,
      canSubscribe: !activeSubscription,
      activeSubscription: activeSubscription
    };
  } catch (error) {
    console.error("Error checking subscription eligibility:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

exports.getUserPlanDetailsByUserId = async (userId) => {
  const subscription = await UserSubscription.findOne({
    userId,
    status: "active",
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "planId",
      select: "category duration durationDays price",
    })
    .lean();

  if (!subscription || !subscription.planId) {
    return {
      success: false,
      message: "No active subscription or plan found",
    };
  }

  return {
    success: true,
    plan: subscription.planId,
  };
};
