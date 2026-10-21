const razorpay = require("../utils/razorpay");
const crypto = require("crypto");
const Plan = require("../models/plan.model");
const Addon = require("../models/addon.model");
const SubscriptionPlan = require("../models/subscriptionPlan.model");
const UserSubscription = require("../models/user-subscription.model");

const mongoose = require("mongoose");

// Helper function to calculate dates
const calculateDates = (durationDays) => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return { startDate, endDate };
};

// Your existing function - unchanged
exports.createOrderService = async (amount, planDetails = {}) => {
  try {
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: planDetails
    };

    const order = await razorpay.orders.create(options);
    
    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      }
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: error.message || "Failed to create order"
    };
  }
};

const { defaultAddons } = require("../controllers/addon-controller");

const STATIC_ADDON_CATALOG = {
  gallery: { key: 'gallery', name: 'Photo Gallery', price: 200, yearlyPrice: 1800, billingType: 'monthly', unlockedFields: ['gallery'] },
  docsbuilder: { key: 'docsbuilder', name: 'Docs Builder', price: 150, yearlyPrice: 1350, billingType: 'monthly', unlockedFields: ['catalogPDF', 'downloads'] },
  profilebuilder: { key: 'profilebuilder', name: 'Profile / Portfolio Builder', price: 150, yearlyPrice: 1350, billingType: 'monthly', unlockedFields: ['brandLabel', 'foundedName'] },
  portfoliobuilder: { key: 'portfoliobuilder', name: 'Portfolio Builder', price: 200, yearlyPrice: 1800, billingType: 'monthly', unlockedFields: ['servicesProducts', 'productRangeDisplay'] },
  catalogbuilder: { key: 'catalogbuilder', name: 'Catalog Builder', price: 200, yearlyPrice: 1800, billingType: 'monthly', unlockedFields: ['catalog', 'catalogPDF'] },
  brochurebuilder: { key: 'brochurebuilder', name: 'Brochure Builder', price: 150, yearlyPrice: 1350, billingType: 'monthly', unlockedFields: ['catalogPDF'] },
  nfccard: { key: 'nfccard', name: 'NFC Smart Card', price: 499, yearlyPrice: 499, billingType: 'one-time', isOneTime: true, unlockedFields: ['nfcSettings'] },
  leadgen: { key: 'leadgen', name: 'Lead Generation', price: 250, yearlyPrice: 2250, billingType: 'monthly', unlockedFields: ['interactiveElements'] },
  leadmanagement: { key: 'leadmanagement', name: 'Lead Management', price: 200, yearlyPrice: 1800, billingType: 'monthly', unlockedFields: ['clientList'] },
  appointmentbooking: { key: 'appointmentbooking', name: 'Appointment Booking', price: 200, yearlyPrice: 1800, billingType: 'monthly', unlockedFields: ['businessHours'] },
  whatsappintegration: { key: 'whatsappintegration', name: 'WhatsApp Integration', price: 150, yearlyPrice: 1350, billingType: 'monthly', unlockedFields: ['enableWhatsApp'] },
  analytics: { key: 'analytics', name: 'Advanced Analytics', price: 150, yearlyPrice: 1350, billingType: 'monthly', unlockedFields: ['analytics'] },
  docsmanager: { key: 'docsmanager', name: 'Docs Manager', price: 150, yearlyPrice: 1350, billingType: 'monthly', unlockedFields: ['downloads'] }
};

