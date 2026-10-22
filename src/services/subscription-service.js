const mongoose = require("mongoose");
const UserSubscription = require("../models/user-subscription.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const Plan = require("../models/plan.model");
const User = require("../models/user.model");

// Get active subscription status with full plan details
exports.getUserSubscriptionStatus = async (userId) => {
  const subscription = await UserSubscription.findOne({ userId })
    .sort({ createdAt: -1 })
    .populate("planId");

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

  const resolvedPlanName =
    subscription.planName ||
    (subscription.planId && (subscription.planId.displayName || subscription.planId.name)) ||
    subscription.planCategory ||
    "Personal";

  const resolvedPrice =
    subscription.amountPaid ||
    (subscription.planId && subscription.planId.price) ||
    0;

  return {
    hasSubscription: true,
    planId: subscription.planId?._id || subscription.planId,
    planName: resolvedPlanName,
    planType: resolvedPlanName,
    planCategory: subscription.planCategory || (subscription.planId && subscription.planId.category) || "personal",
    price: resolvedPrice,
    subscriptionPlanId: subscription.subscriptionPlanId,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    daysLeft: isExpired ? 0 : daysLeft,
    status: isExpired ? "expired" : "active",
    amountPaid: subscription.amountPaid,
    paymentId: subscription.paymentId || null,
    purchasedAddons: subscription.purchasedAddons || [],
    unlockedFields: subscription.unlockedFields || [],
    plan: subscription.planId || null,
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
      select: "name displayName category duration durationDays price features",
    })
    .lean();

  if (!subscription) {
    return {
      success: false,
      message: "No active subscription found",
    };
  }

  // If planId populated exists, return it; otherwise synthesize plan object from subscription details
  const planData = subscription.planId || {
    name: subscription.planName || "Personal",
    displayName: subscription.planName || "Personal",
    category: subscription.planCategory || "personal",
    price: subscription.amountPaid || 500,
    duration: subscription.duration || "monthly",
    features: [
      "Dynamic QR Code",
      "Social Links Hub",
      "Location & Maps",
      "Instant Contact Share"
    ]
  };

  return {
    success: true,
    plan: planData,
    subscription: {
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      amountPaid: subscription.amountPaid,
      purchasedAddons: subscription.purchasedAddons || [],
      unlockedFields: subscription.unlockedFields || [],
    }
  };
};

// Directly update or activate a user subscription plan (used when managing plan from dashboard/pricing)
exports.updateUserSubscriptionPlan = async ({ userId, email, planName, planCategory, billingCycle, price, selectedAddons }) => {
  try {
    let queryUserId = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      queryUserId = userId;
    } else if (email) {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (user) queryUserId = user._id;
    }

    if (!queryUserId) {
      return { success: false, message: "User not found for plan update" };
    }

    // Lookup plan in database if exists
    let plan = null;
    if (planName) {
      plan = await Plan.findOne({ name: new RegExp(`^${planName}$`, "i") });
    }

    const durationCycle = billingCycle === "yearly" ? "yearly" : "monthly";
    const durationDays = durationCycle === "yearly" ? 365 : (plan?.durationDays || 30);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const sanitizedAddons = Array.isArray(selectedAddons)
      ? selectedAddons.map(a => String(a).toLowerCase().trim())
      : [];

    const existingSub = await UserSubscription.findOne({ userId: queryUserId, status: "active" }).sort({ createdAt: -1 });

    if (existingSub) {
      existingSub.planId = plan ? plan._id : existingSub.planId;
      existingSub.planName = plan ? plan.name : (planName || existingSub.planName);
      existingSub.planCategory = planCategory || (plan ? plan.category : existingSub.planCategory);
      existingSub.duration = durationCycle;
      existingSub.startDate = startDate;
      existingSub.endDate = endDate;
      existingSub.status = "active";
      if (price) existingSub.amountPaid = Number(price);
      if (sanitizedAddons.length > 0) existingSub.purchasedAddons = sanitizedAddons;
      await existingSub.save();

      return {
        success: true,
        message: "Subscription plan updated successfully",
        subscription: existingSub,
        plan: plan || existingSub
      };
    } else {
      const newSub = await UserSubscription.create({
        userId: queryUserId,
        planId: plan ? plan._id : null,
        planName: plan ? plan.name : (planName || "Personal"),
        planCategory: planCategory || (plan ? plan.category : "personal"),
        duration: durationCycle,
        startDate,
        endDate,
        paymentStatus: price ? "success" : "free_trial",
        status: "active",
        amountPaid: price ? Number(price) : (plan ? plan.price : 0),
        purchasedAddons: sanitizedAddons,
      });

      return {
        success: true,
        message: "Subscription plan created successfully",
        subscription: newSub,
        plan: plan || newSub
      };
    }
  } catch (error) {
    console.error("Error in updateUserSubscriptionPlan:", error);
    return {
      success: false,
      message: error.message
    };
  }
};
