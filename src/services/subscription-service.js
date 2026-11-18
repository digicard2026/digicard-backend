const mongoose = require("mongoose");
const UserSubscription = require("../models/user-subscription.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const Plan = require("../models/plan.model");
const User = require("../models/user.model");
const Card = require("../models/card.model");

const MASTER_PLANS = {
  personal: { name: 'Personal', displayName: 'DI - Individuals', category: 'personal' },
  business: { name: 'Business', displayName: 'DI - Working Professionals', category: 'business' },
  businesspremium: { name: 'BusinessPremium', displayName: 'DI - Service Providers', category: 'business premium' },
  professionals: { name: 'Professionals', displayName: 'DI - Professionals', category: 'professionals' },
  professionalpro: { name: 'ProfessionalPro', displayName: 'DI - Professional Pro', category: 'professionalpro' },
  entrepreneurials: { name: 'Entrepreneurials', displayName: 'DI - Entrepreneurials', category: 'entrepreneurials' },
  entrepreneurialsmulti: { name: 'EntrepreneurialsMulti', displayName: 'DI - Entrepreneurials - Multi Activities', category: 'entrepreneurialsmulti' },
  corporatebusiness: { name: 'CorporateBusiness', displayName: 'DI - Business', category: 'corporatebusiness' },
  team: { name: 'Team', displayName: 'DI - Team', category: 'team' },
  miniwebsite: { name: 'MiniWebsite', displayName: 'DP - Mini Website', category: 'miniwebsite' }
};

const normalizePlanKey = (raw = "") => {
  if (!raw) return "personal";
  const cleaned = String(raw).replace(/[\s\-_]/g, '').toLowerCase();
  if (cleaned === "free") return "free";
  if (cleaned.includes("miniwebsite") || cleaned.includes("website")) return "miniwebsite";
  if (cleaned.includes("team")) return "team";
  if (cleaned.includes("corporate")) return "corporatebusiness";
  if (cleaned.includes("multiactivit") || cleaned.includes("multi")) return "entrepreneurialsmulti";
  if (cleaned.includes("entrepreneur")) return "entrepreneurials";
  if (cleaned.includes("professionalpro")) return "professionalpro";
  if (cleaned.includes("workingprofessional") || cleaned.includes("working")) return "business";
  if (cleaned.includes("professional")) return "professionals";
  if (cleaned.includes("serviceprovider") || cleaned.includes("businesspremium") || cleaned.includes("premium")) return "businesspremium";
  if (cleaned.includes("business")) return "business";
  if (cleaned.includes("personal") || cleaned.includes("individual")) return "personal";
  return "personal";
};

// Get active subscription status with full plan details
exports.getUserSubscriptionStatus = async (userId) => {
  let queryUserId = userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findOne({ email: String(userId).trim().toLowerCase() });
    if (user) queryUserId = user._id;
  }

  let subscription = await UserSubscription.findOne({ userId: queryUserId })
    .sort({ createdAt: -1 })
    .populate("planId");

  if (!subscription) {
    const userDoc = await User.findById(queryUserId);
    if (userDoc) {
      // Calculate 7-day trial from user's registration date
      const regDate = userDoc.createdAt ? new Date(userDoc.createdAt) : new Date();
      const trialEndDate = new Date(regDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const isPastTrial = new Date() > trialEndDate;

      subscription = await UserSubscription.create({
        userId: userDoc._id,
        planName: "Personal",
        planCategory: "personal",
        duration: "monthly",
        startDate: regDate,
        endDate: trialEndDate,
        paymentStatus: "free_trial",
        status: isPastTrial ? "expired" : "active",
        amountPaid: 0,
        purchasedAddons: [],
        unlockedFields: []
      });
    } else {
      return {
        hasSubscription: false,
        status: "expired",
        daysLeft: 0,
        message: "No subscription found",
      };
    }
  }

  const now = new Date();
  const endDate = new Date(subscription.endDate);

  const diffMs = endDate - now;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isExpired = diffMs <= 0;

  const rawKey =
    subscription.planName ||
    (subscription.planId && (subscription.planId.displayName || subscription.planId.name)) ||
    subscription.planCategory ||
    "Personal";

  const canonicalKey = normalizePlanKey(rawKey);
  const master = MASTER_PLANS[canonicalKey] || MASTER_PLANS.personal;
  const resolvedPlanName = master.name;

  const resolvedPrice =
    subscription.amountPaid ||
    (subscription.planId && subscription.planId.price) ||
    0;

  const isTrial = Boolean(
    subscription.paymentStatus !== "success" &&
    subscription.paymentStatus !== "paid" &&
    (subscription.paymentStatus === "free_trial" || (!subscription.amountPaid && !subscription.paymentId))
  );

  return {
    hasSubscription: true,
    planId: subscription.planId?._id || subscription.planId,
    planName: resolvedPlanName,
    planType: resolvedPlanName,
    planDisplayName: master.displayName,
    planCategory: subscription.planCategory || (subscription.planId && subscription.planId.category) || master.category,
    price: resolvedPrice,
    subscriptionPlanId: subscription.subscriptionPlanId,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    daysLeft: isExpired ? 0 : daysLeft,
    status: isExpired ? "expired" : "active",
    amountPaid: subscription.amountPaid,
    paymentId: subscription.paymentId || null,
    paymentStatus: subscription.paymentStatus || (isTrial ? "free_trial" : "success"),
    isTrial: isTrial,
    trialDaysLeft: isTrial ? (isExpired ? 0 : daysLeft) : 0,
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
  let queryUserId = userId;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findOne({ email: String(userId).trim().toLowerCase() });
    if (user) queryUserId = user._id;
  }

  const subscription = await UserSubscription.findOne({
    userId: queryUserId,
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

  const rawKey =
    subscription.planName ||
    (subscription.planId && (subscription.planId.displayName || subscription.planId.name)) ||
    subscription.planCategory ||
    "Personal";
  const canonicalKey = normalizePlanKey(rawKey);
  const master = MASTER_PLANS[canonicalKey] || MASTER_PLANS.personal;

  // If planId populated exists, return it; otherwise synthesize plan object from subscription details
  const planData = subscription.planId || {
    name: master.name,
    displayName: master.displayName,
    category: master.category,
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

    const canonicalKey = normalizePlanKey(planName);
    const master = MASTER_PLANS[canonicalKey] || MASTER_PLANS.business;

    // Lookup plan in database if exists
    let plan = await Plan.findOne({
      $or: [
        { name: new RegExp(`^${master.name}$`, "i") },
        { displayName: new RegExp(`^${master.displayName}$`, "i") }
      ]
    });

    const durationCycle = billingCycle === "yearly" ? "yearly" : "monthly";
    const durationDays = durationCycle === "yearly" ? 365 : (plan?.durationDays || 30);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const sanitizedAddons = Array.isArray(selectedAddons)
      ? selectedAddons.map(a => String(a).toLowerCase().trim())
      : [];

    const existingSub = await UserSubscription.findOne({ userId: queryUserId, status: "active" }).sort({ createdAt: -1 });

    let activeSubscription = null;

    if (existingSub) {
      existingSub.planId = plan ? plan._id : existingSub.planId;
      existingSub.planName = master.name;
      existingSub.planCategory = master.category;
      existingSub.duration = durationCycle;
      existingSub.startDate = startDate;
      existingSub.endDate = endDate;
      existingSub.status = "active";
      existingSub.paymentStatus = "success";
      existingSub.amountPaid = price ? Number(price) : (plan ? plan.price : (existingSub.amountPaid || 500));
      if (Array.isArray(selectedAddons)) existingSub.purchasedAddons = sanitizedAddons;
      await existingSub.save();
      activeSubscription = existingSub;
    } else {
      const newSub = await UserSubscription.create({
        userId: queryUserId,
        planId: plan ? plan._id : null,
        planName: master.name,
        planCategory: master.category,
        duration: durationCycle,
        startDate,
        endDate,
        paymentStatus: "success",
        status: "active",
        amountPaid: price ? Number(price) : (plan ? plan.price : 500),
        purchasedAddons: sanitizedAddons,
      });
      activeSubscription = newSub;
    }

    // Update existing user cards in DB to remove trial status and align with upgraded plan
    try {
      const userObj = await User.findById(queryUserId);
      const userEmailStr = (userObj?.email || email || "").trim().toLowerCase();

      const queryFilters = [{ userId: queryUserId }, { createdBy: queryUserId }];
      if (userEmailStr) {
        queryFilters.push({ email: userEmailStr });
        queryFilters.push({ userEmail: userEmailStr });
      }

      await Card.updateMany(
        { $or: queryFilters },
        { 
          $set: { 
            isTrialCard: false,
            cardType: master.name
          } 
        }
      );
    } catch (cardUpdateErr) {
      console.warn("Notice: could not update cards on plan switch:", cardUpdateErr);
    }

    return {
      success: true,
      message: "Subscription plan updated successfully",
      subscription: activeSubscription,
      plan: plan || activeSubscription
    };
  } catch (error) {
    console.error("Error in updateUserSubscriptionPlan:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Check if user's subscription or 7-day free trial is currently active
exports.checkUserSubscriptionActive = async (userIdOrEmail) => {
  try {
    if (!userIdOrEmail) {
      return { active: false, reason: "no_user", message: "User identifier not provided" };
    }

    let queryUserId = userIdOrEmail;
    if (!mongoose.Types.ObjectId.isValid(userIdOrEmail)) {
      const user = await User.findOne({ email: String(userIdOrEmail).trim().toLowerCase() });
      if (user) {
        queryUserId = user._id;
      } else {
        return { active: false, reason: "user_not_found", message: "User not found" };
      }
    }

    const statusObj = await exports.getUserSubscriptionStatus(queryUserId);
    if (!statusObj.hasSubscription) {
      return { active: false, reason: "no_subscription", message: "No subscription record found" };
    }

    if (statusObj.status === "expired" || statusObj.daysLeft <= 0) {
      return {
        active: false,
        reason: "expired",
        message: "Your 7-day free trial or subscription has expired. Please purchase a plan to continue.",
        subscription: statusObj
      };
    }

    return {
      active: true,
      subscription: statusObj
    };
  } catch (err) {
    console.error("Error checking active subscription:", err);
    return { active: false, reason: "error", message: err.message };
  }
};