const MASTER_PLANS_MAP = {
  personal: { name: 'Personal', displayName: 'DI - Individuals', monthlyPrice: 500, yearlyPrice: 3500, category: 'personal', categoryGroup: 'individual' },
  business: { name: 'Business', displayName: 'DI - Working Professional', monthlyPrice: 800, yearlyPrice: 6800, category: 'business', categoryGroup: 'individual' },
  businesspremium: { name: 'BusinessPremium', displayName: 'DI - Service Providers', monthlyPrice: 1200, yearlyPrice: 8200, category: 'business premium', categoryGroup: 'individual' },
  professionals: { name: 'Professionals', displayName: 'DI - Professionals', monthlyPrice: 1500, yearlyPrice: 12000, category: 'professionals', categoryGroup: 'individual' },
  professionalpro: { name: 'ProfessionalPro', displayName: 'DI - Professional Pro', monthlyPrice: 1800, yearlyPrice: 14400, category: 'professionalpro', categoryGroup: 'individual' },
  entrepreneurials: { name: 'Entrepreneurials', displayName: 'DI - Entrepreneurials', monthlyPrice: 1800, yearlyPrice: 15000, category: 'entrepreneurials', categoryGroup: 'business' },
  entrepreneurialsmulti: { name: 'EntrepreneurialsMulti', displayName: 'DI - Multi-Activities', monthlyPrice: 2200, yearlyPrice: 18000, category: 'entrepreneurialsmulti', categoryGroup: 'business' },
  corporatebusiness: { name: 'CorporateBusiness', displayName: 'DI - Business', monthlyPrice: 2500, yearlyPrice: 22000, category: 'corporatebusiness', categoryGroup: 'business' },
  team: { name: 'Team', displayName: 'DI - Team', monthlyPrice: 2800, yearlyPrice: 24000, category: 'team', categoryGroup: 'business' },
  miniwebsite: { name: 'MiniWebsite', displayName: 'DP - Mini Website', monthlyPrice: 3000, yearlyPrice: 27000, category: 'miniwebsite', categoryGroup: 'business' }
};

// NEW: Create order with subscription and optional addons
exports.createOrderWithSubscription = async (
  planId,
  userId,
  selectedAddons = [],
  billingCycle = "monthly",
  clientAmount = null,
  planName = null
) => {
  try {
    const isYearly = (billingCycle === "yearly");

    // Clean plan name if a prefixed ID like 'plan_Business_yearly_1' was passed
    let cleanPlanName = planName;
    if (!cleanPlanName && typeof planId === "string") {
      if (planId.startsWith("plan_")) {
        const parts = planId.replace(/^plan_/, "").split("_");
        cleanPlanName = parts[0];
      } else if (!mongoose.Types.ObjectId.isValid(planId)) {
        cleanPlanName = planId;
      }
    }

    // Get plan details (support ObjectId or name)
    let plan = null;
    if (mongoose.Types.ObjectId.isValid(planId)) {
      plan = await Plan.findById(planId);
    }
    if (!plan && cleanPlanName) {
      plan = await Plan.findOne({
        name: new RegExp(`^${cleanPlanName}$`, "i"),
        duration: isYearly ? "yearly" : "monthly"
      });
      if (!plan) {
        plan = await Plan.findOne({ name: new RegExp(`^${cleanPlanName}$`, "i") });
      }
    }

    // Fallback: If still not in DB, use master catalog and any existing DB plan ID for ref
    const masterMeta = MASTER_PLANS_MAP[(cleanPlanName || "business").toLowerCase()] || MASTER_PLANS_MAP.business;
    let effectivePlanId = plan?._id;
    if (!effectivePlanId) {
      const anyDbPlan = await Plan.findOne();
      effectivePlanId = anyDbPlan?._id || new mongoose.Types.ObjectId();
    }

    if (!plan) {
      plan = {
        _id: effectivePlanId,
        name: masterMeta.name,
        displayName: masterMeta.displayName,
        category: masterMeta.category,
        categoryGroup: masterMeta.categoryGroup,
        duration: isYearly ? "yearly" : "monthly",
        durationDays: isYearly ? 365 : 30,
        price: isYearly ? masterMeta.yearlyPrice : masterMeta.monthlyPrice,
        monthlyPrice: masterMeta.monthlyPrice,
        yearlyPrice: masterMeta.yearlyPrice,
        allowedFields: []
      };
    }

    // Calculate add-on prices and collect unlocked fields
    let addonTotal = 0;
    const normalizedAddonKeys = (selectedAddons || [])
      .map(a => String(a).toLowerCase().trim())
      .filter(Boolean);
    const unlockedFieldsSet = new Set(plan.allowedFields || []);

    // Try finding in DB, with fallback to static catalog
    let addonDocs = [];
    try {
      if (normalizedAddonKeys.length > 0) {
        addonDocs = await Addon.find({ key: { $in: normalizedAddonKeys }, isActive: true });
        // Background auto-seed if Addon collection has 0 items
        if (addonDocs.length === 0 && defaultAddons && defaultAddons.length > 0) {
          Addon.insertMany(defaultAddons).catch(() => {});
        }
      }
    } catch (e) {
      console.warn("Notice: Addon collection lookup, using static catalog:", e.message);
    }

    const addonDocMap = {};
    (addonDocs || []).forEach(d => {
      if (d.key) addonDocMap[d.key.toLowerCase()] = d;
    });

    for (const key of normalizedAddonKeys) {
      const dbDoc = addonDocMap[key];
      const staticMeta = STATIC_ADDON_CATALOG[key];

      let price = 0;
      let unlocked = [];

      if (dbDoc) {
        const isOneTime = dbDoc.billingType === "one-time";
        if (isYearly) {
          price = isOneTime ? dbDoc.price : ((staticMeta?.yearlyPrice) || (dbDoc.price * 9));
        } else {
          price = dbDoc.price;
        }
        unlocked = dbDoc.unlockedFields || [];
      } else if (staticMeta) {
        price = isYearly ? staticMeta.yearlyPrice : staticMeta.price;
        unlocked = staticMeta.unlockedFields || [];
      }

      addonTotal += price;
      unlocked.forEach(f => unlockedFieldsSet.add(f));
    }

    const basePlanPrice = isYearly
      ? (plan.yearlyPrice || (plan.duration === "yearly" ? plan.price : (plan.price * 9)))
      : (plan.monthlyPrice || (plan.duration === "monthly" ? plan.price : plan.price));

    const computedFinalPrice = basePlanPrice + addonTotal;

    // If client supplied recalculation amount (> 0), honor it; otherwise use computed price
    const finalPrice = (clientAmount && Number(clientAmount) > 0)
      ? Number(clientAmount)
      : computedFinalPrice;

    // Create Razorpay order for the FULL AMOUNT (base plan + add-ons) in paise
    const order = await razorpay.orders.create({
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId.toString().substring(0, 8)}`,
      notes: {
        planId: plan._id.toString(),
        planName: plan.name,
        userId: userId.toString(),
        category: plan.category || "individual",
        duration: isYearly ? "yearly" : "monthly",
        addons: normalizedAddonKeys.join(","),
        basePrice: String(basePlanPrice),
        addonTotal: String(addonTotal),
        finalPrice: String(finalPrice)
      }
    });

    // Create SubscriptionPlan record
    const subscriptionPlan = new SubscriptionPlan({
      userId: userId,
      planId: plan._id,
      selectedPrice: finalPrice,
      selectedDurationDays: plan.durationDays || (isYearly ? 365 : 30),
      status: "pending",
      razorpayOrderId: order.id,
      paymentStatus: "pending",
      purchasedAddons: normalizedAddonKeys,
      unlockedFields: Array.from(unlockedFieldsSet)
    });

    await subscriptionPlan.save();

    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      },
      plan: {
        id: plan._id,
        name: plan.name,
        category: plan.category,
        duration: isYearly ? "yearly" : "monthly",
        durationDays: plan.durationDays,
        basePrice: basePlanPrice,
        addonTotal: addonTotal,
        totalPrice: finalPrice
      },
      subscriptionPlanId: subscriptionPlan._id.toString(),
      message: "Order created successfully"
    };
  } catch (error) {
    console.error("Error creating order with subscription:", error);
    return {
      success: false,
      message: error.message || "Failed to create order"
    };
  }
};

// Your existing function - unchanged
exports.verifyPaymentService = (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
) => {
  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;
    
    return {
      success: isValid,
      isValid: isValid,
      message: isValid ? "Payment verified successfully" : "Invalid payment signature"
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      isValid: false,
      message: error.message || "Payment verification failed"
    };
  }
};

// NEW: Verify payment and activate subscription
exports.verifyAndActivateSubscription = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  userId,
  planId,
  planName = null,
  duration = null,
  amountPaid = null,
  selectedAddons = []
) => {
  try {
    // Verify payment signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;
    
    if (!isValid) {
      return {
        success: false,
        isValid: false,
        message: "Invalid payment signature"
      };
    }

    // Clean plan name if string like 'plan_Business_yearly_1' was passed
    let cleanPlanName = planName;
    if (!cleanPlanName && typeof planId === "string") {
      if (planId.startsWith("plan_")) {
        cleanPlanName = planId.replace(/^plan_/, "").split("_")[0];
      } else if (!mongoose.Types.ObjectId.isValid(planId)) {
        cleanPlanName = planId;
      }
    }

    // Get plan details safely (support ObjectId or plan name)
    let plan = null;
    if (mongoose.Types.ObjectId.isValid(planId)) {
      plan = await Plan.findById(planId);
    }
    if (!plan && cleanPlanName) {
      plan = await Plan.findOne({ name: new RegExp(`^${cleanPlanName}$`, "i") });
    }
    if (!plan) {
      plan = await Plan.findOne();
    }
    if (!plan) {
      return {
        success: false,
        message: "Plan not found"
      };
    }

    // Calculate dates
    const { startDate, endDate } = calculateDates(plan.durationDays || 30);

    // Update SubscriptionPlan
    const subscriptionPlan = await SubscriptionPlan.findOneAndUpdate(
      { 
        userId: userId,
        razorpayOrderId: razorpay_order_id,
        status: "pending"
      },
      {
        status: "completed",
        paymentStatus: "success",
        transactionId: razorpay_payment_id
      },
      { new: true }
    );

    if (!subscriptionPlan) {
      return {
        success: false,
        message: "No pending subscription found"
      };
    }

    // Expire old active subscriptions
    await UserSubscription.updateMany(
      { 
        userId: userId, 
        status: "active" 
      },
      { 
        status: "expired",
        endDate: new Date()
      }
    );

    // Create new UserSubscription
    const userSubscription = new UserSubscription({
      userId: userId,
      planId: plan._id,
      subscriptionPlanId: subscriptionPlan._id,
      planName: plan.name,
      planCategory: plan.categoryGroup || plan.category,
      duration: plan.duration,
      startDate: startDate,
      endDate: endDate,
      paymentId: razorpay_payment_id,
      amountPaid: (amountPaid ? Number(amountPaid) : (subscriptionPlan.selectedPrice || plan.price)),
      status: "active",
      paymentStatus: "success",
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      purchasedAddons: (subscriptionPlan.purchasedAddons && subscriptionPlan.purchasedAddons.length > 0)
        ? subscriptionPlan.purchasedAddons
        : (selectedAddons || []),
      unlockedFields: subscriptionPlan.unlockedFields || []
    });

    await userSubscription.save();

    return {
      success: true,
      isValid: true,
      message: "Payment verified and subscription activated successfully",
      subscription: userSubscription,
      planDetails: {
        category: plan.category,
        duration: plan.duration,
        price: plan.price,
        startDate: startDate,
        endDate: endDate,
        durationDays: plan.durationDays
      }
    };
  } catch (error) {
    console.error("Error verifying and activating subscription:", error);
    return {
      success: false,
      isValid: false,
      message: error.message || "Failed to verify payment"
    };
  }
};

// NEW: Cancel subscription
exports.cancelSubscription = async (userId) => {
  try {
    const subscription = await UserSubscription.findOne({
      userId: userId,
      status: "active"
    });

    if (!subscription) {
      return {
        success: false,
        message: "No active subscription found"
      };
    }

    subscription.status = "cancelled";
    subscription.endDate = new Date();
    await subscription.save();

    // Also update SubscriptionPlan
    await SubscriptionPlan.findByIdAndUpdate(
      subscription.subscriptionPlanId,
      {
        status: "cancelled"
      }
    );

    return {
      success: true,
      message: "Subscription cancelled successfully",
      subscription: subscription
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return {
      success: false,
      message: error.message || "Failed to cancel subscription"
    };
  }
};